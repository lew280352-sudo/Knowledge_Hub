import {sourceQuestions} from './curriculum.ts';
import type {ReviewRecommendation} from './question-types.ts';
/** Rows are server-only submitted snapshots from the latest attempt for each source. */
export type ReviewEvidence={attempt_id:string;submitted_at:string;source_id:string;question_id:string;expected:string;answers:string};
export function deriveReview(rows:ReviewEvidence[]):ReviewRecommendation[]{
 const concepts=new Map<string,ReviewRecommendation>();
 for(const row of rows){
  const source=sourceQuestions.find(q=>q.id===row.source_id);if(!source)continue;
  let item=concepts.get(source.id);
  if(!item){item={sourceId:source.id,stageId:source.stageId,topic:source.topic,attemptId:row.attempt_id,reviewedAt:row.submitted_at,incorrectCount:0,unansweredCount:0,questionCount:0};concepts.set(source.id,item);}
  const answer=(JSON.parse(row.answers) as Record<string,string>)[row.question_id];item.questionCount++;
  if(answer===undefined)item.unansweredCount++;else if(answer!==row.expected)item.incorrectCount++;
 }
 return [...concepts.values()].filter(c=>c.incorrectCount+c.unansweredCount>0).sort((a,b)=>b.reviewedAt.localeCompare(a.reviewedAt)||b.incorrectCount-a.incorrectCount||a.sourceId.localeCompare(b.sourceId));
}
