// Tauri's ICNS writer emits identical image chunks in nondeterministic order.
// Preserve every payload byte and canonicalize only the container ordering.
export function canonicalIcns(data) {
  if (data.length < 8 || data.toString('ascii', 0, 4) !== 'icns' || data.readUInt32BE(4) !== data.length) throw new Error('Invalid ICNS container');
  const chunks = [];
  const types = new Set();
  for (let offset = 8; offset < data.length;) {
    if (offset + 8 > data.length) throw new Error('Truncated ICNS chunk');
    const size = data.readUInt32BE(offset + 4);
    if (size < 8 || offset + size > data.length) throw new Error('Invalid ICNS chunk length');
    const type = data.toString('ascii', offset, offset + 4);
    if (types.has(type) || type === 'TOC ') throw new Error('Unsupported duplicate/TOC ICNS chunk');
    types.add(type);
    chunks.push(data.subarray(offset, offset + size));
    offset += size;
  }
  chunks.sort((a, b) => Buffer.compare(a.subarray(0, 4), b.subarray(0, 4)));
  return Buffer.concat([data.subarray(0, 8), ...chunks]);
}
