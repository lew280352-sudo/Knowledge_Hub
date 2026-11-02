import { api,body } from '../../../lib/server/api';
export function POST(request:Request){return api(request,async(user,store)=>store.createAttempt(user.userId,await body(request)));}
