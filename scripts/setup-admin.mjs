import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
nextEnv.loadEnvConfig(process.cwd());
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { randomBytes, scryptSync } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
if (!process.stdin.isTTY) throw new Error("Run this setup interactively in a terminal.");
let muted = false;
const output = new Writable({ write(chunk, encoding, callback) { if (!muted) process.stdout.write(chunk, encoding); callback(); } });
const prompt = createInterface({ input: process.stdin, output, terminal: true });
try {
  const username = (await prompt.question("Staff username: ")).trim();
  if (!/^[a-zA-Z0-9_.@-]{1,100}$/.test(username)) throw new Error("Use 1–100 letters, digits or _.@- in the username.");
  process.stdout.write("Password (at least 16 characters; hidden): ");
  muted = true;
  const password = await prompt.question("");
  process.stdout.write("\nConfirm password (hidden): ");
  const confirmation = await prompt.question("");
  muted = false;
  process.stdout.write("\n");
  if (password.length < 16 || password.length > 1024 || password !== confirmation) throw new Error("Passwords must match and contain 16–1024 characters.");
  const salt = randomBytes(16).toString("hex");
  const hash = salt + ":" + scryptSync(password, salt, 64).toString("hex");
  if (process.env.ICE_STORAGE === "supabase") {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await db.from("ice_documents").select("revision").eq("namespace", "staff").eq("id", "operator").single();
    if (error || !data) throw new Error("Cannot load database operator. Run migration first.");
    const result = await db.from("ice_documents").update({ payload: { username, passwordHash: hash }, revision: data.revision + 1 }).eq("namespace", "staff").eq("id", "operator").eq("revision", data.revision).select("id").maybeSingle();
    if (result.error || !result.data) throw new Error("Credential update failed or conflicted. Retry setup.");
    console.log("Staff credentials updated in Supabase. Existing sessions are invalidated.");
  } else {
  let existing = "";
  try { existing = await readFile(".env.local", "utf8"); } catch (error) { if (error.code !== "ENOENT") throw error; }
  existing = existing.split(/\r?\n/).filter((line) => !/^ADMIN_(USERNAME|PASSWORD_HASH)=/.test(line)).join("\n").trimEnd();
  await writeFile(".env.local", `${existing}\nADMIN_USERNAME=${username}\nADMIN_PASSWORD_HASH=${hash}\n`, { mode: 0o600 });
  console.log("Staff access configured in ignored .env.local. Restart the server to apply it. Existing sessions will be invalidated.");
  }
} finally { prompt.close(); }
