from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps
from fontTools.ttLib import TTFont
import json, tempfile
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'dist/media-manifest.json').read_text())
source=root/'dist'/data['films']['sea']['posters'][-1]['url'].lstrip('/')
image=ImageOps.fit(Image.open(source).convert('RGB'),(1200,630))
layer=Image.new('RGBA',image.size,(0,0,0,0))
draw=ImageDraw.Draw(layer)
for x in range(850):
    draw.line([(x,0),(x,630)],fill=(7,26,37,round(160*(1-x/850))))
image=Image.alpha_composite(image.convert('RGBA'),layer)
with tempfile.TemporaryDirectory() as temporary:
    font=TTFont(root/'dist/fonts/dm-sans-medium.woff2');font.flavor=None
    font.save(Path(temporary)/'font.ttf')
    draw=ImageDraw.Draw(image)
    draw.text((65,68),'FILE TOO BIG.',font=ImageFont.truetype(str(Path(temporary)/'font.ttf'),66),fill='#f1f1e8')
    draw.text((68,160),'AERIAL FILMS & PHOTOGRAPHY',font=ImageFont.truetype(str(Path(temporary)/'font.ttf'),17),fill='#cbecac')
    draw.text((68,551),'SERGI ROURES VIVES',font=ImageFont.truetype(str(Path(temporary)/'font.ttf'),15),fill='#f1f1e8')
image.convert('RGB').save(root/'dist/social.jpg',quality=94,optimize=True)
icon=Image.new('RGB',(180,180),'#071a25');d=ImageDraw.Draw(icon)
scale=180/64
d.polygon([(int(x*scale),int(y*scale)) for x,y in [(16,16),(48,16),(48,23),(24,23),(24,32),(43,32),(43,39),(24,39),(24,52),(16,52)]],fill='#f1f1e8')
d.ellipse(tuple(int(n*scale) for n in (42,42,52,52)),fill='#cbecac')
icon.save(root/'dist/apple-touch-icon.png')
print('Social preview uses an authentic selected frame; touch icon matches the SVG favicon.')
