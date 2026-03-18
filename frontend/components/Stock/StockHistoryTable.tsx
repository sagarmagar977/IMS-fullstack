"use client";

import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, Upload, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TablePagination } from "@/components/ui/TablePagination";
import { useGetStockTransactionsQuery } from "@/app/redux/api";
import { downloadCsv } from "@/lib/csv";
import { EmptyState } from "@/components/ui/EmptyState";

export function StockHistoryTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("history_search") ?? "");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "STOCK_IN" | "STOCK_OUT" | "DAMAGE" | "ADJUSTMENT">(() => {
    const value = searchParams.get("history_type");
    return value === "STOCK_IN" || value === "STOCK_OUT" || value === "DAMAGE" || value === "ADJUSTMENT"
      ? value
      : "ALL";
  });
  const [page, setPage] = useState(() => Number(searchParams.get("history_page") ?? "1") || 1);
  const [pageSize, setPageSize] = useState(() => Number(searchParams.get("history_page_size") ?? "10") || 10);
  const { data = { items: [], totalItems: 0, next: null, previous: null } } = useGetStockTransactionsQuery({
    search: search.trim() || undefined,
    transaction_type: typeFilter === "ALL" ? undefined : typeFilter,
    page,
    page_size: pageSize,
  });
  const rows = useMemo(() => data.items ?? [], [data]);
  const totalItems = data.totalItems ?? 0;

  const filteredHistory = useMemo(() => rows, [rows]);
  const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(pageSize, 1)));
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) params.set("history_search", search.trim());
    else params.delete("history_search");
    if (typeFilter !== "ALL") params.set("history_type", typeFilter);
    else params.delete("history_type");
    if (page > 1) params.set("history_page", String(page));
    else params.delete("history_page");
    if (pageSize !== 10) params.set("history_page_size", String(pageSize));
    else params.delete("history_page_size");
    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [page, pageSize, pathname, router, search, searchParams, typeFilter]);

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
                {filteredHistory.map((row) => (
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
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
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
