import test from 'node:test';
import assert from 'node:assert/strict';
import {subjects,allStages,allSourceQuestions} from '../lib/subjects.ts';
import {generateQuestion} from '../lib/questions.ts';
import {learningOverview} from '../lib/learning.ts';
test('subject IDs, stages and question sources remain distinct and AI practice is valid',()=>{
 assert.equal(new Set(allStages.map(s=>s.id)).size,allStages.length);
 assert.equal(new Set(allSourceQuestions.map(s=>s.id)).size,allSourceQuestions.length);
 const ai=subjects.find(s=>s.id==='ai')!;
 for(const source of ai.questions)for(const seed of [0,1,42,4294967295]){
  const q=generateQuestion(source.id,seed);
  assert.equal(q.stageId,source.stageId);assert.equal(new Set(q.choices).size,4);assert.ok(q.choices.includes(q.answer));assert.ok(q.explanation[0]);
 }
 const overview=learningOverview([],{s01:100},[],ai.stages);
 assert.equal(overview.completed,0);assert.equal(overview.stage.id,'ai-01');
 assert.equal(subjects.find(s=>s.id==='physics')?.stages.length,20);
});
