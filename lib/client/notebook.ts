'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {ApiError,apiFetch} from './sync';
import {parseNotebookDraft,sameLabText,type LabNotebook,type LabText,type NotebookEnvelope} from '../notebook';
type NotebookState={record:LabNotebook|null;draft:LabText;baseRevision:number;draftKey:string;phase:'loading'|'ready'|'saving'|'refreshing'|'load-error';conflict:boolean;latest:LabNotebook|null;error:string;message:string;localSafe:boolean};
const initial:NotebookState={record:null,draft:{prediction:'',reason:''},baseRevision:0,draftKey:'',phase:'loading',conflict:false,latest:null,error:'',message:'',localSafe:true};
const isBusy=(s:NotebookState)=>['loading','saving','refreshing'].includes(s.phase);
export function useLabNotebook(stageId:string){
 const [state,setState]=useState<NotebookState>(initial),current=useRef(state),sequence=useRef(0),mounted=useRef(false),writing=useRef(false);current.current=state;
 const dirty=!!state.record&&!sameLabText(state.record,state.draft),busy=isBusy(state);
 const load=useCallback(async(restore=false)=>{
  if(writing.current)return;const seq=++sequence.current,before=current.current;
  setState(s=>({...s,phase:s.record?'refreshing':'loading',error:''}));
  try{
   const fresh=await apiFetch<NotebookEnvelope>(`/api/notebook?stageId=${encodeURIComponent(stageId)}`);if(!mounted.current||seq!==sequence.current)return;
   let draft:LabText={prediction:fresh.notebook.prediction,reason:fresh.notebook.reason},baseRevision=fresh.notebook.revision,localSafe=true;
   if(before.record&&before.draftKey===fresh.draftKey&&(before.conflict||!sameLabText(before.record,before.draft))){draft=before.draft;baseRevision=before.baseRevision;}
   if(restore){try{const cached=parseNotebookDraft(localStorage.getItem(fresh.draftKey));if(cached&&(stageId!=='s01'||['','ยาวขึ้น','สั้นลง','เท่าเดิม'].includes(cached.prediction))){draft={prediction:cached.prediction,reason:cached.reason};baseRevision=cached.revision;}}catch{localSafe=false;}}
   const changed=!sameLabText(draft,fresh.notebook),conflict=changed&&baseRevision!==fresh.notebook.revision;
   setState({record:fresh.notebook,draft,baseRevision:changed?baseRevision:fresh.notebook.revision,draftKey:fresh.draftKey,phase:'ready',conflict,latest:conflict?fresh.notebook:null,error:conflict?'พบข้อมูลใหม่จากอีกอุปกรณ์ ร่างในเครื่องยังอยู่ กรุณาเปรียบเทียบก่อนบันทึก':'',message:changed?'พบร่างที่ยังไม่ได้บันทึกในบัญชี':'โหลดบันทึกล่าสุดแล้ว',localSafe});
  }catch(e){if(mounted.current&&seq===sequence.current)setState(s=>({...s,phase:s.record?'ready':'load-error',error:e instanceof ApiError&&e.status===401?'กรุณาเข้าสู่ระบบด้วยบัญชีเดิมเพื่อโหลดบันทึก':'โหลดบันทึกไม่สำเร็จ ลองเชื่อมต่อแล้วโหลดอีกครั้ง ร่างในเครื่องยังไม่ถูกลบ',message:''}));}
 },[stageId]);
 useEffect(()=>{mounted.current=true;void load(true);return()=>{mounted.current=false;++sequence.current;};},[load]);
 useEffect(()=>{
  if(!state.draftKey||!state.record)return;
  try{
   if(dirty)localStorage.setItem(state.draftKey,JSON.stringify({...state.draft,revision:state.baseRevision}));else localStorage.removeItem(state.draftKey);
   setState(s=>s.localSafe?s:{...s,localSafe:true});
  }catch{setState(s=>s.localSafe?{...s,localSafe:false}:s);}
 },[state.draftKey,state.record,state.draft,state.baseRevision,dirty]);
 useEffect(()=>{if(!dirty)return;const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
 function edit(field:keyof LabText,value:string){setState(s=>isBusy(s)||!s.record?s:{...s,draft:{...s.draft,[field]:value},message:''});}
 async function save(){
  const before=current.current;if(writing.current||isBusy(before)||before.conflict||!before.record||sameLabText(before.record,before.draft))return;
  writing.current=true;const seq=++sequence.current;setState(s=>({...s,phase:'saving',error:'',message:''}));
  try{
   const saved=await apiFetch<LabNotebook>('/api/notebook',{stageId,...before.draft,revision:before.baseRevision});if(!mounted.current||seq!==sequence.current)return;
   setState(s=>({...s,record:saved,draft:{prediction:saved.prediction,reason:saved.reason},baseRevision:saved.revision,phase:'ready',conflict:false,latest:null,message:'บันทึกห้องทดลองแล้ว เปิดต่อด้วยบัญชีเดิมได้ทุกอุปกรณ์'}));
  }catch(e){
   if(!mounted.current||seq!==sequence.current)return;
   if(e instanceof ApiError&&e.status===409){
    let latest:LabNotebook|null=null;try{const fresh=await apiFetch<NotebookEnvelope>(`/api/notebook?stageId=${encodeURIComponent(stageId)}`);if(fresh.draftKey===before.draftKey)latest=fresh.notebook;}catch{/* Explicit reload remains available; never overwrite without a known revision. */}
    if(!mounted.current||seq!==sequence.current)return;
    setState(s=>({...s,phase:'ready',conflict:true,latest,error:'มีบันทึกใหม่จากอีกอุปกรณ์ ร่างนี้ยังไม่ได้บันทึก เปรียบเทียบข้อความก่อนเลือกว่าจะใช้ฉบับใด'}));
   }else setState(s=>({...s,phase:'ready',error:e instanceof ApiError&&e.status===401?'กรุณาเข้าสู่ระบบด้วยบัญชีเดิมอีกครั้ง ร่างนี้ยังไม่ได้บันทึก':'ยังบันทึกห้องทดลองไม่สำเร็จ เชื่อมต่อแล้วกดบันทึกอีกครั้ง'}));
  }finally{writing.current=false;}
 }
 function resolve(useDraft:boolean){setState(s=>s.latest?{...s,record:s.latest,draft:useDraft?s.draft:{prediction:s.latest.prediction,reason:s.latest.reason},baseRevision:s.latest.revision,conflict:false,latest:null,error:'',message:useDraft?'เก็บร่างนี้ไว้แล้ว ตรวจข้อความและกดบันทึกเพื่อแทนที่ฉบับในบัญชี':'ใช้ข้อความล่าสุดในบัญชีแล้ว'}:s);}
 return {...state,dirty,busy,editable:!!state.record&&!busy,edit,save,load:()=>load(),resolve};
}
export type LabNotebookController=ReturnType<typeof useLabNotebook>;
