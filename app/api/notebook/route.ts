import {api,body} from '../../../lib/server/api';
export const dynamic='force-dynamic';
export function GET(request:Request){return api(request,async(user,store)=>{
 const notebook=await store.readNotebook(user.userId,new URL(request.url).searchParams.get('stageId')??'');
 // Local drafts are selected only after authenticated loading, never by display name.
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(['physic-lab-v1',user.userId,notebook.stageId])));
 const scope=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
 return {notebook,draftKey:`physic-lab-${scope}`};
});}
export function POST(request:Request){return api(request,async(user,store)=>store.saveNotebook(user.userId,await body(request)));}
