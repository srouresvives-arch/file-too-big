# Cloudinary migration — dev only

13 selected assets are mapped in cloudinary-assets.json. Upload API responses and presets are not committed. main was not changed.

The first portrait upload was found visually incomplete and replaced with the complete recovered image. The unused Cloudinary image public ID `mcguljekhpkc6cunfbfb` is not referenced by the portfolio and can be deleted from Media Library. Unsigned uploads do not grant account-wide deletion access.

Verification: all 4 MP4 delivery URLs returned HTTP 200 at native 1920×1080 and HTTP 206 for range requests; all full-size images/posters were downloaded and dimensions checked. The complete portrait replacement was separately checked. Eight frontend interaction tests passed. No new device-browser visual QA or frontend deployment is claimed by this media migration.
