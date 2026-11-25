import { quoteSourcePaths } from "@/lib/quote/schema";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container, PageIntro, Section } from "@/components/ui/primitives";
import { QuoteForm } from "@/components/quote/quote-form";
import { services } from "@/data/services";
import { sydneyLabel } from "@/data/locations";

export const metadata: Metadata = {
  title: "Prepare Your Cleaning Quote",
  description: "Prepare and review your cleaning requirements with Instant Cleaning Experts. Online submission is currently disabled.",
};
async function QuoteJourney({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const serviceId = typeof params.service === "string" && services.some((item) => item.id === params.service) ? params.service : undefined;
  const location = params.area === sydneyLabel ? sydneyLabel : undefined;
  const sourcePath = typeof params.from === "string" && quoteSourcePaths.some((path) => path === params.from) ? params.from : "/get-a-free-quote";
  return <QuoteForm key={`${serviceId}-${location}-${sourcePath}`} serviceId={serviceId} location={location} sourcePath={sourcePath} />;
}
export default function QuotePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <><Container><Breadcrumbs items={[{ label: "Get a Free Quote" }]} /><PageIntro eyebrow="Your Space. Your Requirements." title="Let’s Plan Your Clean"><p>Choose your service, describe your property and review the details. Your final scope and quote are confirmed with the team.</p></PageIntro></Container><Section className="tinted"><Suspense fallback={<p role="status">Loading your quote journey…</p>}><QuoteJourney searchParams={searchParams} /></Suspense><noscript><p>This quote preview needs JavaScript. Please call <a href="tel:1800934009">1800 934 009</a> to discuss your clean.</p></noscript></Section></>;
}
