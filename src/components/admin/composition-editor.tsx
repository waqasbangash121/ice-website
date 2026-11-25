"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { blockContracts, knownLinks, supportedBlocks, supportsBlock, type BlockContent, type PageComposition, type TemplateSlot } from "@/lib/blocks/schema";
import { PagePreview } from "@/components/admin/page-preview";

export function useSave() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = new URLSearchParams();
    new FormData(form).forEach((value, key) => { if (typeof value === "string") payload.append(key, value); });
    setPending(true); setError("");
    try {
      // The workflow input named "action" shadows HTMLFormElement.action.
      const response = await fetch(form.getAttribute("action")!, { method: "POST", headers: { accept: "application/json" }, body: payload });
      if (response.status === 401) throw new Error("Your session ended. Open sign-in in another tab, then retry; your edits remain here.");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save.");
      router.replace(result.destination);
      router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to save. Your edits remain in this form."); }
    finally { setPending(false); }
  }
  return { error, pending, save };
}
export function Provenance({ owner, source }: { owner: string; source: string }) {
  return <div className="form-grid"><label className="field">Responsible owner<input name="owner" defaultValue={owner} required maxLength={100} /></label><label className="field">Source / evidence reference<textarea name="source" defaultValue={source} required maxLength={1000} rows={2} /></label></div>;
}
export function BlockEditor({ content, version, owner, source, creating = false, destinations = knownLinks }: { content: BlockContent; version: number; owner: string; source: string; creating?: boolean; destinations?: string[] }) {
  const [value, setValue] = useState(content);
  const { error, pending, save } = useSave();
  const list = ["B02", "B06", "B07", "B10", "B15"].includes(value.type);
  return <form action={`/api/admin/composition/blocks/${creating ? "new" : content.id}`} method="post" onSubmit={save}><fieldset className="admin-editor-fields" disabled={pending}><input type="hidden" name="action" value={creating ? "create" : "save"} /><input type="hidden" name="version" value={version} /><input type="hidden" name="content" value={JSON.stringify(value)} />
    {creating && <><label className="field">Block ID<input name="newId" required maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={value.id} onChange={(event) => setValue({ ...value, id: event.target.value })} placeholder="moving-preparation-intro" /></label><label className="field">Block type<select value={value.type} onChange={(event) => { if (supportsBlock(event.target.value)) setValue({ ...value, type: event.target.value, items: [], links: [] }); }}>{supportedBlocks.map((type) => <option key={type} value={type}>{type} · {blockContracts.find((block) => block.id === type)?.name}</option>)}</select></label></>}
    <label className="field">Heading<input required maxLength={150} value={value.title} onChange={(event) => setValue({ ...value, title: event.target.value })} /></label>
    <label className="field">Eyebrow (optional)<input maxLength={100} value={value.eyebrow} onChange={(event) => setValue({ ...value, eyebrow: event.target.value })} /></label>
    <label className="field">Description<textarea rows={4} maxLength={2500} value={value.body} onChange={(event) => setValue({ ...value, body: event.target.value })} /><small>Plain text. No HTML. Core qualifications belong in the visible description.</small></label>
    {list && <section className="admin-item-editor"><h3>{value.type === "B15" ? "Questions and answers" : "Content items"}</h3>{value.items.map((item, index) => <div className="admin-card" key={index}><label className="field">{value.type === "B15" ? "Question" : "Item title"} {index + 1}<input value={item.title} maxLength={200} required onChange={(event) => setValue({ ...value, items: value.items.map((current, i) => i === index ? { ...current, title: event.target.value } : current) })} /></label><label className="field">{value.type === "B15" ? "Answer" : "Description"}<textarea rows={3} maxLength={1500} required value={item.text} onChange={(event) => setValue({ ...value, items: value.items.map((current, i) => i === index ? { ...current, text: event.target.value } : current) })} /></label><button type="button" className="text-button" onClick={() => setValue({ ...value, items: value.items.filter((_, i) => i !== index) })}>Remove item {index + 1}</button></div>)}<button className="button button-secondary" type="button" disabled={value.items.length >= 30} onClick={() => setValue({ ...value, items: [...value.items, { title: "", text: "" }] })}>Add {value.type === "B15" ? "question" : "item"}</button></section>}
    {value.type === "B16" && <section><h3>Related links</h3>{value.links.map((link, index) => <div className="admin-card" key={index}><label className="field">Link label<input value={link.label} maxLength={120} required onChange={(event) => setValue({ ...value, links: value.links.map((current, i) => i === index ? { ...current, label: event.target.value } : current) })} /></label><label className="field">Destination<select value={link.href} onChange={(event) => setValue({ ...value, links: value.links.map((current, i) => i === index ? { ...current, href: event.target.value } : current) })}>{destinations.map((href) => <option key={href}>{href}</option>)}</select></label><button className="text-button" type="button" onClick={() => setValue({ ...value, links: value.links.filter((_, i) => i !== index) })}>Remove link {index + 1}</button></div>)}<button type="button" className="button button-secondary" disabled={value.links.length >= 12} onClick={() => setValue({ ...value, links: [...value.links, { label: "", href: "/services" }] })}>Add link</button></section>}
    <Provenance owner={owner} source={source} />{error && <p className="error-summary" role="alert">{error}</p>}<button className="button button-primary">{pending ? "Saving…" : "Save block draft"}</button><p className="field-hint">Save before previewing or advancing the workflow. Publishing this shared record updates every page using it.</p>
  </fieldset></form>;
}
export function PageEditor({ content, version, owner, source, blocks, slots }: { content: PageComposition; version: number; owner: string; source: string; blocks: { id: string; type: string; title: string }[]; slots: TemplateSlot[] }) {
  const [value, setValue] = useState(content);
  const { error, pending, save } = useSave();
  function move(index: number, offset: number) {
    const placements = [...value.placements];
    [placements[index], placements[index + offset]] = [placements[index + offset], placements[index]];
    setValue({ ...value, placements });
  }
  return <div className="admin-design-grid"><section className="admin-card"><form action={`/api/admin/composition/pages/${content.id}`} method="post" onSubmit={save}><fieldset className="admin-editor-fields" disabled={pending}><input type="hidden" name="action" value="save" /><input type="hidden" name="version" value={version} /><input type="hidden" name="content" value={JSON.stringify(value)} />
    <label className="field">SEO title<input required maxLength={150} value={value.title} onChange={(event) => setValue({ ...value, title: event.target.value })} /></label><label className="field">Meta description<textarea required maxLength={320} value={value.description} onChange={(event) => setValue({ ...value, description: event.target.value })} /></label><label className="field">Canonical intent<textarea required maxLength={500} value={value.intent} onChange={(event) => setValue({ ...value, intent: event.target.value })} /></label>
    <h2>Page composition</h2><p>Choose a shared record for each slot. Required slots stay visible. Move sections with the arrow buttons; keep the introduction first and conversion last.</p>
    <ol className="admin-placement-list">{value.placements.map((placement, index) => {
      const slot = slots.find((slot) => slot.id === (placement.slot || placement.type))!;
      const supported = supportsBlock(placement.type);
      return <li className="admin-card" key={placement.slot || placement.type}><div className="admin-placement-heading"><strong>{placement.type} · {blockContracts.find((block) => block.id === placement.type)?.name}</strong><span className="admin-badge">{slot.rule === "R" ? "Required" : slot.rule === "C" ? "Conditional" : "Optional"}</span></div><p className="field-hint">{slot.contract}</p>{supported ? <label className="field">Content record<select value={placement.ref} required={placement.enabled} onChange={(event) => setValue({ ...value, placements: value.placements.map((current, i) => i === index ? { ...current, ref: event.target.value } : current) })}><option value="">Choose a record</option>{blocks.filter((block) => block.type === placement.type).map((block) => <option key={block.id} value={block.id}>{block.title} ({block.id})</option>)}</select></label> : <p>Omitted: renderer and evidence workflow pending. This slot cannot be enabled.</p>}
        {slot.rule !== "R" && <label className="check-field"><input type="checkbox" checked={placement.enabled} disabled={!supported} onChange={(event) => setValue({ ...value, placements: value.placements.map((current, i) => i === index ? { ...current, enabled: event.target.checked } : current) })} />Show this block</label>}
        <div className="admin-order-actions"><button type="button" className="button button-secondary" disabled={index === 0} aria-label={`Move ${placement.type} up`} onClick={() => move(index, -1)}>↑ Up</button><button type="button" className="button button-secondary" disabled={index === value.placements.length - 1} aria-label={`Move ${placement.type} down`} onClick={() => move(index, 1)}>↓ Down</button>{placement.ref && <a href={`/admin/blocks/${placement.ref}`}>Edit shared record</a>}</div>
      </li>;
    })}</ol><Provenance owner={owner} source={source} />{error && <p className="error-summary" role="alert">{error}</p>}<button className="button button-primary">{pending ? "Saving…" : "Save page draft"}</button></fieldset></form></section><PagePreview page={value} revision={version} /></div>;
}
