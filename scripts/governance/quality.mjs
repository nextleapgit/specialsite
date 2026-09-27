import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { sourceDigest, sha256 } from './common.mjs';

const phase = process.argv[2] ?? '00';
const round = process.argv[3] ?? '01';
if (!/^\d{2}$/.test(phase) || !/^0[1-4]$/.test(round)) throw new Error('Usage: npm run quality -- NN 01..04');
const base = `docs/phases/${phase}/round-${round}`;
if (existsSync(`${base}/tests.json`)) throw new Error('Evidence already exists; do not overwrite a submitted round');
const digest = sourceDigest();
mkdirSync(`${base}/logs`, { recursive: true });
const commands = [
  ['lint', 'npm run lint'], ['typecheck', 'npm run typecheck'], ['unit-component', 'npm test'],
  ['governance', 'npm run test:governance'], ['build', 'npm run build'], ['budgets', 'npm run check:budgets'],
  ['e2e-accessibility-visual', 'npm run test:e2e'], ['dependency-audit', 'npm run audit:reference'], ['secret-scan', 'npm run check:secrets'],
];
const checks = [];
for (const [name, command] of commands) {
  console.log(`Running ${name}`);
  const startedAt = new Date().toISOString();
  // Commands are static, never derived from review text or manifest values.
  const result = spawnSync(command, { shell: true, encoding: 'utf8', timeout: 15 * 60 * 1000, windowsHide: true });
  const log = `${result.stdout ?? ''}\n${result.stderr ?? ''}\n${result.error?.message ?? ''}`;
  writeFileSync(`${base}/logs/${name}.txt`, log);
  checks.push({ name, command, startedAt, finishedAt: new Date().toISOString(), exitCode: result.status ?? 1, log: `logs/${name}.txt`, logHash: sha256(log) });
  console.log(`${name}: exit ${result.status ?? 1}`);
}
writeFileSync(`${base}/tests.json`, JSON.stringify({ sourceDigest: digest, checks }, null, 2) + '\n');
if (digest !== sourceDigest()) throw new Error('Source changed during tests; evidence is stale');
if (checks.some((c) => c.exitCode !== 0)) process.exitCode = 1;
