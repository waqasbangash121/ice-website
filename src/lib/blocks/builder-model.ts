import type { BlockContent, PageComposition, Placement, TemplateSlot } from "./schema";
import type { PublicationStatus } from "@/types/content";
export interface BuilderBlock extends BlockContent { version: number; owner: string; source: string; status: PublicationStatus; publishedRevision: number; usage: number }

export const builderDragType = "application/x-ice-builder";
export type BuilderDrag = { pageId: string; kind: "slot" | "block"; id: string };
export type BuilderCommand = { action: "select"; slot: string } | { action: "move"; slot: string; delta: number } | { action: "drop"; target: string; payload: BuilderDrag };
export const slotKey = (placement: Placement) => placement.slot || placement.type;
export function readBuilderDrag(raw: string, pageId: string): BuilderDrag | null {
  try {
    const value = JSON.parse(raw);
    return value?.pageId === pageId && ["slot", "block"].includes(value.kind) && typeof value.id === "string" && value.id.length <= 100 ? value : null;
  } catch { return null; }
}
function validOrder(placements: Placement[]) {
  const visible = placements.filter((slot) => slot.enabled);
  return visible[0]?.type === "B01" && !visible.some((slot, index) => slot.type === "B17" && index !== visible.length - 1);
}
export function moveLayer(page: PageComposition, source: string, target: string): PageComposition {
  const placements = [...page.placements];
  const from = placements.findIndex((slot) => slotKey(slot) === source);
  const to = placements.findIndex((slot) => slotKey(slot) === target);
  if (from < 0 || to < 0 || from === to) return page;
  const [item] = placements.splice(from, 1);
  placements.splice(to, 0, item);
  return validOrder(placements) ? { ...page, placements } : page;
}
export function assignBlock(page: PageComposition, target: string, block: Pick<BlockContent, "id" | "type">): PageComposition {
  const placement = page.placements.find((slot) => slotKey(slot) === target);
  if (!placement || placement.type !== block.type) return page;
  const placements = page.placements.map((slot) => slotKey(slot) === target ? { ...slot, ref: block.id, enabled: true } : slot);
  return validOrder(placements) ? { ...page, placements } : page;
}
export function hideLayer(page: PageComposition, target: string, slots: TemplateSlot[]): PageComposition {
  if (slots.find((slot) => slot.id === target)?.rule === "R") return page;
  return { ...page, placements: page.placements.map((slot) => slotKey(slot) === target ? { ...slot, enabled: false } : slot) };
}
