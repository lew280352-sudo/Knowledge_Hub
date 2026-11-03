import { test, expect } from '@playwright/test';

test('dashboard keeps real statistics, responsive wave graph and keyboard category filtering', async ({ page }) => {
  const response = page.waitForResponse(r => r.url().endsWith('/api/state') && r.status() === 200);
  await page.goto('/?view=home&subject=physics');
  const state = await (await response).json();
  await expect(page.getByRole('heading', { name: 'เข้าใจฟิสิกส์ ทีละจังหวะ' })).toBeVisible();
  const passed = Object.values(state.bestScores).filter((v: unknown) => Number(v) >= 80).length;
  await expect(page.getByRole('progressbar', { name: 'ด่านที่ผ่านทั้งหมด' })).toHaveAttribute('aria-valuenow', String(passed));
  await expect(page.locator('.study-facts dd').nth(2)).toContainText(String(state.stats.submittedAttempts));
  await expect(page.locator('.study-facts dd').nth(3)).toContainText(String(state.stats.games));
  await expect(page.getByRole('button', { name: 'เส้นทางการเรียน', exact: true })).toHaveAttribute('aria-current', 'page');

  for (const width of [360, 390, 820, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.locator('.resume-visual')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    for (const button of await page.locator('.chapter-filters button').all()) {
      expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
  }
  const sound = page.getByRole('button', { name: 'เสียง', exact: true });
  await sound.focus();
  await page.keyboard.press('Enter');
  await expect(sound).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.chapter-panel')).toHaveCount(1);
  await expect(page.locator('.stage-row')).toHaveCount(5);
  await page.locator('.stage-row').last().click();
  await expect(page).toHaveURL(/view=stage&id=s20/);
});

test('zero and completed progress states remain honest and support visible focus and reduced motion', async ({ page }) => {
  // Test-only API fixtures; no learning data is written or shipped with the app.
  let fixture = { displayName: 'Accessibility fixture', lessons: [], attempts: [], games: [], bestScores: {} as Record<string, number>, stats: { submittedAttempts: 0, games: 0 } };
  await page.route('**/api/state', route => route.fulfill({ json: fixture }));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?view=home&subject=physics');
  const progress = page.getByRole('progressbar', { name: 'ด่านที่ผ่านทั้งหมด' });
  await expect(progress).toHaveAttribute('aria-valuenow', '0');
  expect(await progress.locator('span').evaluate(el => el.getBoundingClientRect().width)).toBe(0);
  await expect(page.locator('.stage-row.is-complete')).toHaveCount(0);

  fixture = { ...fixture, bestScores: { s01: 80 }, stats: { submittedAttempts: 1, games: 2 } };
  await page.reload();
  await expect(progress).toHaveAttribute('aria-valuenow', '1');
  await expect(page.getByRole('progressbar', { name: 'คลื่น: ด่านที่ผ่าน', exact: true })).toHaveAttribute('aria-valuenow', '1');
  const completed = page.locator('.stage-row.is-complete');
  await expect(completed).toHaveCount(1);
  await expect(completed).toContainText('ผ่านแล้ว · คะแนนสูงสุด 80%');
  await completed.focus();
  expect(await completed.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
  expect(await completed.evaluate(el => getComputedStyle(el).outlineWidth)).toBe('3px');
  const duration = await completed.evaluate(el => getComputedStyle(el).transitionDuration);
  expect(duration.split(',').every(v => Number.parseFloat(v) <= 0.001)).toBeTruthy();
});
