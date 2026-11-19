import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { isAdminRequest } from "@/lib/admin";
import { badRequest, limited, readJson, unauthorized } from "@/lib/http";
import { getRecord } from "@/lib/content";
import { isJobOpen } from "@/lib/jobs";

export const dynamic = "force-dynamic";

// `new ObjectId(id)` throws on anything that is not a 24-hex id, which used to
// surface as a 500; validate first.
async function applicationId(request) {
  const body = await readJson(request);
  const id = body?.id;
  return typeof id === "string" &&
    ObjectId.isValid(id) &&
    /^[a-f0-9]{24}$/i.test(id)
    ? { id: new ObjectId(id), body }
    : null;
}

// Job applications — submitted from the public posting page, read in the CMS.
// The hidden "website" field is a honeypot: bots fill it, humans never see it.
export async function POST(request) {
  if (!process.env.MONGODB_URI)
    return NextResponse.json(
      { error: "Applications are not available yet." },
      { status: 503 },
    );
  const blocked = limited(request, "apply", {
    limit: 5,
    windowMs: 10 * 60_000,
  });
  if (blocked) return blocked;
  const body = await readJson(request);
  const { jobSlug, name, email, phone, link, message, website } = body || {};
  if (website) return NextResponse.json({ ok: true });
  if (!jobSlug || !name || !email || !message)
    return badRequest("Please fill in your name, email and message.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email)))
    return badRequest("That email address does not look right.");

  const job = await getRecord("jobs", String(jobSlug).slice(0, 120));
  if (!job) return badRequest("This posting does not exist.");
  if (!isJobOpen(job))
    return badRequest("This position is no longer accepting applications.");

  const record = {
    jobSlug: job.slug,
    jobTitle: job.title || job.slug,
    name: String(name).slice(0, 80).trim(),
    email: String(email).slice(0, 120).trim(),
    phone: String(phone || "")
      .slice(0, 40)
      .trim(),
    link: String(link || "")
      .slice(0, 300)
      .trim(),
    message: String(message).slice(0, 5000).trim(),
    read: false,
    createdAt: new Date(),
  };
  const db = await getDb();
  await db.collection("applications").insertOne(record);
  return NextResponse.json({ ok: true });
}

// Everything below is admin-only (personal data, never public).
export async function GET(request) {
  if (!(await isAdminRequest(request))) return unauthorized();
  if (!process.env.MONGODB_URI) return NextResponse.json([]);
  const db = await getDb();
  const applications = await db
    .collection("applications")
    .find({})
    .sort({ createdAt: -1 })
    .limit(500)
    .toArray();
  return NextResponse.json(
    applications.map(({ _id, ...application }) => ({
      ...application,
      _id: String(_id),
    })),
  );
}

export async function PUT(request) {
  if (!(await isAdminRequest(request))) return unauthorized();
  const parsed = await applicationId(request);
  if (!parsed) return badRequest("Missing or invalid application id");
  const db = await getDb();
  await db
    .collection("applications")
    .updateOne(
      { _id: parsed.id },
      { $set: { read: parsed.body.read !== false } },
    );
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  if (!(await isAdminRequest(request))) return unauthorized();
  const parsed = await applicationId(request);
  if (!parsed) return badRequest("Missing or invalid application id");
  const db = await getDb();
  await db.collection("applications").deleteOne({ _id: parsed.id });
  return NextResponse.json({ ok: true });
}
