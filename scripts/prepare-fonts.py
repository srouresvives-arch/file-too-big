"""Self-host the portfolio's existing open-source typefaces (no tracking requests)."""
from pathlib import Path
from urllib.request import urlopen
from fontTools import subset

out=Path(__file__).resolve().parents[1]/'dist/fonts'
out.mkdir(parents=True,exist_ok=True)
fonts=[
 ('dm-sans-regular','https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxhTg.ttf'),
 ('dm-sans-medium','https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAkJxhTg.ttf'),
 ('playfair-italic','https://fonts.gstatic.com/s/playfairdisplay/v40/nuFRD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_qiTbtY.ttf'),
]
for name,url in fonts:
    raw=out/(name+'.ttf'); raw.write_bytes(urlopen(url,timeout=30).read())
    options=subset.Options(); options.flavor='woff2'
    font=subset.load_font(str(raw),options)
    sub=subset.Subsetter(options=options)
    sub.populate(unicodes=list(range(0x20,0x250))+list(range(0x2000,0x2070))+list(range(0x2190,0x2200))+[0x2212])
    sub.subset(font); subset.save_font(font,str(out/(name+'.woff2')),options)
    raw.unlink()
for name in ['dmsans','playfairdisplay']:
    (out/(name+'-OFL.txt')).write_bytes(urlopen(f'https://raw.githubusercontent.com/google/fonts/main/ofl/{name}/OFL.txt',timeout=30).read())
print('Prepared three WOFF2 fonts and both OFL licences.')
