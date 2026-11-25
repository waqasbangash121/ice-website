import { requireStaff } from "@/lib/admin/auth";
import { listManagedServices } from "@/lib/admin/content-store";
import { ContentLibrary } from "@/components/admin/content-library";
export default async function Page() {
  await requireStaff(); const records = await listManagedServices();
  return <><header className="admin-heading"><p className="eyebrow">Your service offering</p><h1>Service catalogue</h1><p>Twelve services. Stable identities. Every change reviewed before publication.</p></header><ContentLibrary noun="Services" icon="location" actionLabel="Edit service" items={records.map((r)=>({id:r.draft.id,title:r.draft.name,description:r.draft.summary,status:r.status,category:r.draft.category,detail:`/services/${r.draft.slug}`,meta:`Revision ${r.version} · ${r.published ? "Has published content" : "Original review-build content"}`,href:`/admin/services/${r.draft.id}`}))}/></>;
}
