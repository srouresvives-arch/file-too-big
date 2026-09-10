export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export function sceneAt(progress, count) {
  const position = clamp(progress, 0, 1) * count;
  const index = Math.min(Math.floor(position), count - 1);
  const fraction = index===count-1?0:position-index;
  const t = clamp((fraction - .55) / .45, 0, 1);
  return {index, next: Math.min(index + 1, count - 1), blend: t*t*(3-2*t)};
}
export function waveReveal(progress) {
  if(progress>=1)return 'inset(0)';
  const edge=(1-progress)*110-5,amplitude=Math.sin(progress*Math.PI)*3;
  const points=['0% 100%'];
  for(let i=0;i<=16;i++)points.push(`${i/16*100}% ${edge+Math.sin(i/16*Math.PI*3+progress*5)*amplitude}%`);
  points.push('100% 100%');
  return 'polygon('+points.join(',')+')';
}
export function chooseSource(sources, width, dpr=1) {
  // Start at genuine Full HD where it exists. Never manufacture a larger source.
  const target = Math.max(1920, width * Math.min(dpr, 2));
  const ordered = [...sources].sort((a,b)=>a.width-b.width);
  return ordered.find(source=>source.width >= target) || ordered.at(-1);
}
export function languageForPath(path) {
  return /^\/ca(?:\/|$)/.test(path) ? 'ca' : /^\/es(?:\/|$)/.test(path) ? 'es' : 'en';
}
