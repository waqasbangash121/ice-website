import Link from "next/link";
import { requireStaff } from "@/lib/admin/auth";
import { publicLinks, readCompositions } from "@/lib/blocks/store";
import { BlockEditor } from "@/components/admin/composition-editor";
export default async function Page() {
  const staff = await requireStaff();
  const store = await readCompositions();
  return <><Link href="/admin/blocks">← Block library</Link><header className="admin-heading"><p className="eyebrow">Reusable content</p><h1>Create a block</h1><p>Choose a supported structure and enter your content. The new record stays private until approved and published.</p></header><section className="admin-card"><BlockEditor creating content={{ id: "", type: "B21", title: "", eyebrow: "", body: "", items: [], links: [] }} version={0} owner={staff.username} source="" destinations={publicLinks(store)} /></section></>;
}
