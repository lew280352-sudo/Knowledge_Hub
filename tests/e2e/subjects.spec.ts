import {test,expect} from '@playwright/test';
test('catalog opens AI, preserves subject navigation and supports lesson, game and exam',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'ทุกวิชา เริ่มที่ความเข้าใจ'})).toBeVisible();
 for(const width of [360,1440]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();}
 await page.locator('.subject-card').first().getByRole('button').click();
 await expect(page.getByRole('heading',{name:'เข้าใจปัญญาประดิษฐ์ ทีละจังหวะ'})).toBeVisible();
 await expect(page.locator('.stage-row')).toHaveCount(5);
 await page.locator('.stage-row').first().click();
 await expect(page.locator('.lesson-content')).toContainText('AI ทำงานที่ต้องใช้ความสามารถทางปัญญา');
 await expect(page.locator('.source-link')).toHaveAttribute('href',/references\/ai-01.pdf/);
 await page.getByRole('button',{name:'เกมจับคู่',exact:true}).click();
 const left=page.locator('.match-grid > div').first(),right=page.locator('.match-grid > div').last();
 const answers=['ขอบเขตกว้างของระบบที่ทำงานทางปัญญา','เรียนรู้รูปแบบจากข้อมูล','ใช้โครงข่ายประสาทเทียมหลายชั้น','สิ่งที่ใช้ทำนายจากรูปแบบที่เรียนรู้'];
 for(let i=0;i<4;i++){await left.getByRole('button').nth(i).click();await right.getByRole('button',{name:answers[i],exact:true}).click();}
 await expect(page.locator('.game-complete')).toContainText('บันทึกผลแล้ว');
 await page.getByRole('button',{name:'ลองทำข้อสอบ',exact:true}).click();
 await page.getByRole('button',{name:'เริ่มทำ 3 ข้อ'}).click();
 await expect(page.getByTestId('question-prompt')).toBeVisible();
 await page.getByTestId('answer-choice').first().click();
 await page.getByRole('button',{name:'ส่งชุดนี้และดูเฉลย',exact:true}).click();
 await page.getByRole('button',{name:'ยืนยันส่งชุดนี้'}).click();
 await expect(page.getByRole('heading',{name:'ผลการทำข้อสอบ'})).toBeVisible();
 await expect(page.locator('.review-footer a').first()).toHaveAttribute('href',/references\/ai-01.pdf/);
 await page.getByRole('button',{name:'ทุกวิชา',exact:true}).click();
 await page.locator('.subject-card').nth(1).getByRole('button').click();
 await expect(page.locator('.stage-row')).toHaveCount(20);
});

test('AI setup caps exam size, API rejects repeated templates, and source link uses current repository',async({page})=>{
 await page.goto('/?view=exam&subject=ai');
 await expect(page.getByLabel('จำนวนข้อ')).toHaveValue('15');
 await expect(page.getByLabel('จำนวนข้อ').locator('option')).toHaveText(['5 ข้อ','10 ข้อ','15 ข้อ']);
 expect((await page.request.post('/api/attempts',{data:{subject:'ai',count:20}})).status()).toBe(400);
 await expect(page.getByRole('link',{name:/Source บน GitHub/})).toHaveAttribute('href','https://github.com/lew280352-sudo/Knowledge_Hub');
 await page.goto('/?view=stage&id=ai-01&tab=test');
 await expect(page.getByLabel('จำนวนข้อ').locator('option')).toHaveText(['3 ข้อ']);
 await expect(page.getByRole('button',{name:'เริ่มทำ 3 ข้อ'})).toBeVisible();
});
