import { endOfLeaseContent } from "@/data/end-of-lease";
import { sydney } from "@/data/locations";
import { templateContracts, type BlockContent, type CompositionStore, type PageComposition, type Revision, type SupportedBlock } from "./schema";
const serviceId = "end-of-lease-cleaning";
function revision<T>(draft: T): Revision<T> { return { draft, published: structuredClone(draft), publishedRevision: 0, status: "draft", version: 0, owner: "", source: "docs/SOURCE-INVENTORY.md; existing Phase 2 review content", history: [] }; }
function block(id: string, type: SupportedBlock, title: string, body: string, items: BlockContent["items"] = [], links: BlockContent["links"] = [], eyebrow = ""): BlockContent {
  return { id, type, title, eyebrow, body, items, links };
}
export function seedCompositions(): CompositionStore {
  const national = "/services/end-of-lease-cleaning";
  const local = "/locations/nsw/suburbs/sydney/end-of-lease-cleaning";
  const blocks = [
    block("lease-introduction", "B01", "End-of-Lease Cleaning", "Preparing to hand back a property? Start with the rooms, condition and handover requirements that matter to your move.", [], [], "A Clearer Plan for Moving Day"),
    block("sydney-lease-introduction", "B01", "End-of-Lease Cleaning in Sydney", "Preparing to hand back your Sydney property? Start with the rooms, condition and handover requirements that matter to your move.", [], [], "Sydney NSW 2000"),
    block("lease-key-facts", "B02", "Make the Requirements Clear", "Scope, price and availability are confirmed before booking. A clean does not guarantee a bond outcome.", [
      { title: "Property", text: "Property type, number of rooms and furnished or unfurnished condition." },
      { title: "Access", text: "Access, keys, preferred date and additional tasks you want assessed." },
    ], [], "Before You Book"),
    block("lease-scope", "B06", "Talk Through Each Part of the Property", "Use these areas to describe your needs. Confirm the inclusions, exclusions, condition limits and any additional work in your written quote. These topics do not automatically define your booked scope.", endOfLeaseContent.scopeTopics.map((item) => ({ title: item.title, text: item.description })), [], "Plan Your Scope"),
    block("lease-extras", "B07", "Check What Needs Separate Assessment", "Cleaning methods, material suitability, access and condition can affect the work and price. Raise these items when preparing your quote.", endOfLeaseContent.additionalTopics.map((title) => ({ title, text: "Discuss suitability and any additional charge before agreeing the work." })), [], "Additional Requirements"),
    block("lease-pricing", "B08", "A Quote Based on Your Requirements", "There is no one-size-fits-all price shown here. Describe your property and the work you need so the team can assess it. Review the scope, exclusions and any additional tasks before agreeing to a booking.", [], [], "Pricing and Cost Factors"),
    block("lease-process", "B10", "Confirm the Next Steps", "", [
      { title: "Describe the Property", text: "Choose the service, location and property details in your quote draft." },
      { title: "Review Your Requirements", text: "Check the details and add anything the team needs to assess." },
      { title: "Confirm Before Booking", text: "Scope, price and availability must be agreed with the team." },
    ]),
    block("lease-faqs", "B15", "Before Your End-of-Lease Clean", "", endOfLeaseContent.faqs.map((faq) => ({ title: faq.question, text: faq.answer })), [], "Your Questions"),
    block("lease-locality-finder", "B04", "Find Your Location", "Select a locality to explore published coverage. Coverage is separate from appointment availability."),
    block("lease-related", "B16", "Explore Your Next Step", "", [], [{ label: "End-of-Lease Cleaning in Sydney", href: local }, { label: "All cleaning services", href: "/services" }]),
    block("sydney-lease-related", "B16", "Explore Your Next Step", "", [], [{ label: "National end-of-lease service", href: national }, { label: "Cleaning services in Sydney", href: "/locations/nsw/suburbs/sydney" }]),
    block("lease-handoff", "B17", "Tell Us About Your Move", "Scope, pricing and appointment availability are confirmed with our team.", [], [], "Your Next Step"),
    block("sydney-access", "B40", "Share the Access Details Early", "For your property in Sydney NSW 2000, tell us about parking, keys, stairs or lift access, and any building access arrangements that apply. No access arrangement is assumed from your postcode. Confirm your preferred date with the team before organising a handover around it.", [], [], "Your Sydney Property"),
  ];
  function page(id: string, template: "A03" | "A06", localPage: boolean): PageComposition {
    const refs: Record<string, string> = { B01: localPage ? "sydney-lease-introduction" : "lease-introduction", B02: "lease-key-facts", B04: "lease-locality-finder", B06: "lease-scope", B07: "lease-extras", B08: "lease-pricing", B10: "lease-process", B15: "lease-faqs", B16: localPage ? "sydney-lease-related" : "lease-related", B17: "lease-handoff", B40: "sydney-access" };
    return { id, template, path: localPage ? local : national, serviceId, ...(localPage ? { localityId: sydney.id } : {}), title: localPage ? "End-of-Lease Cleaning in Sydney" : "End-of-Lease Cleaning", description: localPage ? "Discuss your Sydney NSW 2000 property, access and handover requirements for an end-of-lease cleaning quote." : "Plan your end-of-lease cleaning requirements, discuss scope and extras, and prepare a quote with Instant Cleaning Experts.", intent: localPage ? "Help Sydney customers plan an end-of-lease clean and describe their property access requirements." : "Help customers understand end-of-lease scope and prepare a service-aware quote.", placements: templateContracts.find((t) => t.id === template)!.placements.map((slot) => ({ type: slot.block, ref: refs[slot.block] || "", enabled: Boolean(refs[slot.block]) })) };
  }
  return { schemaVersion: 2, templates: {}, blocks: Object.fromEntries(blocks.map((item) => [item.id, revision(item)])), pages: Object.fromEntries([page("lease-national", "A03", false), page("lease-sydney", "A06", true)].map((item) => [item.id, revision(item)])) };
}
