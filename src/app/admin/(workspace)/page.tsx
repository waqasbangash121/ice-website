import Link from "next/link";
import { requireStaff } from "@/lib/admin/auth";
import { listManagedServices } from "@/lib/admin/content-store";
import { readCompositions } from "@/lib/blocks/store";
export default async function Page() {
  await requireStaff();
  const [services, store] = await Promise.all([listManagedServices(), readCompositions()]);
  const records = [...services, ...Object.values(store.blocks), ...Object.values(store.pages)];
  return <><header className="admin-heading"><p className="eyebrow">Your workspace</p><h1>A clear view of your content.</h1><p>Keep service information useful, sourced and ready for review.</p></header><div className="admin-stats">{[["Pages", Object.keys(store.pages).length], ["Shared blocks", Object.keys(store.blocks).length], ["In review", records.filter((r) => r.status === "review").length], ["Approved", records.filter((r) => r.status === "approved").length]].map(([label, count]) => <div className="admin-card" key={label}><span>{label}</span><strong>{count}</strong></div>)}</div><section className="admin-card"><p className="eyebrow">Start here</p><h2>Reusable page content</h2><p>Compose service pages from shared blocks, preview saved drafts, and move revisions through review and approval before publication.</p><Link className="button button-primary" href="/admin/pages">Manage pages</Link></section><div className="admin-notice">Local review workspace · CRM delivery and pricing remain disabled. Publishing content here keeps the website non-indexable.</div></>;
}
