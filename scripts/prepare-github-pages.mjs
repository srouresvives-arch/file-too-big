import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = path.join(root, 'dist');
const output = path.join(root, '.pages');
const basePath = normalizeBase(process.env.PAGES_BASE_PATH || '/file-too-big');
const mediaOrigin = 'https://res.cloudinary.com/jgvr0ayi';

function normalizeBase(value) {
  if (!value || value === '/') return '';
  return '/' + value.replace(/^\/+|\/+$/g, '');
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function write(file, value) {
  fs.writeFileSync(file, value);
}

function rewriteMedia(value) {
  return value;
}

function rewriteHtml(value) {
  let next = rewriteMedia(value);
  next = next.replace(/((?:href|src)=")\/(?!\/)/g, `$1${basePath}/`);
  next = next.replace(/((?:imagesrcset|srcset)=")([^"]*)"/g, (_, start, list) => {
    const rewritten = list.replace(/(^|,\s*)\/(?!\/)/g, `$1${basePath}/`);
    return start + rewritten + '"';
  });
  return next;
}

function rewriteApp(value) {
  let next = value;
  next = next.replace(
    'const body=document.body;',
    `const body=document.body;\nconst siteBase=${JSON.stringify(basePath)};`
  );
  next = next.replaceAll(
    'languageForPath(location.pathname)',
    'languageForPath(location.pathname,siteBase)'
  );
  next = next.replace(
    "const route=lang==='en'?'/':'/'+lang+'/';",
    "const route=siteBase+(lang==='en'?'/':'/'+lang+'/');"
  );
  return next;
}

function rewriteHelpers(value) {
  return value.replace(
    'export function languageForPath(path) {',
    "export function languageForPath(path, base='') {\n  if (base && path.startsWith(base)) path = path.slice(base.length) || '/';"
  );
}

fs.rmSync(output, {recursive: true, force: true});
fs.cpSync(source, output, {recursive: true});

for (const relative of ['index.html', 'ca/index.html', 'es/index.html']) {
  const file = path.join(output, relative);
  write(file, rewriteHtml(read(file)));
}

const mediaJs = path.join(output, 'media.js');
write(mediaJs, rewriteMedia(read(mediaJs)));

const appJs = path.join(output, 'app.js');
write(appJs, rewriteApp(read(appJs)));

const helpers = path.join(output, 'player-utils.js');
write(helpers, rewriteHelpers(read(helpers)));

const css = path.join(output, 'style.css');
write(css, read(css).replaceAll("url('/fonts/", `url('${basePath}/fonts/`));

const manifest = path.join(output, 'media-manifest.json');
write(manifest, rewriteMedia(read(manifest)));

for (const relative of ['index.html', 'ca/index.html', 'es/index.html']) {
  const html = read(path.join(output, relative));
  if (html.includes('src="/app.js"') || html.includes('href="/style.css"')) {
    throw new Error(`Unprefixed local asset remained in ${relative}`);
  }
  if (html.includes('"/media/')) {
    throw new Error(`Unrewritten media path remained in ${relative}`);
  }
}

if (!read(appJs).includes(`const siteBase=${JSON.stringify(basePath)};`)) {
  throw new Error('GitHub Pages base path was not injected into app.js');
}
if (!read(mediaJs).includes(mediaOrigin + '/')) {
  throw new Error('Media origin was not injected into media.js');
}

console.log(`Prepared GitHub Pages output in .pages (base ${basePath || '/'}, media ${mediaOrigin}).`);

