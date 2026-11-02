'use client';
import {useId} from 'react';
import type {Difficulty,Stage} from '../lib/question-types';
import {useLabNotebook} from '../lib/client/notebook';
import {notebookLimits} from '../lib/notebook';
import {LabNotebookStatus} from './lab-notebook-status';
import {labs} from '../lib/labs';
import {PhysicsDiagram,lessonDiagram} from './physics-diagram';
import {ConceptCheckpoint} from './concept-checkpoint';
import {MathFormula} from './math';
export function GuidedLab({stage,difficulty}:{stage:Stage;difficulty:Difficulty}){
 const id=useId(),lab=labs[stage.id],notebook=useLabNotebook(stage.id);if(!lab)return null;
 return <section className="wave-lab guided-lab" aria-labelledby={`${id}-heading`}><h3 id={`${id}-heading`}>ห้องทดลอง: {stage.title}</h3><p><strong>เป้าหมาย:</strong> {lab.objective}</p><label className="reasoning-field" htmlFor={`${id}-predict`}>1 · ทำนายก่อนลอง (ข้ามได้): {lab.prediction}<textarea id={`${id}-predict`} value={notebook.draft.prediction} disabled={!notebook.editable} maxLength={notebookLimits.prediction} onChange={e=>notebook.edit('prediction',e.target.value)}/><span className="muted">{notebook.draft.prediction.length}/{notebookLimits.prediction} ตัวอักษร</span></label><h4>2 · ทดลอง — เปลี่ยนค่าทีละตัวและสังเกต</h4><PhysicsDiagram diagram={lessonDiagram(stage.diagram,stage.number)} interactive/><h4>3 · สังเกตและเชื่อมกับสูตร</h4><MathFormula formula={stage.formula}/><p>{lab.observe}</p><label className="reasoning-field" htmlFor={`${id}-reason`}>4 · อธิบายด้วยเหตุผลและเงื่อนไขที่ใช้<textarea id={`${id}-reason`} value={notebook.draft.reason} disabled={!notebook.editable} maxLength={notebookLimits.reason} onChange={e=>notebook.edit('reason',e.target.value)}/><span className="muted">{notebook.draft.reason.length}/{notebookLimits.reason} ตัวอักษร</span></label><LabNotebookStatus notebook={notebook}/><h4>5 · ประยุกต์</h4><ConceptCheckpoint question={lab.apply} requireReason={difficulty==='advanced'}/></section>;
}
