"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { navigation, routes, site } from "@/config/site";
export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    function dismiss(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    }
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [open]);
  return <div className="mobile-navigation" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <button ref={trigger} type="button" className="menu-trigger" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}<span aria-hidden="true">{open ? "−" : "+"}</span></button>
    <div id="mobile-menu" className="mobile-panel" hidden={!open}>
      <nav aria-label="Mobile navigation">{navigation.map((item) => <Link key={item.label} href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>)}<Link href={routes.quote} className="button button-primary" onClick={() => setOpen(false)}>Get a Free Quote</Link><a href={site.phoneHref}>Call {site.phone}</a></nav>
    </div>
  </div>;
}
