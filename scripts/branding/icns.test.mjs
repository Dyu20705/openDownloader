import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalIcns } from './icns.mjs';
function chunk(type, payload) {
  const result=Buffer.alloc(8+payload.length);result.write(type,0,'ascii');result.writeUInt32BE(result.length,4);Buffer.from(payload).copy(result,8);return result;
}
function container(chunks) {
  const header=Buffer.alloc(8);header.write('icns');header.writeUInt32BE(8+chunks.reduce((n,c)=>n+c.length,0),4);return Buffer.concat([header,...chunks]);
}
test('ICNS order is deterministic while image payloads remain byte-identical',()=>{
  const a=chunk('ic08',[1,2,3]),b=chunk('ic07',[4,5]);
  const expected=container([b,a]);
  assert.deepEqual(canonicalIcns(container([a,b])),expected);
  assert.deepEqual(canonicalIcns(expected),expected);
});
test('malformed or ambiguous ICNS input is rejected',()=>{
  const a=chunk('ic08',[1,2]);
  assert.throws(()=>canonicalIcns(Buffer.alloc(4)));
  assert.throws(()=>canonicalIcns(container([a,a])));
  assert.throws(()=>canonicalIcns(container([chunk('TOC ',[])])));
  const truncated=container([a]);truncated.writeUInt32BE(99,12);
  assert.throws(()=>canonicalIcns(truncated));
});
