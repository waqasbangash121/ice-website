import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getStaff } from "@/lib/admin/auth";
import { readAdminForm } from "@/lib/admin/request";
import { mutateComposition, readCompositions } from "@/lib/blocks/store";
import { CompositionInputError } from "@/lib/blocks/schema";
export async function POST(request: Request, context: { params: Promise<{ kind: string; id: string }> }) {
  const url = new URL(request.url);
  if (request.headers.get("origin") !== url.origin) return new Response("Forbidden", { status: 403 });
  const staff = await getStaff();
  if (!staff) return new Response("Unauthorized", { status: 401 });
  const { kind, id } = await context.params;
  if (kind !== "blocks" && kind !== "pages" && kind !== "templates") return new Response("Not found", { status: 404 });
  const store = await readCompositions();
  if (id !== "new" && !Object.hasOwn(store[kind], id)) return new Response("Not found", { status: 404 });
  const destination = new URL(`/admin/${kind}/${id}`, url);
  const jsonResponse = request.headers.get("accept") === "application/json";
  try {
    const form = await readAdminForm(request, 192000);
    if (kind === "blocks" && id === "new" && typeof form.get("copyFrom") === "string" && Object.hasOwn(store.blocks, String(form.get("copyFrom")))) destination.pathname = `/admin/blocks/${form.get("copyFrom")}`;
    const record = await mutateComposition(kind, id, form, staff.username);
    destination.pathname = `/admin/${kind}/${record.draft.id}`;
    if (record.status === "published") {
      revalidateTag("page-compositions", { expire: 0 });
      for (const page of Object.values(store.pages)) revalidatePath(page.published.path);
    }
    destination.searchParams.set("saved", "1");
  } catch (error) {
    const message = error instanceof CompositionInputError ? error.message : "Unable to save. Check the form and try again.";
    if (jsonResponse) return NextResponse.json({ error: message }, { status: 400, headers: { "Cache-Control": "no-store" } });
    destination.searchParams.set("error", message);
  }
  if (jsonResponse) return NextResponse.json({ destination: destination.pathname + destination.search }, { headers: { "Cache-Control": "no-store" } });
  return NextResponse.redirect(destination, 303);
}
