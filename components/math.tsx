import katex from 'katex';
import {normalizeFormula} from '../lib/math-format';
export function MathFormula({formula}:{formula:string}){
 const displayFormula=normalizeFormula(formula);
 return <div className="math-formula" role="math" tabIndex={0} aria-label={displayFormula} dangerouslySetInnerHTML={{__html:katex.renderToString(displayFormula,{throwOnError:false,strict:'ignore',trust:false,displayMode:true,output:'htmlAndMathml'})}}/>;
}
