import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
let server;
try{await fetch('http://127.0.0.1:5173/',{redirect:'manual'});}catch{server=spawn('npm',['run','dev','--','--port','5173'],{stdio:'ignore',detached:true});for(let i=0;i<120;i++){try{await fetch('http://127.0.0.1:5173/',{redirect:'manual'});break;}catch{await new Promise(r=>setTimeout(r,500));}}}
process.on('exit',()=>{if(server?.pid)try{process.kill(-server.pid,'SIGTERM');}catch{}});
const browser=await chromium.launch();const context=await browser.newContext();const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173/');await page.getByRole('heading',{name:'เข้าใจฟิสิกส์ ทีละจังหวะ'}).waitFor();
for(const [name,width,height] of [['desktop',1440,1100],['tablet',820,1180],['mobile',390,844]]){await page.setViewportSize({width,height});await page.waitForTimeout(300);await page.screenshot({path:`outputs/qa/home-${name}.png`,fullPage:true});if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))errors.push(`Home overflow ${width}`);}
await page.setViewportSize({width:1440,height:1100});
for(const [id,name] of [['s04','refraction'],['s08','slits'],['s13','lens'],['s20','shock']]){await page.goto(`http://127.0.0.1:5173/?view=stage&id=${id}&tab=learn`);await page.locator('.physics-figure').waitFor();await page.screenshot({path:`outputs/qa/lesson-${name}.png`,fullPage:true});await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))errors.push(`${id} mobile overflow`);await page.screenshot({path:`outputs/qa/lesson-${name}-mobile.png`,fullPage:true});await page.setViewportSize({width:1440,height:1100});}
await page.goto('http://127.0.0.1:5173/?view=stage&id=s01&tab=game');await page.getByRole('heading',{name:'จับคู่ให้เข้าใจ'}).waitFor();await page.screenshot({path:'outputs/qa/matching.png',fullPage:true});
console.log(JSON.stringify({pageErrors:errors}));await browser.close();if(errors.length)process.exitCode=1;
