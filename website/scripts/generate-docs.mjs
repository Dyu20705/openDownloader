import { readFile, writeFile, mkdir, rm, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mapping, transform } from './content.mjs';
import { unavailable } from './release.mjs';
const root = new URL('../../', import.meta.url);
const destination = new URL('../src/content/docs/', import.meta.url);
const tracked = new Set(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { cwd: fileURLToPath(root), encoding: 'utf8' }).trim().split('\n'));
const generated = await Promise.all(mapping.map(async ([source, route, title]) => {
  const body = transform(await readFile(new URL(source, root), 'utf8'), source, tracked);
  return [route, `---\ntitle: ${JSON.stringify(title)}\neditUrl: ${JSON.stringify(`https://github.com/Dyu20705/openDownloader/edit/main/${source}`)}\n---\n\n${body}`];
}));
await rm(destination, { recursive: true, force: true });
for (const [route, markdown] of generated) {
  const target = new URL(`${route}.md`, destination);
  await mkdir(new URL('./', target), { recursive: true });
  await writeFile(target, markdown);
}
await mkdir(new URL('../.cache/', import.meta.url), { recursive: true });
const release = new URL('../.cache/release.json', import.meta.url);
try { await access(release); } catch { await writeFile(release, JSON.stringify(unavailable(), null, 2) + '\n'); }
// Derive lifecycle language verbatim from the canonical README; fail if its contract changes.
const readme = await readFile(new URL('README.md', root), 'utf8');
const status = readme.match(/## Project status\n\n([^\n]+)/)?.[1];
if (!status) throw new Error('README Project status paragraph is missing');
await writeFile(new URL('../.cache/status.json', import.meta.url), JSON.stringify({ text: status }, null, 2) + '\n');
console.log(`Generated ${generated.length} documentation pages; release metadata unchanged.`);
