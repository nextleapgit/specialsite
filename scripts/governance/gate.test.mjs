import test from 'node:test';
import assert from 'node:assert/strict';
import { validateGate, commonChecks } from './gate.mjs';
import { parseClaude, sha256 } from './common.mjs';
import { parseExtension } from './extension-review.mjs';

function fixture() {
  const digest = 'a'.repeat(64);
  const phase = { id: '00', status: 'reviewing', branch: 'phase/00-governance', blockers: [], rounds: [1] };
  const status = { schemaVersion: 1, maxRounds: 4, activePhase: '00', phases: [phase, ...Array.from({ length: 8 }, (_, i) => ({ id: `0${i + 1}`, status: 'planned' }))] };
  const base = 'docs/phases/00/round-01/';
  const review = { verdict: 'approve', summary: 'Reviewed test fixture only.', findings: [], verifiedClosed: [] };
  const raw = { type: 'result', subtype: 'success', is_error: false, session_id: 'fixture', result: JSON.stringify(review) };
  const files = {
    [base + 'claude.json']: { reviewer: 'claude', sourceDigest: digest, sessionId: 'fixture', inputHash: sha256('fixture input'), review },
    [base + 'claude-raw.json']: raw,
    [base + 'claude-input.txt']: 'fixture input',
    [base + 'codex.md']: 'Test fixture document. '.repeat(5),
    [base + 'security.md']: 'Test fixture document. '.repeat(5),
    [base + 'remediation.md']: 'Test fixture document. '.repeat(5),
    [base + 'tests.json']: { sourceDigest: digest, checks: commonChecks.map((name) => ({ name, command: 'fixture command', startedAt: '2026-09-26T00:00:00Z', finishedAt: '2026-09-26T00:01:00Z', exitCode: 0, log: `logs/${name}.txt`, logHash: sha256('fixture log') })) },
  };
  for (const name of commonChecks) files[base + `logs/${name}.txt`] = 'fixture log';
  return { digest, status, phase, files, base, run: () => validateGate(status, digest, (p) => { if (!(p in files)) throw new Error('Missing file'); return files[p]; }) };
}

test('valid evidence passes but never authorizes merge itself', () => assert.equal(fixture().run().mergeAuthorized, false));
const rejected = [
  ['missing review', (f) => delete f.files[f.base + 'claude.json']],
  ['stale review', (f) => f.files[f.base + 'claude.json'].sourceDigest = 'b'.repeat(64)],
  ['forged extraction', (f) => f.files[f.base + 'claude.json'].review.summary = 'Changed'],
  ['Claude runtime error', (f) => f.files[f.base + 'claude-raw.json'].is_error = true],
  ['missing provenance', (f) => delete f.files[f.base + 'claude-raw.json'].session_id],
  ['changed input', (f) => f.files[f.base + 'claude-input.txt'] += 'changed'],
  ['changed log', (f) => f.files[f.base + 'logs/lint.txt'] += 'changed'],
  ['failed regression', (f) => f.files[f.base + 'tests.json'].checks[0].exitCode = 1],
  ['missing mandatory security test', (f) => f.files[f.base + 'tests.json'].checks.pop()],
  ['duplicated test name', (f) => f.files[f.base + 'tests.json'].checks.push(f.files[f.base + 'tests.json'].checks[0])],
  ['traversal log path', (f) => f.files[f.base + 'tests.json'].checks[0].log = '../other.txt'],
  ['unresolved blocker', (f) => f.phase.blockers.push('credential missing')],
  ['fifth round', (f) => f.phase.rounds = [1, 2, 3, 4, 5]],
  ['reset round count', (f) => f.phase.rounds = [2]],
  ['later phase starts early', (f) => f.status.phases[1].status = 'implementing'],
  ['missing predecessor merge', (f) => { f.status.activePhase = '01'; f.phase.status = 'complete'; }],
  ['weakened policy', (f) => f.status.maxRounds = 5],
  ['reordered phases', (f) => f.status.phases.reverse()],
  ['incomplete document', (f) => f.files[f.base + 'security.md'] = 'TODO'],
];
for (const [name, mutate] of rejected) test(`rejects ${name}`, () => { const f = fixture(); mutate(f); assert.throws(f.run); });
test('approval cannot contain open defects', () => assert.throws(() => parseClaude({ type: 'result', subtype: 'success', session_id: 'fixture', structured_output: { verdict: 'approve', summary: 'Bad', verifiedClosed: [], findings: [{ id: 'X', severity: 'high', file: 'x', description: 'x', verification: 'x' }] } })));
test('prior finding cannot disappear without independent closure', () => {
  const f = fixture();
  const second = f.base.replace('01/', '02/');
  for (const [path, content] of Object.entries(f.files)) f.files[path.replace(f.base, second)] = structuredClone(content);
  const first = { verdict: 'changes_requested', summary: 'Defect found', verifiedClosed: [], findings: [{ id: 'R1', severity: 'high', file: 'x', description: 'x', verification: 'x' }] };
  f.files[f.base + 'claude.json'].review = first;
  f.files[f.base + 'claude-raw.json'].result = JSON.stringify(first);
  f.phase.rounds = [1, 2];
  assert.throws(f.run, /every finding/);
  f.files[second + 'claude.json'].review.verifiedClosed = ['R1'];
  f.files[second + 'claude-raw.json'].result = JSON.stringify(f.files[second + 'claude.json'].review);
  assert.equal(f.run().rounds, 2);
});

function extensionFixture() {
  const f = fixture();
  const raw = { reviewer: 'claude', channel: 'vscode-extension', phase: '00', round: '01', sourceDigest: f.digest, reviewedAt: '2026-09-26T12:00:00.000Z', review: f.files[f.base + 'claude.json'].review };
  const rawText = JSON.stringify(raw);
  f.files[f.base + 'claude-extension.json'] = rawText;
  f.files[f.base + 'request.json'] = { phase: '00', round: '01', sourceDigest: f.digest, inputHash: sha256('fixture input') };
  Object.assign(f.files[f.base + 'claude.json'], { channel: 'vscode-extension', rawHash: sha256(rawText), reviewedAt: raw.reviewedAt });
  delete f.files[f.base + 'claude.json'].sessionId;
  delete f.files[f.base + 'claude-raw.json'];
  return { ...f, raw };
}
test('accepts explicitly labeled extension review without inventing CLI session', () => assert.equal(extensionFixture().run().phase, '00'));
for (const [name, mutate] of [
  ['modified original response', (f) => f.files[f.base + 'claude-extension.json'] += ' '],
  ['different request digest', (f) => f.files[f.base + 'request.json'].sourceDigest = 'b'.repeat(64)],
  ['different request round', (f) => f.files[f.base + 'request.json'].round = '02'],
  ['missing original extension response', (f) => delete f.files[f.base + 'claude-extension.json']],
  ['changed extracted verdict', (f) => f.files[f.base + 'claude.json'].review = { ...f.raw.review, verdict: 'blocked' }],
  ['unknown review channel', (f) => f.files[f.base + 'claude.json'].channel = 'self-review'],
]) test(`extension gate rejects ${name}`, () => { const f = extensionFixture(); mutate(f); assert.throws(f.run); });
for (const [name, change] of [
  ['wrong reviewer', { reviewer: 'codex' }], ['wrong phase', { phase: '01' }], ['wrong round', { round: '02' }],
  ['stale source', { sourceDigest: 'c'.repeat(64) }], ['missing timestamp', { reviewedAt: '' }],
]) test(`extension parser rejects ${name}`, () => { const f = extensionFixture(); assert.throws(() => parseExtension({ ...f.raw, ...change }, '00', '01', f.digest)); });
