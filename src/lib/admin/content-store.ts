import { databaseEnabled, readDocument, writeDocument, StorageConflict } from "@/lib/supabase/storage";
import "server-only";
import { mkdir, readFile, writeFile, rename, rm } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { services } from "@/data/services";
import type { Service, PublicationStatus } from "@/types/content";

export interface ManagedService {
  draft: Service;
  published?: Service;
  status: PublicationStatus;
  version: number;
  owner: string;
  source: string;
  history: { action: string; actor: string; at: string; version: number }[];
}
export class ContentInputError extends Error {}
const directory = (dataRoot?: string) => path.join(dataRoot || process.env.ADMIN_DATA_DIR || path.join(process.cwd(), ".data", "admin"), "content");
function seed(id: string): Service {
  const service = services.find((item) => item.id === id);
  if (!service) throw new Error("Unknown service.");
  return service;
}
const file = (id: string, dataRoot?: string) => { seed(id); return path.join(directory(dataRoot), id + ".json"); };
export async function readService(id: string, dataRoot?: string): Promise<ManagedService> {
  try {
    if (databaseEnabled() && !dataRoot) {
      seed(id);
      const row = await readDocument<ManagedService>("services", id);
      if (!row) throw new Error("Database service missing. Run migration before activation.");
      return row.payload;
    }
    return JSON.parse(await readFile(file(id, dataRoot), "utf8"));
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return { draft: seed(id), status: "draft", version: 0, owner: "", source: "docs/SOURCE-INVENTORY.md", history: [] };
  }
}
export async function listManagedServices() { return Promise.all(services.map((service) => readService(service.id))); }
export async function publicServices(dataRoot?: string) {
  return Promise.all(services.map(async (service) => (await readService(service.id, dataRoot)).published ?? service));
}
function text(value: FormDataEntryValue | null, label: string, max: number) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) throw new ContentInputError(`${label} is required (maximum ${max} characters).`);
  return value.trim();
}
export async function mutateService(id: string, form: FormData, actor: string) {
  seed(id);
  const remote = databaseEnabled();
  const snapshot = remote ? await readDocument<ManagedService>("services", id) : null;
  if (remote && !snapshot) throw new Error("Database service missing.");
  if (!remote) await mkdir(directory(), { recursive: true, mode: 0o700 });
  const lock = file(id) + ".lock";
  try { if (!remote) await mkdir(lock); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") throw new ContentInputError("Another edit is in progress. Try again; if a process stopped, ask the operator to clear its lock.");
    throw error;
  }
  try {
    const record = snapshot?.payload ?? await readService(id);
    if (Number(form.get("version")) !== record.version) throw new ContentInputError("This service changed in another tab. Reload before editing.");
    const action = form.get("action");
    if (action === "save") {
      record.draft = { ...seed(id), name: text(form.get("name"), "Name", 100), summary: text(form.get("summary"), "Summary", 600) };
      record.owner = text(form.get("owner"), "Responsible owner", 100);
      record.source = text(form.get("source"), "Source reference", 1000);
      record.status = "draft";
    } else {
      const transitions: Record<string, [PublicationStatus, PublicationStatus]> = { review: ["draft", "review"], approve: ["review", "approved"], publish: ["approved", "published"] };
      const transition = typeof action === "string" && Object.hasOwn(transitions, action) ? transitions[action] : undefined;
      if (!transition || transition[0] !== record.status) throw new ContentInputError("Invalid workflow transition. Reload the editor.");
      if (!record.owner || !record.source) throw new ContentInputError("Save an owner and source before requesting review.");
      record.status = transition[1];
      if (action === "publish") record.published = { ...record.draft };
    }
    record.version++;
    record.history.push({ action: String(action), actor, at: new Date().toISOString(), version: record.version });
    if (remote) {
      try { await writeDocument("services", id, record, snapshot!.revision); }
      catch (error) { if (error instanceof StorageConflict) throw new ContentInputError(error.message); throw error; }
      return record;
    }
    const temp = file(id) + "." + randomBytes(8).toString("hex") + ".tmp";
    try {
      await writeFile(temp, JSON.stringify(record), { flag: "wx", mode: 0o600 });
      await rename(temp, file(id));
    } finally { await rm(temp, { force: true }); }
    return record;
  } finally { if (!remote) await rm(lock, { recursive: true, force: true }); }
}
