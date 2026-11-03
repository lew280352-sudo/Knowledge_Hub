/** Presentation-only repairs. Stored questions, answers and scores stay unchanged. */
export function normalizeFormula(formula:string):string{
 return formula
  .replace(/\\lambdaquad\b/g,String.raw`\lambda\quad`)
  .replace(/(^|[,}])quad(?=\s|\\|\()/g,(_,prefix:string)=>prefix+String.raw`\quad`)
  .replace(/,;/g,String.raw`,\;`);
}

/** Convert slash division in authored formula fields; groups retain their meaning.
 * Text and upright unit groups are opaque, so \mathrm{m/s} remains a unit.
 * a/b/c is left-associative; sums require the author's existing parentheses.
 */
export function stackedFractions(input:string):string{
 let index=0;
 function group(end?:string):string{
  const segments:string[]=[];let segment='';let closed=!end;
  const flush=()=>{if(segment){const parts=segment.split('\u0000');let result=parts.shift()!;for(const denominator of parts)result=`\\frac{${result.trim()}}{${denominator.trim()}}`;segments.push(result);segment='';}};
  while(index<input.length){
   const char=input[index];if(char===end){index++;closed=true;break;}
   if(char==='\\'){
    const command=input.slice(index).match(/^\\(?:[a-zA-Z]+|.)/)![0];index+=command.length;
    if(['\\text','\\mathrm','\\operatorname'].includes(command)&&input[index]==='{'){
     const start=index;let depth=0;do{if(input[index]==='{')depth++;if(input[index]==='}')depth--;index++;}while(index<input.length&&depth>0);segment+=command+input.slice(start,index);continue;
    }
    if(['\\quad','\\qquad','\\;','\\,','\\pm','\\approx','\\le','\\ge','\\cdot','\\times','\\subset','\\supset','\\\\'].includes(command)){flush();segments.push(command);}else segment+=command;
   }else if(char==='{'||char==='('||char==='['){index++;const end=char==='{'?'}':char==='('?')':']';segment+=char+group(end)+end;
   }else if('=+-,<>*'.includes(char)){index++;flush();segments.push(char);
   }else{index++;segment+=char==='/'?'\u0000':char;}
  }
  if(!closed)throw new Error('Unbalanced formula');
  flush();return segments.join('');
 }
 return group();
}

/** Display equations and multi-step equalities share one strict KaTeX path. */
export function displayFormula(formula:string):string{
 const prepared=stackedFractions(normalizeFormula(formula));
 if(/\\begin\{/.test(prepared))return prepared;
 const equations=prepared.split(/,\\(?:quad|;)\s*/);
 const rows=equations.flatMap(equation=>{
  const parts=equation.split('=');
  return parts.length>1?parts.slice(1).map((part,i)=>`${i===0?parts[0]:''}&=${part}`):[equation];
 });
 return rows.length>1?`\\begin{aligned}${rows.join('\\\\')}\\end{aligned}`:prepared;
}
