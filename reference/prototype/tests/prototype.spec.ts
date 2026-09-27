import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function setup(page: Page, path = '/') {
  await page.addInitScript(() => {
    if (!localStorage.getItem('ar-studio-lang')) localStorage.setItem('ar-studio-lang', 'en');
  });
  await page.goto(
    (/^\/(training|lesson|progress)(\/|$)/.test(path) ? '/academy.html#' : '/#') + path,
  );
  await expect(page.locator('main')).toHaveAttribute('data-route', path.split('?')[0]);
}
async function persona(page: Page, name = 'Learner', outcome = 'none') {
  await page.getByRole('button', { name: 'State lab' }).click();
  await page.getByRole('button', { name, exact: true }).click();
  await page.getByLabel('Request outcome').selectOption(outcome);
  await page.getByRole('button', { name: 'Apply & explore' }).click();
}
async function navigate(page: Page, path: string) {
  await page.evaluate((path) => {
    location.hash = path;
  }, path);
  await expect(page.locator('main')).toHaveAttribute('data-route', path.split('?')[0]);
}
test('every required route renders; guest cannot reach editors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await setup(page);
  for (const path of [
    '/',
    '/articles',
    '/articles/systems-that-scale',
    '/projects',
    '/projects/operations',
    '/newsletter',
    '/training',
    '/training/csharp',
    '/login',
    '/register',
    '/forgot',
    '/about',
    '/design-system',
  ]) {
    await navigate(page, path);
    await expect(page.locator('main h1')).toBeVisible();
  }
  await navigate(page, '/lesson/hello');
  await expect(page.getByText('Your space starts with an account.')).toBeVisible();
  await persona(page, 'Editor');
  for (const path of [
    '/dashboard',
    '/progress',
    '/accounts',
    '/admin',
    '/admin/editor',
    '/admin/courses',
    '/lesson/variables',
  ]) {
    await navigate(page, path);
    await expect(page.locator('main h1')).toBeVisible();
  }
  expect(errors).toEqual([]);
});
test('registration confirms then returns to the requested lesson', async ({ page }) => {
  await setup(page, '/register?return=%2Flesson%2Fhello');
  await page.getByLabel('Name', { exact: true }).fill('Demo Learner');
  await page.getByLabel('Email', { exact: true }).fill('learner@example.com');
  await page.getByLabel('Demo password').fill('fictional-only');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Create account', exact: true }).click();
  await page.getByRole('button', { name: 'Simulate verification & continue' }).click();
  await expect(page.getByRole('textbox', { name: 'C# code' })).toBeVisible();
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain('fictional-only');
});
test('run, evaluate, retry and reset preserve best score and attempt history', async ({ page }) => {
  await setup(page, '/lesson/hello');
  await persona(page);
  const editor = page.getByRole('textbox', { name: 'C# code' });
  await editor.fill('Console.WriteLine()');
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(page.getByRole('tabpanel')).toContainText('Fixture: solution incomplete');
  await page.getByRole('tab', { name: 'History' }).click();
  await expect(page.getByRole('tabpanel')).toContainText('Your first attempt awaits');
  await page.getByRole('button', { name: 'Evaluate & save' }).click();
  await expect(page.locator('.score-circle')).toContainText('50');
  await page.getByText('Need a hint?', { exact: true }).click();
  await page.getByRole('button', { name: 'Load worked example' }).click();
  await page.getByRole('button', { name: 'Evaluate & save' }).click();
  await expect(page.locator('.score-circle')).toContainText('100');
  await page.getByRole('button', { name: 'Reset code' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reset code' }).click();
  await page.getByRole('tab', { name: 'History' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(2);
  await expect(page.locator('.lesson-title')).toContainText('Best score: 100%');
  await page.reload();
  await persona(page);
  await page.getByRole('tab', { name: 'History' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(2);
});
test('autocomplete toggle and runner error do not create a grade', async ({ page }) => {
  await setup(page, '/lesson/hello');
  await persona(page);
  await page.getByLabel('C# code').fill('Console');
  await expect(page.getByRole('button', { name: /Insert suggestion/ })).toBeVisible();
  await page.getByRole('switch').uncheck();
  await expect(page.getByRole('button', { name: /Insert suggestion/ })).toHaveCount(0);
  await persona(page, 'Learner', 'error');
  await page.getByRole('button', { name: 'Evaluate & save' }).click();
  await expect(page.getByRole('alert')).toContainText('No attempt was recorded');
  await page.getByRole('tab', { name: 'History' }).click();
  await expect(page.getByRole('tabpanel')).toContainText('Your first attempt awaits');
});
test('newsletter confirmation, preferences and unsubscribe', async ({ page }) => {
  await setup(page, '/newsletter');
  await page.getByLabel('Email address').fill('demo@example.com');
  await page.getByRole('checkbox', { name: /I agree/ }).check();
  await page.getByRole('button', { name: 'Subscribe to the letter' }).click();
  await page.getByRole('button', { name: 'Simulate email confirmation' }).click();
  await expect(page.getByText('Subscribed & confirmed')).toBeVisible();
  await page.getByLabel('Delivery frequency').selectOption('weekly');
  await page.getByRole('button', { name: 'Save preferences' }).click();
  await expect(page.locator('.toast')).toContainText('saved');
  await page.getByRole('button', { name: 'Unsubscribe', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm unsubscribe' }).click();
  await expect(page.getByRole('button', { name: 'Subscribe to the letter' })).toBeVisible();
});
test('publishing partially fails then retries only LinkedIn without duplicates', async ({
  page,
}) => {
  await setup(page, '/accounts');
  await persona(page, 'Editor');
  await page.getByRole('button', { name: 'Connect LinkedIn', exact: true }).click();
  await page.getByRole('button', { name: 'Simulate consent & connect' }).click();
  await expect(page.getByRole('button', { name: 'Disconnect', exact: true })).toBeVisible();
  await navigate(page, '/admin/editor');
  await page.getByLabel('Article title', { exact: true }).fill('A practical architecture note');
  await page
    .getByLabel('Article excerpt')
    .fill('A complete sample excerpt for publishing validation.');
  await page
    .getByLabel('Article body')
    .fill(
      'This is a complete article body for the prototype. It explains one problem, one decision, and one useful action for readers.',
    );
  await persona(page, 'Editor', 'partial');
  await page.getByRole('button', { name: 'Review & publish' }).click();
  await page.getByRole('button', { name: 'Confirm demo publication' }).click();
  await expect(page.getByRole('dialog').getByText('Failed', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'View details' }).click();
  await persona(page, 'Editor', 'none');
  await page.getByRole('button', { name: 'Retry failed channels only' }).click();
  await expect(page.getByText('Failed', { exact: true })).toHaveCount(0);
  const data = await page.evaluate(() => JSON.parse(localStorage.getItem('ar-studio-demo-v1')!));
  expect(data.customArticles).toHaveLength(1);
  expect(data.deliveries.map((x: { attempts: number }) => x.attempts)).toEqual([1, 1, 2]);
  await page.getByRole('link', { name: 'View published article' }).click();
  await expect(page.locator('h1')).toHaveText('A practical architecture note');
});
test('course draft sections can be created, ordered and card published', async ({ page }) => {
  await setup(page, '/admin/courses');
  await persona(page, 'Editor');
  await page.getByRole('button', { name: 'Add course', exact: true }).click();
  await page.getByLabel('Course title').fill('Python for builders');
  await page.getByRole('button', { name: 'Create draft' }).click();
  await page.getByLabel('New section title').fill('Core concepts');
  await page.getByRole('button', { name: 'Add section', exact: true }).click();
  await page.getByLabel('New section title').fill('Practice');
  await page.getByRole('button', { name: 'Add section', exact: true }).click();
  await page.getByRole('button', { name: 'Move up' }).last().click();
  await expect(page.locator('.management-section summary').first()).toContainText('Practice');
  await page.getByRole('button', { name: 'Publish course card' }).click();
  await navigate(page, '/training');
  await expect(page.locator('.notice').filter({ hasText: 'Python for builders' })).toBeVisible();
});
test('native dialog traps focus and restores its trigger', async ({ page }) => {
  await setup(page);
  const trigger = page.getByRole('button', { name: 'State lab' });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  for (let i = 0; i < 16; i++) {
    await page.keyboard.press('Tab');
    expect(
      await page.evaluate(
        () =>
          document.activeElement === document.body || !!document.activeElement?.closest('dialog'),
      ),
    ).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(trigger).toBeFocused();
});
test('page states recover and theme/language persist', async ({ page }) => {
  await setup(page);
  await page.getByRole('button', { name: 'State lab' }).click();
  await page.getByLabel('Page state').selectOption('error');
  await page.getByRole('button', { name: 'Apply & explore' }).click();
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.locator('.hero')).toBeVisible();
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await page.getByRole('button', { name: 'Change language' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
for (const theme of ['light', 'dark'])
  test(`accessibility core routes ${theme}`, async ({ page }) => {
    await setup(page);
    if (theme === 'dark') await page.getByRole('button', { name: 'Toggle theme' }).click();
    await persona(page, 'Editor');
    for (const route of [
      '/',
      '/newsletter',
      '/lesson/hello',
      '/admin/editor',
      '/accounts',
      '/design-system',
    ]) {
      await navigate(page, route);
      await expect(page.locator('main h1')).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        results.violations,
        route +
          ' ' +
          JSON.stringify(
            results.violations.map((v) => ({
              id: v.id,
              nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
            })),
          ),
      ).toEqual([]);
    }
  });
test('mobile RTL reflows across all workspaces without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page);
  await persona(page, 'Editor');
  await page.getByRole('button', { name: 'Change language' }).click();
  for (const path of [
    '/',
    '/articles',
    '/newsletter',
    '/training',
    '/training/csharp',
    '/lesson/hello',
    '/dashboard',
    '/progress',
    '/accounts',
    '/admin/editor',
    '/admin/courses',
  ]) {
    await navigate(page, path);
    await expect(page.locator('main h1')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      path,
    ).toBe(true);
  }
});
test('visual home desktop and mobile references', async ({ page }) => {
  await setup(page);
  await expect(page).toHaveScreenshot('home-desktop-en.png', {
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: 'Change language' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page).toHaveScreenshot('home-mobile-ar.png', {
    fullPage: true,
    animations: 'disabled',
  });
});

test('plain text preview escapes markup and sends no external requests', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (request) => {
    if (!request.url().startsWith('http://127.0.0.1:5173')) external.push(request.url());
  });
  await setup(page, '/admin/editor');
  await persona(page, 'Editor');
  const payload = '<img src=x onerror="window.prototypeInjected=true">';
  await page.getByLabel('Article title', { exact: true }).fill('Safe rendering test');
  await page.getByLabel('Article excerpt').fill('A safe preview of untrusted text in the editor.');
  await page.getByLabel('Article body').fill(payload);
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(page.locator('.editor-preview')).toContainText(payload);
  await expect(page.locator('.editor-preview img')).toHaveCount(0);
  expect(await page.evaluate(() => 'prototypeInjected' in window)).toBe(false);
  expect(external).toEqual([]);
});

test('mobile prototype controls remain inside the viewport in both directions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await setup(page);
  for (let i = 0; i < 2; i++) {
    const rect = await page.locator('.prototype-dock').boundingBox();
    expect(rect!.x).toBeGreaterThanOrEqual(0);
    expect(rect!.x + rect!.width).toBeLessThanOrEqual(320);
    await page.getByRole('button', { name: 'Change language' }).click();
  }
});
