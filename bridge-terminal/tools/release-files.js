#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const EXCLUDED_TOP = new Set(['node_modules','dist','.git','.vws-local']);
function rel(root,p){ return path.relative(root,p).split(path.sep).join('/'); }
function shouldSkip(r){
  if (r === 'release/manifest.json') return true;
  const top = r.split('/')[0];
  return EXCLUDED_TOP.has(top);
}
function listReleaseFiles(root){
  const out=[];
  (function walk(d){
    for(const n of fs.readdirSync(d).sort()){
      const p=path.join(d,n), r=rel(root,p);
      if(shouldSkip(r)) continue;
      const st=fs.lstatSync(p);
      if(st.isDirectory()) walk(p);
      else if(st.isFile()) out.push({path:r, bytes:st.size, sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')});
    }
  })(root);
  return out;
}
module.exports={ listReleaseFiles, shouldSkip };
