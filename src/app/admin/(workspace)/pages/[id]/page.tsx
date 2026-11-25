import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin/auth";
import { publicLinks, readCompositions, usageOf } from "@/lib/blocks/store";
import { slotsFor } from "@/lib/blocks/schema";
import { PageBuilder } from "@/components/admin/page-builder";
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  const staff = await requireStaff();
  const { id } = await params;
  const query = await searchParams;
  const store = await readCompositions();
  if (!Object.hasOwn(store.pages, id)) notFound();
  const record = store.pages[id];
  return <PageBuilder key={id} slots={slotsFor(record.draft.template, store.templates)} content={record.draft} version={record.version} status={record.status} publishedRevision={record.publishedRevision} owner={record.owner} source={record.source} actor={staff.username} destinations={publicLinks(store)} initialError={query.error} activity={record.history} blocks={Object.values(store.blocks).map((block) => ({ ...block.draft, version: block.version, owner: block.owner, source: block.source, status: block.status, publishedRevision: block.publishedRevision, usage: usageOf(block.draft.id, store).length }))} />;
}
