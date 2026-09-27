# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: preferences.spec.ts >> preferences remain accessible in all five palettes and both modes
- Location: tests\preferences.spec.ts:119:1

# Error details

```
Error: [{"id":"color-contrast","nodes":[[".button[href$=\"academy.html#/training\"]"]]}]

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 58

- Array []
+ Array [
+   Object {
+     "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
+     "help": "Elements must meet minimum color contrast ratio thresholds",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.13/color-contrast?application=playwright",
+     "id": "color-contrast",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#8957f2",
+               "contrastRatio": 4.45,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#ffffff",
+               "fontSize": "9.8pt (13px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 4.45 (foreground color: #ffffff, background color: #8957f2, font size: 9.8pt (13px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<a href=\"./academy.html#/training\" class=\"button\">Explore the academy</a>",
+                 "target": Array [
+                   ".button[href$=\"academy.html#/training\"]",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 4.45 (foreground color: #ffffff, background color: #8957f2, font size: 9.8pt (13px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<a href=\"./academy.html#/training\" class=\"button\">Explore the academy</a>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".button[href$=\"academy.html#/training\"]",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.color",
+       "wcag2aa",
+       "wcag143",
+       "TTv5",
+       "TT13.c",
+       "EN-301-549",
+       "EN-9.1.4.3",
+       "ACT",
+       "RGAAv4",
+       "RGAA-3.2.1",
+     ],
+   },
+ ]
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - link "Skip to content" [ref=e3] [cursor=pointer]:
    - /url: "#main"
  - banner [ref=e4]:
    - generic [ref=e5]:
      - link "Abdulnaser Ramadan home" [ref=e6] [cursor=pointer]:
        - /url: "#/"
        - generic [ref=e8]: AbdulnaserRamadan
      - navigation "Main navigation" [ref=e9]:
        - link "Articles" [ref=e10] [cursor=pointer]:
          - /url: "#/articles"
        - link "Projects" [ref=e11] [cursor=pointer]:
          - /url: "#/projects"
        - link "Newsletter" [ref=e12] [cursor=pointer]:
          - /url: "#/newsletter"
        - link "Training" [ref=e13] [cursor=pointer]:
          - /url: ./academy.html#/training
        - link "About" [ref=e15] [cursor=pointer]:
          - /url: "#/about"
      - generic [ref=e16]:
        - link "Appearance preferences" [ref=e17] [cursor=pointer]:
          - /url: "#/preferences"
          - text: ◐
        - button "Toggle theme" [ref=e18] [cursor=pointer]
        - button "Change language" [ref=e21] [cursor=pointer]: ع
        - link "AR My space" [ref=e23] [cursor=pointer]:
          - /url: "#/dashboard"
          - generic [ref=e24]: AR
          - generic [ref=e25]: My space
        - button "Sign out" [ref=e26] [cursor=pointer]
  - main [ref=e30]:
    - navigation "Account" [ref=e31]:
      - link "My space" [ref=e32] [cursor=pointer]:
        - /url: "#/dashboard"
      - link "Training progress" [ref=e33] [cursor=pointer]:
        - /url: ./academy.html#/progress
      - link "Connected accounts" [ref=e34] [cursor=pointer]:
        - /url: "#/accounts"
      - link "Appearance preferences" [ref=e35] [cursor=pointer]:
        - /url: "#/preferences"
      - link "Newsletter preferences" [ref=e36] [cursor=pointer]:
        - /url: "#/newsletter"
    - generic [ref=e37]:
      - text: YOUR SPACE / PREFERENCES
      - heading "Make this space your own." [level=1] [ref=e38]
      - paragraph [ref=e39]: Colors you enjoy, type that feels right, and reading at your pace. Your preferences follow you across the website and academy.
    - status [ref=e40]: Your choices are saved automatically on this device.
    - generic [ref=e43]:
      - generic [ref=e44]:
        - generic [ref=e45]:
          - heading "Color & appearance" [level=2] [ref=e46]
          - group "Color palette" [ref=e53]:
            - generic [ref=e55]:
              - generic [ref=e56] [cursor=pointer]:
                - radio "Professional blue Site default" [ref=e57]
                - generic [ref=e59]:
                  - text: Professional blue
                  - generic [ref=e60]: Site default
              - generic [ref=e61] [cursor=pointer]:
                - radio "Technical indigo" [ref=e62]
                - generic [ref=e64]: Technical indigo
              - generic [ref=e65] [cursor=pointer]:
                - radio "Modern violet" [checked] [ref=e66]
                - generic [ref=e68]: Modern violet
              - generic [ref=e69] [cursor=pointer]:
                - radio "Calm teal" [ref=e70]
                - generic [ref=e72]: Calm teal
              - generic [ref=e73] [cursor=pointer]:
                - radio "Editorial slate" [ref=e74]
                - generic [ref=e76]: Editorial slate
          - group "Display mode" [ref=e77]:
            - generic [ref=e79]:
              - generic [ref=e80] [cursor=pointer]:
                - radio "Light" [checked] [active] [ref=e81]
                - text: Light
              - generic [ref=e82] [cursor=pointer]:
                - radio "Dark" [ref=e83]
                - text: Dark
              - generic [ref=e84] [cursor=pointer]:
                - radio "System" [ref=e85]
                - text: System
            - paragraph [ref=e86]: System automatically follows your device’s appearance setting.
        - generic [ref=e87]:
          - heading "Typography & reading" [level=2] [ref=e88]
          - group "Interface font" [ref=e91]:
            - generic [ref=e93]:
              - generic [ref=e94] [cursor=pointer]:
                - radio "System Clearer ideas. Better learning. — Aa 123" [checked] [ref=e95]
                - generic [ref=e96]:
                  - text: System
                  - generic [ref=e97]: Clearer ideas. Better learning. — Aa 123
              - generic [ref=e98] [cursor=pointer]:
                - radio "Tahoma Clearer ideas. Better learning. — Aa 123" [ref=e99]
                - generic [ref=e100]:
                  - text: Tahoma
                  - generic [ref=e101]: Clearer ideas. Better learning. — Aa 123
              - generic [ref=e102] [cursor=pointer]:
                - radio "Arial Clearer ideas. Better learning. — Aa 123" [ref=e103]
                - generic [ref=e104]:
                  - text: Arial
                  - generic [ref=e105]: Clearer ideas. Better learning. — Aa 123
            - paragraph [ref=e106]: Uses fonts available on your device with suitable fallbacks. No external font downloads are needed.
          - group "Reading text size" [ref=e107]:
            - generic [ref=e109]:
              - generic [ref=e110] [cursor=pointer]:
                - radio "Standard" [checked] [ref=e111]
                - text: Standard
              - generic [ref=e112] [cursor=pointer]:
                - radio "Large" [ref=e113]
                - text: Large
              - generic [ref=e114] [cursor=pointer]:
                - radio "Extra large" [ref=e115]
                - text: Extra large
            - paragraph [ref=e116]: Changes article text and lesson explanations. Code keeps its dedicated monospace font.
      - complementary [ref=e117]:
        - generic [ref=e118]: LIVE PREVIEW
        - generic [ref=e119]: Updates with your choices
        - heading "Knowledge starts with an idea." [level=2] [ref=e120]
        - paragraph [ref=e121]: Every small experiment opens a door to deeper understanding. Choose a comfortable appearance, then focus on what you want to learn and build.
        - code [ref=e122]: Console.WriteLine("Keep learning.");
        - link "Explore the academy" [ref=e123] [cursor=pointer]:
          - /url: ./academy.html#/training
        - paragraph [ref=e128]: Applied live across all pages
    - generic [ref=e131]:
      - generic [ref=e132]:
        - heading "Back to the defaults" [level=2] [ref=e133]
        - paragraph [ref=e134]: Professional blue, light mode, system font, and standard reading size. Your training history stays intact.
      - button "Restore default appearance" [ref=e135] [cursor=pointer]
    - generic [ref=e139]: In this prototype, preferences are local to each demo persona. Account synchronization across devices will be added with the backend.
  - contentinfo [ref=e143]:
    - generic [ref=e144]:
      - link "Abdulnaser Ramadan" [ref=e145] [cursor=pointer]:
        - /url: "#/"
      - paragraph [ref=e148]: Clearer thinking. Better software. Lasting impact.
    - navigation "Footer links" [ref=e149]:
      - link "About" [ref=e150] [cursor=pointer]:
        - /url: "#/about"
      - link "Newsletter" [ref=e151] [cursor=pointer]:
        - /url: "#/newsletter"
      - link "Design system" [ref=e152] [cursor=pointer]:
        - /url: "#/design-system"
      - link "Demo admin" [ref=e153] [cursor=pointer]:
        - /url: "#/admin"
    - generic [ref=e154]:
      - generic [ref=e155]: © 2026 Abdulnaser Ramadan
      - generic [ref=e156]: Thoughtfully designed. Built with purpose.
  - generic [ref=e157]:
    - generic [ref=e159]: INTERACTIVE PROTOTYPE
    - button "State lab" [ref=e160] [cursor=pointer]
```

# Test source

```ts
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
  58  |   await expect(page).toHaveURL(/academy\.html#\/training$/);
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
> 139 |       ).toEqual([]);
      |         ^ Error: [{"id":"color-contrast","nodes":[[".button[href$=\"academy.html#/training\"]"]]}]
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