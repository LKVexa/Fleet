#!/usr/bin/env node
'use strict';
/** Cross-platform deterministic test launcher.
 * Default release gate is SERIAL because several timing-sensitive gateway tests are
 * designed to validate protocol invariants, not scheduler contention. --parallel is
 * retained as a stress signal and is intentionally not the release gate.
 */
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const args = new Set(process.argv.slice(2));
const mobileOnly = args.has('--mobile');
const coreOnly = args.has('--core');
const parallel = args.has('--parallel');

const coreDirs = ['protocol','worker','vt','desktop-ipc','gateway','security','fabric','chaos','ram'];
const mobileDirs = ['mobile'];
const selected = mobileOnly ? mobileDirs : (coreOnly ? coreDirs : [...coreDirs, ...mobileDirs]);
const files = [];
for (const d of selected) {
  const dir = path.join(root, 'tests', d);
  if (!fs.existsSync(dir)) continue;
  for (const n of fs.readdirSync(dir).sort()) if (n.endsWith('.test.js')) files.push(path.join(dir, n));
}
if (!mobileOnly) {
  const ui = path.join(root, 'tests', 'ui', 'client-units.test.js');
  if (fs.existsSync(ui)) files.push(ui);
}
if (!files.length) { console.error('no tests selected'); process.exit(2); }
const concurrency = parallel ? Math.min(4, Math.max(2, require('node:os').cpus().length)) : 1;
console.log(`[test-runner] mode=${parallel ? 'parallel-stress' : 'serial-release'} concurrency=${concurrency} files=${files.length}`);
const r = spawnSync(process.execPath, ['--test', `--test-concurrency=${concurrency}`, ...files], { cwd: root, stdio: 'inherit', env: process.env });
if (r.error) { console.error(r.error); process.exit(1); }
process.exit(r.status == null ? 1 : r.status);
