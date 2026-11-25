import Link from "next/link";
import { requireStaff } from "@/lib/admin/auth";
import { readCompositions } from "@/lib/blocks/store";
import { NewPageForm } from "@/components/admin/creation-forms";
export default async function Page() {
  const staff = await requireStaff();
  const store = await readCompositions();
  const templates = [...Object.values(store.templates).filter((record) => record.publishedRevision > 0).map((record) => ({ id: record.published.id, name: record.published.name, family: record.published.referenceId })), { id: "A03", name: "A03 · Service landing", family: "A03" }, { id: "A06", name: "A06 · Local service landing", family: "A06" }];
  return <><Link href="/admin/pages">← All pages</Link><header className="admin-heading"><p className="eyebrow">Page creation</p><h1>Create a page</h1><p>Choose a published template, reserve the public URL, then compose and preview its blocks.</p></header><p className="admin-notice">For a different layout, <Link href="/admin/templates/new">create and publish a template</Link> first. Publishing a page makes its URL accessible on this website; search indexing remains disabled during review.</p><div className="admin-create-layout"><section className="admin-card admin-create-form"><h2>Page details</h2><p>Set up your page, then open the visual builder.</p><NewPageForm templates={templates} owner={staff.username} /></section><aside className="admin-create-guide"><p className="eyebrow">A simple publishing flow</p><ol><li><span>01</span><div><h2>Start with a structure</h2><p>Choose a published template and a unique URL.</p></div></li><li><span>02</span><div><h2>Make it your own</h2><p>Add reusable blocks, refine the copy and preview the design.</p></div></li><li><span>03</span><div><h2>Review, then publish</h2><p>Check sources, approve the revision and make the page available.</p></div></li></ol><p>Your draft stays private until you publish it.</p></aside></div></>;
}
