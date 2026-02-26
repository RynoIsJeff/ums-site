"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Camera, RefreshCw, ExternalLink } from "lucide-react";
import { refreshPageProfile, updatePagePicture } from "../actions";

type PageCardProps = {
  page: {
    id: string;
    pageName: string;
    pageExternalId: string;
    clientName: string;
    clientId: string;
    profilePictureUrl?: string;
    coverPhotoUrl?: string;
  };
};

export function PageCard({ page }: PageCardProps) {
  const router = useRouter();
  const [editProfile, setEditProfile] = useState(false);
  const [editCover, setEditCover] = useState(false);
  const [profileUrl, setProfileUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    const result = await refreshPageProfile(page.id);
    setLoading(false);
    if (result?.error) setError(result.error);
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
    <div className="overflow-hidden rounded-xl border border-[var(--hub-border-light)] bg-white shadow-sm">
      {/* Cover — Facebook-style */}
      <div className="relative h-24 bg-linear-to-br from-[#1877F2] to-[#42b72a] sm:h-32">
        {page.coverPhotoUrl ? (
          <img
            src={page.coverPhotoUrl}
            alt=""
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
          <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-[var(--hub-border-light)] shadow-md">
            {page.profilePictureUrl ? (
              <img
                src={page.profilePictureUrl}
                alt={page.pageName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-[var(--hub-muted)]">
                {page.pageName[0]}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setEditProfile(true)}
            className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[var(--meta-blue)] text-white shadow-md hover:bg-[var(--meta-blue-hover)]"
          >
            <Camera className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="p-4 pt-2">
        <h3 className="font-semibold text-[var(--hub-text)]">{page.pageName}</h3>
        <p className="text-sm text-[var(--hub-muted)]">{page.clientName}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={fbPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--meta-blue)] hover:underline"
          >
            View on Facebook
            <ExternalLink className="h-3 w-3" />
          </a>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--hub-muted)] hover:text-[var(--hub-text)] disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
        {error && (
          <p className="mt-2 text-xs text-red-600">{error}</p>
        )}
      </div>

      {/* Edit profile modal */}
      {editProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Change profile picture</h3>
            <p className="mt-1 text-sm text-[var(--hub-muted)]">
              Enter the URL of your new profile image (must be publicly accessible).
            </p>
            <form onSubmit={handleUpdateProfile} className="mt-4 space-y-4">
              <input
                type="url"
                placeholder="https://..."
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                className="w-full rounded-lg border border-[var(--hub-border-light)] px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[var(--meta-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--meta-blue-hover)] disabled:opacity-50"
                >
                  {loading ? "Updating…" : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditProfile(false); setError(null); }}
                  className="rounded-lg border border-[var(--hub-border-light)] px-4 py-2 text-sm font-medium hover:bg-black/5"
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
            <p className="mt-1 text-sm text-[var(--hub-muted)]">
              Enter the URL of your new cover image (820×312 px recommended). Requires pages_manage_metadata. If it fails, update via Meta Business Suite.
            </p>
            <form onSubmit={handleUpdateCover} className="mt-4 space-y-4">
              <input
                type="url"
                placeholder="https://..."
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full rounded-lg border border-[var(--hub-border-light)] px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[var(--meta-blue)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--meta-blue-hover)] disabled:opacity-50"
                >
                  {loading ? "Updating…" : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditCover(false); setError(null); }}
                  className="rounded-lg border border-[var(--hub-border-light)] px-4 py-2 text-sm font-medium hover:bg-black/5"
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
