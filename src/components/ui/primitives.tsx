import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`container ${className}`}>{children}</div>;
}
export function Section({ children, className = "", ...props }: ComponentProps<"section">) {
  return <section className={`section ${className}`} {...props}><Container>{children}</Container></section>;
}
export function ButtonLink({ children, className = "", variant = "primary", ...props }: ComponentProps<typeof Link> & { variant?: "primary" | "secondary" }) {
  return <Link className={`button button-${variant} ${className}`} {...props}>{children}</Link>;
}
export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <div className="page-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><div className="intro-copy">{children}</div></div>;
}
