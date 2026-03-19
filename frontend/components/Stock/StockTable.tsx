"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, SlidersHorizontal, Trash2, Upload } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TablePagination } from "@/components/ui/TablePagination";
import { CreateTransaction } from "./CreateTransaction";
import { Modal } from "@/components/ui/Modal";
import { useDeleteStockMutation, useGetItemsQuery, useGetStocksQuery } from "@/app/redux/api";
import { downloadCsv } from "@/lib/csv";
import { EmptyState } from "@/components/ui/EmptyState";

export function StockTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [search, setSearch] = useState(() => searchParams.get("stock_search") ?? "");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "LOW_STOCK" | "OUT_OF_STOCK" | "ON_BOARDED">(() => {
    const value = searchParams.get("stock_status");
    return value === "LOW_STOCK" || value === "OUT_OF_STOCK" || value === "ON_BOARDED" ? value : "ALL";
  });
  const [page, setPage] = useState(() => Number(searchParams.get("stock_page") ?? "1") || 1);
  const [pageSize, setPageSize] = useState(() => Number(searchParams.get("stock_page_size") ?? "10") || 10);
  const { data: stocks = { items: [], totalItems: 0, next: null, previous: null } } = useGetStocksQuery({
    search: search.trim() || undefined,
    stock_status: statusFilter === "ALL" ? undefined : statusFilter,
    page,
    page_size: pageSize,
  });
  const { data: items = { items: [], totalItems: 0, next: null, previous: null } } = useGetItemsQuery({
    item_type: "CONSUMABLE",
    page_size: 1000,
  });
  const [deleteStock] = useDeleteStockMutation();
  const stockRows = useMemo(() => stocks.items ?? [], [stocks]);
  const itemRows = useMemo(() => items.items ?? [], [items]);
  const [selectedStockId, setSelectedStockId] = useState<number | null>(null);
  const [selectedTransactionType, setSelectedTransactionType] = useState<"STOCK_IN" | "STOCK_OUT" | "DAMAGE" | "ADJUSTMENT">("STOCK_IN");
  const [detailsId, setDetailsId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");

  const mapped = useMemo(() => {
    return stockRows.map((stock) => {
      const item = itemRows.find((i) => i.id === stock.item);
      return {
        id: stock.id,
        name: item?.title ?? `Item #${stock.item}`,
        category: item?.item_type === "FIXED_ASSET" ? "Fixed Asset" : "Consumable",
        unit: stock.unit,
        qty: stock.quantity,
        minQty: stock.min_threshold,
        status: stock.stock_status,
      };
    });
  }, [itemRows, stockRows]);

  const filteredStock = useMemo(() => mapped, [mapped]);
  const totalItems = stocks.totalItems ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(pageSize, 1)));
  const selectedRow = mapped.find((row) => row.id === detailsId);
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) params.set("stock_search", search.trim());
    else params.delete("stock_search");
    if (statusFilter !== "ALL") params.set("stock_status", statusFilter);
    else params.delete("stock_status");
    if (page > 1) params.set("stock_page", String(page));
    else params.delete("stock_page");
    if (pageSize !== 10) params.set("stock_page_size", String(pageSize));
    else params.delete("stock_page_size");
    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();
    if (nextQuery !== currentQuery) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }
  }, [page, pageSize, pathname, router, search, searchParams, statusFilter]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white">
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
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as "ALL" | "LOW_STOCK" | "OUT_OF_STOCK" | "ON_BOARDED");
                setPage(1);
              }}
              className="bg-transparent text-sm outline-none"
              aria-label="Stock status filter"
            >
              <option value="ALL">All stock</option>
              <option value="LOW_STOCK">Low stock</option>
              <option value="OUT_OF_STOCK">Out of stock</option>
              <option value="ON_BOARDED">On boarded</option>
            </select>
          </label>

          <button
            onClick={() => {
              setSelectedStockId(null);
              setSelectedTransactionType("STOCK_IN");
              setOpenDrawer(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-[#0f79d1] px-4 py-2 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            Create Transaction
          </button>

          <button
            title="Download Stock CSV"
            onClick={() =>
              downloadCsv(
                "stock-overview.csv",
                ["item_name", "category", "unit", "quantity", "min_threshold", "status"],
                filteredStock.map((row) => [row.name, row.category, row.unit, row.qty, row.minQty, row.status])
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#0f79d1]"
          >
            <Upload className="h-4 w-4" />
          </button>
        </div>
      </div>

      {feedback ? <p className="px-6 pb-2 text-sm text-[#0f79d1]">{feedback}</p> : null}

      {filteredStock.length === 0 ? (
        <div className="min-h-0 flex flex-1 overflow-auto">
          <EmptyState title="No Data Found" fit />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-x-auto px-4 pb-1 sm:px-6">
          <div className="h-full min-h-0 min-w-[900px] overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="sticky top-0 z-10 bg-[#f9fbfb] text-[#7e8790]">
                  <th className="px-4 py-3 text-left font-medium">Item Name</th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-left font-medium">Unit</th>
                  <th className="px-4 py-3 text-left font-medium">Current Qty</th>
                  <th className="px-4 py-3 text-left font-medium">Min Qty</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredStock.map((row) => (
                  <tr key={row.id} className="border-b border-[#eef2f3]">
                    <td className="px-4 py-3 text-[#31363c]">{row.name}</td>
                    <td className="px-4 py-3 text-[#5c646d]">{row.category}</td>
                    <td className="px-4 py-3 text-[#5c646d]">{row.unit}</td>
                    <td className="px-4 py-3 text-[#5c646d]">{row.qty}</td>
                    <td className="px-4 py-3 text-[#5c646d]">{row.minQty}</td>
                    <td className="px-4 py-3">
                      {row.status === "LOW_STOCK" && (
                        <span className="rounded bg-[#ffe8ea] px-2 py-1 text-xs text-[#df5d6a]">Low Stock</span>
                      )}
                      {row.status === "ON_BOARDED" && (
                        <span className="rounded bg-[#dff0ff] px-2 py-1 text-xs text-[#2990dc]">ON BOARDING</span>
                      )}
                      {row.status === "OUT_OF_STOCK" && (
                        <span className="rounded bg-[#f1e8ff] px-2 py-1 text-xs text-[#8e5de8]">Out of Stock</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDetailsId(row.id)}
                          className="rounded bg-[#ffefc8] p-1.5 text-[#f0a400]"
                          aria-label="view"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStockId(row.id);
                            setSelectedTransactionType("ADJUSTMENT");
                            setOpenDrawer(true);
                          }}
                          className="rounded bg-[#d9edff] p-1.5 text-[#0f79d1]"
                          aria-label="edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm(`Delete stock record for ${row.name}?`)) {
                              return;
                            }
                            try {
                              await deleteStock(row.id).unwrap();
                              setFeedback(`Deleted stock record for ${row.name}.`);
                            } catch {
                              setFeedback("Failed to delete stock record.");
                            }
                          }}
                          className="rounded bg-[#ffe0e3] p-1.5 text-[#e14d58]"
                          aria-label="delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
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
      <CreateTransaction
        key={`${selectedStockId ?? "new-stock"}-${selectedTransactionType}`}
        open={openDrawer}
        initialStockId={selectedStockId}
        initialTransactionType={selectedTransactionType}
        onClose={() => setOpenDrawer(false)}
      />
      <Modal open={Boolean(selectedRow)} title="Stock Details" onClose={() => setDetailsId(null)}>
        {selectedRow ? (
          <dl className="grid grid-cols-2 gap-4 text-sm text-slate-700">
            <Detail label="Item" value={selectedRow.name} />
            <Detail label="Category" value={selectedRow.category} />
            <Detail label="Unit" value={selectedRow.unit} />
            <Detail label="Current Qty" value={selectedRow.qty} />
            <Detail label="Min Qty" value={selectedRow.minQty} />
            <Detail label="Status" value={selectedRow.status.replaceAll("_", " ")} />
          </dl>
        ) : null}
      </Modal>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{value}</dd>
    </div>
  );
}
