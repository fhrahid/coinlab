# Plan: move media from Cloudinary to Cloudflare R2

Status: **plan only, nothing implemented.**

## Why, and the one hard part

R2 is plain object storage with no egress fees. Moving files there is easy.

The hard part is that this site uses Cloudinary for more than storage. Cloudinary also **transforms images through the URL**, and three features depend on that:

| Feature | Where | Cloudinary does |
|---|---|---|
| Slide editor | `lib/media.js#slideDeliveryUrl`, `components/admin/slide-editor.jsx` | Crop to a focus point (`g_auto`, compass gravity), zoom, pan, brightness, contrast, saturation, format and quality |
| Thumbnails | `lib/media.js#thumbUrl` | Face-aware square crop for avatars, width-limited logos |
| Format and quality | both | `f_auto,q_auto` (AVIF/WebP for browsers that accept them) |

R2 does none of this. So the plan needs a transformation layer, and Decision 1 below picks it.

## Decision 1: how images get resized and adjusted

| Option | What it is | Slide editor keeps working | Cost and effort |
|---|---|---|---|
| **A. Cloudflare Image Transformations** (recommended) | Put the R2 bucket behind a custom domain on your Cloudflare zone and request `/cdn-cgi/image/<options>/<path>` | Mostly. Resize, fit, gravity, brightness, contrast, gamma and format are supported. Saturation and face-aware gravity need checking | Lowest effort. Has a free monthly quota of unique transformations, then paid |
| B. Resize in the browser before upload | Editor crops and adjusts on a canvas; R2 stores finished files in two or three sizes | Yes, but edits become permanent files, not live URL parameters | No per-request cost. Most code: canvas editor, multi-size upload |
| C. Keep Cloudinary for images, use R2 only for PDFs | Hybrid | Yes, unchanged | Smallest change, smallest saving |

Recommendation: **A**, with **C** as the fallback if a transformation the slide editor needs is missing.

**Check before starting (I have not verified these against current Cloudflare docs):**

- That `saturation` and automatic-subject gravity exist in Image Transformations. If not, drop those two controls or choose B.
- Whether face-aware cropping (`g_face` today) has an equivalent. If not, avatars fall back to centre crop.
- The current free quota for transformations and for R2 storage and operations.
- That the domain is on a Cloudflare zone (required for custom-domain public access and for transformations).

## Decision 2: public access

Serve the bucket from a custom domain such as `media.coinlabai.com`. Do not use the `r2.dev` address in production; it is rate-limited and meant for testing.

## Target design

```
Browser (CMS) ──POST /api/uploads──▶ Next.js ──signs──▶ presigned PUT URL (S3 API)
Browser (CMS) ──PUT file────────────────────────────▶ R2 bucket "coinlab-media"
Visitors ─────GET media.coinlabai.com/cdn-cgi/image/<options>/<key>──▶ Cloudflare ──▶ R2
```

- Uploads stay direct from the browser, as today. The server only signs.
- Presigned URLs are issued against the R2 S3 endpoint (`<account-id>.r2.cloudflarestorage.com`), not the custom domain.
- The bucket needs a CORS rule allowing `PUT` from the site origin.
- Records store the **object key** (`people/1731900000-name.jpg`), not a full URL. One helper builds delivery URLs. That removes the vendor from the database.

## Code changes

| File | Change |
|---|---|
| `lib/storage.js` (new) | `createUploadUrl({ key, contentType })`, `deleteObject(key)`, `publicUrl(key)`. Sign with `aws4fetch` (about 2 kB, no AWS SDK) |
| `lib/cloudinary.js` | Delete after cutover |
| `app/api/uploads/route.js` | Return `{ uploadUrl, key }` instead of a Cloudinary signature. Keep the content-type allowlist; add a size limit in the signed request |
| `components/admin/use-upload.js` | `PUT` the file to `uploadUrl` with its `Content-Type`; save `key` |
| `lib/media.js` | Rewrite `slideDeliveryUrl` and `thumbUrl` to emit `/cdn-cgi/image/...` options. Keep the same function signatures so pages do not change |
| `lib/content.js#mediaUrl` | Resolve a key to `https://media.coinlabai.com/<key>`; keep accepting full `https://` URLs for pasted external logos and for unmigrated Cloudinary files |
| `app/api/content/route.js` | Replace `destroyAsset(url)` with `deleteObject(key)` |
| `app/api/settings/route.js`, `settings-dialog.jsx` | Replace the Cloudinary usage card with bucket name and a link to the R2 dashboard |
| `.env.example`, README, AGENTS.md | New variables below |

New environment variables:

```
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=coinlab-media
MEDIA_BASE_URL=https://media.coinlabai.com
```

The R2 API token should be scoped to this one bucket with object read and write only.

## Parameter mapping (option A)

| Today (Cloudinary) | Cloudflare option | Note |
|---|---|---|
| `c_fill,w_,h_` | `fit=cover,width=,height=` | |
| `c_limit,w_` | `fit=scale-down,width=` | |
| `g_auto` | `gravity=auto` | verify |
| `g_north` … `g_south_east` | `gravity=top` … or `gravity=XxY` coordinates | compass names differ |
| `g_face` | `gravity=face` | verify availability |
| zoom + `c_crop,x_,y_` | `gravity=XxY` with a tighter `width/height`, or `trim` | needs a small rewrite of the pan maths |
| `e_brightness`, `e_contrast` | `brightness=`, `contrast=` | Cloudflare uses multipliers (1 = unchanged), Cloudinary uses −100…100 |
| `e_saturation` | `saturation=` | verify |
| `q_auto,f_auto` | `quality=85,format=auto` | |

Because the scales differ, stored slide `transform` values need converting once, or the URL builder converts on the fly. Converting in the builder is safer: no data change.

## Migrating existing files

A one-off script, `scripts/migrate-media.mjs`, run by hand:

1. For each collection and media field (`wings.coverKey`, `people.photoKey`, `papers.pdfKey`, `partners.logoUrl`, `slides.image`), find values that are Cloudinary URLs.
2. Download the **original** file (strip any transformation segment from the URL).
3. Upload it to R2 under `<collection>/<original-name>`.
4. Write the new key to the record. Keep the old URL in `legacyUrl` on the same record.
5. Log every record changed to a file.

Rules for the script:

- Dry-run by default; `--write` to apply.
- Idempotent: skip records that already hold a key.
- Never delete from Cloudinary. Deletion is a separate, later step.
- Leave external URLs that are not Cloudinary (pasted partner logos) untouched.

## Rollout

1. **Prepare.** Create the bucket, custom domain, CORS rule and scoped token. Enable transformations. Confirm the "check before starting" list.
2. **Dual-read.** Ship `mediaUrl` that understands both keys and old URLs. Nothing changes for visitors.
3. **Switch new uploads to R2.** Old files still come from Cloudinary.
4. **Rebuild the URL helpers** for R2-stored files, behind the same function names. Compare each page before and after.
5. **Migrate old files** with the script, dry-run first. Take a database backup before `--write`.
6. **Watch for two weeks.** Check 404s on the media domain and the transformation quota.
7. **Clean up.** Remove `lib/cloudinary.js`, the Cloudinary variables and `legacyUrl`. Delete the Cloudinary assets last.

Rollback at any step before 7: point `mediaUrl` back at `legacyUrl`. The old files are still there.

## Risks

| Risk | Mitigation |
|---|---|
| A slide adjustment has no Cloudflare equivalent | Verify first; remove that control or use option B or C |
| Transformation quota exceeded | Few unique sizes (fixed width list), long cache headers on the media domain |
| Broken images after migration | Dual-read, `legacyUrl`, dry-run log, no Cloudinary deletion until the end |
| Upload abuse | Admin-only signing, content-type allowlist, size limit, short URL expiry |
| PDFs served with the wrong type | Set `Content-Type` and `Content-Disposition` when signing the upload |

## Effort

Roughly: storage helper and upload path, half a day. URL helpers and slide-editor maths, one to two days including visual comparison. Migration script and run, half a day. Clean-up, a couple of hours.
