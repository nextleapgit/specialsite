import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectRemote, completedStatus, recordPath, requiredJobs, validateCompletion, validateRemote } from './completion.mjs';
import { commonChecks } from './gate.mjs';
import { sha256 } from './common.mjs';

// All GitHub/reviewer data below is synthetic test data, never project evidence.
function fixture() {
  const repository = { full_name: 'nextleapgit/specialsite', private: false };
  const branch = 'phase/00-governance';
  const headSha = 'a'.repeat(40), mergeSha = 'b'.repeat(40), digest = 'c'.repeat(64);
  const protection = {
    enforce_admins: { enabled: true }, required_status_checks: { strict: true, checks: requiredJobs.map((context) => ({ context, app_id: 15368 })) },
    allow_force_pushes: { enabled: false }, allow_deletions: { enabled: false }, required_conversation_resolution: { enabled: true },
    required_pull_request_reviews: { dismiss_stale_reviews: true, bypass_pull_request_allowances: { users: [], teams: [], apps: [] } },
  };
  const run = (id, revision, branch) => ({ id, head_sha: revision, head_branch: branch, check_suite_id: id + 10, repository, path: '.github/workflows/quality.yml', event: 'push', status: 'completed', conclusion: 'success', html_url: `https://github.com/nextleapgit/specialsite/actions/runs/${id}`, run_number: id, run_attempt: 1 });
  const jobs = (run) => requiredJobs.map((name) => ({ name, run_id: run.id, head_sha: run.head_sha, status: 'completed', conclusion: 'success' }));
  const headRun = run(1, headSha, branch), mergeRun = run(2, mergeSha, 'main');
  const evidence = { repository, protection, pullRequest: { number: 1, merged: true, state: 'closed', merged_at: '2026-09-27T01:00:00Z', html_url: 'https://github.com/nextleapgit/specialsite/pull/1', head: { repo: repository, ref: branch, sha: headSha }, base: { repo: repository, ref: 'main' }, merge_commit_sha: mergeSha }, headRun, mergeRun, headJobs: jobs(headRun), mergeJobs: jobs(mergeRun), headSuite: { id: 11, app: { id: 15368, slug: 'github-actions' } }, mergeSuite: { id: 12, app: { id: 15368, slug: 'github-actions' } } };
  const before = { schemaVersion: 1, activePhase: '00', maxRounds: 4, phases: [{ id: '00', branch, status: 'reviewing', rounds: [1], blockers: [] }, ...Array.from({ length: 8 }, (_, i) => ({ id: `0${i + 1}`, status: 'planned' }))] };
  const review = { verdict: 'approve', summary: 'Synthetic fixture only, not an actual review.', findings: [], verifiedClosed: [] };
  const raw = { reviewer: 'claude', channel: 'vscode-extension', phase: '00', round: '01', sourceDigest: digest, reviewedAt: '2026-09-27T00:00:00Z', review };
  const input = 'Synthetic review fixture';
  const base = 'docs/phases/00/round-01/';
  const files = {
    [base + 'claude-input.txt']: input,
    [base + 'claude-extension.json']: JSON.stringify(raw),
    [base + 'claude.json']: { reviewer: 'claude', channel: 'vscode-extension', sourceDigest: digest, reviewedAt: raw.reviewedAt, inputHash: sha256(input), rawHash: sha256(JSON.stringify(raw)), review },
    [base + 'request.json']: { phase: '00', round: '01', sourceDigest: digest, inputHash: sha256(input) },
    [base + 'tests.json']: { sourceDigest: digest, checks: commonChecks.map((name) => ({ name, command: 'synthetic check', startedAt: raw.reviewedAt, finishedAt: raw.reviewedAt, exitCode: 0, log: `logs/${name}.txt`, logHash: sha256('synthetic log\n') })) },
  };
  for (const name of commonChecks) files[base + `logs/${name}.txt`] = 'synthetic log\n';
  for (const name of ['codex', 'security', 'remediation']) files[base + `${name}.md`] = 'Synthetic fixture, never real project evidence. '.repeat(4);
  const record = { schemaVersion: 1, phase: '00', sourceDigest: digest, verifiedAt: '2026-09-27T02:00:00Z', evidence };
  const after = completedStatus(before, evidence);
  const changed = ['docs/phases/status.json', recordPath('00')];
  const load = (p) => { assert.ok(p in files, `Missing fixture ${p}`); return files[p]; };
  return { evidence, branch, digest, before, after, record, files, changed, load, run: () => validateCompletion(after, record, digest, before, changed, load) };
}

test('completion records a real-shaped post-merge event without authorizing a merge or advancing phase', () => {
  const f = fixture();
  assert.equal(f.run().mergeAuthorized, false);
  assert.equal(f.after.activePhase, '00');
  assert.equal(f.after.phases[1].status, 'planned');
  assert.equal(f.before.phases[0].status, 'reviewing');
});
for (const [name, mutate] of [
  ['unmerged PR', (f) => f.evidence.pullRequest.merged = false],
  ['wrong head branch', (f) => f.evidence.pullRequest.head.ref = 'other'],
  ['forked repository', (f) => f.evidence.pullRequest.head.repo = { full_name: 'other/repo' }],
  ['unapproved visibility change', (f) => f.evidence.repository.private = true],
  ['failed newer workflow', (f) => f.evidence.headRun.conclusion = 'failure'],
  ['cancelled merged workflow', (f) => f.evidence.mergeRun.conclusion = 'cancelled'],
  ['skipped merged check', (f) => f.evidence.mergeJobs[0].conclusion = 'skipped'],
  ['missing merged check', (f) => f.evidence.mergeJobs.pop()],
  ['duplicated job', (f) => f.evidence.headJobs.push(f.evidence.headJobs[0])],
  ['wrong workflow source', (f) => f.evidence.mergeRun.head_sha = 'd'.repeat(40)],
  ['PR event substituted for push verification', (f) => f.evidence.mergeRun.event = 'pull_request'],
  ['wrong job revision', (f) => f.evidence.mergeJobs[0].head_sha = 'd'.repeat(40)],
  ['wrong job run', (f) => f.evidence.mergeJobs[0].run_id = 55],
  ['administrator bypass', (f) => f.evidence.protection.enforce_admins.enabled = false],
  ['stale branch allowed', (f) => f.evidence.protection.required_status_checks.strict = false],
  ['missing check protection', (f) => f.evidence.protection.required_status_checks.checks.pop()],
  ['unbound check provider', (f) => f.evidence.protection.required_status_checks.checks[0].app_id = -1],
  ['wrong check provider', (f) => f.evidence.mergeSuite.app.slug = 'other-app'],
  ['wrong check suite', (f) => f.evidence.mergeSuite.id = 99],
  ['force push allowed', (f) => f.evidence.protection.allow_force_pushes.enabled = true],
  ['branch deletion allowed', (f) => f.evidence.protection.allow_deletions.enabled = true],
  ['conversation bypass', (f) => f.evidence.protection.required_conversation_resolution.enabled = false],
  ['review bypass actor', (f) => f.evidence.protection.required_pull_request_reviews.bypass_pull_request_allowances.users.push({ login: 'fixture' })],
  ['no pull request requirement', (f) => delete f.evidence.protection.required_pull_request_reviews],
  ['source smuggled into completion', (f) => f.changed.push('source.txt')],
  ['excluded evidence smuggled into completion', (f) => f.changed.push('docs/phases/00/round-01/claude.json')],
  ['status-only completion', (f) => f.changed.pop()],
  ['changed phase scope', (f) => f.after.phases[0].branch = 'phase/00-other'],
  ['early next phase', (f) => f.after.phases[1].status = 'implementing'],
  ['open blocker', (f) => f.before.phases[0].blockers.push('unavailable protection')],
  ['missing actual review', (f) => delete f.files['docs/phases/00/round-01/claude-extension.json']],
  ['tampered log', (f) => f.files['docs/phases/00/round-01/logs/lint.txt'] = 'forged'],
  ['stale source', (f) => f.record.sourceDigest = 'd'.repeat(64)],
]) test(`completion rejects ${name}`, () => { const f = fixture(); mutate(f); assert.throws(f.run); });

test('remote collector follows pagination and rejects newest failed run instead of reusing old success', () => {
  const f = fixture();
  const calls = [];
  const api = (path, paginate) => {
    calls.push([path, paginate]);
    if (!path) return f.evidence.repository;
    if (path === 'branches/main/protection') return f.evidence.protection;
    if (path === 'pulls/1') return f.evidence.pullRequest;
    if (path.startsWith('actions/workflows/')) {
      assert.equal(paginate, true);
      const run = path.includes('a'.repeat(40)) ? f.evidence.headRun : f.evidence.mergeRun;
      return [{ workflow_runs: [{ ...run, id: 0, run_number: 0 }] }, { workflow_runs: [run] }];
    }
    if (path.includes('/jobs?')) { assert.equal(paginate, true); return [{ jobs: path.startsWith('actions/runs/1/') ? f.evidence.headJobs : f.evidence.mergeJobs }]; }
    if (path === 'check-suites/11') return f.evidence.headSuite;
    if (path === 'check-suites/12') return f.evidence.mergeSuite;
    throw new Error('Unexpected fixture API endpoint');
  };
  validateRemote(collectRemote(1, api), '00', f.branch);
  f.evidence.headRun.conclusion = 'failure';
  assert.throws(() => validateRemote(collectRemote(1, api), '00', f.branch), /not successful/);
  assert.ok(calls.length > 0);
  assert.throws(() => collectRemote('1; echo injected', api), /number/);
  assert.throws(() => collectRemote(1, () => { throw new Error('HTTP 403'); }), /403/);
});

test('CLI validates record-only Git changes against immutable merge source and review evidence', () => {
  const root = mkdtempSync(join(tmpdir(), 'specialsite-completion-test-'));
  const script = fileURLToPath(new URL('./phase-gate.mjs', import.meta.url));
  const common = new URL('./common.mjs', import.meta.url).href;
  const git = (...args) => execFileSync('git', ['-c', `safe.directory=${root}`, ...args], { cwd: root, encoding: 'utf8', stdio: 'pipe' }).trim();
  const write = (path, content) => { mkdirSync(resolve(root, path, '..'), { recursive: true }); writeFileSync(join(root, path), typeof content === 'string' ? content : JSON.stringify(content) + '\n'); };
  const invoke = () => spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });
  try {
    git('init', '-b', 'main');
    git('config', 'user.name', 'Synthetic Fixture');
    git('config', 'user.email', 'fixture@example.test');
    write('source.txt', 'fixture source\n');
    git('add', '.');
    const digest = execFileSync(process.execPath, ['--input-type=module', '-e', `import {sourceDigest} from ${JSON.stringify(common)}; console.log(sourceDigest());`], { cwd: root, encoding: 'utf8' }).trim();
    const f = fixture();
    for (const [path, content] of Object.entries(f.files)) write(path, typeof content === 'string' ? content.replaceAll(f.digest, digest) : JSON.parse(JSON.stringify(content).replaceAll(f.digest, digest)));
    const rawPath = 'docs/phases/00/round-01/claude-extension.json';
    const reportPath = 'docs/phases/00/round-01/claude.json';
    const report = JSON.parse(readFileSync(join(root, reportPath), 'utf8'));
    report.rawHash = sha256(readFileSync(join(root, rawPath), 'utf8'));
    write(reportPath, report);
    write('docs/phases/status.json', f.before);
    git('add', '.'); git('commit', '-m', 'synthetic merged phase');
    const revision = git('rev-parse', 'HEAD');
    f.evidence.pullRequest.merge_commit_sha = revision;
    f.evidence.mergeRun.head_sha = revision;
    f.evidence.mergeJobs.forEach((j) => j.head_sha = revision);
    f.record.sourceDigest = digest;
    git('switch', '-c', 'completion/00');
    write(recordPath('00'), f.record);
    write('docs/phases/status.json', completedStatus(f.before, f.evidence));
    git('add', '.');
    let result = invoke();
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /consistent/);
    git('commit', '-m', 'synthetic completion record');
    git('switch', '-c', 'phase/01-contracts');
    const next = completedStatus(f.before, f.evidence);
    next.activePhase = '01'; next.phases[1].status = 'implementing';
    write('docs/phases/status.json', next);
    result = invoke();
    assert.equal(result.status, 1, 'Unmerged predecessor completion must block the next phase');
    write('docs/phases/status.json', completedStatus(f.before, f.evidence));
    git('switch', 'completion/00');
    write('source.txt', 'hidden source change\n');
    result = invoke();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Source changed/);
    write('source.txt', 'fixture source\n');
    write('docs/phases/00/attempts/hidden.txt', 'excluded from digest but forbidden in completion');
    git('add', '.');
    result = invoke();
    assert.equal(result.status, 1);
    assert.match(result.stderr, /only status/);
  } finally {
    const absolute = resolve(root), parent = resolve(tmpdir()) + sep;
    if (!absolute.startsWith(parent) || !absolute.slice(parent.length).startsWith('specialsite-completion-test-')) throw new Error('Unsafe fixture cleanup');
    rmSync(absolute, { recursive: true, force: true });
  }
});
