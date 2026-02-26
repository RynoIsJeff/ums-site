import Link from "next/link";

type PaginationProps = {
  /** Total number of items */
  totalItems: number;
  /** Current 1-based page */
  currentPage: number;
  /** Items per page */
  pageSize: number;
  /** Base path without query string (e.g. "/hub/clients") */
  basePath: string;
  /** Current search params to preserve (excluding page) */
  searchParams: Record<string, string | undefined>;
};

/**
 * Server-rendered pagination controls. Preserves existing filters in links.
 */
export function Pagination({
  totalItems,
  currentPage,
  pageSize,
  basePath,
  searchParams,
}: PaginationProps) {
  if (totalItems === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v != null && v !== "" && k !== "page") params.set(k, v);
    });
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--hub-border-light)] pt-4"
      aria-label="Pagination"
    >
      <p className="text-sm text-[var(--hub-muted)]">
        Showing {start}–{end} of {totalItems}
      </p>
      <div className="flex items-center gap-2">
        {hasPrev ? (
          <Link
            href={buildUrl(currentPage - 1)}
            className="rounded-md border border-[var(--hub-border-light)] bg-white px-3 py-2 text-sm font-medium text-[var(--hub-text)] hover:bg-black/5"
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-md border border-[var(--hub-border-light)] bg-black/5 px-3 py-2 text-sm text-[var(--hub-muted)]">
            Previous
          </span>
        )}
        <span className="text-sm text-[var(--hub-muted)]">
          Page {currentPage} of {totalPages}
        </span>
        {hasNext ? (
          <Link
            href={buildUrl(currentPage + 1)}
            className="rounded-md border border-[var(--hub-border-light)] bg-white px-3 py-2 text-sm font-medium text-[var(--hub-text)] hover:bg-black/5"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-md border border-[var(--hub-border-light)] bg-black/5 px-3 py-2 text-sm text-[var(--hub-muted)]">
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
