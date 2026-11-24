import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ButtonLink, Container, PageIntro, Section } from "@/components/ui/primitives";
import { QuoteLink } from "@/components/quote/quote-link";
import { endOfLeaseContent as content } from "@/data/end-of-lease";
import { sydney, sydneyLabel } from "@/data/locations";
import { localServicePath } from "@/lib/routes";

export function EndOfLeasePage({ local = false }: { local?: boolean }) {
  const localPath = localServicePath(sydney, { slug: "end-of-lease-cleaning" });
  const path = local ? localPath : "/services/end-of-lease-cleaning";
  return <>
    <div className="tinted"><Container><Breadcrumbs items={local ? [
      { label: "Locations", href: "/locations" }, { label: "New South Wales", href: "/locations/nsw" },
      { label: "Sydney", href: "/locations/nsw/suburbs/sydney" }, { label: "End-of-Lease Cleaning" },
    ] : [{ label: "Services", href: "/services" }, { label: "End-of-Lease Cleaning" }]} /></Container>
    <Section><div className="split"><PageIntro eyebrow={local ? sydneyLabel : "A Clearer Plan for Moving Day"} title={local ? "End-of-Lease Cleaning in Sydney" : "End-of-Lease Cleaning"}>
      <p>Preparing to hand back a property? Start with the rooms, condition and handover requirements that matter to your move.</p>
      <div className="actions"><QuoteLink serviceId="end-of-lease-cleaning" location={local ? sydneyLabel : undefined} sourcePath={path}>Get My End-of-Lease Quote</QuoteLink><ButtonLink href="#scope" variant="secondary">Discuss the Scope</ButtonLink></div>
      <p className="hero-note">Scope, price and availability are confirmed before booking. A clean does not guarantee a bond outcome.</p>
    </PageIntro><aside className="quote-panel"><p className="eyebrow">Before You Book</p><h2>Make the Requirements Clear</h2><ul className="plain-list"><li>Property type and number of rooms</li><li>Furnished or unfurnished condition</li><li>Access, keys and preferred date</li><li>Additional tasks you want assessed</li></ul><p>Agree on the work included, any exclusions and any extra charges before proceeding.</p></aside></div></Section></div>
    <Section id="scope"><div className="section-heading"><div><p className="eyebrow">Plan Your Scope</p><h2>Talk Through Each Part of the Property</h2></div><p>Use these areas to describe your needs. Confirm the inclusions, condition limits and any additional work in your written quote.</p></div><div className="service-grid">{content.scopeTopics.map((topic) => <article className="service-card" key={topic.title}>{"icon" in topic && <Image src={topic.icon} alt="" width={64} height={64} className="scope-icon" />}<h3>{topic.title}</h3><p>{topic.description}</p></article>)}</div></Section>
    <Section className="tinted"><div className="split"><div><p className="eyebrow">Additional Requirements</p><h2>Check What Needs Separate Assessment</h2><p className="intro-copy">Cleaning methods, material suitability, access and condition can affect the work and price. Raise these items when preparing your quote.</p></div><ul className="topic-list">{content.additionalTopics.map((topic) => <li key={topic}>{topic}</li>)}</ul></div></Section>
    {local && <Section><div className="split"><div><p className="eyebrow">Your Sydney Property</p><h2>Share the Access Details Early</h2></div><div><p>For your property in {sydneyLabel}, tell us about parking, keys, stairs or lift access, and any building access arrangements that apply.</p><p>No access arrangement is assumed from your postcode. Confirm your preferred date with the team before organising a handover around it.</p><Link href="/locations/nsw/suburbs/sydney">Explore Cleaning Services in Sydney</Link></div></div></Section>}
    <Section><div className="split"><div><p className="eyebrow">Pricing and Next Steps</p><h2>A Quote Based on Your Requirements</h2><p className="intro-copy">There is no one-size-fits-all price shown here. Describe your property and the work you need so the team can assess it.</p><p>Review the scope, exclusions and any additional tasks before agreeing to a booking.</p></div><ol className="steps">{[
      ["Describe the Property", "Choose the service, location and property details in your quote draft."],
      ["Review Your Requirements", "Check the details and add anything the team needs to assess."],
      ["Confirm Before Booking", "Scope, price and availability must be agreed with the team."],
    ].map(([title, text], index) => <li key={title}><span className="step-number" aria-hidden="true">{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></div></Section>
    <Section className="tinted"><p className="eyebrow">Your Questions</p><h2>Before Your End-of-Lease Clean</h2><div className="faq-list">{content.faqs.map((faq) => <details key={faq.question}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></Section>
    <Section className="green"><div className="section-heading"><div><p className="eyebrow">Your Next Step</p><h2>Tell Us About Your Move</h2></div><QuoteLink serviceId="end-of-lease-cleaning" location={local ? sydneyLabel : undefined} sourcePath={path}>Get My End-of-Lease Quote</QuoteLink></div>{!local && <Link href={localPath}>End-of-Lease Cleaning in Sydney</Link>}</Section>
  </>;
}
