import { NextResponse } from "next/server";
import { authConfigured, createSession, deleteSession, sessionCookie, sessionSeconds, verifyCredentials } from "@/lib/admin/auth";
import { cookies } from "next/headers";
import { readAdminForm } from "@/lib/admin/request";

// A single-operator local review gate. Shared production rate limiting is required before deployment.
let failures = 0;
let resetAt = 0;
export async function POST(request: Request) {
  const url = new URL(request.url);
  if (request.headers.get("origin") !== url.origin) return new Response("Forbidden", { status: 403 });
  if (Number(request.headers.get("content-length")) > 12000) return new Response("Request too large", { status: 413 });
  let form: FormData;
  try { form = await readAdminForm(request); }
  catch { return new Response("Invalid form", { status: 400 }); }
  if (form.get("action") === "logout") {
    await deleteSession((await cookies()).get(sessionCookie)?.value);
    const response = NextResponse.redirect(new URL("/admin/login", url), 303);
    response.cookies.set(sessionCookie, "", { httpOnly: true, sameSite: "strict", secure: url.protocol === "https:", path: "/", maxAge: 0 });
    return response;
  }
  if (Date.now() > resetAt) { failures = 0; resetAt = Date.now() + 15 * 60 * 1000; }
  if (!authConfigured() || failures >= 5 || !verifyCredentials(form.get("username"), form.get("password"))) {
    failures++;
    return NextResponse.redirect(new URL("/admin/login?error=1", url), 303);
  }
  failures = 0;
  const response = NextResponse.redirect(new URL("/admin", url), 303);
  response.cookies.set(sessionCookie, await createSession(), { httpOnly: true, sameSite: "strict", secure: url.protocol === "https:", path: "/", maxAge: sessionSeconds });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
