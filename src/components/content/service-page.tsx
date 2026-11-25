import { ComposedServicePage } from "@/components/content/block-renderer";
import { getPublishedPage } from "@/lib/blocks/public";
export async function EndOfLeasePage({ local = false }: { local?: boolean }) {
  return <ComposedServicePage {...await getPublishedPage(local ? "lease-sydney" : "lease-national")} />;
}
