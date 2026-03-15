"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, Upload, Search } from "lucide-react";
import { TablePagination } from "@/components/ui/TablePagination";
import { useGetStockTransactionsQuery } from "@/app/redux/api";
import { downloadCsv } from "@/lib/csv";
import { paginateItems } from "@/lib/pagination";
import { EmptyState } from "@/components/ui/EmptyState";

export function StockHistoryTable() {
  const { data = [] } = useGetStockTransactionsQuery();
  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "STOCK_IN" | "STOCK_OUT" | "DAMAGE" | "ADJUSTMENT">("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredHistory = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch =
        !term ||
        `${row.item_name} ${row.item_number ?? ""} ${row.transaction_type} ${row.performed_by_name ?? ""} ${row.description}`
          .toLowerCase()
          .includes(term);
      const matchesType = typeFilter === "ALL" || row.transaction_type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [rows, search, typeFilter]);

  const paginated = useMemo(() => paginateItems(filteredHistory, page, pageSize), [filteredHistory, page, pageSize]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white">
      <div className="px-6 pt-5 lg:shrink-0">
        <h3 className="text-lg font-semibold text-[#3e444a]">Stock Movement History (Audit Log)</h3>
      </div>

      <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:shrink-0">
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f979f]" />
          <input
            type="search"
            placeholder="Search Item"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[#d9e1e6] bg-[#fbfcfd] py-2.5 pl-10 pr-4 text-sm text-[#47515b]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-lg border border-[#d9e1e6] px-4 py-2 text-sm text-[#5a626a]">
            <SlidersHorizontal className="h-4 w-4" />
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(
                  e.target.value as "ALL" | "STOCK_IN" | "STOCK_OUT" | "DAMAGE" | "ADJUSTMENT"
                );
                setPage(1);
              }}
              className="bg-transparent text-sm outline-none"
              aria-label="Transaction type filter"
            >
              <option value="ALL">All transactions</option>
              <option value="STOCK_IN">Stock in</option>
              <option value="STOCK_OUT">Stock out</option>
              <option value="DAMAGE">Damage</option>
              <option value="ADJUSTMENT">Adjustment</option>
            </select>
          </label>

          <button
            title="Export CSV"
            onClick={() =>
              downloadCsv(
                "stock-history.csv",
                ["timestamp", "action", "qty", "balance_after", "performed_by", "remarks"],
                filteredHistory.map((row) => [
                  row.created_at,
                  row.transaction_type,
                  row.quantity,
                  row.balance_after,
                  row.performed_by_name ?? "-",
                  row.description,
                ])
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0f79d1] text-white"
          >
            <Upload className="h-4 w-4" />
          </button>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="min-h-0 flex flex-1 overflow-auto">
          <EmptyState title="No Data Found" fit />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-x-auto px-4 pb-1 sm:px-6">
          <div className="h-full min-h-0 min-w-[920px] overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="sticky top-0 z-10 bg-[#f9fbfb] text-[#7e8790]">
                  <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                  <th className="px-4 py-3 text-left font-medium">Qty</th>
                  <th className="px-4 py-3 text-left font-medium">Balance After</th>
                  <th className="px-4 py-3 text-left font-medium">Performed By</th>
                  <th className="px-4 py-3 text-left font-medium">Remarks</th>
                </tr>
              </thead>

              <tbody>
                {paginated.items.map((row) => (
                  <tr key={row.id} className="border-b border-[#eef2f3] text-[#555d66]">
                    <td className="px-4 py-3">
                      {new Date(row.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">{row.transaction_type.replaceAll("_", " ")}</td>
                    <td className="px-4 py-3">{row.quantity}</td>
                    <td className="px-4 py-3">{row.balance_after}</td>
                    <td className="px-4 py-3">{row.performed_by_name ?? "-"}</td>
                    <td className="px-4 py-3">{row.description || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="border-t border-[#eef2f3] px-4 pb-2 pt-1 sm:px-6 lg:shrink-0">
        <TablePagination
          page={paginated.page}
          pageSize={paginated.pageSize}
          totalItems={paginated.totalItems}
          totalPages={paginated.totalPages}
          onPageChange={setPage}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
