import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { createStore, type SqlDatabase } from '../lib/server/store.ts';

function setup(){
 const sqlite=new DatabaseSync(':memory:');
 for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')))sqlite.exec(readFileSync(`drizzle/${file}`,'utf8'));
 const db:SqlDatabase={prepare(sql){let args:unknown[]=[];return {bind(...values){args=values;return this;},async first(){return sqlite.prepare(sql).get(...args as any[])??null;},async all(){return {results:sqlite.prepare(sql).all(...args as any[]) as any[]};},async run(){const r=sqlite.prepare(sql).run(...args as any[]);return {meta:{changes:Number(r.changes)}};}};}};
 let now=new Date('2026-11-02T00:00:00Z');
 return {sqlite,store:createStore(db,()=>now),tick:(ms:number)=>{now=new Date(now.getTime()+ms);},close:()=>sqlite.close()};
}
test('new account has zero progress and lessons merge completed steps without reverting on stale writes',async()=>{
 const {store}=setup();assert.equal((await store.readState('alice')).attempts.length,0);
 await store.saveLesson('alice',{stageId:'s01',step:1,completed:[0],revision:0});
 await store.saveLesson('alice',{stageId:'s01',step:2,completed:[1],revision:1});
 const stale=await store.saveLesson('alice',{stageId:'s01',step:0,completed:[0],revision:0});
 assert.deepEqual(stale.completed,[0,1]);assert.equal(stale.step,2);
 assert.equal((await store.readState('bob')).lessons.length,0);
});
test('server creates stable snapshots and does not expose active solutions',async()=>{
 const {store}=setup();const a=await store.createAttempt('alice',{stageId:'s01',count:5});
 assert.equal(a.questions.length,5);assert.ok(!JSON.stringify(a).includes('explanation'));
 assert.deepEqual(await store.getAttempt('alice',a.id),a);
 await assert.rejects(()=>store.getAttempt('bob',a.id),/not_found/);
});
test('stale answer revisions conflict; duplicate event retries do not increase revision',async()=>{
 const {store}=setup();const a=await store.createAttempt('alice',{stageId:'s01',count:5});
 const answers={[a.questions[0].id]:a.questions[0].choices[0]};
 const b=await store.updateAttempt('alice',a.id,{revision:0,answers,currentIndex:1,eventId:'event-one'});
 assert.equal(b.revision,1);
 assert.equal((await store.updateAttempt('alice',a.id,{revision:0,answers,currentIndex:1,eventId:'event-one'})).revision,1);
 await assert.rejects(()=>store.updateAttempt('alice',a.id,{revision:0,answers:{},currentIndex:0,eventId:'event-two'}),/conflict/);
 assert.deepEqual((await store.getAttempt('alice',a.id)).answers,answers);
});
test('invalid choices, source IDs, count, stage and progress bounds are rejected',async()=>{
 const {store}=setup();await assert.rejects(()=>store.createAttempt('alice',{stageId:'invalid',count:5}),/invalid/);
 await assert.rejects(()=>store.createAttempt('alice',{count:999}),/invalid/);
 await assert.rejects(()=>store.saveLesson('alice',{stageId:'s01',step:99,completed:[],revision:0}),/invalid/);
 const a=await store.createAttempt('alice',{stageId:'s02',count:5});
 await assert.rejects(()=>store.updateAttempt('alice',a.id,{revision:0,answers:{[a.questions[0].id]:'forged'},currentIndex:0,eventId:'bad-choice'}),/invalid/);
});
test('submissions grade persisted answers, are immutable and retry idempotently',async()=>{
 const {store}=setup();const a=await store.createAttempt('alice',{stageId:'s01',count:5});
 const saved=await store.updateAttempt('alice',a.id,{revision:0,answers:{},currentIndex:0,eventId:'empty'});
 const done=await store.submitAttempt('alice',a.id,saved.revision);
 assert.equal(done.score,0);assert.equal(done.status,'submitted');assert.ok('explanation' in done.questions[0]);
 assert.deepEqual(await store.submitAttempt('alice',a.id,0),done);
 await assert.rejects(()=>store.updateAttempt('alice',a.id,{revision:done.revision,answers:{},currentIndex:0,eventId:'late'}),/submitted/);
});
test('expired deadline grades saved answers only and cannot restart after reload',async()=>{
 const {store,tick}=setup();const a=await store.createAttempt('alice',{stageId:'s01',count:5,minutes:1});
 tick(61000);const done=await store.getAttempt('alice',a.id);
 assert.equal(done.status,'submitted');assert.equal(done.score,0);assert.equal(done.deadline,a.deadline);
});
test('empty identity rejected; game events are bounded and deduplicated',async()=>{
 const {store}=setup();await assert.rejects(()=>store.readState(''),/unauthorized/);
 await store.saveGame('alice',{id:'game-123',stageId:'s01',correct:4,total:5});
 await store.saveGame('alice',{id:'game-123',stageId:'s01',correct:4,total:5});
 assert.equal((await store.readState('alice')).games.length,1);
 await assert.rejects(()=>store.saveGame('alice',{id:'game-bad',stageId:'s01',correct:9,total:4}),/invalid/);
});
test('lifetime totals remain accurate when the visible history is capped',async()=>{
 const {store}=setup();for(let i=0;i<101;i++)await store.saveGame('alice',{id:`round-${i.toString().padStart(5,'0')}`,stageId:'s01',correct:4,total:5});
 const state=await store.readState('alice');assert.equal(state.games.length,100);assert.equal(state.stats.games,101);assert.equal(state.stats.submittedAttempts,0);
});

test('four of five correct passes at 80 percent and a later failure preserves the best score',async()=>{
 const {store,sqlite}=setup();const a=await store.createAttempt('alice',{stageId:'s01',count:5});
 const row=sqlite.prepare('SELECT questions FROM exam_attempts WHERE id=?').get(a.id) as {questions:string};
 const snapshots=JSON.parse(row.questions);const answers=Object.fromEntries(snapshots.map((q:any,i:number)=>[q.id,i<4?q.answer:q.choices.find((v:string)=>v!==q.answer)]));
 const saved=await store.updateAttempt('alice',a.id,{revision:0,answers,currentIndex:4,eventId:'mastery-correct'});
 const submitted=await store.submitAttempt('alice',a.id,saved.revision);assert.equal(submitted.score,80);assert.equal(submitted.correctCount,4);
 const second=await store.createAttempt('alice',{stageId:'s01',count:5});await store.submitAttempt('alice',second.id,0);
 assert.equal((await store.readState('alice')).bestScores.s01,80);assert.equal((await store.readState('alice')).stats.submittedAttempts,2);assert.deepEqual((await store.readState('bob')).bestScores,{});
});
test('history retains older active and submitted attempts beyond 100 newer attempts as lightweight summaries',async()=>{
 const {store}=setup();const oldest=await store.createAttempt('alice',{stageId:'s01',count:1});
 for(let i=0;i<101;i++){const a=await store.createAttempt('alice',{stageId:'s01',count:1});await store.submitAttempt('alice',a.id,0);}
 const state=await store.readState('alice');assert.equal(state.attempts.length,102);assert.ok(state.attempts.some(a=>a.id===oldest.id));assert.equal(state.attempts[0].questionCount,1);assert.ok(!('questions' in state.attempts[0]));
});

test('learning preferences persist independently, isolate users and reject stale device writes',async()=>{
 const {store}=setup();const defaults=await store.readPreferences('alice');assert.equal(defaults.difficulty,'standard');assert.equal(defaults.goal,'exam-prep');assert.equal(defaults.revision,0);
 const p=await store.savePreferences('alice',{...defaults,difficulty:'foundation',goal:'problem-solving',onboardingCompleted:true});
 assert.equal(p.revision,1);assert.deepEqual((await store.readState('alice')).preferences,p);
 await assert.rejects(()=>store.savePreferences('alice',{...defaults,difficulty:'advanced',onboardingCompleted:true}),/conflict/);
 assert.equal((await store.readPreferences('alice')).difficulty,'foundation');assert.equal((await store.readPreferences('bob')).revision,0);
 await assert.rejects(()=>store.savePreferences('alice',{...p,difficulty:'unknown' as any}),/invalid/);
 await assert.rejects(()=>store.savePreferences('',p),/unauthorized/);
 const next=await store.savePreferences('alice',{...p,difficulty:'advanced'});assert.equal(next.goal,'problem-solving');assert.equal(next.revision,2);
});

test('additive preference migration preserves existing lessons and exact historical snapshots',async()=>{
 const sqlite=new DatabaseSync(':memory:');sqlite.exec(readFileSync('drizzle/0000_exotic_lightspeed.sql','utf8'));
 sqlite.prepare('INSERT INTO lesson_progress VALUES (?,?,?,?,?,?)').run('legacy','s01',2,'[0,1]',3,'2026-01-01T00:00:00Z');
 sqlite.prepare("INSERT INTO exam_attempts (id,user_id,status,revision,questions,answers,current_index,created_at) VALUES (?,?,'submitted',1,?,?,0,?)").run('old-attempt','legacy','[{"id":"original","answer":"unchanged","explanation":["saved"]}]','{"original":"unchanged"}','2026-01-01T00:00:00Z');
 const before=sqlite.prepare('SELECT * FROM exam_attempts').get();
 for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')&&!f.startsWith('0000')))sqlite.exec(readFileSync(`drizzle/${file}`,'utf8'));
 assert.deepEqual(sqlite.prepare('SELECT * FROM exam_attempts').get(),before);
 assert.equal(sqlite.prepare('SELECT completed FROM lesson_progress').get()?.completed,'[0,1]');
 assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM learner_preferences').get()?.n,0);sqlite.close();
});

test('review uses only latest submitted concept evidence, includes combined exams and clears after recovery',async()=>{
 const {store,sqlite,tick}=setup();
 const a=await store.createAttempt('alice',{stageId:'s01',count:14});
 const snapshot=()=>JSON.parse((sqlite.prepare('SELECT questions FROM exam_attempts WHERE id=?').get(a.id) as {questions:string}).questions);
 const qs=snapshot();const answers=Object.fromEntries(qs.map((q:any,i:number)=>[q.id,i===0?q.choices.find((c:string)=>c!==q.answer):q.answer]));
 const saved=await store.updateAttempt('alice',a.id,{revision:0,answers,currentIndex:0,eventId:'review-wrong'});await store.submitAttempt('alice',a.id,saved.revision);
 const review=await store.readReview('alice');assert.equal(review.length,1);assert.equal(review[0].sourceId,qs[0].sourceId);assert.equal(review[0].incorrectCount,1);assert.equal(review[0].questionCount,2);
 assert.ok(!JSON.stringify(review).includes('explanation'));assert.ok(!('expected' in review[0]));assert.deepEqual(await store.readReview('bob'),[]);
 tick(1000);const active=await store.createAttempt('alice',{chapter:'waves',count:70});assert.deepEqual(await store.readReview('alice'),review);
 await store.submitAttempt('alice',active.id,0);const blank=await store.readReview('alice');assert.equal(blank.find(r=>r.sourceId===qs[0].sourceId)?.incorrectCount,0);assert.ok(blank.every(r=>r.unansweredCount>0));
 tick(1000);const recovery=await store.createAttempt('alice',{chapter:'waves',count:70});const raw=sqlite.prepare('SELECT questions FROM exam_attempts WHERE id=?').get(recovery.id) as {questions:string};const correct=Object.fromEntries(JSON.parse(raw.questions).map((q:any)=>[q.id,q.answer]));
 const repaired=await store.updateAttempt('alice',recovery.id,{revision:0,answers:correct,currentIndex:0,eventId:'review-recovery'});await store.submitAttempt('alice',recovery.id,repaired.revision);
 assert.deepEqual(await store.readReview('alice'),[]);assert.equal((await store.getAttempt('alice',a.id)).score,93);
});

test('all 20 canonical progress records and submitted snapshots survive every difficulty switch',async()=>{
 const {store,sqlite}=setup();
 for(let n=1;n<=20;n++)await store.saveLesson('learner',{stageId:`s${String(n).padStart(2,'0')}`,step:1,completed:[0],revision:0});
 const exam=await store.createAttempt('learner',{count:20});await store.submitAttempt('learner',exam.id,0);
 const before=(await store.readState('learner')).lessons,raw=sqlite.prepare('SELECT * FROM exam_attempts WHERE id=?').get(exam.id);
 for(const difficulty of ['foundation','standard','advanced'] as const){
  await store.savePreferences('learner',{...await store.readPreferences('learner'),difficulty,onboardingCompleted:true});
  assert.deepEqual((await store.readState('learner')).lessons,before);
  assert.deepEqual(sqlite.prepare('SELECT * FROM exam_attempts WHERE id=?').get(exam.id),raw);
 }
});
