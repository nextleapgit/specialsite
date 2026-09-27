import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';
async function open(page: Page, member = true) {
  await page.addInitScript(
    ({ member }) => {
      if (!localStorage.getItem('ar-studio-lang')) localStorage.setItem('ar-studio-lang', 'en');
      if (member && !sessionStorage.getItem('ar-demo-persona'))
        sessionStorage.setItem('ar-demo-persona', 'learner');
    },
    { member },
  );
  await page.goto('/#/preferences');
  await expect(page.locator('main h1')).toBeVisible();
}
test('visual personal preferences desktop and mobile', async ({ page }) => {
  await open(page);
  await expect(page).toHaveScreenshot('preferences-desktop-en.png', {
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: 'Change language' }).click();
  await mkdir('previews', { recursive: true });
  await page.screenshot({ path: 'previews/preferences-ar.png', fullPage: true });
  await page.getByRole('button', { name: 'تبديل المظهر' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page).toHaveScreenshot('preferences-mobile-ar-dark.png', {
    fullPage: true,
    animations: 'disabled',
  });
});
test('approved blue is the default and guest sign-in returns to preferences', async ({ page }) => {
  await open(page, false);
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'blue');
  await page.locator('main').getByRole('link', { name: 'Sign in', exact: true }).click();
  await page.getByRole('button', { name: 'Continue as demo learner' }).click();
  await expect(page.getByRole('heading', { name: 'Make this space your own.' })).toBeVisible();
  await expect(page.getByRole('radio', { name: /Professional blue/ })).toBeChecked();
});
test('saved color, font and reading size persist across reload and academy navigation', async ({
  page,
}) => {
  await open(page);
  await page.getByRole('radio', { name: 'Calm teal', exact: true }).check();
  await page.getByRole('radio', { name: /Tahoma/ }).check();
  await page.getByRole('radio', { name: 'Extra large', exact: true }).check();
  await page.getByRole('radio', { name: 'Dark', exact: true }).check();
  await page.reload();
  for (const [attr, value] of [
    ['data-palette', 'teal'],
    ['data-font', 'tahoma'],
    ['data-reading-size', 'extra'],
    ['data-theme', 'dark'],
  ])
    await expect(page.locator('html')).toHaveAttribute(attr, value);
  await expect(page.locator('.reading-sample')).toHaveCSS('font-size', '22px');
  await page.getByRole('link', { name: 'Explore the academy', exact: true }).click();
  await expect(page).toHaveURL(/academy\.html#\/training$/);
  await expect(page.locator('html')).toHaveAttribute('data-font', 'tahoma');
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'teal');
  await page.getByRole('link', { name: 'Explore course', exact: true }).click();
  await page.locator('.lesson-link').first().click();
  await expect(page.locator('.lesson-explanation>p')).toHaveCSS('font-size', '22px');
});
test('system mode responds to live device changes and manual mode overrides it', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await open(page);
  await page.getByRole('radio', { name: 'System', exact: true }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('radio', { name: 'Dark', exact: true }).check();
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
test('personas keep separate preferences and restoring appearance preserves training data', async ({
  page,
}) => {
  await open(page);
  await page.goto('/academy.html#/lesson/hello');
  await page.getByLabel('C# code').fill('Console.WriteLine()');
  await page.getByRole('button', { name: 'Evaluate & save' }).click();
  await expect(page.locator('.score-circle')).toContainText('50');
  await page.goto('/#/preferences');
  await page.getByRole('radio', { name: 'Modern violet', exact: true }).check();
  const before = await page.evaluate(() => localStorage.getItem('ar-studio-demo-v1'));
  await page.getByRole('button', { name: 'State lab' }).click();
  await page.getByRole('button', { name: 'Editor', exact: true }).click();
  await page.getByRole('button', { name: 'Apply & explore' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'blue');
  await page.getByRole('button', { name: 'State lab' }).click();
  await page.getByRole('button', { name: 'Learner', exact: true }).click();
  await page.getByRole('button', { name: 'Apply & explore' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'violet');
  await page.getByRole('button', { name: 'Restore default appearance', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'violet');
  await page.getByRole('button', { name: 'Restore default appearance', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm restore' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'blue');
  expect(await page.evaluate(() => localStorage.getItem('ar-studio-demo-v1'))).toBe(before);
});
test('storage failure applies the choice without claiming it was saved', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'ar-studio-appearance-v2')
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await open(page);
  await page.getByRole('radio', { name: 'Calm teal', exact: true }).check();
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'teal');
  await expect(page.getByRole('status')).toContainText('could not be saved');
});
test('preferences remain accessible in all five palettes and both modes', async ({ page }) => {
  await open(page);
  for (const palette of [
    'Professional blue',
    'Technical indigo',
    'Modern violet',
    'Calm teal',
    'Editorial slate',
  ]) {
    await page.getByRole('radio', { name: new RegExp(palette) }).check();
    for (const mode of ['Light', 'Dark']) {
      await page.getByRole('radio', { name: mode, exact: true }).check();
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        results.violations,
        JSON.stringify(
          results.violations.map((x) => ({ id: x.id, nodes: x.nodes.map((n) => n.target) })),
        ),
      ).toEqual([]);
    }
  }
});
test('Arabic preferences reflow at 320px with large text and every font', async ({ page }) => {
  await open(page);
  await page.getByRole('radio', { name: 'Extra large', exact: true }).check();
  await page.getByRole('button', { name: 'Change language' }).click();
  await page.setViewportSize({ width: 320, height: 900 });
  for (const font of ['خط النظام', 'تاهوما', 'أريال']) {
    await page.getByRole('radio', { name: new RegExp(font) }).check();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  }
});
