import { Suspense } from "react";
import Link from "next/link";
import { authConfigured } from "@/lib/admin/auth";
async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const configured = authConfigured();
  return <main className="admin-login"><div className="admin-login-card"><p className="eyebrow">Instant Cleaning Experts</p><h1>Welcome to your Content Studio.</h1><p>Manage your services and review changes before they reach the website.</p>{!configured ? <div className="admin-notice">Staff sign-in has not been configured. Follow the local setup in docs/PHASE-3.md.</div> : <form action="/api/admin/auth" method="post">{error && <p role="alert" className="error-summary">Sign-in failed or temporarily limited. Check your details and try again later.</p>}<label className="field">Username<input name="username" autoComplete="username" required maxLength={100} /></label><label className="field">Password<input name="password" type="password" autoComplete="current-password" required maxLength={1024} /></label><button className="button button-primary" type="submit">Sign in to Content Studio</button></form>}<Link href="/">Back to website</Link></div></main>;
}
export default function Page(props: { searchParams: Promise<{ error?: string }> }) { return <Suspense fallback={<p>Loading sign-in…</p>}><Login {...props} /></Suspense>; }
