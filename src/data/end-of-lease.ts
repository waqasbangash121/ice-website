// Editorial draft sourced from the user's live service page on 24 November 2026.
// Source presence is not fresh business approval of scope, policies or guarantees.
export const endOfLeaseContent = {
  status: "draft",
  source: "https://www.instantcleaningexperts.com.au/end-of-lease-cleaning-bond-cleaning/",
  scopeTopics: [
    { title: "Kitchen Surfaces", description: "Sinks, taps, benchtops, splashbacks, stovetop and rangehood. Confirm the condition and degreasing required.", icon: "/images/kitchen-cleaning.webp" },
    { title: "Oven Interior", description: "Oven walls, racks and trays. Describe any build-up so the required work can be assessed.", icon: "/images/oven-cleaning.webp" },
    { title: "Bathrooms and Laundry", description: "Sinks, showers, mirrors, tiles, taps and floors. Discuss fittings and areas needing additional attention.", icon: "/images/bathroom-cleaning.webp" },
    { title: "Booked Interior Rooms", description: "Bedrooms, lounge and dining areas, doors, skirting boards and floors. Confirm the rooms and any spot-cleaning requirements." },
    { title: "Cupboards and Drawers", description: "Internal cupboard and drawer surfaces across the property. Agree on access and preparation before the clean." },
    { title: "Interior Windows and Glass", description: "Discuss internal glass, tracks, sills and glass doors. Confirm the number of doors and any extra window work." },
  ],
  additionalTopics: [
    "Carpet steam cleaning", "Additional wall mark removal", "Blinds",
    "Balcony and garage cleaning", "Fridge and dishwasher interiors",
    "Tumble dryer cleaning", "Additional glass doors", "Heavy build-up or a deeper clean",
  ],
  faqs: [
    { question: "Is This the Same as Bond or Vacate Cleaning?", answer: "These terms commonly describe cleaning at the end of a tenancy. Tell us your handover requirements so the agreed scope can be confirmed." },
    { question: "How Is My Price Confirmed?", answer: "Your property, condition, access and requested work need to be assessed. The team confirms the scope and price before booking; this website does not currently calculate an estimate." },
    { question: "Are Additional Tasks Automatically Included?", answer: "No. Discuss carpets, additional glass, wall marks, appliances and outdoor areas when asking for a quote. The written agreed scope determines the work included." },
    { question: "Does a Quote Request Confirm a Booking?", answer: "No. The team must confirm scope, pricing and appointment availability before a booking is agreed." },
  ],
} as const;
