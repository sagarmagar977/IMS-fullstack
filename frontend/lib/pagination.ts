export function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const safePageSize = Math.max(pageSize, 1);
  const totalPages = Math.max(1, Math.ceil(items.length / safePageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize;

  return {
    page: safePage,
    pageSize: safePageSize,
    totalPages,
    totalItems: items.length,
    start,
    end: Math.min(end, items.length),
    items: items.slice(start, end),
  };
}
