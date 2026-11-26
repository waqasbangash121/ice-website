import { reserveLoginAttempt, clearLoginAttempts } from "@/lib/admin/login-throttle";
import { NextResponse } from "next/server";
import { authConfigured, createSession, deleteSession, sessionCookie, sessionSeconds, verifyCredentials } from "@/lib/admin/auth";
import { cookies } from "next/headers";
import { readAdminForm } from "@/lib/admin/request";

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
  const allowed = await reserveLoginAttempt();
  const credential = allowed && await authConfigured() ? await verifyCredentials(form.get("username"), form.get("password")) : null;
  if (!credential) {
    return NextResponse.redirect(new URL("/admin/login?error=1", url), 303);
  }
  await clearLoginAttempts();
  const response = NextResponse.redirect(new URL("/admin", url), 303);
  response.cookies.set(sessionCookie, await createSession(credential), { httpOnly: true, sameSite: "strict", secure: url.protocol === "https:", path: "/", maxAge: sessionSeconds });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
