import { test, expect } from '../../../reference/prototype/node_modules/@playwright/test/index.mjs';
import AxeBuilder from '../../../reference/prototype/node_modules/@axe-core/playwright/dist/index.mjs';

// Inspect final rendered states without altering application styles or suppressing axe rules.
async function auditSettled(page) {
  await page.evaluate(async () => {
    await new Promise(requestAnimationFrame);
    await Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {})));
    await new Promise(requestAnimationFrame);
  });
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(result.violations).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('ar-studio-lang', 'en');
    sessionStorage.setItem('ar-demo-persona', 'admin');
  });
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(false);
});

test('normal motion: five preference palettes pass accessibility after transitions finish', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/#/preferences');
  await expect(page.locator('main h1')).toBeVisible();
  for (const [name, value] of [['Professional blue', 'blue'], ['Technical indigo', 'indigo'], ['Modern violet', 'violet'], ['Calm teal', 'teal'], ['Editorial slate', 'slate']]) {
    await page.getByRole('radio', { name: new RegExp(name) }).check();
    await expect(page.locator('html')).toHaveAttribute('data-palette', value);
    for (const mode of ['Light', 'Dark']) {
      await page.getByRole('radio', { name: mode, exact: true }).check();
      await expect(page.locator('html')).toHaveAttribute('data-theme', mode.toLowerCase());
      await auditSettled(page);
    }
  }
});

test('normal motion: appearance previews pass accessibility after transitions finish', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/#/appearance');
  await expect(page.locator('main h1')).toBeVisible();
  for (const name of ['Technical indigo', 'Modern violet', 'Professional blue']) {
    const card = page.locator('.palette-card').filter({ has: page.getByRole('heading', { name }) });
    await card.getByRole('button').click();
    for (let mode = 0; mode < 2; mode++) {
      await auditSettled(page);
      await page.getByRole('button', { name: 'Toggle theme' }).click();
    }
  }
});
