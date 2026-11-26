import { databaseEnabled, readDocument, writeDocument, deleteDocument, cleanExpiredDocuments, StorageConflict } from "@/lib/supabase/storage";
import { sydney, sydneyLabel } from "../../data/locations";
import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { draftLifetimeMs, type QuoteDetails, type SavedQuote } from "./schema";

const directory = () => process.env.QUOTE_DRAFT_DIR || path.join(process.cwd(), ".data", "quote-drafts");
const validToken = (token: string) => /^[a-f0-9]{64}$/.test(token);
const key = (token: string) => createHash("sha256").update(token).digest("hex");
const filePath = (token: string) => path.join(directory(), key(token) + ".json");

export class DraftConflict extends Error {}
export function newToken() { return randomBytes(32).toString("hex"); }

export async function readDraft(token?: string): Promise<SavedQuote | null> {
  if (!token || !validToken(token)) return null;
  try {
    const snapshot = databaseEnabled() ? await readDocument<SavedQuote>("quotes", key(token)) : null;
    const record = databaseEnabled() ? snapshot?.payload : JSON.parse(await readFile(filePath(token), "utf8")) as SavedQuote;
    if (!record) return null;
    if (Date.parse(record.expiresAt) <= Date.now()) {
      if (databaseEnabled()) await deleteDocument("quotes", key(token), snapshot!.revision);
      else await rm(filePath(token), { force: true });
      return null;
    }
    return record;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

// Supabase uses compare-and-swap writes; filesystem mode retains local review locks.
export async function saveDraft(token: string, details: QuoteDetails, version: number, sourcePath: string, entryKey: string) {
  if (!validToken(token)) throw new Error("Invalid draft token");
  if (databaseEnabled()) {
    const snapshot = await readDocument<SavedQuote>("quotes", key(token));
    const previous = snapshot && Date.parse(snapshot.payload.expiresAt) > Date.now() ? snapshot.payload : null;
    if ((previous?.version ?? 0) !== version) throw new DraftConflict("Your draft changed in another tab. Reload to use the latest saved version.");
    const record: SavedQuote = { details, version: version + 1, localityId: details.location.toLowerCase() === sydneyLabel.toLowerCase() ? sydney.id : undefined, expiresAt: previous?.expiresAt ?? new Date(Date.now() + draftLifetimeMs).toISOString(), sourcePath: previous?.sourcePath ?? sourcePath, entryKey: entryKey || previous?.entryKey || "" };
    try { await writeDocument("quotes", key(token), record, snapshot?.revision ?? 0, record.expiresAt); }
    catch (error) { if (error instanceof StorageConflict) throw new DraftConflict(error.message); throw error; }
    return record;
  }
  await mkdir(directory(), { recursive: true, mode: 0o700 });
  const lock = path.join(directory(), key(token) + ".lock");
  let acquired = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    try { await mkdir(lock, { mode: 0o700 }); acquired = true; break; }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      const info = await stat(lock).catch(() => null);
      if (info && Date.now() - info.mtimeMs > 30000) await rm(lock, { recursive: true, force: true });
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }
  if (!acquired) throw new DraftConflict("This draft is being updated. Please try again.");
  try {
    const previous = await readDraft(token);
    if ((previous?.version ?? 0) !== version) throw new DraftConflict("Your draft changed in another tab. Reload to use the latest saved version.");
    const record: SavedQuote = {
      details, version: version + 1,
      localityId: details.location.toLowerCase() === sydneyLabel.toLowerCase() ? sydney.id : undefined,
      expiresAt: previous?.expiresAt ?? new Date(Date.now() + draftLifetimeMs).toISOString(),
      sourcePath: previous?.sourcePath ?? sourcePath,
      entryKey: entryKey || previous?.entryKey || "",
    };
    const temp = filePath(token) + "." + randomBytes(8).toString("hex") + ".tmp";
    try {
      await writeFile(temp, JSON.stringify(record), { mode: 0o600, flag: "wx" });
      await rename(temp, filePath(token));
    } finally { await rm(temp, { force: true }); }
    return record;
  } finally { await rm(lock, { recursive: true, force: true }); }
}

export async function removeDraft(token?: string) {
  if (token && validToken(token)) {
    if (databaseEnabled()) await deleteDocument("quotes", key(token));
    else await rm(filePath(token), { force: true });
  }
}

// Best-effort cleanup on API use; expired records are never returned.
// Production retention also needs scheduled deletion independent of site traffic.
export async function cleanExpiredDrafts() {
  if (databaseEnabled()) { await cleanExpiredDocuments("quotes"); return; }
  const entries = await readdir(/* turbopackIgnore: true */ directory()).catch(() => []);
  for (const name of entries.filter((name) => /^[a-f0-9]{64}\.json$/.test(name)).slice(0, 500)) {
    const file = path.join(/* turbopackIgnore: true */ directory(), name);
    try {
      const record = JSON.parse(await readFile(/* turbopackIgnore: true */ file, "utf8")) as SavedQuote;
      if (Date.parse(record.expiresAt) <= Date.now()) await rm(file, { force: true });
    } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  }
}
