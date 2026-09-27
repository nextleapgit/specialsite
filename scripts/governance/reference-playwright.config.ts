import reference from '../../reference/prototype/playwright.config';
import { fileURLToPath } from 'node:url';
const referenceDir = fileURLToPath(new URL('../../reference/prototype/', import.meta.url));
export default {
  ...reference,
  outputDir: referenceDir + 'test-results',
  reporter: [['list'], ['html', { open: 'never', outputFolder: referenceDir + 'playwright-report' }]],
  webServer: { ...reference.webServer, cwd: referenceDir },
  projects: [
    {
      name: '',
      testDir: referenceDir + 'tests',
      use: { ...reference.use, reducedMotion: 'reduce' },
    },
    {
      name: 'normal-motion',
      testDir: fileURLToPath(new URL('./browser-tests/', import.meta.url)),
      testMatch: 'reference-motion.spec.ts',
      use: { ...reference.use, reducedMotion: 'no-preference' },
    },
  ],
};
