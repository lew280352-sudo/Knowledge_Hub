import { api,body } from '../../../../lib/server/api';
import { StoreError } from '../../../../lib/server/store';
type Context={params:Promise<{id:string}>};
export async function GET(request:Request,context:Context){const {id}=await context.params;return api(request,(user,store)=>store.getAttempt(user.userId,id));}
export async function POST(request:Request,context:Context){const {id}=await context.params;return api(request,async(user,store)=>{const input=await body(request);if(input.action==='save')return store.updateAttempt(user.userId,id,input);if(input.action==='submit')return store.submitAttempt(user.userId,id,input.revision);throw new StoreError('invalid_action');});}
