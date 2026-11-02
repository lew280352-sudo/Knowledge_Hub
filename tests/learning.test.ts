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
