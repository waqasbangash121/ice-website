import Link from "next/link";
import { requireStaff } from "@/lib/admin/auth";
import { listManagedServices } from "@/lib/admin/content-store";
export default async function Page() {
  await requireStaff();
  const records = await listManagedServices();
  return <><header className="admin-heading"><p className="eyebrow">Content library</p><h1>Services</h1><p>Twelve services. Stable identities. Every change reviewed before publication.</p></header><div className="admin-service-list">{records.map((record) => <article className="admin-card admin-service-row" key={record.draft.id}><div><span className={`admin-badge ${record.status}`}>{record.status}</span><h2><Link href={`/admin/services/${record.draft.id}`}>{record.draft.name}</Link></h2><p>{record.draft.summary}</p><small>{record.draft.category} · Revision {record.version}{record.published ? " · Has published content" : " · Original review-build content"}</small></div><Link className="button button-secondary" href={`/admin/services/${record.draft.id}`}>Edit service →</Link></article>)}</div></>;
}
