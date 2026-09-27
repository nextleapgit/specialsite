import { readFile, writeFile, readdir } from 'node:fs/promises';
const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));
const inventory = [];
let licenses = 'Third-party license texts from the installed, locked dependencies.\n';
for (const [path, entry] of Object.entries(lock.packages)) {
  if (!path) continue;
  try {
    const pkg = JSON.parse(await readFile(path + '/package.json', 'utf8'));
    inventory.push({
      name: pkg.name,
      version: pkg.version,
      license: pkg.license || entry.license || 'See package',
      development: !!entry.dev,
    });
    const files = (await readdir(path)).filter((f) =>
      /^(licen[cs]e|copying|notice)(\.|$)/i.test(f),
    );
    for (const file of files) {
      try {
        licenses +=
          `\n\n==== ${pkg.name}@${pkg.version} / ${file} ====\n` +
          (await readFile(path + '/' + file, 'utf8'));
      } catch {}
    }
  } catch {}
}
await writeFile('docs/dependency-inventory.json', JSON.stringify(inventory, null, 2));
await writeFile('docs/third-party-licenses.txt', licenses);
console.log(`${inventory.length} installed dependency license records collected.`);
