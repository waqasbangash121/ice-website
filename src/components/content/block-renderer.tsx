import Link from "next/link";
import Image from "next/image";
import { Container, PageIntro, Section } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { QuoteLink } from "@/components/quote/quote-link";
import { LocationFinder } from "@/components/content/location-finder";
import { endOfLeaseContent } from "@/data/end-of-lease";
import { sydneyLabel } from "@/data/locations";
import type { BlockContent, PageComposition } from "@/lib/blocks/schema";
import { site } from "@/config/site";
import type { ReactNode } from "react";
import { builderDragType, readBuilderDrag, type BuilderCommand } from "@/lib/blocks/builder-model";
import { BuilderIcon } from "@/components/admin/builder-icon";
type CanvasEditor = { slots: string[]; selected: string; onCommand: (command: BuilderCommand) => void };
function EditorSection({ children, editor, slot, pageId, title, pinned }: { children: ReactNode; editor?: CanvasEditor; slot: string; pageId: string; title: string; pinned: boolean }) {
  if (!editor) return children;
  return <div className={`builder-canvas-section ${editor.selected === slot ? "is-selected" : ""}`} data-canvas-slot={slot} onClick={() => editor.onCommand({ action: "select", slot })} onDragOver={(event) => {
    if (event.dataTransfer.types.includes(builderDragType)) { event.preventDefault(); event.currentTarget.dataset.dragOver = "true"; }
  }} onDragLeave={(event) => { delete event.currentTarget.dataset.dragOver; }} onDrop={(event) => {
    event.preventDefault(); delete event.currentTarget.dataset.dragOver;
    const payload = readBuilderDrag(event.dataTransfer.getData(builderDragType), pageId);
    if (payload) editor.onCommand({ action: "drop", target: slot, payload });
  }}><div className="builder-canvas-section-tools"><button type="button" draggable={!pinned} disabled={pinned} aria-label={`Drag ${title}`} title={pinned ? "Fixed page section" : "Drag to reorder · arrow keys to move"} onDragStart={(event) => {
    event.dataTransfer.setData(builderDragType, JSON.stringify({ pageId, kind: "slot", id: slot })); event.dataTransfer.effectAllowed = "move";
  }} onKeyDown={(event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") { event.preventDefault(); editor.onCommand({ action: "move", slot, delta: event.key === "ArrowUp" ? -1 : 1 }); }
  }}><BuilderIcon name={pinned ? "layers" : "grip"}/></button><button type="button" aria-label={`Edit ${title}`} onClick={() => editor.onCommand({ action: "select", slot })}>{title}</button></div>{children}</div>;
}
export function ComposedServicePage({ page, blocks, editor }: { page: PageComposition; blocks: BlockContent[]; editor?: CanvasEditor }) {
  const local = Boolean(page.localityId);
  const lease = page.serviceId === "end-of-lease-cleaning";
  const quoteLabel = lease ? "Get My End-of-Lease Quote" : "Get a Free Quote";
  const context = { serviceId: page.serviceId, location: local ? sydneyLabel : undefined, sourcePath: page.path };
  return <><div className="tinted"><Container><Breadcrumbs items={lease ? local ? [{ label: "Locations", href: "/locations" }, { label: "New South Wales", href: "/locations/nsw" }, { label: "Sydney", href: "/locations/nsw/suburbs/sydney" }, { label: page.title }] : [{ label: "Services", href: "/services" }, { label: page.title }] : [{ label: page.title }]} /></Container></div>{blocks.map((block, position) => {
    const repeated = blocks.slice(0, position).some((item) => item.type === block.type);
    const sectionId = (block.type === "B06" ? "scope" : `block-${block.type.toLowerCase()}`) + (repeated ? `-${position}` : "");
    if (block.type === "B01") return <EditorSection key={`${block.id}-${position}`} editor={editor} slot={editor?.slots[position] || ""} pageId={page.id} title={block.title} pinned><Section className="tinted"><PageIntro eyebrow={block.eyebrow} title={block.title}><p>{block.body}</p>{page.serviceId && <div className="actions"><QuoteLink {...context}>{quoteLabel}</QuoteLink>{blocks.some((item) => item.type === "B06") && <Link href="#scope">Discuss the Scope</Link>}</div>}</PageIntro></Section></EditorSection>;
    return <EditorSection key={`${block.id}-${position}`} editor={editor} slot={editor?.slots[position] || ""} pageId={page.id} title={block.title} pinned={block.type === "B17"}><Section id={sectionId} className={["B07", "B15"].includes(block.type) ? "tinted" : block.type === "B17" ? "green" : undefined}>
      {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}<h2>{block.title}</h2>{block.body && <p className="intro-copy block-copy">{block.body}</p>}
      {block.type === "B04" && <LocationFinder />}
      {block.type === "B15" ? <div className="faq-list">{block.items.map((item, index) => <details key={index}><summary>{item.title}</summary><p>{item.text}</p></details>)}</div>
        : block.type === "B10" ? <ol className="steps">{block.items.map((item, index) => <li key={index}><span className="step-number" aria-hidden="true">{index + 1}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></li>)}</ol>
        : block.items.length > 0 && <div className="service-grid">{block.items.map((item, index) => {
          const original = block.type === "B06" ? endOfLeaseContent.scopeTopics.find((topic) => topic.title === item.title) : undefined;
          return <article className="service-card" key={index}>{original && "icon" in original && <Image src={original.icon} alt="" width={64} height={64} className="scope-icon" />}<h3>{item.title}</h3><p className="block-copy">{item.text}</p></article>;
        })}</div>}
      {block.links.length > 0 && <ul className="block-links">{block.links.map((link) => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}</ul>}
      {block.type === "B17" && <div className="actions"><QuoteLink {...context}>{quoteLabel}</QuoteLink><a href={site.phoneHref}>Call {site.phone}</a></div>}
    </Section></EditorSection>;
  })}</>;
}
