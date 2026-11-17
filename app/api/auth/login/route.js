import { NextResponse } from "next/server";
import { makeAdminToken, tokenSecret, verifyPassword } from "@/lib/admin";
import { readJson } from "@/lib/http";

export async function POST(request) {
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
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
  return response;
}
