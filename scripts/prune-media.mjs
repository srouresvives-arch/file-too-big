import fs from 'node:fs';
import path from 'node:path';
import {media} from '../dist/media.js';
const root=path.dirname(path.dirname(new URL(import.meta.url).pathname));
const wanted=new Set();
function visit(x){if(Array.isArray(x))x.forEach(visit);else if(x&&typeof x==='object'){if(x.url)wanted.add(path.basename(x.url));Object.values(x).forEach(visit);}}
visit(media);
const directory=path.join(root,'dist/media/v2');
const removed=[];
for(const file of fs.readdirSync(directory)){
  if(wanted.has(file))continue;
  if(!/^[a-z0-9-]+\.[a-f0-9]{10}\.(mp4|webp)$/.test(file))throw new Error('Unexpected file; review manually: '+file);
  fs.unlinkSync(path.join(directory,file));removed.push(file);
}
console.log('Removed '+removed.length+' unused generated variants.');
