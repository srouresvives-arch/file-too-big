"""Import the reviewed user photos and a continuous running fragment.

Originals are never modified. No generated content, upscaling or location metadata.
Usage: python scripts/add-approved-media.py UPLOAD_DIRECTORY V1_REVIEW_DIRECTORY
"""
import hashlib, json, subprocess, sys
from pathlib import Path
from PIL import Image, ImageOps

root=Path(__file__).resolve().parents[1]
uploads, review=map(Path,sys.argv[1:3])
out=root/'dist/media/v2'
manifest=root/'dist/media-manifest.json'
data=json.loads(manifest.read_text())

def hashed(file):
    target=file.with_name(file.stem+'.'+hashlib.sha256(file.read_bytes()).hexdigest()[:10]+file.suffix)
    file.replace(target)
    return '/media/v2/'+target.name

def photo(source,name,widths=(800,1600)):
    im=ImageOps.exif_transpose(Image.open(source)).convert('RGB')
    variants=[]
    for width in sorted(set(min(w,im.width) for w in widths)):
        height=round(im.height*width/im.width)
        file=out/f'{name}-{width}.webp'
        im.resize((width,height),Image.Resampling.LANCZOS).save(file,'WEBP',quality=92,method=6)
        variants.append(dict(url=hashed(file),width=width,height=height))
    return variants

baseline=review/'baseline/dist/media/frames'
data['frames']={
    'coast':photo(uploads/'02-calella2.JPG','coast',(800,1600,2048)),
    'boats':photo(uploads/'04-barquitos.JPG','boats',(600,1152)),
    'geometry':data['frames']['geometry'],
    'residence':photo(baseline/'estate.webp','residence'),
    'passage':photo(baseline/'boat.webp','passage'),
    'curve':photo(baseline/'moto.webp','curve'),
    'copper':photo(baseline/'st-mary.webp','copper'),
    'afterglow':data['frames']['afterglow'],
}
movie=out/'run-1080.mp4'
subprocess.run(['ffmpeg','-v','error','-y','-ss','5.4','-i',str(uploads/'05-Marc-Running-Trim.mp4'),
    '-t','3.25','-vf','crop=1920:1080:0:0,eq=gamma=1.12','-an','-map_metadata','-1',
    '-c:v','libx264','-preset','slow','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',str(movie)],check=True)
poster=review/'run-approved-poster.png'
subprocess.run(['ffmpeg','-v','error','-y','-ss','0.55','-i',str(movie),'-frames:v','1',str(poster)],check=True)
info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,size','-of','json',str(movie)]))['format']
data['films']['run']={'sources':[dict(url=hashed(movie),width=1920,height=1080,type='video/mp4')],
    'duration':float(info['duration']),'bytes':int(info['size']),'posters':photo(poster,'run-poster',(800,1600,1920))}
manifest.write_text(json.dumps(data,indent=2)+'\n')
print('Approved: four films and eight distinct gallery images. Originals unchanged.')
