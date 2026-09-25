#!/usr/bin/env node
'use strict';
const fs=require('node:fs'), path=require('node:path');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'fleet','EXTERNAL_DEPENDENCIES.json'),'utf8'));
const strict=process.argv.includes('--strict');
function fromLink(file,key){
  try { for(const line of fs.readFileSync(path.join(root,file),'utf8').replace(/^\uFEFF/,'').split(/\r?\n/)){ const i=line.indexOf('='); if(i>0&&line.slice(0,i).trim().toUpperCase()===key.toUpperCase()) return line.slice(i+1).trim(); } } catch {}
  return '';
}
const results=[];
for(const d of manifest.dependencies){
  const env=process.env[d.env]||''; const file=fromLink(d.link_file,d.link_key||d.env); const target=env||file; const source=env?'environment':(file?'link-file':'unset');
  const sentinel=target?path.join(target,...d.sentinel.split('/')):null; const available=!!(sentinel&&fs.existsSync(sentinel));
  results.push({id:d.id,version:d.version,available,source,root:target||null,sentinel:d.sentinel,bundled:false,hash:d.sha256,hash_status:d.hash_status});
}
console.log(JSON.stringify({release:manifest.release,strict,results,status:results.every(x=>x.available)?'PASS':(strict?'FAIL':'EXTERNALS_MISSING')},null,2));
process.exit(strict && results.some(x=>!x.available)?1:0);
