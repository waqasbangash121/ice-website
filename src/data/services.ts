import type { Service } from "@/types/content";
export const services = [
  { id: "house-cleaning", slug: "house-cleaning", name: "House Cleaning", category: "Home and moving", summary: "Discuss cleaning for your home and the rooms that need attention." },
  { id: "end-of-lease-cleaning", slug: "end-of-lease-cleaning", name: "End-of-Lease Cleaning", category: "Home and moving", summary: "Plan a clean around your move, property and handover requirements." },
  { id: "carpet-cleaning", slug: "carpet-cleaning", name: "Carpet Cleaning", category: "Floors and furnishings", summary: "Discuss your carpet, its condition and the areas you need cleaned." },
  { id: "upholstery-cleaning", slug: "upholstery-cleaning", name: "Upholstery Cleaning", category: "Floors and furnishings", summary: "Tell us about your furnishings and fabric care requirements." },
  { id: "window-cleaning", slug: "window-cleaning", name: "Window Cleaning", category: "Property and specialist", summary: "Discuss your windows, access and cleaning requirements." },
  { id: "end-of-construction-cleaning", slug: "end-of-construction-cleaning", name: "End-of-Construction Cleaning", category: "Property and specialist", summary: "Plan cleaning for a property following building or renovation work." },
  { id: "tile-grout-cleaning", slug: "tile-grout-cleaning", name: "Tile and Grout Cleaning", category: "Floors and furnishings", summary: "Discuss tiled surfaces, grout condition and the areas to be assessed." },
  { id: "hardwood-floor-cleaning", slug: "hardwood-floor-cleaning", name: "Hardwood Floor Cleaning", category: "Floors and furnishings", summary: "Talk through your timber flooring and its care requirements." },
  { id: "commercial-floor-cleaning", slug: "commercial-floor-cleaning", name: "Commercial Floor Cleaning", category: "Floors and furnishings", summary: "Discuss flooring, access and cleaning needs at your business premises." },
  { id: "pressure-washing", slug: "pressure-washing", name: "Pressure Washing", category: "Property and specialist", summary: "Discuss outdoor surfaces and suitability for pressure washing." },
  { id: "disinfection-sanitisation", slug: "disinfection-sanitisation", name: "Disinfection and Sanitisation", category: "Property and specialist", summary: "Tell us about the space and the treatment you are seeking." },
  { id: "pet-urine-removal", slug: "pet-urine-removal", name: "Pet Urine and Odour Treatment", category: "Property and specialist", summary: "Discuss affected materials, odour concerns and assessment needs." },
] as const satisfies readonly Service[];
export type ServiceId = (typeof services)[number]["id"];
