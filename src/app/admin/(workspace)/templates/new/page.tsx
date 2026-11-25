import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin/auth";
import { readCompositions } from "@/lib/blocks/store";
import { referenceDraft, referenceSource } from "@/lib/blocks/template-catalogue";
import { TemplateEditor } from "@/components/admin/creation-forms";
export default async function Page({searchParams}:{searchParams:Promise<{reference?:string;copyFrom?:string}>}) {
  const staff=await requireStaff(); const query=await searchParams;
  let initial=referenceDraft(query.reference||""); let source=initial?referenceSource:"";
  if(query.reference&&!initial)notFound();
  if(query.copyFrom){const store=await readCompositions();if(!Object.hasOwn(store.templates,query.copyFrom))notFound();const record=store.templates[query.copyFrom];initial={...structuredClone(record.draft),id:"",name:`${record.draft.name.slice(0,140)} copy`};source=record.source;}
  initial ||= { id:"",name:"",description:"",placements:[{id:"intro",block:"B01",rule:"R",contract:"Introduce the page with one descriptive H1."},{id:"body",block:"B21",rule:"R",contract:"Answer the page's main question."}] };
  return <TemplateEditor creating initial={initial} version={0} owner={staff.username} source={source}/>;
}
