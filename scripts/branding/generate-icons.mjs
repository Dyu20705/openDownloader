import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, copyFile, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalIcns } from './icns.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const source = join(root, 'assets/branding/opendownloader-icon.svg');
const cli = join(root, 'node_modules/@tauri-apps/cli/tauri.js');
const temporary = await mkdtemp(join(tmpdir(), 'opendownloader-icons-'));
const outputs = ['32x32.png', '128x128.png', '128x128@2x.png', 'icon.ico', 'icon.icns'];
const check = process.argv.includes('--check');
try {
  execFileSync(process.execPath, [cli, 'icon', source, '--output', temporary], { cwd: root, stdio: 'pipe' });
  const icns = join(temporary, 'icon.icns');
  await writeFile(icns, canonicalIcns(await readFile(icns)));
  for (const name of outputs) {
    const target = join(root, 'src-tauri/icons', name);
    if (check) {
      if (!(await readFile(target)).equals(await readFile(join(temporary, name)))) throw new Error(`Icon drift: ${name}; run node scripts/branding/generate-icons.mjs`);
    } else {
      await copyFile(join(temporary, name), target);
    }
  }
  const favicon = join(root, 'website/public/branding/favicon.svg');
  if (check) {
    if (!(await readFile(source)).equals(await readFile(favicon))) throw new Error('Website favicon differs from canonical SVG');
  } else {
    await mkdir(join(root, 'website/public/branding'), { recursive: true });
    await copyFile(source, favicon);
  }
  console.log(check ? 'Branding assets match canonical SVG and locked Tauri CLI.' : 'Generated desktop icons and website favicon from the canonical SVG.');
} finally {
  await rm(temporary, { recursive: true, force: true });
}
