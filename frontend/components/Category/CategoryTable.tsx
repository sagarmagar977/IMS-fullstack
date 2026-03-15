"use client";

import { useMemo, useState } from "react";
import { Briefcase, Eye, Package, Pencil, Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { TablePagination } from "@/components/ui/TablePagination";
import { CreateNewCategoryDrawer } from "./CreateNewCategory";
import { Modal } from "@/components/ui/Modal";
import { useDeleteCategoryMutation, useGetCategoriesQuery, useGetItemsQuery } from "@/app/redux/api";
import type { CategoryApi } from "@/app/redux/api";
import { paginateItems } from "@/lib/pagination";
import { EmptyState } from "@/components/ui/EmptyState";

export function CategoryTable() {
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: items = [] } = useGetItemsQuery();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [activeTab, setActiveTab] = useState<"fixed" | "consumable">("fixed");
  const [openCreateCategory, setOpenCreateCategory] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState<CategoryApi | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryApi | null>(null);
  const [showWithItemsOnly, setShowWithItemsOnly] = useState(false);
  const [feedback, setFeedback] = useState("");

  const rows = useMemo(() => {
    return categories
      .filter((row) => (activeTab === "fixed" ? !row.is_consumable : row.is_consumable))
      .filter((row) => {
        const matchesSearch = !search.trim() || row.name.toLowerCase().includes(search.trim().toLowerCase());
        const itemCount = items.filter((item) => item.category === row.id).length;
        const matchesUsage = !showWithItemsOnly || itemCount > 0;
      return matchesSearch && matchesUsage;
    })
    .map((row) => ({
      ...row,
      itemCount: items.filter((item) => item.category === row.id).length,
      assignedCount: items.filter((item) => item.category === row.id && item.assignment_status === "ASSIGNED").length,
    }));
  }, [activeTab, categories, items, search, showWithItemsOnly]);

  const paginated = useMemo(() => paginateItems(rows, page, pageSize), [page, pageSize, rows]);

  const handleDelete = async (category: CategoryApi) => {
    if (!window.confirm(`Delete "${category.name}"?`)) {
      return;
    }

    try {
      await deleteCategory(category.id).unwrap();
      setFeedback(`Deleted ${category.name}.`);
    } catch {
      setFeedback("Failed to delete category. It may still be in use.");
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white">
      <div className="px-4 pt-5 sm:px-6">
        <div className="flex justify-center border-b border-[#edf1f2]">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            <button
              onClick={() => {
                setActiveTab("fixed");
                setPage(1);
              }}
              className={`flex items-center gap-2 pb-3 text-sm font-medium ${
                activeTab === "fixed" ? "border-b-2 border-[#0f79d1] text-[#0f79d1]" : "text-[#727a83]"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              Fixed Assets
            </button>

            <button
              onClick={() => {
                setActiveTab("consumable");
                setPage(1);
              }}
              className={`flex items-center gap-2 pb-3 text-sm font-medium ${
                activeTab === "consumable" ? "border-b-2 border-[#0f79d1] text-[#0f79d1]" : "text-[#727a83]"
              }`}
            >
              <Package className="h-4 w-4" />
              Consumables
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f979f]" />
          <input
            type="search"
            placeholder="Search category"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[#d9e1e6] bg-[#fbfcfd] py-2.5 pl-10 pr-4 text-sm text-[#47515b]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setShowWithItemsOnly((current) => !current);
              setPage(1);
            }}
            className="flex items-center gap-2 rounded-lg border border-[#d9e1e6] px-4 py-2 text-sm text-[#5a626a]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showWithItemsOnly ? "With Items" : "All Categories"}
          </button>

          <button
            onClick={() => {
              setEditingCategory(null);
              setOpenCreateCategory(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-[#0f79d1] px-4 py-2 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            Create Category
          </button>
        </div>
      </div>

      {feedback ? <p className="px-6 pb-2 text-sm text-[#0f79d1]">{feedback}</p> : null}

      {rows.length === 0 ? (
        <div className="min-h-0 flex flex-1 overflow-auto">
          <EmptyState title="No Data Found" fit />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-x-auto px-4 sm:px-6">
          <div className="h-full min-h-0 min-w-[860px] overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="sticky top-0 z-10 bg-[#f9fbfb] text-[#7e8790]">
                  <th className="px-4 py-3 text-left font-medium">Category Name</th>
                  <th className="px-4 py-3 text-left font-medium">Item Type</th>
                  <th className="px-4 py-3 text-left font-medium">Items</th>
                  <th className="px-4 py-3 text-left font-medium">Assigned</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {paginated.items.map((row) => (
                  <tr key={row.id} className="border-b border-[#eef2f3]">
                    <td className="px-4 py-3 text-[#31363c]">{row.name}</td>
                    <td className="px-4 py-3 text-[#5c646d]">
                      {row.is_consumable ? "Consumable" : "Fixed Asset"}
                    </td>
                    <td className="px-4 py-3 text-[#5c646d]">{row.itemCount}</td>
                    <td className="px-4 py-3 text-[#5c646d]">{row.assignedCount}</td>
                    <td className="px-4 py-3 text-[#5c646d]">{row.itemCount > 0 ? "In Use" : "Ready"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedCategory(row)}
                          className="rounded bg-[#ffefc8] p-1.5 text-[#f0a400]"
                          aria-label="view"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingCategory(row);
                            setOpenCreateCategory(true);
                          }}
                          className="rounded bg-[#d9edff] p-1.5 text-[#0f79d1]"
                          aria-label="edit"
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

      <CreateNewCategoryDrawer
        key={editingCategory?.id ?? "new-category"}
        open={openCreateCategory}
        category={editingCategory}
        onClose={() => {
          setOpenCreateCategory(false);
          setEditingCategory(null);
        }}
      />

      <Modal
        open={Boolean(selectedCategory)}
        title="Category Details"
        onClose={() => setSelectedCategory(null)}
      >
        {selectedCategory ? (
          <dl className="grid grid-cols-2 gap-4 text-sm text-slate-700">
            <Detail label="Name" value={selectedCategory.name} />
            <Detail label="Type" value={selectedCategory.is_consumable ? "Consumable" : "Fixed Asset"} />
            <Detail
              label="Items"
              value={String(items.filter((item) => item.category === selectedCategory.id).length)}
            />
            <Detail
              label="Assigned"
              value={String(
                items.filter(
                  (item) => item.category === selectedCategory.id && item.assignment_status === "ASSIGNED"
                ).length
              )}
            />
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
