import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container, PageIntro, Section } from "@/components/ui/primitives";
import { LocationFinder } from "@/components/content/location-finder";
import { QuoteLink } from "@/components/quote/quote-link";
export const metadata: Metadata = { title: "Cleaning Service Locations", description: "Find cleaning services for your Australian locality and prepare a quote. Explore Sydney NSW 2000." };
export default function Page() {
  return <><Container><Breadcrumbs items={[{ label: "Locations" }]} /><PageIntro eyebrow="Across Australia" title="Find Cleaning for Your Area"><p>Start with your suburb or postcode. Your property requirements and appointment availability are confirmed with the team.</p></PageIntro></Container><Section className="tinted"><div className="split"><div><h2>Where Do You Need a Clean?</h2><p>Browse the locality pages currently available or enter your area when preparing a quote.</p><p>Coverage does not mean an appointment has been reserved.</p></div><LocationFinder /></div></Section><Section><p className="eyebrow">Browse Locations</p><h2>Explore New South Wales</h2><div className="service-grid"><article className="service-card"><h3>New South Wales</h3><p>Start with Sydney NSW 2000 and discuss cleaning requirements for your location.</p><Link href="/locations/nsw">Browse New South Wales</Link></article><article className="service-card"><h3>Sydney NSW 2000</h3><p>Explore the service range and end-of-lease cleaning for this locality.</p><Link href="/locations/nsw/suburbs/sydney">Explore Sydney</Link></article><article className="service-card"><h3>Another Australian Locality?</h3><p>You can prepare a quote even if your area does not have its own page yet.</p><QuoteLink sourcePath="/locations">Prepare My Quote</QuoteLink></article></div></Section></>;
}
