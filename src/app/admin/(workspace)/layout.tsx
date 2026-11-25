import { Suspense } from "react";
import Link from "next/link";
import { requireStaff } from "@/lib/admin/auth";
async function Workspace({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  return <div className="admin-shell"><a className="skip-link" href="#admin-main">Skip to workspace</a><aside className="admin-sidebar"><Link href="/admin" className="admin-brand"><span>ICE</span><strong>Content Studio</strong></Link><p className="admin-nav-label">Workspace</p><nav aria-label="Admin navigation"><Link href="/admin">Overview</Link><Link href="/admin/pages">Pages</Link><Link href="/admin/blocks">Block library</Link><Link href="/admin/templates">Templates</Link><Link href="/admin/services">Service catalogue</Link><Link href="/admin/settings">Settings &amp; status</Link></nav><div className="admin-profile"><Link href="/">View website ↗</Link><small>Signed in as {staff.username}</small><form action="/api/admin/auth" method="post"><input type="hidden" name="action" value="logout" /><button className="button button-secondary">Sign out</button></form></div></aside><main id="admin-main" className="admin-main" tabIndex={-1}>{children}</main></div>;
}
export default function Layout({ children }: { children: React.ReactNode }) { return <Suspense fallback={<p>Opening your workspace…</p>}><Workspace>{children}</Workspace></Suspense>; }
