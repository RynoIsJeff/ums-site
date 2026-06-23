"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Camera, RefreshCw, ExternalLink, Loader2, AlertTriangle, XCircle } from "lucide-react";
import { refreshPageProfile, refreshPageToken, updatePagePicture } from "../actions";

type PageCardProps = {
  page: {
    id: string;
    pageName: string;
    pageExternalId: string;
    clientName: string;
    clientId: string;
    profilePictureUrl?: string;
    coverPhotoUrl?: string;
    tokenExpiresAt?: string | null;
  };
};

function tokenStatus(expiresAt: string | null | undefined) {
  if (!expiresAt) return "unknown";
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "expired";
  if (ms < 15 * 24 * 60 * 60 * 1000) return "expiring";
  return "ok";
}

export function PageCard({ page }: PageCardProps) {
  const router = useRouter();
  const [editProfile, setEditProfile] = useState(false);
  const [editCover, setEditCover] = useState(false);
  const [profileUrl, setProfileUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenExpired, setTokenExpired] = useState(false);

  const status = tokenStatus(page.tokenExpiresAt);
  const daysLeft = page.tokenExpiresAt
    ? Math.ceil((new Date(page.tokenExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const showExpiredBanner = status === "expired" || tokenExpired;

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    const tokenResult = await refreshPageToken(page.id);
    if (tokenResult?.error) {
      const msg = tokenResult.error.toLowerCase();
      if (msg.includes("session has expired") || msg.includes("error validating access token") || msg.includes("invalid oauth")) {
        setTokenExpired(true);
      } else {
        setError(tokenResult.error);
      }
      setLoading(false);
      return;
    }
    const profileResult = await refreshPageProfile(page.id);
    setLoading(false);
    if (profileResult?.error) setError(profileResult.error);
    else router.refresh();
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUrl.trim()) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.set("socialPageId", page.id);
    formData.set("imageUrl", profileUrl.trim());
    formData.set("type", "profile");
    const result = await updatePagePicture({}, formData);
    setLoading(false);
    if (result?.error) setError(result.error);
    else { setEditProfile(false); router.refresh(); }
  };

  const handleUpdateCover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverUrl.trim()) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.set("socialPageId", page.id);
    formData.set("imageUrl", coverUrl.trim());
    formData.set("type", "cover");
    const result = await updatePagePicture({}, formData);
    setLoading(false);
    if (result?.error) setError(result.error);
    else { setEditCover(false); router.refresh(); }
  };

  const fbPageUrl = `https://www.facebook.com/${page.pageExternalId}`;

  return (
    <div className="overflow-hidden rounded-xl border border-(--hub-border-light) bg-white shadow-sm">
      {/* Cover — Facebook-style */}
      <div className="relative h-24 bg-linear-to-br from-[#1877F2] to-[#42b72a] sm:h-32">
        {page.coverPhotoUrl ? (
          <Image
            src={page.coverPhotoUrl}
            alt=""
            width={640}
            height={128}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-[#1877F2]/80 to-[#42b72a]/80" />
        )}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity hover:opacity-100 group/cover">
          <button
            type="button"
            onClick={() => setEditCover(true)}
            className="rounded-lg bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm"
          >
            <Camera className="mr-1 inline h-3 w-3" />
            Change cover
          </button>
        </div>
      </div>

      {/* Profile picture */}
      <div className="relative px-4 -mt-10">
        <div className="relative inline-block">
          <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-(--hub-border-light) shadow-md">
            {page.profilePictureUrl ? (
              <Image
                src={page.profilePictureUrl}
                alt={page.pageName}
                width={80}
                height={80}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-(--hub-muted)">
                {page.pageName[0]}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setEditProfile(true)}
            className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-(--meta-blue) text-white shadow-md hover:bg-(--meta-blue-hover)"
          >
            <Camera className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="p-4 pt-2">
        <h3 className="font-semibold text-(--hub-text)">{page.pageName}</h3>
        <p className="text-sm text-(--hub-muted)">{page.clientName}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={fbPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-(--meta-blue) hover:underline"
          >
            View on Facebook
            <ExternalLink className="h-3 w-3" />
          </a>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1 text-xs font-medium text-(--hub-muted) hover:text-(--hub-text) disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {/* Token status banners */}
        {showExpiredBanner && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
            <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <div className="text-xs text-red-800">
              <p className="font-medium">Access token expired</p>
              <a
                href="/hub/social/facebook/connect"
                className="underline font-semibold mt-0.5 inline-block"
              >
                Reconnect via Facebook →
              </a>
            </div>
          </div>
        )}
        {status === "expiring" && daysLeft !== null && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-medium">Token expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}</p>
              <p>Click Refresh to extend, or <a href="/hub/social/facebook/connect" className="underline">reconnect</a>.</p>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-2 text-xs text-red-600">{error}</p>
        )}
      </div>

      {/* Edit profile modal */}
      {editProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Change profile picture</h3>
            <p className="mt-1 text-sm text-(--hub-muted)">
              Enter the URL of your new profile image (must be publicly accessible).
            </p>
            <form onSubmit={handleUpdateProfile} className="mt-4 space-y-4">
              <input
                type="url"
                placeholder="https://..."
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                className="w-full rounded-lg border border-(--hub-border-light) px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="hub-hit-target inline-flex items-center justify-center gap-2 rounded-lg bg-(--meta-blue) px-4 py-2 text-sm font-medium text-white hover:bg-(--meta-blue-hover) disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                      Updating…
                    </>
                  ) : (
                    "Update"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditProfile(false); setError(null); }}
                  className="hub-hit-target rounded-lg border border-(--hub-border-light) px-4 py-2 text-sm font-medium hover:bg-black/5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit cover modal */}
      {editCover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Change cover photo</h3>
            <p className="mt-1 text-sm text-(--hub-muted)">
              Enter the URL of your new cover image (820×312 px recommended). Requires pages_manage_metadata. If it fails, update via Meta Business Suite.
            </p>
            <form onSubmit={handleUpdateCover} className="mt-4 space-y-4">
              <input
                type="url"
                placeholder="https://..."
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full rounded-lg border border-(--hub-border-light) px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="hub-hit-target inline-flex items-center justify-center gap-2 rounded-lg bg-(--meta-blue) px-4 py-2 text-sm font-medium text-white hover:bg-(--meta-blue-hover) disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                      Updating…
                    </>
                  ) : (
                    "Update"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditCover(false); setError(null); }}
                  className="hub-hit-target rounded-lg border border-(--hub-border-light) px-4 py-2 text-sm font-medium hover:bg-black/5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
