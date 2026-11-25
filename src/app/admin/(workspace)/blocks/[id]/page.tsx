import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin/auth";
import { readCompositions, usageOf, publicLinks } from "@/lib/blocks/store";

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
  return <>{query.error && <p className="error-summary" role="alert">{query.error}</p>}<BlockEditor key={record.version} destinations={publicLinks(store)} content={record.draft} version={record.version} owner={record.owner} source={record.source} workflow={<><section className="admin-card"><h2>Shared content impact</h2><p>Used by {uses.length} page(s). Publishing updates every referencing page.</p><ul>{uses.map((page) => <li key={page.draft.id}><Link href={`/admin/pages/${page.draft.id}`}>{page.draft.title}</Link> · <Link href={`/admin/preview/${page.draft.id}`}>Preview</Link></li>)}</ul></section><RevisionControls record={record} action={`/api/admin/composition/blocks/${id}`} /><section className="admin-card"><h2>Create a content variant</h2><p>Copy this draft into an independent record.</p><form action="/api/admin/composition/blocks/new" method="post"><input type="hidden" name="action" value="create" /><input type="hidden" name="copyFrom" value={id} /><label className="field">New block ID<input name="newId" required maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="for-example-sydney-faqs" /></label><button className="button button-secondary">Create draft variant</button></form></section></>} /></>;
}
