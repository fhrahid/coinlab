import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/mongodb';

// Public contact endpoint. The hidden "website" field is a honeypot — bots
// fill it, humans never see it; their submissions are silently dropped.
export async function POST(request) {
  if (!process.env.MONGODB_URI) return NextResponse.json({ error: 'Messaging is not available yet. Please email coinlab@seu.edu.bd instead.' }, { status: 503 });
  const body = await request.json();
  const { name, email, subject, message, website } = body || {};
  if (website) return NextResponse.json({ ok: true });
  if (!name || !email || !message) return NextResponse.json({ error: 'Please fill in your name, email and message.' }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) return NextResponse.json({ error: 'That email address does not look right.' }, { status: 400 });
  const record = {
    name: String(name).slice(0, 80).trim(),
    email: String(email).slice(0, 120).trim(),
    subject: String(subject || 'General inquiry').slice(0, 120).trim(),
    message: String(message).slice(0, 5000).trim(),
    read: false,
    createdAt: new Date(),
  };
  const db = await getDb();
  await db.collection('messages').insertOne(record);
  return NextResponse.json({ ok: true });
}
