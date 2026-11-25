import Link from "next/link";
import { requireStaff } from "@/lib/admin/auth";
import { readCompositions } from "@/lib/blocks/store";
import { ContentLibrary } from "@/components/admin/content-library";
import { BuilderIcon } from "@/components/admin/builder-icon";
export default async function Page() {
  await requireStaff(); const store = await readCompositions();
  return <><header className="admin-heading admin-heading-with-action"><div><p className="eyebrow">Create, refine, publish</p><h1>Pages</h1><p>A home for every page you’re bringing to life.</p></div><Link className="button button-primary" href="/admin/pages/new"><BuilderIcon name="plus"/>Create page</Link></header><ContentLibrary noun="Pages" icon="layers" actionLabel="Edit composition" items={Object.values(store.pages).map((r) => ({ id:r.draft.id,title:r.draft.title,description:r.draft.description,status:r.status,category:r.draft.template,detail:r.draft.path,meta:`${r.draft.placements.filter((s)=>s.enabled).length} visible blocks · ${r.publishedRevision ? `Published revision ${r.publishedRevision}` : ["lease-national","lease-sydney"].includes(r.draft.id) ? "Review-build baseline" : "Not published"}`,href:`/admin/pages/${r.draft.id}`,preview:`/admin/preview/${r.draft.id}` }))}/><div className="admin-workspace-notice"><BuilderIcon name="eye"/><p>New pages stay private until published. Publish a custom template first to use it for a new page.</p></div></>;
}
