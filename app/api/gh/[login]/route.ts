import { NextResponse } from "next/server";
import { ghUser } from "@/lib/github";

/* Client-side scans come through here so the token stays on the server. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ login: string }> },
) {
  const { login } = await params;
  const user = await ghUser(login);
  if (!user) {
    /* 404 rather than an error: the caller falls back to simulated data, which
     * is a normal outcome, not a failure */
    return NextResponse.json({ error: "not found or rate limited" }, { status: 404 });
  }
  return NextResponse.json(user, {
    headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" },
  });
}
