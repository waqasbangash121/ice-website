"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { services } from "@/data/services";
import { site } from "@/config/site";
import {
  emptyDetails, extraOptions, type QuoteDetails, type QuoteErrors, type SavedQuote,
} from "@/lib/quote/schema";

type SaveStatus = "loading" | "saving" | "saved" | "error";
type Props = { serviceId?: string; location?: string; sourcePath: string };

export function QuoteForm({ serviceId, location, sourcePath }: Props) {
  const entryKey = serviceId || location ? [sourcePath, serviceId || "", location || ""].join("|") : "";
  const [details, setDetails] = useState<QuoteDetails>({ ...emptyDetails, extras: [] });
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<SaveStatus>("loading");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<QuoteErrors>({});
  const [expiresAt, setExpiresAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [contact, setContact] = useState({ firstName: "", lastName: "", email: "", phone: "", business: "", consent: false });
  const version = useRef(0);
  const lastSaved = useRef("");
  const queue = useRef<Promise<SavedQuote | null>>(Promise.resolve(null));
  const latest = useRef(details);
  const autosaveTimer = useRef<number | null>(null);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const errorBox = useRef<HTMLDivElement>(null);
  const isEndOfLease = details.serviceId === "end-of-lease-cleaning";

  useEffect(() => {
    let active = true;
    fetch("/api/quote-draft", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (!active) return;
        const draft = data.draft as SavedQuote | null;
        version.current = draft?.version ?? 0;
        lastSaved.current = JSON.stringify(draft?.details ?? emptyDetails);
        const next = { ...(draft?.details ?? emptyDetails) };
        const applyEntry = entryKey && draft?.entryKey !== entryKey;
        if (applyEntry && serviceId && serviceId !== next.serviceId) {
          next.serviceId = serviceId; next.extras = []; next.otherDescription = "";
          next.bedrooms = ""; next.bathrooms = ""; next.furnished = ""; next.condition = "";
        }
        if (applyEntry && location) next.location = location;
        latest.current = next;
        setDetails(next); setExpiresAt(draft?.expiresAt ?? "");
        setStatus("saved"); setLoaded(true);
      })
      .catch(() => { if (active) { setStatus("error"); setMessage("We couldn’t load your draft. Reload this page to try again, or call our team."); } });
    return () => { active = false; };
  }, [serviceId, location, entryKey]);

  const persist = useCallback((snapshot: QuoteDetails, complete = false) => {
    const task = queue.current.catch(() => null).then(async () => {
      setStatus("saving"); setMessage("");
      const response = await fetch("/api/quote-draft", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ details: snapshot, version: version.current, sourcePath, complete, entryKey }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.errors) setErrors(data.errors);
        throw new Error(data.error || "Check the highlighted details and try again.");
      }
      const draft = data.draft as SavedQuote;
      version.current = draft.version;
      lastSaved.current = JSON.stringify(snapshot);
      setExpiresAt(draft.expiresAt); setStatus("saved");
      return draft;
    });
    queue.current = task;
    return task.catch((error: Error) => {
      setStatus("error"); setMessage(error.message);
      throw error;
    });
  }, [sourcePath, entryKey]);

  useEffect(() => {
    if (!loaded || JSON.stringify(details) === lastSaved.current) return;
    autosaveTimer.current = window.setTimeout(() => { void persist(details).catch(() => {}); }, 700);
    return () => { if (autosaveTimer.current !== null) window.clearTimeout(autosaveTimer.current); };
  }, [details, loaded, persist]);

  function change<K extends keyof QuoteDetails>(key: K, value: QuoteDetails[K]) {
    const next = { ...latest.current, [key]: value };
    if (key === "serviceId") {
      next.bedrooms = ""; next.bathrooms = ""; next.furnished = ""; next.condition = "";
      next.extras = []; next.otherDescription = "";
    }
    if (key === "property" && value === "studio") next.bedrooms = "0";
    if (key === "property" && value !== "studio" && next.bedrooms === "0") next.bedrooms = "";
    if (key === "extras" && !(value as string[]).includes("other")) next.otherDescription = "";
    latest.current = next; setDetails(next); setStatus("saving");
    setErrors((previous) => key === "serviceId" ? {} : ({ ...previous, [key]: undefined, ...(key === "property" ? { bedrooms: undefined } : {}), ...(key === "extras" ? { otherDescription: undefined } : {}) }));
  }
  async function continueQuote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (autosaveTimer.current !== null) window.clearTimeout(autosaveTimer.current);
    setBusy(true); setErrors({});
    try {
      await persist(latest.current, true);
      setStep(2);
      window.requestAnimationFrame(() => stepHeading.current?.focus());
    } catch { window.requestAnimationFrame(() => errorBox.current?.focus()); }
    finally { setBusy(false); }
  }
  async function resetDraft() {
    if (autosaveTimer.current !== null) window.clearTimeout(autosaveTimer.current);
    setBusy(true); setLoaded(false);
    try {
      await queue.current.catch(() => null);
      const response = await fetch("/api/quote-draft", { method: "DELETE" });
      if (!response.ok) throw new Error();
      version.current = 0; lastSaved.current = JSON.stringify(emptyDetails);
      latest.current = { ...emptyDetails, extras: [] }; setDetails(latest.current);
      setExpiresAt(""); setErrors({}); setMessage(""); setStatus("saved"); setStep(1);
      setContact({ firstName: "", lastName: "", email: "", phone: "", business: "", consent: false });
    } catch { setMessage("We couldn’t clear the draft. Please try again."); setStatus("error"); }
    finally { setBusy(false); setLoaded(true); }
  }
  function fieldError(key: keyof QuoteDetails) {
    return errors[key] ? <span className="field-error" id={key + "-error"}>{errors[key]}</span> : null;
  }
  const errorProps = (key: keyof QuoteDetails) => ({
    "aria-invalid": errors[key] ? true as const : undefined,
    "aria-describedby": errors[key] ? key + "-error" : undefined,
  });
  const selected = services.find((service) => service.id === details.serviceId);

  return <div className="quote-layout">
    <div>
      <div className="notice" role="note"><strong>Quote Preview — No Enquiries Are Sent</strong><p>You can prepare and review your cleaning details. Online submission is currently disabled. For a quote, call <a href={site.phoneHref}>{site.phone}</a>.</p></div>
      <ol className="quote-progress" aria-label="Quote progress"><li aria-current={step === 1 ? "step" : undefined}>1. Your Clean</li><li aria-current={step === 2 ? "step" : undefined}>2. Review and Contact</li></ol>
      <p className="save-status" role="status" aria-live="polite">{status === "loading" ? "Loading your draft…" : status === "saving" ? "Saving cleaning details…" : status === "error" ? "Draft needs attention." : expiresAt ? "Cleaning details saved for up to 24 hours in this browser." : "Your new quote draft is ready."}</p>
      {message && <div ref={errorBox} className="error-summary" role="alert" tabIndex={-1}><strong>{message}</strong>{Object.entries(errors).some(([, value]) => value) && <ul>{Object.entries(errors).filter(([, value]) => value).map(([key, text]) => <li key={key}><a href={"#" + key}>{text}</a></li>)}</ul>}</div>}
      {step === 1 ? <form onSubmit={continueQuote} className="quote-form">
        <fieldset disabled={!loaded || busy}>
          <legend className="sr-only">Your cleaning requirements</legend>
          <h2>Your Cleaning Requirements</h2>
          <div className="form-grid">
            <label className="field full" htmlFor="serviceId">Cleaning Service <span>(required)</span><select id="serviceId" value={details.serviceId} onChange={(e) => change("serviceId", e.target.value)} {...errorProps("serviceId")}><option value="">Choose a service</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select>{fieldError("serviceId")}</label>
            <label className="field full" htmlFor="location">Suburb or Postcode <span>(required)</span><input id="location" maxLength={120} autoComplete="address-level2" value={details.location} onChange={(e) => change("location", e.target.value)} placeholder="For example, Sydney NSW 2000" {...errorProps("location")} />{fieldError("location")}<small>Enter any Australian locality. Coverage and appointment availability are confirmed separately.</small></label>
            <label className="field" htmlFor="property">Property Type <span>(required)</span><select id="property" value={details.property} onChange={(e) => change("property", e.target.value)} {...errorProps("property")}><option value="">Choose a property type</option><option value="house">House</option><option value="apartment">Apartment</option><option value="townhouse">Townhouse</option><option value="studio">Studio</option><option value="commercial">Commercial premises</option><option value="other">Other</option></select>{fieldError("property")}</label>
            <label className="field" htmlFor="preferredDate">Preferred Date <span>(optional)</span><input id="preferredDate" type="date" value={details.preferredDate} onChange={(e) => change("preferredDate", e.target.value)} {...errorProps("preferredDate")} />{fieldError("preferredDate")}<small>Date format follows your browser. This is a preference, not a reserved appointment.</small></label>
          </div>
          {isEndOfLease && <fieldset className="service-fields"><legend>About Your End-of-Lease Clean</legend><div className="form-grid">
            <label className="field" htmlFor="bedrooms">Bedrooms <span>(required)</span><select id="bedrooms" value={details.bedrooms} onChange={(e) => change("bedrooms", e.target.value)} disabled={details.property === "studio"} {...errorProps("bedrooms")}><option value="">Choose bedrooms</option>{Array.from({ length: 9 }, (_, n) => <option key={n} value={n}>{n === 0 ? "0 — Studio" : n}</option>)}</select>{fieldError("bedrooms")}</label>
            <label className="field" htmlFor="bathrooms">Bathrooms <span>(required)</span><select id="bathrooms" value={details.bathrooms} onChange={(e) => change("bathrooms", e.target.value)} {...errorProps("bathrooms")}><option value="">Choose bathrooms</option>{Array.from({ length: 6 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select>{fieldError("bathrooms")}</label>
            <label className="field" htmlFor="furnished">Furnishing <span>(required)</span><select id="furnished" value={details.furnished} onChange={(e) => change("furnished", e.target.value)} {...errorProps("furnished")}><option value="">Choose furnishing</option><option value="unfurnished">Unfurnished</option><option value="furnished">Furnished</option><option value="partly-furnished">Partly furnished</option><option value="unsure">Not sure</option></select>{fieldError("furnished")}</label>
            <label className="field" htmlFor="condition">Property Condition <span>(required)</span><select id="condition" value={details.condition} onChange={(e) => change("condition", e.target.value)} {...errorProps("condition")}><option value="">Choose condition</option><option value="standard">Standard cleaning needs</option><option value="needs-attention">Heavy build-up or extra attention</option><option value="unsure">Not sure — needs assessment</option></select>{fieldError("condition")}</label>
          </div><fieldset className="extras"><legend>Additional Requirements <span>(optional)</span></legend><p>Request assessment of these items. Selecting an item does not include it in an agreed price.</p>{extraOptions.map((extra) => <label className="check-field" key={extra.value}><input type="checkbox" checked={details.extras.includes(extra.value)} onChange={(e) => change("extras", e.target.checked ? [...details.extras, extra.value] : details.extras.filter((item) => item !== extra.value))} />{extra.label}</label>)}{fieldError("extras")}</fieldset>
          {details.extras.includes("other") && <label className="field" htmlFor="otherDescription">Other Requirements <span>(required when Other is selected)</span><textarea id="otherDescription" rows={3} maxLength={500} value={details.otherDescription} onChange={(e) => change("otherDescription", e.target.value)} {...errorProps("otherDescription")} />{fieldError("otherDescription")}</label>}</fieldset>}
          <label className="field" htmlFor="requirements">Anything Else We Should Know? <span>(optional)</span><textarea id="requirements" rows={4} maxLength={500} value={details.requirements} onChange={(e) => change("requirements", e.target.value)} {...errorProps("requirements")} />{fieldError("requirements")}<small>Maximum 500 characters. Please leave out names, contact details and sensitive information.</small></label>
          <div className="actions"><button className="button button-primary" type="submit">{busy ? "Saving…" : "Save and Continue"}</button></div>
        </fieldset>
      </form> : <section className="quote-form" aria-labelledby="review-heading"><h2 id="review-heading" tabIndex={-1} ref={stepHeading}>Review and Contact Details</h2><p>Your cleaning details are saved. These proposed contact fields are for review only and are not saved or transmitted.</p>
        <form onSubmit={(e) => e.preventDefault()}><div className="form-grid">
          <label className="field" htmlFor="firstName">First Name<input id="firstName" autoComplete="given-name" maxLength={80} value={contact.firstName} onChange={(e) => setContact({ ...contact, firstName: e.target.value })} /></label>
          <label className="field" htmlFor="lastName">Last Name<input id="lastName" autoComplete="family-name" maxLength={80} value={contact.lastName} onChange={(e) => setContact({ ...contact, lastName: e.target.value })} /></label>
          <label className="field" htmlFor="email">Email<input id="email" type="email" autoComplete="email" maxLength={254} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></label>
          <label className="field" htmlFor="phone">Contact Number<input id="phone" type="tel" autoComplete="tel" maxLength={30} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></label>
          <label className="field full" htmlFor="business">Business Name <span>(optional)</span><input id="business" autoComplete="organization" maxLength={160} value={contact.business} onChange={(e) => setContact({ ...contact, business: e.target.value })} /></label>
        </div><label className="check-field"><input type="checkbox" checked={contact.consent} onChange={(e) => setContact({ ...contact, consent: e.target.checked })} />I would like the team to contact me about this cleaning enquiry.</label><p className="field-hint">Proposed consent wording — no contact request is sent in this preview.</p>
        <div className="actions"><button type="button" className="button button-secondary" onClick={() => { setStep(1); setErrors({}); }}>Edit Cleaning Details</button><button className="button button-primary" type="submit" disabled aria-describedby="submission-status">Send My Quote Request</button></div><p id="submission-status" className="notice">Submission is disabled. No enquiry has been sent and no booking has been made.</p></form>
      </section>}
      <div className="draft-controls"><button type="button" className="text-button" onClick={resetDraft} disabled={busy || !loaded}>Clear Draft and Start Again</button><span>Contact fields clear on refresh. Cleaning drafts expire after 24 hours.</span></div>
    </div>
    <aside className="quote-summary" aria-labelledby="summary-heading"><p className="eyebrow">Your Quote Draft</p><h2 id="summary-heading">The Details So Far</h2><dl>
      <div><dt>Service</dt><dd>{selected?.name || "Not selected"}</dd></div><div><dt>Location</dt><dd>{details.location || "Not entered"}</dd></div><div><dt>Property</dt><dd>{details.property ? details.property.replaceAll("-", " ") : "Not selected"}</dd></div>
      {isEndOfLease && details.bedrooms && <div><dt>Bedrooms / bathrooms</dt><dd>{details.bedrooms} / {details.bathrooms || "Not selected"}</dd></div>}
      {isEndOfLease && details.furnished && <div><dt>Furnishing</dt><dd>{details.furnished.replaceAll("-", " ")}</dd></div>}
      {isEndOfLease && details.condition && <div><dt>Condition</dt><dd>{details.condition.replaceAll("-", " ")}</dd></div>}
      {details.otherDescription && <div><dt>Other requirements</dt><dd>{details.otherDescription}</dd></div>}
      {details.preferredDate && <div><dt>Preferred date</dt><dd>{details.preferredDate.split("-").reverse().join("/")}</dd></div>}
      {details.extras.length > 0 && <div><dt>Additional assessment</dt><dd>{details.extras.map((value) => extraOptions.find((extra) => extra.value === value)?.label).join(", ")}</dd></div>}
      {details.requirements && <div><dt>Your notes</dt><dd>{details.requirements}</dd></div>}
    </dl><p className="coverage-note">No price has been calculated. Final scope, price and availability must be confirmed before booking.</p><a href={site.phoneHref}>Call {site.phone}</a><Link href="/services">Explore Services</Link></aside>
  </div>;
}
