import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
import { acquireLock, assertSnapshot, decision, receiveReview, reconcileRound, snapshot, verifyImported } from './coordinator.mjs';
import { assertSubscriptionEnvironment, claudeArgs, codexArgs, runProcess, validateCapabilities } from './coordinator-process.mjs';
import { importCli, jsonText, prepareCli, validateCliPacket } from './cli-review.mjs';
import { sha256, sourceDigest, readJson } from './common.mjs';
import { commonChecks, validateGate } from './gate.mjs';

async function fixture(fn) {
  const original = process.cwd(), root = mkdtempSync(join(tmpdir(), 'specialsite-coordinator-test-'));
  const git = (...args) => execFileSync('git', ['-c', `safe.directory=${root}`, ...args], { cwd: root, stdio: 'pipe', encoding: 'utf8' });
  try {
    process.chdir(root); git('init', '-b', 'main');
    const status = { schemaVersion: 1, maxRounds: 4, activePhase: '00', phases: [{ id: '00', status: 'reviewing', branch: 'phase/00-governance', rounds: [], blockers: [] }, ...Array.from({ length: 8 }, (_, i) => ({ id: `0${i + 1}`, status: 'planned' }))] };
    const base = 'docs/phases/00/round-01'; mkdirSync(base+'/logs', { recursive: true });
    writeFileSync('source.txt', 'Synthetic source fixture, not real project evidence.\n');
    writeFileSync('docs/phases/status.json', jsonText(status));
    for (const name of ['codex', 'security', 'remediation']) writeFileSync(`${base}/${name}.md`, 'Synthetic test-only report. '.repeat(5));
    git('add', '.'); git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.test', 'commit', '-m', 'synthetic baseline');
    const digest = sourceDigest();
    const checks = commonChecks.map((name) => ({ name, command: 'synthetic fixture check', startedAt: '2026-09-27T00:00:00Z', finishedAt: '2026-09-27T00:01:00Z', exitCode: 0, log: `logs/${name}.txt`, logHash: sha256('fixture log\n') }));
    for (const c of checks) writeFileSync(`${base}/${c.log}`, 'fixture log\n');
    writeFileSync(`${base}/tests.json`, jsonText({ sourceDigest: digest, checks }));
    const review = { verdict: 'approve', summary: 'Synthetic integration fixture only; not a real Claude approval.', findings: [], verifiedClosed: [] };
    const raw = { type: 'result', subtype: 'success', is_error: false, session_id: 'synthetic-fixture-session', structured_output: review };
    await fn({ root, base, digest, status, raw, git });
  } finally {
    process.chdir(original);
    const absolute = resolve(root), parent = resolve(tmpdir()) + sep;
    if (!absolute.startsWith(parent) || !absolute.slice(parent.length).startsWith('specialsite-coordinator-test-')) throw new Error('Unsafe test cleanup');
    rmSync(absolute, { recursive: true, force: true });
  }
}

test('four-round decision preserves blocked results and never treats missing protection as ready', () => {
  assert.equal(decision({ verdict: 'approve' }, 1), 'verify');
  assert.equal(decision({ verdict: 'approve' }, 1, ['protection missing']), 'blocked');
  assert.equal(decision({ verdict: 'blocked' }, 1), 'blocked');
  assert.equal(decision({ verdict: 'changes_requested' }, 3), 'remediate');
  assert.equal(decision({ verdict: 'changes_requested' }, 4), 'round_limit');
  assert.throws(() => decision({ verdict: 'approve' }, 5));
});
test('explicit blocked restart cannot waive blockers, approve a review or exceed four rounds', () => {
  const review = { verdict: 'blocked' };
  assert.equal(decision(review, 1, [], true), 'remediate');
  assert.equal(decision(review, 1, ['protection missing'], true), 'blocked');
  assert.equal(decision(review, 4, [], true), 'round_limit');
  assert.equal(decision(review, 2), 'blocked', 'A later blocked verdict stops without another explicit restart');
  assert.equal(review.verdict, 'blocked', 'The historic reviewer verdict is never rewritten');
});

test('subscription guard rejects API/provider overrides without exposing their values', () => {
  assert.doesNotThrow(() => assertSubscriptionEnvironment({}));
  for (const key of ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'ANTHROPIC_BASE_URL', 'CLAUDE_CODE_USE_VERTEX']) assert.throws(() => assertSubscriptionEnvironment({ [key]: 'private-test-value' }), (e) => !e.message.includes('private-test-value'));
});
test('provider adapters limit Claude to reading and Codex to workspace sandbox', () => {
  const c = claudeArgs(), o = codexArgs('/fixture', '/fixture/result.txt');
  assert.equal(c[c.indexOf('--tools') + 1], 'Read,Glob,Grep');
  assert.ok(c.includes('--safe-mode') && c.includes('--restricted') && c.includes('--strict-mcp-config'));
  assert.equal(o[o.indexOf('--sandbox') + 1], 'workspace-write');
  assert.ok(o.includes('approval_policy="never"'));
  assert.ok([...c, ...o].every((arg) => !arg.includes('dangerously') && !arg.includes('bypassPermissions')));
});
test('lock prevents duplicate coordinators and release is ownership-bound', () => fixture(async ({root}) => {
  const path=join(root,'.git','test.lock'), release=acquireLock(path);
  assert.throws(()=>acquireLock(path), /EEXIST/); release();
  const release2=acquireLock(path); writeFileSync(path,'different owner'); release2(); assert.ok(existsSync(path));
}));
test('immutable source guard rejects edited and deleted evidence', () => fixture(async () => {
  const before=snapshot(['source.txt']); writeFileSync('source.txt','changed'); assert.throws(()=>assertSnapshot(before));
  rmSync('source.txt'); assert.throws(()=>assertSnapshot(before));
}));
test('real-shaped CLI envelope is preserved, imported once and accepted by evidence gate', () => fixture(async (f) => {
  const request=prepareCli('00','01'); let calls=0;
  const provider=async()=>{calls++;return {exitCode:0,stdout:jsonText(f.raw)};};
  const report=await receiveReview('00','01',provider);
  assert.equal(readFileSync(`${f.base}/claude-raw.json`,'utf8'),jsonText(f.raw));
  assert.equal(report.channel,'cli'); assert.equal(report.sessionId,f.raw.session_id);
  assert.equal(await receiveReview('00','01',provider).then(r=>r.sessionId),f.raw.session_id);
  assert.equal(calls,1,'Recovery must not invoke or bill another review');
  const status=reconcileRound(f.status,'00','01',report);
  assert.deepEqual(status.phases[0].rounds,[1]);
  assert.throws(()=>reconcileRound(status,'00','01',report));
  assert.equal(validateGate(status,f.digest,(p,json)=>json?readJson(p):readFileSync(p,'utf8')).mergeAuthorized,false);
  assert.throws(()=>prepareCli('00','01'),/exists/);
  assert.throws(()=>importCli('00','01'),/EEXIST/);
  writeFileSync(`${f.base}/claude-raw.json`,jsonText({...f.raw,total_cost_usd:0}));
  assert.throws(()=>verifyImported('00','01'),/changed/);
  assert.throws(()=>validateGate(status,f.digest,(p,json)=>json?readJson(p):readFileSync(p,'utf8')),/mismatch/);
  assert.equal(request.sourceDigest,f.digest);
}));
test('interrupted import recovers the already received raw result without contacting Claude again', () => fixture(async (f) => {
  prepareCli('00','01'); writeFileSync(`${f.base}/claude-raw.json`,jsonText(f.raw));
  const report=await receiveReview('00','01',async()=>{throw new Error('must not invoke');});
  assert.equal(report.sessionId,f.raw.session_id);
}));
for (const [name, mutate] of [
  ['source changes', f=>writeFileSync('source.txt','changed')],
  ['status changes', f=>writeFileSync('docs/phases/status.json','{}')],
  ['report changes', f=>writeFileSync(`${f.base}/security.md`,'changed')],
]) test(`review freezes ${name}`,()=>fixture(async f=>{
  prepareCli('00','01');
  await assert.rejects(()=>receiveReview('00','01',async()=>{mutate(f);return {exitCode:0,stdout:jsonText(f.raw)};}));
  assert.equal(existsSync(`${f.base}/claude-raw.json`),false);
  assert.equal(existsSync(`${f.base}/claude.json`),false);
}));
for(const [name,result] of [ ['process failure',{exitCode:1,stdout:'partial'}], ['malformed response',{exitCode:0,stdout:'not json'}], ['timeout',{exitCode:0,timedOut:true,stdout:'{}'}], ['provider error',{exitCode:0,stdout:jsonText({type:'result',subtype:'error',is_error:true})}] ])test(`no completed round for ${name}`,()=>fixture(async f=>{
  prepareCli('00','01');await assert.rejects(()=>receiveReview('00','01',async()=>result));assert.equal(existsSync(`${f.base}/claude.json`),false);assert.deepEqual(readJson('docs/phases/status.json').phases[0].rounds,[]);
}));
test('CLI packet rejects missing required checks and modified evidence',()=>fixture(async f=>{
  const tests=readJson(`${f.base}/tests.json`); tests.checks.pop();writeFileSync(`${f.base}/tests.json`,jsonText(tests));
  assert.throws(()=>prepareCli('00','01'),/incomplete/);
}));
test('CLI packet detects modified local evidence even when source fingerprint is unchanged',()=>fixture(async f=>{
  const request=prepareCli('00','01');writeFileSync(`${f.base}/codex.md`,'changed report');
  assert.throws(()=>validateCliPacket(request,f.base,p=>readFileSync(p,'utf8')),/changed/);
}));
test('subprocess sends prompt as literal stdin and times out without accepting partial success',async()=>{
  const input='literal $() `quotes` ; & prompt';
  const r=await runProcess(process.execPath,['-e',"process.stdin.pipe(process.stdout)"],{input,timeoutMs:5000});
  assert.equal(r.exitCode,0);assert.equal(r.stdout,input);
  const timeout=await runProcess(process.execPath,['-e','setInterval(()=>{},1000)'],{timeoutMs:100});assert.equal(timeout.timedOut,true);
  const missing=await runProcess(join(tmpdir(),'specialsite-missing-executable'),[],{timeoutMs:1000});assert.notEqual(missing.exitCode,0);assert.ok(missing.error);
});

test('older CLI versions cannot silently remove required protections', () => {
  const claude='--safe-mode --restricted --permission-prompts --json-schema --strict-mcp-config', codex='--ignore-user-config --sandbox --json';
  assert.doesNotThrow(()=>validateCapabilities(claude,codex));
  assert.throws(()=>validateCapabilities('--json-schema',codex),/Claude version/);
  assert.throws(()=>validateCapabilities(claude,'--json'),/Codex version/);
});
