"use client";

import { useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, Plus, Upload, Eye, Pencil, Trash2 } from "lucide-react";
import { TablePagination } from "@/components/ui/TablePagination";
import { AddAssignment } from "./AddAssignment";
import { Modal } from "@/components/ui/Modal";
import {
  useDeleteAssignmentMutation,
  useGetAssignmentsQuery,
  useGetItemsQuery,
  useUpdateAssignmentMutation,
} from "@/app/redux/api";
import { downloadCsv, getApiBaseUrl, uploadCsv } from "@/lib/csv";
import { paginateItems } from "@/lib/pagination";
import { EmptyState } from "@/components/ui/EmptyState";

interface ViewAssignedItemsProps {
  open: boolean;
  onClose: () => void;
  assigneeUserId?: number | null;
  assigneeOfficeId?: number | null;
  assigneeName?: string;
}

export function ViewAssignedItems({
  open,
  onClose,
  assigneeUserId,
  assigneeOfficeId,
  assigneeName,
}: ViewAssignedItemsProps) {
  const { data: assignments = [] } = useGetAssignmentsQuery();
  const { data: items = [] } = useGetItemsQuery();
  const [deleteAssignment] = useDeleteAssignmentMutation();
  const [updateAssignment] = useUpdateAssignmentMutation();
  const [search, setSearch] = useState("");
  const [openAddItem, setOpenAddItem] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ASSIGNED" | "RETURNED">("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredAssignments = useMemo(() => {
    const term = search.trim().toLowerCase();
    return assignments
      .filter((row) =>
        assigneeUserId != null
          ? row.assigned_to_user === assigneeUserId
          : assigneeOfficeId != null
            ? row.assigned_to_office === assigneeOfficeId
            : true
      )
      .filter((row) => statusFilter === "ALL" || row.status === statusFilter)
      .filter((row) => {
        const item = items.find((entry) => entry.id === row.item);
        return !term || `${row.item_name} ${row.item_number ?? ""} ${item?.assigned_to ?? ""}`.toLowerCase().includes(term);
      });
  }, [assignments, assigneeOfficeId, assigneeUserId, items, search, statusFilter]);

  const paginated = useMemo(
    () => paginateItems(filteredAssignments, page, pageSize),
    [filteredAssignments, page, pageSize]
  );
  const selectedAssignment = assignments.find((row) => row.id === selectedAssignmentId) ?? null;

  if (!open) return null;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white">
      <div className="flex items-center justify-between px-6 pt-6 lg:shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">
          Assigned Items{assigneeName ? `: ${assigneeName}` : ""}
        </h2>
        <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
          Back
        </button>
      </div>

      <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:shrink-0">
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search assignment"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <SlidersHorizontal className="h-4 w-4" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as "ALL" | "ASSIGNED" | "RETURNED");
                setPage(1);
              }}
              className="bg-transparent text-sm outline-none"
              aria-label="Assignment status filter"
            >
              <option value="ALL">All status</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="RETURNED">Returned</option>
            </select>
          </label>

          <button
            onClick={() => setOpenAddItem(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            onContextMenu={(event) => {
              event.preventDefault();
              downloadCsv("assignment-template.csv", [
                "item",
                "assigned_to_user",
                "assigned_to_office",
                "handover_date",
                "assign_till",
                "handover_condition",
                "status",
                "remarks",
              ]);
            }}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-blue-600"
          >
            <Upload className="h-4 w-4" />
            Bulk Import (CSV)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }
              try {
                const result = await uploadCsv(`${getApiBaseUrl()}item-assignments/bulk-import/`, file);
                setFeedback(`Import finished: ${result.created ?? 0} created, ${result.failed ?? 0} failed.`);
              } catch (error) {
                setFeedback(error instanceof Error ? error.message : "Import failed.");
              } finally {
                event.target.value = "";
              }
            }}
            className="hidden"
          />
        </div>
      </div>

      {feedback ? <p className="px-6 pb-2 text-sm text-blue-600">{feedback}</p> : null}

      {paginated.items.length === 0 ? (
        <div className="min-h-0 flex flex-1 overflow-auto">
          <EmptyState title="No Data Found" compact fit />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-x-auto px-4 pb-1 sm:px-6">
          <div className="h-full min-h-0 min-w-[860px] overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="sticky top-0 z-10 bg-gray-50 text-gray-500">
                  <th className="px-4 py-3 text-left font-medium">Item</th>
                  <th className="px-4 py-3 text-left font-medium">Item Number</th>
                  <th className="px-4 py-3 text-left font-medium">Handover Date</th>
                  <th className="px-4 py-3 text-left font-medium">Assign Till</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {paginated.items.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{row.item_name}</td>
                    <td className="px-4 py-3 text-gray-600">{row.item_number ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{row.created_at.slice(0, 10)}</td>
                    <td className="px-4 py-3 text-gray-600">{row.assign_till ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{row.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedAssignmentId(row.id)}
                          className="rounded bg-[#ffefc8] p-1.5 text-[#f0a400]"
                          aria-label="view"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await updateAssignment({
                                id: row.id,
                                status: row.status === "ASSIGNED" ? "RETURNED" : "ASSIGNED",
                                returned_at: row.status === "ASSIGNED" ? new Date().toISOString() : null,
                                return_condition: row.status === "ASSIGNED" ? "GOOD" : null,
                              }).unwrap();
                              setFeedback(
                                row.status === "ASSIGNED"
                                  ? `Marked ${row.item_name} as returned.`
                                  : `Marked ${row.item_name} as assigned.`
                              );
                            } catch {
                              setFeedback("Failed to update assignment status.");
                            }
                          }}
                          className="rounded bg-[#d9edff] p-1.5 text-[#0f79d1]"
                          aria-label="toggle status"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm(`Delete assignment for ${row.item_name}?`)) {
                              return;
                            }
                            try {
                              await deleteAssignment(row.id).unwrap();
                              setFeedback(`Deleted assignment for ${row.item_name}.`);
                            } catch {
                              setFeedback("Failed to delete assignment.");
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

      <div className="border-t border-gray-100 px-4 pb-2 pt-1 sm:px-6 lg:shrink-0">
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

      <AddAssignment open={openAddItem} onClose={() => setOpenAddItem(false)} />

      <Modal
        open={Boolean(selectedAssignment)}
        title="Assignment Details"
        onClose={() => setSelectedAssignmentId(null)}
      >
        {selectedAssignment ? (
          <dl className="grid grid-cols-2 gap-4 text-sm text-slate-700">
            <Detail label="Item" value={selectedAssignment.item_name} />
            <Detail label="Item Number" value={selectedAssignment.item_number ?? "-"} />
            <Detail label="Status" value={selectedAssignment.status} />
            <Detail label="Assign Till" value={selectedAssignment.assign_till ?? "-"} />
            <Detail label="Created At" value={selectedAssignment.created_at} />
            <Detail
              label="Target"
              value={
                selectedAssignment.assigned_to_office != null
                  ? `Office #${selectedAssignment.assigned_to_office}`
                  : selectedAssignment.assigned_to_user != null
                    ? `User #${selectedAssignment.assigned_to_user}`
                    : "-"
              }
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
