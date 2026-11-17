import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  isAdminRequest,
  passwordSource,
  setPassword,
  verifyPassword,
} from "@/lib/admin";
import { badRequest, readJson, unauthorized } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!(await isAdminRequest(request))) return unauthorized();
  const counts = {};
  let mongo = false;
  if (process.env.MONGODB_URI) {
    try {
      const db = await getDb();
      for (const name of ["wings", "people", "papers", "partners", "slides"])
        counts[name] = await db.collection(name).countDocuments();
      mongo = true;
    } catch {
      mongo = false;
    }
  }
  let cloudinaryUsage = null;
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    try {
      const auth = Buffer.from(
        `${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`,
      ).toString("base64");
      const usage = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/usage`,
        { headers: { Authorization: `Basic ${auth}` } },
      );
      if (usage.ok) cloudinaryUsage = await usage.json();
    } catch {
      cloudinaryUsage = null;
    }
  }
  const usage = cloudinaryUsage
    ? {
        objects: cloudinaryUsage.objects?.usage ?? 0,
        storage: cloudinaryUsage.storage?.used,
        bandwidth: cloudinaryUsage.bandwidth?.used,
        plan: cloudinaryUsage.plan,
      }
    : null;
  return NextResponse.json({
    mongo: { connected: mongo, database: process.env.MONGODB_DB || "coinlab" },
    cloudinary: { cloudName: process.env.CLOUDINARY_CLOUD_NAME || null, usage },
    counts,
    passwordSource: await passwordSource(),
  });
}

export async function POST(request) {
  if (!(await isAdminRequest(request))) return unauthorized();
  if (!process.env.MONGODB_URI)
    return NextResponse.json(
      { error: "Connect MongoDB before changing the CMS password." },
      { status: 503 },
    );
  const body = await readJson(request);
  if (!body) return badRequest();
  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword)
    return NextResponse.json(
      { error: "Fill in both password fields." },
      { status: 400 },
    );
  if (String(newPassword).length < 8)
    return NextResponse.json(
      { error: "New password must be at least 8 characters." },
      { status: 400 },
    );
  if (!(await verifyPassword(currentPassword)))
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 401 },
    );
  await setPassword(String(newPassword));
  return NextResponse.json({ ok: true });
}
