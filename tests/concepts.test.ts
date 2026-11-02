import test from 'node:test';
import assert from 'node:assert/strict';
import {sourceQuestions} from '../lib/curriculum.ts';
import {classifyReviewEvidence,conceptTaxonomy,errorCategories} from '../lib/concepts.ts';
import {deriveReview} from '../lib/review.ts';
test('all 70 original concepts retain their source identity; five causes remain distinct from concept labels',()=>{
 assert.equal(Object.keys(conceptTaxonomy).length,70);
 for(const source of sourceQuestions)assert.deepEqual(conceptTaxonomy[source.id],{id:source.id,stageId:source.stageId,label:source.topic});
 assert.equal(Object.keys(errorCategories).length,6);
 for(const value of Object.values(errorCategories))assert.ok(value.guidance.length>30);
});
test('answer-only evidence cannot diagnose a cause; blank answers are insufficient, not misconceptions',()=>{
 assert.deepEqual(classifyReviewEvidence(1,0),{category:'unclassified',evidence:'answer-only'});
 assert.deepEqual(classifyReviewEvidence(0,1),{category:'unclassified',evidence:'insufficient'});
 const row={attempt_id:'a',submitted_at:'2026-01-01',source_id:sourceQuestions[0].id,question_id:'q',expected:'right',answers:JSON.stringify({q:'wrong'})};
 assert.equal(deriveReview([row])[0].category,'unclassified');
 assert.equal(deriveReview([{...row,answers:'{}'}])[0].evidence,'insufficient');
 assert.equal(deriveReview([{...row,answers:'{"q":"right"}'}]).length,0);
});
