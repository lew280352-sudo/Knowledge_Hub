import {api,body} from '../../../lib/server/api';
export const dynamic='force-dynamic';
export function GET(request:Request){return api(request,(user,store)=>store.readPreferences(user.userId));}
export function POST(request:Request){return api(request,async(user,store)=>store.savePreferences(user.userId,await body(request)));}
