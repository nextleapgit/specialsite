import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const reference = fileURLToPath(new URL('../../reference/prototype/', import.meta.url));
const cli = fileURLToPath(new URL('../../reference/prototype/node_modules/@playwright/test/cli.js', import.meta.url));
const config = fileURLToPath(new URL('./reference-playwright.config.ts', import.meta.url));
const result = spawnSync(process.execPath, [cli, 'test', '--config', config, ...process.argv.slice(2)], { cwd: reference, stdio: 'inherit', windowsHide: true });
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
