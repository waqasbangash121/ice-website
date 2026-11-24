import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ButtonLink, Container, PageIntro, Section } from "@/components/ui/primitives";
import { getServices } from "@/lib/content";
import { routes } from "@/config/site";
export const metadata: Metadata = { title: "Our Cleaning Services", description: "Explore home, moving, floor and specialist cleaning services from Instant Cleaning Experts." };
export default function ServicesPage() {
  const services = getServices();
  const categories = [...new Set(services.map((service) => service.category))];
  return <><Container><Breadcrumbs items={[{ label: "Services" }]} /><PageIntro eyebrow="Our Services" title="Cleaning for the Space You Care About"><p>Find the service closest to your needs. Our team will discuss the property, suitability and agreed scope with you.</p></PageIntro></Container><Section className="tinted">{categories.map((category) => <section key={category} className="service-group" aria-label={category}><h2>{category}</h2><div className="service-grid">{services.filter((service) => service.category === category).map((service) => <article className="service-card" id={service.id} key={service.id}><h3>{service.name}</h3><p>{service.summary}</p><ButtonLink href={routes.quote} variant="secondary">Discuss My Clean</ButtonLink></article>)}</div></section>)}</Section></>;
}
