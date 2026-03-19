"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Eye, Pencil, Plus, Search, SlidersHorizontal, Trash2, Upload } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TablePagination } from "@/components/ui/TablePagination";
import { AddItemModal } from "./AddItemModal";
import { AssignItemModal } from "./AssignItemModal";
import { useDeleteItemMutation, useGetItemsQuery } from "@/app/redux/api";
import type { InventoryItemApi } from "@/app/redux/api";
import { Modal } from "@/components/ui/Modal";
import { downloadCsv, getApiBaseUrl, uploadCsv } from "@/lib/csv";
import { EmptyState } from "@/components/ui/EmptyState";

export function ItemsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get("status") ?? "");
  const [itemTypeFilter, setItemTypeFilter] = useState<"" | "FIXED_ASSET" | "CONSUMABLE">(() => {
    const itemType = searchParams.get("item_type");
    return itemType === "FIXED_ASSET" || itemType === "CONSUMABLE" ? itemType : "";
  });
  const [assignmentFilter, setAssignmentFilter] = useState<"ALL" | "ASSIGNED" | "UNASSIGNED">(() => {
    const assignmentStatus = searchParams.get("assignment_status");
    return assignmentStatus === "ASSIGNED" || assignmentStatus === "UNASSIGNED" ? assignmentStatus : "ALL";
  });
  const { data = { items: [], totalItems: 0, next: null, previous: null } } = useGetItemsQuery({
    search: search.trim() || undefined,
    status: statusFilter || undefined,
    item_type: itemTypeFilter || undefined,
    assignment_status: assignmentFilter === "ALL" ? undefined : assignmentFilter,
    page,
    page_size: pageSize,
  });
  const [deleteItem] = useDeleteItemMutation();
  const items = useMemo(() => data.items ?? [], [data]);
  const [open, setOpen] = React.useState(false);
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItemApi | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItemApi | null>(null);
  const [feedback, setFeedback] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }
    if (statusFilter) {
      params.set("status", statusFilter);
    }
    if (itemTypeFilter) {
      params.set("item_type", itemTypeFilter);
    }
    if (assignmentFilter !== "ALL") {
      params.set("assignment_status", assignmentFilter);
    }

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();
    if (nextQuery !== currentQuery) {
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }
  }, [assignmentFilter, itemTypeFilter, pathname, router, search, searchParams, statusFilter]);

  const filteredItems = useMemo(() => items, [items]);

  const totalItems = data.totalItems ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(pageSize, 1)));

  const handleDelete = async (item: InventoryItemApi) => {
    const confirmed = window.confirm(`Delete "${item.title}"?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteItem(item.id).unwrap();
      setFeedback(`Deleted ${item.title}.`);
    } catch {
      setFeedback("Failed to delete item.");
    }
  };

  const handleTemplateDownload = () => {
    downloadCsv("inventory-items-template.csv", [
      "title",
      "item_number",
      "item_type",
      "status",
      "category",
      "office",
      "amount",
      "price",
      "currency",
      "store",
      "project",
      "department",
      "manufacturer",
      "description",
    ]);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const result = await uploadCsv(`${getApiBaseUrl()}inventory-items/bulk-import/`, file);
      setFeedback(`Import finished: ${result.created ?? 0} created, ${result.failed ?? 0} failed.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Import failed.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <>
      <div className="flex h-full min-h-full w-full flex-1 flex-col overflow-hidden rounded-[1.2rem] bg-white">
        <div className="flex flex-col gap-4 px-4 py-3.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:shrink-0">
          <div className="relative w-full lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f979f]" />
            <input
              type="search"
              placeholder="Search Item"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-[#d9e1e6] bg-[#fbfcfd] px-4 py-2.5 pl-9 text-sm text-[#44505b] placeholder:text-[#a1a9b1] focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-lg border border-[#d9e1e6] bg-white px-3 py-2 text-sm text-[#5a626a]">
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent outline-none"
                aria-label="Item status filter"
              >
                <option value="">All status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="DISPOSED">Disposed</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="UNASSIGNED">Unassigned</option>
              </select>
            </label>

            <label className="flex items-center gap-2 rounded-lg border border-[#d9e1e6] bg-white px-3 py-2 text-sm text-[#5a626a]">
              <span>Type</span>
              <select
                value={itemTypeFilter}
                onChange={(e) => {
                  const value = e.target.value;
                  setItemTypeFilter(value === "FIXED_ASSET" || value === "CONSUMABLE" ? value : "");
                  setPage(1);
                }}
                className="bg-transparent outline-none"
                aria-label="Item type filter"
              >
                <option value="">All types</option>
                <option value="FIXED_ASSET">Fixed Asset</option>
                <option value="CONSUMABLE">Consumable</option>
              </select>
            </label>

            <button
              onClick={() =>
                setAssignmentFilter((current) => {
                  setPage(1);
                  return current === "ALL" ? "ASSIGNED" : current === "ASSIGNED" ? "UNASSIGNED" : "ALL";
                })
              }
              className="flex items-center gap-2 rounded-lg border border-[#d9e1e6] bg-white px-4 py-2 text-sm text-[#5a626a] hover:bg-[#f8fbfc]"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {assignmentFilter === "ALL"
                ? "All Items"
                : assignmentFilter === "ASSIGNED"
                  ? "Assigned"
                  : "Unassigned"}
            </button>

            <button
              onClick={() => {
                setEditingItem(null);
                setOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0f79d1] px-4 py-2 text-sm font-medium text-white hover:bg-[#0e6fbe]"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              onContextMenu={(event) => {
                event.preventDefault();
                handleTemplateDownload();
              }}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#0f79d1] hover:bg-[#ecf4fb]"
            >
              <Upload className="h-4 w-4" />
              Bulk Import (CSV)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>

        {feedback ? <p className="px-6 pb-2 text-sm text-[#0f79d1] lg:shrink-0">{feedback}</p> : null}

        {filteredItems.length === 0 ? (
          <div className="min-h-0 flex flex-1 overflow-auto">
            <EmptyState title="No Data Found" fit />
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-x-auto px-4 pb-1 sm:px-6">
            <div className="h-full min-h-0 min-w-[980px] overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="sticky top-0 z-10 bg-[#f9fbfb] text-[#7e8790]">
                  <th className="px-4 py-3 text-left font-medium">Item Name</th>
                  <th className="px-4 py-3 text-left font-medium">Item Type</th>
                  <th className="px-4 py-3 text-left font-medium">Item Number</th>
                  <th className="px-4 py-3 text-left font-medium">Serial</th>
                  <th className="px-4 py-3 text-left font-medium">Amount</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Assigned To</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((row) => (
                  <tr key={row.id} className="border-b border-[#eef2f3]">
                    <td className="px-4 py-2.5 text-[#31363c]">{row.title}</td>
                    <td className="px-4 py-2.5 text-[#5c646d]">{row.item_type === "FIXED_ASSET" ? "Fixed Asset" : "Consumable"}</td>
                    <td className="px-4 py-2.5 text-[#5c646d]">{row.item_number ?? "-"}</td>
                    <td className="px-4 py-2.5 text-[#5c646d]">{row.serial_number ?? "-"}</td>
                    <td className="px-4 py-2.5 text-[#5c646d]">{row.amount}</td>
                    <td className="px-4 py-2.5">
                      <span className={row.assignment_status === "ASSIGNED" ? "text-[#38a768]" : "text-[#2193e7]"}>
                        {row.assignment_status === "ASSIGNED" ? "Assigned" : "Unassigned"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[#5c646d]">{row.assigned_to ?? "-"}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedItem(row)}
                          className="rounded bg-[#ffefc8] p-1.5 text-[#f0a400]"
                          aria-label="view"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(row);
                            setAssignOpen(true);
                          }}
                          className="rounded bg-[#d9edff] p-1.5 text-[#0f79d1]"
                          aria-label="assign"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(row)}
                          className="rounded bg-[#ffe0e3] p-1.5 text-[#e14d58]"
                          aria-label="delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingItem(row);
                            setOpen(true);
                          }}
                          className="rounded border border-[#d9edff] p-1.5 text-[#0f79d1]"
                          aria-label="edit item"
                        >
                          <Pencil className="h-4 w-4" />
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
      </div>

      <AddItemModal
        key={editingItem?.id ?? "new-item"}
        open={open}
        item={editingItem}
        onClose={() => {
          setOpen(false);
          setEditingItem(null);
        }}
      />
      <AssignItemModal
        key={selectedItem?.id ?? "assign-item"}
        open={assignOpen}
        item={selectedItem}
        onClose={() => {
          setAssignOpen(false);
          setSelectedItem(null);
        }}
      />
      <Modal
        open={Boolean(selectedItem) && !assignOpen}
        title="Item Details"
        onClose={() => setSelectedItem(null)}
      >
        {selectedItem ? (
          <dl className="grid grid-cols-2 gap-4 text-sm text-slate-700">
            <Detail label="Title" value={selectedItem.title} />
            <Detail label="Item Number" value={selectedItem.item_number ?? "-"} />
            <Detail label="Serial Number" value={selectedItem.serial_number ?? "-"} />
            <Detail label="Type" value={selectedItem.item_type === "FIXED_ASSET" ? "Fixed Asset" : "Consumable"} />
            <Detail label="Amount" value={selectedItem.amount} />
            <Detail label="Status" value={selectedItem.status} />
            <Detail label="Assignment" value={selectedItem.assignment_status} />
            <Detail label="Assigned To" value={selectedItem.assigned_to ?? "-"} />
          </dl>
        ) : null}
      </Modal>
    </>
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
