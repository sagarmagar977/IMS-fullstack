"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Search as SearchIcon, SlidersHorizontal, Trash2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TablePagination } from "@/components/ui/TablePagination";
import { useGetCategoriesQuery, useGetRecentInventoryActivitiesQuery } from "@/app/redux/api";
import { RecentActivitiesFilter } from "./RecentActivitiesFilter";
import type { ActivitiesFilterState } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";

const emptyFilter: ActivitiesFilterState = {
  from: "",
  to: "",
  category: "",
  itemType: "",
  status: "",
};

export function RecentActivitiesTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("activity_search") ?? "");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draft, setDraft] = useState<ActivitiesFilterState>(() => ({
    from: searchParams.get("activity_from") ?? "",
    to: searchParams.get("activity_to") ?? "",
    category: searchParams.get("activity_category") ?? "",
    itemType:
      searchParams.get("activity_item_type") === "Fixed Asset" || searchParams.get("activity_item_type") === "Consumable"
        ? (searchParams.get("activity_item_type") as ActivitiesFilterState["itemType"])
        : "",
    status:
      searchParams.get("activity_status") === "Assigned" ||
      searchParams.get("activity_status") === "Unassigned" ||
      searchParams.get("activity_status") === "Damaged"
        ? (searchParams.get("activity_status") as ActivitiesFilterState["status"])
        : "",
  }));
  const [applied, setApplied] = useState<ActivitiesFilterState>(() => ({
    from: searchParams.get("activity_from") ?? "",
    to: searchParams.get("activity_to") ?? "",
    category: searchParams.get("activity_category") ?? "",
    itemType:
      searchParams.get("activity_item_type") === "Fixed Asset" || searchParams.get("activity_item_type") === "Consumable"
        ? (searchParams.get("activity_item_type") as ActivitiesFilterState["itemType"])
        : "",
    status:
      searchParams.get("activity_status") === "Assigned" ||
      searchParams.get("activity_status") === "Unassigned" ||
      searchParams.get("activity_status") === "Damaged"
        ? (searchParams.get("activity_status") as ActivitiesFilterState["status"])
        : "",
  }));
  const [page, setPage] = useState(() => Number(searchParams.get("activity_page") ?? "1") || 1);
  const [pageSize, setPageSize] = useState(() => Number(searchParams.get("activity_page_size") ?? "10") || 10);
  const { data: categories = { items: [], totalItems: 0, next: null, previous: null } } = useGetCategoriesQuery({ page_size: 1000 });
  const selectedCategory = (categories.items ?? []).find((category) => category.name === applied.category);
  const { data = { items: [], totalItems: 0, next: null, previous: null } } = useGetRecentInventoryActivitiesQuery({
    search: search.trim() || undefined,
    from: applied.from || undefined,
    to: applied.to || undefined,
    action_type:
      applied.status === "Assigned"
        ? "ASSIGN"
        : applied.status === "Unassigned"
          ? "RETURN"
          : applied.status === "Damaged"
            ? "REPAIR"
            : undefined,
    item_type:
      applied.itemType === "Fixed Asset"
        ? "FIXED_ASSET"
        : applied.itemType === "Consumable"
          ? "CONSUMABLE"
          : undefined,
    category: selectedCategory?.id,
    page,
    page_size: pageSize,
  });
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const rows = useMemo(() => data.items ?? [], [data]);
  const totalItems = data.totalItems ?? 0;

  const filtered = useMemo(() => rows, [rows]);
  const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(pageSize, 1)));
  const selectedRow = rows.find((row) => row.id === selectedRowId);
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) params.set("activity_search", search.trim());
    else params.delete("activity_search");
    if (applied.from) params.set("activity_from", applied.from);
    else params.delete("activity_from");
    if (applied.to) params.set("activity_to", applied.to);
    else params.delete("activity_to");
    if (applied.category) params.set("activity_category", applied.category);
    else params.delete("activity_category");
    if (applied.itemType) params.set("activity_item_type", applied.itemType);
    else params.delete("activity_item_type");
    if (applied.status) params.set("activity_status", applied.status);
    else params.delete("activity_status");
    if (page > 1) params.set("activity_page", String(page));
    else params.delete("activity_page");
    if (pageSize !== 10) params.set("activity_page_size", String(pageSize));
    else params.delete("activity_page_size");
    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();
    if (nextQuery !== currentQuery) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }
  }, [applied, page, pageSize, pathname, router, search, searchParams]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.2rem] border border-[#e5ecec] bg-white">
      <div className="border-b border-[#e8efef] px-4 py-2.5 sm:px-5 lg:px-6 lg:shrink-0">
        <h2 className="text-[1rem] font-semibold tracking-[-0.03em] text-[#30363d] lg:text-[1.05rem]">
          Recent Inventory Activities
        </h2>
      </div>

      <div className="flex flex-col gap-2.5 px-4 py-2.5 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6 lg:shrink-0">
        <div className="relative w-full max-w-full md:max-w-[18rem] lg:max-w-[19rem]">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8c959d]" />
          <input
            type="search"
            placeholder="Search Item"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-8.5 w-full rounded-xl border border-[#d9e1e6] bg-[#fbfcfd] pl-9 pr-3 text-[0.86rem] text-[#394047] placeholder:text-[#a1a9b1] focus:border-[#4d8fc6] focus:outline-none focus:ring-1 focus:ring-[#4d8fc6]"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsFilterOpen(true)}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-[#d8e0e6] bg-white px-3.5 py-1.5 text-[0.84rem] font-medium text-[#515962] hover:bg-[#f6f9fb] lg:self-auto"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto px-4 pb-1 sm:px-5 lg:px-6">
        {filtered.length === 0 ? (
          <EmptyState
            compact
            fit
            title="No Data Found"
          />
        ) : (
        <div className="h-full min-h-0 overflow-auto">
        <table className="w-full min-w-[46rem] text-left text-sm lg:min-w-0">
          <thead>
            <tr className="sticky top-0 z-10 border-y border-[#eef2f3] bg-[#f9fbfb] text-[#7c8590]">
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em]">Item Name</th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em]">Unique Number</th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em]">Performed By</th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em]">Date</th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em]">Amount</th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em]">Status</th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.08em]">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-b border-[#f0f3f4] text-[13px] text-[#4f555c]">
                <td className="px-3 py-2.5 font-medium text-[#2f353b] lg:w-[24%]">{row.item_name}</td>
                <td className="px-3 py-2.5">{row.unique_number ?? "-"}</td>
                <td className="px-3 py-2.5">{row.performed_by ?? "-"}</td>
                <td className="px-3 py-2.5">
                  {new Date(row.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">{row.amount}</td>
                <td className="px-3 py-2.5 text-[12px] font-medium tracking-[0.02em]">{row.status}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRowId(row.id)}
                      className="rounded-lg bg-[#ffefc8] p-1.25 text-[#f0a400]"
                      aria-label="view"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRowId(row.id)}
                      className="rounded-lg bg-[#d9edff] p-1.25 text-[#0f79d1]"
                      aria-label="edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRowId(row.id)}
                      className="rounded-lg bg-[#ffe0e3] p-1.25 text-[#e14d58]"
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
        )}
      </div>

      <div className="border-t border-[#eef2f3] px-4 pb-2 pt-1.5 sm:px-5 lg:px-6 lg:shrink-0">
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

      <RecentActivitiesFilter
        categories={categories.items ?? []}
        open={isFilterOpen}
        draft={draft}
        onChangeDraft={setDraft}
        onReset={() => {
          setDraft(emptyFilter);
          setApplied(emptyFilter);
          setPage(1);
          setIsFilterOpen(false);
        }}
        onApply={() => {
          setApplied(draft);
          setPage(1);
          setIsFilterOpen(false);
        }}
        onClose={() => setIsFilterOpen(false)}
      />

      <Modal open={Boolean(selectedRow)} title="Activity Details" onClose={() => setSelectedRowId(null)}>
        {selectedRow ? (
          <dl className="grid grid-cols-2 gap-4 text-sm text-slate-700">
            <Detail label="Item" value={selectedRow.item_name} />
            <Detail label="Unique Number" value={selectedRow.unique_number ?? "-"} />
            <Detail label="Performed By" value={selectedRow.performed_by ?? "-"} />
            <Detail label="Date" value={selectedRow.date} />
            <Detail label="Amount" value={selectedRow.amount} />
            <Detail label="Status" value={selectedRow.status} />
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
