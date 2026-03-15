"use client";

import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, SlidersHorizontal, Trash2, Upload } from "lucide-react";
import { TablePagination } from "@/components/ui/TablePagination";
import { AddAssignment } from "./AddAssignment";
import { ViewAssignedItems } from "./ViewAssignedItems";
import { useGetAssignmentSummaryByAssigneeQuery } from "@/app/redux/api";
import { paginateItems } from "@/lib/pagination";
import { EmptyState } from "@/components/ui/EmptyState";

export function AssignmentTable() {
  const { data = [] } = useGetAssignmentSummaryByAssigneeQuery();
  const summaryRows = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const [openAddAssignment, setOpenAddAssignment] = useState(false);
  const [openViewAssignedItems, setOpenViewAssignedItems] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [summaryFilter, setSummaryFilter] = useState<"ALL" | "USERS" | "OFFICES" | "OVERDUE">("ALL");
  const [selectedAssignee, setSelectedAssignee] = useState<{
    userId: number | null;
    officeId: number | null;
    name: string;
  } | null>(null);
  const [viewMessage, setViewMessage] = useState("");

  const filteredRows = useMemo(() => {
    const baseRows = summaryRows.filter((row) => {
      if (summaryFilter === "USERS") {
        return Boolean(row.assigned_to_user);
      }
      if (summaryFilter === "OFFICES") {
        return Boolean(row.assigned_to_office);
      }
      if (summaryFilter === "OVERDUE") {
        return row.overdue > 0;
      }
      return true;
    });

    if (!search.trim()) {
      return baseRows;
    }
    const term = search.trim().toLowerCase();
    return baseRows.filter((row) => {
      const name = `${row.assigned_to_user__first_name ?? ""} ${row.assigned_to_user__last_name ?? ""}`.trim();
      return `${name} ${row.assigned_to_user__username ?? ""} ${row.assigned_to_office__name ?? ""}`.toLowerCase().includes(term);
    });
  }, [summaryFilter, summaryRows, search]);

  const paginated = useMemo(() => paginateItems(filteredRows, page, pageSize), [filteredRows, page, pageSize]);

  if (openViewAssignedItems) {
    return (
      <ViewAssignedItems
        open={openViewAssignedItems}
        assigneeUserId={selectedAssignee?.userId}
        assigneeOfficeId={selectedAssignee?.officeId}
        assigneeName={selectedAssignee?.name}
        onClose={() => setOpenViewAssignedItems(false)}
      />
    );
  }

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
              value={summaryFilter}
              onChange={(e) => {
                setSummaryFilter(e.target.value as "ALL" | "USERS" | "OFFICES" | "OVERDUE");
                setPage(1);
              }}
              className="bg-transparent text-sm outline-none"
              aria-label="Assignment summary filter"
            >
              <option value="ALL">All assignees</option>
              <option value="USERS">Users only</option>
              <option value="OFFICES">Offices only</option>
              <option value="OVERDUE">Overdue only</option>
            </select>
          </label>

          <button
            onClick={() => setOpenAddAssignment(true)}
            className="flex items-center gap-2 rounded-lg bg-[#0f79d1] px-4 py-2 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            Create Employee/ Department
          </button>

          <button
            onClick={() => {
              setOpenAddAssignment(true);
              setViewMessage("Use the form to create a new assignment record.");
            }}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[#0f79d1]"
          >
            <Upload className="h-4 w-4" />
            Quick Add
          </button>
        </div>
      </div>

      {viewMessage ? <p className="px-6 pb-2 text-sm text-[#0f79d1]">{viewMessage}</p> : null}

      {filteredRows.length === 0 ? (
        <div className="min-h-0 flex flex-1 overflow-auto">
          <EmptyState title="No Data Found" fit />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-x-auto px-4 pb-1 sm:px-6">
          <div className="h-full min-h-0 min-w-[940px] overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="sticky top-0 z-10 bg-[#f9fbfb] text-[#7e8790]">
                  <th className="px-4 py-3 text-left font-medium">Employee</th>
                  <th className="px-4 py-3 text-left font-medium">Designation</th>
                  <th className="px-4 py-3 text-left font-medium">Office/Department</th>
                  <th className="px-4 py-3 text-left font-medium">Total Items</th>
                  <th className="px-4 py-3 text-left font-medium">Active</th>
                  <th className="px-4 py-3 text-left font-medium">Overdue</th>
                  <th className="px-4 py-3 text-left font-medium">Returned</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {paginated.items.map((row, i) => {
                  const name =
                    `${row.assigned_to_user__first_name ?? ""} ${row.assigned_to_user__last_name ?? ""}`.trim() ||
                    row.assigned_to_user__username ||
                    "-";
                  return (
                    <tr
                      key={`${row.assigned_to_user}-${row.assigned_to_office}-${i}`}
                      className="border-b border-[#eef2f3]"
                    >
                      <td className="px-4 py-3 text-[#31363c]">{name}</td>
                      <td className="px-4 py-3 text-[#5c646d]">-</td>
                      <td className="px-4 py-3 text-[#5c646d]">{row.assigned_to_office__name ?? "-"}</td>
                      <td className="px-4 py-3 text-[#5c646d]">{row.total_items}</td>
                      <td className="px-4 py-3 text-[#5c646d]">{row.active}</td>
                      <td className="px-4 py-3 text-[#5c646d]">{row.overdue}</td>
                      <td className="px-4 py-3 text-[#5c646d]">{row.returned}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedAssignee({
                                userId: row.assigned_to_user,
                                officeId: row.assigned_to_office,
                                name,
                              });
                              setOpenViewAssignedItems(true);
                            }}
                            className="rounded bg-[#ffefc8] p-1.5 text-[#f0a400]"
                            aria-label="view"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAssignee({
                                userId: row.assigned_to_user,
                                officeId: row.assigned_to_office,
                                name,
                              });
                              setOpenViewAssignedItems(true);
                            }}
                            className="rounded bg-[#d9edff] p-1.5 text-[#0f79d1]"
                            aria-label="edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAssignee({
                                userId: row.assigned_to_user,
                                officeId: row.assigned_to_office,
                                name,
                              });
                              setOpenViewAssignedItems(true);
                              setViewMessage(`Manage or delete assignments for ${name} in the detail view.`);
                            }}
                            className="rounded bg-[#ffe0e3] p-1.5 text-[#e14d58]"
                            aria-label="delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
      <AddAssignment open={openAddAssignment} onClose={() => setOpenAddAssignment(false)} />
    </div>
  );
}
