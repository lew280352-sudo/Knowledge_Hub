'use client';
import {useId,useState} from 'react';
import type {Difficulty,Stage} from '../lib/question-types';
import {labs} from '../lib/labs';
import {PhysicsDiagram,lessonDiagram} from './physics-diagram';
import {ConceptCheckpoint} from './concept-checkpoint';
import {MathFormula} from './math';
export function GuidedLab({stage,difficulty}:{stage:Stage;difficulty:Difficulty}){
 const id=useId(),lab=labs[stage.id],[prediction,setPrediction]=useState(''),[reason,setReason]=useState('');if(!lab)return null;
 return <section className="wave-lab guided-lab" aria-labelledby={`${id}-heading`}><h3 id={`${id}-heading`}>ห้องทดลอง: {stage.title}</h3><p><strong>เป้าหมาย:</strong> {lab.objective}</p><label className="reasoning-field" htmlFor={`${id}-predict`}>1 · ทำนายก่อนลอง (ข้ามได้): {lab.prediction}<textarea id={`${id}-predict`} value={prediction} onChange={e=>setPrediction(e.target.value)}/></label><h4>2 · ทดลอง — เปลี่ยนค่าทีละตัวและสังเกต</h4><PhysicsDiagram diagram={lessonDiagram(stage.diagram,stage.number)} interactive/><h4>3 · สังเกตและเชื่อมกับสูตร</h4><MathFormula formula={stage.formula}/><p>{lab.observe}</p><label className="reasoning-field" htmlFor={`${id}-reason`}>4 · อธิบายด้วยเหตุผลและเงื่อนไขที่ใช้<textarea id={`${id}-reason`} value={reason} onChange={e=>setReason(e.target.value)}/></label><p className="muted">คำทำนายและเหตุผลอยู่เฉพาะหน้านี้ ไม่คิดคะแนนและไม่ซิงก์ข้ามอุปกรณ์</p><h4>5 · ประยุกต์</h4><ConceptCheckpoint question={lab.apply} requireReason={difficulty==='advanced'}/></section>;
}
