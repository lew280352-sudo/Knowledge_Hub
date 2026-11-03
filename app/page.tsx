import {requireChatGPTUser} from './chatgpt-auth';
import {LearningApp} from '../components/learning-app';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const query=await searchParams;const params=new URLSearchParams();
 for(const key of ['view','subject','id','tab','attempt'])if(typeof query[key]==='string')params.set(key,query[key]);
 await requireChatGPTUser(params.size?'/?'+params.toString():'/');return <LearningApp/>;
}
