import "server-only";
import { createClient } from "@supabase/supabase-js";

export const databaseEnabled = () => process.env.ICE_STORAGE === "supabase";
const scopedId = (id: string) => (process.env.ICE_STORAGE_SCOPE || "") + id;
export class StorageConflict extends Error {}
export function privateDatabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase server credentials are required.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store", signal: AbortSignal.timeout(15000) }) } });
}
export async function readDocument<T>(namespace: string, id: string): Promise<{ payload: T; revision: number } | null> {
  const { data, error } = await privateDatabase().from("ice_documents").select("payload,revision").eq("namespace", namespace).eq("id", scopedId(id)).maybeSingle();
  if (error) throw new Error("Private database read failed.");
  return data as { payload: T; revision: number } | null;
}
export async function writeDocument(namespace: string, id: string, payload: unknown, revision: number, expiresAt?: string) {
  const db = privateDatabase();
  const row = { namespace, id: scopedId(id), payload, revision: revision + 1, expires_at: expiresAt || null };
  const result = revision === 0
    ? await db.from("ice_documents").insert(row).select("revision").single()
    : await db.from("ice_documents").update(row).eq("namespace", namespace).eq("id", scopedId(id)).eq("revision", revision).select("revision").maybeSingle();
  if (result.error?.code === "23505" || (!result.error && !result.data)) throw new StorageConflict("This record changed. Reload before editing.");
  if (result.error) throw new Error("Private database write failed.");
}
export async function deleteDocument(namespace: string, id: string, revision?: number) {
  let query = privateDatabase().from("ice_documents").delete().eq("namespace", namespace).eq("id", scopedId(id));
  if (revision !== undefined) query = query.eq("revision", revision);
  const { error } = await query;
  if (error) throw new Error("Private database delete failed.");
}
export async function cleanExpiredDocuments(namespace: string) {
  const { error } = await privateDatabase().from("ice_documents").delete().eq("namespace", namespace).like("id", (process.env.ICE_STORAGE_SCOPE || "") + "%").lte("expires_at", new Date().toISOString());
  if (error) throw new Error("Private database cleanup failed.");
}
