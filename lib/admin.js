import crypto from 'crypto';

// The CMS password can be changed at runtime (Settings panel). When a password
// exists in the `settings` collection it takes priority over ADMIN_PASSWORD in
// .env; it is stored as a salted HMAC hash, never in plain text.
async function loadAdminDoc() {
  if (!process.env.MONGODB_URI) return null;
  try {
    const { getDb } = await import('./mongodb');
    const db = await getDb();
    return await db.collection('settings').findOne({ key: 'admin' });
  } catch { return null; }
}

export function passwordSourceSync() { return process.env.ADMIN_PASSWORD ? 'environment' : 'none'; }

export async function passwordSource() {
  const doc = await loadAdminDoc();
  return doc ? 'database' : passwordSourceSync();
}

export async function verifyPassword(candidate) {
  const doc = await loadAdminDoc();
  if (doc) {
    if (typeof candidate !== 'string') return false;
    const hash = crypto.createHmac('sha256', doc.salt).update(candidate).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(doc.hash));
  }
  return Boolean(process.env.ADMIN_PASSWORD) && candidate === process.env.ADMIN_PASSWORD;
}

export async function setPassword(newPassword) {
  const { getDb } = await import('./mongodb');
  const salt = crypto.randomBytes(12).toString('hex');
  const hash = crypto.createHmac('sha256', salt).update(newPassword).digest('hex');
  const db = await getDb();
  await db.collection('settings').updateOne({ key: 'admin' }, { $set: { key: 'admin', salt, hash, updatedAt: new Date() } }, { upsert: true });
}

export async function tokenSecret() {
  const doc = await loadAdminDoc();
  if (doc) return `${doc.salt}.${doc.hash}`;
  return process.env.ADMIN_PASSWORD || 'change-me';
}

export function makeAdminToken(secret) {
  const payload = `${Date.now()}.${crypto.randomBytes(18).toString('hex')}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

export async function validAdminToken(token) {
  if (!token) return false;
  const source = await passwordSource();
  if (source === 'none') return false;
  const [time, nonce, signature] = token.split('.');
  if (!time || !nonce || !signature || Date.now() - Number(time) > 1000 * 60 * 60 * 12) return false;
  const secret = await tokenSecret();
  const expected = crypto.createHmac('sha256', secret).update(`${time}.${nonce}`).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
