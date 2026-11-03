import {chapters as physicsChapters,stages as physicsStages,sourceQuestions as physicsQuestions} from './curriculum.ts';
import {aiChapters,aiStages,aiSourceQuestions} from './ai-curriculum.ts';
export const subjects=[
 {id:'ai',title:'ปัญญาประดิษฐ์',subtitle:'การเขียนโปรแกรมปัญญาประดิษฐ์ 1 · บทนำ',description:'AI, ML, DL การเรียนรู้จากข้อมูล และโมเดลภาษา',reference:'/references/ai-01.pdf',chapters:aiChapters,stages:aiStages,questions:aiSourceQuestions,pages:17},
 {id:'physics',title:'ฟิสิกส์',subtitle:'คลื่น · แสง · เสียง',description:'เข้าใจผ่านภาพ ทดลอง เล่นเกม แล้วลองแก้โจทย์',reference:'/reference.pdf',chapters:physicsChapters,stages:physicsStages,questions:physicsQuestions,pages:56},
];
export const allStages=subjects.flatMap(s=>s.stages);
export const allChapters=subjects.flatMap(s=>s.chapters);
export const allSourceQuestions=subjects.flatMap(s=>s.questions);
export function subjectForStage(id:string){return subjects.find(s=>s.stages.some(stage=>stage.id===id));}

/** AI questions are conceptual: repeat practice in a new set, not within one set. */
export function examQuestionCounts(subjectId:string,poolSize:number):number[]{
 if(subjectId!=='ai')return [5,10,20,40,70];
 if(!Number.isInteger(poolSize)||poolSize<1)return [];
 const limit=Math.min(poolSize,70);
 return [...new Set([5,10,15,limit].filter(count=>count<=limit))].sort((a,b)=>a-b);
}
