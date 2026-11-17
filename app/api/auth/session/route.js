import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin";

export const dynamic = "force-dynamic";

// Lets the CMS restore a still-valid session after a page reload instead of
// asking for the password again.
export async function GET(request) {
  return NextResponse.json(
    { loggedIn: await isAdminRequest(request) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
