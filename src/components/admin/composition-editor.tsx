"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";


export function useSave() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = new URLSearchParams();
    new FormData(form).forEach((value, key) => { if (typeof value === "string") payload.append(key, value); });
    setPending(true); setError("");
    try {
      // The workflow input named "action" shadows HTMLFormElement.action.
      const response = await fetch(form.getAttribute("action")!, { method: "POST", headers: { accept: "application/json" }, body: payload });
      if (response.status === 401) throw new Error("Your session ended. Open sign-in in another tab, then retry; your edits remain here.");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save.");
      router.replace(result.destination);
      router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to save. Your edits remain in this form."); }
    finally { setPending(false); }
  }
  return { error, pending, save };
}
export function Provenance({ owner, source }: { owner: string; source: string }) {
  return <div className="form-grid"><label className="field">Responsible owner<input name="owner" defaultValue={owner} required maxLength={100} /></label><label className="field">Source / evidence reference<textarea name="source" defaultValue={source} required maxLength={1000} rows={2} /></label></div>;
}
export { VisualBlockEditor as BlockEditor } from "./resource-builder";
export { PageBuilder as PageEditor } from "./page-builder";
