"use client";

import { PendingSubmitButton } from "@/app/hub/_components/PendingSubmitButton";

type Props = { token: string; amountFormatted: string };

export function PortalPayForm({ token, amountFormatted }: Props) {
  return (
    <form action="/api/portal/pay" method="POST">
      <input type="hidden" name="token" value={token} />
      <PendingSubmitButton className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700">
        Pay R {amountFormatted} with card or EFT
      </PendingSubmitButton>
    </form>
  );
}
