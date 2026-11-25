"use client";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { ComposedServicePage } from "@/components/content/block-renderer";
import { knownLinks, supportsBlock, validateBlock, type BlockContent, type PageComposition } from "@/lib/blocks/schema";
import { slotKey, type BuilderBlock, type BuilderCommand } from "@/lib/blocks/builder-model";

export function PreviewCanvas({ initialPage, blocks, embedded, destinations = knownLinks, records = [] }: { initialPage: PageComposition; blocks: BlockContent[]; embedded: boolean; destinations?: string[]; records?: BuilderBlock[] }) {
  const [page, setPage] = useState(initialPage);
  const [drafts, setDrafts] = useState(blocks);
  const [selected, setSelected] = useState("");
  useEffect(() => {
    if (!embedded) return;
    function receive(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== "ice-page-preview") return;
      const candidate = event.data.page as PageComposition | undefined;
      // Only composition order/record selection is live. Identity/context comes from the authenticated server.
      if (!candidate || candidate.id !== initialPage.id || !Array.isArray(candidate.placements) || candidate.placements.length > 40) return;
      const seen = new Set<string>();
      const placements = candidate.placements.filter((placement) => {
        const slotId = placement?.slot || placement?.type;
        if (!placement || typeof placement.type !== "string" || typeof placement.ref !== "string" || typeof placement.enabled !== "boolean" || seen.has(slotId)) return false;
        seen.add(slotId);
        return initialPage.placements.some((slot) => (slot.slot || slot.type) === slotId && slot.type === placement.type) && (!placement.enabled || (supportsBlock(placement.type) && blocks.some((block) => block.id === placement.ref && block.type === placement.type)));
      });
      setPage({ ...initialPage, placements });
      if (typeof event.data.selected === "string") setSelected(event.data.selected);
      if (Array.isArray(event.data.blocks) && event.data.blocks.length <= 1000) {
        setDrafts(blocks.map((original) => {
          const candidate = event.data.blocks.find((block: BlockContent) => block?.id === original.id && block?.type === original.type);
          if (!candidate) return original;
          try {
            return validateBlock({ ...candidate, title: candidate.title || "Untitled section", body: candidate.body || (["B10", "B15", "B16"].includes(original.type) ? "" : "Add your content…"), items: Array.isArray(candidate.items) ? candidate.items.map((item: { title: string; text: string }) => ({ title: item?.title || "New item", text: item?.text || "Add details…" })) : [] }, original, [...destinations, ...original.links.map((link) => link.href)]);
          } catch { return original; }
        }));
      }
    }
    window.addEventListener("message", receive);
    window.parent.postMessage({ type: "ice-preview-ready", records }, window.location.origin);
    return () => window.removeEventListener("message", receive);
  }, [blocks, embedded, initialPage, destinations, records]);
  const visiblePlacements = page.placements.filter((placement) => placement.enabled && drafts.some((block) => block.id === placement.ref && block.type === placement.type));
  const visible = visiblePlacements.map((placement) => drafts.find((block) => block.id === placement.ref)!);
  function command(command: BuilderCommand) { window.parent.postMessage({ type: "ice-preview-action", command }, window.location.origin); }
  return <div onClickCapture={(event) => {
    if (!embedded) return;
    const link = (event.target as Element).closest("a");
    if (link && !link.getAttribute("href")?.startsWith("#")) event.preventDefault();
  }}><SiteShell><ComposedServicePage page={page} blocks={visible} editor={embedded ? { slots: visiblePlacements.map(slotKey), selected, onCommand: command } : undefined} /></SiteShell></div>;
}
