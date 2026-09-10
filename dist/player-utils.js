export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export function sceneAt(progress, count) {
  const position = clamp(progress, 0, 1) * count;
  const index = Math.min(Math.floor(position), count - 1);
  const fraction = index===count-1?0:position-index;
  // Let each hand-off breathe: start a little earlier and use a smoother quintic ease.
  const t = clamp((fraction - .38) / .62, 0, 1);
  const blend = t*t*t*(t*(t*6-15)+10);
  return {index, next: Math.min(index + 1, count - 1), blend};
}
export function waveReveal(progress) {
  if(progress>=1)return 'inset(0)';
  // A restrained vertical curtain: enough organic movement to feel cinematic,
  // without the obvious "wave effect" of the earlier transition.
  const eased=progress*progress*(3-2*progress);
  const edge=(1-eased)*108-4;
  const amplitude=Math.sin(eased*Math.PI)*1.35;
  const points=['0% 100%'];
  for(let i=0;i<=24;i++){
    const x=i/24;
    const bend=Math.sin(x*Math.PI*2.2+eased*2.4)*amplitude;
    points.push(`${x*100}% ${edge+bend}%`);
  }
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
