import Link from "next/link";
import Image from "next/image";
import { Container, PageIntro, Section } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { QuoteLink } from "@/components/quote/quote-link";
import { LocationFinder } from "@/components/content/location-finder";
import { endOfLeaseContent } from "@/data/end-of-lease";
import { sydneyLabel } from "@/data/locations";
import type { BlockContent, PageComposition } from "@/lib/blocks/schema";
import { site } from "@/config/site";
export function ComposedServicePage({ page, blocks }: { page: PageComposition; blocks: BlockContent[] }) {
  const local = Boolean(page.localityId);
  const lease = page.serviceId === "end-of-lease-cleaning";
  const quoteLabel = lease ? "Get My End-of-Lease Quote" : "Get a Free Quote";
  const context = { serviceId: page.serviceId, location: local ? sydneyLabel : undefined, sourcePath: page.path };
  return <><div className="tinted"><Container><Breadcrumbs items={lease ? local ? [{ label: "Locations", href: "/locations" }, { label: "New South Wales", href: "/locations/nsw" }, { label: "Sydney", href: "/locations/nsw/suburbs/sydney" }, { label: page.title }] : [{ label: "Services", href: "/services" }, { label: page.title }] : [{ label: page.title }]} /></Container></div>{blocks.map((block, position) => {
    const repeated = blocks.slice(0, position).some((item) => item.type === block.type);
    const sectionId = (block.type === "B06" ? "scope" : `block-${block.type.toLowerCase()}`) + (repeated ? `-${position}` : "");
    if (block.type === "B01") return <Section className="tinted" key={`${block.id}-${position}`}><PageIntro eyebrow={block.eyebrow} title={block.title}><p>{block.body}</p>{page.serviceId && <div className="actions"><QuoteLink {...context}>{quoteLabel}</QuoteLink>{blocks.some((item) => item.type === "B06") && <Link href="#scope">Discuss the Scope</Link>}</div>}</PageIntro></Section>;
    return <Section id={sectionId} className={["B07", "B15"].includes(block.type) ? "tinted" : block.type === "B17" ? "green" : undefined} key={`${block.id}-${position}`}>
      {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}<h2>{block.title}</h2>{block.body && <p className="intro-copy block-copy">{block.body}</p>}
      {block.type === "B04" && <LocationFinder />}
      {block.type === "B15" ? <div className="faq-list">{block.items.map((item, index) => <details key={index}><summary>{item.title}</summary><p>{item.text}</p></details>)}</div>
        : block.type === "B10" ? <ol className="steps">{block.items.map((item, index) => <li key={index}><span className="step-number" aria-hidden="true">{index + 1}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></li>)}</ol>
        : block.items.length > 0 && <div className="service-grid">{block.items.map((item, index) => {
          const original = block.type === "B06" ? endOfLeaseContent.scopeTopics.find((topic) => topic.title === item.title) : undefined;
          return <article className="service-card" key={index}>{original && "icon" in original && <Image src={original.icon} alt="" width={64} height={64} className="scope-icon" />}<h3>{item.title}</h3><p className="block-copy">{item.text}</p></article>;
        })}</div>}
      {block.links.length > 0 && <ul className="block-links">{block.links.map((link) => <li key={link.href}><Link href={link.href}>{link.label}</Link></li>)}</ul>}
      {block.type === "B17" && <div className="actions"><QuoteLink {...context}>{quoteLabel}</QuoteLink><a href={site.phoneHref}>Call {site.phone}</a></div>}
    </Section>;
  })}</>;
}
