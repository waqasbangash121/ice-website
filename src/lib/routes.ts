import type { Locality, Service } from "@/types/content";

function segment(value: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    throw new Error("Route segments must be validated lowercase slugs.");
  }
  return value;
}

export function servicePath(service: Pick<Service, "slug">) {
  return `/services/${segment(service.slug)}`;
}

// The imported register must supply a unique state-local slug (including any
// approved disambiguator). Postcodes never determine canonical identity.
export function localityPath(locality: Pick<Locality, "stateId" | "slug">) {
  return `/locations/${segment(locality.stateId)}/suburbs/${segment(locality.slug)}`;
}

export function localServicePath(locality: Pick<Locality, "stateId" | "slug">, service: Pick<Service, "slug">) {
  return `${localityPath(locality)}/${segment(service.slug)}`;
}
