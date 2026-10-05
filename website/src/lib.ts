import releaseData from '../.cache/release.json';
import statusData from '../.cache/status.json';
export const base = import.meta.env.BASE_URL.replace(/\/$/, '') + '/';
export const path = (route = '') => base + route;
export const repository = 'https://github.com/Dyu20705/openDownloader';
export const canonical = (file: string) => `${repository}/blob/main/${file}`;
export type Asset = { name: string; url: string };
export type Release = {
  tag: string; version: string; releaseUrl: string; publishedAt: string;
  deb: Asset; debSignature: Asset;
  checksums: { manifestUrl: string; signatureUrl: string }; publicKeyUrl: string;
};
export type Metadata = {
  sourceStatus: 'ok' | 'unavailable'; productionRelease: Release | null;
  latestPublicRelease: { tag: string; releaseUrl: string; publishedAt: string; historical: boolean } | null;
};
export const metadata = releaseData as Metadata;
export const status: { text: string } = statusData;
