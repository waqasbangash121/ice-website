"use client";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { ComposedServicePage } from "@/components/content/block-renderer";
import { supportsBlock, type BlockContent, type PageComposition } from "@/lib/blocks/schema";

export function PreviewCanvas({ initialPage, blocks, embedded }: { initialPage: PageComposition; blocks: BlockContent[]; embedded: boolean }) {
  const [page, setPage] = useState(initialPage);
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
    }
    window.addEventListener("message", receive);
    window.parent.postMessage({ type: "ice-preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", receive);
  }, [blocks, embedded, initialPage]);
  const visible = page.placements.filter((placement) => placement.enabled).flatMap((placement) => blocks.filter((block) => block.id === placement.ref && block.type === placement.type));
  return <div onClickCapture={(event) => {
    if (!embedded) return;
    const link = (event.target as Element).closest("a");
    if (link && !link.getAttribute("href")?.startsWith("#")) event.preventDefault();
  }}><SiteShell><ComposedServicePage page={page} blocks={visible} /></SiteShell></div>;
}
