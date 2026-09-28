// Post-merge bookkeeping only. Never merges, pushes, or changes GitHub settings.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { git, readJson, sourceDigest } from './common.mjs';
import { validateGate } from './gate.mjs';

export const repository = 'nextleapgit/specialsite';
export const requiredJobs = ['reference-quality', 'governance-security', 'phase-evidence'];
const sha = /^[a-f0-9]{40}$/;
const assert = (condition, message) => { if (!condition) throw new Error(message); };
export const recordPath = (phase) => `docs/phases/${phase}/attempts/completion/record.json`;

export function validateProtection(protection) {
  assert(protection.enforce_admins?.enabled === true, 'Protection must include administrators');
  assert(protection.required_status_checks?.strict === true, 'Require an up-to-date branch');
  const checks = protection.required_status_checks?.checks ?? [];
  for (const name of requiredJobs) assert(checks.some((c) => c.context === name && Number.isInteger(c.app_id) && c.app_id > 0), `Missing app-bound required check: ${name}`);
  assert(protection.allow_force_pushes?.enabled === false && protection.allow_deletions?.enabled === false, 'Force push and deletion must be disabled');
  assert(protection.required_conversation_resolution?.enabled === true, 'Conversation resolution is required');
  const reviews = protection.required_pull_request_reviews;
  assert(reviews && reviews.dismiss_stale_reviews === true, 'Require pull requests and dismissal of stale reviews');
  const bypass = reviews.bypass_pull_request_allowances ?? {};
  assert(['users', 'teams', 'apps'].every((key) => !bypass[key]?.length), 'Review bypass allowances are forbidden');
}

export function validateRun(run, jobs, expectedSha, protection) {
  assert(run.head_sha === expectedSha && run.path === '.github/workflows/quality.yml' && run.event === 'push', 'Wrong workflow, event or source revision');
  assert(run.status === 'completed' && run.conclusion === 'success', 'Workflow is not successful');
  assert(run.repository?.full_name === repository && Number.isInteger(run.id) && run.id > 0 && /^https:\/\/github.com\/nextleapgit\/specialsite\/actions\/runs\/\d+$/.test(run.html_url ?? ''), 'Invalid workflow provenance');
  for (const name of requiredJobs) {
    const matches = jobs.filter((job) => job.name === name);
    assert(matches.length === 1 && matches[0].status === 'completed' && matches[0].conclusion === 'success', `Missing, skipped or unsuccessful job: ${name}`);
    assert(matches[0].head_sha === expectedSha && matches[0].run_id === run.id, 'Job revision/run mismatch');
  }
  assert(new Set(protection.required_status_checks.checks.filter((c) => requiredJobs.includes(c.context)).map((c) => c.app_id)).size === 1, 'Required checks must use the same GitHub Actions app');
}

export function validateRemote(evidence, phase, branch) {
  assert(evidence.repository?.full_name === repository && evidence.repository.private === false, 'Expected the user-authorized public project repository');
  validateProtection(evidence.protection);
  const pr = evidence.pullRequest;
  assert(Number.isInteger(pr?.number) && pr.number > 0 && pr.merged === true && pr.state === 'closed' && Number.isFinite(Date.parse(pr.merged_at)), 'PR has not been merged');
  assert(pr.base?.repo?.full_name === repository && pr.head?.repo?.full_name === repository && pr.base.ref === 'main' && pr.head.ref === branch && branch.startsWith(`phase/${phase}-`), 'Wrong PR repository or branch');
  assert(pr.html_url === `https://github.com/${repository}/pull/${pr.number}` && sha.test(pr.head.sha) && sha.test(pr.merge_commit_sha), 'Invalid PR revision or URL');
  validateRun(evidence.headRun, evidence.headJobs, pr.head.sha, evidence.protection);
  validateRun(evidence.mergeRun, evidence.mergeJobs, pr.merge_commit_sha, evidence.protection);
  assert(evidence.headRun.head_branch === branch && evidence.mergeRun.head_branch === 'main', 'Workflow ran on the wrong branch');
  const appIds = new Set(evidence.protection.required_status_checks.checks.filter((c) => requiredJobs.includes(c.context)).map((c) => c.app_id));
  for (const suite of [evidence.headSuite, evidence.mergeSuite]) {
    assert(suite?.app?.slug === 'github-actions' && appIds.has(suite.app.id), 'Check provider differs from protected required checks');
  }
  assert(evidence.headSuite.id === evidence.headRun.check_suite_id && evidence.mergeSuite.id === evidence.mergeRun.check_suite_id, 'Workflow check suite mismatch');
}

// Reads only GitHub's REST API; token values are never accepted as arguments or printed.
export function github(path, paginate = false, execute = execFileSync) {
  const args = ['api', '--hostname', 'github.com', `repos/${repository}${path ? `/${path}` : ''}`];
  if (paginate) args.push('--paginate', '--slurp');
  return JSON.parse(execute('gh', args, { encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], timeout: 60000, maxBuffer: 16 * 1024 * 1024 }));
}

export function collectRemote(prNumber, api = github) {
  assert(/^[1-9]\d*$/.test(String(prNumber)), 'Expected a pull request number');
  const repo = api('');
  const protection = api('branches/main/protection');
  const pr = api(`pulls/${prNumber}`);
  assert(sha.test(pr.head?.sha ?? '') && sha.test(pr.merge_commit_sha ?? ''), 'PR revisions unavailable');
  const collectRun = (revision) => {
    const runs = api(`actions/workflows/quality.yml/runs?head_sha=${revision}&event=push&per_page=100`, true).flatMap((page) => page.workflow_runs);
    const latest = runs.sort((a, b) => b.run_number - a.run_number || b.run_attempt - a.run_attempt)[0];
    assert(latest, 'No workflow run for revision');
    const jobs = api(`actions/runs/${latest.id}/attempts/${latest.run_attempt}/jobs?per_page=100`, true).flatMap((page) => page.jobs);
    const suite = api(`check-suites/${latest.check_suite_id}`);
    return { run: latest, jobs, suite };
  };
  const head = collectRun(pr.head.sha);
  const merged = collectRun(pr.merge_commit_sha);
  return { repository: { full_name: repo.full_name, private: repo.private }, protection, pullRequest: pr, headRun: head.run, headJobs: head.jobs, headSuite: head.suite, mergeRun: merged.run, mergeJobs: merged.jobs, mergeSuite: merged.suite };
}

export function completedStatus(before, evidence) {
  const result = structuredClone(before);
  const phase = result.phases.find((p) => p.id === result.activePhase);
  const pr = evidence.pullRequest;
  phase.status = 'complete';
  phase.remote = { repository: `https://github.com/${repository}`, protectionVerified: true, pullRequest: pr.html_url, checksPassed: true, headSha: pr.head.sha, mergeSha: pr.merge_commit_sha, mergedChecksPassed: true };
  return result;
}

export function validateCompletion(status, record, digest, before, changedFiles, loadAtMerge) {
  assert(record.schemaVersion === 1 && record.phase === before.activePhase && record.phase === status.activePhase && Number.isFinite(Date.parse(record.verifiedAt)), 'Invalid completion record');
  const phase = before.phases.find((p) => p.id === record.phase);
  assert(record.sourceDigest === digest, 'Source changed after review');
  validateGate(before, digest, loadAtMerge);
  validateRemote(record.evidence, record.phase, phase.branch);
  assert(isDeepStrictEqual(status, completedStatus(before, record.evidence)), 'Completion may change only the verified active-phase status and remote fields');
  const allowed = ['docs/phases/status.json', recordPath(record.phase)];
  assert(changedFiles.length === 2 && new Set(changedFiles).size === 2 && changedFiles.every((p) => allowed.includes(p)), 'Completion must change only status and its new completion record');
  return { phase: record.phase, sourceDigest: digest, mergeAuthorized: false, message: 'Completion evidence is consistent; reverify live GitHub before merging this record-only PR' };
}

export function prepareCompletion(phase, prNumber) {
  assert(/^0[0-8]$/.test(phase), 'Invalid phase');
  assert(git('branch', '--show-current') === `completion/${phase}`, 'Use a separate completion/NN branch created from the verified merged revision');
  assert(!git('status', '--porcelain'), 'Completion requires a clean working tree');
  assert(!existsSync(recordPath(phase)), 'Completion record already exists');
  const before = readJson('docs/phases/status.json');
  assert(before.activePhase === phase, 'Only the active phase can complete');
  const digest = sourceDigest();
  validateGate(before, digest, (p, json) => json ? readJson(p) : readFileSync(p, 'utf8'));
  const evidence = collectRemote(prNumber);
  validateRemote(evidence, phase, before.phases.find((p) => p.id === phase).branch);
  assert(git('rev-parse', 'HEAD') === evidence.pullRequest.merge_commit_sha, 'Start exactly at the verified merge revision');
  const record = { schemaVersion: 1, phase, sourceDigest: digest, verifiedAt: new Date().toISOString(), evidence };
  const after = completedStatus(before, evidence);
  validateCompletion(after, record, digest, before, ['docs/phases/status.json', recordPath(phase)], (p, json) => json ? readJson(p) : readFileSync(p, 'utf8'));
  // No status writes happen until all local and remote verification has succeeded.
  return { record, after };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [command, phase, pr] = process.argv.slice(2);
    assert(command === 'prepare', 'Usage: npm run phase:complete -- NN PR_NUMBER (from VS Code)');
    const { record, after } = prepareCompletion(phase, pr);
    // Directory creation is deliberately after verification.
    const { mkdirSync } = await import('node:fs');
    mkdirSync(`docs/phases/${phase}/attempts/completion`, { recursive: true });
    writeFileSync(recordPath(phase), JSON.stringify(record, null, 2) + '\n', { flag: 'wx' });
    writeFileSync('docs/phases/status.json', JSON.stringify(after, null, 2) + '\n');
    console.log('Prepared record-only changes. Open a protected PR; no remote mutation or phase advance occurred.');
  } catch (error) { console.error(`COMPLETION BLOCKED: ${error.message}`); process.exitCode = 1; }
}
