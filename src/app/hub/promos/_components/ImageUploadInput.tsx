"use client";

import { useRef, useState } from "react";

type Props = {
  name: string;
  label: string;
  currentImageData?: string | null;
  clearInputName?: string;
};

export function ImageUploadInput({ name, label, currentImageData, clearInputName }: Props) {
  const [preview, setPreview] = useState<string | null>(currentImageData ?? null);
  const [cleared, setCleared] = useState(false);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const clearRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const dataUrl = await compressImage(file, 1200, 0.8);
    setPreview(dataUrl);
    setCleared(false);
    if (hiddenRef.current) hiddenRef.current.value = dataUrl;
    if (clearRef.current) clearRef.current.value = "0";
  }

  function handleClear() {
    setPreview(null);
    setCleared(true);
    if (hiddenRef.current) hiddenRef.current.value = "";
    if (clearRef.current) clearRef.current.value = "1";
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type="hidden" name={name} ref={hiddenRef} defaultValue={currentImageData ?? ""} />
      {clearInputName && (
        <input type="hidden" name={clearInputName} ref={clearRef} defaultValue={cleared ? "1" : "0"} />
      )}
      {preview && !cleared ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="preview" className="h-32 w-auto rounded border border-black/10 object-contain" />
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white text-xs hover:bg-black"
          >
            ✕
          </button>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-black/20 px-4 py-3 text-sm text-(--hub-muted) hover:border-black/40">
          <span>Click to upload image</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
      )}
    </div>
  );
}

function compressImage(file: File, maxPx: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          const ratio = Math.min(maxPx / width, maxPx / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = ev.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
