import Link from "next/link";
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return <nav aria-label="Breadcrumb" className="breadcrumbs"><ol><li><Link href="/">Home</Link></li>{items.map((item, index) => <li key={item.label}>{item.href && index < items.length - 1 ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</li>)}</ol></nav>;
}
