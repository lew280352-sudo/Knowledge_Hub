import {equationParts} from '../lib/math-prose';
import {renderMath} from '../lib/math-render';
export function MathFormula({formula}:{formula:string}){
 if(!formula.trim())return null;
 const html=renderMath(formula);
 if(html===null)return <p className="math-unavailable" role="status">แสดงสมการนี้ไม่ได้ ลองดูวิธีคิดหรือเอกสารประกอบ</p>;
 return <div className="math-formula" role="group" tabIndex={0} aria-label="สมการ เลื่อนซ้ายหรือขวาเพื่ออ่านให้ครบ" dangerouslySetInnerHTML={{__html:html}}/>;
}
/** Explicit math boundaries keep ordinary Thai text and units unchanged. */
export function MathText({text}:{text:string}){
 const parts=text.split(/(\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\])/g);
 return <>{parts.map((part,index)=>{
  const display=part.startsWith('\\['),inline=part.startsWith('\\(');
  if(!display&&!inline)return equationParts(part).map((piece,i)=>{const html=piece.formula?renderMath(piece.formula,false):null;return html?<span key={`${index}-${i}`} className="math-inline" dangerouslySetInnerHTML={{__html:html}}/>:piece.text;});
  const html=renderMath(part.slice(2,-2),display);
  if(html===null)return <span key={index} role="status">(แสดงสมการไม่ได้)</span>;
  return <span key={index} className={display?'math-formula math-text-display':'math-inline'} dangerouslySetInnerHTML={{__html:html}}/>;
 })}</>;
}
