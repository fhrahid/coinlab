import crypto from 'crypto';

export function cloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

function signParams(params) {
  const toSign = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join('&');
  return crypto.createHash('sha1').update(`${toSign}${process.env.CLOUDINARY_API_SECRET}`).digest('hex');
}

// Signs upload parameters so the browser can upload directly to Cloudinary.
// The API secret never leaves the server: Cloudinary expects a sha1 of the
// sorted `key=value` params with the secret appended. The public_id carries
// the `coinlab/` prefix, which also groups the assets in one Cloudinary folder.
export function createUploadSignature({ publicId }) {
  const params = { public_id: publicId, timestamp: Math.floor(Date.now() / 1000) };
  return { apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME, publicId, signature: signParams(params), timestamp: params.timestamp };
}

// Extracts the resource type and public id from one of our Cloudinary delivery
// URLs (https://res.cloudinary.com/<cloud>/image|raw/upload/v123/coinlab/name.png).
export function publicIdFromUrl(url) {
  if (typeof url !== 'string') return null;
  const match = url.match(new RegExp(`res\\.cloudinary\\.com/${process.env.CLOUDINARY_CLOUD_NAME}/(image|raw|video)/upload/(?:v\\d+/)?(.+)\\.[a-zA-Z0-9]+$`));
  return match ? { resourceType: match[1], publicId: match[2] } : null;
}

// Deletes an uploaded asset from Cloudinary storage. Returns false for foreign
// URLs (e.g. a pasted external logo) so those are never touched.
export async function destroyAsset(url) {
  const asset = publicIdFromUrl(url);
  if (!asset || !cloudinaryConfigured()) return false;
  const params = { public_id: asset.publicId, timestamp: Math.floor(Date.now() / 1000) };
  const body = new URLSearchParams({ api_key: process.env.CLOUDINARY_API_KEY, timestamp: String(params.timestamp), public_id: asset.publicId, signature: signParams(params) });
  const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${asset.resourceType}/destroy`, { method: 'POST', body });
  return response.ok;
}

// Builds the delivery URL for a hero slide: crop, focus point, zoom and tone
// adjustments become Cloudinary transformation params, so the admin editor
// previews exactly what the site will render — without re-uploading anything.
export function slideDeliveryUrl(url, transform = {}, { w = 1280, h = 880 } = {}) {
  if (typeof url !== 'string' || !url.includes('/upload/')) return url || '';
  const t = transform || {};
  const chain = [
    'c_fill', `g_${t.gravity || 'auto'}`, `w_${w}`, `h_${h}`, 'dpr_2', 'q_auto', 'f_auto',
    t.zoom > 1 ? `z_${t.zoom}` : null,
    Math.abs(t.x) > 0 ? `x_${t.x}` : null,
    Math.abs(t.y) > 0 ? `y_${t.y}` : null,
    t.brightness ? `e_brightness:${t.brightness}` : null,
    t.contrast ? `e_contrast:${t.contrast}` : null,
    t.saturation ? `e_saturation:${t.saturation}` : null,
  ].filter(Boolean).join(',');
  return url.replace('/upload/', `/upload/${chain}/`);
}
