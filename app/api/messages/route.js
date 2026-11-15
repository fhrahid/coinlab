import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '../../../lib/mongodb';
import { validAdminToken } from '../../../lib/admin';

// Contact messages — admin-only (personal data, never public).
export async function GET(request) {
  if (!(await validAdminToken(request.cookies.get('coinlab_admin')?.value))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!process.env.MONGODB_URI) return NextResponse.json([]);
  const db = await getDb();
  const messages = await db.collection('messages').find({}).sort({ createdAt: -1 }).limit(500).toArray();
  return NextResponse.json(messages);
}

export async function POST(request) {
  if (!(await validAdminToken(request.cookies.get('coinlab_admin')?.value))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, read } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing message id' }, { status: 400 });
  const db = await getDb();
  await db.collection('messages').updateOne({ _id: new ObjectId(id) }, { $set: { read: Boolean(read) } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  if (!(await validAdminToken(request.cookies.get('coinlab_admin')?.value))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing message id' }, { status: 400 });
  const db = await getDb();
  await db.collection('messages').deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ ok: true });
}
