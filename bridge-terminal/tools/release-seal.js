#!/usr/bin/env node
'use strict';
/** Regenerate the named release manifest from the intended current tree.
 * The manifest is self-excluded. Verification remains strict: unlisted files are failures.
 */
const fs = require('node:fs');
const path = require('node:path');
const { listReleaseFiles } = require('./release-files');
const root = path.resolve(__dirname, '..');
const mf = path.join(root, 'release', 'manifest.json');
const pkg = require(path.join(root, 'package.json'));
let old = {};
try { old = JSON.parse(fs.readFileSync(mf,'utf8')); } catch { old = {}; }
const tested = Array.isArray(old.testedProfiles) ? [...old.testedProfiles] : [];
const stamp = `Harbor ${pkg.version}: deterministic serial Node release gate + Cubby/mobile gateway; host-native brctl availability is reported explicitly`;
if (!tested.includes(stamp)) tested.push(stamp);
const manifest = {
  candidate: pkg.version,
  generated: new Date().toISOString(),
  protocol: 'hermit.vws.v2',
  profile: 'LOCAL_VOLATILE',
  license: old.license || 'All rights reserved (LICENSE)',
  testedProfiles: tested,
  untestedProfiles: Array.isArray(old.untestedProfiles) ? old.untestedProfiles : [],
  files: listReleaseFiles(root),
};
fs.mkdirSync(path.dirname(mf),{recursive:true});
fs.writeFileSync(mf, JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({candidate:manifest.candidate, files:manifest.files.length, manifest:path.relative(root,mf).replace(/\\/g,'/'), status:'SEALED'},null,2));
