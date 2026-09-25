'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const gate = require('../../gateway/cubby-access-gate');
const serve = require('../../gateway/brctl-serve-manager');

test('mobile/desktop classification and cubby families are explicit', () => {
  assert.deepStrictEqual(gate.isMobileClient({headers:{'user-agent':'HarborDesktop/1.0'},url:'/'}).mobile, false);
  assert.strictEqual(gate.isMobileClient({headers:{'x-harbor-mobile-platform':'android'},url:'/'}).platform, 'android');
  assert.strictEqual(gate.cubbyKind('MC-001'), 'mobile-cubby');
  assert.strictEqual(gate.cubbyKind('QN-01'), 'qnode-cubby');
  assert.strictEqual(gate.cubbyKind('CS-01'), 'containership-cubby');
});

test('brctl resolver never selects Windows PE executable as runnable on non-Windows hosts', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(),'harbor-brctl-resolve-'));
  try {
    const dir = path.join(root,'mobile-platform','compiler','bin'); fs.mkdirSync(dir,{recursive:true});
    fs.writeFileSync(path.join(dir,'brctl.exe'),'MZ-not-a-real-binary');
    const linux = serve.resolveBrctlInfo(root,'linux');
    assert.strictEqual(linux.supported,false); assert.match(linux.reason,/Windows brctl\.exe/); assert.strictEqual(serve.resolveBrctl(root), process.platform === 'win32' ? path.join(dir,'brctl.exe') : null);
    fs.writeFileSync(path.join(dir,'brctl'),'native-placeholder');
    const native = serve.resolveBrctlInfo(root,'linux'); assert.strictEqual(native.supported,true); assert.strictEqual(native.path,path.join(dir,'brctl'));
  } finally { fs.rmSync(root,{recursive:true,force:true}); }
});

test('APDU normalization is bounded and canonical', () => {
  assert.deepStrictEqual(serve.normalizeHex('01 02 AA'), {ok:true,hex:'0102aa'});
  assert.strictEqual(serve.normalizeHex('abc').ok,false);
  assert.strictEqual(serve.normalizeHex('zz').ok,false);
  assert.strictEqual(serve.normalizeHex('aa'.repeat(4097)).ok,false);
});
