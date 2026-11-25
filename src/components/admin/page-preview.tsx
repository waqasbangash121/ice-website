"use client";
import { useEffect, useRef, useState } from "react";
import type { PageComposition } from "@/lib/blocks/schema";

export function PagePreview({ page, revision }: { page: PageComposition; revision: number }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const latest = useRef(page);
  const [mode, setMode] = useState<"desktop" | "mobile">("desktop");
  const [refresh, setRefresh] = useState(0);
  const [size, setSize] = useState({ width: 0, height: 600 });
  const [ready, setReady] = useState(false);
  const [signInRequired, setSignInRequired] = useState(false);
  useEffect(() => {
    latest.current = page;
    frame.current?.contentWindow?.postMessage({ type: "ice-page-preview", page }, window.location.origin);
  }, [page]);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    if (stage.current) observer.observe(stage.current);
    function receive(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow || event.data?.type !== "ice-preview-ready") return;
      setReady(true);
      frame.current?.contentWindow?.postMessage({ type: "ice-page-preview", page: latest.current }, window.location.origin);
    }
    window.addEventListener("message", receive);
    return () => { observer.disconnect(); window.removeEventListener("message", receive); };
  }, []);
  const width = mode === "mobile" ? 390 : 1280;
  const scale = size.width ? Math.min(1, size.width / width) : 1;
  return <aside className="admin-preview-panel" aria-label="Page design preview"><div className="admin-preview-toolbar"><div><h2>Page preview</h2><p>Unsaved composition · saved block drafts</p></div><div className="admin-preview-actions"><div role="group" aria-label="Preview device"><button type="button" aria-pressed={mode === "desktop"} onClick={() => setMode("desktop")}>Desktop</button><button type="button" aria-pressed={mode === "mobile"} onClick={() => setMode("mobile")}>Mobile</button></div><button type="button" className="button button-secondary" onClick={() => { setReady(false); setSignInRequired(false); setRefresh((value) => value + 1); }}>Refresh blocks</button></div></div><p className="field-hint admin-preview-help">{width}px viewport. Scroll inside the preview. Links stay in preview mode. Save shared-block edits before refreshing.</p><div className="admin-preview-stage" ref={stage}><iframe key={`${revision}-${refresh}`} ref={frame} title={`Draft design preview: ${page.id}`} src={`/admin/preview/${page.id}?embedded=1&revision=${revision}&refresh=${refresh}`} onLoad={() => setSignInRequired(frame.current?.contentWindow?.location.pathname === "/admin/login")} className="admin-preview-frame" style={{ width, height: size.height / scale, transform: `scale(${scale})`, marginLeft: Math.max(0, (size.width - width * scale) / 2) }} />{!ready && <div className="admin-preview-loading" role="status">{signInRequired ? <p>Your session ended. <a href="/admin/login" target="_blank" rel="noopener noreferrer">Sign in in another tab</a>, then refresh the preview. Your unsaved composition remains here.</p> : "Loading private preview…"}</div>}</div><p className="field-hint admin-preview-help">This preview does not publish changes. Invalid compositions can be previewed, but saving and publication still require validation.</p></aside>;
}
