import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin/auth";
import { publicLinks, readCompositions, usageOf } from "@/lib/blocks/store";
import { PreviewCanvas } from "@/components/admin/preview-canvas";
type PreviewProps = { params: Promise<{ id: string }>; searchParams: Promise<{ embedded?: string }> };
async function Preview({ params, searchParams }: PreviewProps) {
  await requireStaff();
  const { id } = await params;
  const store = await readCompositions();
  if (!Object.hasOwn(store.pages, id)) notFound();
  const page = store.pages[id].draft;
  const embedded = (await searchParams).embedded === "1";
  const blocks = Object.values(store.blocks).map((record) => record.draft);
  return <>{!embedded && <div className="admin-preview-banner"><strong>Private draft preview</strong> · Saved page and shared-block drafts; not the public version. <Link href={`/admin/pages/${id}`}>Return to composer</Link></div>}<PreviewCanvas initialPage={page} blocks={blocks} embedded={embedded} destinations={publicLinks(store)} records={Object.values(store.blocks).map((block) => ({ ...block.draft, version: block.version, owner: block.owner, source: block.source, status: block.status, publishedRevision: block.publishedRevision, usage: usageOf(block.draft.id, store).length }))} /></>;
}
export default function Page(props: PreviewProps) { return <Suspense fallback={<p>Loading private preview…</p>}><Preview {...props} /></Suspense>; }
