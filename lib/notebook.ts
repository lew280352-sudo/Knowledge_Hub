import {labs} from './labs.ts';
export const notebookLimits={prediction:2000,reason:4000} as const;
export type LabText={prediction:string;reason:string};
export type LabNotebook=LabText&{stageId:string;revision:number;updatedAt:string|null};
export type NotebookEnvelope={notebook:LabNotebook;draftKey:string};
export type NotebookDraft=LabText&{revision:number};
export function isNotebookStage(id:string){return id==='s01'||Object.hasOwn(labs,id);}
export function sameLabText(a:LabText,b:LabText){return a.prediction===b.prediction&&a.reason===b.reason;}
export function validLabText(value:unknown):value is LabText{
 if(!value||typeof value!=='object')return false;const v=value as LabText;
 return typeof v.prediction==='string'&&v.prediction.length<=notebookLimits.prediction&&typeof v.reason==='string'&&v.reason.length<=notebookLimits.reason;
}
export function parseNotebookDraft(raw:string|null):NotebookDraft|null{
 try{const v=JSON.parse(raw??'null');return validLabText(v)&&Number.isSafeInteger((v as NotebookDraft).revision)&&(v as NotebookDraft).revision>=0?v as NotebookDraft:null;}catch{return null;}
}
