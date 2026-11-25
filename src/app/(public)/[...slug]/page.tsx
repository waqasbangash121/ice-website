import { notFound } from "next/navigation";
import { ComposedServicePage } from "@/components/content/block-renderer";
import { getPublishedPageByPath } from "@/lib/blocks/public";
type Props = { params: Promise<{ slug: string[] }> };
// Resolve publication before sending headers so unpublished URLs return HTTP 404.
export const instant = false;
async function contentAt(params: Props["params"]) {
  const { slug } = await params;
  const content = await getPublishedPageByPath("/" + slug.join("/"));
  if (!content) notFound();
  return content;
}
export async function generateMetadata({ params }: Props) {
  const { page } = await contentAt(params);
  return { title: page.title, description: page.description };
}
export default async function Page({ params }: Props) {
  return <ComposedServicePage {...await contentAt(params)} />;
}
