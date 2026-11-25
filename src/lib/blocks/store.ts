import "server-only";
import { mkdir, readFile, writeFile, rename, rm } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { seedCompositions } from "./seeds";
import { services } from "@/data/services";
import { sydney } from "@/data/locations";
import { CompositionInputError, knownLinks, slotsFor, supportsBlock, templateContracts, validateBlock, validatePage, validatePublicPath, validateTemplate, type BlockContent, type CompositionStore, type ManagedTemplate, type PageComposition, type Revision } from "./schema";
export type RecordKind = "blocks" | "pages" | "templates";
const directory = (dataRoot?: string) => path.join(dataRoot || process.env.ADMIN_DATA_DIR || path.join(process.cwd(), ".data", "admin"), "composition");
const file = (dataRoot?: string) => path.join(directory(dataRoot), "workspace.json");
export async function readCompositions(dataRoot?: string): Promise<CompositionStore> {
  try {
    const store = JSON.parse(await readFile(file(dataRoot), "utf8"));
    if (store.schemaVersion === 1) return { ...store, schemaVersion: 2, templates: {} };
    if (store.schemaVersion !== 2) throw new Error("Unsupported composition storage version.");
    return store;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return seedCompositions();
  }
}
export function publicLinks(store: CompositionStore) {
  return [...new Set([...knownLinks, ...Object.values(store.pages).filter((record) => record.publishedRevision > 0).map((record) => record.published.path)])];
}
export function pageDependencies(page: PageComposition, store: CompositionStore) {
  return JSON.stringify({ template: store.templates[page.template]?.publishedRevision || 0, blocks: page.placements.filter((p) => p.enabled).map((p) => [p.slot || p.type, p.ref, store.blocks[p.ref]?.publishedRevision]) });
}
function checkDependencies(page: PageComposition, store: CompositionStore) {
  if (Object.hasOwn(store.templates, page.template) && !store.templates[page.template].publishedRevision) throw new CompositionInputError("Publish the custom template first.");
  for (const placement of page.placements.filter((p) => p.enabled)) {
    if (!store.blocks[placement.ref]?.publishedRevision) throw new CompositionInputError(`Review, approve and publish the shared record ${placement.ref} first. Existing review-build content is not business approval.`);
  }
}
export function usageOf(id: string, store: CompositionStore) {
  return Object.values(store.pages).filter((page) => [page.draft, page.published].some((variant) => variant.placements.some((p) => p.enabled && p.ref === id)));
}
function required(value: unknown, label: string, max = 1000): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new CompositionInputError(`Enter ${label} (maximum ${max} characters).`);
  return value.trim();
}
function inputFrom(form: FormData): Record<string, unknown> {
  try {
    const value = JSON.parse(String(form.get("content")));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw new CompositionInputError("Invalid content payload."); }
}
function revision<T>(draft: T, actor: string): Revision<T> {
  return { draft, published: structuredClone(draft), publishedRevision: 0, status: "draft", version: 0, owner: actor, source: "", history: [] };
}
export async function mutateComposition(kind: RecordKind, id: string, form: FormData, actor: string) {
  await mkdir(directory(), { recursive: true, mode: 0o700 });
  const lock = path.join(directory(), "workspace.lock");
  try { await mkdir(lock); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") throw new CompositionInputError("The workspace is being updated. Try again. An operator must clear the lock after a stopped writer.");
    throw error;
  }
  try {
    const store = await readCompositions();
    let creatingPage = false;
    if (id === "new") {
      const nextId = form.get("newId");
      if (form.get("action") !== "create" || typeof nextId !== "string" || nextId.length > 80 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(nextId) || nextId === "new" || Object.hasOwn(store[kind], nextId)) throw new CompositionInputError("Choose a unique lowercase ID using letters, digits and single hyphens (up to 80 characters).");
      if (Object.keys(store[kind]).length >= 1000) throw new CompositionInputError("The local review workspace supports at most 1,000 records per collection.");
      if (kind === "blocks") {
        const copyFrom = form.get("copyFrom");
        if (typeof copyFrom === "string" && Object.hasOwn(store.blocks, copyFrom)) {
          const original = store.blocks[copyFrom];
          const draft = { ...structuredClone(original.draft), id: nextId };
          store.blocks[nextId] = revision(draft, actor);
          form.set("content", JSON.stringify(draft));
          form.set("owner", actor);
          form.set("source", original.source);
        } else {
          if (copyFrom) throw new CompositionInputError("Choose an existing block to create a variant.");
          const input = inputFrom(form);
          if (input.id !== nextId || !supportsBlock(String(input.type))) throw new CompositionInputError("Choose a supported block type.");
          const draft = validateBlock(input, input as unknown as BlockContent, publicLinks(store));
          store.blocks[nextId] = revision(draft, actor);
        }
      } else if (kind === "templates") {
        const input = inputFrom(form);
        if (input.id !== nextId || templateContracts.some((template) => template.id === nextId)) throw new CompositionInputError("Choose a new template ID.");
        const draft = validateTemplate(input, input as unknown as ManagedTemplate);
        store.templates[nextId] = revision(draft, actor);
      } else {
        const input = inputFrom(form);
        const template = required(input.template, "a template", 80);
        if (!["A03", "A06"].includes(template) && (!Object.hasOwn(store.templates, template) || !store.templates[template].publishedRevision)) throw new CompositionInputError("Choose a published custom template or an implemented service template.");
        const publicPath = validatePublicPath(input.path);
        if (Object.values(store.pages).some((page) => page.draft.path === publicPath || page.published.path === publicPath)) throw new CompositionInputError("This public URL is already reserved by another page.");
        const serviceId = typeof input.serviceId === "string" ? input.serviceId : "";
        const localityId = typeof input.localityId === "string" ? input.localityId : "";
        if (serviceId && !services.some((service) => service.id === serviceId)) throw new CompositionInputError("Choose an existing service.");
        if (localityId && localityId !== sydney.id) throw new CompositionInputError("Choose an existing locality.");
        const draft: PageComposition = { id: nextId, template, path: publicPath, serviceId, ...(localityId ? { localityId } : {}), title: required(input.title, "a page title", 150), description: required(input.description, "a meta description", 320), intent: required(input.intent, "the canonical intent", 500), placements: slotsFor(template, store.templates, true).map((slot) => ({ slot: slot.id, type: slot.block, ref: "", enabled: slot.rule === "R" })) };
        store.pages[nextId] = revision(draft, actor);
        form.set("content", JSON.stringify(draft));
        creatingPage = true;
      }
      id = nextId;
      form.set("action", "save");
      form.set("version", "0");
    }
    if (!Object.hasOwn(store[kind], id)) throw new CompositionInputError("Unknown content record.");
    const record: Revision<BlockContent | PageComposition | ManagedTemplate> = store[kind][id];
    if (!/^\d+$/.test(String(form.get("version"))) || Number(form.get("version")) !== record.version) throw new CompositionInputError("This record changed in another tab. Reload before editing.");
    const validate = (input: unknown, publishedTemplate = false) => {
      if (kind === "blocks") return validateBlock(input, store.blocks[id].draft, publicLinks(store));
      if (kind === "pages") return validatePage(input, store.pages[id].draft, store.blocks, store.templates, publishedTemplate);
      const template = validateTemplate(input, store.templates[id].draft);
      const inUse = Object.values(store.pages).some((page) => page.draft.template === id || page.published.template === id);
      if (inUse && JSON.stringify(template.placements) !== JSON.stringify(store.templates[id].published.placements)) throw new CompositionInputError("Pages use this template. Create a new template for structural changes; its name and description remain editable.");
      return template;
    };
    const action = form.get("action");
    if (action === "save") {
      if (!creatingPage) record.draft = validate(inputFrom(form));
      record.owner = required(form.get("owner"), "a responsible owner", 100);
      record.source = required(form.get("source"), "a source reference");
      record.status = "draft";
      delete record.approvedDependencies;
    } else {
      const transitions = { review: ["draft", "review"], approve: ["review", "approved"], publish: ["approved", "published"] } as const;
      if (typeof action !== "string" || !Object.hasOwn(transitions, action)) throw new CompositionInputError("Unknown workflow action.");
      const transition = transitions[action as keyof typeof transitions];
      if (record.status !== transition[0]) throw new CompositionInputError("Invalid workflow transition.");
      if (!record.owner || !record.source || !record.version) throw new CompositionInputError("Save an owner, source and content before requesting review.");
      validate(record.draft, action === "approve" || action === "publish");
      if (kind === "pages") {
        const page = store.pages[id].draft;
        if (action === "approve" || action === "publish") checkDependencies(page, store);
        if (action === "approve") record.approvedDependencies = pageDependencies(page, store);
        if (action === "publish" && record.approvedDependencies !== pageDependencies(page, store)) throw new CompositionInputError("A shared block or template changed after approval. Save this page and request review again.");
      }
      if (action === "publish") {
        record.published = structuredClone(record.draft);
        record.publishedRevision = record.version + 1;
      }
      record.status = transition[1];
    }
    record.version++;
    record.history.push({ action: String(action), actor, at: new Date().toISOString(), version: record.version });
    const temporary = file() + "." + randomBytes(8).toString("hex") + ".tmp";
    try {
      await writeFile(temporary, JSON.stringify(store), { flag: "wx", mode: 0o600 });
      await rename(temporary, file());
    } finally { await rm(temporary, { force: true }); }
    return record;
  } finally { await rm(lock, { recursive: true, force: true }); }
}
