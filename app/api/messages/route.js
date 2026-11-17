import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { isAdminRequest } from "@/lib/admin";
import { badRequest, readJson, unauthorized } from "@/lib/http";

export const dynamic = "force-dynamic";

// `new ObjectId(id)` throws on anything that is not a 24-hex id, which used to
// surface as a 500; validate first.
async function messageId(request) {
  const body = await readJson(request);
  const id = body?.id;
  return typeof id === "string" &&
    ObjectId.isValid(id) &&
    /^[a-f0-9]{24}$/i.test(id)
    ? { id: new ObjectId(id), body }
    : null;
}

// Contact messages — admin-only (personal data, never public).
export async function GET(request) {
  if (!(await isAdminRequest(request))) return unauthorized();
  if (!process.env.MONGODB_URI) return NextResponse.json([]);
  const db = await getDb();
  const messages = await db
    .collection("messages")
    .find({})
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray();
  return NextResponse.json(
    messages.map(({ _id, ...message }) => ({ ...message, _id: String(_id) })),
  );
}

export async function POST(request) {
  if (!(await isAdminRequest(request))) return unauthorized();
  if (!process.env.MONGODB_URI)
    return NextResponse.json(
      { error: "MongoDB is not connected." },
      { status: 503 },
    );
  const parsed = await messageId(request);
  if (!parsed) return badRequest("Missing or invalid message id");
  const db = await getDb();
  await db
    .collection("messages")
    .updateOne(
      { _id: parsed.id },
      { $set: { read: Boolean(parsed.body.read) } },
    );
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  if (!(await isAdminRequest(request))) return unauthorized();
  if (!process.env.MONGODB_URI)
    return NextResponse.json(
      { error: "MongoDB is not connected." },
      { status: 503 },
    );
  const parsed = await messageId(request);
  if (!parsed) return badRequest("Missing or invalid message id");
  const db = await getDb();
  await db.collection("messages").deleteOne({ _id: parsed.id });
  return NextResponse.json({ ok: true });
}
