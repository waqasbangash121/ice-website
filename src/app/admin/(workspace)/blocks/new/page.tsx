
import { requireStaff } from "@/lib/admin/auth";
import { publicLinks, readCompositions } from "@/lib/blocks/store";
import { BlockEditor } from "@/components/admin/composition-editor";
export default async function Page() {
  const staff = await requireStaff();
  const store = await readCompositions();
  return <BlockEditor creating content={{ id: "", type: "B21", title: "", eyebrow: "", body: "", items: [], links: [] }} version={0} owner={staff.username} source="" destinations={publicLinks(store)} />;
}
