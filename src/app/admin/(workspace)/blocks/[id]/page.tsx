import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin/auth";
import { readCompositions, usageOf, publicLinks } from "@/lib/blocks/store";
import { blockContracts } from "@/lib/blocks/schema";
import { BlockEditor } from "@/components/admin/composition-editor";
import { RevisionControls } from "@/components/admin/revision-controls";
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireStaff();
  const { id } = await params;
  const query = await searchParams;
  const store = await readCompositions();
  if (!Object.hasOwn(store.blocks, id)) notFound();
  const record = store.blocks[id];
  const uses = usageOf(id, store);
  return <><Link href="/admin/blocks">← Block library</Link><header className="admin-heading"><p className="eyebrow">Shared block · {record.draft.type}</p><h1>{record.draft.title}</h1><p>{blockContracts.find((block) => block.id === record.draft.type)?.contract}</p></header>{query.error && <p className="error-summary" role="alert">{query.error}</p>}{query.saved && <p role="status" className="admin-notice">Revision saved. Preview uses saved drafts; public pages use published content.</p>}<div className="admin-notice"><strong>Used by {uses.length} page(s).</strong> Publishing this record updates all listed pages together. Review each preview before publishing.<ul>{uses.map((page) => <li key={page.draft.id}><Link href={`/admin/pages/${page.draft.id}`}>{page.draft.title}</Link> · <Link href={`/admin/preview/${page.draft.id}`}>Preview saved drafts</Link></li>)}</ul></div><div className="admin-editor-grid"><section className="admin-card"><h2>Block content</h2><BlockEditor key={record.version} destinations={publicLinks(store)} content={record.draft} version={record.version} owner={record.owner} source={record.source} /></section><aside><RevisionControls record={record} action={`/api/admin/composition/blocks/${id}`} /><section className="admin-card"><h2>Create a content variant</h2><p>Copy this draft into an independent record, then choose it in a page composition. Existing references keep using this record.</p><form action="/api/admin/composition/blocks/new" method="post"><input type="hidden" name="action" value="create" /><input type="hidden" name="copyFrom" value={id} /><label className="field">New block ID<input name="newId" required maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="for-example-sydney-faqs" /></label><button className="button button-secondary">Create draft variant</button></form></section></aside></div></>;
}
