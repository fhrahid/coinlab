import { NextResponse } from 'next/server';
import { makeAdminToken, tokenSecret, verifyPassword } from '../../../../lib/admin';

export async function POST(request) {
  const { password } = await request.json();
  if (!(await verifyPassword(password))) return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set('coinlab_admin', makeAdminToken(await tokenSecret()), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60 * 60 * 12, path: '/' });
  return response;
}
