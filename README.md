# FILE TOO BIG — development portfolio

`main` is the official/stable branch. Work on `dev`; do not merge or deploy over the stable site without approval.

The frontend is static HTML, CSS and JavaScript. All portfolio videos, gallery photographs and the portrait are delivered by Cloudinary cloud `jgvr0ayi`. No R2 bucket, media Worker proxy or upload credentials are required to build or run this branch.

## Edit and preview

Use Node 22 or later:

```sh
npm ci
npm run build
npm run check
npm test
npm run dev
```

- Text and translations: `dist/i18n.js`.
- Design: `dist/style.css`.
- Animation and playback: `dist/app.js`.
- Actual Cloudinary assets and source filenames: `cloudinary-assets.json`.
- Responsive delivery URLs: `dist/media-manifest.json`.
- Regenerate media URLs after changing asset metadata: `npm run media:build`, then `npm run build`.

Cloudinary public IDs and delivery URLs are not API secrets. Upload presets, API keys and secrets are not stored in this repository. Upload new approved files through your Cloudinary account, then copy their public metadata into the asset map. Updating the asset map does not upload files.

## Curated media

Four silent, looping H.264 Full HD films: sea (11.8 seconds), space (5.4), ride (7.8), run (3.25). Sea and space were encoded from the earliest recovered high-quality sources at CRF 16, retaining their selected cuts. Ride reuses its existing high-quality cut; run retains the approved natural running sequence and mild exposure adjustment. These are the best accessible sources for this selection, not claimed 4K camera masters.

Eight gallery images: coast, boats, geometry, residence, passage, curve, copper, afterglow. The uploaded coast and boats files are the provided JPGs. The other six are the earliest available frame files, avoiding another WebP generation before upload. The portrait uses the complete recovered sergi-roures.jpeg at its native 864×1536. The attachment copy IMG_1262.jpeg was incomplete and rejected during visual QA.

Videos use the uploaded H.264 files directly, avoiding a second lossy Cloudinary transcode. Posters use chosen frame offsets (sea 4.8s, space 3s, ride 1.8s, run 0.55s). Images/posters use quality 95 WebP and `c_limit`; requested sizes never exceed source dimensions. The frontend still loads nearby media progressively.

## Optional development hosting

Cloudinary migration does not publish over the official site. For a separately configured development origin, set `SITE_ORIGIN` before `npm run build`.

- Cloudflare static hosting: `npm run prepare:cloudflare`; `wrangler.jsonc` targets only `file-too-big-dev`, with no R2 binding.
- GitHub Pages preparation: `npm run prepare:pages`. It preserves Cloudinary URLs and applies the repository base path. This command alone does not publish Pages.

The old R2 upload script, R2 Worker and its tests have been removed from dev. `REVIEW.md` remains a historical editorial record from before this migration.
