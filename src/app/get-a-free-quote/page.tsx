import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ButtonLink, Container, PageIntro, Section } from "@/components/ui/primitives";
import { routes, site } from "@/config/site";
export const metadata: Metadata = { title: "Discuss Your Cleaning Quote", description: "Talk to Instant Cleaning Experts about your property, cleaning requirements and quote." };
export default function QuotePage() {
  return <><Container><Breadcrumbs items={[{ label: "Get a Free Quote" }]} /></Container><Section><div className="split"><PageIntro eyebrow="Let’s Talk About Your Clean" title="Start With Your Space"><p>Call our team to discuss a cleaning quote. We’ll talk through your requirements and confirm the scope, price and availability before you book.</p></PageIntro><div className="quote-panel"><h2>What Do You Need Cleaned?</h2><p>It helps to have these details ready:</p><ul><li>The service you need and your suburb or postcode.</li><li>The type and size of your property or affected areas.</li><li>Any access requirements or particular concerns.</li><li>Your preferred date or timeframe.</li></ul><ButtonLink href={site.phoneHref}>Call {site.phone}</ButtonLink><p className="mt-6">Not sure which service fits? <a href={routes.services}>Explore our cleaning services</a>.</p></div></div></Section></>;
}
