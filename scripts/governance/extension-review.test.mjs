import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const script = fileURLToPath(new URL('./extension-review.mjs', import.meta.url));
const common = new URL('./common.mjs', import.meta.url).href;

test('extension handoff prepares locally, imports exact review, rejects duplicate/stale results', () => {
  const root = mkdtempSync(join(tmpdir(), 'specialsite-extension-test-'));
  const git = (...args) => execFileSync('git', ['-c', `safe.directory=${root}`, ...args], { cwd: root, stdio: 'pipe' });
  const invoke = (command) => spawnSync(process.execPath, [script, command, '00', '01'], { cwd: root, encoding: 'utf8' });
  try {
    git('init', '-b', 'main');
    writeFileSync(join(root, 'source.txt'), 'test fixture source, not production\n');
    const base = join(root, 'docs/phases/00/round-01');
    mkdirSync(base, { recursive: true });
    writeFileSync(join(root, 'docs/phases/status.json'), JSON.stringify({ activePhase: '00', phases: [{ id: '00', rounds: [] }] }));
    for (const name of ['codex.md', 'security.md', 'remediation.md']) writeFileSync(join(base, name), 'Synthetic integration-test document only. '.repeat(4));
    git('add', '.');
    git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.test', 'commit', '-m', 'fixture');
    const digest = execFileSync(process.execPath, ['--input-type=module', '-e', `import {sourceDigest} from ${JSON.stringify(common)}; console.log(sourceDigest());`], { cwd: root, encoding: 'utf8' }).trim();
    writeFileSync(join(base, 'tests.json'), JSON.stringify({ sourceDigest: digest, checks: [] }));
    const prepared = invoke('prepare');
    assert.equal(prepared.status, 0, prepared.stderr);
    assert.match(prepared.stdout, /No external model/);
    assert.equal(invoke('prepare').status, 1);
    assert.equal(invoke('import').status, 1, 'Missing response must block');
    const request = JSON.parse(readFileSync(join(base, 'request.json'), 'utf8'));
    const raw = { reviewer: 'claude', channel: 'vscode-extension', phase: '00', round: '01', sourceDigest: request.sourceDigest, reviewedAt: new Date().toISOString(), review: { verdict: 'blocked', summary: 'Synthetic test fixture, never a real Claude approval.', findings: [], verifiedClosed: [] } };
    writeFileSync(join(base, 'claude-extension.json'), JSON.stringify(raw));
    writeFileSync(join(root, 'source.txt'), 'changed\n');
    assert.equal(invoke('import').status, 1, 'Changed source must block import');
    writeFileSync(join(root, 'source.txt'), 'test fixture source, not production\n');
    const imported = invoke('import');
    assert.equal(imported.status, 0, imported.stderr);
    const report = JSON.parse(readFileSync(join(base, 'claude.json'), 'utf8'));
    assert.deepEqual(report.review, raw.review);
    assert.equal(report.channel, 'vscode-extension');
    assert.equal('sessionId' in report, false);
    assert.equal(invoke('import').status, 1, 'Cannot overwrite a review');
  } finally {
    const absolute = resolve(root);
    const expectedParent = resolve(tmpdir()) + sep;
    if (!absolute.startsWith(expectedParent) || !absolute.slice(expectedParent.length).startsWith('specialsite-extension-test-')) throw new Error('Unsafe fixture cleanup path');
    rmSync(absolute, { recursive: true, force: true });
  }
});
