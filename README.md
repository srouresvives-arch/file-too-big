# FILE TOO BIG — independent V2

Sergi Roures Vives’s aerial portfolio. V1 is unchanged.

This is a small, static site with native browser JavaScript, three rendered
language routes, and a separate optional Cloudflare Worker for media delivery.
There is no application framework, runtime database, AI content generation,
analytics tracker or third-party video embed.

## Current and requested infrastructure

| Component | Current comparison version | Prepared next step |
| --- | --- | --- |
| Source | Dedicated V2 Sites Git repository | Push to a new GitHub repository |
| Frontend | Independent, owner-private Sites publication | Cloudflare Worker Static Assets |
| Media | Selected, content-addressed assets in the independent publication | R2 bucket `drone-portfolio-media`, prefix `v2/` |
| Deployment | Native Sites publication | Manual GitHub Actions workflow `deploy-v2.yml` |

GitHub and the user's Cloudflare account were not connected during this work.
The bucket's existence and permissions have **not** been verified. The Worker
configuration has passed a local dry build and its HTTP logic has unit tests,
but no claim is made that these resources are deployed in the user's account.

## Local work

Use Node 22 or later:

```sh
npm ci
npm run build
npm run check
npm test
```

`npm run dev` serves the site during ordinary local development. In ChatGPT
Work, use the supervised preview workflow when available. The cloud browser's
URL policy blocked visual testing in the authoring session; the DOM tests are
not a substitute for real Safari, Chrome or device QA.

## Source map

- `dist/i18n.js`: all public copy, captions, accessible labels and metadata.
- `dist/style.css`: existing blue / ivory / green visual identity and layout.
- `dist/app.js`: scroll transitions, native video scheduling, menu and viewer.
- `dist/player-utils.js`: language routing, transitions and source selection.
- `dist/media-manifest.json`: the current curated assets; the build generates
  `dist/media.js` for the browser and Worker from this single source.
- `scripts/render.mjs`: generates `/`, `/ca/`, `/es/`, sitemap and robots.
- `worker/index.js`: an allowlisted, read-only R2 stream handler.
- `REVIEW.md`: editorial decisions, evidence and remaining limitations.

The root route is always English. Language choices have their own URL.
The old V1 language preference is deliberately not reused.

The current revision has four video chapters with text overlays and wave
transitions on desktop and mobile, no visible video controls, an eight-image
editorial gallery, and a readiness-based critical-asset intro. On portrait
screens, a 4:5 image window limits cropping of the available Full HD films.
The loader never waits for below-the-fold media and has a 2.4-second escape.

## Rebuild the accessible-media selection

The selected web assets are committed in V2. Older, unused encodes remain in
the separate V1 source history, so the V2 repository does not need to import
all of them. Ordinary builds and deployments need only this checkout.
To repeat the historical recovery, supply a V1 checkout containing that history.
No original camera master was available; recovery does not imply 4K quality.
With FFmpeg, FFprobe, Pillow, fontTools and Brotli installed:

```sh
node scripts/audit-media.mjs review /path/to/v1-checkout
python scripts/review-frames.py review
python scripts/build-curated-media.py review
node scripts/prune-media.mjs
python scripts/quality-review.py review
npm run build
npm run check
npm test
```

The scripts write new derivatives and never modify camera masters.
After rebuilding the historical selection, reapply the reviewed new uploads:

```sh
python scripts/add-approved-media.py /path/to/upload-directory review
node scripts/render.mjs
node scripts/check.mjs
```

The import expects the five numbered upload filenames from this revision.
The two rejected photos are not copied into the deployed site.
The old Windows-specific V1 encoders were removed from this checkout so they
cannot accidentally rebuild the new site at 360p.

## Working with new originals

`scripts/encode-original.py` prepares landscape SDR clips at native 1080p,
1440p and 2160p only when the source supports those sizes. It refuses to upscale
or silently transform HDR. Choose the cut and poster after viewing the source.

```sh
python scripts/encode-original.py original.mp4 --name sea --start 12 --duration 8 --poster 16 --output review/new-sea
```

Review the outputs, copy approved hashed files into `dist/media/v2/`, and merge
the generated entry into `dist/media-manifest.json`. Regenerate the three HTML routes
and repeat the checks. There are currently **no actual 1440p or 4K sources**;
only the recovery path and selection logic are ready for them.

## Move to GitHub → Cloudflare → R2

1. Connect the intended GitHub account and create an independent V2 repository.
   Push this checkout there, preserving history. Do not target the V1 repository.
2. In the intended Cloudflare account, verify the existing
   `drone-portfolio-media` bucket. No bucket or paid product was created here.
3. Set the repository secrets `CLOUDFLARE_API_TOKEN` and
   `CLOUDFLARE_ACCOUNT_ID` through the provider's secret UI. The token needs
   only the appropriate V2 Worker deployment and media bucket write access.
   Never put credentials in code, a chat message or an R2 URL.
4. Set repository variable `V2_SITE_ORIGIN` to the independent HTTPS origin.
   The workflow refuses to use V1 as its destination.
5. Run the manual **Deploy independent V2** workflow. It builds, checks, tests,
   uploads only manifest-listed files under `v2/`, and deploys
   `file-too-big-v2`. It does not list or delete the rest of the bucket.
6. Verify actual GET/HEAD/206/304 responses and seek/playback on the deployed
   origin, then complete visual QA on desktop, tablet, iPhone and Android.

For local Cloudflare deployment after secure authentication, use
`npm run prepare:cloudflare`, then `node scripts/upload-r2.mjs` to review the
upload plan. `--apply` uploads the selected files. `npx wrangler deploy`
deploys the independent Worker.

Media is served from the same site origin through the Worker, keeping browser
video loading simple. The handler sets MIME, byte ranges, ETags, immutable
browser caching and public-media CORS, and streams data without buffering an
entire video in Worker memory. The R2 bucket itself need not be public.

The workflow is manual, not an automatic production replacement. The V1
address and deployment remain untouched.
