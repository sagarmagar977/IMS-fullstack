"use client";

type TablePaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

function buildVisiblePages(page: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (page >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
  }

  return Array.from(pages)
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
}

export function TablePagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const visiblePages = buildVisiblePages(page, totalPages);

  return (
    <div className="flex flex-col gap-2.5 py-1 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between lg:min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[0.82rem] text-gray-600">Rows</span>
          <select
            value={String(pageSize)}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-lg border border-gray-300 py-1.5 pl-3 pr-8 text-[0.84rem] text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="Rows per page"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <p className="text-[0.82rem] text-gray-600">
          Showing {start} to {end} of {totalItems}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-end">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-[0.82rem] font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          First
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-[0.82rem] font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Prev
        </button>
        <div className="flex flex-wrap items-center justify-center gap-1">
          {visiblePages.map((pageNumber, index) => {
            const previous = visiblePages[index - 1];
            const showGap = previous && pageNumber - previous > 1;

            return (
              <div key={pageNumber} className="flex items-center gap-1">
                {showGap ? <span className="px-1 text-[0.8rem] text-gray-400">...</span> : null}
                <button
                  type="button"
                  onClick={() => onPageChange(pageNumber)}
                  className={
                    pageNumber === page
                      ? "min-w-9 rounded-lg border border-blue-600 bg-blue-600 px-2.5 py-1.5 text-[0.82rem] font-medium text-white"
                      : "min-w-9 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-[0.82rem] font-medium text-gray-700 transition hover:bg-gray-50"
                  }
                >
                  {pageNumber}
                </button>
              </div>
            );
          })}
        </div>
        <select
          value={String(page)}
          onChange={(e) => onPageChange(Number(e.target.value))}
          className="rounded-lg border border-gray-300 py-1.5 pl-3 pr-8 text-[0.82rem] text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:hidden"
          aria-label="Page selector"
        >
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <option key={pageNumber} value={pageNumber}>
              Page {pageNumber}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-[0.82rem] font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Next
        </button>
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-[0.82rem] font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Last
        </button>
      </div>
    </div>
  );
}
