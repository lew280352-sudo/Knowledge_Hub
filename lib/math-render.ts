import katex from 'katex';
import {displayFormula,normalizeFormula,stackedFractions} from './math-format.ts';
export function renderMath(formula:string,display=true):string|null{
 if(/\\(?:htmlClass|htmlId|htmlStyle|htmlData|href|url|includegraphics)\b/.test(formula))return null;
 try{return katex.renderToString(display?displayFormula(formula):stackedFractions(normalizeFormula(formula)),{throwOnError:true,strict:'ignore',trust:false,displayMode:display,output:'htmlAndMathml',maxExpand:200,maxSize:20});}
 catch{return null;}
}
