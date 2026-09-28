import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

export const git = (...args) => execFileSync('git', ['-c', `safe.directory=${process.cwd()}`, ...args], { encoding: 'utf8' }).trim();
export const sha256 = (value) => createHash('sha256').update(value).digest('hex');
export const readJson = (path) => JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
export function sourceFiles() {
  return [...new Set(git('ls-files', '--cached', '--others', '--exclude-standard', '-z').split('\0').filter(Boolean))]
    .filter((p) => p !== 'docs/phases/status.json' && !/^docs\/phases\/\d{2}\/(round-\d{2}|attempts)\//.test(p)).sort();
}
export function sourceDigest() {
  return sha256(sourceFiles().map((p) => {
    let bytes = readFileSync(p);
    if (!/\.(png|jpe?g|zip)$/i.test(p)) bytes = Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n'));
    return `${p}\0${sha256(bytes)}`;
  }).join('\n'));
}
export function parseClaude(raw) {
  if (raw.is_error || raw.type !== 'result' || raw.subtype !== 'success' || !raw.session_id) throw new Error('Claude did not complete a successful review');
  const review = raw.structured_output ?? JSON.parse(raw.result.replace(/^```(?:json)?\s*|\s*```$/g, ''));
  return validateReview(review);
}
export function validateReview(review) {
  if (!review || !['approve', 'changes_requested', 'blocked'].includes(review.verdict) || typeof review.summary !== 'string' || !review.summary.trim() || !Array.isArray(review.findings) || !Array.isArray(review.verifiedClosed)) throw new Error('Invalid Claude review schema');
  for (const f of review.findings) {
    if (!f.id || !['critical', 'high', 'medium', 'low'].includes(f.severity) || !f.file || !f.description || !f.verification) throw new Error('Incomplete finding');
  }
  if (new Set(review.findings.map((f) => f.id)).size !== review.findings.length || review.verifiedClosed.some((x) => typeof x !== 'string')) throw new Error('Invalid finding IDs');
  if (review.verdict === 'approve' && review.findings.length) throw new Error('Approval has open findings');
  return review;
}

// Recompute a historical source fingerprint; never trust a fingerprint in a record alone.
export function sourceDigestAt(revision) {
  if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('Invalid source revision');
  const files = git('ls-tree', '-r', '--name-only', '-z', revision).split('\0').filter(Boolean)
    .filter((p) => p !== 'docs/phases/status.json' && !/^docs\/phases\/\d{2}\/(round-\d{2}|attempts)\//.test(p)).sort();
  return sha256(files.map((p) => {
    let bytes = execFileSync('git', ['-c', `safe.directory=${process.cwd()}`, 'show', `${revision}:${p}`], { maxBuffer: 32 * 1024 * 1024, windowsHide: true });
    if (!/\.(png|jpe?g|zip)$/i.test(p)) bytes = Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n'));
    return `${p}\0${sha256(bytes)}`;
  }).join('\n'));
}
