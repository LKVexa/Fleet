'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { createWorkerSession } = require('../../worker/core');

test('worker ping reports backend-aware isolate memory without inventing per-thread RSS', async () => {
  const recs=[];
  const s=createWorkerSession({ env:{VWS_W_BACKEND:'thread'}, emit:(r)=>{recs.push(r);return true;}, onFinished:()=>{}, diag:()=>{} });
  s.ready(); s.handle({t:'open',cols:80,rows:24}); s.handle({t:'ping',nonce:'n'});
  const p=recs.find((r)=>r.t==='pong'); assert.ok(p && p.usage && p.usage.memory);
  assert.strictEqual(p.usage.memory.backend,'thread'); assert.strictEqual(Object.prototype.hasOwnProperty.call(p.usage.memory,'rssBytes'),false);
  assert.ok(Number.isFinite(p.usage.memory.heapUsedBytes) && p.usage.memory.heapUsedBytes>0);
  s.shutdown('closed');
});
