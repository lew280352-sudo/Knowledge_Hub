import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import katex from 'katex';
import {stages,sourceQuestions} from '../lib/curriculum.ts';
import {generateQuestion} from '../lib/questions.ts';
import {firstWaveVariants} from '../lib/lesson-variants.ts';
import {normalizeFormula} from '../lib/math-format.ts';
function render(formula:string){return katex.renderToString(formula,{throwOnError:true,strict:'ignore',trust:false,output:'htmlAndMathml'});}
test('all canonical, variant and generated solution formulas parse without bare spacing commands',()=>{
 const formulas=stages.flatMap(s=>[s.formula,...s.steps.flatMap(p=>p.formula?[p.formula]:[])]);
 for(const variant of Object.values(firstWaveVariants))for(const step of Object.values(variant.steps))if(step?.example)formulas.push(step.example.formula);
 for(const source of sourceQuestions)for(const seed of [0,19,2026])formulas.push(generateQuestion(source.id,seed).formula);
 for(const formula of formulas){
  assert.doesNotThrow(()=>render(formula),formula);
  assert.doesNotMatch(formula,/(^|[^\\a-z])quad\b|\\lambdaquad|,;/i,formula);
  assert.doesNotMatch(formula,/[\u0000-\u0008\u000b-\u001f]/,formula);
 }
 // A dropped JS escape is valid KaTeX in many cases, so parse success alone is insufficient.
 for(const source of ['lib/curriculum.ts','lib/questions.ts'])assert.doesNotMatch(readFileSync(source,'utf8'),/(?<!\\)\\(?:quad|;)/,source);
});
test('historical formula formatting is repaired without mutating immutable snapshots',()=>{
 const legacy=Object.freeze({answer:'9 km',score:80,formula:'M=v_S/v,quad\\sin\\mu=1/M'});
 const normalized=normalizeFormula(legacy.formula);assert.equal(normalized,String.raw`M=v_S/v,\quad\sin\mu=1/M`);
 assert.doesNotMatch(render(normalized),/>q<|>u<|>a<|>d</);
 assert.equal(legacy.formula,'M=v_S/v,quad\\sin\\mu=1/M');assert.equal(legacy.answer,'9 km');assert.equal(legacy.score,80);
 const joined=String.raw`\Delta r=n\lambdaquad\text{หรือ}quad(n-\tfrac12)\lambda`;
 assert.doesNotThrow(()=>render(normalizeFormula(joined)));
 assert.equal(normalizeFormula('m=-v/u,;f=uv/(u+v)'),String.raw`m=-v/u,\;f=uv/(u+v)`);
 const valid=String.raw`f_b=|f_1-f_2|,\quad f_L=f_s\frac{v+v_L}{v-v_S}`;
 assert.equal(normalizeFormula(valid),valid);assert.equal(normalizeFormula(normalized),normalized);
});
