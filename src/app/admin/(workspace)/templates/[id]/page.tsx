import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin/auth";
import { readCompositions } from "@/lib/blocks/store";
import { TemplateEditor } from "@/components/admin/creation-forms";
import { RevisionControls } from "@/components/admin/revision-controls";
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireStaff();
  const { id } = await params;
  const query = await searchParams;
  const store = await readCompositions();
  if (!Object.hasOwn(store.templates, id)) notFound();
  const record = store.templates[id];
  const users = Object.values(store.pages).filter((page) => page.draft.template === id || page.published.template === id);
  return <><Link href="/admin/templates">← Templates</Link><header className="admin-heading"><p className="eyebrow">Custom template</p><h1>{record.draft.name}</h1><p>{users.length} page(s) use this structure.</p></header>{query.error && <p role="alert" className="error-summary">{query.error}</p>}{query.saved && <p role="status" className="admin-notice">Template revision saved. Publish it to make it available for page creation.</p>}<div className="admin-editor-grid"><section className="admin-card"><TemplateEditor key={record.version} initial={record.draft} version={record.version} owner={record.owner} source={record.source} locked={users.length > 0} /></section><RevisionControls record={record} action={`/api/admin/composition/templates/${id}`} /></div></>;
}
