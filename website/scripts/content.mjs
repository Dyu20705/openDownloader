import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';
import { posix } from 'node:path';

export const base = '/openDownloader/';
export const repo = 'https://github.com/Dyu20705/openDownloader';
export const mapping = [
  ['docs/website-overview.md', 'docs/index', 'Documentation'],
  ['docs/getting-started.md', 'docs/getting-started', 'Getting Started'],
  ['docs/cheatsheet.md', 'docs/user-guide', 'User Guide'],
  ['docs/tool-management.md', 'docs/media-tools', 'Media Tools'],
  ['docs/troubleshooting.md', 'docs/troubleshooting', 'Troubleshooting'],
  ['PRIVACY.md', 'docs/privacy', 'Privacy'],
  ['docs/website-developers.md', 'docs/developers', 'Developers'],
];
const routes = new Map(mapping.map(([source, route]) => [source, `${base}${route.replace(/\/index$/, '')}/`]));

export function transform(markdown, source, tracked) {
  const processor = unified().use(remarkParse).use(remarkStringify, { fences: true });
  const tree = processor.parse(markdown);
  const definitions = new Set();
  visit(tree, 'definition', node => definitions.add(node.identifier));
  visit(tree, node => {
    if (['linkReference', 'imageReference'].includes(node.type) && !definitions.has(node.identifier)) {
      throw new Error(`Unresolved reference in ${source}: ${node.identifier}`);
    }
    if (!['link', 'image', 'definition'].includes(node.type)) return;
    const url = node.url;
    if (/^(https?:|mailto:)/i.test(url)) return;
    if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//')) throw new Error(`Unsupported URL in ${source}: ${url}`);
    if (url.startsWith('#')) return;
    const match = url.match(/^([^?#]*)(.*)$/);
    const target = posix.normalize(posix.join(posix.dirname(source), decodeURIComponent(match[1])));
    if (!tracked.has(target)) throw new Error(`Unresolved target in ${source}: ${url}`);
    node.url = routes.has(target) ? routes.get(target) + match[2] : `${repo}/blob/main/${target.split('/').map(encodeURIComponent).join('/')}${match[2]}`;
  });
  // Starlight supplies the page H1 from frontmatter.
  if (tree.children[0]?.type === 'heading' && tree.children[0].depth === 1) tree.children.shift();
  return processor.stringify(tree);
}
