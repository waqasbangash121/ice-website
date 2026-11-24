import { quoteSourcePaths } from "@/lib/quote/schema";
import { services } from "@/data/services";
import { sydneyLabel } from "@/data/locations";
import { NextRequest, NextResponse } from "next/server";
import { cleanExpiredDrafts, DraftConflict, newToken, readDraft, removeDraft, saveDraft } from "@/lib/quote/store";
import { validateDetails } from "@/lib/quote/validation";

// Cache Components uses the Node.js runtime; runtime segment config is unsupported.
const cookieName = "ice_quote_session";
const sourcePaths = new Set<string>(quoteSourcePaths);
function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: {
    "Cache-Control": "private, no-store", "Vary": "Cookie", "X-Content-Type-Options": "nosniff",
  } });
}
function sameOrigin(request: NextRequest) {
  return request.headers.get("origin") === new URL(request.url).origin &&
    request.headers.get("sec-fetch-site") !== "cross-site";
}
export async function GET(request: NextRequest) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return json({ error: "Use this form from our website." }, 403);
  try {
    await cleanExpiredDrafts();
    return json({ draft: await readDraft(request.cookies.get(cookieName)?.value), deliveryEnabled: false });
  } catch { return json({ error: "We couldn’t load your saved draft. Please try again." }, 503); }
}
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return json({ error: "Use this form from our website." }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return json({ error: "Expected JSON." }, 415);
  let raw = "";
  try {
    const reader = request.body?.getReader();
    if (!reader) return json({ error: "Enter your cleaning details." }, 400);
    const decoder = new TextDecoder();
    let bytes = 0;
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 12000) { await reader.cancel(); return json({ error: "The request is too large." }, 413); }
      raw += decoder.decode(chunk.value, { stream: true });
    }
    raw += decoder.decode();
  } catch { return json({ error: "We couldn’t read your draft." }, 400); }
  let input: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    input = parsed as Record<string, unknown>;
  } catch { return json({ error: "Enter valid cleaning details." }, 400); }
  const { details, errors } = validateDetails(input.details, input.complete === true);
  if (Object.keys(errors).length) return json({ errors }, 422);
  if (!Number.isSafeInteger(input.version) || (input.version as number) < 0) return json({ error: "Reload your saved draft and try again." }, 400);
  const sourcePath = typeof input.sourcePath === "string" && sourcePaths.has(input.sourcePath) ? input.sourcePath : "/get-a-free-quote";
  const entryKey = typeof input.entryKey === "string" ? input.entryKey : "";
  if (entryKey) {
    const parts = entryKey.split("|");
    if (parts.length !== 3 || !sourcePaths.has(parts[0]) ||
        (parts[1] && !services.some((service) => service.id === parts[1])) ||
        (parts[2] && parts[2] !== sydneyLabel)) return json({ error: "Invalid entry context." }, 400);
  }
  try {
    await cleanExpiredDrafts();
    const existingToken = request.cookies.get(cookieName)?.value;
    const previous = await readDraft(existingToken);
    const token = previous ? existingToken! : newToken();
    // Expired sessions do not silently overwrite another draft or accept stale versions.
    if (!previous && input.version !== 0) return json({ error: "Your saved draft expired. Start a new draft to continue." }, 409);
    const draft = await saveDraft(token, details, input.version as number, sourcePath, entryKey);
    const response = json({ draft, deliveryEnabled: false });
    response.cookies.set(cookieName, token, {
      httpOnly: true, sameSite: "strict", secure: request.nextUrl.protocol === "https:",
      path: "/", maxAge: Math.max(0, Math.floor((Date.parse(draft.expiresAt) - Date.now()) / 1000)),
    });
    return response;
  } catch (error) {
    if (error instanceof DraftConflict) return json({ error: error.message }, 409);
    return json({ error: "Your draft could not be saved. Please try again." }, 503);
  }
}
export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return json({ error: "Use this form from our website." }, 403);
  try {
    await removeDraft(request.cookies.get(cookieName)?.value);
    const response = json({ draft: null, deliveryEnabled: false });
    response.cookies.set(cookieName, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
    return response;
  } catch { return json({ error: "We couldn’t clear your draft. Please try again." }, 503); }
}
