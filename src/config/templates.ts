import type { TemplateId } from "@/types/content";

// Architecture registry, not a list of published pages.
export const templates = {
  A01: { name: "Homepage", pattern: "/" },
  A02: { name: "Service directory", pattern: "/services" },
  A03: { name: "Service landing", pattern: "/services/{service}" },
  A04: { name: "Location directory", pattern: "/locations" },
  A05: { name: "Location hub", pattern: "/locations/{state}/…" },
  A06: { name: "Local service landing", pattern: "/locations/{state}/…/{service}" },
  A07: { name: "Pricing", pattern: "/pricing; /services/{service}/prices" },
  A08: { name: "Checklist", pattern: "/services/{service}/checklist" },
  A09: { name: "Guide hub", pattern: "/guides; /guides/{service}" },
  A10: { name: "Guide article", pattern: "/guides/{service}/{guide}" },
  A11: { name: "Blog index", pattern: "/blog" },
  A12: { name: "Blog article", pattern: "/blog/{article}" },
  A13: { name: "Case study index", pattern: "/case-studies" },
  A14: { name: "Case study detail", pattern: "/case-studies/{case-study}" },
  A15: { name: "Reviews", pattern: "/reviews" },
  A16: { name: "About and partnerships", pattern: "/about; /about/partner-with-us" },
  A17: { name: "Quote journey", pattern: "/get-a-free-quote" },
  A18: { name: "Support", pattern: "/contact; /faq; /services/end-of-lease-cleaning/rectification" },
  A19: { name: "Legal and utility", pattern: "/privacy-policy; /terms-and-conditions; /accessibility; /sitemap" },
  A20: { name: "Not found", pattern: "HTTP 404" },
} as const satisfies Record<TemplateId, { name: string; pattern: string }>;
