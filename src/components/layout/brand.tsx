import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
export function Brand() {
  return <Link href="/" aria-label={`${site.name} home`} className="brand"><Image src="/brand/ice-logo.png" alt={site.name} width={772} height={228} className="brand-image" priority /></Link>;
}
