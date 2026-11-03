import {getStage} from '../curriculum.ts';
import {allStages as stages,allSourceQuestions as sourceQuestions,allChapters as chapters,subjects,subjectForStage} from '../subjects.ts';
import {isNotebookStage,sameLabText,validLabText,type LabNotebook,type NotebookDraft} from '../notebook.ts';
import {deriveReview} from '../review.ts';
import {defaultPreferences,difficultyOptions,goalOptions} from '../learning.ts';
import { generateQuestion, publicQuestion } from '../questions.ts';
import type { Attempt, ChapterId, LearningState, LearningPreferences, Progress, QuestionSnapshot, ReviewedAttempt } from '../question-types.ts';
export type Statement={bind(...args:unknown[]):Statement;first():Promise<any>;all():Promise<{results:any[]}>;run():Promise<{meta?:{changes?:number}}>};
export type SqlDatabase={prepare(sql:string):Statement};
export class StoreError extends Error{status:number;constructor(message:string,status=400){super(message);this.status=status;}}
type Row={id:string;user_id:string;stage_id:string|null;chapter:ChapterId|null;status:'active'|'submitted';revision:number;questions:string;answers:string;current_index:number;last_event_id:string|null;created_at:string;submitted_at:string|null;deadline:string|null;score:number|null;correct_count:number|null};
export type AttemptOptions={subject?:string;stageId?:string|null;chapter?:ChapterId|null;count:number;minutes?:number|null};
export type AnswerUpdate={revision:number;answers:Record<string,string>;currentIndex:number;eventId:string};
function identity(user:string){if(!user||user.length>200)throw new StoreError('unauthorized',401);}
function invalid(condition:unknown){if(!condition)throw new StoreError('invalid_request');}
function parsed<T>(s:string):T{return JSON.parse(s);}
function toAttempt(row:Row):Attempt|ReviewedAttempt{
 const questions=parsed<QuestionSnapshot[]>(row.questions);
 return {id:row.id,stageId:row.stage_id,chapter:row.chapter,status:row.status,revision:row.revision,createdAt:row.created_at,submittedAt:row.submitted_at,deadline:row.deadline,currentIndex:row.current_index,answers:parsed(row.answers),questions:row.status==='submitted'?questions:questions.map(publicQuestion),...(row.status==='submitted'?{score:row.score??0,correctCount:row.correct_count??0}:{})};
}
export function createStore(db:SqlDatabase,clock:()=>Date=()=>new Date()){
 const now=()=>clock().toISOString();
 const first=(sql:string,...args:unknown[])=>db.prepare(sql).bind(...args).first();
 const all=async(sql:string,...args:unknown[])=>(await db.prepare(sql).bind(...args).all()).results;
 const run=(sql:string,...args:unknown[])=>db.prepare(sql).bind(...args).run();
 async function rowFor(user:string,id:string):Promise<Row>{identity(user);const r=await first('SELECT * FROM exam_attempts WHERE id=? AND user_id=?',id,user);if(!r)throw new StoreError('not_found',404);return r;}
 async function submitRow(row:Row,expected:number,expired=false):Promise<ReviewedAttempt>{
  if(row.status==='submitted')return toAttempt(row) as ReviewedAttempt;
  if(!expired&&row.revision!==expected)throw new StoreError('conflict',409);
  const answers=parsed<Record<string,string>>(row.answers),questions=parsed<QuestionSnapshot[]>(row.questions);
  const correctCount=questions.filter(q=>answers[q.id]===q.answer).length,score=Math.round(100*correctCount/questions.length);
  const r=await run("UPDATE exam_attempts SET status='submitted',revision=revision+1,submitted_at=?,score=?,correct_count=? WHERE id=? AND user_id=? AND revision=? AND status='active'",now(),score,correctCount,row.id,row.user_id,row.revision);
  if(!r.meta?.changes){const latest=await rowFor(row.user_id,row.id);if(latest.status==='submitted')return toAttempt(latest) as ReviewedAttempt;throw new StoreError('conflict',409);}
  return toAttempt(await rowFor(row.user_id,row.id)) as ReviewedAttempt;
 }
 async function getAttempt(user:string,id:string):Promise<Attempt|ReviewedAttempt>{const row=await rowFor(user,id);if(row.status==='active'&&row.deadline&&row.deadline<=now())return submitRow(row,row.revision,true);return toAttempt(row);}
 async function readPreferences(user:string):Promise<LearningPreferences>{
  identity(user);const row=await first('SELECT * FROM learner_preferences WHERE user_id=?',user);
  return row?{difficulty:row.difficulty,goal:row.goal,onboardingCompleted:!!row.onboarding_completed,revision:row.revision,updatedAt:row.updated_at}:{...defaultPreferences};
 }
 async function savePreferences(user:string,input:LearningPreferences):Promise<LearningPreferences>{
  identity(user);invalid(difficultyOptions.some(o=>o.id===input.difficulty)&&goalOptions.some(o=>o.id===input.goal)&&input.onboardingCompleted===true&&Number.isInteger(input.revision)&&input.revision>=0);
  const revision=input.revision+1,updatedAt=now();
  const result=input.revision===0
   ?await run('INSERT INTO learner_preferences (user_id,difficulty,goal,onboarding_completed,revision,updated_at) VALUES (?,?,?,1,?,?) ON CONFLICT(user_id) DO NOTHING',user,input.difficulty,input.goal,revision,updatedAt)
   :await run('UPDATE learner_preferences SET difficulty=?,goal=?,onboarding_completed=1,revision=?,updated_at=? WHERE user_id=? AND revision=?',input.difficulty,input.goal,revision,updatedAt,user,input.revision);
  if(!result.meta?.changes)throw new StoreError('conflict',409);
  return {difficulty:input.difficulty,goal:input.goal,onboardingCompleted:true,revision,updatedAt};
 }
 async function readNotebook(user:string,stageId:string):Promise<LabNotebook>{
  identity(user);invalid(typeof stageId==='string'&&isNotebookStage(stageId));
  const row=await first('SELECT * FROM lab_notebooks WHERE user_id=? AND stage_id=?',user,stageId);
  return row?{stageId,prediction:row.prediction,reason:row.reason,revision:row.revision,updatedAt:row.updated_at}:{stageId,prediction:'',reason:'',revision:0,updatedAt:null};
 }
 async function saveNotebook(user:string,input:NotebookDraft&{stageId:string}):Promise<LabNotebook>{
  identity(user);invalid(validLabText(input)&&typeof input.stageId==='string'&&isNotebookStage(input.stageId)&&Number.isSafeInteger(input.revision)&&input.revision>=0&&input.revision<Number.MAX_SAFE_INTEGER);
  invalid(input.stageId!=='s01'||['','ยาวขึ้น','สั้นลง','เท่าเดิม'].includes(input.prediction));
  const revision=input.revision+1,updatedAt=now();
  const result=input.revision===0
   ?await run('INSERT INTO lab_notebooks (user_id,stage_id,prediction,reason,revision,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(user_id,stage_id) DO NOTHING',user,input.stageId,input.prediction,input.reason,revision,updatedAt)
   :await run('UPDATE lab_notebooks SET prediction=?,reason=?,revision=?,updated_at=? WHERE user_id=? AND stage_id=? AND revision=?',input.prediction,input.reason,revision,updatedAt,user,input.stageId,input.revision);
  if(!result.meta?.changes){
   const latest=await readNotebook(user,input.stageId);
   // A lost success response can be retried safely without a second write.
   if(latest.revision>0&&sameLabText(latest,input))return latest;
   throw new StoreError('conflict',409);
  }
  return {stageId:input.stageId,prediction:input.prediction,reason:input.reason,revision,updatedAt};
 }
 async function readReview(user:string){
  identity(user);
  // Rank whole attempts, not individual questions: repeated concepts in one test
  // retain all missed/blank evidence. Active attempts never enter this query.
  const evidence=await all(`SELECT * FROM (
   SELECT a.id AS attempt_id,a.submitted_at,a.answers,
    json_extract(q.value,'$.sourceId') AS source_id,
    json_extract(q.value,'$.id') AS question_id,
    json_extract(q.value,'$.answer') AS expected,
    DENSE_RANK() OVER (PARTITION BY json_extract(q.value,'$.sourceId') ORDER BY a.submitted_at DESC,a.created_at DESC,a.id DESC) AS source_rank
   FROM exam_attempts a,json_each(a.questions) q
   WHERE a.user_id=? AND a.status='submitted'
  ) WHERE source_rank=1`,user);
  return deriveReview(evidence);
 }
 async function readState(user:string):Promise<LearningState&{bestScores:Record<string,number>;stats:{games:number;submittedAttempts:number}}>{
  identity(user);
  const expired=await all("SELECT * FROM exam_attempts WHERE user_id=? AND status='active' AND deadline IS NOT NULL AND deadline<=?",user,now());
  for(const row of expired)await submitRow(row,row.revision,true);
  const lessonRows=await all('SELECT * FROM lesson_progress WHERE user_id=?',user);
  const attemptRows=await all('SELECT id,stage_id,chapter,status,revision,created_at,submitted_at,deadline,current_index,score,correct_count,json_array_length(questions) AS question_count,(SELECT COUNT(*) FROM json_each(answers)) AS answered_count FROM exam_attempts WHERE user_id=? ORDER BY created_at DESC',user);
  const gameRows=await all('SELECT * FROM game_runs WHERE user_id=? ORDER BY created_at DESC LIMIT 100',user);
  const best=await all("SELECT stage_id,MAX(score) AS best FROM exam_attempts WHERE user_id=? AND status='submitted' AND stage_id IS NOT NULL GROUP BY stage_id",user);
  const totals=await first("SELECT (SELECT COUNT(*) FROM game_runs WHERE user_id=?) AS games,(SELECT COUNT(*) FROM exam_attempts WHERE user_id=? AND status='submitted') AS submitted_attempts",user,user);
  return {preferences:await readPreferences(user),review:await readReview(user),stats:{games:totals.games,submittedAttempts:totals.submitted_attempts},displayName:'',lessons:lessonRows.map(r=>({stageId:r.stage_id,step:r.step,completed:parsed(r.completed),revision:r.revision,updatedAt:r.updated_at})),attempts:attemptRows.map(r=>({id:r.id,stageId:r.stage_id,chapter:r.chapter,status:r.status,revision:r.revision,createdAt:r.created_at,submittedAt:r.submitted_at,deadline:r.deadline,currentIndex:r.current_index,questionCount:r.question_count,answeredCount:r.answered_count,...(r.status==='submitted'?{score:r.score,correctCount:r.correct_count}:{})})),games:gameRows.map(r=>({id:r.id,stageId:r.stage_id,correct:r.correct,total:r.total,createdAt:r.created_at})),bestScores:Object.fromEntries(best.map(r=>[r.stage_id,r.best]))};
 }
 async function saveLesson(user:string,input:{stageId:string;step:number;completed:number[];revision:number}):Promise<Progress>{
  identity(user);const stage=getStage(input.stageId);invalid(stage&&Number.isInteger(input.step)&&input.step>=0&&input.step<stage.steps.length&&Array.isArray(input.completed)&&input.completed.every(n=>Number.isInteger(n)&&n>=0&&n<stage.steps.length)&&Number.isInteger(input.revision)&&input.revision>=0);
  for(let retry=0;retry<4;retry++){
   const old=await first('SELECT * FROM lesson_progress WHERE user_id=? AND stage_id=?',user,input.stageId);
   const completed=[...new Set<number>([...(old?parsed<number[]>(old.completed):[]),...input.completed])].sort((a,b)=>a-b);
   const step=old&&input.revision<old.revision?old.step:input.step;const revision=(old?.revision??0)+1;const updatedAt=now();
   const result=old?await run('UPDATE lesson_progress SET step=?,completed=?,revision=?,updated_at=? WHERE user_id=? AND stage_id=? AND revision=?',step,JSON.stringify(completed),revision,updatedAt,user,input.stageId,old.revision):await run('INSERT INTO lesson_progress (user_id,stage_id,step,completed,revision,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(user_id,stage_id) DO NOTHING',user,input.stageId,step,JSON.stringify(completed),revision,updatedAt);
   if(result.meta?.changes)return {stageId:input.stageId,step,completed,revision,updatedAt};
  }
  throw new StoreError('conflict',409);
 }
 async function saveGame(user:string,input:{id:string;stageId:string;correct:number;total:number}){
  identity(user);const stage=getStage(input.stageId);invalid(stage&&typeof input.id==='string'&&input.id.length>=6&&input.id.length<=100&&Number.isInteger(input.total)&&input.total>=4&&input.total<=stage.pairs.length&&Number.isInteger(input.correct)&&input.correct>=0&&input.correct<=input.total);
  await run('INSERT INTO game_runs (id,user_id,stage_id,correct,total,created_at) VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING',input.id,user,input.stageId,input.correct,input.total,now());return {saved:true};
 }
 async function createAttempt(user:string,options:AttemptOptions):Promise<Attempt>{
  identity(user);invalid(Number.isInteger(options.count)&&options.count>=1&&options.count<=70&&(!options.stageId||stages.some(s=>s.id===options.stageId))&&(!options.chapter||chapters.some(c=>c.id===options.chapter))&&(!options.minutes||(Number.isInteger(options.minutes)&&options.minutes>=1&&options.minutes<=180)));
  invalid(!options.subject||subjects.some(s=>s.id===options.subject));
  const subject=options.subject??(options.stageId?subjectForStage(options.stageId)?.id:options.chapter==='ai-intro'?'ai':'physics');
  const pool=sourceQuestions.filter(q=>subjectForStage(q.stageId)?.id===subject&&(!options.stageId||q.stageId===options.stageId)&&(!options.chapter||q.chapter===options.chapter));invalid(pool.length>0);
  const shuffled=[...pool];for(let i=shuffled.length-1;i>0;i--){const j=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
  const used=new Set<string>();const questions:QuestionSnapshot[]=[];
  for(let i=0;i<options.count;i++){
   let q:QuestionSnapshot;let tries=0;
   do{q=generateQuestion(shuffled[i%shuffled.length].id,crypto.getRandomValues(new Uint32Array(1))[0]);tries++;}while(used.has(q.id)&&tries<8);
   if(used.has(q.id))throw new StoreError('generation_failed',503);used.add(q.id);questions.push(q);
  }
  const id=crypto.randomUUID(),created=clock(),deadline=options.minutes?new Date(created.getTime()+options.minutes*60000).toISOString():null;
  await run("INSERT INTO exam_attempts (id,user_id,stage_id,chapter,status,revision,questions,answers,current_index,created_at,deadline) VALUES (?,?,?,?,'active',0,?,'{}',0,?,?)",id,user,options.stageId??null,options.chapter??(subject==='ai'?'ai-intro':null),JSON.stringify(questions),created.toISOString(),deadline);
  return toAttempt(await rowFor(user,id)) as Attempt;
 }
 async function updateAttempt(user:string,id:string,input:AnswerUpdate):Promise<Attempt|ReviewedAttempt>{
  const row=await rowFor(user,id);if(row.status==='submitted')throw new StoreError('already_submitted',409);
  if(row.deadline&&row.deadline<=now())return submitRow(row,row.revision,true);
  invalid(Number.isInteger(input.revision)&&input.revision>=0&&typeof input.eventId==='string'&&input.eventId.length>=3&&input.eventId.length<=100&&input.answers&&typeof input.answers==='object'&&!Array.isArray(input.answers));
  if(row.last_event_id===input.eventId)return toAttempt(row);
  if(row.revision!==input.revision)throw new StoreError('conflict',409);
  const questions=parsed<QuestionSnapshot[]>(row.questions);invalid(Number.isInteger(input.currentIndex)&&input.currentIndex>=0&&input.currentIndex<questions.length);
  for(const [questionId,answer]of Object.entries(input.answers)){const q=questions.find(q=>q.id===questionId);invalid(q&&typeof answer==='string'&&q.choices.includes(answer));}
  const r=await run("UPDATE exam_attempts SET answers=?,current_index=?,revision=revision+1,last_event_id=? WHERE id=? AND user_id=? AND revision=? AND status='active'",JSON.stringify(input.answers),input.currentIndex,input.eventId,id,user,input.revision);
  if(!r.meta?.changes)throw new StoreError('conflict',409);return toAttempt(await rowFor(user,id));
 }
 async function submitAttempt(user:string,id:string,revision:number){invalid(Number.isInteger(revision)&&revision>=0);const row=await rowFor(user,id);return submitRow(row,revision,!!row.deadline&&row.deadline<=now());}
 return {readNotebook,saveNotebook,readState,readReview,readPreferences,savePreferences,saveLesson,saveGame,createAttempt,getAttempt,updateAttempt,submitAttempt};
}
