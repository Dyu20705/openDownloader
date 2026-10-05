import { mkdir, writeFile } from 'node:fs/promises';
import { acquire } from './release.mjs';
const metadata = await acquire();
await mkdir(new URL('../.cache/', import.meta.url), { recursive: true });
await writeFile(new URL('../.cache/release.json', import.meta.url), JSON.stringify(metadata, null, 2) + '\n');
console.log(`Release source: ${metadata.sourceStatus}; production: ${metadata.productionRelease?.tag ?? 'none'}; public: ${metadata.latestPublicRelease?.tag ?? 'unknown'}`);
