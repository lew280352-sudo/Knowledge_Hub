'use client';
import { useCallback,useEffect,useRef,useState } from 'react';
import type { LearningState } from '../question-types';
export class ApiError extends Error{status:number;constructor(message:string,status:number){super(message);this.status=status;}}
export async function apiFetch<T>(path:string,data?:unknown):Promise<T>{
 const response=await fetch(path,{method:data===undefined?'GET':'POST',headers:data===undefined?undefined:{'Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data),cache:'no-store'});
 const value=await response.json() as T & {error?:string};if(!response.ok)throw new ApiError(value.error??'server_error',response.status);return value;
}
export type SyncStatus='loading'|'saved'|'saving'|'offline'|'error';
export type State=LearningState&{bestScores:Record<string,number>;stats:{games:number;submittedAttempts:number}};
export function useLearningState(){
 const [state,setState]=useState<State|null>(null),[status,setStatus]=useState<SyncStatus>('loading'),[error,setError]=useState(''),[lastSaved,setLastSaved]=useState<Date|null>(null);const sequence=useRef(0);
 const refresh=useCallback(async()=>{const seq=++sequence.current;try{const next=await apiFetch<State>('/api/state');if(seq!==sequence.current)return;setState(next);setError('');setStatus('saved');setLastSaved(new Date());}catch(e){if(seq!==sequence.current)return;setError(e instanceof ApiError&&e.status===401?'กรุณาเข้าสู่ระบบด้วยบัญชีเดิมอีกครั้ง':'เชื่อมต่อไม่สำเร็จ ข้อมูลที่บันทึกแล้วจะยังอยู่');setStatus(navigator.onLine?'error':'offline');}},[]);
 const perform=useCallback(async<T,>(path:string,data:unknown):Promise<T>=>{++sequence.current;setStatus('saving');try{const value=await apiFetch<T>(path,data);setStatus('saved');setLastSaved(new Date());setError('');return value;}catch(e){setStatus(navigator.onLine?'error':'offline');throw e;}},[]);
 useEffect(()=>{void refresh();const online=()=>void refresh(),offline=()=>setStatus('offline');const focus=()=>{if(document.visibilityState==='visible')void refresh();};window.addEventListener('online',online);window.addEventListener('offline',offline);document.addEventListener('visibilitychange',focus);window.addEventListener('focus',online);return()=>{window.removeEventListener('online',online);window.removeEventListener('offline',offline);window.removeEventListener('focus',online);document.removeEventListener('visibilitychange',focus);};},[refresh]);
 return {state,status,setStatus,error,lastSaved,refresh,perform};
}
