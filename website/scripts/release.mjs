export const repository = 'https://github.com/Dyu20705/openDownloader';
export const unavailable = () => ({ sourceStatus: 'unavailable', productionRelease: null, latestPublicRelease: null });

function releaseUrl(value, tag) {
  return value === `${repository}/releases/tag/${encodeURIComponent(tag)}`;
}
function validName(value) {
  return typeof value === 'string' && /^[A-Za-z0-9._+-]+$/.test(value);
}
function assetUrl(asset, tag) {
  return validName(asset.name) && asset.browser_download_url === `${repository}/releases/download/${encodeURIComponent(tag)}/${encodeURIComponent(asset.name)}`;
}
export function qualify(release) {
  if (!/^v\d+\.\d+\.\d+$/.test(release.tag_name) || !Array.isArray(release.assets)) return null;
  const assets = release.assets;
  if (!assets.every(a => a && typeof a.name === 'string' && typeof a.browser_download_url === 'string')) return null;
  if (new Set(assets.map(a => a.name)).size !== assets.length) return null;
  if (!assets.every(a => assetUrl(a, release.tag_name))) return null;
  const packages = assets.filter(a => /^linux-x86_64__.+\.deb$/.test(a.name));
  if (packages.length !== 1) return null;
  const deb = packages[0];
  const byName = new Map(assets.map(a => [a.name, a]));
  const required = [deb.name + '.asc', 'SHA256SUMS', 'SHA256SUMS.asc', 'RELEASE-GPG-PUBLIC-KEY.asc'];
  if (!required.every(name => byName.has(name))) return null;
  const asset = a => ({ name: a.name, url: a.browser_download_url });
  return {
    tag: release.tag_name,
    version: release.tag_name.slice(1),
    releaseUrl: release.html_url,
    publishedAt: release.published_at,
    deb: asset(deb),
    debSignature: asset(byName.get(deb.name + '.asc')),
    checksums: { manifestUrl: byName.get('SHA256SUMS').browser_download_url, signatureUrl: byName.get('SHA256SUMS.asc').browser_download_url },
    publicKeyUrl: byName.get('RELEASE-GPG-PUBLIC-KEY.asc').browser_download_url,
  };
}
export function normalize(releases) {
  if (!Array.isArray(releases)) return unavailable();
  const stable = releases.filter(r => r && r.draft === false && r.prerelease === false
    && typeof r.tag_name === 'string' && /^v\d+\.\d+\.\d+$/.test(r.tag_name)
    && releaseUrl(r.html_url, r.tag_name) && typeof r.published_at === 'string'
    && Number.isFinite(Date.parse(r.published_at)))
    .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at) || b.tag_name.localeCompare(a.tag_name));
  // Duplicate stable tags indicate an ambiguous source; do not choose one.
  if (new Set(stable.map(r => r.tag_name)).size !== stable.length) return unavailable();
  const latest = stable[0];
  const productionRelease = stable.map(qualify).find(Boolean) ?? null;
  return {
    sourceStatus: 'ok',
    productionRelease,
    latestPublicRelease: latest ? {
      tag: latest.tag_name, releaseUrl: latest.html_url, publishedAt: latest.published_at,
      historical: qualify(latest) === null,
    } : null,
  };
}
export async function acquire(fetcher = fetch) {
  try {
    // One bounded request; never reuse stale output after a failed acquisition.
    const response = await fetcher('https://api.github.com/repos/Dyu20705/openDownloader/releases?per_page=100', {
      headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return unavailable();
    // A full page may omit relevant history. Fail safely rather than infer completeness.
    const releases = await response.json();
    if (!Array.isArray(releases) || releases.length >= 100) return unavailable();
    return normalize(releases);
  } catch {
    return unavailable();
  }
}
