"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { AICampaignDialog } from "./AICampaignDialog";
import type { CardItem } from "./PostToSocialsDialog";

type Props = {
  clientId: string;
  promoId: string;
  socialPages: { id: string; pageName: string }[];
  defaultPageId: string | null;
  items: CardItem[];
};

export function AICampaignButton({ clientId, promoId, socialPages, defaultPageId, items }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700"
      >
        <Sparkles className="h-4 w-4" />
        AI Campaign
      </button>

      <AICampaignDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        clientId={clientId}
        promoId={promoId}
        socialPages={socialPages}
        defaultPageId={defaultPageId}
        items={items}
      />
    </>
  );
}
