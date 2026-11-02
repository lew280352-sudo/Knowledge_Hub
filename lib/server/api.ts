import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../app/chatgpt-auth';
import { createStore, StoreError } from './store';
export async function body(request:Request){
 if(!request.headers.get('content-type')?.includes('application/json'))throw new StoreError('invalid_content_type',415);
 if(Number(request.headers.get('content-length')??0)>100000)throw new StoreError('request_too_large',413);
 const text=await request.text();if(text.length>100000)throw new StoreError('request_too_large',413);
 try{const parsed=JSON.parse(text);if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error();return parsed;}catch{throw new StoreError('invalid_json');}
}
export async function api(request:Request,work:(user:{userId:string;displayName:string},store:ReturnType<typeof createStore>)=>Promise<unknown>){
 try{
  const user=await getChatGPTUser();if(!user)throw new StoreError('unauthorized',401);
  if(request.method!=='GET'){
   const origin=request.headers.get('origin');
   if((origin&&origin!==new URL(request.url).origin)||request.headers.get('sec-fetch-site')==='cross-site')throw new StoreError('forbidden_origin',403);
  }
  if(!env.DB)throw new StoreError('database_unavailable',503);
  return Response.json(await work(user,createStore(env.DB)),{headers:{'Cache-Control':'private, no-store'}});
 }catch(error){
  const status=error instanceof StoreError?error.status:500;
  if(status===500)console.error('Physics API error',error);
  return Response.json({error:error instanceof StoreError?error.message:'server_error'},{status,headers:{'Cache-Control':'private, no-store'}});
 }
}
