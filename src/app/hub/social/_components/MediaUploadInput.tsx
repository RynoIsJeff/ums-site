"use client";

import { useRef, useState } from "react";

type MediaType = "IMAGE" | "VIDEO" | "";

export function MediaUploadInput({
  defaultMediaUrl = "",
  defaultMediaType = "" as MediaType,
}: {
  defaultMediaUrl?: string;
  defaultMediaType?: MediaType;
}) {
  const [url, setUrl] = useState(defaultMediaUrl);
  const [type, setType] = useState<MediaType>(defaultMediaType);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr("");
    setUploading(true);
    setType(file.type.startsWith("video/") ? "VIDEO" : "IMAGE");

    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/hub/social/upload", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed");
      setUrl(json.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
      setType("");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function clear() {
    setUrl("");
    setType("");
    setErr("");
  }

  const isVideo = type === "VIDEO";

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Photo / Video (optional)</label>

      {/* Hidden fields submitted with form */}
      <input type="hidden" name="mediaUrl" value={url} />
      <input type="hidden" name="mediaType" value={type} />
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFile}
      />

      {url ? (
        <div className="relative overflow-hidden rounded-lg border border-(--hub-border-light)">
          {isVideo ? (
            <video src={url} controls className="w-full max-h-52 bg-black" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="media preview" className="w-full max-h-52 object-contain bg-black/5" />
          )}
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80"
            aria-label="Remove media"
          >
            ✕
          </button>
        </div>
      ) : (
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
              Add photo / video
            </>
          )}
        </button>
      )}

      {/* URL fallback */}
      <input
        type="url"
        placeholder="Or paste a public URL…"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          if (!type && e.target.value) setType("IMAGE");
        }}
        className="w-full rounded-lg border border-(--hub-border-light) px-3 py-2.5 text-sm focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary)"
      />

      {url && (
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
