import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { canonicalIcns } from './icns.mjs';
const root = new URL('../../',import.meta.url);
const config=JSON.parse(await readFile(new URL('src-tauri/tauri.conf.json',root),'utf8'));
for(const file of config.bundle.icon) await access(new URL('src-tauri/'+file,root));
for(const [name,size] of [['32x32.png',32],['128x128.png',128],['128x128@2x.png',256]]) {
  const png=await readFile(new URL('src-tauri/icons/'+name,root));
  assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16),size);assert.equal(png.readUInt32BE(20),size);
  assert.equal(png[25],6,'Tauri icons must have RGBA pixels');
}
const ico=await readFile(new URL('src-tauri/icons/icon.ico',root));
assert.equal(ico.readUInt16LE(0),0);assert.equal(ico.readUInt16LE(2),1);
const sizes=[];
for(let i=0;i<ico.readUInt16LE(4);i++) {
  const offset=6+i*16;
  assert.ok(offset+16<=ico.length);
  sizes.push(ico[offset]||256);
  assert.ok(ico.readUInt32LE(offset+12)+ico.readUInt32LE(offset+8)<=ico.length);
}
assert.ok(sizes.includes(16)&&sizes.includes(32)&&sizes.includes(256));
const icns=await readFile(new URL('src-tauri/icons/icon.icns',root));
assert.deepEqual(canonicalIcns(icns),icns);
assert.deepEqual(await readFile(new URL('assets/branding/opendownloader-icon.svg',root)),await readFile(new URL('website/public/branding/favicon.svg',root)));
console.log('Icon configuration, RGBA PNG dimensions, ICO entries, canonical ICNS and shared SVG passed.');
