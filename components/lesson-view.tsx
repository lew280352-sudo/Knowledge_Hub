'use client';
import { useEffect,useState } from 'react';
import { ArrowLeft,ArrowRight,Check,ExternalLink,RotateCw } from 'lucide-react';
import type { Progress,Stage } from '../lib/question-types';
import { MathFormula } from './math';
import { lessonDiagram,PhysicsDiagram } from './physics-diagram';
export function LessonView({stage,progress,onSave,onGame}:{stage:Stage;progress?:Progress;onSave:(data:Progress)=>Promise<Progress>;onGame:()=>void}){
 const [step,setStep]=useState(progress?.step??0),[completed,setCompleted]=useState(progress?.completed??[]),[revision,setRevision]=useState(progress?.revision??0),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const key=`physic-lesson-${stage.id}`;
 useEffect(()=>{const draft=localStorage.getItem(key);if(draft){try{const d=JSON.parse(draft);if(Number.isInteger(d.step)&&d.step>=0&&d.step<stage.steps.length){setStep(d.step);setCompleted([...new Set<number>([...(progress?.completed??[]),...d.completed])]);setError('มีความคืบหน้าที่ยังไม่ได้ซิงก์จากเครื่องนี้ กดบันทึกอีกครั้งได้');}}catch{localStorage.removeItem(key);}}},[key]);
 async function save(next:number,markCurrent:boolean){
  const nextCompleted=markCurrent?[...new Set([...completed,step])]:completed;setStep(next);setCompleted(nextCompleted);
  const data={stageId:stage.id,step:next,completed:nextCompleted,revision,updatedAt:new Date().toISOString()};localStorage.setItem(key,JSON.stringify(data));setBusy(true);
  try{const result=await onSave(data);setRevision(result.revision);setCompleted(result.completed);setError('');localStorage.removeItem(key);return true;}catch{setError('ยังบันทึกไม่สำเร็จ เก็บร่างไว้ในเครื่องแล้ว กดบันทึกอีกครั้งเมื่อเชื่อมต่อได้');return false;}finally{setBusy(false);}
 }
 const content=stage.steps[step];
 return <div className="lesson-grid"><aside className="lesson-outline"><p className="muted">เส้นทางในด่านนี้</p>{stage.steps.map((s,i)=><button className={i===step?'step-link active':'step-link'} key={s.title} onClick={()=>void save(i,false)} disabled={busy}><span>{completed.includes(i)?<Check size={16}/>:i+1}</span>{s.title}</button>)}<a className="source-link" href={`/reference.pdf#page=${stage.sourcePages[0]}`} target="_blank" rel="noreferrer">เอกสารหน้า {stage.sourcePages.join(', ')} <ExternalLink size={14}/></a></aside><article className="lesson-content"><div className="lesson-top"><span>ขั้นที่ {step+1} จาก {stage.steps.length}</span><span>{completed.length}/{stage.steps.length} ขั้นที่อ่านแล้ว</span></div><h2>{content.title}</h2><p className="lesson-body">{content.body}</p>{content.formula&&<MathFormula formula={content.formula}/>}<PhysicsDiagram key={stage.id} diagram={lessonDiagram(stage.diagram,stage.number)} interactive/>{content.note&&<div className="note"><strong>จุดที่มักพลาด</strong><p>{content.note}</p></div>}{error&&<div className="notice error" role="alert"><p>{error}</p><button className="button secondary" disabled={busy} onClick={()=>void save(step,false)}><RotateCw size={16}/> บันทึกอีกครั้ง</button></div>}<div className="lesson-actions"><button className="button secondary" disabled={step===0||busy} onClick={()=>void save(step-1,false)}><ArrowLeft size={17}/> ย้อนกลับ</button>{step<stage.steps.length-1?<button className="button primary" disabled={busy} onClick={()=>void save(step+1,true)}>เข้าใจแล้ว · ถัดไป <ArrowRight size={17}/></button>:<button className="button primary" disabled={busy} onClick={async()=>{if(await save(step,true))onGame();}}>จบบทเรียน · เล่นเกม <ArrowRight size={17}/></button>}</div></article></div>;
}
