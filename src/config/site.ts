export const site = {
  name: "Instant Cleaning Experts",
  phone: "1800 934 009",
  phoneHref: "tel:1800934009",
  description: "Explore cleaning services across Australia with Instant Cleaning Experts. Discuss your property, cleaning requirements and quote with our team.",
} as const;
export const routes = { home: "/", services: "/services", quote: "/get-a-free-quote" } as const;
// Add destinations only when their pages exist.
export const navigation = [
  { label: "Services", href: routes.services },
  { label: "Locations", href: "/#coverage" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About", href: "/#about" },
] as const;
