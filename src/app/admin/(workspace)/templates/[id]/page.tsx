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
  return <>{query.error && <p role="alert" className="error-summary">{query.error}</p>}<TemplateEditor key={record.version} initial={record.draft} version={record.version} owner={record.owner} source={record.source} locked={users.length > 0} workflow={<><Link className="button button-secondary" href={`/admin/templates/new?copyFrom=${id}`}>Duplicate layout</Link><RevisionControls record={record} action={`/api/admin/composition/templates/${id}`} /></>} /></>;
}
