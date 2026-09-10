import json,subprocess,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
review=Path(sys.argv[1]) if len(sys.argv)>1 else root/'review'
m=json.loads((root/'dist/media-manifest.json').read_text())
sources={'sea':('boat-hq.mp4',1.2),'ride':('motorbikes-hq.mp4',0),'space':('architecture-hq.mp4',4.8)}
results=[]
for key,(name,start) in sources.items():
    film=m['films'][key];file=root/'dist'/film['sources'][0]['url'].lstrip('/')
    cmd=['ffmpeg','-v','info','-ss',str(start),'-t',str(film['duration']),'-i',str(review/name),'-i',str(file),'-filter_complex','[0:v]fps=30,setpts=PTS-STARTPTS[ref];[1:v]setpts=PTS-STARTPTS[web];[web][ref]ssim','-an','-f','null','-']
    result=subprocess.run(cmd,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,text=True,check=True)
    metrics=[s.strip() for s in result.stderr.splitlines() if 'SSIM Y:' in s]
    results.append({'film':key,'metrics':metrics,'bytes':file.stat().st_size})
    for label,source,time in [('reference',review/name,start+2),('web',file,2)]:
        subprocess.run(['ffmpeg','-v','error','-y','-ss',str(time),'-i',str(source),'-frames:v','1',str(review/f'{key}-{label}-comparison.png')],check=True)
(review/'quality-report.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
