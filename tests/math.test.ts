import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import katex from 'katex';
import {stages,sourceQuestions} from '../lib/curriculum.ts';
import {generateQuestion} from '../lib/questions.ts';
import {teachingContent} from '../lib/teaching-content.ts';
import {firstWaveVariants} from '../lib/lesson-variants.ts';
import {normalizeFormula} from '../lib/math-format.ts';
function render(formula:string){return katex.renderToString(formula,{throwOnError:true,strict:'ignore',trust:false,output:'htmlAndMathml'});}
test('all canonical, variant and generated solution formulas parse without bare spacing commands',()=>{
 const formulas=stages.flatMap(s=>[s.formula,...s.steps.flatMap(p=>p.formula?[p.formula]:[])]);
 for(const variant of Object.values(firstWaveVariants))for(const step of Object.values(variant.steps))if(step?.example)formulas.push(step.example.formula);
 for(const content of Object.values(teachingContent))for(const level of [content.foundation,content.standard,content.advanced])formulas.push(level.example.formula);
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

test('display fractions preserve grouping, signs, units and legacy snapshots',async()=>{
 const {stackedFractions,displayFormula}=await import('../lib/math-format.ts');
 assert.equal(stackedFractions('a/(b+c)'),String.raw`\frac{a}{(b+c)}`);
 assert.equal(stackedFractions('-v/u'),String.raw`-\frac{v}{u}`);
 assert.equal(stackedFractions(String.raw`a/b\cdot c`),String.raw`\frac{a}{b}\cdot c`);
 assert.equal(stackedFractions('a/b*c'),String.raw`\frac{a}{b}*c`);
 assert.equal(stackedFractions('a/b/c'),String.raw`\frac{\frac{a}{b}}{c}`);
 assert.equal(stackedFractions(String.raw`\mathrm{m/s}`),String.raw`\mathrm{m/s}`);
 const chain=displayFormula('v=12/3=4');
 assert.match(chain,/\\begin\{aligned\}/);assert.match(chain,/\\frac\{12\}\{3\}/);
 assert.doesNotThrow(()=>render(chain));
});
test('strict rendering never exposes raw LaTeX for invalid or untrusted input',async()=>{
 const {renderMath}=await import('../lib/math-render.ts');
 for(const input of [String.raw`\notARealCommand{secret}`,String.raw`\frac{1}`,String.raw`\htmlClass{injected}{x}`,String.raw`\href{javascript:alert(1)}{click}`,String.raw`v=(1/2`]){
  assert.equal(renderMath(input),null,input);
 }
 const html=renderMath('v=12/3=4')!;
 assert.match(html,/class="mfrac"/);assert.match(html,/<math/);assert.doesNotMatch(html,/katex-error/);
});
test('authored equation fragments, all subjects and display formulas render through the production path',async()=>{
 const {renderMath}=await import('../lib/math-render.ts');
 const {equationParts}=await import('../lib/math-prose.ts');
 const {allStages,allSourceQuestions}=await import('../lib/subjects.ts');
 const formulas:string[]=[];const prose:string[]=[];
 const {labs}=await import('../lib/labs.ts');for(const lab of Object.values(labs))prose.push(lab.observe,lab.apply.prompt,...lab.apply.choices);
 for(const stage of allStages){formulas.push(stage.formula,...stage.steps.flatMap(s=>s.formula?[s.formula]:[]));prose.push(...stage.steps.map(s=>s.body),...stage.pairs.flatMap(p=>[p.left,p.right]));}
 for(const variant of Object.values(firstWaveVariants))for(const step of Object.values(variant.steps))if(step?.example){formulas.push(step.example.formula);prose.push(...step.example.steps);}
 for(const content of Object.values(teachingContent))for(const level of [content.foundation,content.standard,content.advanced]){formulas.push(level.example.formula);prose.push(...level.example.steps);}
 for(const source of allSourceQuestions)for(const seed of [0,67108863,2147483647,4294967295]){const q=generateQuestion(source.id,seed);formulas.push(q.formula);prose.push(q.prompt,...q.explanation);}
 for(const formula of formulas.filter(Boolean))assert.notEqual(renderMath(formula),null,formula);
 for(const text of prose)for(const part of equationParts(text))if(part.formula)assert.notEqual(renderMath(part.formula,false),null,part.formula);
});

test('inline result units remain outside the division denominator',async()=>{
 const {proseToLatex}=await import('../lib/math-prose.ts');
 const {stackedFractions}=await import('../lib/math-format.ts');
 assert.equal(stackedFractions(proseToLatex('v = 12/3 m/s')),String.raw`v =\frac{12}{3}\,\mathrm{m/s}`);
});
