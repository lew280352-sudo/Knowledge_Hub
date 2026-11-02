import { api } from '../../../lib/server/api';
export const dynamic='force-dynamic';
export function GET(request:Request){return api(request,async(user,store)=>({...await store.readState(user.userId),displayName:user.displayName}));}
