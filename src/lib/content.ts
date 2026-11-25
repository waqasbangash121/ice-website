import { cache } from "react";
import { connection } from "next/server";
import { publicServices } from "@/lib/admin/content-store";
// Published catalogue snapshots are read once per request, alongside dynamic CMS pages.
const getServicesForStore = cache(async (dataRoot: string) => {
  await connection();
  return publicServices(dataRoot);
});
export async function getServices() { return getServicesForStore(process.env.ADMIN_DATA_DIR || ""); }
export async function getServiceById(id: string) { return (await getServices()).find((service) => service.id === id); }
