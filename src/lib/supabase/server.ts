import "server-only";
import { createClient } from "@supabase/supabase-js";

// The Content Studio authenticates staff separately; this client has no user session.
export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase URL and publishable key are required.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function supabaseConnectionStatus(): Promise<string> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return "Not configured";
    const response = await fetch(new URL("/rest/v1/__ice_connection_probe__?select=*&limit=0", process.env.NEXT_PUBLIC_SUPABASE_URL), {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const body = await response.json().catch(() => null);
    // A missing-table response confirms authentication without reading records.
    return response.ok || (response.status === 404 && body?.code === "PGRST205") ? "Connected" : "Connection rejected";
  } catch {
    return "Unavailable";
  }
}
