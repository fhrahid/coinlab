import { NextResponse } from 'next/server';
import { cloudinaryConfigured, createUploadSignature } from '../../../lib/cloudinary';
import { validAdminToken } from '../../../lib/admin';

export async function POST(request) {
  if (!(await validAdminToken(request.cookies.get('coinlab_admin')?.value))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!cloudinaryConfigured()) return NextResponse.json({ error: 'Connect Cloudinary before uploading.' }, { status: 503 });
  const { filename, contentType } = await request.json();
  const safeName = (filename || '').replace(/[^a-zA-Z0-9._-]/g, '-').replace(/\.[^.]+$/, '');
  const { apiKey, cloudName, publicId, signature, timestamp } = createUploadSignature({ publicId: `coinlab/${Date.now()}-${safeName}` });
  return NextResponse.json({ apiKey, cloudName, publicId, resourceType: (contentType || '').startsWith('image/') ? 'image' : 'raw', signature, timestamp });
}
