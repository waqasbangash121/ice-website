import type { Metadata } from "next";
import { EndOfLeasePage } from "@/components/content/service-page";
export const metadata: Metadata = {
  title: "End-of-Lease Cleaning",
  description: "Plan your end-of-lease cleaning requirements, discuss scope and extras, and prepare a quote with Instant Cleaning Experts.",
};
export default function Page() { return <EndOfLeasePage />; }
