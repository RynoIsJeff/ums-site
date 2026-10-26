"use client";

import { type TextareaHTMLAttributes } from "react";

/**
 * Converts **bold** markdown markers to Unicode Mathematical Bold characters,
 * which Facebook renders as actual bold text in posts.
 */
function boldMarkdownToUnicode(text: string): string {
  return text.replace(/\*\*([\s\S]*?)\*\*/g, (_, inner: string) =>
    [...inner]
      .map((char) => {
        const c = char.codePointAt(0) ?? 0;
        if (c >= 65 && c <= 90) return String.fromCodePoint(0x1d400 + c - 65); // A–Z
        if (c >= 97 && c <= 122) return String.fromCodePoint(0x1d41a + c - 97); // a–z
        if (c >= 48 && c <= 57) return String.fromCodePoint(0x1d7ce + c - 48);  // 0–9
        return char;
      })
      .join("")
  );
}

type Props = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onPaste">;

/**
 * Drop-in textarea replacement that automatically converts **bold** markdown
 * to Unicode bold on paste, so the text appears bold on Facebook.
 */
export function CaptionTextarea(props: Props) {
  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const plain = e.clipboardData.getData("text/plain");
    if (!plain.includes("**")) return; // nothing to convert — let the browser handle it normally

    e.preventDefault();
    const converted = boldMarkdownToUnicode(plain);
    const el = e.currentTarget;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    el.value = el.value.slice(0, start) + converted + el.value.slice(end);
    el.setSelectionRange(start + converted.length, start + converted.length);
    // Notify React and any other listeners that the value changed
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }

  return <textarea {...props} onPaste={handlePaste} />;
}
