import { NextResponse } from "next/server";
import { makeAdminToken, tokenSecret, verifyPassword } from "@/lib/admin";
import { limited, readJson, sameOrigin } from "@/lib/http";

export async function POST(request) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // Slows password guessing: ten attempts per address every 15 minutes.
  const blocked = limited(request, "login", {
    limit: 10,
    windowMs: 15 * 60_000,
  });
  if (blocked) return blocked;
  const body = await readJson(request);
  if (!(await verifyPassword(body?.password)))
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  const secret = await tokenSecret();
  if (!secret)
    return NextResponse.json(
      { error: "No CMS password is configured." },
      { status: 503 },
    );
  const response = NextResponse.json({ ok: true });
  response.cookies.set("coinlab_admin", makeAdminToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
  return response;
}
