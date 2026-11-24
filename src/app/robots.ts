import type { MetadataRoute } from "next";
// Development-only foundation. Revisit together with page approvals in Phase 6.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
