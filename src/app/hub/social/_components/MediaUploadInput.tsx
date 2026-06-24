"use client";

import { useRef, useState } from "react";

type MediaType = "IMAGE" | "VIDEO" | "";
const MAX_IMAGES = 10;

export function MediaUploadInput({
  defaultMediaUrls = [],
  defaultMediaType = "" as MediaType,
}: {
  defaultMediaUrls?: string[];
  defaultMediaType?: MediaType;
}) {
  const [urls, setUrls] = useState<string[]>(defaultMediaUrls);
  const [type, setType] = useState<MediaType>(defaultMediaType);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [urlInput, setUrlInput] = useState("");

  // Drag-and-drop reorder state
  const dragSrc = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const isVideo = type === "VIDEO";
  const canAddMore = !isVideo && urls.length < MAX_IMAGES;

  // ── Upload ────────────────────────────────────────────────────────────────

  async function uploadFile(file: File) {
    const detectedType: MediaType = file.type.startsWith("video/") ? "VIDEO" : "IMAGE";
    if (detectedType === "VIDEO" && urls.length > 0) { setErr("Remove existing images before adding a video."); return; }
    if (detectedType === "IMAGE" && type === "VIDEO") { setErr("Remove the video before adding images."); return; }
    if (urls.length >= MAX_IMAGES) { setErr(`Maximum ${MAX_IMAGES} images per post.`); return; }

    setErr("");
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/hub/social/upload", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed");
      setUrls((prev) => [...prev, json.url!]);
      setType(detectedType);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    files.reduce((p, f) => p.then(() => uploadFile(f)), Promise.resolve());
  }

  function removeAt(i: number) {
    setUrls((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      if (next.length === 0) setType("");
      return next;
    });
  }

  function addUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (urls.length >= MAX_IMAGES) { setErr(`Maximum ${MAX_IMAGES} images.`); return; }
    setUrls((prev) => [...prev, trimmed]);
    if (!type) setType("IMAGE");
    setUrlInput("");
    setErr("");
  }

  // ── Drag-and-drop reorder ─────────────────────────────────────────────────

  function onDragStart(i: number) {
    dragSrc.current = i;
  }

  function onDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    if (dragSrc.current !== null && dragSrc.current !== i) setDragOver(i);
  }

  function onDrop(e: React.DragEvent, i: number) {
    e.preventDefault();
    const src = dragSrc.current;
    if (src === null || src === i) { setDragOver(null); return; }
    setUrls((prev) => {
      const next = [...prev];
      const [moved] = next.splice(src, 1);
      next.splice(i, 0, moved);
      return next;
    });
    dragSrc.current = null;
    setDragOver(null);
  }

  function onDragEnd() {
    dragSrc.current = null;
    setDragOver(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Photos / Video (optional)</label>

      {/* Hidden fields submitted with form */}
      {urls.map((u, i) => <input key={i} type="hidden" name="mediaUrl" value={u} />)}
      <input type="hidden" name="mediaType" value={type} />
      <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFiles} />

      {/* Thumbnail grid */}
      {urls.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {urls.map((u, i) => (
            <div
              key={u + i}
              draggable={!isVideo && urls.length > 1}
              onDragStart={() => onDragStart(i)}
              onDragOver={(e) => onDragOver(e, i)}
              onDrop={(e) => onDrop(e, i)}
              onDragEnd={onDragEnd}
              className={[
                "relative aspect-square overflow-hidden rounded-lg border bg-black/5 transition-all",
                dragOver === i
                  ? "scale-105 border-(--primary) ring-2 ring-(--primary)/40"
                  : "border-(--hub-border-light)",
                !isVideo && urls.length > 1 ? "cursor-grab active:cursor-grabbing" : "",
              ].join(" ")}
            >
              {isVideo ? (
                <video src={u} className="h-full w-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={u} alt={`media ${i + 1}`} className="h-full w-full object-cover" draggable={false} />
              )}

              {/* Position badge */}
              {!isVideo && urls.length > 1 && (
                <span className="absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/50 text-[10px] font-medium text-white">
                  {i + 1}
                </span>
              )}

              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] text-white hover:bg-black/80"
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Add more slot */}
          {canAddMore && (
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-(--hub-border-light) text-2xl text-(--hub-muted) hover:border-(--primary)/50 hover:text-(--hub-text) disabled:opacity-50"
              aria-label="Add photo"
            >
              {uploading ? (
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : "+"}
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {urls.length === 0 && (
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-(--hub-border-light) px-4 py-3 text-sm text-(--hub-muted) transition-colors hover:border-(--primary)/50 hover:text-(--hub-text) disabled:opacity-50"
        >
          {uploading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Uploading…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Add photos / video
            </>
          )}
        </button>
      )}

      {urls.length > 0 && (
        <p className="text-xs text-(--hub-muted)">
          {isVideo ? "1 video" : `${urls.length} / ${MAX_IMAGES} photo${urls.length !== 1 ? "s" : ""}`}
          {!isVideo && urls.length > 1 && " — drag to reorder · will post as a multi-photo album"}
        </p>
      )}

      {/* URL paste fallback */}
      <div className="flex gap-2">
        <input
          type="url"
          placeholder="Or paste a public URL and press Add…"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
          className="min-w-0 flex-1 rounded-lg border border-(--hub-border-light) px-3 py-2 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
        />
        <button
          type="button"
          onClick={addUrl}
          disabled={!urlInput.trim()}
          className="shrink-0 rounded-lg border border-(--hub-border-light) px-3 py-2 text-sm hover:bg-black/5 disabled:opacity-40"
        >
          Add
        </button>
      </div>

      {urls.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-(--hub-muted)">
          <span>Type:</span>
          <label className="flex cursor-pointer items-center gap-1">
            <input type="radio" checked={type === "IMAGE"} onChange={() => setType("IMAGE")} />
            Image
          </label>
          <label className="flex cursor-pointer items-center gap-1">
            <input type="radio" checked={type === "VIDEO"} onChange={() => setType("VIDEO")} />
            Video / Reel
          </label>
        </div>
      )}

      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  );
}
