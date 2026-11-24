import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container, PageIntro, Section } from "@/components/ui/primitives";
import { QuoteLink } from "@/components/quote/quote-link";
export const metadata: Metadata = { title: "Cleaning Services in New South Wales", description: "Explore cleaning services in New South Wales, starting with Sydney NSW 2000." };
export default function Page() {
  return <><Container><Breadcrumbs items={[{ label: "Locations", href: "/locations" }, { label: "New South Wales" }]} /><PageIntro eyebrow="New South Wales" title="Cleaning Around Your Property"><p>Explore Sydney services or tell us where in New South Wales you need cleaning. Final scope and appointment availability are confirmed individually.</p></PageIntro></Container><Section className="tinted"><div className="split"><div><h2>Start With Sydney</h2><p>Browse cleaning services for Sydney NSW 2000, including a dedicated end-of-lease cleaning page.</p><Link href="/locations/nsw/suburbs/sydney">Explore Sydney Services</Link></div><div><h2>Enquiring From Another Area?</h2><p>Enter your suburb or postcode in the shared quote draft. You do not need a locality page to describe your requirements.</p><QuoteLink sourcePath="/locations/nsw">Prepare My Quote</QuoteLink></div></div></Section></>;
}
