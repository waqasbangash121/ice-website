"use client";
import { useEffect, useRef, useState } from "react";
import type { BlockContent, PageComposition } from "@/lib/blocks/schema";
import type { BuilderBlock, BuilderCommand } from "@/lib/blocks/builder-model";
import { BuilderIcon } from "./builder-icon";

export function PagePreview({ page, revision, selectedSlot = "", draftBlocks = [], onCommand, onRecords }: { page: PageComposition; revision: number; selectedSlot?: string; draftBlocks?: BlockContent[]; onCommand?: (command: BuilderCommand) => void; onRecords?: (records: BuilderBlock[]) => void }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const latest = useRef({ page, blocks: draftBlocks, selected: selectedSlot });
  const actions = useRef(onCommand);
  const recordsReceiver = useRef(onRecords);
  const [mode, setMode] = useState<"desktop" | "mobile">("desktop");
  const [refresh, setRefresh] = useState(0);
  const [size, setSize] = useState({ width: 0, height: 650 });
  const [ready, setReady] = useState(false);
  const [signInRequired, setSignInRequired] = useState(false);
  useEffect(() => {
    latest.current = { page, blocks: draftBlocks, selected: selectedSlot };
    actions.current = onCommand;
    recordsReceiver.current = onRecords;
    frame.current?.contentWindow?.postMessage({ type: "ice-page-preview", ...latest.current }, window.location.origin);
  }, [page, draftBlocks, selectedSlot, onCommand, onRecords]);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    if (stage.current) observer.observe(stage.current);
    function receive(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === "ice-preview-ready") {
        setReady(true);
        recordsReceiver.current?.(event.data.records);
        frame.current?.contentWindow?.postMessage({ type: "ice-page-preview", ...latest.current }, window.location.origin);
      }
      if (event.data?.type === "ice-preview-action") actions.current?.(event.data.command);
    }
    window.addEventListener("message", receive);
    return () => { observer.disconnect(); window.removeEventListener("message", receive); };
  }, []);
  const width = mode === "mobile" ? 390 : 1280;
  const scale = size.width ? Math.max(0.1, Math.min(1, (size.width - 40) / width)) : 1;
  return <section className="admin-preview-panel builder-preview" aria-label="Page design preview"><div className="builder-preview-toolbar"><div className="builder-preview-label"><span className="builder-live-dot"/><h2>Live canvas</h2></div><div className="builder-device-switch" role="group" aria-label="Preview device"><button type="button" aria-label="Desktop preview" title="Desktop" aria-pressed={mode === "desktop"} onClick={() => setMode("desktop")}><BuilderIcon name="monitor"/></button><button type="button" aria-label="Mobile preview" title="Mobile" aria-pressed={mode === "mobile"} onClick={() => setMode("mobile")}><BuilderIcon name="phone"/></button></div><div className="builder-preview-tools"><span>{Math.round(scale * 100)}%</span><button type="button" className="builder-icon-button" title="Reload saved blocks" aria-label="Refresh blocks" onClick={() => { setReady(false); setSignInRequired(false); setRefresh((value) => value + 1); }}><BuilderIcon name="refresh"/></button></div></div><div className="admin-preview-stage" ref={stage}><iframe key={`${revision}-${refresh}`} ref={frame} title={`Draft design preview: ${page.id}`} src={`/admin/preview/${page.id}?embedded=1&revision=${revision}&refresh=${refresh}`} onLoad={() => setSignInRequired(frame.current?.contentWindow?.location.pathname === "/admin/login")} className="admin-preview-frame" style={{ visibility: size.width ? "visible" : "hidden", width, height: Math.max(400, (size.height - 48) / scale), transform: `scale(${scale})`, marginLeft: Math.max(0, (size.width - width * scale) / 2) }} />{(!ready || !size.width) && <div className="admin-preview-loading" role="status">{signInRequired ? <p>Your session ended. <a href="/admin/login" target="_blank" rel="noopener noreferrer">Sign in in another tab</a>, then refresh. Your edits stay here.</p> : <><span className="builder-spinner"/>Preparing your canvas…</>}</div>}</div><footer className="builder-canvas-footer"><span><BuilderIcon name="eye"/>Click a section to edit · drag its handle to reorder</span><span>{mode === "mobile" ? "Mobile" : "Desktop"} · {width}px</span></footer></section>;
}
