"use client";
import { useEffect, useRef, useState, type DragEvent, type PointerEvent } from "react";
import Link from "next/link";
import { PagePreview } from "./page-preview";
import { BuilderIcon, type BuilderIconName } from "./builder-icon";
import { assignBlock, builderDragType, hideLayer, moveLayer, readBuilderDrag, slotKey, type BuilderBlock, type BuilderCommand, type BuilderDrag } from "@/lib/blocks/builder-model";
import { knownLinks, supportsBlock, type BlockContent, type PageComposition, type TemplateSlot } from "@/lib/blocks/schema";
import type { PublicationStatus } from "@/types/content";

type Document = { page: PageComposition; edits: Record<string, BlockContent>; owner: string; source: string };
type Activity = { action: string; actor: string; at: string; version: number };
const labels: Record<string, [string, BuilderIconName]> = { B01: ["Introduction", "text"], B02: ["Key facts", "list"], B04: ["Location finder", "location"], B06: ["Service scope", "list"], B07: ["Extras & suitability", "list"], B08: ["Pricing guidance", "text"], B10: ["Process steps", "list"], B15: ["Questions & answers", "help"], B16: ["Related links", "link"], B17: ["Call to action", "arrow"], B21: ["Text section", "text"], B40: ["Local context", "location"] };
const labelFor = (type: string) => labels[type]?.[0] || "Planned section";
const contentOf = (block: BlockContent): BlockContent => ({ id: block.id, type: block.type, title: block.title, eyebrow: block.eyebrow, body: block.body, items: block.items, links: block.links });
const nextAction = { draft: ["review", "Request review"], review: ["approve", "Approve page"], approved: ["publish", "Publish page"], published: null } as const;

export function PageBuilder({ content, version, owner, source, blocks, slots, status, publishedRevision, actor, destinations = knownLinks, initialError = "", activity = [] }: {
  content: PageComposition; version: number; owner: string; source: string; blocks: BuilderBlock[]; slots: TemplateSlot[]; status: PublicationStatus; publishedRevision: number; actor: string; destinations?: string[]; initialError?: string; activity?: Activity[];
}) {
  const initial: Document = { page: content, edits: {}, owner: owner || actor, source };
  const [history, setHistory] = useState<{ past: Document[]; current: Document; future: Document[] }>({ past: [], current: initial, future: [] });
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [metadata, setMetadata] = useState<Record<string, BuilderBlock>>(Object.fromEntries(blocks.map((block) => [block.id, block])));
  const versions = useRef(Object.fromEntries(blocks.map((block) => [block.id, block.version])));
  const [pageVersion, setPageVersion] = useState(version);
  const [pageStatus, setPageStatus] = useState(status);
  const [publicRevision, setPublicRevision] = useState(publishedRevision);
  const [activityLog, setActivityLog] = useState(activity);
  const [selected, setSelected] = useState(slotKey(content.placements.find((slot) => slot.enabled) || content.placements[0]));
  const [leftTab, setLeftTab] = useState<"layers" | "library">("layers");
  const [rightTab, setRightTab] = useState<"section" | "page">("section");
  const [mobileView, setMobileView] = useState<"layers" | "canvas" | "inspector">("canvas");
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(initialError);
  const [notice, setNotice] = useState("");
  const [dragging, setDragging] = useState<BuilderDrag | null>(null);
  const [over, setOver] = useState("");
  const pointer = useRef<{ payload: BuilderDrag; x: number; y: number; active: boolean; target: string } | null>(null);
  const lifted = useRef<PageComposition | null>(null);
  const doc = history.current;
  const dirty = JSON.stringify(doc) !== saved;
  const active = doc.page.placements.find((placement) => slotKey(placement) === selected);
  const activeSlot = slots.find((slot) => slot.id === selected);
  const activeBlock = active?.ref ? doc.edits[active.ref] || metadata[active.ref] : undefined;
  const effectiveBlocks = Object.values(doc.edits);
  const visible = doc.page.placements.filter((placement) => placement.enabled);
  const omitted = doc.page.placements.filter((placement) => !placement.enabled);
  const baseline = ["lease-national", "lease-sydney"].includes(content.id);
  useEffect(() => {
    if (!dirty) return;
    function beforeUnload(event: BeforeUnloadEvent) { event.preventDefault(); event.returnValue = ""; }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);
  function change(next: Document) {
    if (pending || JSON.stringify(next) === JSON.stringify(doc)) return;
    setHistory((state) => ({ past: [...state.past.slice(-59), state.current], current: next, future: [] }));
    setNotice(""); setError("");
  }
  function select(id: string) { setSelected(id); setRightTab("section"); setInspectorOpen(true); if (window.matchMedia("(max-width: 900px)").matches) setMobileView("inspector"); }
  function undo() { setHistory((state) => state.past.length ? { past: state.past.slice(0, -1), current: state.past.at(-1)!, future: [state.current, ...state.future] } : state); }
  function redo() { setHistory((state) => state.future.length ? { past: [...state.past, state.current], current: state.future[0], future: state.future.slice(1) } : state); }
  function updatePage(patch: Partial<PageComposition>) { change({ ...doc, page: { ...doc.page, ...patch } }); }
  function updateBlock(patch: Partial<BlockContent>) {
    if (activeBlock) change({ ...doc, edits: { ...doc.edits, [activeBlock.id]: { ...contentOf(activeBlock), ...patch } } });
  }
  function reorder(sourceId: string, targetId: string) {
    const next = moveLayer(doc.page, sourceId, targetId);
    if (next === doc.page) { setNotice("The introduction stays first and the call to action stays last."); return; }
    change({ ...doc, page: next }); setNotice("Section order updated."); select(sourceId);
  }
  function moveBy(id: string, delta: number) {
    const index = visible.findIndex((slot) => slotKey(slot) === id);
    const target = visible[index + delta];
    if (target) reorder(id, slotKey(target));
  }
  function placeBlock(blockId: string, targetId?: string) {
    const block = metadata[blockId];
    if (!block) return;
    const available = doc.page.placements.find((slot) => slot.type === block.type && (!slot.enabled || !slot.ref));
    const target = targetId || (active?.type === block.type ? selected : undefined) || (available ? slotKey(available) : undefined);
    if (!target) { setNotice(`This template has no available ${labelFor(block.type).toLowerCase()} slot.`); return; }
    const next = assignBlock(doc.page, target, block);
    if (next === doc.page) { setNotice("Choose a content record that matches this section type."); return; }
    change({ ...doc, page: next }); select(target); setNotice("Content added to the page.");
  }
  function drop(payload: BuilderDrag | null, target: string) {
    if (!payload || pending) return;
    if (payload.kind === "slot") reorder(payload.id, target);
    else placeBlock(payload.id, target);
    setDragging(null); setOver("");
  }
  function command(message: BuilderCommand) {
    if (!message || pending) return;
    if (message.action === "select" && slots.some((slot) => slot.id === message.slot)) select(message.slot);
    if (message.action === "move" && [-1, 1].includes(message.delta)) moveBy(message.slot, message.delta);
    if (message.action === "drop") drop(readBuilderDrag(JSON.stringify(message.payload), content.id), message.target);
  }
  function receiveRecords(records: BuilderBlock[]) {
    if (!Array.isArray(records) || records.length > 1000) return;
    setMetadata((previous) => {
      const next = { ...previous };
      let changed = false;
      for (const record of records) {
        if (!record || !Object.hasOwn(previous, record.id) || record.type !== previous[record.id].type || !Number.isSafeInteger(record.version) || record.version < 0 || typeof record.owner !== "string" || typeof record.source !== "string") continue;
        if (doc.edits[record.id] && JSON.stringify(doc.edits[record.id]) !== JSON.stringify(contentOf(previous[record.id]))) continue;
        if (JSON.stringify(previous[record.id]) !== JSON.stringify(record)) { next[record.id] = record; versions.current[record.id] = record.version; changed = true; }
      }
      return changed ? next : previous;
    });
  }
  function startDrag(event: DragEvent, payload: BuilderDrag) {
    event.dataTransfer.setData(builderDragType, JSON.stringify(payload));
    event.dataTransfer.effectAllowed = payload.kind === "slot" ? "move" : "copy";
    setDragging(payload);
  }
  function touchStart(event: PointerEvent<HTMLButtonElement>, payload: BuilderDrag) {
    if (event.pointerType === "mouse" || pending) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointer.current = { payload, x: event.clientX, y: event.clientY, active: false, target: "" };
  }
  function touchMove(event: PointerEvent<HTMLButtonElement>) {
    const current = pointer.current;
    if (!current) return;
    if (!current.active && Math.hypot(event.clientX - current.x, event.clientY - current.y) > 8) { current.active = true; setDragging(current.payload); }
    if (current.active) {
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-builder-slot]");
      current.target = target?.dataset.builderSlot || "";
      setOver(current.target);
    }
  }
  function touchEnd() {
    if (pointer.current?.active && pointer.current.target) drop(pointer.current.payload, pointer.current.target);
    pointer.current = null; setDragging(null); setOver("");
  }
  async function send(kind: "blocks" | "pages", id: string, values: Record<string, string>) {
    const response = await fetch(`/api/admin/composition/${kind}/${id}`, { method: "POST", headers: { accept: "application/json" }, body: new URLSearchParams(values) });
    if (response.status === 401) throw new Error("Your session ended. Sign in in another tab, then retry. Your edits are still here.");
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to save. Your edits are still here.");
  }
  async function saveDraft() {
    if (pending) return;
    setPending(true); setError(""); setNotice("");
    let sharedSaved = false;
    try {
      for (const [id, edited] of Object.entries(doc.edits)) {
        if (JSON.stringify(edited) === JSON.stringify(contentOf(metadata[id]))) continue;
        await send("blocks", id, { action: "save", version: String(versions.current[id]), content: JSON.stringify(edited), owner: metadata[id].owner || actor, source: metadata[id].source });
        versions.current[id]++;
        setMetadata((state) => ({ ...state, [id]: { ...state[id], ...edited, version: versions.current[id], status: "draft", owner: state[id].owner || actor } }));
        sharedSaved = true;
      }
      await send("pages", content.id, { action: "save", version: String(pageVersion), content: JSON.stringify(doc.page), owner: doc.owner, source: doc.source });
      const clean = { ...doc, edits: {} };
      setPageVersion((value) => value + 1); setPageStatus("draft"); setSaved(JSON.stringify(clean));
      setHistory({ past: [], current: clean, future: [] });
      setActivityLog((events) => [...events, { action: "save", actor, at: new Date().toISOString(), version: pageVersion + 1 }]);
      setNotice(sharedSaved ? "Page and shared block drafts saved. Publication is separate." : "Page draft saved.");
    } catch (error) { setError((sharedSaved ? "Some shared drafts were saved. " : "") + (error instanceof Error ? error.message : "Unable to save.")); }
    finally { setPending(false); }
  }
  async function advance() {
    const next = nextAction[pageStatus];
    if (!next || pending || dirty || !pageVersion) return;
    setPending(true); setError("");
    try {
      await send("pages", content.id, { action: next[0], version: String(pageVersion) });
      setPageVersion((value) => value + 1);
      const updated = { review: "review", approve: "approved", publish: "published" }[next[0]] as PublicationStatus;
      setPageStatus(updated);
      setActivityLog((events) => [...events, { action: next[0], actor, at: new Date().toISOString(), version: pageVersion + 1 }]);
      if (updated === "published") setPublicRevision(pageVersion + 1);
      setNotice(updated === "published" ? "Your page is published at its public URL." : updated === "review" ? "Saved page submitted for review." : "Page approved and ready to publish.");
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to update the workflow."); }
    finally { setPending(false); }
  }
  const workflow = nextAction[pageStatus];
  const matches = blocks.filter((block) => `${(doc.edits[block.id] || metadata[block.id]).title} ${labelFor(block.type)}`.toLowerCase().includes(search.toLowerCase()));
  const selectedMeta = activeBlock ? metadata[activeBlock.id] : undefined;
  const editedCount = Object.keys(doc.edits).filter((id) => JSON.stringify(doc.edits[id]) !== JSON.stringify(contentOf(metadata[id]))).length;
  return <div className="page-builder" data-mobile-view={mobileView} data-inspector={inspectorOpen ? "open" : "closed"} onKeyDown={(event) => {
    if (pending) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") { event.preventDefault(); void saveDraft(); }
    if (!(event.target as HTMLElement).closest("input, textarea, select") && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") { event.preventDefault(); if (event.shiftKey) redo(); else undo(); }
  }}>
    <header className="builder-header"><div className="builder-page-identity"><Link href="/admin/pages" className="builder-icon-button" aria-label="Back to pages"><BuilderIcon name="arrow" /></Link><div><span className="builder-kicker">PAGE STUDIO <span>/</span> {content.template.startsWith("A") ? content.template : "CUSTOM TEMPLATE"}</span><h1>{doc.page.title || "Untitled page"}</h1><p>{content.path}</p></div><span className={`builder-status ${pageStatus}`}>{pageStatus}</span></div><div className="builder-header-actions"><span className="builder-save-state"><i className={dirty ? "dirty" : ""}/>{pending ? "Saving…" : dirty ? "Unsaved changes" : "All changes saved"}</span><div className="builder-history-buttons"><button type="button" className="builder-icon-button" disabled={!history.past.length || pending} onClick={undo} aria-label="Undo change" title="Undo"><BuilderIcon name="undo" /></button><button type="button" className="builder-icon-button" disabled={!history.future.length || pending} onClick={redo} aria-label="Redo change" title="Redo"><BuilderIcon name="redo" /></button></div><button type="button" className="builder-button builder-save" onClick={() => void saveDraft()} disabled={pending || (!dirty && pageVersion > 0)}><BuilderIcon name="save" />Save draft</button>{workflow && <button type="button" className="builder-button builder-publish" onClick={() => void advance()} disabled={pending || dirty || !pageVersion}>{workflow[1]}<BuilderIcon name="chevron" /></button>}</div></header>
    <div className="builder-subbar"><div><BuilderIcon name="layers" /><strong>{visible.length} sections</strong><span className="builder-divider"/><span>Drag sections to arrange your page</span></div><div>{(publicRevision > 0 || baseline) && <a href={content.path} target="_blank" rel="noopener noreferrer">View website<BuilderIcon name="external" /></a>}<button type="button" onClick={() => { if (window.matchMedia("(max-width: 900px)").matches) setInspectorOpen(true); else setInspectorOpen((value) => !value); setMobileView("inspector"); }} aria-pressed={inspectorOpen}><BuilderIcon name="settings" />Inspector</button></div></div>
    {(error || notice) && <div className={`builder-message ${error ? "is-error" : ""}`} role={error ? "alert" : "status"}>{error || notice}<button type="button" className="builder-icon-button" onClick={() => { setError(""); setNotice(""); }} aria-label="Dismiss message"><BuilderIcon name="close" /></button></div>}
    <nav className="builder-mobile-tabs" aria-label="Editor panels">{(["layers", "canvas", "inspector"] as const).map((view) => <button key={view} type="button" aria-pressed={mobileView === view} onClick={() => { setMobileView(view); if (view === "inspector") setInspectorOpen(true); }}>{view === "canvas" ? "Page preview" : view === "layers" ? "Sections & blocks" : "Edit section"}</button>)}</nav>
    <div className="builder-workspace">
      <aside className="builder-layers-panel"><div className="builder-panel-tabs" role="tablist" aria-label="Page resources"><button type="button" role="tab" aria-selected={leftTab === "layers"} onClick={() => setLeftTab("layers")}><BuilderIcon name="layers" />Layers</button><button type="button" role="tab" aria-selected={leftTab === "library"} onClick={() => setLeftTab("library")}><BuilderIcon name="grid" />Blocks</button></div>
        <div className="builder-panel-scroll">{leftTab === "layers" ? <><div className="builder-panel-heading"><div><h2>Page sections</h2><p>Your page, top to bottom.</p></div><button type="button" className="builder-icon-button" aria-label="Open block library" onClick={() => setLeftTab("library")}><BuilderIcon name="plus" /></button></div><ol className="builder-layer-list">{visible.map((placement, index) => {
          const id = slotKey(placement); const block = doc.edits[placement.ref] || metadata[placement.ref]; const pinned = ["B01", "B17"].includes(placement.type);
          const payload: BuilderDrag = { pageId: content.id, kind: "slot", id };
          return <li key={id} data-builder-slot={id} className={`builder-layer ${selected === id ? "is-selected" : ""} ${over === id ? "is-drop-target" : ""} ${dragging?.id === id ? "is-dragging" : ""}`} onDragOver={(event) => { if (event.dataTransfer.types.includes(builderDragType)) { event.preventDefault(); setOver(id); } }} onDragLeave={() => setOver("")} onDrop={(event) => { event.preventDefault(); drop(readBuilderDrag(event.dataTransfer.getData(builderDragType), content.id), id); }}>
            <button type="button" className="builder-grip" draggable={!pinned && !pending} aria-label={`Drag ${labelFor(placement.type)} section`} aria-describedby="builder-drag-help" disabled={pinned || pending} onDragStart={(event) => startDrag(event, payload)} onDragEnd={() => { setDragging(null); setOver(""); }} onPointerDown={(event) => touchStart(event, payload)} onPointerMove={touchMove} onPointerUp={touchEnd} onPointerCancel={() => { pointer.current = null; setDragging(null); setOver(""); }} onKeyDown={(event) => {
              if (event.key === " " || event.key === "Enter") { event.preventDefault(); if (lifted.current) { lifted.current = null; setNotice("Section placed."); } else { lifted.current = doc.page; setNotice("Section picked up. Use arrow keys to move; Space to drop; Escape to cancel."); } }
              if (event.key === "ArrowUp" || event.key === "ArrowDown") { event.preventDefault(); moveBy(id, event.key === "ArrowUp" ? -1 : 1); }
              if (event.key === "Escape" && lifted.current) { updatePage({ placements: lifted.current.placements }); lifted.current = null; setNotice("Reordering cancelled."); }
            }}><BuilderIcon name={pinned ? "layers" : "grip"} /></button><button type="button" className="builder-layer-select" onClick={() => select(id)} aria-pressed={selected === id}><span className="builder-layer-number">{String(index + 1).padStart(2, "0")}</span><span><strong>{labelFor(placement.type)}</strong><small>{block?.title || "Choose content for this section"}</small></span><span className={`builder-layer-dot ${block ? "" : "empty"}`} /></button>
          </li>;
        })}</ol><p id="builder-drag-help" className="builder-small-help">Drag a handle to reorder. Keyboard: use ↑ and ↓ on a handle. Introduction and call to action stay in place.</p>{omitted.length > 0 && <details className="builder-omitted"><summary>{omitted.length} available or planned sections</summary>{omitted.map((slot) => <button type="button" key={slotKey(slot)} disabled={!supportsBlock(slot.type)} onClick={() => { select(slotKey(slot)); setLeftTab("library"); }}><BuilderIcon name="plus" />{labelFor(slot.type)}<small>{supportsBlock(slot.type) ? "Add content" : "Not available yet"}</small></button>)}</details>}<button type="button" className="builder-add-section" onClick={() => setLeftTab("library")}><BuilderIcon name="plus" />Add or replace content</button></> : <><div className="builder-panel-heading"><div><h2>Block library</h2><p>Drag a block onto a matching section.</p></div></div><label className="builder-search"><BuilderIcon name="search" /><input aria-label="Search blocks" placeholder="Search your blocks…" value={search} onChange={(event) => setSearch(event.target.value)} /></label><div className="builder-library">{matches.map((block) => <article key={block.id} className={`builder-library-card type-${block.type.toLowerCase()}`} draggable={!pending} onDragStart={(event) => startDrag(event, { pageId: content.id, kind: "block", id: block.id })} onDragEnd={() => { setDragging(null); setOver(""); }}><div className="builder-block-miniature" aria-hidden="true"><BuilderIcon name={labels[block.type]?.[1] || "text"}/><span/><span/><span/></div><span className="builder-library-type">{labelFor(block.type)}</span><h3>{(doc.edits[block.id] || metadata[block.id]).title}</h3><div><small>{metadata[block.id].publishedRevision ? "Published version available" : "Draft record"}</small><button type="button" className="builder-icon-button" aria-label={`Add ${block.title}`} onClick={() => placeBlock(block.id)}><BuilderIcon name="plus" /></button></div></article>)}</div>{!matches.length && <p className="builder-empty">No matching blocks. Try another search.</p>}<a className="builder-new-link" href="/admin/blocks/new" target="_blank" rel="noopener noreferrer"><BuilderIcon name="plus" />Create a new shared block<BuilderIcon name="external" /></a></> }</div>
        <div className="builder-panel-footer"><span className="builder-live-dot"/>Live draft preview <span>Revision {pageVersion}</span></div>
      </aside>
      <div className="builder-canvas"><PagePreview page={doc.page} revision={pageVersion} selectedSlot={selected} draftBlocks={effectiveBlocks} onCommand={command} onRecords={receiveRecords} /></div>
      {inspectorOpen && <aside className="builder-inspector"><div className="builder-inspector-heading"><strong><BuilderIcon name="settings" />Inspector</strong><button type="button" className="builder-icon-button" onClick={() => { setInspectorOpen(false); setMobileView("canvas"); }} aria-label="Close inspector"><BuilderIcon name="close" /></button></div><div className="builder-panel-tabs" role="tablist" aria-label="Inspector views"><button role="tab" aria-selected={rightTab === "section"} type="button" onClick={() => setRightTab("section")}>Section</button><button role="tab" aria-selected={rightTab === "page"} type="button" onClick={() => setRightTab("page")}>Page settings</button></div><div className="builder-panel-scroll"><fieldset className="builder-inspector-fields" disabled={pending}>{rightTab === "section" ? <>
        <div className="builder-selection-heading"><span className="builder-selection-icon"><BuilderIcon name={labels[active?.type || ""]?.[1] || "layers"}/></span><span><small>SELECTED SECTION</small><h2>{labelFor(active?.type || "")}</h2></span><span className="builder-rule-badge">{activeSlot?.rule === "R" ? "Required" : "Optional"}</span></div>
        {active && <><label className="builder-field">Content record<select value={active.ref} onChange={(event) => placeBlock(event.target.value, selected)}><option value="">Choose a block…</option>{blocks.filter((block) => block.type === active.type).map((block) => <option key={block.id} value={block.id}>{(doc.edits[block.id] || metadata[block.id]).title}</option>)}</select></label><div className="builder-inspector-moves"><button type="button" disabled={["B01", "B17"].includes(active.type)} onClick={() => moveBy(selected, -1)}><BuilderIcon name="up" />Move up</button><button type="button" disabled={["B01", "B17"].includes(active.type)} onClick={() => moveBy(selected, 1)}><BuilderIcon name="down" />Move down</button></div></>}
        {activeBlock ? <><div className="builder-inspector-section"><h3>Content</h3><label className="builder-field">Heading<input value={activeBlock.title} maxLength={150} onChange={(event) => updateBlock({ title: event.target.value })}/></label><label className="builder-field">Eyebrow <small>Optional</small><input value={activeBlock.eyebrow} maxLength={100} placeholder="A short label above the heading" onChange={(event) => updateBlock({ eyebrow: event.target.value })}/></label><label className="builder-field">Text<textarea rows={5} maxLength={2500} value={activeBlock.body} placeholder="Write clearly for your customers…" onChange={(event) => updateBlock({ body: event.target.value })}/></label></div>
          {["B02", "B06", "B07", "B10", "B15"].includes(activeBlock.type) && <div className="builder-inspector-section"><h3>{activeBlock.type === "B15" ? "Questions & answers" : "Content items"} <span>{activeBlock.items.length}</span></h3>{activeBlock.items.map((item, index) => <details className="builder-item" key={index} open={index === 0}><summary>{item.title || `Item ${index + 1}`}</summary><label className="builder-field">{activeBlock.type === "B15" ? "Question" : "Title"}<input maxLength={200} value={item.title} onChange={(event) => updateBlock({ items: activeBlock.items.map((current, i) => i === index ? { ...current, title: event.target.value } : current) })}/></label><label className="builder-field">{activeBlock.type === "B15" ? "Answer" : "Description"}<textarea maxLength={1500} rows={4} value={item.text} onChange={(event) => updateBlock({ items: activeBlock.items.map((current, i) => i === index ? { ...current, text: event.target.value } : current) })}/></label><button type="button" className="builder-text-button" onClick={() => updateBlock({ items: activeBlock.items.filter((_, i) => i !== index) })}>Remove item</button></details>)}<button type="button" className="builder-outline-button" disabled={activeBlock.items.length >= 30} onClick={() => updateBlock({ items: [...activeBlock.items, { title: "", text: "" }] })}><BuilderIcon name="plus" />Add {activeBlock.type === "B15" ? "question" : "item"}</button></div>}
          {activeBlock.type === "B16" && <div className="builder-inspector-section"><h3>Links</h3>{activeBlock.links.map((link, index) => <div className="builder-item" key={index}><label className="builder-field">Label<input maxLength={120} value={link.label} onChange={(event) => updateBlock({ links: activeBlock.links.map((current, i) => i === index ? { ...current, label: event.target.value } : current) })}/></label><label className="builder-field">Destination<select value={link.href} onChange={(event) => updateBlock({ links: activeBlock.links.map((current, i) => i === index ? { ...current, href: event.target.value } : current) })}>{destinations.map((href) => <option key={href}>{href}</option>)}</select></label><button type="button" className="builder-text-button" onClick={() => updateBlock({ links: activeBlock.links.filter((_, i) => i !== index) })}>Remove link</button></div>)}<button type="button" className="builder-outline-button" disabled={activeBlock.links.length >= 12} onClick={() => updateBlock({ links: [...activeBlock.links, { label: "", href: "/services" }] })}><BuilderIcon name="plus" />Add link</button></div>}
          <div className="builder-shared-note"><BuilderIcon name="layers"/><div><strong>Shared content</strong><p>Used on {selectedMeta?.usage || 0} page(s). Saving edits updates the shared draft. Publish the block separately to update public pages.</p><a href={`/admin/blocks/${activeBlock.id}`} target="_blank" rel="noopener noreferrer">Review this shared block<BuilderIcon name="external"/></a></div></div>
        </> : <div className="builder-empty"><BuilderIcon name="grid"/><h3>Make this section yours</h3><p>Choose a matching content record or drag one here from the block library.</p><button type="button" className="builder-outline-button" onClick={() => { setLeftTab("library"); setMobileView("layers"); }}>Browse blocks</button></div>}
        {activeSlot?.rule !== "R" && active?.enabled && <button type="button" className="builder-hide-button" onClick={() => { change({ ...doc, page: hideLayer(doc.page, selected, slots) }); setNotice("Optional section hidden. Undo to restore it."); }}><BuilderIcon name="eye"/>Hide section</button>}
        <details className="builder-guidance"><summary>Template guidance</summary><p>{activeSlot?.contract}</p></details>
      </> : <><div className="builder-selection-heading"><span className="builder-selection-icon"><BuilderIcon name="settings"/></span><span><small>PAGE DETAILS</small><h2>Settings & SEO</h2></span></div><label className="builder-field">Page / SEO title<input required maxLength={150} value={doc.page.title} onChange={(event) => updatePage({ title: event.target.value })}/></label><label className="builder-field">Meta description<textarea rows={4} maxLength={320} value={doc.page.description} onChange={(event) => updatePage({ description: event.target.value })}/></label><div className="builder-search-preview"><small>SEARCH PREVIEW</small><span>Instant Cleaning Experts</span><strong>{doc.page.title || "Your page title"}</strong><p>{doc.page.description || "Add a useful description for this page."}</p></div><label className="builder-field">Page purpose<textarea rows={3} maxLength={500} value={doc.page.intent} onChange={(event) => updatePage({ intent: event.target.value })}/></label><label className="builder-field">Responsible owner<input value={doc.owner} maxLength={100} onChange={(event) => change({ ...doc, owner: event.target.value })}/></label><label className="builder-field">Source / evidence reference<textarea rows={3} maxLength={1000} value={doc.source} onChange={(event) => change({ ...doc, source: event.target.value })}/></label><div className="builder-page-info"><strong>Public URL</strong><span>{doc.page.path}</span><strong>Workflow</strong><span>Draft → review → approved → published</span><p>Save changes before moving the page forward. Shared blocks must have approved published versions.</p></div><details className="builder-activity"><summary>Revision history · {activityLog.length}</summary><ol>{[...activityLog].reverse().map((event) => <li key={event.version}><strong>#{event.version} · {event.action}</strong><span>{event.actor}</span><time dateTime={event.at}>{new Date(event.at).toLocaleString("en-AU", { timeZone: "Asia/Karachi" })} PKT</time></li>)}</ol></details></>}</fieldset></div><div className="builder-panel-footer"><BuilderIcon name={dirty ? "save" : "check"}/>{dirty ? `${editedCount ? `${editedCount} shared draft(s) changed · ` : ""}Save to keep your changes` : "Your draft is up to date"}</div></aside>}
    </div>
  </div>;
}
