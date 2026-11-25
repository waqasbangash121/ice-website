"use client";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BuilderIcon, type BuilderIconName } from "./builder-icon";
const links: { href: string; label: string; icon: BuilderIconName }[] = [
  { href: "/admin", label: "Overview", icon: "grid" }, { href: "/admin/pages", label: "Pages", icon: "layers" },
  { href: "/admin/blocks", label: "Block library", icon: "list" }, { href: "/admin/templates", label: "Templates", icon: "text" },
  { href: "/admin/services", label: "Services", icon: "location" }, { href: "/admin/settings", label: "Settings", icon: "settings" },
];
export function AdminNavigation({ username, collapsed, toggle }: { username: string; collapsed: boolean; toggle: () => void }) {
  const path = usePathname(); const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === path;
  return <aside className="admin-sidebar" data-open={open} onKeyDown={(event) => { if (event.key === "Escape" && open) { setOpenPath(null); event.currentTarget.querySelector<HTMLButtonElement>(".admin-menu-toggle")?.focus(); } }}><div className="admin-sidebar-heading"><Link href="/admin" className="admin-brand"><span>ICE</span><strong>Content Studio<small>INSTANT CLEANING EXPERTS</small></strong></Link><button type="button" className="admin-collapse-toggle" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} aria-controls="admin-navigation" onClick={toggle}><BuilderIcon name="chevron"/></button><button type="button" className="admin-menu-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="admin-navigation" onClick={() => setOpenPath(open ? null : path)}><BuilderIcon name={open ? "close" : "list"}/></button></div><div className="admin-sidebar-content" id="admin-navigation"><p className="admin-nav-label">Workspace</p><nav aria-label="Admin navigation">{links.map((link) => <Link key={link.href} href={link.href} aria-label={link.label} title={collapsed ? link.label : undefined} aria-current={(link.href === "/admin" ? path === link.href : path.startsWith(link.href)) ? "page" : undefined} onClick={() => setOpenPath(null)}><BuilderIcon name={link.icon}/><span>{link.label}</span><BuilderIcon name="chevron"/></Link>)}</nav><div className="admin-sidebar-note"><span className="admin-online-dot"/><div><strong>Review workspace</strong><small>Search indexing is disabled</small></div></div><div className="admin-profile"><Link className="admin-view-site" href="/" aria-label="View website" title={collapsed ? "View website" : undefined}><span>View website</span> <BuilderIcon name="external"/></Link><div className="admin-account" title={username}><span className="admin-avatar">{username.slice(0, 2).toUpperCase()}</span><div><strong>{username}</strong><small>Workspace operator</small></div></div><form action="/api/admin/auth" method="post"><input type="hidden" name="action" value="logout"/><button className="admin-signout" aria-label="Sign out" title={collapsed ? "Sign out" : undefined}><span>Sign out</span> <BuilderIcon name="arrow"/></button></form></div></div></aside>;
}
export function AdminTopbar() {
  const path = usePathname(); const current = links.find((link) => link.href !== "/admin" && path.startsWith(link.href));
  return <div className="admin-topbar"><div><span>Workspace</span><BuilderIcon name="chevron"/><strong>{current?.label || "Overview"}</strong></div><div><span className="admin-environment"><i/> Local review</span><Link href="/admin/pages/new" className="admin-topbar-create"><BuilderIcon name="plus"/> Create page</Link></div></div>;
}

const sidebarKey = "ice-admin-sidebar-collapsed";
function subscribeSidebar(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("ice-sidebar-change", listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener("ice-sidebar-change", listener); };
}
function sidebarSnapshot() { try { return window.localStorage.getItem(sidebarKey) === "true"; } catch { return false; } }
export function AdminShell({ username, children }: { username: string; children: ReactNode }) {
  const path = usePathname();
  const storedCollapsed = useSyncExternalStore(subscribeSidebar, sidebarSnapshot, () => false);
  const [fallbackCollapsed, setFallbackCollapsed] = useState(false);
  const collapsed = storedCollapsed || fallbackCollapsed;
  // Route identity is authoritative: hidden retained pages must not select shell CSS.
  const editor = /^\/admin\/(pages|blocks|templates)\/[^/]+$/.test(path) && path !== "/admin/pages/new";
  function toggle() {
    const next = !collapsed;
    try { window.localStorage.setItem(sidebarKey, String(next)); window.dispatchEvent(new Event("ice-sidebar-change")); setFallbackCollapsed(false); }
    catch { setFallbackCollapsed(next); }
  }
  return <div className="admin-shell" data-editor={editor} data-sidebar={collapsed ? "collapsed" : "expanded"}><a className="skip-link" href="#admin-main">Skip to workspace</a><AdminNavigation key={path} username={username} collapsed={collapsed} toggle={toggle}/><div className="admin-body"><AdminTopbar/><main id="admin-main" className="admin-main" tabIndex={-1}>{children}</main><footer className="admin-workspace-footer"><span>ICE Content Studio</span><span>Private drafts. Thoughtful publishing.</span></footer></div></div>;
}
