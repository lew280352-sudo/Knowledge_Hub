'use client';
import {useId,useState} from 'react';
import type {Checkpoint} from '../lib/question-types';
export function ConceptCheckpoint({question,requireReason=false}:{question:Checkpoint;requireReason?:boolean}){
 const id=useId(),[choice,setChoice]=useState<number|null>(null),[checked,setChecked]=useState(false),[reason,setReason]=useState('');
 return <section className="concept-checkpoint"><p className="eyebrow">ฝึกระหว่างเรียน · ไม่คิดคะแนนสอบ</p><fieldset><legend>{question.prompt}</legend>{question.choices.map((text,i)=><label key={text}><input type="radio" name={id} checked={choice===i} onChange={()=>{setChoice(i);setChecked(false);}}/>{text}</label>)}</fieldset>{requireReason&&<label className="reasoning-field" htmlFor={`${id}-reason`}>อธิบายเหตุผลก่อนตรวจ<textarea id={`${id}-reason`} value={reason} onChange={e=>{setReason(e.target.value);setChecked(false);}}/><span className="muted">ใช้ทบทวนด้วยตัวเอง ข้อความไม่ถูกตรวจอัตโนมัติและไม่บันทึกข้ามอุปกรณ์</span></label>}<button className="button secondary" disabled={choice===null||(requireReason&&!reason.trim())} onClick={()=>setChecked(true)}>ตรวจความเข้าใจ</button>{checked&&<p role="status" className="checkpoint-feedback"><strong>{choice===question.answer?'เข้าใจถูกแล้ว':'ลองทบทวนเหตุผล'}</strong> · {question.explanation}</p>}</section>;
}
