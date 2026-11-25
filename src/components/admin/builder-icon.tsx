export type BuilderIconName = "layers" | "grid" | "settings" | "grip" | "undo" | "redo" | "save" | "plus" | "arrow" | "chevron" | "text" | "list" | "help" | "link" | "location" | "check" | "eye" | "close" | "monitor" | "phone" | "refresh" | "external" | "up" | "down" | "search";
const paths: Record<BuilderIconName, React.ReactNode> = {
  layers: <><path d="m3 7 9-5 9 5-9 5-9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  settings: <><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="currentColor"/><circle cx="16" cy="12" r="2" fill="currentColor"/><circle cx="8" cy="18" r="2" fill="currentColor"/></>,
  grip: <>{[7,12,17].flatMap((y) => [9,15].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1" fill="currentColor" stroke="none"/>))}</>,
  undo: <><path d="m8 4-5 5 5 5M3 9h10a7 7 0 0 1 0 14"/></>, redo: <><path d="m16 4 5 5-5 5M21 9H11a7 7 0 0 0 0 14"/></>,
  save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12l4 4v12a2 2 0 0 1-2 2Z"/><path d="M7 3v6h10V3M7 21v-8h10v8"/></>,
  plus: <path d="M12 5v14M5 12h14"/>, arrow: <path d="m10 5-7 7 7 7M3 12h18"/>, chevron: <path d="m9 5 7 7-7 7"/>,
  text: <><path d="M4 5h16M12 5v15M8 20h8"/></>, list: <><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 5 2c-2 1-2 2-2 3M12 17h.01"/></>,
  link: <><path d="m10 13 4-4M8 15l-2 2a4 4 0 0 1-5-5l5-5a4 4 0 0 1 6 0M16 9l2-2a4 4 0 0 1 5 5l-5 5a4 4 0 0 1-6 0"/></>,
  location: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  check: <path d="m5 12 4 4L20 5"/>, eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  close: <path d="m6 6 12 12M6 18 18 6"/>, monitor: <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>,
  phone: <><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/></>, refresh: <><path d="M20 7a9 9 0 1 0 1 9M20 2v6h-6"/></>,
  external: <><path d="M14 3h7v7M21 3l-10 10M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/></>,
  up: <path d="m5 15 7-7 7 7"/>, down: <path d="m5 9 7 7 7-7"/>, search: <><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></>,
};
export function BuilderIcon({ name }: { name: BuilderIconName }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>; }
