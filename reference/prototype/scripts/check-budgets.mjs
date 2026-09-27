import { readFile, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
const html = await readFile('dist/index.html', 'utf8');
const js = [...html.matchAll(/(?:src|href)="([^\"]+\.js)"/g)].map((x) => x[1]);
const css = html.match(/href="([^\"]+\.css)"/)[1];
const size = async (path) => gzipSync(await readFile('dist/' + path.replace(/^\.\//, ''))).length;
const result = {
  initialJavaScriptGzip: (await Promise.all([...new Set(js)].map(size))).reduce((a, b) => a + b, 0),
  initialChunks: js,
  cssGzip: await size(css),
  budgets: { initialJavaScriptGzip: 150 * 1024, cssGzip: 25 * 1024 },
  note: 'Includes all initial module script entries emitted by Rolldown, including shared domain code. Both HTML documents share the same entry chunks. Transfer-size budget only, not Core Web Vitals.',
};
await writeFile('docs/bundle-metrics.json', JSON.stringify(result, null, 2));
console.log(result);
if (
  result.initialJavaScriptGzip > result.budgets.initialJavaScriptGzip ||
  result.cssGzip > result.budgets.cssGzip
)
  process.exitCode = 1;
