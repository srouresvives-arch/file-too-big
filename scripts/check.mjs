import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {copy,languages} from '../dist/i18n.js';
import {media} from '../dist/media.js';
const root=path.dirname(path.dirname(new URL(import.meta.url).pathname)),dist=path.join(root,'dist');
const expected=Object.keys(copy.en).sort();
const knownPlaces=/Calella|Palafrugell|Medes|Costa Brava|Banbury|St Mary|Saint Mary|Gardeners|Barcelona|Oxfordshire/i;
for(const lang of languages){
  assert.deepEqual(Object.keys(copy[lang]).sort(),expected,'Translation keys must match');
  const file=path.join(dist,lang==='en'?'index.html':lang+'/index.html');
  const document=new JSDOM(fs.readFileSync(file,'utf8')).window.document;
  assert.equal(document.documentElement.lang,lang);
  assert.equal(document.querySelectorAll('h1').length,1);
  assert.equal(document.title,copy[lang].title);
  assert(!knownPlaces.test(document.body.textContent),'No public recording locations');
  for(const element of document.querySelectorAll('[data-copy]'))assert.equal(element.innerHTML.replaceAll('&amp;','&'),copy[lang][element.dataset.copy]);
  const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
  assert.equal(new Set(ids).size,ids.length,'Unique DOM ids');
  for(const a of document.querySelectorAll('a[href^="#"]'))assert(document.getElementById(a.hash.slice(1)),'Anchor exists: '+a.hash);
  for(const element of document.querySelectorAll('[src],[href],[data-src]')){
    for(const attr of ['src','href','data-src']){
      const url=element.getAttribute(attr);
      if(url?.startsWith('/')&&!url.startsWith('//'))assert(fs.existsSync(path.join(dist,url)),'Local file exists: '+url);
    }
  }
  for(const img of document.querySelectorAll('img'))assert(img.hasAttribute('alt')&&img.width&&img.height,'Images have alt text and dimensions');
  assert(document.querySelector('meta[property="og:image"]').content.endsWith('/social.jpg'));
}
assert.equal(copy.ca.contactTitle,'Fem que el teu lloc <em>parli.</em>');
const mediaFiles=new Set();
function visit(value){if(Array.isArray(value))value.forEach(visit);else if(value&&typeof value==='object'){if(value.url)mediaFiles.add(value.url);Object.values(value).forEach(visit);}}
visit(media);
for(const url of mediaFiles){
 const u=new URL(url);
 assert.equal(u.origin,'https://res.cloudinary.com');
 assert(u.pathname.startsWith('/jgvr0ayi/'));
 assert(u.pathname.includes('/upload/'));
}
assert.deepEqual(Object.keys(media.films),['sea','space','ride','run']);
assert.equal(Object.keys(media.frames).length,8);
for(const film of Object.values(media.films)){
 assert(film.sources.every(s=>s.width>=1920&&s.height>=1080));
 assert(film.duration>0&&film.bytes>0);
}
console.log('Validated all three languages, local frontend assets and Cloudinary media mappings.');
