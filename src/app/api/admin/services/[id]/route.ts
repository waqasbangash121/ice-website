import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getStaff } from "@/lib/admin/auth";
import { ContentInputError, mutateService } from "@/lib/admin/content-store";
import { services } from "@/data/services";
import { readAdminForm } from "@/lib/admin/request";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const url = new URL(request.url);
  if (request.headers.get("origin") !== url.origin) return new Response("Forbidden", { status: 403 });
  const staff = await getStaff();
  if (!staff) return new Response("Unauthorized", { status: 401 });
  if (Number(request.headers.get("content-length")) > 12000) return new Response("Request too large", { status: 413 });
  const { id } = await context.params;
  if (!services.some((service) => service.id === id)) return new Response("Not found", { status: 404 });
  const destination = new URL(`/admin/services/${id}`, url);
  try {
    const record = await mutateService(id, await readAdminForm(request), staff.username);
    if (record.status === "published") {
      revalidateTag("service-content", { expire: 0 });
      for (const path of ["/", "/services", "/locations/nsw/suburbs/sydney"]) revalidatePath(path);
    }
    destination.searchParams.set("saved", "1");
  } catch (error) {
    destination.searchParams.set("error", error instanceof ContentInputError ? error.message : "Unable to save. Check the form and try again; contact the operator if it persists.");
  }
  return NextResponse.redirect(destination, 303);
}
