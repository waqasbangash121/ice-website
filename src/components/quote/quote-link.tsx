import { ButtonLink } from "@/components/ui/primitives";

export function quoteHref(context: { serviceId?: string; location?: string; sourcePath?: string } = {}) {
  const params = new URLSearchParams();
  if (context.serviceId) params.set("service", context.serviceId);
  if (context.location) params.set("area", context.location);
  if (context.sourcePath) params.set("from", context.sourcePath);
  return "/get-a-free-quote" + (params.size ? "?" + params : "");
}
export function QuoteLink({ serviceId, location, sourcePath, children = "Get a Free Quote" }: {
  serviceId?: string; location?: string; sourcePath?: string; children?: React.ReactNode;
}) {
  return <ButtonLink href={quoteHref({ serviceId, location, sourcePath })}>{children}</ButtonLink>;
}
