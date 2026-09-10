"""Prepare web variants from a locally accessible, approved SDR original.

Example: python scripts/encode-original.py original.mp4 --name sea --start 12
         --duration 8 --poster 16 --output review/new-sea

Does not upload or automatically replace the published selection. Review the
results, then merge the returned entry into dist/media-manifest.json and build.
"""
import argparse, hashlib, json, subprocess
from pathlib import Path
from fractions import Fraction
p=argparse.ArgumentParser()
p.add_argument('source',type=Path);p.add_argument('--name',required=True)
p.add_argument('--start',type=float,required=True);p.add_argument('--duration',type=float,required=True)
p.add_argument('--poster',type=float,required=True,help='Absolute timestamp in the original, chosen after visual review')
p.add_argument('--output',type=Path,required=True)
a=p.parse_args()
if not a.name.replace('-','').isalnum() or a.start<0 or not 0<a.duration<=30: p.error('Use a simple name and a positive clip up to 30 seconds.')
info=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_streams','-show_format','-of','json',str(a.source)]))
stream=info['streams'][0];w,h=stream['width'],stream['height'];length=float(info['format']['duration'])
if a.start+a.duration>length or not a.start<=a.poster<a.start+a.duration:p.error('Cut and selected poster must lie within the original.')
if stream.get('color_transfer') in ['smpte2084','arib-std-b67']:p.error('HDR original: approve an SDR colour transform before encoding; no automatic destructive conversion.')
if w/h<1.7 or w/h>1.85:p.error('This pipeline is for the current landscape films; curate a separate portrait composition.')
if h<1080:p.error('Source is below Full HD. No upscaling is performed.')
a.output.mkdir(parents=True,exist_ok=True)
def publish(file):
    digest=hashlib.sha256(file.read_bytes()).hexdigest()[:10]
    target=file.with_name(file.stem+'.'+digest+file.suffix);file.replace(target)
    return '/media/v2/'+target.name
fps=min(30,float(Fraction(stream['avg_frame_rate'])))
if fps<=0:p.error('The source frame rate could not be determined.')
sources=[]
for height,crf,rate in [(1080,20,'12M'),(1440,21,'20M'),(2160,21,'35M')]:
    if height>h:continue
    file=a.output/f'{a.name}-{height}.mp4'
    subprocess.run(['ffmpeg','-v','warning','-y','-ss',str(a.start),'-i',str(a.source),'-t',str(a.duration),'-an','-map_metadata','-1','-vf',f'scale=-2:{height}:flags=lanczos,fps={fps},format=yuv420p','-c:v','libx264','-preset','slow','-crf',str(crf),'-maxrate',rate,'-bufsize',rate,'-g',str(round(fps*2)),'-movflags','+faststart',str(file)],check=True)
    sources.append({'url':publish(file),'width':round(w*height/h/2)*2,'height':height,'type':'video/mp4'})
posters=[]
for width in [800,1600,min(w,2560)]:
    file=a.output/f'{a.name}-poster-{width}.webp'
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(a.poster),'-i',str(a.source),'-vf',f'scale={width}:-2:flags=lanczos','-frames:v','1','-quality','90',str(file)],check=True)
    posters.append({'url':publish(file),'width':width,'height':round(h*width/w/2)*2})
entry={'sources':sources,'posters':posters,'duration':a.duration,'bytes':(a.output/Path(sources[0]['url']).name).stat().st_size}
(a.output/'manifest-entry.json').write_text(json.dumps(entry,indent=2)+'\n')
print('Native web variants ready for visual review. Originals unchanged.')
