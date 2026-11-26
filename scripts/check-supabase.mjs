import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.");
  process.exitCode = 1;
} else {
  try {
    const response = await fetch(new URL("/rest/v1/__ice_connection_probe__?select=*&limit=0", url), {
      headers: { apikey: key },
      signal: AbortSignal.timeout(10000),
    });
    const body = await response.json().catch(() => null);
    // Missing-table response proves that authentication reached PostgREST.
    // The schema discovery endpoint at /rest/v1/ requires a secret key.
    if (response.ok || (response.status === 404 && body?.code === "PGRST205")) {
      console.log("Supabase publishable-key connection verified.");
    } else {
      console.error(`Supabase probe failed: HTTP ${response.status}. Check API configuration and credentials.`);
      process.exitCode = 1;
    }
  } catch {
    console.error("Supabase connection failed. Check the URL and network access.");
    process.exitCode = 1;
  }
}
