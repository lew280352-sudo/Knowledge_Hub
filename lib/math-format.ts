/** Presentation-only repair for legacy formula snapshots. Never rewrites saved data. */
export function normalizeFormula(formula:string):string{
 return formula
  .replace(/\\lambdaquad\b/g,String.raw`\lambda\quad`)
  .replace(/(^|[,}])quad(?=\s|\\|\()/g,(_,prefix:string)=>prefix+String.raw`\quad`)
  .replace(/,;/g,String.raw`,\;`);
}
