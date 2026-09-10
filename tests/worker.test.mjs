import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index.js';
import {media} from '../dist/media.js';
const url='https://portfolio.example'+media.films.sea.sources[0].url;
const content=new Uint8Array(Array.from({length:100},(_,i)=>i));
const meta={size:100,httpEtag:'"abc"',uploaded:new Date('2026-09-09T12:00:00Z'),writeHttpMetadata(h){h.set('Content-Type','video/mp4');}};
const env={MEDIA:{async head(){return meta;},async get(key,options){const r=options?.range;return {...meta,body:r?content.slice(r.offset,r.offset+r.length):content};}},ASSETS:{fetch:()=>new Response('Static')}};
test('R2 streaming supports full GET, HEAD and seek ranges',async()=>{
  for(const [range,status,length,header] of [[undefined,200,100,null],['bytes=0-9',206,10,'bytes 0-9/100'],['bytes=90-',206,10,'bytes 90-99/100'],['bytes=-8',206,8,'bytes 92-99/100']]){
    const r=await worker.fetch(new Request(url,{headers:range?{Range:range}:{}}),env);
    assert.equal(r.status,status);assert.equal((await r.arrayBuffer()).byteLength,length);
    assert.equal(r.headers.get('Content-Range'),header);assert.equal(r.headers.get('Content-Type'),'video/mp4');
    assert.equal(r.headers.get('Accept-Ranges'),'bytes');assert(r.headers.get('Cache-Control').includes('immutable'));
  }
  const head=await worker.fetch(new Request(url,{method:'HEAD'}),env);assert.equal(await head.text(),'');assert.equal(head.headers.get('Content-Length'),'100');
});
test('R2 conditional requests, bad ranges, CORS and scope restrictions',async()=>{
  assert.equal((await worker.fetch(new Request(url,{headers:{Range:'bytes=200-300'}}),env)).status,416);
  assert.equal((await worker.fetch(new Request(url,{headers:{'If-None-Match':'W/"abc"'}}),env)).status,304);
  assert.equal((await worker.fetch(new Request(url,{headers:{'If-Match':'"other"'}}),env)).status,412);
  assert.equal((await worker.fetch(new Request(url,{headers:{'If-Match':'W/"abc"'}}),env)).status,412);
  assert.equal((await worker.fetch(new Request(url,{headers:{'If-Unmodified-Since':'Wed, 09 Sep 2026 11:00:00 GMT'}}),env)).status,412);
  const fallback=await worker.fetch(new Request(url,{headers:{Range:'bytes=0-9','If-Range':'"other"'}}),env);
  assert.equal(fallback.status,200);assert.equal((await fallback.arrayBuffer()).byteLength,100);
  const options=await worker.fetch(new Request(url,{method:'OPTIONS'}),env);assert.equal(options.status,204);assert.equal(options.headers.get('Access-Control-Allow-Origin'),'*');
  assert.equal((await worker.fetch(new Request(url,{method:'PUT',body:'x'}),env)).status,405);
  assert.equal((await worker.fetch(new Request('https://portfolio.example/media/private-original.mp4'),env)).status,404);
  assert.equal((await worker.fetch(new Request('https://portfolio.example/ca/'),env)).status,200);
});
