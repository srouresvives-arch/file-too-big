import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.dirname(path.dirname(new URL(import.meta.url).pathname));
const data=JSON.parse(fs.readFileSync(path.join(root,'dist/media-manifest.json'),'utf8'));
const files=new Set();
function collect(value){if(Array.isArray(value))value.forEach(collect);else if(value&&typeof value==='object'){if(value.url)files.add(value.url);Object.values(value).forEach(collect);}}
collect(data);
const apply=process.argv.includes('--apply');
for(const url of files){
  const key='drone-portfolio-media/'+url.slice('/media/'.length);
  const file=path.join(root,'dist',url);
  const type=url.endsWith('.mp4')?'video/mp4':'image/webp';
  if(!fs.existsSync(file))throw new Error('Missing media: '+url);
  if(!apply){console.log(key+' ('+fs.statSync(file).size+' bytes)');continue;}
  const args=['wrangler','r2','object','put',key,'--remote','--file',file,'--content-type',type,'--cache-control','public, max-age=31536000, immutable'];
  const r=spawnSync(process.platform==='win32'?'npx.cmd':'npx',args,{stdio:'inherit',cwd:root});
  if(r.status!==0)process.exit(r.status||1);
}
console.log(apply?'Uploaded only the selected V2 objects.':'Dry run only. Use --apply after authenticating Cloudflare.');
