import { isDeepStrictEqual } from "node:util";
import nextEnv from "@next/env";
import postgres from "postgres";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { services } from "../src/data/services";
import { seedCompositions } from "../src/lib/blocks/seeds";
nextEnv.loadEnvConfig(process.cwd());
const uri = process.env.SUPABASE_DB_URL;
if (!uri || !/^postgres(ql)?:\/\//.test(uri)) throw new Error("Set SUPABASE_DB_URL to the Postgres URI in .env.local.");
const adminRoot = process.env.ADMIN_DATA_DIR || path.join(process.cwd(), ".data/admin");
async function local(file: string, fallback: unknown) {
  try { return JSON.parse(await readFile(file, "utf8")); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback; throw error; }
}
const records: { namespace: string; id: string; payload: unknown; expires_at: string | null }[] = [];
const add = (namespace: string, id: string, payload: unknown, expires_at: string | null = null) => records.push({ namespace, id, payload, expires_at });
for (const service of services) add("services", service.id, await local(path.join(adminRoot, "content", service.id + ".json"), { draft: service, status: "draft", version: 0, owner: "", source: "docs/SOURCE-INVENTORY.md", history: [] }));
const workspace = await local(path.join(adminRoot, "composition/workspace.json"), seedCompositions());
if (workspace.schemaVersion === 1) { workspace.schemaVersion = 2; workspace.templates = {}; }
if (workspace.schemaVersion !== 2) throw new Error("Unsupported local workspace schema.");
add("workspace", "main", workspace);
const username = process.env.ADMIN_USERNAME;
const passwordHash = process.env.ADMIN_PASSWORD_HASH;
if (!username || !/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(passwordHash || "")) throw new Error("Existing staff credential hash is required for initial migration.");
add("staff", "operator", { username, passwordHash });
for (const [namespace, dir] of [["sessions", path.join(adminRoot, "sessions")], ["quotes", process.env.QUOTE_DRAFT_DIR || path.join(process.cwd(), ".data/quote-drafts")]]) {
  const files = await readdir(dir).catch((error: NodeJS.ErrnoException) => { if (error.code === "ENOENT") return []; throw error; });
  for (const file of files.filter((name) => /^[a-f0-9]{64}\.json$/.test(name))) {
    const payload = await local(path.join(dir, file), null);
    const expires = namespace === "quotes" ? payload.expiresAt : new Date(payload.expires).toISOString();
    if (Date.parse(expires) > Date.now()) add(namespace, file.slice(0, -5), payload, expires);
  }
}
// Backup is private and ignored. It contains hashes, never plaintext passwords.
const backup = path.join(process.cwd(), ".data", "backups", "supabase-" + Date.now() + ".json");
await mkdir(path.dirname(backup), { recursive: true, mode: 0o700 });
await writeFile(backup, JSON.stringify(records), { mode: 0o600, flag: "wx" });
const sql = postgres(uri, { ssl: "require", max: 1, connect_timeout: 15, prepare: false });
try {
  await sql.begin(async (tx) => {
    await tx.unsafe(await readFile("supabase/migrations/20261126_private_storage.sql", "utf8"));
    for (const record of records) {
      const existing = await tx`select payload from public.ice_documents where namespace=${record.namespace} and id=${record.id}`;
      if (existing.length) {
        // Never replace database edits with an older local backup on a rerun.
        if (!isDeepStrictEqual(existing[0].payload, JSON.parse(JSON.stringify(record.payload)))) throw new Error("Database differs from local records; refusing to overwrite.");
      } else await tx`insert into public.ice_documents (namespace,id,payload,expires_at) values (${record.namespace},${record.id},${tx.json(record.payload as postgres.JSONValue)},${record.expires_at})`;
    }
  });
  console.log(`Migrated/verified ${records.length} private records in one transaction. Local backup retained.`);
} catch (error) {
  // Do not log driver errors: they can contain connection strings or record values.
  console.error("Migration failed; no cutover performed. Check database access or existing-record conflicts.");
  console.error("Error code:", (error as { code?: string }).code || "unavailable");
  process.exitCode = 1;
} finally { await sql.end(); }
