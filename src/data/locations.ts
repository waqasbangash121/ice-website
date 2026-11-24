import type { Locality } from "@/types/content";

// Planning example supplied in the architecture. Not an imported official register.
// Keep this source ID distinct from future authoritative register IDs.
export const sydney = {
  id: "planning-sydney-nsw",
  name: "Sydney",
  slug: "sydney",
  stateId: "nsw",
  postcodes: ["2000"],
  regionIds: [],
  sourceReference: "Architecture revision 3 and live ICE locations/contact pages reviewed 24 November 2026; awaiting official register reconciliation.",
} as const satisfies Locality;

export const sydneyLabel = "Sydney NSW 2000";
