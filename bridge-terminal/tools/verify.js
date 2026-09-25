#!/usr/bin/env node
'use strict';
/** Strict release verification: every manifest entry must match, every intended file must be listed,
 * and the manifest candidate must equal package.json version. Offline; installs nothing.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { listReleaseFiles } = require('./release-files');
const root = path.resolve(__dirname, '..');
const mf = path.join(root, 'release', 'manifest.json');
if (!fs.existsSync(mf)) { console.error('release/manifest.json not found'); process.exit(2); }
const manifest = JSON.parse(fs.readFileSync(mf, 'utf8'));
const pkg = require(path.join(root,'package.json'));
let hashFailures = 0;
for (const f of manifest.files || []) {
  const p = path.join(root, f.path);
  if (!fs.existsSync(p)) { console.error('MISSING  ' + f.path); hashFailures++; continue; }
  const h = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
  if (h !== f.sha256) { console.error('MISMATCH ' + f.path); hashFailures++; }
}
const listed = new Set((manifest.files || []).map((f) => f.path));
const current = listReleaseFiles(root);
const unlisted = current.filter((f)=>!listed.has(f.path)).map((f)=>f.path);
const versionMismatch = manifest.candidate !== pkg.version;
if (versionMismatch) console.error(`VERSION  manifest=${manifest.candidate} package=${pkg.version}`);
if (unlisted.length) console.error('UNLISTED\n  ' + unlisted.join('\n  '));
const failed = hashFailures + unlisted.length + (versionMismatch ? 1 : 0);
console.log(JSON.stringify({ candidate: manifest.candidate, packageVersion: pkg.version, files: (manifest.files||[]).length, hashFailures, unlisted: unlisted.length, versionMismatch, failed, status: failed ? 'FAIL' : 'PASS' }, null, 2));
process.exit(failed ? 1 : 0);
