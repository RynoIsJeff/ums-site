"use client";

import { useState } from "react";
import { Shield, KeyRound } from "lucide-react";
import { enableTwoFactor, confirmTwoFactor, disableTwoFactor } from "../actions";
import QRCode from "qrcode";

type Props = {
  twoFactorEnabled: boolean;
};

export function TwoFactorForm({ twoFactorEnabled }: Props) {
  const [step, setStep] = useState<"idle" | "setup" | "confirm">("idle");
  const [secret, setSecret] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEnable = async () => {
    setError(null);
    const r = await enableTwoFactor({}, new FormData());
    if (r.error) setError(r.error);
    else if (r.secret && r.qrUri) {
      setSecret(r.secret);
      const url = await QRCode.toDataURL(r.qrUri, { width: 200 });
      setQrDataUrl(url);
      setStep("setup");
    }
  };

  const handleConfirm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const token = (form.elements.namedItem("token") as HTMLInputElement)?.value;
    if (!token || !secret) return;
    const r = await confirmTwoFactor(secret, token);
    if (r.error) setError(r.error);
    else {
      setStep("idle");
      setSecret(null);
      setQrDataUrl(null);
      window.location.reload();
    }
  };

  const handleDisable = async () => {
    if (!confirm("Disable two-factor authentication?")) return;
    setError(null);
    await disableTwoFactor();
    window.location.reload();
  };

  return (
    <div className="rounded-xl border border-(--hub-border-light) bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--primary)/10">
          <Shield className="h-5 w-5" style={{ color: "var(--primary)" }} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-(--hub-text)">Two-factor authentication</h2>
          <p className="text-sm text-(--hub-muted)">
            Add an extra layer of security with TOTP (Google Authenticator, Authy, etc.)
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="mt-6">
        {twoFactorEnabled ? (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-green-600">
              <KeyRound className="h-4 w-4" />
              2FA is enabled
            </span>
            <button
              type="button"
              onClick={handleDisable}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Disable 2FA
            </button>
          </div>
        ) : step === "setup" && secret && qrDataUrl ? (
          <form onSubmit={handleConfirm} className="space-y-4">
            <p className="text-sm text-(--hub-muted)">Scan this QR code with your authenticator app:</p>
            <img src={qrDataUrl} alt="QR code" className="rounded-lg border p-2" />
            <p className="text-xs text-(--hub-muted)">Or enter this secret manually: {secret}</p>
            <div>
              <label htmlFor="token" className="block text-sm font-medium">Verification code</label>
              <input
                id="token"
                name="token"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                placeholder="000000"
                className="mt-1 w-32 rounded-lg border border-(--hub-border-light) px-3 py-2 font-mono text-lg"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="rounded-lg bg-(--primary) px-4 py-2 text-sm font-medium text-white">
                Confirm and enable
              </button>
              <button
                type="button"
                onClick={() => { setStep("idle"); setSecret(null); setQrDataUrl(null); }}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={handleEnable}
            className="rounded-lg bg-(--primary) px-4 py-2 text-sm font-medium text-white"
          >
            Enable 2FA
          </button>
        )}
      </div>
    </div>
  );
}
