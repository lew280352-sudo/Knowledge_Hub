import katex from 'katex';
export function MathFormula({formula}:{formula:string}){return <div className="math-formula" role="math" aria-label={formula} dangerouslySetInnerHTML={{__html:katex.renderToString(formula,{throwOnError:false,strict:'ignore',trust:false,displayMode:true,output:'htmlAndMathml'})}}/>;}
