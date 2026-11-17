import { NextResponse } from "next/server";
import { clientAddress, rateLimit } from "./rate-limit";

// request.json() throws on an empty or malformed body; that used to surface as
// an unhandled 500. Returns null instead so routes can answer with a 400.
export async function readJson(request) {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? body
      : null;
  } catch {
    return null;
  }
}

export const badRequest = (error = "Invalid request body.") =>
  NextResponse.json({ error }, { status: 400 });
export const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

/**
 * Rate limit by caller address. Returns a 429 response when the caller is over
 * the limit, otherwise null:
 *   const blocked = limited(request, "login", { limit: 10, windowMs: 15 * 60_000 });
 *   if (blocked) return blocked;
 */
export function limited(request, name, rule) {
  const { ok, retryAfter } = rateLimit(`${name}:${clientAddress(request)}`, rule);
  if (ok) return null;
  return NextResponse.json(
    { error: "Too many attempts. Please wait a few minutes and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}

/**
 * True when a request comes from this site's own pages. Browsers send Origin
 * on every cross-site POST, so a mismatch means another site is trying to use
 * the visitor's CMS session (CSRF). Requests with no Origin (curl, server
 * scripts) carry no ambient browser session and are allowed.
 */
export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  let host;
  try {
    host = new URL(origin).host;
  } catch {
    return false;
  }
  return [request.headers.get("x-forwarded-host"), request.headers.get("host")].includes(host);
}
