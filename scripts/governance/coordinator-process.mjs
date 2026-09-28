import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { delimiter, join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { reviewSchema } from './cli-review.mjs';

export function binary(name) {
  const override = process.env[`SPECIALSITE_${name.toUpperCase()}_BIN`];
  if (override) {
    if (!existsSync(override) || !/\.exe$/i.test(override) && process.platform === 'win32') throw new Error('Executable override must be an existing native binary, not a shell command');
    return resolve(override);
  }
  const exe = process.platform === 'win32' ? `${name}.exe` : name;
  const candidates = (process.env.PATH ?? '').split(delimiter).map((p) => join(p, exe));
  if (name === 'claude' && process.env.APPDATA) candidates.unshift(join(process.env.APPDATA, 'npm/node_modules/@anthropic-ai/claude-code/bin/claude.exe'));
  const extensions = join(homedir(), '.vscode/extensions');
  if (name === 'codex' && process.platform === 'win32' && existsSync(extensions)) {
    for (const dir of readdirSync(extensions).filter((d) => d.startsWith('openai.chatgpt-')).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))) candidates.push(join(extensions, dir, 'bin/windows-x86_64/codex.exe'));
  }
  const found = candidates.find((p) => existsSync(p));
  if (!found) throw new Error(`${name} executable unavailable; configure SPECIALSITE_${name.toUpperCase()}_BIN`);
  return found;
}
export function assertSubscriptionEnvironment(env = process.env) {
  const keys = ['ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN', 'OPENAI_API_KEY', 'CODEX_API_KEY', 'OPENAI_BASE_URL', 'ANTHROPIC_BASE_URL', 'CLAUDE_CODE_USE_BEDROCK', 'CLAUDE_CODE_USE_VERTEX', 'CLAUDE_CODE_USE_FOUNDRY'];
  if (keys.some((k) => env[k])) throw new Error('API/provider overrides are present; coordinator requires existing subscription login and will not enable API billing');
}
export function claudeArgs() {
  return ['-p', '--output-format', 'json', '--json-schema', JSON.stringify(reviewSchema), '--safe-mode', '--restricted', '--tools', 'Read,Glob,Grep', '--allowedTools', 'Read,Glob,Grep', '--permission-mode', 'dontAsk', '--permission-prompts', 'none', '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}', '--no-chrome', '--disable-slash-commands'];
}
export function codexArgs(root, output) {
  return ['exec', '--ignore-user-config', '--sandbox', 'workspace-write', '-c', 'approval_policy="never"', '--json', '--color', 'never', '--cd', root, '--output-last-message', output, '-'];
}
export function runProcess(executable, args, { input = '', cwd = process.cwd(), timeoutMs = 20 * 60 * 1000, onProgress = () => {} } = {}) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(executable, args, { cwd, shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', error = null, timedOut = false;
    const stop = () => {
      timedOut = true;
      if (child.pid && process.platform === 'win32') spawnSync('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
      else child.kill('SIGTERM');
    };
    const timer = setTimeout(stop, timeoutMs);
    const heartbeat = setInterval(() => onProgress('running'), 15000);
    const interrupt = () => { error = new Error('Coordinator interrupted'); stop(); };
    process.once('SIGINT', interrupt); process.once('SIGTERM', interrupt);
    child.on('error', (e) => { error = e; });
    child.stdin.on('error', (e) => { if (e.code !== 'EPIPE') error = e; });
    for (const [stream, name] of [[child.stdout, 'stdout'], [child.stderr, 'stderr']]) {
      stream.setEncoding('utf8'); stream.on('data', (data) => {
        if (name === 'stdout') stdout += data; else stderr += data;
        if (stdout.length + stderr.length > 16 * 1024 * 1024) { error = new Error('Provider output exceeded limit'); stop(); }
      });
    }
    child.on('close', (code, signal) => {
      clearTimeout(timer); clearInterval(heartbeat); process.removeListener('SIGINT', interrupt); process.removeListener('SIGTERM', interrupt);
      resolveResult({ exitCode: code ?? 1, signal, stdout, stderr, timedOut, error: error?.message ?? null });
    });
    try { child.stdin.end(input); } catch (e) { clearTimeout(timer); clearInterval(heartbeat); reject(e); }
  });
}
export function validateCapabilities(claudeHelp, codexHelp) {
  if (['--safe-mode', '--restricted', '--permission-prompts', '--json-schema', '--strict-mcp-config'].some((flag) => !claudeHelp.includes(flag))) throw new Error('Claude version lacks required safe automation options');
  if (['--ignore-user-config', '--sandbox', '--json'].some((flag) => !codexHelp.includes(flag))) throw new Error('Codex version lacks required automation options');
}
export async function doctor(run = runProcess) {
  assertSubscriptionEnvironment();
  const claude = binary('claude'), codex = binary('codex');
  const help = await run(claude, ['--help'], { timeoutMs: 30000 });
  if (help.exitCode !== 0) throw new Error('Cannot inspect Claude capabilities');
  const codexHelp = await run(codex, ['exec', '--help'], { timeoutMs: 30000 });
  if (codexHelp.exitCode !== 0) throw new Error('Cannot inspect Codex capabilities');
  validateCapabilities(help.stdout, codexHelp.stdout);
  const c = await run(claude, ['auth', 'status', '--json'], { timeoutMs: 30000 });
  if (c.exitCode !== 0) throw new Error('Claude login unavailable');
  const auth = JSON.parse(c.stdout);
  if (!auth.loggedIn || auth.authMethod !== 'claude.ai' || auth.apiProvider !== 'firstParty' || !auth.subscriptionType) throw new Error('Claude subscription login is required');
  const o = await run(codex, ['login', 'status'], { timeoutMs: 30000 });
  if (o.exitCode !== 0 || !/Logged in using ChatGPT/i.test(o.stdout + o.stderr)) throw new Error('Codex ChatGPT login is required');
  return { claude, codex, claudeLogin: 'subscription', codexLogin: 'ChatGPT' };
}
