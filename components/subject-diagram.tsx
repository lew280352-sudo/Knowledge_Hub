import type {Stage} from '../lib/question-types';
import {aiFlow} from '../lib/ai-curriculum';
import {lessonDiagram,PhysicsDiagram} from './physics-diagram';
export function SubjectDiagram({stage,interactive=false}:{stage:Stage;interactive?:boolean}){
 if(stage.diagram!=='ai')return <PhysicsDiagram diagram={{...lessonDiagram(stage.diagram,stage.number),caption:stage.description}} interactive={interactive}/>;
 return <figure className="ai-flow" aria-label={stage.description}><figcaption>{stage.title}</figcaption><ol>{aiFlow(stage.id).map((text,i)=><li key={text}><span>{i+1}</span><strong>{text}</strong></li>)}</ol><p>ลองอธิบายความสัมพันธ์แต่ละขั้นด้วยคำของตัวเอง</p></figure>;
}
