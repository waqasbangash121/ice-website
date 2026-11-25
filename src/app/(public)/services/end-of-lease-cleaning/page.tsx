import { EndOfLeasePage } from "@/components/content/service-page";
import { getPublishedPage } from "@/lib/blocks/public";
export const instant = false;
export async function generateMetadata() {
  const { page } = await getPublishedPage("lease-national");
  return { title: page.title, description: page.description };
}
export default function Page() { return <EndOfLeasePage />; }
