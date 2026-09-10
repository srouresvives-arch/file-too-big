import fs from 'node:fs';
const assets=JSON.parse(fs.readFileSync(new URL('../cloudinary-assets.json',import.meta.url)));
const root=new URL('../dist/',import.meta.url);
const media={films:{},frames:{},portrait:[]};
const posters={sea:4.8,space:3,ride:1.8,run:0.55};
function variants(key,widths,videoPoster=false){
 const a=assets[key];
 return [...new Set(widths.map(w=>Math.min(w,a.width)))].sort((a,b)=>a-b).map(width=>({
  url:a.secure_url.replace('/upload/',`/upload/${videoPoster?'so_'+posters[key]+',':''}c_limit,w_${width},q_95,f_webp/`).replace(/\.[^.]+$/,'.webp'),
  width,height:Math.round(width*a.height/a.width)
 }));
}
for(const key of ['sea','space','ride','run']){
 const a=assets[key];
 media.films[key]={sources:[{url:a.secure_url,width:a.width,height:a.height,type:'video/mp4'}],duration:a.duration,bytes:a.bytes,posters:variants(key,[800,1600,1920],true)};
}
for(const key of ['coast','boats','geometry','residence','passage','curve','copper','afterglow'])media.frames[key]=variants(key,[800,1600,assets[key].width]);
media.portrait=variants('sergi',[400,720,assets.sergi.width]);
fs.writeFileSync(new URL('media-manifest.json',root),JSON.stringify(media,null,2)+'\n');
console.log('Cloudinary manifest: four films, eight images, one portrait; no upscaling.');
