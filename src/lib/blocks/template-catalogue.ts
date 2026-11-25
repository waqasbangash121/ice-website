import reference from "@/config/template-reference.json";
import { templates } from "@/config/templates";
import { templateContracts, supportsBlock, type ManagedTemplate } from "./schema";
export const templateReferences = reference.templates;
export const referenceSource = reference.source;
export function templateReference(id: string) { return templateReferences.find((item) => item.id === id); }
export function referenceDraft(id: string): ManagedTemplate | undefined {
  const specification = templateContracts.find((item) => item.id === id);
  const details = templateReference(id);
  if (!specification || !details) return;
  return { id: "", name: `${templates[id as keyof typeof templates].name} layout`, description: details.job, referenceId: id, placements: specification.placements.map((slot, i) => ({ id: `${slot.block.toLowerCase()}-${i + 1}`, block: slot.block, rule: slot.rule, contract: slot.contract })) };
}
export function referenceCapability(id: string) {
  if (["A03", "A06"].includes(id)) return "Page builder connected";
  if (["A01", "A02", "A04", "A05", "A17", "A20"].includes(id)) return "Website implementation · composer pending";
  return "Specification · implementation pending";
}
export function referenceCoverage(id: string) {
  const spec = templateContracts.find((item) => item.id === id)!;
  return { total: spec.placements.length, ready: spec.placements.filter((slot) => supportsBlock(slot.block)).length, missing: spec.placements.filter((slot) => slot.rule === "R" && !supportsBlock(slot.block)).map((slot) => slot.block) };
}
