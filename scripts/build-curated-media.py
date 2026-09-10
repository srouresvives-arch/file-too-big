"""Build honest, native-resolution V2 derivatives from recovered encodes.

Run with a review directory produced by audit-media.mjs. Originals remain untouched.
Poster timestamps are editorial choices, never automatically the first frame.
"""
import argparse, hashlib, json, subprocess
from pathlib import Path
from PIL import Image

parser=argparse.ArgumentParser()
parser.add_argument('review', type=Path)
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
out=root/'dist/media/v2'; out.mkdir(parents=True,exist_ok=True)
review=args.review

def run(*args):
    subprocess.run(list(map(str,args)),check=True,stdout=subprocess.DEVNULL)

def publish(file):
    digest=hashlib.sha256(file.read_bytes()).hexdigest()[:10]
    dest=file.with_name(f'{file.stem}.{digest}{file.suffix}')
    file.replace(dest)
    return '/media/v2/'+dest.name

def photo(source, name, widths):
    im=Image.open(source).convert('RGB')
    versions=[]
    for width in widths:
        width=min(width,im.width)
        height=round(im.height*width/im.width)
        dest=out/f'{name}-{width}.webp'
        im.resize((width,height),Image.Resampling.LANCZOS).save(dest,'WEBP',quality=90,method=6)
        versions.append({'url':publish(dest),'width':width,'height':height})
    return versions

films={}
selections=[
 ('sea','boat-hq.mp4',1.2,11.8,6.0),
 ('ride','motorbikes-hq.mp4',0.0,7.8,1.8),
 ('space','architecture-hq.mp4',4.8,5.4,7.8),
]
for key,name,start,duration,poster in selections:
    source=review/name
    dest=out/f'{key}-1080'
    movie=dest.with_suffix('.mp4')
    if key=='ride':
        # The existing high-quality cut is already ideal: avoid a lossy generation
        # just to save less than one MB in moving grass and gravel.
        run('ffmpeg','-v','warning','-y','-i',source,'-an','-map_metadata','-1',
            '-c:v','copy','-movflags','+faststart',movie)
    else:
        run('ffmpeg','-v','warning','-y','-ss',start,'-i',source,'-t',duration,
            '-an','-map_metadata','-1','-vf','fps=30,format=yuv420p',
            '-c:v','libx264','-preset','slow','-crf','20' if key=='space' else '22','-profile:v','high',
            '-level:v','4.1','-maxrate','10M' if key=='space' else '8M','-bufsize','20M','-g','60',
            '-movflags','+faststart',movie)
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=width,height,codec_name,bit_rate:format=duration,size','-of','json',str(movie)]))
    v=probe['streams'][0]
    shot=review/f'{key}-poster.png'
    run('ffmpeg','-v','error','-y','-ss',poster,'-i',source,'-frames:v','1',shot)
    films[key]={'sources':[{'url':publish(movie),'width':v['width'],'height':v['height'],'type':'video/mp4'}],
        'duration':float(probe['format']['duration']),'bytes':int(probe['format']['size']),
        'posters':photo(shot,key+'-poster',[800,1600,1920])}
frames={
 'geometry':photo(review/'baseline/dist/media/frames/overhead.webp','geometry',[800,1600]),
 'afterglow':photo(review/'baseline/dist/media/frames/sunset.webp','afterglow',[800,1600]),
}
portrait=photo(review/'baseline/dist/assets/sergi-roures.jpeg','sergi',[400,720])
data={'films':films,'frames':frames,'portrait':portrait}
(root/'dist/media-manifest.json').write_text(json.dumps(data,indent=2)+'\n')
(root/'dist/media.js').write_text('export const media = '+json.dumps(data,indent=2)+';\n')
(review/'encoding-report.json').write_text(json.dumps(data,indent=2)+'\n')
print(json.dumps({k:{'bytes':v['bytes'],'duration':v['duration'],'size':[v['sources'][0]['width'],v['sources'][0]['height']]} for k,v in films.items()},indent=2))
