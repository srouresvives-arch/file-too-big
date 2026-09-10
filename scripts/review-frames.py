"""Contact sheets for internal curation; does not modify source media."""
from pathlib import Path
from PIL import Image, ImageDraw
import subprocess, sys

root = Path(__file__).resolve().parents[1]
review = Path(sys.argv[1]) if len(sys.argv)>1 else root/'review'
files = sorted((review/'baseline/dist/media/frames').glob('*.webp'))
sheet = Image.new('RGB', (1280, ((len(files)+2)//3)*265), '#0b1720')
draw = ImageDraw.Draw(sheet)
for index, path in enumerate(files):
    im = Image.open(path).convert('RGB'); im.thumbnail((420,236))
    x,y=(index%3)*426,(index//3)*265
    sheet.paste(im,(x,y)); draw.text((x+8,y+240),path.stem,fill='white')
sheet.save(review/'all-stills.jpg',quality=93)
for t in [11.8,12.8,13.8,14.8,15.8,16.3]:
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(review/'action-before-compression.mp4'),'-frames:v','1',str(review/f'runner-{t}.png')],check=True)
