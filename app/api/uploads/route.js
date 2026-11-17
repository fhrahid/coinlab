import { NextResponse } from "next/server";
import { cloudinaryConfigured, createUploadSignature } from "@/lib/cloudinary";
import { isAdminRequest } from "@/lib/admin";
import { badRequest, readJson, unauthorized } from "@/lib/http";

export async function POST(request) {
  if (!(await isAdminRequest(request))) return unauthorized();
  if (!cloudinaryConfigured())
    return NextResponse.json(
      { error: "Connect Cloudinary before uploading." },
      { status: 503 },
    );
  const body = await readJson(request);
  if (!body) return badRequest();
  const { filename, contentType } = body;
  const resourceType = String(contentType || "").startsWith("image/")
    ? "image"
    : "raw";
  const cleaned = String(filename || "file")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .slice(-80);
  const extension =
    (cleaned.match(/\.([a-zA-Z0-9]{1,8})$/) || [])[1]?.toLowerCase() || "";
  const base = cleaned.replace(/\.[^.]+$/, "") || "file";
  // Raw files (PDFs) keep their extension in the public id: Cloudinary does not
  // add one to raw delivery URLs, so without it downloads had no .pdf suffix.
  const name =
    resourceType === "raw" && extension ? `${base}.${extension}` : base;
  const { apiKey, cloudName, publicId, signature, timestamp } =
    createUploadSignature({ publicId: `coinlab/${Date.now()}-${name}` });
  return NextResponse.json({
    apiKey,
    cloudName,
    publicId,
    resourceType,
    signature,
    timestamp,
  });
}
