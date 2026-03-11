"use client";

import { useMemo, useState } from "react";
import type { ActivitiesFilterState } from "@/types";
import { RecentActivitiesFilter } from "./RecentActivitiesFilter";
import { TablePagination } from "@/components/ui/TablePagination";
import { SlidersHorizontal, Search as SearchIcon } from "lucide-react";

const mockData = [
  {
    itemName: "Laptop - Dell 5420",
    uniqueNumber: "G-1600",
    performedBy: "H. Shrestha",
    date: "2026-01-22",
    amount: "1 pcs",
    status: "Assigned",
    category: "Electronics",
    itemType: "Fixed Asset",
  },
  {
    itemName: "Printer - HP M404",
    uniqueNumber: "Co-7890",
    performedBy: "S. Thapa",
    date: "2026-01-22",
    amount: "3 pcs",
    status: "Returned",
    category: "Office",
    itemType: "Fixed Asset",
  },
  {
    itemName: "Office Chair",
    uniqueNumber: "O-7800",
    performedBy: "Admin",
    date: "2026-01-21",
    amount: "5 pcs",
    status: "Added",
    category: "Furniture",
    itemType: "Fixed Asset",
  },
  {
    itemName: "Toner Quantity",
    uniqueNumber: "O-7800",
    performedBy: "Admin",
    date: "2026-01-21",
    amount: "5 pcs",
    status: "Updated",
    category: "Office",
    itemType: "Consumable",
  },
] as const;

const statusColors: Record<string, string> = {
  Assigned: "bg-blue-100 text-blue-800",
  Returned: "bg-gray-100 text-gray-800",
  Added: "bg-green-100 text-green-800",
  Updated: "bg-amber-100 text-amber-800",
};

const emptyFilter: ActivitiesFilterState = {
  from: "",
  to: "",
  category: "",
  itemType: "",
  status: "",
};

function matchesFilter(
  row: (typeof mockData)[number],
  filter: ActivitiesFilterState,
  search: string
) {
  const term = search.trim().toLowerCase();

  if (term) {
    const haystack = [
      row.itemName,
      row.uniqueNumber,
      row.performedBy,
      row.amount,
      row.status,
      row.category,
      row.itemType,
      row.date,
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(term)) return false;
  }

  if (filter.category && row.category !== filter.category) return false;
  if (filter.itemType && row.itemType !== filter.itemType) return false;
  if (filter.status && row.status !== filter.status) return false;
  if (filter.from && row.date < filter.from) return false;
  if (filter.to && row.date > filter.to) return false;

  return true;
}

export function RecentActivitiesTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draft, setDraft] = useState<ActivitiesFilterState>(emptyFilter);
  const [applied, setApplied] = useState<ActivitiesFilterState>(emptyFilter);

  const filtered = useMemo(
    () => mockData.filter((row) => matchesFilter(row, applied, search)),
    [applied, search]
  );

  const pageSize = 10;
  const totalRecords = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-200 p-4">
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Inventory Activities
        </h2>

        {/* Search + Filter Row */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="search"
              placeholder="Search Item"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="min-w-[14rem] rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filter Button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 font-semibold text-gray-700">
                Item Name
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Unique Number
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Performed By
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Amount</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-gray-100 hover:bg-gray-50/50"
              >
                <td className="px-4 py-3 font-medium text-gray-900">
                  {row.itemName}
                </td>
                <td className="px-4 py-3 text-gray-600">{row.uniqueNumber}</td>
                <td className="px-4 py-3 text-gray-600">{row.performedBy}</td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(row.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-gray-600">{row.amount}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      statusColors[row.status] ??
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="rounded-full p-1.5 text-amber-600 hover:bg-amber-50"
                      aria-label="view"
                    >
                      👁️
                    </button>
                    <button
                      type="button"
                      className="rounded-full p-1.5 text-amber-600 hover:bg-amber-50"
                      aria-label="edit"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="rounded-full p-1.5 text-amber-600 hover:bg-amber-50"
                      aria-label="delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination UI (static, shared component) */}
      <TablePagination />
      <RecentActivitiesFilter
        open={isFilterOpen}
        draft={draft}
        onChangeDraft={setDraft}
        onReset={() => {
          setDraft(emptyFilter);
          setApplied(emptyFilter);
          setIsFilterOpen(false);
          setPage(1);
        }}
        onApply={() => {
          setApplied(draft);
          setIsFilterOpen(false);
          setPage(1);
        }}
        onClose={() => setIsFilterOpen(false)}
      />
    </div>
  );
}
