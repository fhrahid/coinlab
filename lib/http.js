import { NextResponse } from "next/server";

// request.json() throws on an empty or malformed body; that used to surface as
// an unhandled 500. Returns null instead so routes can answer with a 400.
export async function readJson(request) {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? body
      : null;
  } catch {
    return null;
  }
}

export const badRequest = (error = "Invalid request body.") =>
  NextResponse.json({ error }, { status: 400 });
export const unauthorized = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });
