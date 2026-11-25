"use client";
import { useId, useState } from "react";
import Link from "next/link";
import { QuoteLink } from "@/components/quote/quote-link";
export function LocationFinder() {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<"sydney" | "other" | null>(null);
  return <form className="location-finder" onSubmit={(event) => {
    event.preventDefault();
    const input = query.trim().toLowerCase().replace(/[,\s]+/g, " ");
    setResult(["sydney", "2000", "sydney nsw", "sydney nsw 2000", "sydney 2000"].includes(input) ? "sydney" : "other");
  }}>
    <label className="field" htmlFor={inputId}>Your Suburb or Postcode<input id={inputId} required maxLength={120} value={query} onChange={(event) => { setQuery(event.target.value); setResult(null); }} placeholder="For example, Sydney or 2000" /></label><button className="button button-primary" type="submit">Find My Area</button>
    {result && <div className="finder-result" role="status">{result === "sydney" ? <><h3>Sydney NSW 2000</h3><p>Explore services for this locality. Appointment availability is confirmed separately.</p><Link href="/locations/nsw/suburbs/sydney">Explore Sydney Services</Link></> : <><h3>Tell Us Where You Need Cleaning</h3><p>This directory currently features Sydney NSW 2000. A missing directory result does not mean your area is unserved. Enter your locality in the quote draft.</p><QuoteLink sourcePath="/locations">Prepare My Quote</QuoteLink></>}</div>}
  </form>;
}
