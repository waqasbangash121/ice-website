import Link from "next/link";
import { requireStaff } from "@/lib/admin/auth";
import { TemplateEditor } from "@/components/admin/creation-forms";
export default async function Page() {
  const staff = await requireStaff();
  return <><Link href="/admin/templates">← Templates</Link><header className="admin-heading"><p className="eyebrow">Page structure</p><h1>Create a template</h1><p>Define reusable slots, default order and required content. Publish the template to make it available when creating a page.</p></header><section className="admin-card"><TemplateEditor creating initial={{ id: "", name: "", description: "", placements: [{ id: "intro", block: "B01", rule: "R", contract: "Introduce the page with one descriptive H1." }, { id: "body", block: "B21", rule: "R", contract: "Answer the page's main question." }] }} version={0} owner={staff.username} source="" /></section></>;
}
