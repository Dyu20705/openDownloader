import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize, acquire, unavailable, repository } from './release.mjs';
function fixture(tag = 'v1.1.0', names = ['linux-x86_64__openDownloader_1.1.0_amd64.deb', 'linux-x86_64__openDownloader_1.1.0_amd64.deb.asc', 'SHA256SUMS', 'SHA256SUMS.asc', 'RELEASE-GPG-PUBLIC-KEY.asc']) {
  return { tag_name: tag, draft: false, prerelease: false, published_at: '2026-10-05T10:00:00Z', html_url: `${repository}/releases/tag/${tag}`, assets: names.map(name => ({ name, browser_download_url: `${repository}/releases/download/${tag}/${encodeURIComponent(name)}` })) };
}
test('historical release has no production package', () => {
  const result = normalize([fixture('v1.0.1', ['One-Click-Media-Downloader.AppImage'])]);
  assert.equal(result.productionRelease, null); assert.equal(result.latestPublicRelease.tag, 'v1.0.1'); assert.equal(result.latestPublicRelease.historical, true);
});
test('exact signed Debian contract qualifies without attestation asset', () => {
  const result = normalize([fixture()]);
  assert.equal(result.productionRelease.tag, 'v1.1.0'); assert.equal(result.productionRelease.debSignature.name, result.productionRelease.deb.name + '.asc'); assert.equal(result.latestPublicRelease.historical, false);
});
test('each evidence asset is mandatory', () => {
  const release = fixture();
  for (const asset of release.assets) assert.equal(normalize([{ ...release, assets: release.assets.filter(a => a !== asset) }]).productionRelease, null, asset.name);
});
test('random .asc cannot replace exact package signature', () => {
  const release = fixture(); release.assets[1] = fixture('v1.1.0', ['unrelated.asc']).assets[0];
  assert.equal(normalize([release]).productionRelease, null);
});
test('duplicate names and ambiguous Debian packages fail closed', () => {
  for (const extra of [fixture().assets[0], fixture('v1.1.0', ['linux-x86_64__second.deb']).assets[0]]) {
    const release = fixture(); release.assets.push(extra); assert.equal(normalize([release]).productionRelease, null);
  }
  assert.deepEqual(normalize([fixture(), fixture()]), unavailable());
});
test('draft, prerelease and nonstable tags do not appear', () => {
  for (const change of [{ draft: true }, { prerelease: true }, { tag_name: 'v1.1.0-rc.1' }]) {
    const result = normalize([{ ...fixture(), ...change }]); assert.equal(result.productionRelease, null); assert.equal(result.latestPublicRelease, null);
  }
});
test('malformed URLs and assets are rejected', () => {
  for (const url of ['http://github.com/Dyu20705/openDownloader/releases/download/v1.1.0/file.deb', 'https://evil.example/package.deb', 'https://github.com/Dyu20705/other/releases/download/v1.1.0/file.deb']) {
    const release = fixture(); release.assets[0].browser_download_url = url; assert.equal(normalize([release]).productionRelease, null);
  }
  assert.equal(normalize([{ ...fixture(), html_url: 'https://evil.example/release' }]).latestPublicRelease, null);
  assert.equal(normalize([{ ...fixture(), assets: [null] }]).productionRelease, null);
});
test('latest public and latest qualifying production differ', () => {
  const newer = fixture('v1.2.0', ['historical.zip']); newer.published_at = '2026-10-06T10:00:00Z';
  const result = normalize([fixture(), newer]); assert.equal(result.productionRelease.tag, 'v1.1.0'); assert.equal(result.latestPublicRelease.tag, 'v1.2.0');
});
test('acquisition uses one request; failure never retains stale data', async () => {
  let calls = 0;
  const result = await acquire(async () => { calls++; return { ok: true, json: async () => [fixture()] }; });
  assert.equal(calls, 1); assert.equal(result.productionRelease.tag, 'v1.1.0');
  assert.deepEqual(await acquire(async () => { throw new Error('offline'); }), unavailable());
  assert.deepEqual(await acquire(async () => ({ ok: false })), unavailable());
  assert.deepEqual(await acquire(async () => ({ ok: true, json: async () => ({ error: 'bad' }) })), unavailable());
  assert.deepEqual(await acquire(async () => ({ ok: true, json: async () => Array(100).fill(fixture()) })), unavailable());
});
