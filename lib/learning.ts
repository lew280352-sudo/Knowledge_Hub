import {stages} from './curriculum.ts';
import type {Difficulty,LearningGoal,LearningPreferences,Progress,Stage} from './question-types.ts';
export const difficultyOptions:{id:Difficulty;label:string;description:string}[]=[
 {id:'foundation',label:'พื้นฐาน',description:'อธิบายแนวคิด ตัวแปร และคำนวณแบบมีคำแนะนำ'},
 {id:'standard',label:'มาตรฐาน',description:'เชื่อมแนวคิดกับสูตร แล้วลองคำนวณด้วยตัวเอง'},
 {id:'advanced',label:'ขั้นสูง',description:'ให้เหตุผลหลายขั้น ตรวจสมมติฐานและขอบเขตของสูตร'},
];
export const goalOptions:{id:LearningGoal;label:string;description:string}[]=[
 {id:'understanding',label:'เข้าใจแนวคิด',description:'เริ่มจากภาพและคำอธิบาย แล้วลองเกมจับคู่'},
 {id:'exam-prep',label:'เตรียมสอบ',description:'เรียนให้เข้าใจ แล้วตรวจตัวเองด้วยข้อสอบท้ายด่าน'},
 {id:'problem-solving',label:'แก้ปัญหาเชิงลึก',description:'อธิบายเหตุผล ตรวจเงื่อนไข แล้วประยุกต์กับโจทย์'},
];
export const defaultPreferences:LearningPreferences={difficulty:'standard',goal:'exam-prep',onboardingCompleted:false,revision:0,updatedAt:null};
export function learningOverview(lessons:Progress[],best:Record<string,number>,attempts:{stageId:string|null}[]=[],curriculum:Stage[]=stages){
 const completed=curriculum.filter(s=>best[s.id]>=80).length;
 const started=new Set([...lessons.map(p=>p.stageId),...attempts.map(a=>a.stageId).filter((s):s is string=>!!s)]);
 const inProgress=curriculum.filter(s=>started.has(s.id)&&!(best[s.id]>=80)).length;
 const recent=[...lessons].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).find(p=>curriculum.some(s=>s.id===p.stageId)&&!(best[p.stageId]>=80));
 const stage=curriculum.find(s=>s.id===recent?.stageId)??curriculum.find(s=>!(best[s.id]>=80))??curriculum[0],hasStarted=started.has(stage.id);
 return {completed,inProgress,stage,action:completed===curriculum.length?'review':hasStarted?'continue':'start'} as const;
}
export const actionLabels={start:'เริ่มเรียน',continue:'เรียนต่อ',review:'ทบทวนบทเรียน'};
