import type { Metadata } from "next";
import { EndOfLeasePage } from "@/components/content/service-page";
export const metadata: Metadata = {
  title: "End-of-Lease Cleaning in Sydney",
  description: "Discuss your Sydney NSW 2000 property, access and handover requirements for an end-of-lease cleaning quote.",
};
export default function Page() { return <EndOfLeasePage local />; }
