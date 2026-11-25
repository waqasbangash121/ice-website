import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { readCompositions } from "./store";
// Request-local snapshot keeps metadata and body consistent. Publication must be
// visible on the very next request; the local adapter is not a production cache.
const publishedStore = cache(async (dataRoot: string) => {
  await connection();
  return readCompositions(dataRoot);
});
export async function getPublishedPage(id: string) {
  const store = await publishedStore(process.env.ADMIN_DATA_DIR || "");
  if (!Object.hasOwn(store.pages, id)) throw new Error("Unknown composed page.");
  const page = store.pages[id].published;
  return { page, blocks: page.placements.filter((p) => p.enabled).map((p) => store.blocks[p.ref].published) };
}
export async function getPublishedPageByPath(publicPath: string) {
  const store = await publishedStore(process.env.ADMIN_DATA_DIR || "");
  const record = Object.values(store.pages).find((record) => record.publishedRevision > 0 && record.published.path === publicPath);
  if (!record) return null;
  const page = record.published;
  return { page, blocks: page.placements.filter((p) => p.enabled).map((p) => store.blocks[p.ref].published) };
}
