import test from 'node:test';
import assert from 'node:assert/strict';
import {learningOverview} from '../lib/learning.ts';
import {stages,sourceQuestions} from '../lib/curriculum.ts';
test('dashboard derives next actions and distinct in-progress counts from saved evidence',()=>{
 assert.equal(learningOverview([],{}).action,'start');
 const lesson={stageId:'s01',step:2,completed:[0,1],revision:1,updatedAt:'2026-01-01'};
 assert.equal(learningOverview([lesson],{}).action,'continue');
 assert.equal(learningOverview([lesson],{s01:80}).inProgress,0);
 assert.equal(learningOverview([],{s01:80},[{stageId:'s02'},{stageId:'s02'}]).inProgress,1);
 assert.equal(learningOverview([],Object.fromEntries(stages.map(s=>[s.id,80]))).action,'review');
 assert.equal(stages.length,20);assert.equal(sourceQuestions.length,70);
});

import {fixedSpeedWave} from '../lib/wave-model.ts';
import {firstWaveVariants,getLessonExtension} from '../lib/lesson-variants.ts';
test('wave lab respects fixed medium speed, SI units and spatial period at all control extremes',()=>{
 for(const f of [.5,2,4,5])for(const a of [.25,1,1.25]){
  const w=fixedSpeedWave(4,f,a);assert.equal(w.speed,4);assert.equal(w.frequency*w.wavelength,4);assert.equal(w.period,1/f);
  assert.ok(Math.abs(w.displacement(w.wavelength/4)-a)<1e-10);assert.ok(Math.abs(w.displacement(w.wavelength))<1e-10);
 }
 assert.equal(fixedSpeedWave(4,4,1).wavelength,1);assert.equal(fixedSpeedWave(4,.5,1).wavelength,8);
 assert.throws(()=>fixedSpeedWave(4,0,1),RangeError);
 // Independent verification of the advanced worked examples.
 assert.equal(6/1.5,4);assert.equal(4/2*1.5,3);assert.equal(2*Math.PI/Math.PI,2);assert.equal(4*Math.PI/Math.PI,4);
 assert.equal(12/3,4);assert.equal(12/6,2);assert.equal(360*.75/2-360*2*.125,45);
});
test('only first-wave extensions exist; fallback leaves canonical content and mappings untouched',()=>{
 for(const level of ['foundation','standard','advanced'] as const){
  for(let i=0;i<4;i++){assert.ok(getLessonExtension('s01',level,i));const q=firstWaveVariants[level].steps[i]?.checkpoint;if(q)assert.ok(q.answer>=0&&q.answer<q.choices.length);}
  assert.equal(getLessonExtension('s02',level,0),undefined);
 }
 assert.equal(stages[0].steps[2].body,'ถ้าคลื่นมีความถี่ 5 Hz และความยาวคลื่น 2 m ในหนึ่งวินาทีรูปคลื่นเดินทางได้ 5 ลูกคลื่น จึงมีอัตราเร็ว 10 m/s');
});
