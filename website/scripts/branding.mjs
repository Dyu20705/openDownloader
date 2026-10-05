import { readFile, writeFile, mkdir } from 'node:fs/promises';

// Website commands only need the vector master, not root app dependencies.
export async function generateBranding() {
  const master = new URL('../../assets/branding/opendownloader-icon.svg', import.meta.url);
  const destination = new URL('../public/branding/favicon.svg', import.meta.url);
  const svg = await readFile(master);
  await mkdir(new URL('./', destination), { recursive: true });
  await writeFile(destination, svg);
}
