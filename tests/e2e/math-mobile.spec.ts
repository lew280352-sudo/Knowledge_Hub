import {test,expect} from '@playwright/test';
test('all formula cards and legacy solutions render correctly on touch-sized screens',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true}),page=await context.newPage();
 await page.goto('/?view=home&subject=physics');await expect(page.getByRole('heading',{name:'เข้าใจฟิสิกส์ ทีละจังหวะ'})).toBeVisible();await page.getByRole('button',{name:'เปิดเมนู',exact:true}).tap();await expect(page.getByRole('button',{name:'เปิดเมนู',exact:true})).toHaveAttribute('aria-expanded','true');await page.getByRole('button',{name:'สมุดสูตร',exact:true}).tap();
 await expect(page.locator('.formula-entry')).toHaveCount(20);await page.evaluate(()=>document.fonts.ready);
 await expect(page.locator('.katex-error')).toHaveCount(0);
 const visibleMath=await page.locator('.math-formula .katex-html').allTextContents();expect(visibleMath.join(' ')).not.toMatch(/quad|lambdaquad/);
 for(const width of [320,360,390,430,844]){
  await page.setViewportSize({width,height:width===844?390:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  for(const formula of await page.locator('.math-formula').all())expect((await formula.boundingBox())!.width).toBeLessThanOrEqual(width);
 }
 await page.setViewportSize({width:320,height:844});const wideIndex=await page.locator('.math-formula').evaluateAll(nodes=>nodes.findIndex(el=>el.scrollWidth>el.clientWidth));
 if(wideIndex>=0){const wide=page.locator('.math-formula').nth(wideIndex);await wide.focus();await wide.press('ArrowRight');await expect.poll(()=>wide.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);}
 await page.goto('/?view=stage&id=s11&tab=learn');await page.locator('.step-link').first().tap();expect((await page.locator('.lesson-content .katex-html').allTextContents()).join(' ')).not.toContain('quad');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 const active=await (await page.request.post('/api/attempts',{data:{stageId:'s20',count:1}})).json();await page.request.post(`/api/attempts/${active.id}`,{data:{action:'submit',revision:0}});const saved=await (await page.request.get(`/api/attempts/${active.id}`)).json();
 // A test-only old snapshot reproduces the reported legacy typo; no stored record is rewritten.
 const legacy={...saved,questions:saved.questions.map((q:any)=>({...q,formula:'M=v_S/v,quad\\sin\\mu=1/M',page:57}))};await page.route(`**/api/attempts/${active.id}`,route=>route.fulfill({json:legacy}));
 await page.goto(`/?view=exam&attempt=${active.id}`);await expect(page.getByRole('heading',{name:'ผลการทำข้อสอบ',exact:true})).toBeVisible();await expect(page.locator('.math-formula .katex-html')).not.toContainText('quad');
 await expect(page.locator('.review-footer .source-link')).toHaveAttribute('href',/page=55$/);
 await page.unroute(`**/api/attempts/${active.id}`);expect(await (await page.request.get(`/api/attempts/${active.id}`)).json()).toEqual(saved);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await context.close();
});

test('worked calculations show stacked fractions and aligned steps; invalid snapshots show readable fallback',async({page})=>{
 await page.goto('/?view=stage&id=s01&tab=learn');
 const pref=await(await page.request.get('/api/preferences')).json();
 await page.request.post('/api/preferences',{data:{...pref,difficulty:'standard',onboardingCompleted:true}});
 await page.reload();await page.locator('.step-link').nth(2).click();
 await page.locator('.worked-example summary').last().click();
 await expect(page.locator('.worked-example .mfrac').first()).toBeVisible();
 await expect(page.locator('.worked-example .mtable').first()).toBeVisible();
 await expect(page.locator('.worked-example math').first()).toBeAttached();
 await page.setViewportSize({width:320,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 const active=await(await page.request.post('/api/attempts',{data:{stageId:'s01',count:1}})).json();
 await page.request.post(`/api/attempts/${active.id}`,{data:{action:'submit',revision:0}});
 const saved=await(await page.request.get(`/api/attempts/${active.id}`)).json();
 await page.route(`**/api/attempts/${active.id}`,route=>route.fulfill({json:{...saved,questions:saved.questions.map((q:Record<string,unknown>)=>({...q,formula:String.raw`\unsupportedCommand{private-source}`}))}}));
 await page.goto(`/?view=exam&attempt=${active.id}`);
 await expect(page.locator('.math-unavailable')).toContainText('แสดงสมการนี้ไม่ได้');
 await expect(page.locator('.katex-error')).toHaveCount(0);
 await expect(page.locator('.review-list')).not.toContainText('unsupportedCommand');
});
