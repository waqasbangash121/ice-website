import type { Metadata } from "next";
import "./admin.css";
export const metadata: Metadata = { title: { absolute: "ICE Content Studio" }, robots: { index: false, follow: false, nocache: true } };
export default function AdminLayout({ children }: { children: React.ReactNode }) { return children; }
