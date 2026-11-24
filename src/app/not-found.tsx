import { ButtonLink, PageIntro, Section } from "@/components/ui/primitives";
export default function NotFound() {
  return <Section><PageIntro eyebrow="Page Not Found" title="Let’s Find Your Next Step"><p>We couldn’t find that page. Explore our cleaning services or return to the homepage.</p></PageIntro><div className="actions"><ButtonLink href="/services">Explore Services</ButtonLink><ButtonLink href="/" variant="secondary">Back to Home</ButtonLink></div></Section>;
}
