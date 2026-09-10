import {media} from '../dist/media.js';
const urls=new Set();
function collect(value){if(Array.isArray(value))value.forEach(collect);else if(value&&typeof value==='object'){if(value.url)urls.add(value.url);Object.values(value).forEach(collect);}}
collect(media);
const cache='public, max-age=31536000, immutable';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Expose-Headers':'Content-Length, Content-Range, Accept-Ranges, ETag','X-Content-Type-Options':'nosniff'};
const mime=key=>key.endsWith('.mp4')?'video/mp4':key.endsWith('.webp')?'image/webp':'application/octet-stream';
const matches=(value,etag,weak=true)=>value==='*'||value?.split(',').some(item=>(weak?item.trim().replace(/^W\//,''):item.trim())===etag);
export function parseRange(value,size){
  if(!value) return null;
  // Multi-range is deliberately ignored: serving the full representation is valid.
  if(value.includes(',')) return null;
  const m=/^bytes=(\d*)-(\d*)$/.exec(value);
  if(!m || (!m[1]&&!m[2])) return null;
  if(!m[1]){const count=Number(m[2]);if(count===0)return false;return {offset:Math.max(0,size-count),length:Math.min(size,count)};}
  const start=Number(m[1]),end=m[2]?Math.min(Number(m[2]),size-1):size-1;
  if(!Number.isSafeInteger(start)||start>=size||end<start)return false;
  return {offset:start,length:end-start+1};
}
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(!url.pathname.startsWith('/media/')) return env.ASSETS.fetch(request);
    if(!urls.has(url.pathname)) return new Response('Not found',{status:404,headers:cors});
    if(request.method==='OPTIONS') return new Response(null,{status:204,headers:{...cors,'Access-Control-Allow-Methods':'GET, HEAD, OPTIONS','Access-Control-Allow-Headers':'Range, If-Range, If-None-Match','Access-Control-Max-Age':'86400'}});
    if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{...cors,Allow:'GET, HEAD, OPTIONS'}});
    if(!env.MEDIA)return new Response('Media unavailable',{status:503,headers:{...cors,'Retry-After':'60'}});
    // Only curated, content-addressed V2 objects can be read. No bucket listing.
    const key=url.pathname.slice('/media/'.length);
    const meta=await env.MEDIA.head(key);
    if(!meta)return new Response('Not found',{status:404,headers:cors});
    const headers=new Headers(cors);
    meta.writeHttpMetadata(headers);
    headers.set('Content-Type',mime(key));headers.set('Cache-Control',cache);
    headers.set('ETag',meta.httpEtag);headers.set('Last-Modified',meta.uploaded.toUTCString());headers.set('Accept-Ranges','bytes');
    const ifMatch=request.headers.get('If-Match');
    const unmodified=request.headers.get('If-Unmodified-Since');
    if((ifMatch&&!matches(ifMatch,meta.httpEtag,false))||(!ifMatch&&unmodified&&Date.parse(unmodified)<Math.floor(meta.uploaded.getTime()/1000)*1000)){
      headers.set('Cache-Control','no-store');
      return new Response(null,{status:412,headers});
    }
    const tag=request.headers.get('If-None-Match');
    if(tag?matches(tag,meta.httpEtag):request.headers.has('If-Modified-Since')&&Date.parse(request.headers.get('If-Modified-Since'))>=Math.floor(meta.uploaded.getTime()/1000)*1000)
      return new Response(null,{status:304,headers});
    let range=request.method==='HEAD'?null:parseRange(request.headers.get('Range'),meta.size);
    const ifRange=request.headers.get('If-Range');
    if(ifRange && ifRange!==meta.httpEtag && !(Date.parse(ifRange)>=Math.floor(meta.uploaded.getTime()/1000)*1000))range=null;
    if(range===false){headers.set('Content-Range','bytes */'+meta.size);headers.set('Cache-Control','no-store');return new Response(null,{status:416,headers});}
    headers.set('Content-Length',String(range?.length??meta.size));
    if(request.method==='HEAD')return new Response(null,{headers});
    if(range)headers.set('Content-Range','bytes '+range.offset+'-'+(range.offset+range.length-1)+'/'+meta.size);
    const object=await env.MEDIA.get(key,range?{range}:undefined);
    if(!object || !('body' in object))return new Response('Not found',{status:404,headers:cors});
    // Stream the body. Never buffer whole films in Worker memory.
    return new Response(object.body,{status:range?206:200,headers});
  }
};
