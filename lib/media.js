// Client-safe helpers (no Node built-ins). The admin page used to import
// slideDeliveryUrl from lib/cloudinary.js, which drags Node's `crypto` into the
// browser bundle as a large polyfill.

const SLIDE_SCALE = 2; // render at 2x for high-density screens
const GRAVITIES = [
  "auto",
  "center",
  "north",
  "south",
  "east",
  "west",
  "north_west",
  "north_east",
  "south_west",
  "south_east",
];

// Builds the delivery URL for a hero slide. Cloudinary ignores x/y offsets and
// zoom on c_fill, so the Position/Zoom sliders previously had no real effect.
// Instead: fill an enlarged box (zoom), then crop the target size out of it,
// panned by x/y. x/y (-600…600) map onto the panning room the zoom creates.
export function slideDeliveryUrl(
  url,
  transform = {},
  { w = 1280, h = 880 } = {},
) {
  if (typeof url !== "string" || !url.includes("/upload/")) return url || "";
  const t = transform || {};
  const W = Math.round(w * SLIDE_SCALE);
  const H = Math.round(h * SLIDE_SCALE);
  const zoom = Math.min(Math.max(Number(t.zoom) || 1, 1), 3);
  const fillW = Math.round(W * zoom);
  const fillH = Math.round(H * zoom);
  const pan = (value, room) =>
    Math.round(
      (Math.max(-600, Math.min(600, Number(value) || 0)) / 600) * room,
    );
  const dx = pan(t.x, (fillW - W) / 2);
  const dy = pan(t.y, (fillH - H) / 2);
  const gravity = GRAVITIES.includes(t.gravity) ? t.gravity : "auto";
  const steps = [`c_fill,g_${gravity},w_${fillW},h_${fillH}`];
  if (zoom > 1)
    steps.push(
      [
        "c_crop",
        "g_center",
        `w_${W}`,
        `h_${H}`,
        dx ? `x_${dx}` : null,
        dy ? `y_${dy}` : null,
      ]
        .filter(Boolean)
        .join(","),
    );
  const effects = [
    Number(t.brightness) ? `e_brightness:${Number(t.brightness)}` : null,
    Number(t.contrast) ? `e_contrast:${Number(t.contrast)}` : null,
    Number(t.saturation) ? `e_saturation:${Number(t.saturation)}` : null,
  ].filter(Boolean);
  effects.forEach((effect) => steps.push(effect));
  steps.push("q_auto,f_auto");
  return url.replace("/upload/", `/upload/${steps.join("/")}/`);
}

export function doiUrl(doi) {
  if (!doi) return "";
  const value = String(doi).trim();
  if (/^https?:\/\//i.test(value) && !/doi\.org\//i.test(value)) return value;
  return `https://doi.org/${value.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").replace(/^doi:\s*/i, "")}`;
}

export function toList(value, separator = ",") {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string")
    return value
      .split(separator)
      .map((v) => v.trim())
      .filter(Boolean);
  return [];
}

export function initials(name) {
  return (
    String(name || "?")
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("") || "?"
  );
}
