# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ..\..\..\reference\prototype\tests\preferences.spec.ts >> saved color, font and reading size persist across reload and academy navigation
- Location: tests\preferences.spec.ts:40:1

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /academy\.html#\/training$/
Received string:  "chrome-error://chromewebdata/"
Timeout: 7000ms

Call log:
  - Expect "toHaveURL" with timeout 7000ms
    11 × locator resolved to <html>…</html>
       - unexpected value "chrome-error://chromewebdata/"

```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | import AxeBuilder from '@axe-core/playwright';
  3   | import { mkdir } from 'node:fs/promises';
  4   | async function open(page: Page, member = true) {
  5   |   await page.addInitScript(
  6   |     ({ member }) => {
  7   |       if (!localStorage.getItem('ar-studio-lang')) localStorage.setItem('ar-studio-lang', 'en');
  8   |       if (member && !sessionStorage.getItem('ar-demo-persona'))
  9   |         sessionStorage.setItem('ar-demo-persona', 'learner');
  10  |     },
  11  |     { member },
  12  |   );
  13  |   await page.goto('/#/preferences');
  14  |   await expect(page.locator('main h1')).toBeVisible();
  15  | }
  16  | test('visual personal preferences desktop and mobile', async ({ page }) => {
  17  |   await open(page);
  18  |   await expect(page).toHaveScreenshot('preferences-desktop-en.png', {
  19  |     fullPage: true,
  20  |     animations: 'disabled',
  21  |   });
  22  |   await page.getByRole('button', { name: 'Change language' }).click();
  23  |   await mkdir('previews', { recursive: true });
  24  |   await page.screenshot({ path: 'previews/preferences-ar.png', fullPage: true });
  25  |   await page.getByRole('button', { name: 'تبديل المظهر' }).click();
  26  |   await page.setViewportSize({ width: 390, height: 844 });
  27  |   await expect(page).toHaveScreenshot('preferences-mobile-ar-dark.png', {
  28  |     fullPage: true,
  29  |     animations: 'disabled',
  30  |   });
  31  | });
  32  | test('approved blue is the default and guest sign-in returns to preferences', async ({ page }) => {
  33  |   await open(page, false);
  34  |   await expect(page.locator('html')).toHaveAttribute('data-palette', 'blue');
  35  |   await page.locator('main').getByRole('link', { name: 'Sign in', exact: true }).click();
  36  |   await page.getByRole('button', { name: 'Continue as demo learner' }).click();
  37  |   await expect(page.getByRole('heading', { name: 'Make this space your own.' })).toBeVisible();
  38  |   await expect(page.getByRole('radio', { name: /Professional blue/ })).toBeChecked();
  39  | });
  40  | test('saved color, font and reading size persist across reload and academy navigation', async ({
  41  |   page,
  42  | }) => {
  43  |   await open(page);
  44  |   await page.getByRole('radio', { name: 'Calm teal', exact: true }).check();
  45  |   await page.getByRole('radio', { name: /Tahoma/ }).check();
  46  |   await page.getByRole('radio', { name: 'Extra large', exact: true }).check();
  47  |   await page.getByRole('radio', { name: 'Dark', exact: true }).check();
  48  |   await page.reload();
  49  |   for (const [attr, value] of [
  50  |     ['data-palette', 'teal'],
  51  |     ['data-font', 'tahoma'],
  52  |     ['data-reading-size', 'extra'],
  53  |     ['data-theme', 'dark'],
  54  |   ])
  55  |     await expect(page.locator('html')).toHaveAttribute(attr, value);
  56  |   await expect(page.locator('.reading-sample')).toHaveCSS('font-size', '22px');
  57  |   await page.getByRole('link', { name: 'Explore the academy', exact: true }).click();
> 58  |   await expect(page).toHaveURL(/academy\.html#\/training$/);
      |                      ^ Error: expect(page).toHaveURL(expected) failed
  59  |   await expect(page.locator('html')).toHaveAttribute('data-font', 'tahoma');
  60  |   await expect(page.locator('html')).toHaveAttribute('data-palette', 'teal');
  61  |   await page.getByRole('link', { name: 'Explore course', exact: true }).click();
  62  |   await page.locator('.lesson-link').first().click();
  63  |   await expect(page.locator('.lesson-explanation>p')).toHaveCSS('font-size', '22px');
  64  | });
  65  | test('system mode responds to live device changes and manual mode overrides it', async ({
  66  |   page,
  67  | }) => {
  68  |   await page.emulateMedia({ colorScheme: 'dark' });
  69  |   await open(page);
  70  |   await page.getByRole('radio', { name: 'System', exact: true }).check();
  71  |   await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  72  |   await page.emulateMedia({ colorScheme: 'light' });
  73  |   await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  74  |   await page.getByRole('radio', { name: 'Dark', exact: true }).check();
  75  |   await page.emulateMedia({ colorScheme: 'light' });
  76  |   await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  77  | });
  78  | test('personas keep separate preferences and restoring appearance preserves training data', async ({
  79  |   page,
  80  | }) => {
  81  |   await open(page);
  82  |   await page.goto('/academy.html#/lesson/hello');
  83  |   await page.getByLabel('C# code').fill('Console.WriteLine()');
  84  |   await page.getByRole('button', { name: 'Evaluate & save' }).click();
  85  |   await expect(page.locator('.score-circle')).toContainText('50');
  86  |   await page.goto('/#/preferences');
  87  |   await page.getByRole('radio', { name: 'Modern violet', exact: true }).check();
  88  |   const before = await page.evaluate(() => localStorage.getItem('ar-studio-demo-v1'));
  89  |   await page.getByRole('button', { name: 'State lab' }).click();
  90  |   await page.getByRole('button', { name: 'Editor', exact: true }).click();
  91  |   await page.getByRole('button', { name: 'Apply & explore' }).click();
  92  |   await expect(page.locator('html')).toHaveAttribute('data-palette', 'blue');
  93  |   await page.getByRole('button', { name: 'State lab' }).click();
  94  |   await page.getByRole('button', { name: 'Learner', exact: true }).click();
  95  |   await page.getByRole('button', { name: 'Apply & explore' }).click();
  96  |   await expect(page.locator('html')).toHaveAttribute('data-palette', 'violet');
  97  |   await page.getByRole('button', { name: 'Restore default appearance', exact: true }).click();
  98  |   await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  99  |   await expect(page.locator('html')).toHaveAttribute('data-palette', 'violet');
  100 |   await page.getByRole('button', { name: 'Restore default appearance', exact: true }).click();
  101 |   await page.getByRole('button', { name: 'Confirm restore' }).click();
  102 |   await expect(page.locator('html')).toHaveAttribute('data-palette', 'blue');
  103 |   expect(await page.evaluate(() => localStorage.getItem('ar-studio-demo-v1'))).toBe(before);
  104 | });
  105 | test('storage failure applies the choice without claiming it was saved', async ({ page }) => {
  106 |   await page.addInitScript(() => {
  107 |     const original = Storage.prototype.setItem;
  108 |     Storage.prototype.setItem = function (key, value) {
  109 |       if (key === 'ar-studio-appearance-v2')
  110 |         throw new DOMException('Quota exceeded', 'QuotaExceededError');
  111 |       return original.call(this, key, value);
  112 |     };
  113 |   });
  114 |   await open(page);
  115 |   await page.getByRole('radio', { name: 'Calm teal', exact: true }).check();
  116 |   await expect(page.locator('html')).toHaveAttribute('data-palette', 'teal');
  117 |   await expect(page.getByRole('status')).toContainText('could not be saved');
  118 | });
  119 | test('preferences remain accessible in all five palettes and both modes', async ({ page }) => {
  120 |   await open(page);
  121 |   for (const palette of [
  122 |     'Professional blue',
  123 |     'Technical indigo',
  124 |     'Modern violet',
  125 |     'Calm teal',
  126 |     'Editorial slate',
  127 |   ]) {
  128 |     await page.getByRole('radio', { name: new RegExp(palette) }).check();
  129 |     for (const mode of ['Light', 'Dark']) {
  130 |       await page.getByRole('radio', { name: mode, exact: true }).check();
  131 |       const results = await new AxeBuilder({ page })
  132 |         .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
  133 |         .analyze();
  134 |       expect(
  135 |         results.violations,
  136 |         JSON.stringify(
  137 |           results.violations.map((x) => ({ id: x.id, nodes: x.nodes.map((n) => n.target) })),
  138 |         ),
  139 |       ).toEqual([]);
  140 |     }
  141 |   }
  142 | });
  143 | test('Arabic preferences reflow at 320px with large text and every font', async ({ page }) => {
  144 |   await open(page);
  145 |   await page.getByRole('radio', { name: 'Extra large', exact: true }).check();
  146 |   await page.getByRole('button', { name: 'Change language' }).click();
  147 |   await page.setViewportSize({ width: 320, height: 900 });
  148 |   for (const font of ['خط النظام', 'تاهوما', 'أريال']) {
  149 |     await page.getByRole('radio', { name: new RegExp(font) }).check();
  150 |     expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
  151 |       true,
  152 |     );
  153 |   }
  154 | });
  155 | 
```