import {test,expect} from '@playwright/test';
import {stages} from '../../lib/curriculum';
test('lesson resume, accessible matching, exam, history and mobile layout',async({page})=>{
 await page.goto('/?view=home&subject=physics');
 await expect(page.getByRole('heading',{name:'เข้าใจฟิสิกส์ ทีละจังหวะ'})).toBeVisible();
 await page.locator('.stage-row').filter({hasText:'อ่านคลื่นให้เป็น'}).click();
 await expect(page.getByRole('heading',{name:'อ่านคลื่นให้เป็น',exact:true})).toBeVisible();
 await page.locator('.step-link').first().click();
 await page.getByRole('button',{name:'เข้าใจแล้ว · ถัดไป'}).click();
 await expect(page.getByRole('heading',{name:'กราฟระยะทางกับกราฟเวลาอ่านคนละค่า'})).toBeVisible();
 await expect(page.getByText('บันทึกแล้ว',{exact:false}).first()).toBeVisible();
 await page.reload();
 await expect(page.getByRole('heading',{name:'กราฟระยะทางกับกราฟเวลาอ่านคนละค่า'})).toBeVisible();
 await page.getByRole('button',{name:'เกมจับคู่',exact:true}).click();
 for(const pair of stages[0].pairs){await page.getByRole('button',{name:pair.left,exact:true}).click();await page.getByRole('button',{name:pair.right,exact:true}).click();}
 await expect(page.getByRole('heading',{name:'จับคู่ครบแล้ว'})).toBeVisible();
 await page.getByRole('button',{name:'ลองทำข้อสอบ',exact:true}).click();
 await page.getByRole('button',{name:'เริ่มทำ 5 ข้อ',exact:true}).click();
 await expect(page.getByTestId('question-prompt')).toBeVisible();
 const prompt=await page.getByTestId('question-prompt').innerText();
 await page.getByTestId('answer-choice').first().click();
 await expect(page.getByText('บันทึกคำตอบแล้ว',{exact:true})).toBeVisible();
 await page.reload();await expect(page.getByTestId('question-prompt')).toHaveText(prompt,{useInnerText:true});
 await page.getByRole('button',{name:'ส่งชุดนี้และดูเฉลย',exact:true}).click();
 await page.getByRole('button',{name:'ยืนยันส่งชุดนี้',exact:true}).click();
 await expect(page.getByRole('heading',{name:'ผลการทำข้อสอบ'})).toBeVisible();
 await expect(page.getByText('วิธีคิด', {exact:true}).first()).toBeVisible();
 await page.getByRole('button',{name:'ประวัติการสอบ',exact:true}).first().click();
 await expect(page.getByRole('heading',{name:'ประวัติการสอบ'})).toBeVisible();
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
 await expect(page.locator('#main-navigation')).toHaveAttribute('inert','');
 await page.getByRole('button',{name:'เปิดเมนู'}).click();
 await expect(page.getByRole('button',{name:'ปิดเมนู',exact:true}).last()).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('button',{name:'เปิดเมนู'})).toBeFocused();
});
test('two devices share server state, detect stale writes and recover a failed save',async({browser})=>{
 const a=await browser.newContext(),b=await browser.newContext();const p=await a.newPage(),q=await b.newPage();await p.goto('/?view=home&subject=physics');await q.goto('/?view=home&subject=physics');
 const created=await p.request.post('/api/attempts',{data:{stageId:'s01',count:5}});expect(created.ok()).toBeTruthy();const attempt=await created.json();
 await p.goto(`/?view=exam&attempt=${attempt.id}`);await q.goto(`/?view=exam&attempt=${attempt.id}`);
 await expect(p.getByTestId('answer-choice').first()).toBeVisible();await expect(q.getByTestId('answer-choice').first()).toBeVisible();
 await p.getByTestId('answer-choice').first().click();await expect(p.getByText('บันทึกคำตอบแล้ว',{exact:true})).toBeVisible();
 await q.getByTestId('answer-choice').nth(1).click();await expect(q.getByText('มีคำตอบใหม่จากอีกอุปกรณ์',{exact:true})).toBeVisible();
 await q.getByRole('button',{name:'โหลดคำตอบล่าสุด',exact:true}).click();await expect(q.getByTestId('answer-choice').first()).toHaveAttribute('aria-pressed','true');
 await p.route('**/api/attempts/*',route=>route.request().method()==='POST'?route.abort():route.continue());
 await p.getByTestId('answer-choice').nth(2).click();await expect(p.getByText('ยังบันทึกคำตอบไม่สำเร็จ',{exact:true})).toBeVisible();
 await p.unroute('**/api/attempts/*');await p.getByRole('button',{name:'บันทึกคำตอบอีกครั้ง',exact:true}).click();await expect(p.getByText('บันทึกคำตอบแล้ว',{exact:true})).toBeVisible();
 await q.reload();await expect(q.getByTestId('answer-choice').nth(2)).toHaveAttribute('aria-pressed','true');await a.close();await b.close();
});

test('API rejects missing identity and malformed bodies and never exposes active answers',async({browser})=>{
 const context=await browser.newContext();const api=context.request;
 const anonymous=await api.get('/api/state',{headers:{'oai-authenticated-user-id':'spoof','oai-authenticated-user-email':'spoof@example.com'}});expect(anonymous.status()).toBe(401);
 const page=await context.newPage();await page.goto('/?view=home&subject=physics');
 const malformed=await api.post('/api/attempts',{data:null});expect(malformed.status()).toBeGreaterThanOrEqual(400);
 const invalid=await api.post('/api/attempts',{data:{stageId:'not-a-stage',count:5}});expect(invalid.status()).toBe(400);
 const response=await api.post('/api/attempts',{data:{stageId:'s01',count:5}});expect(response.ok()).toBeTruthy();const attempt=await response.json();
 expect(attempt.questions.every((q:any)=>!('answer' in q)&&!('explanation' in q)&&!('numericAnswer' in q))).toBeTruthy();
 const cross=await api.post('/api/progress',{headers:{origin:'https://external.example'},data:{stageId:'s01',step:0,completed:[],revision:0}});expect(cross.status()).toBe(403);await context.close();
});
test('active question diagrams hide teaching calculations and preserve only givens',async({page})=>{
 await page.goto('/?view=home&subject=physics');
 const response=await page.request.post('/api/attempts',{data:{stageId:'s01',count:7}});const attempt=await response.json();
 const i=attempt.questions.findIndex((q:any)=>q.sourceId==='waves-3');expect(i).toBeGreaterThanOrEqual(0);
 await page.goto(`/?view=exam&attempt=${attempt.id}`);await page.getByRole('button',{name:`ไปข้อ ${i+1}`,exact:true}).click();
 await expect(page.locator('.physics-figure')).toBeVisible();await expect(page.locator('.physics-figure figcaption strong')).toHaveCount(0);
 const sound=await (await page.request.post('/api/attempts',{data:{stageId:'s20',count:2}})).json();const j=sound.questions.findIndex((q:any)=>q.sourceId==='sound-20');
 await page.goto(`/?view=exam&attempt=${sound.id}`);await page.getByRole('button',{name:`ไปข้อ ${j+1}`,exact:true}).click();
 await expect(page.locator('.physics-figure figcaption strong')).toHaveCount(0);await expect(page.locator('.physics-figure svg')).not.toContainText(/μ = [0-9]/);
 const standing=await (await page.request.post('/api/attempts',{data:{stageId:'s05',count:6}})).json();const item=standing.questions.find((q:any)=>q.sourceId==='waves-15');
 await page.request.post(`/api/attempts/${standing.id}`,{data:{action:'submit',revision:0}});await page.goto(`/?view=exam&attempt=${standing.id}`);
 const figure=page.locator('.physics-figure figcaption strong');await expect(figure).toContainText('f = 50 Hz');await expect(figure).toContainText(`λ = ${Number((2*item.diagram.values.length/4).toPrecision(4))} m`);

});
test('a game cannot start another round while its completed result is pending',async({page})=>{
 await page.goto('/?view=home&subject=physics');await page.goto('/?view=stage&id=s01&tab=game');let release:()=>void=()=>{};const gate=new Promise<void>(r=>{release=r;});let posts=0;
 await page.route('**/api/games',async route=>{posts++;if(posts===1)await gate;await route.continue();});
 async function matchAll(){for(const pair of stages[0].pairs){await page.getByRole('button',{name:pair.left,exact:true}).click();await page.getByRole('button',{name:pair.right,exact:true}).click();}}
 await matchAll();await expect(page.getByRole('heading',{name:'จับคู่ครบแล้ว'})).toBeVisible();await expect(page.getByRole('button',{name:'เล่นอีกรอบ',exact:true})).toBeDisabled();
 release();await expect(page.getByRole('button',{name:'เล่นอีกรอบ',exact:true})).toBeEnabled();await page.getByRole('button',{name:'เล่นอีกรอบ',exact:true}).click();await matchAll();await expect(page.getByRole('button',{name:'เล่นอีกรอบ',exact:true})).toBeEnabled();expect(posts).toBe(2);
});
test('negative focal lengths show the corresponding diverging lens and convex mirror',async({page})=>{
 await page.goto('/?view=home&subject=physics');await page.goto('/?view=stage&id=s13&tab=learn');const range=page.getByLabel('โฟกัส f',{exact:true});await range.focus();await range.press('Home');
 await expect(page.locator('.physics-figure figcaption strong')).toContainText('เลนส์เว้า');
 const filled=await page.locator('path[aria-label="เลนส์เว้า"]').evaluate((el:SVGPathElement)=>el.isPointInFill(new DOMPoint(330,160)));expect(filled).toBeFalsy();
 await page.goto('/?view=stage&id=s14&tab=learn');await page.getByLabel('โฟกัส f',{exact:true}).focus();await page.getByLabel('โฟกัส f',{exact:true}).press('Home');
 await expect(page.locator('path[aria-label="กระจกนูน"]')).toBeAttached();
});

test('sign-in preserves a direct stage link on a fresh device',async({page})=>{
 await page.goto('/?view=stage&id=s20&tab=learn');await expect(page.getByRole('heading',{name:'ตามหลังกรวยเสียง',exact:true})).toBeVisible();
});
