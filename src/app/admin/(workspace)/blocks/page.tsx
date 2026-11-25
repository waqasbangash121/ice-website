import Link from "next/link";
import { requireStaff } from "@/lib/admin/auth";
import { readCompositions, usageOf } from "@/lib/blocks/store";
import { blockContracts, supportsBlock } from "@/lib/blocks/schema";
import { ContentLibrary } from "@/components/admin/content-library";
import { BuilderIcon } from "@/components/admin/builder-icon";
export default async function Page() {
  await requireStaff(); const store = await readCompositions();
  return <><header className="admin-heading admin-heading-with-action"><div><p className="eyebrow">Small pieces, endless possibilities</p><h1>Block library</h1><p>Create reusable content and keep every connected page in sync.</p></div><Link className="button button-primary" href="/admin/blocks/new"><BuilderIcon name="plus"/>Create block</Link></header><ContentLibrary noun="Blocks" icon="grid" items={Object.values(store.blocks).map((r)=>({id:r.draft.id,title:r.draft.title,description:r.draft.body || blockContracts.find((b)=>b.id===r.draft.type)?.name || "Reusable content section",status:r.status,category:r.draft.type,detail:`Used by ${usageOf(r.draft.id,store).length} page(s)`,meta:`${r.draft.id} · Revision ${r.version}`,href:`/admin/blocks/${r.draft.id}`}))}/><div className="admin-workspace-notice"><BuilderIcon name="link"/><p>Publishing a shared block updates every page that uses it. Save a variant when you need independent content.</p></div><details className="admin-reference-panel"><summary><span><BuilderIcon name="list"/>Block architecture reference</span><small>44 original contracts</small></summary><div><p>Supported types have an editor and renderer. Planned types remain unavailable for publication.</p>{blockContracts.map((block)=><details key={block.id} className="admin-contract"><summary>{block.id} · {block.name} <span className="admin-badge">{supportsBlock(block.id)?"Implemented":block.id.startsWith("G")?"Shared shell":"Planned"}</span></summary><p>{block.contract}</p></details>)}</div></details></>;
}
