import test from 'node:test';
import assert from 'node:assert/strict';
import { stages, sourceQuestions } from '../lib/curriculum.ts';
import { generateQuestion, publicQuestion } from '../lib/questions.ts';
import { fixtures } from './question-fixtures.ts';

test('all 70 source questions occur once across 20 complete stages', () => {
 assert.equal(stages.length,20);
 assert.equal(sourceQuestions.length,70);
 assert.equal(new Set(sourceQuestions.map(q=>q.id)).size,70);
 for(const stage of stages){
  assert.ok(stage.steps.length>=3,stage.id);
  assert.ok(stage.pairs.length>=4,stage.id);
  assert.ok(sourceQuestions.some(q=>q.stageId===stage.id));
 }
 assert.deepEqual(sourceQuestions.filter(q=>q.chapter==='waves'&&q.number>=19).map(q=>q.page),[58,58]);
});
test('every template matches an independent baseline calculation',()=>{
 assert.equal(Object.keys(fixtures).length,70);
 for(const source of sourceQuestions){
  const question=generateQuestion(source.id,0);
  assert.equal(question.answer,fixtures[source.id],source.id);
 }
});
test('many seeds remain deterministic with unique formatted choices and coherent answers',()=>{
 for(const source of sourceQuestions)for(let seed=0;seed<80;seed++){
  const q=generateQuestion(source.id,seed);
  assert.deepEqual(q,generateQuestion(source.id,seed));
  assert.equal(new Set(q.choices).size,q.choices.length,source.id);
  assert.ok(q.choices.includes(q.answer),source.id);
  assert.ok(q.explanation.length>=2,source.id);
  assert.ok(q.prompt.length>20,source.id);
  assert.ok(q.page>=1&&q.page<=58);
  if(q.numericAnswer!==undefined)assert.ok(Number.isFinite(q.numericAnswer),source.id);
  const exposed=JSON.stringify(publicQuestion(q));
  assert.ok(!exposed.includes('explanation')&&!exposed.includes('numericAnswer')&&!exposed.includes('"answer"'));
 }
});
test('invalid source IDs and non-integer seeds are rejected',()=>{
 assert.throws(()=>generateQuestion('unknown',1));
 assert.throws(()=>generateQuestion('waves-1',NaN));
});
test('lens source parameters contain givens, not the focal-length answer',()=>{
 const q=publicQuestion(generateQuestion('ray-optics-17',0));
 assert.ok(q.diagram);assert.equal(q.diagram.values.u,30);assert.equal(q.diagram.values.v,60);assert.ok(!('f' in q.diagram.values));
});
test('standing-wave diagram preserves its given driving frequency',()=>{
 const q=generateQuestion('waves-15',0);assert.equal(q.diagram?.values.frequency,50);assert.equal(q.diagram?.values.length,1.8);assert.ok(!('speed' in q.diagram!.values));
});
test('resume chooses the most recently updated unfinished stage',async()=>{
 const {chooseResumeStage}=await import('../lib/curriculum.ts');
 const lessons=[{stageId:'s01',step:1,completed:[0],revision:1,updatedAt:'2026-11-02T01:00:00Z'},{stageId:'s20',step:2,completed:[0,1],revision:1,updatedAt:'2026-11-02T02:00:00Z'}];
 assert.equal(chooseResumeStage(lessons,{}).id,'s20');assert.equal(chooseResumeStage(lessons,{s20:80}).id,'s01');
});
