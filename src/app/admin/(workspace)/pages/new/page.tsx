import Link from "next/link";
import { requireStaff } from "@/lib/admin/auth";
import { readCompositions } from "@/lib/blocks/store";
import { NewPageForm } from "@/components/admin/creation-forms";
export default async function Page() {
  const staff = await requireStaff();
  const store = await readCompositions();
  const templates = [...Object.values(store.templates).filter((record) => record.publishedRevision > 0).map((record) => ({ id: record.published.id, name: record.published.name })), { id: "A03", name: "A03 · Service landing" }, { id: "A06", name: "A06 · Local service landing" }];
  return <><Link href="/admin/pages">← All pages</Link><header className="admin-heading"><p className="eyebrow">Page creation</p><h1>Create a page</h1><p>Choose a published template, reserve the public URL, then compose and preview its blocks.</p></header><p className="admin-notice">For a different layout, <Link href="/admin/templates/new">create and publish a template</Link> first. Publishing a page makes its URL accessible on this website; search indexing remains disabled during review.</p><section className="admin-card"><NewPageForm templates={templates} owner={staff.username} /></section></>;
}
