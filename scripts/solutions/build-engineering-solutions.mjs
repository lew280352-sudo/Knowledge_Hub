import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import katex from 'katex';
import {chromium} from 'playwright';
import {displayFormula} from '../../lib/math-format.ts';
const dir=path.resolve('docs/solutions'),data=JSON.parse(fs.readFileSync(path.join(dir,'engineering-physics-solutions.json'),'utf8'));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const math=s=>`<div class="equation">${katex.renderToString(displayFormula(s.replaceAll(',\\qquad',',\\quad').replaceAll('\\Rightarrow',',\\quad\\Rightarrow')),{displayMode:true,throwOnError:true,trust:false,strict:'ignore',output:'htmlAndMathml'})}</div>`;
const flag=s=>({checked:'ตรวจจากโจทย์และรูป',convention:'ต้องระบุธรรมเนียม',conditional:'คำตอบมีเงื่อนไข',ambiguous:'ข้อความต้นฉบับไม่ครบ',model:'ตามแบบจำลอง/ตัวเลือก'}[s]);
const choice=s=>s.choice?`ตัวเลือก ${s.choice}${['conditional','ambiguous','convention'].includes(s.status)?' *':''}`:'ยังระบุไม่ได้';
let katexCSS=fs.readFileSync('node_modules/katex/dist/katex.min.css','utf8').replace(/url\(([^)]+)\)/g,(all,relative)=>{
 const file=path.resolve('node_modules/katex/dist',relative.replaceAll('"','').replaceAll("'",''));
 return fs.existsSync(file)?`url(data:font/${path.extname(file).slice(1)};base64,${fs.readFileSync(file).toString('base64')})`:all;
});
const fonts=[0,3].map((i,index)=>`@font-face{font-family:PlexThai;font-weight:${index?700:400};src:url(data:font/ttf;base64,${fs.readFileSync(`public/fonts/plex-thai-${i}.ttf`).toString('base64')})}`).join('');
const intro=`<p>จัดทำวันที่ 4 พฤศจิกายน 2026 • เฉลยโจทย์ตาม PDF ต้นฉบับ 70 ข้อ และตัวอย่าง Ex หน้า 2</p><p><strong>เลขหน้าในเอกสารนี้ใช้ PDF 58 หน้าตามตัวแสดงไฟล์และ /Count ของต้นฉบับ</strong> ไม่ใช้เลขหน้าจากตัวอ่านข้อความที่อ่านได้เพียง 56 หน้า</p><p>เลขตัวเลือกอ้างอิงจากรูป PDF จริง วิธีทำนี้จัดทำขึ้นใหม่ ไม่ใช่เฉลยทางการของผู้สอน โจทย์บนเว็บบางข้อเป็นโจทย์ดัดแปลงจึงนำคำตอบมาแทนกันไม่ได้</p><p class="note">จุดที่ต้องอ่านหมายเหตุ: คลื่นข้อ 6 ต้องระบุรูปไซน์/โคไซน์, แสงเชิงคลื่นข้อ 7 ไม่ระบุลำดับแถบมืด, เสียงข้อ 18 มีข้อความช่อง ค พิมพ์ไม่ครบหรือผิดคำ คำตอบมีเงื่อนไขกำกับไว้ ไม่ได้แก้ข้อความต้นฉบับให้เอง</p>`;
const bodyWork=work=>work.map(w=>w.math?math(w.math):`<p>${esc(w.text)}</p>`).join('');
const img=name=>`<figure><img alt="แผนภาพประกอบวิธีทำ" src="data:image/svg+xml;base64,${fs.readFileSync(path.join(dir,name)).toString('base64')}"/></figure>`;
let body=`<header><h1>${esc(data.title)}</h1>${intro}</header><h2>ตารางคำตอบย่อ</h2>`;
let md=`# ${data.title}\n\nวันที่ 4 พฤศจิกายน 2026 • โจทย์หลัก 70 ข้อ + ตัวอย่าง Ex หน้า 2\n\nต้นฉบับ: ${data.source}\n\n**อ้างเลขหน้า PDF 58 หน้าตามตัวแสดงไฟล์ ไม่ใช่ตัวอ่านข้อความที่อ่านได้ 56 หน้า**\n\nเฉลยนี้จัดทำใหม่ ไม่ใช่เฉลยทางการของผู้สอน และไม่ใช้คำตอบโจทย์ดัดแปลงบนเว็บมาแทนต้นฉบับ\n\nข้อที่ต้องอ่านหมายเหตุ: คลื่น 6 (ธรรมเนียมเฟส), แสงเชิงคลื่น 7 (ไม่ระบุลำดับมืด), เสียง 18 (ข้อความตารางไม่สมบูรณ์)\n\n`;
for(const [chapter,title] of Object.entries(data.chapters)){
 body+=`<h3>${esc(title)}</h3><table><thead><tr><th>ข้อ</th><th>หน้า PDF</th><th>ตัวเลือก</th><th>คำตอบ</th></tr></thead><tbody>`;
 md+=`## ตารางคำตอบ — ${title}\n\n| ข้อ | หน้า PDF | ตัวเลือก | คำตอบ |\n| --- | --- | --- | --- |\n`;
 for(const row of data.solutions.filter(s=>s.chapter===chapter)){
  body+=`<tr><td><a href="#${row.id}">${row.number}</a></td><td>${row.page}</td><td>${choice(row)}</td><td>${esc(row.answer)}</td></tr>`;
  md+=`| ${row.number} | ${row.page} | ${choice(row)} | ${row.answer} |\n`;
 }
 body+='</tbody></table>';md+='\n';
}
for(const [chapter,title] of Object.entries(data.chapters)){
 body+=`<section class="chapter"><h2>${esc(title)} — วิธีทำ</h2>`;md+=`## ${title} — วิธีทำ\n\n`;
 for(const row of data.solutions.filter(s=>s.chapter===chapter)){
  body+=`<article id="${row.id}"><h3>ข้อ ${row.number} · ${esc(row.title)}</h3><p class="meta">หน้า PDF ${row.page} · ${flag(row.status)}</p><p class="answer"><strong>${choice(row)} — ${esc(row.answer)}</strong></p>${bodyWork(row.work)}`;
  md+=`### ข้อ ${row.number} — ${row.title} (PDF หน้า ${row.page})\n\n**${choice(row)} — ${row.answer}**\n\n`;
  for(const w of row.work)md+=w.math?`$$\n${w.math}\n$$\n\n`:`${w.text}\n\n`;
  if(row.note){body+=`<p class="note"><strong>หมายเหตุ:</strong> ${esc(row.note)}</p>`;md+=`> หมายเหตุ: ${row.note}\n\n`;}
  if(row.id==='waves-10'){body+=img('fixed-end-reflection.svg');md+='![การซ้อนคลื่นตกกระทบและสะท้อน](fixed-end-reflection.svg)\n\n';}
  body+='</article>';
 }
 body+='</section>';
}
body+=`<section class="chapter"><h2>ตัวอย่าง Ex หน้า 2 — วาดรูปผลรวมคลื่น</h2>${bodyWork(data.bonus.work)}${img('pulse-superposition.svg')}</section>`;
md+='## ตัวอย่าง Ex หน้า 2 — วาดรูปผลรวมคลื่น\n\n';for(const w of data.bonus.work)md+=w.math?`$$\n${w.math}\n$$\n\n`:`${w.text}\n\n`;md+='![รูปคลื่นหลังเลื่อนและผลรวม](pulse-superposition.svg)\n\n';
const evidence=`<h2>การตรวจสอบและแหล่งอ้างอิง</h2><p>ตรวจภาพ กราฟ ตาราง และตัวเลือกจากต้นฉบับ พร้อมตรวจตัวเลขอิสระ 61 รายการใน scripts/solutions/validate-engineering-solutions.py การตรวจสมการเชิงตัวเลขไม่ใช่การรับรองสมมติฐานทางฟิสิกส์ทั้งหมด</p><p>เอกสารต้นฉบับ SHA-256: <span class="hash">${data.source_sha256}</span></p><ul><li><a href="https://openstax.org/books/university-physics-volume-3/pages/2-3-images-formed-by-refraction">OpenStax: การเกิดภาพและความลึกปรากฏจากการหักเห</a></li><li><a href="https://openstax.org/books/university-physics-volume-1/pages/17-8-shock-waves">OpenStax: คลื่นกระแทกและมุมมัค</a></li></ul>`;
body+=evidence;md+='## การตรวจสอบ\n\nตรวจรูป กราฟ และตัวเลือกจาก PDF ต้นฉบับ พร้อมตรวจตัวเลขด้วย `scripts/solutions/validate-engineering-solutions.py`\n\nต้นฉบับ SHA-256: `'+data.source_sha256+'`\n\nอ้างหลักการเพิ่มเติม: [OpenStax เรื่องความลึกปรากฏ](https://openstax.org/books/university-physics-volume-3/pages/2-3-images-formed-by-refraction) และ [คลื่นกระแทก](https://openstax.org/books/university-physics-volume-1/pages/17-8-shock-waves)\n';
const html=`<!doctype html><html lang="th"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(data.title)}</title><style>${fonts}${katexCSS}
*{box-sizing:border-box}body{font-family:PlexThai,sans-serif;font-size:16px;line-height:1.85;color:#1d3039;background:#fff;max-width:960px;margin:36px auto;padding:0 24px}h1{font-size:28px;line-height:1.5}h2{font-size:23px;margin-top:32px}h3{font-size:19px;line-height:1.6}table{border-collapse:collapse;width:100%;font-size:14px}td,th{border:1px solid #ccd5da;padding:7px 9px;text-align:left;vertical-align:top}th{background:#ecf2f4}.meta{color:#52666f;font-size:13px}.answer{border-left:4px solid #087f8c;background:#eef6f6;padding:10px 14px}.note{border-left:3px solid #b97720;background:#fff7e8;padding:10px 14px}.equation{max-width:100%;overflow-x:auto;padding:6px 0;font-size:1em}.katex-display{text-align:left;margin:8px 0}.katex-display>.katex{text-align:left}article{margin:26px 0;padding-bottom:18px;border-bottom:1px solid #dce3e6}p{margin:9px 0}.hash{overflow-wrap:anywhere;font-size:11px}figure{margin:15px 0}img{max-width:100%;height:auto}@page{size:A4;margin:15mm 16mm 17mm}@media print{body{max-width:none;margin:0;padding:0;font-size:12px;line-height:1.65}h1{font-size:22px}h2{font-size:19px}h3{font-size:15px}table{font-size:10px}td,th{padding:4px 6px}.meta{font-size:10px}.chapter{break-before:page}article{break-inside:avoid;margin:15px 0;padding-bottom:10px}figure{break-inside:avoid}.equation{overflow:visible;font-size:12px}.note{font-size:11px}.katex-display{margin:5px 0}a{color:inherit;text-decoration:none}thead{display:table-header-group}tr{break-inside:avoid}img{max-height:230px}}</style>${body}</html>`;
fs.writeFileSync(path.join(dir,'engineering-physics-solutions.md'),md);fs.writeFileSync(path.join(dir,'engineering-physics-solutions.html'),html);
const browser=await chromium.launch();const page=await browser.newPage();
await page.goto(pathToFileURL(path.join(dir,'engineering-physics-solutions.html')).href);await page.evaluate(()=>document.fonts.ready);
if(await page.locator('.katex-error').count())throw new Error('Invalid math rendering');
const overflow=await page.locator('.equation').evaluateAll(nodes=>nodes.filter(n=>n.scrollWidth>n.clientWidth+2).map(n=>n.textContent.slice(0,100)));
console.log('Equation overflow before print:',JSON.stringify(overflow));
await page.emulateMedia({media:'print'});
await page.pdf({path:path.join(dir,'เฉลยพร้อมวิธีทำ-ฟิสิกส์วิศวกรรม-อแยมโร.pdf'),format:'A4',printBackground:true,displayHeaderFooter:true,headerTemplate:'<span></span>',footerTemplate:'<div style="width:100%;font-size:9px;text-align:center;color:#666">Knowledge Hub · <span class="pageNumber"></span> / <span class="totalPages"></span></div>',preferCSSPageSize:true});
await page.screenshot({path:path.resolve('outputs/engineering-solutions-preview.png'),fullPage:false});await browser.close();
console.log('Generated Markdown, standalone HTML and PDF:',data.solutions.length,'solutions');
