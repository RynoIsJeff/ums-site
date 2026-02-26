/**
 * Shared utilities for list page URL params (pagination, filters, search).
 * Use with searchParams from page props.
 */

export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [25, 50] as const;

export type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
};

/**
 * Parse list params from URL searchParams (or similar record).
 */
export function parseListParams(
  raw: Record<string, string | string[] | undefined>
): ListParams {
  const page = Math.max(1, parseInt(String(raw.page ?? 1), 10) || 1);
  const pageSizeRaw = raw.pageSize;
  const pageSize =
    PAGE_SIZE_OPTIONS.includes(Number(pageSizeRaw) as (typeof PAGE_SIZE_OPTIONS)[number])
      ? Number(pageSizeRaw)
      : DEFAULT_PAGE_SIZE;
  const search = typeof raw.search === "string" ? raw.search.trim() : undefined;
  const status = typeof raw.status === "string" && raw.status ? raw.status : undefined;
  const clientId = typeof raw.clientId === "string" && raw.clientId ? raw.clientId : undefined;
  const dateFrom = typeof raw.dateFrom === "string" && raw.dateFrom ? raw.dateFrom : undefined;
  const dateTo = typeof raw.dateTo === "string" && raw.dateTo ? raw.dateTo : undefined;

  return {
    page,
    pageSize,
    search: search || undefined,
    status,
    clientId,
    dateFrom,
    dateTo,
  };
}

/**
 * Build a record of search params for Pagination (preserves filters, excludes page).
 */
export function paramsForPagination(params: ListParams): Record<string, string> {
  const out: Record<string, string> = {};
  if (params.pageSize !== DEFAULT_PAGE_SIZE) out.pageSize = String(params.pageSize);
  if (params.search) out.search = params.search;
  if (params.status) out.status = params.status;
  if (params.clientId) out.clientId = params.clientId;
  if (params.dateFrom) out.dateFrom = params.dateFrom;
  if (params.dateTo) out.dateTo = params.dateTo;
  return out;
}
