import test from 'node:test';
import assert from 'node:assert/strict';
import {isNotebookStage,notebookLimits,parseNotebookDraft,sameLabText,validLabText} from '../lib/notebook.ts';
test('notebooks are limited to actual guided labs and bounded text-only recovery drafts',()=>{
 assert.equal(Array.from({length:20},(_,i)=>`s${String(i+1).padStart(2,'0')}`).filter(isNotebookStage).length,19);assert.equal(isNotebookStage('s15'),false);assert.equal(isNotebookStage('toString'),false);
 assert.equal(parseNotebookDraft('{broken'),null);assert.equal(parseNotebookDraft('{"prediction":"text","reason":"reason","revision":-1}'),null);
 const value={prediction:'คำทำนาย <script>ไม่ใช่ HTML</script>',reason:'เหตุผล\nหลายบรรทัด',revision:3};assert.deepEqual(parseNotebookDraft(JSON.stringify(value)),value);
 assert.equal(validLabText({prediction:'',reason:'x'.repeat(notebookLimits.reason+1)}),false);assert.equal(validLabText({prediction:12,reason:''}),false);
 assert.ok(sameLabText(value,{prediction:value.prediction,reason:value.reason}));assert.ok(!sameLabText(value,{...value,reason:'อีกฉบับ'}));
});
