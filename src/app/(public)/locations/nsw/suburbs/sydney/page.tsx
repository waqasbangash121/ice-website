export const instant = false;
import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container, PageIntro, Section } from "@/components/ui/primitives";
import { QuoteLink } from "@/components/quote/quote-link";
import { getServices } from "@/lib/content";
import { sydneyLabel } from "@/data/locations";
export const metadata: Metadata = { title: "Cleaning Services in Sydney NSW 2000", description: "Explore cleaning services for Sydney NSW 2000. Discuss your property, access and preferred date." };
export default async function Page() {
  const services = await getServices();
  const path = "/locations/nsw/suburbs/sydney";
  return <><div className="tinted"><Container><Breadcrumbs items={[{ label: "Locations", href: "/locations" }, { label: "New South Wales", href: "/locations/nsw" }, { label: "Sydney" }]} /><PageIntro eyebrow={sydneyLabel} title="Cleaning Services in Sydney"><p>Find a service for your Sydney property, from a home clean to end-of-lease requirements and specialist surfaces.</p><div className="actions"><QuoteLink location={sydneyLabel} sourcePath={path}>Get My Sydney Quote</QuoteLink></div></PageIntro></Container></div><Section><div className="section-heading"><div><p className="eyebrow">Choose Your Service</p><h2>What Needs Attention?</h2></div><p>Your selected service and Sydney location carry into the same quote draft.</p></div><div className="service-grid">{services.map((service) => <article className="service-card" key={service.id}><h3>{service.name}</h3><p>{service.summary}</p>{service.id === "end-of-lease-cleaning" ? <Link href={path + "/end-of-lease-cleaning"}>Explore End-of-Lease Cleaning in Sydney</Link> : <QuoteLink serviceId={service.id} location={sydneyLabel} sourcePath={path}>Discuss This Service</QuoteLink>}</article>)}</div></Section><Section className="green"><div className="split"><div><p className="eyebrow">Planning Your Clean</p><h2>A Few Details Make the Next Step Easier</h2></div><div><p>Tell us about your property type, preferred date, parking, keys and any stairs or lift access that apply. Building access arrangements are assessed for your property rather than assumed from its locality.</p><p className="coverage-note">This page concerns Sydney NSW 2000. It does not imply a separate branch, local office or reserved appointment.</p><QuoteLink location={sydneyLabel} sourcePath={path}>Prepare My Quote</QuoteLink></div></div></Section></>;
}
