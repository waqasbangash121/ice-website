import { services } from "@/data/services";
// Public content boundary; replace storage here when the CMS is introduced.
export function getServices() { return services; }
export function getServiceById(id: string) { return services.find((service) => service.id === id); }
