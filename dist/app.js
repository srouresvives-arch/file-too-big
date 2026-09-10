import {copy, languages} from './i18n.js';
import {media} from './media.js';
import {clamp, sceneAt, waveReveal, chooseSource, languageForPath} from './player-utils.js';

const $ = (selector, context=document) => context.querySelector(selector);
const $$ = (selector, context=document) => [...context.querySelectorAll(selector)];
const body=document.body;
const journey=$('.journey');
const header=$('.site-header');
const scenes=$$('.film-scene');
const videos=scenes.map(scene=>$('.film-video',scene));
const keys=scenes.map(scene=>scene.dataset.film);
const layoutQuery=matchMedia('(min-height: 480px)');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const connection=navigator.connection;
const dialog=$('#media-viewer');
const failed=new Set();
const pending=new Set();
const readyPosters=new Set();
let playingScenes=new Set([0]);
let lang=languageForPath(location.pathname);
let immersive=false;
let current=0;
let raf=0;
let modal=null;
let returnFocus=null;
let heroReady=false;

function hydratePoster(index) {
  const image=$('.film-poster',scenes[index]);
  if(image.dataset.src) {
    if(image.dataset.srcset) image.srcset=image.dataset.srcset;
    image.src=image.dataset.src;
    delete image.dataset.src;
    delete image.dataset.srcset;
  }
}
function hydrateVideo(index,preload='metadata') {
  const video=videos[index],film=media.films[keys[index]];
  hydratePoster(index);
  if(!video.getAttribute('src')) {
    const box=$('.film-visual',scenes[index]).getBoundingClientRect();
    const width=Math.max(box.width,box.height*film.sources[0].width/film.sources[0].height);
    video.preload=preload;
    video.muted=true;
    video.autoplay=false;
    video.src=chooseSource(film.sources,width,window.devicePixelRatio).url;
    video.load();
  }
}
function updatePlayControl(index) {
  scenes[index].classList.toggle('is-playing',!videos[index].paused);
}
function pause(index) {
  videos[index].autoplay=false;
  videos[index].pause();
  updatePlayControl(index);
}
function play(index,explicit=false) {
  if(document.hidden || dialog.open || pending.has(index) || failed.has(index)) return;
  if(!explicit && (reducedMotion.matches || connection?.saveData)) return;
  if(!videos[index].paused) return;
  hydrateVideo(index,'auto');
  videos[index].autoplay=true;
  pending.add(index);
  videos[index].play().then(()=>{
    if(document.hidden || dialog.open || !playingScenes.has(index)) pause(index);
  }).catch(()=>{if(index===0)finishIntro();}).finally(()=>{pending.delete(index);updatePlayControl(index);});
}
function syncPlayback(visible=true) {
  videos.forEach((video,index)=>{
    if(!playingScenes.has(index) || !visible || dialog.open || document.hidden) pause(index);
    else if(index!==0 || heroReady) play(index);
  });
}
function updateScroll() {
  raf=0;
  const rect=journey.getBoundingClientRect(),height=$('.film-stage').getBoundingClientRect().height||innerHeight;
  const isVisible=rect.top<height && rect.bottom>80;
  if(immersive) {
    const progress=clamp(-rect.top/Math.max(1,rect.height-height),0,1);
    let state=sceneAt(progress,scenes.length);
    hydratePoster(state.index);
    if(state.next!==state.index && progress*scenes.length-state.index>.2) {
      hydratePoster(state.next);
      if(isVisible && !reducedMotion.matches && !connection?.saveData) hydrateVideo(state.next);
    }
    if(!readyPosters.has(state.index))state={index:current,next:current,blend:0};
    else if(!readyPosters.has(state.next))state={...state,blend:0};
    current=state.blend>.5?state.next:state.index;
    playingScenes=new Set([current]);
    if(state.blend>0 && state.blend<1){playingScenes.add(state.index);playingScenes.add(state.next);}
    scenes.forEach((scene,index)=>{
      const outgoing=index===state.index,incoming=index===state.next && state.next!==state.index;
      const opacity=outgoing?1:incoming?state.blend:0;
      scene.style.opacity=String(opacity);
      scene.style.zIndex=String(index);
      scene.style.clipPath=incoming?waveReveal(state.blend):'none';
      scene.classList.toggle('is-current',index===current);
      scene.inert=index!==current;
      scene.setAttribute('aria-hidden',String(index!==current));
      const copy=$('.film-copy',scene);
      copy.style.transform='translateY('+(outgoing?-state.blend*28:incoming?(1-state.blend)*40:0)+'px)';
      copy.style.opacity=outgoing?String(1-state.blend):'1';
      scene.style.setProperty('--scene-shift',(outgoing?-state.blend*1.5:incoming?(1-state.blend)*1.5:0)+'%');
    });
    hydratePoster(current);
    $('.journey-progress>span').style.transform='scaleX('+progress+')';
    $$('.scene-dots button').forEach((button,index)=>{
      if(index===current) button.setAttribute('aria-current','true');
      else button.removeAttribute('aria-current');
    });
    header.classList.toggle('is-solid',rect.bottom<height*.5);
    syncPlayback(isVisible);
  } else {
    let best=-1,bestVisible=0;
    scenes.forEach((scene,index)=>{
      const r=$('.film-visual',scene).getBoundingClientRect();
      const visible=Math.max(0,Math.min(height,r.bottom)-Math.max(80,r.top));
      if(visible>bestVisible){bestVisible=visible;best=index;}
      if(r.top<height+400 && r.bottom>-150) hydratePoster(index);
    });
    current=best<0?0:best;
    playingScenes=new Set([current]);
    header.classList.toggle('is-solid',scrollY>30);
    syncPlayback(best>=0 && bestVisible>80);
  }
}
function requestUpdate(){if(!raf)raf=requestAnimationFrame(updateScroll);}
function updateLayout() {
  immersive=layoutQuery.matches && !reducedMotion.matches;
  body.classList.toggle('immersive',immersive);
  if(!immersive) scenes.forEach(scene=>{
    scene.style.opacity='';
    scene.style.clipPath='';
    scene.style.zIndex='';
    scene.inert=false;
    scene.removeAttribute('aria-hidden');
    $('.film-copy',scene).style.transform='';
    $('.film-copy',scene).style.opacity='';
  });
  requestUpdate();
}
function closeMenu() {
  header.classList.remove('menu-open');
  $('#menu-toggle').setAttribute('aria-expanded','false');
}
function updateModalText() {
  if(!modal) return;
  const isFilm=modal.type==='film';
  dialog.setAttribute('aria-label',copy[lang][isFilm?'filmDialog':'galleryDialog']);
  const key=isFilm?modal.key+'Category':modal.key;
  $('#viewer-label').textContent=copy[lang][isFilm?'muted':'galleryLabel'];
  $('#viewer-caption').textContent=copy[lang][key];
  const image=$('#viewer-content img'),video=$('#viewer-content video');
  if(image) image.alt=copy[lang][modal.key+'Alt'];
  if(video) video.setAttribute('aria-label',copy[lang][modal.key+'Alt']);
}
function setLanguage(next,changeURL=false) {
  if(!languages.includes(next)) return;
  lang=next;
  document.documentElement.lang=lang;
  $('#language').value=lang;
  document.title=copy[lang].title;
  $$('[data-copy]').forEach(node=>{node.innerHTML=copy[lang][node.dataset.copy];});
  for(const [attribute,data] of [['aria-label','copyAria'],['alt','copyAlt']]) {
    $$('[data-'+(data==='copyAria'?'copy-aria':'copy-alt')+']').forEach(node=>node.setAttribute(attribute,copy[lang][node.dataset[data]]));
  }
  $('meta[name="description"]').content=copy[lang].description;
  $('meta[property="og:title"]').content=copy[lang].title;
  $('meta[property="og:description"]').content=copy[lang].description;
  $('meta[property="og:image:alt"]').content=copy[lang].seaAlt;
  $('meta[property="og:locale"]').content={en:'en_GB',ca:'ca_ES',es:'es_ES'}[lang];
  const route=lang==='en'?'/':'/'+lang+'/';
  const canonical=$('link[rel="canonical"]');
  canonical.href=new URL(route,canonical.href).href;
  $('meta[property="og:url"]').content=canonical.href;
  if(changeURL) history.replaceState(null,'',route+location.hash);
  videos.forEach((_,i)=>updatePlayControl(i));
  decorateTitles();
  updateModalText();
}
function openViewer(kind,key) {
  if(typeof dialog.showModal!=='function') {
    const url=kind==='film'?media.films[key].sources[0].url:media.frames[key].at(-1).url;
    location.assign(url);return;
  }
  returnFocus=document.activeElement;
  modal={type:kind,key};
  videos.forEach((_,index)=>pause(index));
  const container=$('#viewer-content');
  container.replaceChildren();
  if(kind==='film') {
    const video=document.createElement('video');
    video.controls=false;video.playsInline=true;video.muted=true;video.loop=true;video.preload='auto';
    video.poster=media.films[key].posters.at(-1).url;
    video.src=chooseSource(media.films[key].sources,innerWidth,devicePixelRatio).url;
    container.append(video);
    video.addEventListener('error',()=>{
      const error=document.createElement('p');error.dataset.copy='mediaUnavailable';error.textContent=copy[lang].mediaUnavailable;
      container.append(error);
    },{once:true});
  } else {
    const image=document.createElement('img');
    const variants=media.frames[key];
    image.src=variants.at(-1).url;
    image.width=variants.at(-1).width;image.height=variants.at(-1).height;
    container.append(image);
  }
  $('#viewer-prev').hidden=kind==='film';
  $('#viewer-next').hidden=kind==='film';
  updateModalText();
  dialog.showModal();
  document.documentElement.classList.add('has-dialog');
  const player=$('video',container);
  if(player) player.play().catch(()=>{});
}
function stepFrame(direction) {
  if(modal?.type!=='frame') return;
  const names=Object.keys(media.frames);
  const key=names[(names.indexOf(modal.key)+direction+names.length)%names.length];
  modal.key=key;
  const image=$('#viewer-content img'),variant=media.frames[key].at(-1);
  image.src=variant.url;image.width=variant.width;image.height=variant.height;
  updateModalText();
}

body.classList.add('has-js');
function decorateTitles(){
  scenes.forEach(scene=>{
    const title=$('h1,h2',scene),key=title.dataset.copy;
    title.innerHTML=copy[lang][key].split('<br>').map((line,i)=>'<span class="title-line"><span style="--line:'+i+'">'+line+'</span></span>').join(' ');
  });
}
const intro=$('.intro-loader'),introParts=new Set();
let introDone=false;
const expectedParts=(reducedMotion.matches||connection?.saveData)?['poster','fonts']:['poster','fonts','video'];
function finishIntro(){
  if(introDone)return;
  introDone=true;intro.classList.add('is-finished');
  setTimeout(()=>{intro.hidden=true;},250);
}
function markIntro(part){
  introParts.add(part);
  const percent=Math.round(expectedParts.filter(p=>introParts.has(p)).length/expectedParts.length*100);
  intro.style.setProperty('--loaded',percent+'%');
  $('.loader-percent',intro).textContent=percent+'%';
  if(percent===100)finishIntro();
}
setTimeout(()=>{if(!introDone)intro.hidden=false;},120);
// A slow film must never hold the page hostage; keep its honest partial count.
setTimeout(finishIntro,2400);
if(document.fonts?.load)Promise.all([document.fonts.load('16px "DM Sans"'),document.fonts.load('italic 16px Playfair')]).then(()=>markIntro('fonts')).catch(finishIntro);
else markIntro('fonts');
scenes.forEach((scene,index)=>{
  const poster=$('.film-poster',scene);
  poster.addEventListener('load',()=>{if(!poster.dataset.src){readyPosters.add(index);requestUpdate();}});
  if(!poster.dataset.src && poster.complete && poster.naturalWidth)readyPosters.add(index);
});
videos.forEach((video,index)=>{
  if(reducedMotion.matches||connection?.saveData)video.autoplay=false;
  video.addEventListener('playing',()=>{
    const show=()=>{scenes[index].classList.add('has-frame');if(index===0)markIntro('video');};
    if('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(show);else show();
    updatePlayControl(index);
  });
  video.addEventListener('pause',()=>updatePlayControl(index));
  video.addEventListener('error',()=>{
    failed.add(index);
    scenes[index].classList.remove('has-frame');
    $('.video-error',scenes[index]).hidden=false;
    updatePlayControl(index);
  });
  $('[data-retry]',scenes[index]).addEventListener('click',()=>{
    failed.delete(index);
    $('.video-error',scenes[index]).hidden=true;
    video.removeAttribute('src');current=index;play(index,true);
  });
});
$$('[data-frame]').forEach(button=>button.addEventListener('click',()=>openViewer('frame',button.dataset.frame)));
$$('[data-scene]').forEach(button=>button.addEventListener('click',()=>{
  const top=journey.getBoundingClientRect().top+scrollY;
  const distance=journey.getBoundingClientRect().height-$('.film-stage').getBoundingClientRect().height;
  window.scrollTo({top:top+distance*Number(button.dataset.scene)/scenes.length,behavior:reducedMotion.matches?'auto':'smooth'});
}));
$('#language').addEventListener('change',event=>setLanguage(event.target.value,true));
$('#menu-toggle').addEventListener('click',()=>{
  const open=header.classList.toggle('menu-open');
  $('#menu-toggle').setAttribute('aria-expanded',String(open));
});
$$('#main-nav a').forEach(link=>link.addEventListener('click',closeMenu));
$('#viewer-close').addEventListener('click',()=>dialog.close());
$('#viewer-prev').addEventListener('click',()=>stepFrame(-1));
$('#viewer-next').addEventListener('click',()=>stepFrame(1));
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{
  const player=$('#viewer-content video');
  if(player){player.pause();player.removeAttribute('src');player.load();}
  $('#viewer-content').replaceChildren();
  document.documentElement.classList.remove('has-dialog');
  modal=null;
  returnFocus?.focus({preventScroll:true});
  requestUpdate();
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape' && header.classList.contains('menu-open')){closeMenu();$('#menu-toggle').focus();}
  if(dialog.open && modal?.type==='frame'){
    if(event.key==='ArrowRight'){event.preventDefault();stepFrame(1);}
    if(event.key==='ArrowLeft'){event.preventDefault();stepFrame(-1);}
  }
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)videos.forEach((_,i)=>pause(i));else requestUpdate();});
window.addEventListener('scroll',requestUpdate,{passive:true});
window.addEventListener('resize',requestUpdate,{passive:true});
window.addEventListener('popstate',()=>setLanguage(languageForPath(location.pathname)));
layoutQuery.addEventListener('change',updateLayout);
reducedMotion.addEventListener('change',()=>{videos.forEach((_,i)=>pause(i));updateLayout();});
connection?.addEventListener?.('change',()=>{if(connection.saveData)videos.forEach((_,i)=>pause(i));requestUpdate();});
document.addEventListener('pointerdown',()=>{if(!reducedMotion.matches&&!connection?.saveData)syncPlayback();},{passive:true});
// IntersectionObserver handles poster arrival; actual playback has a single owner.
if('IntersectionObserver' in window) {
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{const i=scenes.indexOf(entry.target);if(entry.isIntersecting && (!immersive || i===current))hydratePoster(i);});
  },{rootMargin:'350px'});
  scenes.forEach(scene=>observer.observe(scene));
  const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('revealed');reveal.unobserve(entry.target);}
  }),{threshold:.08});
  if(!reducedMotion.matches)$$('.section-heading,.frame,.about-copy,.contact>h2').forEach(el=>{el.classList.add('reveal-ready');reveal.observe(el);});
}
const heroPoster=$('.film-poster',scenes[0]);
const ready=()=>{heroReady=true;readyPosters.add(0);if(heroPoster.naturalWidth)markIntro('poster');else finishIntro();requestUpdate();};
if(heroPoster.complete)ready();else{heroPoster.addEventListener('load',ready,{once:true});heroPoster.addEventListener('error',ready,{once:true});}
setLanguage(lang);
updateLayout();
