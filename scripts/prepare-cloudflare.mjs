import fs from 'node:fs';
import path from 'node:path';
const root=path.dirname(path.dirname(new URL(import.meta.url).pathname));
const target=path.join(root,'.cloudflare-static');
// This directory is generated and never contains originals.
fs.rmSync(target,{recursive:true,force:true});
fs.mkdirSync(target,{recursive:true});
for(const name of fs.readdirSync(path.join(root,'dist'))){
  if(name==='media')continue;
  fs.cpSync(path.join(root,'dist',name),path.join(target,name),{recursive:true});
}
console.log('Static frontend prepared. Media is delivered directly by Cloudinary; no Worker media proxy or R2 binding.');
