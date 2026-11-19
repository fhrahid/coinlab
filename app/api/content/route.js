import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/content";
import { getDb } from "@/lib/mongodb";
import { destroyAsset } from "@/lib/cloudinary";
import { isAdminRequest } from "@/lib/admin";
import { badRequest, readJson, unauthorized } from "@/lib/http";
import { slugify } from "@/lib/citation";
import { roleTier, seedRoles } from "@/lib/roles";
import { jobTypes, paperTypes } from "@/lib/collections";

export const dynamic = "force-dynamic";

// Fields each collection may store. Anything else in the request body is
// dropped, so a CMS form can no longer write stray keys (e.g. empty
// `authors`/`focusPoints` arrays on people) or Mongo operators into a record.
const schema = {
  wings: {
    fields: [
      "number",
      "title",
      "shortTitle",
      "description",
      "longDescription",
      "focusPoints",
      "coverKey",
    ],
    media: ["coverKey"],
  },
  people: {
    fields: ["name", "role", "bio", "wingSlugs", "photoKey"],
    media: ["photoKey"],
  },
  papers: {
    fields: [
      "title",
      "authors",
      "year",
      "venue",
      "abstract",
      "doi",
      "wingSlugs",
      "pdfKey",
      "type",
      "featured",
      "codeUrl",
    ],
    media: ["pdfKey"],
  },
  partners: {
    fields: ["number", "abbr", "name", "logoUrl"],
    media: ["logoUrl"],
  },
  slides: {
    fields: ["caption", "number", "image", "active", "transform"],
    media: ["image"],
  },
  jobs: {
    fields: [
      "title",
      "type",
      "location",
      "deadline",
      "salary",
      "summary",
      "description",
      "requirements",
      "applyInfo",
      "wingSlugs",
      "active",
      "postedAt",
    ],
    media: [],
  },
  roles: { fields: ["name", "serial", "tier"], media: [] },
};

// A whole number, or null when the field is left blank.
const wholeNumber = (value) =>
  value === "" || value == null || Number.isNaN(Number(value))
    ? null
    : Math.round(Number(value));

const list = (value, separator) =>
  (Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(separator)
      : []
  )
    .map((v) => String(v).trim())
    .filter(Boolean);
const validSlug = (slug) =>
  typeof slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

export async function GET(request) {
  const collection =
    new URL(request.url).searchParams.get("collection") || "wings";
  if (!schema[collection]) return badRequest("Invalid collection");
  try {
    return NextResponse.json(await getCollection(collection));
  } catch {
    return NextResponse.json(
      { error: "Could not reach the database." },
      { status: 503 },
    );
  }
}

export async function POST(request) {
  if (!(await isAdminRequest(request))) return unauthorized();
  if (!process.env.MONGODB_URI)
    return NextResponse.json(
      { error: "Connect MongoDB before publishing CMS content." },
      { status: 503 },
    );
  const body = await readJson(request);
  if (!body) return badRequest();
  const { collection, originalSlug } = body;
  if (!schema[collection]) return badRequest("Invalid collection");

  const record = {};
  for (const key of schema[collection].fields)
    if (body[key] !== undefined) record[key] = body[key];
  if ("focusPoints" in record)
    record.focusPoints = list(record.focusPoints, "\n");
  if ("requirements" in record)
    record.requirements = list(record.requirements, "\n");
  if ("serial" in record) record.serial = wholeNumber(record.serial);
  if ("authors" in record) record.authors = list(record.authors, ",");
  if ("wingSlugs" in record) record.wingSlugs = list(record.wingSlugs, ",");
  if ("year" in record)
    record.year = Number(record.year) || new Date().getFullYear();
  if ("active" in record) record.active = record.active !== false;
  if ("featured" in record) record.featured = record.featured === true;
  if (collection === "papers" && !paperTypes.includes(record.type))
    record.type = paperTypes[0];
  if (collection === "jobs" && !jobTypes.includes(record.type))
    record.type = jobTypes[0];
  if (
    "deadline" in record &&
    !/^\d{4}-\d{2}-\d{2}$/.test(record.deadline || "")
  )
    record.deadline = "";
  if (collection === "jobs")
    record.postedAt =
      record.postedAt && !Number.isNaN(new Date(record.postedAt).getTime())
        ? new Date(record.postedAt)
        : new Date();
  // Rendered as a link on the public site: only http(s) URLs are stored.
  if ("codeUrl" in record && !/^https?:\/\//i.test(String(record.codeUrl)))
    record.codeUrl = "";
  if (collection === "roles" && !String(record.name || "").trim())
    return badRequest("Give the role a name before saving.");
  for (const [key, value] of Object.entries(record))
    if (typeof value === "string") record[key] = value.trim();

  const slug =
    String(body.slug || "").trim() ||
    (collection === "slides"
      ? `slide-${Date.now()}`
      : slugify(record.name || record.title));
  if (!slug) return badRequest("Add a name or title before saving.");
  if (!validSlug(slug))
    return badRequest(
      "Slugs may only contain lowercase letters, numbers and single hyphens.",
    );

  const db = await getDb();
  const items = db.collection(collection);
  const lookupSlug = validSlug(originalSlug) ? originalSlug : slug;

  // The profile badge shows the tier of the person's role ("Leadership"…).
  if (collection === "people") {
    const role = (await getCollection("roles")).find(
      (item) => item.name === record.role,
    );
    record.type = role ? roleTier(role) : "";
  }
  // Roles start as a built-in list; the first save copies that list into the
  // database so editing one role never hides the others.
  if (collection === "roles" && !(await items.estimatedDocumentCount()))
    await items.insertMany(
      seedRoles.map((role) => ({ ...role, updatedAt: new Date() })),
    );
  // Renaming a slug used to upsert a second copy and leave the old record live.
  if (lookupSlug !== slug && (await items.findOne({ slug })))
    return NextResponse.json(
      { error: `Another record already uses the slug “${slug}”.` },
      { status: 409 },
    );
  const previous = await items.findOne({ slug: lookupSlug });
  await items.updateOne(
    { slug: lookupSlug },
    { $set: { ...record, slug, updatedAt: new Date() } },
    { upsert: true },
  );

  // People store their role by name and its tier as `type`: keep both in
  // step when a role is renamed or moved to another tier.
  if (collection === "roles") {
    const people = db.collection("people");
    const tier = roleTier(record);
    if (previous && previous.name !== record.name)
      await people.updateMany(
        { role: previous.name },
        { $set: { role: record.name, type: tier } },
      );
    else
      await people.updateMany({ role: record.name }, { $set: { type: tier } });
  }
  // Public pages are cached; refresh them now instead of after the timer.
  revalidatePath("/", "layout");

  // A replaced or removed upload is no longer referenced anywhere: delete it
  // from Cloudinary so storage does not fill with orphans.
  const mediaRemoved = [];
  if (previous)
    for (const field of schema[collection].media)
      if (
        previous[field] &&
        field in record &&
        previous[field] !== record[field] &&
        (await destroyAsset(previous[field]))
      )
        mediaRemoved.push(field);
  return NextResponse.json({ ok: true, slug, mediaRemoved });
}

export async function DELETE(request) {
  if (!(await isAdminRequest(request))) return unauthorized();
  if (!process.env.MONGODB_URI)
    return NextResponse.json(
      { error: "Connect MongoDB before deleting CMS content." },
      { status: 503 },
    );
  const body = await readJson(request);
  const { collection, slug } = body || {};
  if (!schema[collection] || !validSlug(slug))
    return badRequest("Invalid request");
  const db = await getDb();
  const doc = await db.collection(collection).findOne({ slug });
  if (!doc)
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  if (collection === "roles") {
    const holders = await db
      .collection("people")
      .countDocuments({ role: doc.name });
    if (holders)
      return NextResponse.json(
        {
          error: `${holders} ${holders === 1 ? "person has" : "people have"} this role. Give them another role first.`,
        },
        { status: 409 },
      );
  }
  await db.collection(collection).deleteOne({ slug });
  revalidatePath("/", "layout");
  const mediaRemoved = [];
  for (const field of schema[collection].media)
    if (doc[field] && (await destroyAsset(doc[field])))
      mediaRemoved.push(field);
  return NextResponse.json({ ok: true, mediaRemoved });
}
