for(const name of ['CLOUDFLARE_API_TOKEN','CLOUDFLARE_ACCOUNT_ID','SITE_ORIGIN']){
  if(!process.env[name])throw new Error(name+' must be configured before deploying.');
}
const origin=new URL(process.env.SITE_ORIGIN);
if(origin.protocol!=='https:' || origin.pathname!=='/' || origin.hostname==='file-too-big-films.srouresvives.chatgpt.site')throw new Error('Set the independent V2 origin, never V1.');
console.log('V2 deployment environment is configured.');
