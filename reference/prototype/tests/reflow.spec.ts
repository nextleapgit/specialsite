import { test, expect } from '@playwright/test';
test('expanded academy and authoring reflow at narrow, tablet and desktop widths', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem('ar-studio-lang', 'ar');
    sessionStorage.setItem('ar-demo-persona', 'admin');
  });
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      '/',
      '/appearance',
      '/training',
      '/lesson/hello',
      '/admin/editor',
      '/admin/curriculum-ai',
    ]) {
      await page.goto(
        '/' +
          (/^\/(training|lesson)(\/|$)/.test(route) ? 'academy.html' : 'index.html') +
          '#' +
          route,
      );
      await expect(page.locator('main h1')).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `${width} ${route}`,
      ).toBe(true);
    }
  }
});
