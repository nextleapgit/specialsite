import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { parseClaude, readJson, sha256, sourceDigest } from './common.mjs';
import { parseExtension } from './extension-review.mjs';

export const commonChecks = ['lint', 'typecheck', 'unit-component', 'governance', 'build', 'budgets', 'e2e-accessibility-visual', 'dependency-audit', 'secret-scan'];
const phaseChecks = {
  '00': [], '01': ['contract-validation', 'threat-model-review'],
  '02': ['postgres-integration', 'identity-security'],
  '03': ['postgres-integration', 'identity-security', 'content-security'],
  '04': ['postgres-integration', 'identity-security', 'content-security', 'training-integration'],
  '05': ['postgres-integration', 'identity-security', 'content-security', 'training-integration', 'runner-isolation'],
  '06': ['postgres-integration', 'identity-security', 'content-security', 'training-integration', 'runner-isolation', 'ai-contract-security'],
  '07': ['postgres-integration', 'identity-security', 'content-security', 'training-integration', 'runner-isolation', 'ai-contract-security', 'delivery-security'],
  '08': ['postgres-integration', 'identity-security', 'content-security', 'training-integration', 'runner-isolation', 'ai-contract-security', 'delivery-security', 'dast', 'load', 'restore-rollback', 'release-security'],
};

export function validateGate(status, digest, load) {
  const fail = (message) => { throw new Error(message); };
  if (status.schemaVersion !== 1 || status.maxRounds !== 4 || !Array.isArray(status.phases)) fail('Invalid phase policy');
  const ids = Object.keys(phaseChecks);
  if (status.phases.map((p) => p.id).join() !== ids.join()) fail('Phase register reordered or incomplete');
  const index = ids.indexOf(status.activePhase);
  if (index < 0) fail('Unknown active phase');
  for (const p of status.phases.slice(0, index)) {
    if (p.status !== 'complete' || !/^[a-f0-9]{40}$/.test(p.remote?.mergeSha ?? '') || !p.remote?.mergedChecksPassed || !p.remote?.protectionVerified || !p.remote?.pullRequest) fail(`Predecessor ${p.id} is not verified complete`);
  }
  if (status.phases.slice(index + 1).some((p) => p.status !== 'planned')) fail('Later phase has started');
  const phase = status.phases[index];
  if (!['reviewing', 'ready'].includes(phase.status) || phase.blockers?.length) fail('Active phase is blocked or not in review');
  if (!new RegExp(`^phase/${phase.id}-[a-z0-9-]+$`).test(phase.branch ?? '')) fail('Invalid phase branch');
  if (!Array.isArray(phase.rounds) || phase.rounds.length < 1 || phase.rounds.length > 4) fail('Require one to four completed rounds');
  const open = new Set();
  let last;
  phase.rounds.forEach((n, i) => {
    if (n !== i + 1) fail('Rounds must be contiguous and cannot reset');
    const base = `docs/phases/${phase.id}/round-${String(n).padStart(2, '0')}/`;
    const report = load(base + 'claude.json', true);
    let review;
    if (report.channel === 'vscode-extension') {
      const rawText = load(base + 'claude-extension.json');
      const raw = JSON.parse(rawText);
      const request = load(base + 'request.json', true);
      if (request.phase !== phase.id || request.round !== String(n).padStart(2, '0') || request.sourceDigest !== report.sourceDigest || request.inputHash !== report.inputHash || report.rawHash !== sha256(rawText) || report.reviewedAt !== raw.reviewedAt) fail('Extension review evidence mismatch');
      review = parseExtension(raw, phase.id, String(n).padStart(2, '0'), report.sourceDigest);
    } else if (!report.channel || report.channel === 'cli') {
      const raw = load(base + 'claude-raw.json', true);
      review = parseClaude(raw);
      if (report.sessionId !== raw.session_id) fail('CLI session mismatch');
    } else fail('Unsupported review channel');
    if (JSON.stringify(review) !== JSON.stringify(report.review) || report.reviewer !== 'claude') fail('Review is not an exact extraction of Claude output');
    if (!/^[a-f0-9]{64}$/.test(report.sourceDigest ?? '') || report.inputHash !== sha256(load(base + 'claude-input.txt'))) fail('Review input integrity failed');
    for (const name of ['codex.md', 'security.md', 'remediation.md']) {
      if (load(base + name).trim().length < 80) fail(`Missing substantive ${name}`);
    }
    const tests = load(base + 'tests.json', true);
    if (tests.sourceDigest !== report.sourceDigest || !Array.isArray(tests.checks)) fail('Test evidence is stale or missing');
    if (new Set(tests.checks.map((c) => c.name)).size !== tests.checks.length) fail('Duplicate checks');
    const required = [...commonChecks, ...phaseChecks[phase.id]];
    for (const name of required) {
      const check = tests.checks.find((c) => c.name === name);
      if (!check || !check.command || !check.startedAt || !check.finishedAt || !Number.isInteger(check.exitCode)) fail(`Missing evidence: ${name}`);
      if (!new RegExp(`^logs/[a-z0-9-]+\\.txt$`).test(check.log ?? '') || check.logHash !== sha256(load(base + check.log))) fail(`Invalid log: ${name}`);
      if (i === phase.rounds.length - 1 && check.exitCode !== 0) fail(`Required check failed: ${name}`);
    }
    for (const id of review.verifiedClosed) {
      if (!open.has(id)) fail(`Cannot close unknown finding ${id}`);
      open.delete(id);
    }
    for (const finding of review.findings) open.add(finding.id);
    last = report;
  });
  if (last.sourceDigest !== digest) fail('Source changed since Claude review');
  if (last.review.verdict !== 'approve' || open.size) fail('Claude has not verified every finding closed');
  return { phase: phase.id, rounds: phase.rounds.length, sourceDigest: digest, mergeAuthorized: false, message: 'Evidence gate passed; live GitHub checks/protection still required before merge' };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    console.log(JSON.stringify(validateGate(readJson('docs/phases/status.json'), sourceDigest(), (p, json) => json ? readJson(p) : readFileSync(p, 'utf8')), null, 2));
  } catch (error) { console.error(`PHASE BLOCKED: ${error.message}`); process.exitCode = 1; }
}
