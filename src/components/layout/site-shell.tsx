import Link from "next/link";
import type { ReactNode } from "react";
import { navigation, routes, site } from "@/config/site";
import { Brand } from "./brand";
import { MobileNavigation } from "./mobile-navigation";
import { ButtonLink, Container } from "@/components/ui/primitives";
export function SiteShell({ children }: { children: ReactNode }) {
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <div className="utility-bar"><Container><span>Cleaning Services Across Australia</span><a href={site.phoneHref}>Let’s Talk · {site.phone}</a></Container></div>
    <header className="site-header"><Container className="header-inner"><Brand /><nav className="desktop-nav" aria-label="Main navigation">{navigation.map((item) => <Link key={item.label} href={item.href}>{item.label}</Link>)}</nav><ButtonLink href={routes.quote} className="header-quote">Get a Free Quote</ButtonLink><MobileNavigation /></Container></header>
    <main id="main-content" tabIndex={-1}>{children}</main>
    <footer className="site-footer"><Container><div className="footer-grid"><div><Brand /><p>Cleaning for homes, moves and business spaces across Australia.</p></div><div><h2>Explore</h2><Link href={routes.services}>Our Services</Link><Link href="/#coverage">Service Coverage</Link><Link href="/#how-it-works">How It Works</Link></div><div><h2>Let’s Talk</h2><Link href={routes.quote}>Discuss Your Quote</Link><a href={site.phoneHref}>{site.phone}</a><p>Scope, pricing and availability are confirmed with our team.</p></div></div><div className="footer-bottom"><span>© {site.name}</span><span>Clear Scope. Considered Care.</span></div></Container></footer>
  </>;
}
