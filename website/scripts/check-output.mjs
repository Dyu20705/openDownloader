import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative, dirname, extname } from 'node:path';
import { parse } from 'parse5';
const root = resolve('dist');
const origin = 'https://dyu20705.github.io';
const base = '/openDownloader/';
async function collect(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? collect(resolve(dir, e.name)) : resolve(dir, e.name)))).flat();
}
function nodes(tree) { return [tree, ...(tree.childNodes ?? []).flatMap(nodes)]; }
const files = await collect(root);
const failures = [];
const html = new Map();
for (const file of files) {
  if (/\.(deb|AppImage|zip|exe|dmg)$/i.test(file)) failures.push(`Binary artifact: ${relative(root, file)}`);
  if (!file.endsWith('.html')) continue;
  const source = await readFile(file, 'utf8');
  if (/https?:\/\/(localhost|127\.0\.0\.1)/i.test(source)) failures.push(`Localhost URL: ${file}`);
  const tree = nodes(parse(source)); html.set(file, tree);
  const tags = tag => tree.filter(n => n.tagName === tag);
  if (tags('h1').length !== 1 || tags('main').length !== 1) failures.push(`Expected one H1/main: ${file}`);
  const canonical = tags('link').find(n => n.attrs.some(a => a.name === 'rel' && a.value === 'canonical'));
  if (!canonical?.attrs.some(a => a.name === 'href' && a.value.startsWith(origin + base))) failures.push(`Invalid canonical: ${file}`);
  if (tags('img').some(n => !n.attrs.some(a => a.name === 'alt'))) failures.push(`Missing image alt: ${file}`);
}
for (const [file, tree] of html) {
  const page = new URL(base + relative(root, file).replace(/index\.html$/, ''), origin);
  for (const node of tree) {
    for (const attr of node.attrs ?? []) {
      if (!['href', 'src', 'srcset'].includes(attr.name)) continue;
      const urls = attr.name === 'srcset' ? attr.value.split(',').map(s => s.trim().split(/\s+/)[0]) : [attr.value];
      for (const value of urls) {
        if (!value || /^(mailto:|data:|blob:)/i.test(value)) continue;
        let url;
        try { url = new URL(value, page); } catch { failures.push(`Malformed URL: ${value}`); continue; }
        if (!['http:', 'https:'].includes(url.protocol)) { failures.push(`Unsupported protocol: ${value}`); continue; }
        if (url.origin !== origin) continue;
        if (!url.pathname.startsWith(base)) { failures.push(`Outside project base: ${relative(root, file)}: ${value}`); continue; }
        const target = resolve(root, decodeURIComponent(url.pathname.slice(base.length)));
        if (target !== root && !target.startsWith(root + '/')) { failures.push(`Unsafe path: ${value}`); continue; }
        const candidates = [target, resolve(target, 'index.html')];
        if (!extname(target)) candidates.push(target + '.html');
        const found = candidates.find(c => files.includes(c));
        if (!found) { failures.push(`Missing internal target: ${relative(root, file)}: ${value}`); continue; }
        if (url.hash && html.has(found)) {
          const id = decodeURIComponent(url.hash.slice(1));
          if (!html.get(found).some(n => n.attrs?.some(a => a.name === 'id' && a.value === id))) failures.push(`Missing fragment: ${value}`);
        }
      }
    }
  }
}
for (const file of files.filter(f => f.endsWith('.css'))) {
  const css = await readFile(file, 'utf8');
  for (const match of css.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) {
    const value = match[1];
    if (/^(data:|https?:|#)/.test(value)) continue;
    const target = value.startsWith('/') ? (value.startsWith(base) ? resolve(root, value.slice(base.length)) : null) : resolve(dirname(file), value);
    if (!target || !files.includes(target)) failures.push(`Missing CSS asset or wrong base: ${relative(root, file)}: ${value}`);
  }
}
for (const route of ['', 'download/', 'security/', 'releases/', 'docs/', 'docs/getting-started/', 'docs/user-guide/', 'docs/troubleshooting/', 'docs/developers/']) {
  if (!html.has(resolve(root, route, 'index.html'))) failures.push(`Missing required route: ${route}`);
}
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`Validated ${html.size} HTML pages: routes, links/fragments, assets, canonical URLs, image alt, and project base.`);
