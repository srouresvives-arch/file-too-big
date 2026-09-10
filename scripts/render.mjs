import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {copy, languages} from '../dist/i18n.js';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist=path.join(root,'dist');
const media=JSON.parse(fs.readFileSync(path.join(dist,'media-manifest.json'),'utf8'));
fs.writeFileSync(path.join(dist,'media.js'),'export const media = '+JSON.stringify(media,null,2)+';\n');
const origin=process.env.SITE_ORIGIN || 'https://file-too-big-v2.srouresvives.chatgpt.site';
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const srcset=versions=>versions.map(v=>v.url+' '+v.width+'w').join(', ');
const last=items=>items.at(-1);
const scenes=[['sea','heroTitle','heroCopy'],['space','spaceTitle','spaceCopy'],['ride','rideTitle','rideCopy'],['run','runTitle','runCopy']];
const arrow='<span aria-hidden="true">↗</span>';
const blank='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="16" height="9"%3E%3C/svg%3E';
for(const lang of languages) {
  const t=copy[lang];
  const text=(key,tag='span',attrs='')=>'<'+tag+' data-copy="'+key+'" '+attrs+'>'+t[key]+'</'+tag+'>';
  const route=lang==='en'?'/':'/'+lang+'/';
  const photo=(versions,key,attrs='')=>'<img src="'+last(versions).url+'" srcset="'+srcset(versions)+'" sizes="(max-width: 700px) 100vw, 65vw" width="'+last(versions).width+'" height="'+last(versions).height+'" alt="'+escape(t[key])+'" data-copy-alt="'+key+'" '+attrs+'>';
  const films=scenes.map(([key,title,body],i)=>{
    const f=media.films[key], p=last(f.posters);
    return '<article class="film-scene '+(i===0?'is-current':'')+'" data-film="'+key+'" aria-labelledby="film-title-'+key+'">'+
      '<div class="film-visual">'+
      '<img class="film-poster" '+(i===0?'src="'+p.url+'" srcset="'+srcset(f.posters)+'" fetchpriority="high"':'src="'+blank+'" data-src="'+p.url+'" data-srcset="'+srcset(f.posters)+'"')+' sizes="100vw" width="1920" height="1080" alt="'+escape(t[key+'Alt'])+'" data-copy-alt="'+key+'Alt" decoding="async">'+
      (i===0?'':'<noscript>'+photo(f.posters,key+'Alt','loading="lazy"')+'</noscript>')+
      '<video class="film-video" autoplay muted playsinline loop preload="none" aria-hidden="true" tabindex="-1" width="1920" height="1080"></video>'+
      '<div class="film-shade"></div>'+
      '</div><div class="film-copy">'+text(i===0?'heroLabel':key+'Category','p','class="eyebrow"')+
      text(title,i===0?'h1':'h2','id="film-title-'+key+'"')+text(body,'p','class="film-description"')+
      '<div class="film-index"><span>0'+(i+1)+'</span><span class="index-line"></span>'+text(key+'Category')+'</div></div>'+
      '<p class="video-error" role="status" hidden>'+text('mediaUnavailable')+' <button type="button" data-retry="'+key+'">'+text('retry')+'</button></p></article>';
  }).join('');
  const gallery=Object.keys(media.frames).map((key,i)=>'<figure class="frame frame-'+key+'"><button class="frame-open" type="button" data-frame="'+key+'" aria-label="'+escape(t[key])+'" data-copy-aria="'+key+'">'+photo(media.frames[key],key+'Alt','loading="lazy" decoding="async"')+'</button><figcaption><span>0'+(i+1)+'</span>'+text(key)+'</figcaption></figure>').join('');
  const gallerySection='<section class="frames section-pad" id="frames"><div class="section-heading">'+text('galleryLabel','p','class="eyebrow"')+text('galleryTitle','h2')+text('galleryIntro','p','class="section-intro"')+'</div><div class="frame-grid">'+gallery+'</div><a class="text-link gallery-link" href="https://www.instagram.com/file_too_big/" target="_blank" rel="noopener noreferrer">'+text('edits')+arrow+'</a></section>';
  const services=[1,2,3].map(i=>'<li><span class="service-number">0'+i+'</span>'+text('service'+i,'h3')+text('service'+i+'Copy','p')+'</li>').join('');
  const html='<!doctype html>\n<html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#071a25">'+
    '<title>'+t.title+'</title><meta name="description" content="'+escape(t.description)+'"><link rel="canonical" href="'+origin+route+'">'+
    languages.map(l=>'<link rel="alternate" hreflang="'+l+'" href="'+origin+(l==='en'?'/':'/'+l+'/')+'">').join('')+
    '<meta property="og:type" content="website"><meta property="og:site_name" content="FILE TOO BIG"><meta property="og:title" content="'+escape(t.title)+'"><meta property="og:description" content="'+escape(t.description)+'"><meta property="og:url" content="'+origin+route+'"><meta property="og:image" content="'+origin+'/social.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="'+escape(t.seaAlt)+'"><meta property="og:locale" content="'+({en:'en_GB',ca:'ca_ES',es:'es_ES'})[lang]+'"><meta name="twitter:card" content="summary_large_image">'+
    '<link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="apple-touch-icon" href="/apple-touch-icon.png">'+
    '<link rel="preload" href="/fonts/dm-sans-regular.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/fonts/playfair-italic.woff2" as="font" type="font/woff2" crossorigin>'+
    '<link rel="preload" as="image" href="'+last(media.films.sea.posters).url+'" imagesrcset="'+srcset(media.films.sea.posters)+'" imagesizes="100vw" fetchpriority="high"><link rel="stylesheet" href="/style.css">'+
    '</head><body><script>if(matchMedia("(min-height: 480px)").matches&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.body.classList.add("immersive");</script><div class="intro-loader" hidden aria-hidden="true"><span class="loader-name" data-title="FILE TOO BIG">FILE TOO BIG</span><span class="loader-percent">0%</span></div><a class="skip-link" href="#main" data-copy="skip">'+t.skip+'</a>'+
    '<header class="site-header"><a class="brand" href="#work" aria-label="FILE TOO BIG"><strong>FILE TOO BIG<span class="brand-dot">.</span></strong>'+text('brand')+'</a>'+
    '<button id="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="'+t.nav+'" data-copy-aria="nav"><span></span><span></span></button>'+
    '<nav id="main-nav" aria-label="'+t.nav+'" data-copy-aria="nav"><a href="#work">'+text('work')+'</a><a href="#services">'+text('services')+'</a><a href="#about">'+text('about')+'</a><a class="nav-contact" href="#contact">'+text('contact')+arrow+'</a></nav>'+
    '<label class="language"><span class="sr-only" data-copy="language">'+t.language+'</span><select id="language" aria-label="'+t.language+'" data-copy-aria="language"><option value="en" '+(lang==='en'?'selected':'')+'>EN</option><option value="ca" '+(lang==='ca'?'selected':'')+'>CA</option><option value="es" '+(lang==='es'?'selected':'')+'>ES</option></select></label></header>'+
    '<main id="main"><section class="journey" id="work" aria-label="'+t.work+'" data-copy-aria="work"><div class="film-stage">'+films+
    '<div class="journey-bottom"><a href="#frames">'+text('explore')+' <span aria-hidden="true">↓</span></a><div class="scene-dots" role="group" aria-label="'+t.work+'" data-copy-aria="work">'+scenes.map(([key],i)=>'<button type="button" data-scene="'+i+'" aria-label="'+t[key+'Category']+'" data-copy-aria="'+key+'Category" '+(i===0?'aria-current="true"':'')+'><span>0'+(i+1)+'</span></button>').join('')+'</div></div><div class="journey-progress" aria-hidden="true"><span></span></div></div></section>'+
    '<section class="services section-pad" id="services"><div class="section-heading">'+text('servicesLabel','p','class="eyebrow"')+text('servicesTitle','h2')+'</div><ol class="service-list">'+services+'</ol><div class="services-end">'+text('formats','p')+'<a class="text-link" href="#contact">'+text('serviceCTA')+arrow+'</a></div></section>'+
    '<section class="about section-pad" id="about"><div class="portrait">'+photo(media.portrait,'portraitAlt','loading="lazy" decoding="async"')+'</div><div class="about-copy">'+text('aboutLabel','p','class="eyebrow"')+text('aboutTitle','h2')+text('aboutCopy','p')+text('aboutSecond','p')+'<div class="equipment">'+text('equipment')+'<span>DJI Mini 3 · DJI Mini 4 Pro</span></div></div></section>'+
    gallerySection+'<footer class="contact section-pad" id="contact">'+text('contactLabel','p','class="eyebrow"')+text('contactTitle','h2')+'<div class="contact-action">'+text('contactIntro','p')+'<a class="primary-link" href="https://wa.me/34665545805" target="_blank" rel="noopener noreferrer">'+text('whatsapp')+arrow+'</a></div>'+
    '<div class="contact-details"><a class="email-link" href="mailto:srouresvives@gmail.com">'+text('email','span','class="detail-label"')+'<span>srouresvives@gmail.com</span></a><div class="contact-secondary"><a href="tel:+34665545805">'+text('phone','span','class="detail-label"')+'<span>+34 665 545 805</span></a><a href="https://www.instagram.com/file_too_big/" target="_blank" rel="noopener noreferrer">'+text('instagram','span','class="detail-label"')+'<span>@file_too_big ↗</span></a></div></div>'+
    text('availability','p','class="availability"')+'<div class="footer-line"><span>© '+new Date().getUTCFullYear()+' FILE TOO BIG</span>'+text('footer')+'<a href="#work">'+text('back')+' ↑</a></div></footer></main>'+
    '<dialog id="media-viewer" aria-label="'+t.galleryDialog+'"><div class="viewer-top"><span id="viewer-label"></span><button id="viewer-close" type="button">'+text('close')+' <span aria-hidden="true">×</span></button></div><div id="viewer-content"></div><div class="viewer-bottom"><button id="viewer-prev" type="button">'+text('previous')+'</button><p id="viewer-caption" aria-live="polite"></p><button id="viewer-next" type="button">'+text('next')+'</button></div></dialog>'+
    '<noscript><p class="noscript-note">'+t.noScript+'</p></noscript><script type="module" src="/app.js"></script></body></html>\n';
  const target=lang==='en'?dist:path.join(dist,lang);
  fs.mkdirSync(target,{recursive:true});fs.writeFileSync(path.join(target,'index.html'),html);
}
fs.writeFileSync(path.join(dist,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+languages.map(l=>'<url><loc>'+origin+(l==='en'?'/':'/'+l+'/')+'</loc></url>').join('')+'</urlset>\n');
fs.writeFileSync(path.join(dist,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+origin+'/sitemap.xml\n');
console.log('Rendered English, Catalan and Spanish routes.');
