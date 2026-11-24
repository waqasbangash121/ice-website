export const propertyTypes = ["house", "apartment", "townhouse", "studio", "commercial", "other"] as const;
export const furnishingOptions = ["unfurnished", "furnished", "partly-furnished", "unsure"] as const;
export const conditionOptions = ["standard", "needs-attention", "unsure"] as const;
export const extraOptions = [
  { value: "carpets", label: "Carpet cleaning" },
  { value: "windows", label: "Windows" },
  { value: "walls", label: "Walls" },
  { value: "balcony", label: "Balcony" },
  { value: "other", label: "Other requirements" },
] as const;

export interface QuoteDetails {
  serviceId: string;
  location: string;
  property: string;
  bedrooms: string;
  bathrooms: string;
  furnished: string;
  condition: string;
  preferredDate: string;
  extras: string[];
  otherDescription: string;
  requirements: string;
}
export type QuoteErrors = Partial<Record<keyof QuoteDetails, string>>;
export interface SavedQuote {
  details: QuoteDetails;
  version: number;
  expiresAt: string;
  sourcePath: string;
  entryKey: string;
  localityId?: string;
}
export const emptyDetails: QuoteDetails = {
  serviceId: "", location: "", property: "", bedrooms: "", bathrooms: "",
  furnished: "", condition: "", preferredDate: "", extras: [],
  otherDescription: "", requirements: "",
};
export const draftLifetimeMs = 24 * 60 * 60 * 1000;

export const quoteSourcePaths = [
  "/", "/services", "/services/end-of-lease-cleaning", "/locations", "/locations/nsw",
  "/locations/nsw/suburbs/sydney", "/locations/nsw/suburbs/sydney/end-of-lease-cleaning",
  "/get-a-free-quote",
] as const;
