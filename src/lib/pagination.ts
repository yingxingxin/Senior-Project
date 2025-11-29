/**
 * Pagination utilities for server-side data fetching
 */

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Parse pagination params from URL search params
 */
export function parsePaginationParams(
  searchParams: Record<string, string | string[] | undefined>
): PaginationParams {
  const page = Math.max(1, parseInt(String(searchParams.page ?? "1"), 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(String(searchParams.pageSize ?? "25"), 10) || 25)
  );
  return { page, pageSize };
}

/**
 * Calculate pagination metadata from total count
 */
export function calculatePagination<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / params.pageSize);
  return {
    data,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages,
  };
}

/**
 * Build URL with updated pagination params
 */
export function buildPaginationUrl(
  pathname: string,
  currentParams: URLSearchParams,
  updates: Partial<PaginationParams>
): string {
  const params = new URLSearchParams(currentParams);

  if (updates.page !== undefined) {
    params.set("page", String(updates.page));
  }
  if (updates.pageSize !== undefined) {
    params.set("pageSize", String(updates.pageSize));
    // Reset to page 1 when page size changes
    params.set("page", "1");
  }

  return `${pathname}?${params.toString()}`;
}

/**
 * Calculate SQL offset from pagination params
 */
export function calculateOffset(params: PaginationParams): number {
  return (params.page - 1) * params.pageSize;
}
