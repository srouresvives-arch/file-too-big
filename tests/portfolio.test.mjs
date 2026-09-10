import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {copy,languages} from '../dist/i18n.js';
import {media} from '../dist/media.js';
import {sceneAt,chooseSource,languageForPath} from '../dist/player-utils.js';

const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
const helpers=fs.readFileSync(new URL('../dist/player-utils.js',import.meta.url),'utf8').replaceAll('export ','');
function fixture({width=1440,height=900,reduced=false,saveData=false,delayVideo=false}={}){
  const dom=new JSDOM(html,{url:'https://portfolio.example/',runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window,d=w.document,queue=[];
  Object.defineProperty(w,'innerWidth',{value:width,writable:true});
  Object.defineProperty(w,'innerHeight',{value:height,writable:true});
  Object.defineProperty(w,'scrollY',{value:0,writable:true});
  Object.defineProperty(w.navigator,'connection',{value:{saveData,addEventListener(){}}});
  w.matchMedia=q=>({matches:q.includes('reduced-motion')?reduced:height>=480,addEventListener(){}});
  w.requestAnimationFrame=fn=>{queue.push(fn);return queue.length;};
  w.scrollTo=options=>{w.scrollY=options.top;w.dispatchEvent(new w.Event('scroll'));};
  w.HTMLElement.prototype.getBoundingClientRect=function(){
    const journeyHeight=(width<height?5.2:5.6)*height;
    if(this.classList.contains('journey'))return {top:-w.scrollY,bottom:journeyHeight-w.scrollY,height:journeyHeight,width,left:0,right:width};
    if(this.classList.contains('film-visual')){
      const index=[...d.querySelectorAll('.film-visual')].indexOf(this);
      const visualHeight=width<height?Math.min(height*.68,width*1.25):height;
      const top=reduced?index*height-w.scrollY:(height-visualHeight)/2;
      return {top,bottom:top+visualHeight,width,height:visualHeight,left:0,right:width};
    }
    return {top:0,bottom:height,width,height,left:0,right:width};
  };
  Object.defineProperty(w.HTMLMediaElement.prototype,'paused',{get(){return !this._playing;}});
  w.HTMLMediaElement.prototype.play=function(){this._playing=true;if(!delayVideo)this.dispatchEvent(new w.Event('playing'));return Promise.resolve();};
  w.HTMLMediaElement.prototype.pause=function(){const was=this._playing;this._playing=false;if(was)this.dispatchEvent(new w.Event('pause'));};
  w.HTMLMediaElement.prototype.load=function(){};
  Object.defineProperty(w.HTMLImageElement.prototype,'naturalWidth',{get(){return this.dataset.src?0:1920;}});
  Object.defineProperty(w.HTMLImageElement.prototype,'complete',{get(){return !this.dataset.src;}});
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
  w.localStorage.setItem('portfolio-language','ca');
  w.eval('const copy='+JSON.stringify(copy)+'; const media='+JSON.stringify(media)+'; const languages='+JSON.stringify(languages)+';\n'+helpers+'\n'+app);
  const loaded=new Set();
  const flush=async()=>{for(let i=0;i<20;i++){
    d.querySelectorAll('.film-poster:not([data-src])').forEach(p=>{if(!loaded.has(p)){loaded.add(p);p.dispatchEvent(new w.Event('load'));}});
    if(queue.length)queue.shift()();else break;
  }await Promise.resolve();await Promise.resolve();};
  d.querySelector('.film-poster').dispatchEvent(new w.Event('load'));
  const select=value=>{d.querySelector('#language').value=value;d.querySelector('#language').dispatchEvent(new w.Event('change'));};
  return {w,d,flush,select,close:()=>w.close()};
}
test('English is initial even when V1 stored Catalan; all UI translations switch together',async()=>{
  const f=fixture();await f.flush();assert.equal(f.d.documentElement.lang,'en');
  for(const lang of ['ca','es','en']){
    f.select(lang);
    assert.equal(f.d.documentElement.lang,lang);
    assert.equal(f.d.title,copy[lang].title);
    for(const el of f.d.querySelectorAll('[data-copy]')){
      const content=el.querySelector('.title-line')?[...el.querySelectorAll('.title-line>span')].map(e=>e.innerHTML).join('<br>'):el.innerHTML;
      assert.equal(content.replaceAll('&amp;','&'),copy[lang][el.dataset.copy]);
    }
    for(const el of f.d.querySelectorAll('[data-copy-alt]'))assert.equal(el.alt,copy[lang][el.dataset.copyAlt]);
    for(const el of f.d.querySelectorAll('[data-copy-aria]'))assert.equal(el.getAttribute('aria-label'),copy[lang][el.dataset.copyAria]);
    assert.equal(f.w.location.pathname,lang==='en'?'/':'/'+lang+'/');
  }
  f.select('ca');assert.equal(f.d.querySelector('#contact h2 em').textContent,'parli.');
  assert.equal(f.d.querySelector('#contact h2').textContent,'Fem que el teu lloc parli.');
  f.close();
});
test('only the hero starts initially, films stay HD and unnecessary controls are absent',async()=>{
  const f=fixture();await f.flush();
  const videos=[...f.d.querySelectorAll('.film-video')];
  assert.equal(videos.filter(v=>v.hasAttribute('src')).length,1);
  assert.equal(videos.filter(v=>!v.paused).length,1);
  assert.equal(f.d.querySelectorAll('[data-play],[data-open-film],video[controls]').length,0);
  assert(!/ENGAGE|VIEW FILM/i.test(f.d.body.textContent));
  assert(media.films.sea.sources[0].height>=1080);
  f.close();
});
test('reduced motion and data saver preserve posters without downloading autoplay films',async()=>{
  for(const config of [{reduced:true},{saveData:true}]){
    const f=fixture(config);await f.flush();
    assert.equal(f.d.querySelectorAll('.film-video[src]').length,0);
    assert(f.d.querySelector('.film-poster').src);
    f.close();
  }
});
test('mobile retains immersive chapters and the menu closes on selection',async()=>{
  const f=fixture({width:390});await f.flush();
  assert(f.d.body.classList.contains('immersive'));
  assert.equal(f.d.querySelector('.film-scene').getAttribute('aria-hidden'),'false');
  const menu=f.d.querySelector('#menu-toggle');menu.click();
  assert.equal(menu.getAttribute('aria-expanded'),'true');
  f.d.querySelector('#main-nav a[href="#services"]').click();
  assert.equal(menu.getAttribute('aria-expanded'),'false');
  f.close();
});
test('gallery captions follow language changes, arrows work, close releases media',async()=>{
  const f=fixture();await f.flush();
  f.d.querySelector('[data-frame="geometry"]').click();
  assert(f.d.querySelector('dialog').open);
  f.select('ca');assert.equal(f.d.querySelector('#viewer-caption').textContent,copy.ca.geometry);
  f.d.querySelector('#viewer-next').click();assert.equal(f.d.querySelector('#viewer-caption').textContent,copy.ca.residence);
  f.d.querySelector('#viewer-close').click();assert(!f.d.querySelector('dialog').open);
  f.d.querySelector('[data-frame="boats"]').click();
  assert([...f.d.querySelectorAll('.film-video')].every(v=>v.paused));
  f.select('es');assert.equal(f.d.querySelector('#viewer-caption').textContent,copy.es.boats);
  f.d.querySelector('#viewer-close').click();assert.equal(f.d.querySelector('#viewer-content').children.length,0);
  f.close();
});
test('scene transition endpoints, native resolution selection and language routing',()=>{
  assert.deepEqual(sceneAt(1,3),{index:2,next:2,blend:0});
  assert.equal(sceneAt(0,3).index,0);
  assert(sceneAt(.25,3).blend>0&&sceneAt(.25,3).blend<1);
  const sources=[{width:1920,height:1080},{width:2560,height:1440},{width:3840,height:2160}];
  assert.equal(chooseSource(sources,390,3).height,1080);
  assert.equal(chooseSource(sources,2560,1).height,1440);
  assert.equal(chooseSource(sources,1920,2).height,2160);
  assert.equal(chooseSource([sources[0]],3840,2).height,1080);
  assert.equal(languageForPath('/ca/'),'ca');assert.equal(languageForPath('/es/'),'es');assert.equal(languageForPath('/'),'en');
});
test('transitions keep an opaque background, overlap playback briefly, and hold the last chapter',async()=>{
  for(const width of [390,768,1366,1920]){
    const f=fixture({width});await f.flush();
    const distance=(width<900?5.2:5.6)*900-900;
    f.w.scrollTo({top:distance*.175});await f.flush();
    const scenes=[...f.d.querySelectorAll('.film-scene')];
    assert.equal(scenes[0].style.opacity,'1');
    assert(scenes[1].style.clipPath.startsWith('polygon'));
    assert.equal(f.d.querySelectorAll('.film-scene.is-playing').length,2);
    f.w.scrollTo({top:distance*.95});await f.flush();
    assert(scenes.at(-1).classList.contains('is-current'));
    assert.equal(scenes.at(-1).style.opacity,'1');
    assert.equal(f.d.querySelectorAll('.film-scene.is-playing').length,1);
    f.close();
  }
});
test('loader percentage waits for a real video readiness event and gallery has eight unique items',async()=>{
  const f=fixture({delayVideo:true});await f.flush();
  assert.equal(f.d.querySelector('.loader-percent').textContent,'67%');
  f.d.querySelector('.film-video').dispatchEvent(new f.w.Event('playing'));
  assert.equal(f.d.querySelector('.loader-percent').textContent,'100%');
  const frames=[...f.d.querySelectorAll('[data-frame]')];
  assert.equal(frames.length,8);
  assert.equal(new Set(frames.map(e=>e.querySelector('img').src)).size,8);
  f.close();
});
