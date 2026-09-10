import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const dir=path.resolve(process.argv[2] || 'review');
const sourceDir=path.resolve(process.argv[3] || '.');
const sourceGit=(args,options={})=>execFileSync('git',args,{cwd:sourceDir,...options});
try { sourceGit(['cat-file','-e','fe3e5b0^{commit}'],{stdio:'pipe'}); }
catch { throw new Error('V1 history is required for recovery. Pass its checkout as the third argument: node scripts/audit-media.mjs review /path/to/v1-checkout'); }
fs.mkdirSync(dir,{recursive:true});
const selections=[
 ['boat-hq','7efd412','dist/media/films/barca.mp4'],
 ['motorbikes-hq','7efd412','dist/media/films/motos.mp4'],
 ['architecture-hq','7efd412','dist/media/films/stmary.mp4'],
 ['action-before-compression','4c2ee81','dist/media/films/motos.mp4'],
 ['sunset-before-compression','4c2ee81','dist/media/films/gardeners.mp4'],
 ['garden-before-compression','4c2ee81','dist/media/films/medes.mp4']
];
const inventory=[];
for(const [name,commit,source] of selections){
 const file=path.join(dir,name+'.mp4');
 if(!fs.existsSync(file))fs.writeFileSync(file,sourceGit(['show',commit+':'+source],{maxBuffer:100*1024*1024}));
 const data=JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height,codec_name,bit_rate,avg_frame_rate:format=duration,size','-of','json',file]));
 inventory.push({name,commit,source,file,...data});
 execFileSync('ffmpeg',['-v','error','-y','-i',file,'-vf','fps=1,scale=400:-2,tile=4x5:padding=4:color=black','-frames:v','1',path.join(dir,name+'-sheet.jpg')]);
}
const stillPaths=sourceGit(['ls-tree','-r','--name-only','fe3e5b0','dist/media/frames','dist/assets/sergi-roures.jpeg'],{encoding:'utf8'}).trim().split('\n');
for(const relative of stillPaths){
 const target=path.join(dir,'baseline',relative);
 fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.writeFileSync(target,sourceGit(['show','fe3e5b0:'+relative],{maxBuffer:10*1024*1024}));
}
fs.writeFileSync(path.join(dir,'inventory.json'),JSON.stringify(inventory,null,2));
console.log(JSON.stringify(inventory,null,2));
