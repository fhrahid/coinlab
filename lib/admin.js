import crypto from "crypto";
import { promisify } from "util";
import { sameOrigin } from "./http";

const scrypt = promisify(crypto.scrypt);
// Slow by design: each guess costs real CPU time, unlike a plain hash.
const scryptHash = async (password, salt) =>
  (await scrypt(password, salt, 64)).toString("hex");

// The CMS password can be changed at runtime (Settings panel). When a password
// exists in the `settings` collection it takes priority over ADMIN_PASSWORD in
// .env; it is stored as a salted HMAC hash, never in plain text.
async function loadAdminDoc() {
  if (!process.env.MONGODB_URI) return null;
  try {
    const { getDb } = await import("./mongodb");
    const db = await getDb();
    return await db.collection("settings").findOne({ key: "admin" });
  } catch {
    return null;
  }
}

// crypto.timingSafeEqual throws a RangeError when the buffers differ in length,
// which turned any malformed or tampered cookie into a 500. Compare fixed-size
// digests instead so the check is constant-time and never throws.
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const da = crypto.createHash("sha256").update(a).digest();
  const db = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(da, db) && a.length === b.length;
}

function secretFor(doc) {
  if (doc) return `${doc.salt}.${doc.hash}`;
  return process.env.ADMIN_PASSWORD || null;
}

export function passwordSourceSync() {
  return process.env.ADMIN_PASSWORD ? "environment" : "none";
}

export async function passwordSource() {
  const doc = await loadAdminDoc();
  return doc ? "database" : passwordSourceSync();
}

export async function verifyPassword(candidate) {
  if (typeof candidate !== "string" || !candidate) return false;
  const doc = await loadAdminDoc();
  if (doc?.algo === "scrypt")
    return safeEqual(await scryptHash(candidate, doc.salt), doc.hash);
  if (doc) {
    // Passwords set before scrypt were stored as a fast salted HMAC. Accept
    // one last time, then re-store with scrypt.
    const hash = crypto
      .createHmac("sha256", doc.salt)
      .update(candidate)
      .digest("hex");
    if (!safeEqual(hash, doc.hash)) return false;
    await setPassword(candidate);
    return true;
  }
  return (
    Boolean(process.env.ADMIN_PASSWORD) &&
    safeEqual(candidate, process.env.ADMIN_PASSWORD)
  );
}

export async function setPassword(newPassword) {
  const { getDb } = await import("./mongodb");
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await scryptHash(newPassword, salt);
  const db = await getDb();
  await db
    .collection("settings")
    .updateOne(
      { key: "admin" },
      {
        $set: {
          key: "admin",
          algo: "scrypt",
          salt,
          hash,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
}

export async function tokenSecret() {
  return secretFor(await loadAdminDoc());
}

export function makeAdminToken(secret) {
  if (!secret) throw new Error("No admin password is configured");
  const payload = `${Date.now()}.${crypto.randomBytes(18).toString("hex")}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return `${payload}.${signature}`;
}

export async function validAdminToken(token) {
  if (typeof token !== "string" || !token) return false;
  const [time, nonce, signature, extra] = token.split(".");
  if (!time || !nonce || !signature || extra !== undefined) return false;
  const age = Date.now() - Number(time);
  if (!Number.isFinite(age) || age < 0 || age > 1000 * 60 * 60 * 12)
    return false;
  // One settings lookup per request (previously two).
  const secret = secretFor(await loadAdminDoc());
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${time}.${nonce}`)
    .digest("hex");
  return safeEqual(signature, expected);
}

export async function isAdminRequest(request) {
  // Writes must come from this site's own pages, not from another origin
  // riding on the editor's session cookie.
  if (request.method !== "GET" && !sameOrigin(request)) return false;
  return validAdminToken(request.cookies.get("coinlab_admin")?.value);
}
