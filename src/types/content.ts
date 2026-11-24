export type PublicationStatus = "draft" | "review" | "approved" | "published";
export type TemplateId = `A${"01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20"}`;
export interface Service {
  id: string;
  slug: string;
  name: string;
  category: "Home and moving" | "Floors and furnishings" | "Property and specialist";
  summary: string;
}
export interface EditorialRecord {
  id: string;
  status: PublicationStatus;
  owner: string;
  sourceReferences: string[];
  approvedAt?: string;
  reviewedAt?: string;
}
export interface Locality {
  id: string;
  name: string;
  slug: string;
  stateId: string;
  postcodes: string[];
  regionIds: string[];
  sourceReference: string;
}
export interface ContentPage extends EditorialRecord {
  template: TemplateId;
  canonicalPath: string;
  title: string;
  description: string;
  serviceId?: string;
  localityId?: string;
  intent: string;
}
export interface ServiceScope extends EditorialRecord {
  serviceId: string;
  version: string;
  inclusions: string[];
  exclusions: string[];
  extras: string[];
  assessmentConditions: string[];
}
export interface EvidenceRecord extends EditorialRecord {
  kind: "case-study" | "review" | "credential" | "media";
  serviceIds: string[];
  localityId?: string;
  publicationConsentReference?: string;
}
export interface PriceSchedule extends EditorialRecord {
  serviceId: string;
  version: string;
  currency: "AUD";
  taxPresentation: "inclusive" | "exclusive";
  effectiveFrom: string;
  rulesReference: string;
}
// Personal details and authoritative prices must stay in server-validated records.
export interface QuoteDraft {
  id: string;
  serviceId?: string;
  localityId?: string;
  sourcePath: string;
  expiresAt: string;
  estimate?: { pricingVersion: string; minimum: number; maximum: number };
}
