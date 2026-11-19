import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { badRequest, limited, readJson } from "@/lib/http";

// Public contact endpoint. The hidden "website" field is a honeypot — bots
// fill it, humans never see it; their submissions are silently dropped.
export async function POST(request) {
  if (!process.env.MONGODB_URI)
    return NextResponse.json(
      {
        error:
          "Messaging is not available yet. Please email info@coinlabai.com instead.",
      },
      { status: 503 },
    );
  const blocked = limited(request, "contact", {
    limit: 5,
    windowMs: 10 * 60_000,
  });
  if (blocked) return blocked;
  const body = await readJson(request);
  if (!body) return badRequest();
  const { name, email, subject, message, website } = body;
  if (website) return NextResponse.json({ ok: true });
  const clean = (value, max) =>
    String(value ?? "")
      .trim()
      .slice(0, max);
  const record = {
    name: clean(name, 80),
    email: clean(email, 120),
    subject: clean(subject, 120) || "General inquiry",
    message: clean(message, 5000),
    read: false,
    createdAt: new Date(),
  };
  if (!record.name || !record.email || !record.message)
    return badRequest("Please fill in your name, email and message.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email))
    return badRequest("That email address does not look right.");
  try {
    const db = await getDb();
    await db.collection("messages").insertOne(record);
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not send right now. Please email info@coinlabai.com instead.",
      },
      { status: 503 },
    );
  }
  return NextResponse.json({ ok: true });
}
