"use client";

// Pure UI-only pagination bar, no logic.
// Matches the screenshot: "Showing 10" | "Showing 1 to 10 out of 40 records" | < 1 2 3 4 >

export function TablePagination() {
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row">
      {/* Left: page size select */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Showing</span>
        <select
          className="rounded-lg border border-gray-300 py-1.5 pl-2 pr-8 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Rows per page"
          defaultValue="10"
        >
          <option value="10">10</option>
        </select>
      </div>

      {/* Middle: static range text */}
      <p className="text-sm text-gray-600 text-center">
        Showing 1 to 10 out of 40 records
      </p>

      {/* Right: static pager buttons */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          &lt;
        </button>
        <button
          type="button"
          className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
        >
          1
        </button>
        <button
          type="button"
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          2
        </button>
        <button
          type="button"
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          3
        </button>
        <button
          type="button"
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          4
        </button>
        <button
          type="button"
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}

