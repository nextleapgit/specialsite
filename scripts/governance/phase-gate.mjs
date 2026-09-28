import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { isDeepStrictEqual } from 'node:util';
import { git, readJson, sourceDigest, sourceDigestAt } from './common.mjs';
import { validateGate } from './gate.mjs';
import { collectRemote, completedStatus, recordPath, validateCompletion, validateRemote } from './completion.mjs';

// Read immutable merge evidence byte-for-byte so log hashes remain meaningful.
const at = (revision) => (path, json) => {
  const text = execFileSync('git', ['-c', `safe.directory=${process.cwd()}`, 'show', `${revision}:${path}`], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, windowsHide: true });
  return json ? JSON.parse(text) : text;
};
try {
  const live = process.argv.includes('--live');
  const status = readJson('docs/phases/status.json');
  const active = status.phases.find((p) => p.id === status.activePhase);
  for (const phase of status.phases.filter((p) => p.status === 'complete')) {
    const record = readJson(recordPath(phase.id));
    const mergeSha = record.evidence?.pullRequest?.merge_commit_sha;
    if (!/^[a-f0-9]{40}$/.test(mergeSha ?? '')) throw new Error('Missing completion merge revision');
    git('merge-base', '--is-ancestor', mergeSha, 'HEAD');
    if (sourceDigestAt(mergeSha) !== record.sourceDigest) throw new Error('Merged source differs from reviewed source');
    const load = at(mergeSha);
    const before = load('docs/phases/status.json', true);
    const expected = completedStatus(before, record.evidence);
    if (!isDeepStrictEqual(phase, expected.phases.find((p) => p.id === phase.id))) throw new Error('Completed phase status was altered');
    if (phase.id === status.activePhase) {
      const changed = git('diff', '--name-only', mergeSha).split('\n').filter(Boolean);
      console.log(JSON.stringify(validateCompletion(status, record, sourceDigest(), before, changed, load)));
    } else {
      let main;
      try { main = git('rev-parse', 'refs/remotes/origin/main'); }
      catch { main = git('rev-parse', 'refs/heads/main'); }
      git('merge-base', '--is-ancestor', main, 'HEAD');
      const mainLoad = at(main);
      if (!isDeepStrictEqual(mainLoad(recordPath(phase.id), true), record) || !isDeepStrictEqual(mainLoad('docs/phases/status.json', true).phases.find((p) => p.id === phase.id), phase)) throw new Error('Predecessor completion must first be merged into main');
      validateCompletion(expected, record, record.sourceDigest, before, ['docs/phases/status.json', recordPath(phase.id)], load);
    }
    if (live) {
      const evidence = collectRemote(record.evidence.pullRequest.number);
      validateRemote(evidence, phase.id, phase.branch);
      if (evidence.pullRequest.head.sha !== phase.remote.headSha || evidence.pullRequest.merge_commit_sha !== phase.remote.mergeSha) throw new Error('Live PR revisions differ from completion');
    }
  }
  if (active?.status !== 'complete') console.log(JSON.stringify(validateGate(status, sourceDigest(), (p, json) => json ? readJson(p) : readFileSync(p, 'utf8')), null, 2));
  else if (!live) console.log('Local consistency only. Run phase:verify in VS Code before qualified merge or starting another phase.');
} catch (error) { console.error(`PHASE BLOCKED: ${error.message}`); process.exitCode = 1; }
