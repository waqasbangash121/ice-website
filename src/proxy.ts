import { NextResponse, type NextRequest } from "next/server";
import { knownLinks } from "@/lib/blocks/schema";
import { readCompositions } from "@/lib/blocks/store";

// Check publication before the streaming shell sends HTTP 200. Only new public
// paths need this gate; existing routes, private endpoints and static assets bypass it.
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (knownLinks.includes(pathname) || /^\/(admin|api|_next)(\/|$)/.test(pathname) || pathname.includes(".")) return NextResponse.next();
  const store = await readCompositions();
  if (Object.values(store.pages).some((record) => record.publishedRevision > 0 && record.published.path === pathname)) return NextResponse.next();
  return new NextResponse('<!doctype html><html lang="en-AU"><head><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page Not Found | Instant Cleaning Experts</title></head><body style="font-family:Arial,sans-serif;color:#092f4d;background:#f5f9fc;margin:0"><main style="max-width:48rem;margin:10vh auto;padding:2rem"><p>Instant Cleaning Experts</p><h1>Page Not Found</h1><p>We couldn’t find that page. Explore our cleaning services or return to the homepage.</p><p><a href="/services">Explore Services</a> · <a href="/">Back to Home</a></p></main></body></html>', { status: 404, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } });
}
export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
