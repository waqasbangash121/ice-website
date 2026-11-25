import contracts from "@/config/block-contracts.json";
import type { PublicationStatus } from "@/types/content";
export const supportedBlocks = ["B01", "B02", "B04", "B06", "B07", "B08", "B10", "B15", "B16", "B17", "B21", "B40"] as const;
export type SupportedBlock = typeof supportedBlocks[number];
export interface BlockContent {
  id: string;
  type: SupportedBlock;
  title: string;
  eyebrow: string;
  body: string;
  items: { title: string; text: string }[];
  links: { label: string; href: string }[];
}
export interface Placement { slot?: string; type: string; ref: string; enabled: boolean }
export interface TemplateSlot { id: string; block: string; rule: string; contract: string }
export interface ManagedTemplate { id: string; name: string; description: string; placements: TemplateSlot[] }
export interface PageComposition {
  id: string;
  template: string;
  path: string;
  serviceId: string;
  localityId?: string;
  title: string;
  description: string;
  intent: string;
  placements: Placement[];
}
export interface Revision<T> {
  draft: T;
  published: T;
  publishedRevision: number;
  status: PublicationStatus;
  version: number;
  owner: string;
  source: string;
  approvedDependencies?: string;
  history: { action: string; actor: string; at: string; version: number }[];
}
export interface CompositionStore {
  schemaVersion: 2;
  blocks: Record<string, Revision<BlockContent>>;
  pages: Record<string, Revision<PageComposition>>;
  templates: Record<string, Revision<ManagedTemplate>>;
}
export const blockContracts = contracts.blocks;
export const templateContracts = contracts.templates;
export const supportsBlock = (type: string): type is SupportedBlock => (supportedBlocks as readonly string[]).includes(type);
export const knownLinks = ["/", "/services", "/services/end-of-lease-cleaning", "/locations", "/locations/nsw", "/locations/nsw/suburbs/sydney", "/locations/nsw/suburbs/sydney/end-of-lease-cleaning", "/get-a-free-quote"];
export function slotsFor(id: string, templates: CompositionStore["templates"] = {}, published = false): TemplateSlot[] {
  const builtIn = templateContracts.find((template) => template.id === id);
  if (builtIn) return builtIn.placements.map((slot) => ({ ...slot, id: slot.block }));
  if (!Object.hasOwn(templates, id)) throw new CompositionInputError("Unknown template.");
  return (published ? templates[id].published : templates[id].draft).placements;
}
export function validatePublicPath(value: unknown) {
  const result = text(value, "Public URL", 200);
  if (!/^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*){0,5}$/.test(result) || /^\/(admin|api|get-a-free-quote)(\/|$)/.test(result) || knownLinks.includes(result)) fail("Choose an unused public URL such as /guides/cleaning-preparation. Reserved routes cannot be replaced.");
  return result;
}
export function validateTemplate(input: unknown, previous: ManagedTemplate): ManagedTemplate {
  if (!input || typeof input !== "object") fail("Invalid template.");
  const value = input as Record<string, unknown>;
  if (value.id !== previous.id) fail("Template identity cannot change.");
  if (!Array.isArray(value.placements) || value.placements.length < 1 || value.placements.length > 30) fail("Use between 1 and 30 template slots.");
  const seen = new Set<string>();
  const placements = value.placements.map((slot) => {
    if (!slot || typeof slot !== "object" || typeof slot.id !== "string" || !/^[a-z0-9-]{1,80}$/.test(slot.id) || seen.has(slot.id) || !supportsBlock(slot.block) || !["R", "C", "O"].includes(slot.rule)) fail("Each slot needs a unique ID, a supported block type and a visibility rule.");
    seen.add(slot.id);
    return { id: slot.id as string, block: slot.block as string, rule: slot.rule as string, contract: text(slot.contract, "Slot guidance", 500, false) };
  });
  if (placements[0].block !== "B01" || placements[0].rule !== "R" || placements.filter((slot) => slot.block === "B01").length !== 1) fail("Start with exactly one required introduction (B01).");
  if (placements.filter((slot) => slot.block === "B17").length > 1 || placements.some((slot, index) => slot.block === "B17" && index !== placements.length - 1)) fail("Place a single conversion handoff at the end, if needed.");
  return { id: previous.id, name: text(value.name, "Template name", 150), description: text(value.description, "Template description", 1000), placements };
}
export class CompositionInputError extends Error {}
function fail(message: string): never { throw new CompositionInputError(message); }
function text(value: unknown, label: string, max: number, required = true): string {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) fail(`${label}: ${required ? "enter text, " : ""}maximum ${max} characters.`);
  return value.trim();
}
export function validateBlock(input: unknown, previous: BlockContent, publicLinks = knownLinks): BlockContent {
  if (!input || typeof input !== "object") fail("Invalid block content.");
  const value = input as Record<string, unknown>;
  if (value.id !== previous.id || value.type !== previous.type) fail("Block identity and type cannot change.");
  const title = text(value.title, "Heading", 150);
  const eyebrow = text(value.eyebrow, "Eyebrow", 100, false);
  const body = text(value.body, "Description", 2500, !["B10", "B15", "B16"].includes(previous.type));
  if (!Array.isArray(value.items) || value.items.length > 30) fail("Use at most 30 items.");
  const items = value.items.map((item) => {
    if (!item || typeof item !== "object") fail("Invalid item.");
    return { title: text(item.title, "Item title", 200), text: text(item.text, "Item description", 1500) };
  });
  if (["B06", "B07", "B10", "B15"].includes(previous.type) && !items.length) fail("This block requires at least one item.");
  if (!["B02", "B06", "B07", "B10", "B15"].includes(previous.type) && items.length) fail("This block type does not support content items.");
  if (!Array.isArray(value.links) || value.links.length > 12) fail("Use at most 12 related links.");
  const links = value.links.map((link) => {
    if (!link || typeof link !== "object") fail("Invalid link.");
    const href = text(link.href, "Link destination", 200);
    if (!publicLinks.includes(href)) fail("Choose an existing published page for related links.");
    return { label: text(link.label, "Link label", 120), href };
  });
  if (previous.type === "B16" && !links.length) fail("Related links require a destination.");
  if (previous.type !== "B16" && links.length) fail("Only a related-links block can contain destinations.");
  if (previous.type === "B08" && /[$£€]|\bAUD\s*\d/i.test(JSON.stringify({ title, body, items }))) fail("Prices remain disabled. Describe assessment factors without quoting a rate.");
  return { id: previous.id, type: previous.type, title, eyebrow, body, items, links };
}
export function validatePage(input: unknown, previous: PageComposition, blocks: CompositionStore["blocks"], templates: CompositionStore["templates"] = {}, publishedTemplate = false): PageComposition {
  if (!input || typeof input !== "object") fail("Invalid page composition.");
  const value = input as Record<string, unknown>;
  if (value.id !== previous.id || value.template !== previous.template || value.path !== previous.path || value.serviceId !== previous.serviceId || value.localityId !== previous.localityId) fail("Page identity, route and context cannot change.");
  if (!Array.isArray(value.placements)) fail("Page placements are required.");
  const specification = slotsFor(previous.template, templates, publishedTemplate);
  if (value.placements.length !== specification.length) fail("Keep all template slots, including omitted conditional slots.");
  const seen = new Set<string>();
  const placements = value.placements.map((placement) => {
    if (!placement || typeof placement !== "object") fail("Invalid placement.");
    const slotId = placement.slot || placement.type;
    const slot = specification.find((slot) => slot.id === slotId && slot.block === placement.type);
    if (!slot || seen.has(slotId) || typeof placement.enabled !== "boolean" || typeof placement.ref !== "string") fail("Unknown or duplicate block placement.");
    seen.add(slotId);
    if (slot.rule === "R" && !placement.enabled) fail(`${slot.block} is required by ${previous.template}.`);
    if (placement.enabled && (!supportsBlock(placement.type) || !Object.hasOwn(blocks, placement.ref) || blocks[placement.ref].draft.type !== placement.type)) fail(`${placement.type}: choose a supported content record of the same type.`);
    return { ...(placement.slot ? { slot: slot.id } : {}), type: placement.type as string, ref: placement.ref as string, enabled: placement.enabled as boolean };
  });
  const visible = placements.filter((p) => p.enabled);
  if (visible[0]?.type !== "B01" || visible.some((slot, index) => slot.type === "B17" && index !== visible.length - 1)) fail("Keep the introduction first and any conversion handoff last.");
  return { ...previous, title: text(value.title, "SEO title", 150), description: text(value.description, "Description", 320), intent: text(value.intent, "Canonical intent", 500), placements };
}
