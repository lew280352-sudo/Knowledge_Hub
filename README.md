# คลังความรู้

เว็บเรียนรู้หลายวิชาภาษาไทยสำหรับใช้ส่วนตัว เรียนต่อได้ด้วยบัญชี ChatGPT เดิมบนหลายอุปกรณ์

ที่อยู่เว็บส่วนตัว: https://physic-learn-lew.kurunaa.chatgpt.site

## วิชาและการเพิ่มเนื้อหา

- หน้าแรกแสดงวิชาปัญญาประดิษฐ์และฟิสิกส์
- AI บทนำ: 5 ด่าน พร้อมบทเรียน เกมจับคู่ และ 15 แนวโจทย์ อิง `ปัญญาประดิษฐ์_01.pdf` 17 หน้า
- ลงทะเบียนวิชาใน `lib/subjects.ts` พร้อมชุดบทเรียน แหล่งเอกสาร และคำถาม โดยใช้ ID ด่านและบทที่ไม่ซ้ำวิชาเดิม
- เพิ่มตัวสร้างคำถามของวิชาใหม่ใน `lib/questions.ts` และรักษา ID เดิมเพื่อให้ประวัติและความคืบหน้าใช้ต่อได้

## ใช้งาน

- 20 ด่าน ครอบคลุมคลื่น แสงเชิงคลื่น แสงเชิงรังสี และเสียง จาก PDF 56 หน้าที่แนบใน repo
- เลือกเนื้อหาเสริม 3 ระดับครบ 20 ด่าน พร้อมห้องทดลองแบบมีคำถามนำ 19 ด่าน ภาพที่ปรับค่าจริงได้ เกมจับคู่สูตร/ความหมาย และแบบทดสอบท้ายด่าน
- 70 แม่แบบอิงแนวโจทย์ในเอกสาร สุ่มตัวเลขและตัวเลือกใหม่ พร้อมคำนวณเฉลยตามค่าของชุดนั้น
- เลือกบท จำนวนข้อ และการจับเวลาได้ เกณฑ์ผ่านด่าน 80%
- เก็บคำตอบ ตัวเลขโจทย์ คะแนนและเฉลยย้อนหลัง ข้อสอบที่ยังไม่ส่งไม่เปิดเฉลย
- คำทำนายและเหตุผลข้อ 4 ในห้องทดลองบันทึกแยกตามด่าน เปิดต่อข้ามอุปกรณ์ได้ด้วยปุ่มบันทึกห้องทดลอง
- ซิงก์ผ่าน Cloudflare D1; มีร่างในเครื่องเมื่อบันทึกล้มเหลวและแจ้งเมื่อข้อมูลชนกับอีกอุปกรณ์

เฉลยเป็นคำอธิบายที่จัดทำและตรวจใหม่ ไม่ใช่ชุดเฉลยทางการจากผู้จัดทำ PDF ข้อที่มีเงื่อนไขกำกวมถูกดัดแปลงให้ชัดเจน ดู [ทะเบียนเนื้อหา](docs/content-inventory.md)

## รันในเครื่อง

ต้องมี Node.js 22.13 ขึ้นไป (ทดสอบด้วย Node 24) และ npm

```bash
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_exotic_lightspeed.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_curious_trish_tilby.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_flaky_micromacro.sql
npm run dev -- --port 5173
```

เปิด http://127.0.0.1:5173 ระบบ Sites จำลองการเข้าสู่ระบบในเครื่องด้วยบัญชี `Seedy` ข้อมูล local D1 แยกจากข้อมูลเว็บจริง การส่ง `oai-authenticated-user-*` จาก browser ใน local preview ถูกลบทิ้งและใช้เฉพาะตัวตนที่ local auth middleware ยืนยัน

คำสั่ง migration ข้างต้นใช้เมื่อฐานข้อมูล local ยังไม่ได้สร้างตารางเท่านั้น เมื่อ schema เปลี่ยนให้สร้าง migration เพิ่มด้วย `npm run db:generate` และใช้ไฟล์ที่ยังไม่เคย apply ห้ามเล่น migration เดิมซ้ำบนฐานที่มีตารางแล้ว

## ตรวจสอบ

```bash
npm test
npx tsc --noEmit
npx playwright test
```

Playwright ต้องมีเบราว์เซอร์ Chromium และ dev server ที่พอร์ต 5173 (`npx playwright install chromium` หากเครื่องยังไม่มีเบราว์เซอร์) ทดสอบการเรียนต่อ เกม การสอบ ประวัติ การซิงก์ด้วย browser สอง contexts และการกู้คืนเมื่อบันทึกล้มเหลว

`npm test` ตรวจ 70 baseline fixtures ที่คำนวณแยกจาก generator, 5,600 seeded variants, และ persistence โดยใช้ SQLite จริงผ่าน Node SQLite ไม่ mock ผลการบันทึก

GitHub Actions ตรวจ TypeScript, unit/integration, production build และ Playwright บนฐาน local ที่สร้างใหม่ ใช้เฉพาะบัญชีจำลองและไม่ต้องใช้ production credentials

## โครงสร้าง

- `lib/curriculum.ts`: เนื้อหา บทเรียน เกม และเลขหน้า/ข้อจาก PDF ครบทั้ง 70 ข้อ
- `lib/questions.ts`: ตัวสุ่มโจทย์แบบ deterministic และ worked solution
- `lib/server/store.ts`: D1 persistence, revision checks, deadline และ grading
- `app/api/`: ตรวจตัวตนและ origin ของการเขียน ไม่รับคะแนนจาก client
- `components/`: แผนที่ด่าน เรียน ภาพ เกม ข้อสอบ และประวัติ
- `drizzle/`: schema migrations
- `.openai/hosting.json`: ตัวตน Sites และ D1 binding (ไม่มี secrets)

## เผยแพร่

ใช้ Sites workflow ที่รองรับ Vinext และ D1 โดยรักษา project ID ใน `.openai/hosting.json` และสิทธิ์ owner-private ของเว็บไว้ ระบบ Sites จัดการ production identity และ apply migrations ตอน publish อย่าเปิด local mock authentication ใน production

ซอร์สที่ deploy ต้องตรงกับ commit ที่ส่งผ่าน Sites source helper และ build artifact ของ commit เดียวกัน ไม่เก็บ access token, `.env`, `.wrangler`, ฐานข้อมูลจริง หรือ build cache ใน GitHub

## เอกสารและที่มา

- [แบบที่อนุมัติ](docs/superpowers/specs/2026-11-02-physic-learn-design.md)
- [แผนพัฒนา](docs/superpowers/plans/2026-11-02-physic-learn.md)
- [ทะเบียนโจทย์ 70 ข้อ](docs/content-inventory.md)
- [ทิศทางภาพและ asset provenance](docs/design-direction.md)
- [บันทึกการตรวจสอบ](docs/verification.md)
- [การบันทึกสมุดทดลองและการกู้คืนร่าง](docs/lab-notebook.md)

ใช้ Superpowers, design-taste-frontend, Impeccable, Lucide / Simple Icons และ Playwright ตาม brief ฟอนต์ IBM Plex Sans Thai อยู่ภายใต้ OFL ดู `public/fonts/OFL.txt` ไอคอน GitHub มาจาก Simple Icons; ภาพฟิสิกส์เป็น SVG ที่วาดจากค่าจริง

## ตรวจคุณภาพเนื้อหาและสมการ

ใช้ `npm run validate:math` ตรวจการแสดงสูตร และ `npm run validate:physics` ตรวจโจทย์ด้วยตัวคำนวณอิสระ ติดตั้งเครื่องมือตรวจออฟไลน์ด้วย `python -m pip install -r scripts/validation/requirements.txt` ก่อน

ดูผลตรวจ ข้อผิดพลาดที่ยืนยันแล้ว และข้อจำกัดใน [รายงานคุณภาพ](docs/learning-quality-audit.md) และ [ทะเบียนโจทย์ฟิสิกส์ครบ 70 แม่แบบ](docs/physics-audit-inventory.md)
