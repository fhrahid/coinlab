import { NextResponse } from 'next/server';
import { getCollection } from '../../../lib/content';
import { getDb } from '../../../lib/mongodb';
import { destroyAsset } from '../../../lib/cloudinary';
import { validAdminToken } from '../../../lib/admin';

export async function GET(request) {
  const collection = new URL(request.url).searchParams.get('collection') || 'wings';
  return NextResponse.json(await getCollection(collection));
}

export async function POST(request) {
  if (!(await validAdminToken(request.cookies.get('coinlab_admin')?.value))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!process.env.MONGODB_URI) return NextResponse.json({ error: 'Connect MongoDB before publishing CMS content.' }, { status: 503 });
  const body = await request.json();
  const collection = body.collection;
  if (!['wings', 'people', 'papers', 'partners', 'slides'].includes(collection)) return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
  delete body.collection;
  if (!body.slug && (body.name || body.title)) body.slug = String(body.name || body.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (!body.slug || !/^[a-z0-9-]+$/.test(body.slug)) return NextResponse.json({ error: 'Add a name or title before saving.' }, { status: 400 });
  for (const key of ['focusPoints', 'authors', 'wingSlugs']) if (typeof body[key] === 'string') body[key] = body[key].split(key === 'focusPoints' ? '\n' : ',').map((value) => value.trim()).filter(Boolean);
  const db = await getDb();
  await db.collection(collection).updateOne({ slug: body.slug }, { $set: { ...body, updatedAt: new Date() } }, { upsert: true });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  if (!(await validAdminToken(request.cookies.get('coinlab_admin')?.value))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!process.env.MONGODB_URI) return NextResponse.json({ error: 'Connect MongoDB before deleting CMS content.' }, { status: 503 });
  const { collection, slug } = await request.json();
  if (!['wings', 'people', 'papers', 'partners', 'slides'].includes(collection) || !slug) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  const db = await getDb();
  const doc = await db.collection(collection).findOne({ slug });
  if (!doc) return NextResponse.json({ error: 'Record not found' }, { status: 404 });
  await db.collection(collection).deleteOne({ slug });
  const mediaRemoved = [];
  for (const field of ['photoKey', 'coverKey', 'pdfKey', 'logoUrl', 'image']) if (doc[field] && (await destroyAsset(doc[field]))) mediaRemoved.push(field);
  return NextResponse.json({ ok: true, mediaRemoved });
}
