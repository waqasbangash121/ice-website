import { Suspense } from "react";
import { requireStaff } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/admin-navigation";
async function Workspace({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  return <AdminShell username={staff.username}>{children}</AdminShell>;
}
export default function Layout({ children }: { children: React.ReactNode }) { return <Suspense fallback={<div className="admin-loading"><span/>Opening your workspace…</div>}><Workspace>{children}</Workspace></Suspense>; }
