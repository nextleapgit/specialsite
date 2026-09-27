import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function open(page: Page, path = '/appearance', editor = false) {
  await page.addInitScript(
    ({ editor }) => {
      if (!localStorage.getItem('ar-studio-lang')) localStorage.setItem('ar-studio-lang', 'en');
      if (editor) sessionStorage.setItem('ar-demo-persona', 'admin');
    },
    { editor },
  );
  await page.goto('/#' + path);
  await expect(page.locator('main h1')).toBeVisible();
}
test('three palettes preview live, persist and support dark mode', async ({ page }) => {
  await open(page);
  for (const palette of ['violet', 'blue', 'indigo']) {
    await page
      .locator('.palette-card')
      .filter({
        has: page.getByRole('heading', {
          name:
            palette === 'violet'
              ? 'Modern violet'
              : palette === 'blue'
                ? 'Professional blue'
                : 'Technical indigo',
        }),
      })
      .getByRole('button')
      .click();
    await expect(page.locator('html')).toHaveAttribute('data-palette', palette);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-palette', palette);
  }
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
test('training opens a separate document and keeps the demo persona', async ({ page }) => {
  await open(page, '/', true);
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Training', exact: true })
    .click();
  await expect(page).toHaveURL(/academy\.html#\/training$/);
  await expect(page.locator('.academy-bar')).toBeVisible();
  await page.getByRole('link', { name: 'Explore course', exact: true }).click();
  await expect(page.locator('.lesson-link')).toHaveCount(30);
  await expect(page.locator('.curriculum>details')).toHaveCount(10);
  await page.locator('.lesson-link').last().click();
  await expect(page.getByLabel('C# code')).toBeVisible();
  await page.getByRole('link', { name: 'Back to the website' }).click();
  await expect(page).toHaveURL(/index\.html#\/$/);
});
test('new curriculum remains private until reviewed and explicitly approved', async ({ page }) => {
  await open(page, '/admin/curriculum-ai', true);
  await page.getByRole('combobox', { name: 'Operation', exact: true }).selectOption('new');
  await page.getByLabel('Proposed curriculum title').fill('Advanced C# Lab');
  await page.getByLabel('Goals and review notes').fill('A focused path for practicing developers.');
  await page.getByRole('button', { name: 'Propose & generate curriculum' }).click();
  await expect(page.getByRole('heading', { name: 'Review. Refine. Approve.' })).toBeVisible();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('ar-studio-demo-v1')!).curricula),
  ).toEqual([]);
  await page.locator('.proposal-lesson>summary').first().click();
  await page
    .getByRole('textbox', { name: 'Lesson title', exact: true })
    .first()
    .fill('A reviewed interfaces lesson');
  await page
    .getByRole('textbox', { name: 'Explanation', exact: true })
    .first()
    .fill('This explanation was reviewed before approval.');
  await page.getByRole('button', { name: 'Review approval', exact: true }).click();
  await page.getByRole('button', { name: 'Keep reviewing' }).click();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('ar-studio-demo-v1')!).curricula),
  ).toEqual([]);
  await page.getByRole('button', { name: 'Review approval', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm curriculum approval' }).click();
  await page.getByRole('link', { name: 'View approved curriculum' }).click();
  await expect(page).toHaveURL(/academy\.html#\/training\/course\/course-/);
  await expect(page.getByRole('heading', { name: 'Advanced C# Lab', exact: true })).toBeVisible();
  await page.getByRole('link', { name: /A reviewed interfaces lesson/ }).click();
  await expect(page.locator('.lesson-explanation')).toContainText(
    'This explanation was reviewed before approval.',
  );
  await page.reload();
  await expect(page.getByLabel('C# code')).toBeVisible();
});
test('existing course edits apply only after approval and discarded proposals have no effect', async ({
  page,
}) => {
  await open(page, '/admin/curriculum-ai', true);
  await page.getByRole('button', { name: 'Propose & generate curriculum' }).click();
  await page.locator('.proposal-lesson>summary').first().click();
  await page
    .getByRole('textbox', { name: 'Explanation', exact: true })
    .first()
    .fill('Discard this content');
  await page.getByRole('button', { name: 'Discard proposal & return' }).click();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('ar-studio-demo-v1')!).curricula),
  ).toEqual([]);
  await page.getByRole('button', { name: 'Propose & generate curriculum' }).click();
  await page.locator('.proposal-lesson>summary').first().click();
  await page
    .getByRole('textbox', { name: 'Explanation', exact: true })
    .first()
    .fill('Approved updated introduction.');
  await page.getByRole('button', { name: 'Review approval', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm curriculum approval' }).click();
  await page.getByRole('link', { name: 'View approved curriculum' }).click();
  await page.locator('.lesson-link').first().click();
  await expect(page.locator('.lesson-explanation')).toContainText('Approved updated introduction.');
});
test('AI generation error is recoverable and does not create a curriculum', async ({ page }) => {
  await open(page, '/admin/curriculum-ai', true);
  await page.getByRole('button', { name: 'State lab' }).click();
  await page.getByLabel('Request outcome').selectOption('error');
  await page.getByRole('button', { name: 'Apply & explore' }).click();
  await page.getByRole('button', { name: 'Propose & generate curriculum' }).click();
  await expect(page.getByText(/Proposal generation failed/)).toBeVisible();
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('ar-studio-demo-v1')!).curricula),
  ).toEqual([]);
  await expect(page.getByRole('button', { name: 'Propose & generate curriculum' })).toBeEnabled();
});
test('palette previews and AI review are accessible and reflow in Arabic', async ({ page }) => {
  await open(page, '/appearance', true);
  for (const palette of ['indigo', 'violet', 'blue']) {
    const card = page.locator('.palette-card').filter({
      has: page.getByRole('heading', {
        name:
          palette === 'violet'
            ? 'Modern violet'
            : palette === 'blue'
              ? 'Professional blue'
              : 'Technical indigo',
      }),
    });
    await card.getByRole('button').click();
    for (let mode = 0; mode < 2; mode++) {
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        result.violations,
        JSON.stringify(
          result.violations.map((x) => ({ id: x.id, nodes: x.nodes.map((n) => n.target) })),
        ),
      ).toEqual([]);
      await page.getByRole('button', { name: 'Toggle theme' }).click();
    }
  }
  await page.goto('/#/admin/curriculum-ai');
  await page.getByRole('button', { name: 'Propose & generate curriculum' }).click();
  await expect(page.getByRole('heading', { name: 'Review. Refine. Approve.' })).toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.getByRole('button', { name: 'Change language' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/admin/curriculum-ai', '/appearance', '/training']) {
    await page.evaluate((path) => {
      location.hash = path;
    }, path);
    await expect(page.locator('main')).toHaveAttribute('data-route', path);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
      .toBe(true);
  }
});
