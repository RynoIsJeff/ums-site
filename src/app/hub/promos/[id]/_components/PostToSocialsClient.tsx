"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { PostToSocialsDialog } from "./PostToSocialsDialog";
import type { CardItem } from "./PostToSocialsDialog";

type Props = {
  clientId: string;
  socialPages: { id: string; pageName: string }[];
  defaultPageId: string | null;
  items: CardItem[];
};

export function PostToSocialsClient({ clientId, socialPages, defaultPageId, items }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-(--hub-border-light) px-3 py-2 text-sm font-medium text-(--hub-text) hover:bg-black/5"
      >
        <Share2 className="h-4 w-4" />
        Post to Socials
      </button>

      <PostToSocialsDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        clientId={clientId}
        socialPages={socialPages}
        defaultPageId={defaultPageId}
        items={items}
      />
    </>
  );
}
