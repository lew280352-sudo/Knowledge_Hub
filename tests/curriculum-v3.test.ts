import test from 'node:test';
import assert from 'node:assert/strict';
import {stages,sourceQuestions} from '../lib/curriculum.ts';
import {getLessonExtension} from '../lib/lesson-variants.ts';
import {teachingContent} from '../lib/teaching-content.ts';
const levels=['foundation','standard','advanced'] as const;
test('all 60 variants cover every canonical step with complete, distinct teaching and checkpoints',()=>{
 assert.equal(stages.length,20);assert.equal(sourceQuestions.length,70);assert.equal(Object.keys(teachingContent).length,19);
 for(const stage of stages){
  const intros=[];
  for(const level of levels){
   const content=stage.steps.map((_,i)=>getLessonExtension(stage.id,level,i));assert.ok(content.every(c=>c&&c.intro.length>20),`${stage.id}/${level}`);
   assert.ok(content.some(c=>c?.example));assert.ok(content.some(c=>c?.checkpoint));assert.ok(content.some(c=>c?.assumption)||level==='standard'||stage.id==='s01');
   for(const c of content){if(c?.checkpoint){const q=c.checkpoint;assert.ok(q.answer>=0&&q.answer<q.choices.length);assert.equal(new Set(q.choices).size,q.choices.length);assert.ok(q.explanation.length>15);}if(c?.variables)for(const v of c.variables)assert.ok(v.symbol&&v.meaning&&v.unit);}
   intros.push(content[0]?.intro);
  }
  assert.equal(new Set(intros).size,3,`${stage.id} levels differ`);
 }
 assert.equal(getLessonExtension('unknown','foundation',0),undefined);
});
// Independent arithmetic/geometry oracles, not the production example metadata.
const sind=(x:number)=>Math.sin(x*Math.PI/180),asind=(x:number)=>Math.asin(x)*180/Math.PI;
const expected:Record<string,number[][]>={
 s02:[[.03-.01],[2*.25,.04-.015],[2*.01*Math.cos(Math.PI/3)]],
 s03:[[-.02],[Math.sqrt(36/.01),Math.sqrt(36/.01)/30],[40/Math.sqrt(4),40/Math.sqrt(4)/10]],
 s04:[[4/5,2/5],[asind(.5*sind(30))],[asind(2/4)]],
 s05:[[2*.4,.4/2],[2*1.2/3,24/(2*1.2/3)],[2*.4,3*.4]],
 s06:[[500e-9*2/.0005],[(.01/5)*.0005/2],[Math.tan(Math.asin(.5)),.5]],
 s07:[[1/(500*1000)],[asind(2*.5/2)],[7]],
 s08:[[2*600e-9*2/.0003],[2*600e-9*3/.012],[Math.tan(Math.asin(.5))]],
 s09:[[5],[.6/.2,5],[5,5]],
 s10:[[.7*2],[1.7/2],[5*2]],s11:[[3e8/1.5],[600e-9/1.5],[asind(sind(45)/Math.SQRT2)]],
 s12:[[asind(.5)],[.6/(4/3),.6-.6/(4/3)],[asind(1/1.5)]],
 s13:[[.1*.3/(.3-.1)],[.15,-.15/.3,-.15/.3*.04],[.1*.05/(.05-.1),2]],
 s14:[[.4/2],[.15*.3/(.3-.15),-1]],
 s15:[[.4-.15],[.05*.25/(.25-.05),(-.15/.3)*(-.0625/.25)],[.2-.3,.05*(-.1)/(-.1-.05)]],
 s16:[[331+.6*20],[340*.4/2],[100/340-100/1500]],
 s17:[[(2/4)**2],[10*Math.log10(1e-6/1e-12)],[60+10*Math.log10(4)]],
 s18:[[340/(4*.5),4*.5],[2*(.5-.2),330/(2*(.5-.2))],[3*340/(4*.5),340/(2*.5),1.5]],
 s19:[[Math.abs(440-444)],[500*340/(340-20)],[500*(340+10)/(340-20)]],
 s20:[[680/340,asind(1/2)],[1000*2,Math.sqrt(2000**2-1000**2)],[Math.sqrt(1000**2-800**2),800*1.25]],
};
expected.s14.push([-.1*.3/(.3+.1),.25]);
test('all 57 new worked examples match independent numerical calculations and declare result units',()=>{
 for(const [id,content] of Object.entries(teachingContent))for(const [i,level] of levels.entries()){
  const results=content[level].example.results!;assert.equal(results.length,expected[id][i].length,`${id}/${level}`);
  results.forEach((r,j)=>{assert.ok(Math.abs(r.value-expected[id][i][j])<=1e-8*Math.max(1,Math.abs(r.value)),`${id}/${level}/${j}: ${r.value}`);assert.ok(r.unit);});
 }
});
