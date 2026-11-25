import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin/auth";
import { readCompositions } from "@/lib/blocks/store";
import { slotsFor } from "@/lib/blocks/schema";
import { PageEditor } from "@/components/admin/composition-editor";
import { RevisionControls } from "@/components/admin/revision-controls";
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireStaff();
  const { id } = await params;
  const query = await searchParams;
  const store = await readCompositions();
  if (!Object.hasOwn(store.pages, id)) notFound();
  const record = store.pages[id];
  const baseline = ["lease-national", "lease-sydney"].includes(id);
  return <><Link href="/admin/pages">← All pages</Link><header className="admin-heading"><p className="eyebrow">{record.draft.template} · Page composer</p><h1>{record.draft.title}</h1><p>{record.draft.path}</p><div className="actions"><Link className="button button-secondary" href={`/admin/preview/${id}`}>Preview saved drafts</Link>{record.publishedRevision > 0 || baseline ? <Link href={record.published.path}>View public version</Link> : <span>Not published yet</span>}</div></header>{query.error && <p className="error-summary" role="alert">{query.error}</p>}{query.saved && <p role="status" className="admin-notice">Revision saved. Public pages change only when a page or referenced shared block is published.</p>}<div className="admin-notice">{record.publishedRevision > 0 ? "The last published revision is available at this URL. Draft edits stay private." : baseline ? "Review-build baseline content remains available." : "This page stays private until publication."} Before approving a page, every enabled shared block must have a published approved revision. A shared-block publication after page approval requires a fresh page review.</div><PageEditor key={record.version} slots={slotsFor(record.draft.template, store.templates)} content={record.draft} version={record.version} owner={record.owner} source={record.source} blocks={Object.values(store.blocks).map((block) => ({ id: block.draft.id, type: block.draft.type, title: block.draft.title }))} /><RevisionControls record={record} action={`/api/admin/composition/pages/${id}`} /></>;
}
