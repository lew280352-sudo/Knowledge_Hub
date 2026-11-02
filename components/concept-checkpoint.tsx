'use client';
import {useId,useState} from 'react';
import type {Checkpoint} from '../lib/question-types';
export function ConceptCheckpoint({question}:{question:Checkpoint}){
 const id=useId(),[choice,setChoice]=useState<number|null>(null),[checked,setChecked]=useState(false);
 return <section className="concept-checkpoint"><p className="eyebrow">ฝึกระหว่างเรียน · ไม่คิดคะแนนสอบ</p><fieldset><legend>{question.prompt}</legend>{question.choices.map((text,i)=><label key={text}><input type="radio" name={id} checked={choice===i} onChange={()=>{setChoice(i);setChecked(false);}}/>{text}</label>)}</fieldset><button className="button secondary" disabled={choice===null} onClick={()=>setChecked(true)}>ตรวจความเข้าใจ</button>{checked&&<p role="status" className="checkpoint-feedback"><strong>{choice===question.answer?'เข้าใจถูกแล้ว':'ลองทบทวนเหตุผล'}</strong> · {question.explanation}</p>}</section>;
}
