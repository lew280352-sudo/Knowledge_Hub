/** Recognize plain equation runs only; prose, units and inequality-only text stay intact. */
const letters='A-Za-zα-ωΑ-Ω';
const sub='₀₁₂₃₄₅₆₇₈₉';
const expression=new RegExp(`([${letters}][${letters}0-9${sub}]*(?:/[${letters}0-9${sub}]+)?\\s*(?:=|≈)\\s*[-+−0-9${letters}${sub}⁰¹²³⁴⁵⁶⁷⁸⁹⁻√∞°×·/().,{}|=≈ \\t]+)`,'g');
const greek:Record<string,string>={'λ':'lambda','θ':'theta','α':'alpha','β':'beta','φ':'phi','μ':'mu','ω':'omega','π':'pi','Δ':'Delta'};
export function proseToLatex(value:string):string{
 return value.trim()
  .replace(/([A-Za-zα-ωΑ-Ω])([₀-₉]+)/g,(_,name:string,digits:string)=>`${name}_{${[...digits].map(d=>sub.indexOf(d)).join('')}}`)
  .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g,chars=>`^{${[...chars].map(c=>c==='⁻'?'-':'⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join('')}}`)
  .replace(/[λθαβφμωπΔ]/g,char=>`\\${greek[char]} `)
  .replace(/√\(([^()]*)\)/g,'\\sqrt{$1}').replace(/√([0-9]+(?:\.[0-9]+)?)/g,'\\sqrt{$1}')
  .replace(/\b(?:cm\/s|m\/s|rad\/m|rad\/s|W|Hz|nm|mm|cm|ms|s|m)\b(?!\s*=)/g,unit=>`\\,\\mathrm{${unit}}`)
  .replace(/×|·/g,'\\cdot ').replace(/−/g,'-').replace(/≈/g,'\\approx ').replace(/∞/g,'\\infty ').replace(/°/g,'{}^\\circ');
}
export function equationParts(text:string):{text:string;formula?:string}[]{
 const result:{text:string;formula?:string}[]=[];let start=0;
 for(const match of text.matchAll(expression)){
  const index=match.index!;result.push({text:text.slice(start,index)});
  const equation=match[0].trimEnd().replace(/[.,]+$/,'');
  const balanced=(equation.match(/\(/g)?.length??0)===(equation.match(/\)/g)?.length??0);
  result.push({text:equation,...(balanced?{formula:proseToLatex(equation)}:{})});start=index+equation.length;
 }
 result.push({text:text.slice(start)});return result;
}
