import { readFileSync } from 'node:fs';
import { git } from './common.mjs';
// Deliberately narrow, dependency-free baseline scan; not a substitute for a full secret scanner at release.
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{40,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{32,}\b/,
];
const files = [...new Set(git('ls-files', '--cached', '--others', '--exclude-standard', '-z').split('\0').filter(Boolean))];
const found = [];
for (const file of files) {
  if (/\.(png|jpe?g|zip)$/i.test(file)) continue;
  const content = readFileSync(file, 'utf8');
  if (/(^|\/)\.env(\.|$)/.test(file) && !file.endsWith('.example')) found.push(file);
  else if (patterns.some((pattern) => pattern.test(content))) found.push(file);
}
console.log(JSON.stringify({ scope: 'tracked and non-ignored working files; known credential patterns only; no history/entropy detection', filesScanned: files.length, findings: found }, null, 2));
if (found.length) process.exitCode = 1;
