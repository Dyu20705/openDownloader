import test from 'node:test';
import assert from 'node:assert/strict';
import { transform } from './content.mjs';
const tracked = new Set(['docs/cheatsheet.md', 'docs/architecture.md', 'PRIVACY.md']);
test('mapped docs, engineering links and fragments survive', () => {
  const result = transform('[Guide](cheatsheet.md#quality-options) [Architecture](architecture.md) [Privacy](../PRIVACY.md) [Local](#local)', 'docs/getting-started.md', tracked);
  assert.match(result, /\/openDownloader\/docs\/user-guide\/#quality-options/);
  assert.match(result, /github.com\/Dyu20705\/openDownloader\/blob\/main\/docs\/architecture.md/);
  assert.match(result, /\/openDownloader\/docs\/privacy\//); assert.match(result, /\(#local\)/);
});
test('reference definitions transform while code stays literal', () => {
  const source = '[Guide][guide]\n\n[guide]: cheatsheet.md "Title"\n\n```md\n[Missing](missing.md)\n```\n\n`[Missing](missing.md)`\n';
  const result = transform(source, 'docs/getting-started.md', tracked);
  assert.match(result, /\[guide\]: \/openDownloader\/docs\/user-guide\//);
  assert.match(result, /```md\n\[Missing\]\(missing.md\)\n```/); assert.match(result, /`\[Missing\]\(missing.md\)`/);
});
test('unresolved internal targets and unsupported URL protocols fail', () => {
  for (const url of ['missing.md', '../../outside.md', 'javascript:alert(1)', '//evil.example/a']) assert.throws(() => transform(`[Link](${url})`, 'docs/getting-started.md', tracked));
});
test('frontmatter supplies H1 and generation is deterministic', () => {
  const source = '# Title\n\n## Section\n\n[Guide](cheatsheet.md)';
  const result = transform(source, 'docs/getting-started.md', tracked);
  assert.equal(result, transform(source, 'docs/getting-started.md', tracked)); assert.ok(result.startsWith('## Section'));
});
