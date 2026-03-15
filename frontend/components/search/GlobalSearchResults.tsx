"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useGetAssignmentsQuery, useGetAuditsQuery, useGetCategoriesQuery, useGetItemsQuery, useGetStocksQuery, useGetStockTransactionsQuery } from "@/app/redux/api";
import { EmptyState } from "@/components/ui/EmptyState";
import { TablePagination } from "@/components/ui/TablePagination";
import { paginateItems } from "@/lib/pagination";

type SearchRow = {
  key: string;
  kind: "Item" | "Category" | "Stock" | "Stock Movement" | "Audit Log" | "Assignment";
  title: string;
  details: string;
};

function getRtkErrorMessage(error: unknown) {
  if (!error) {
    return null;
  }
  if (typeof error === "string") {
    return error;
  }
  if (typeof error === "object" && error) {
    const anyErr = error as { status?: unknown; error?: unknown; data?: unknown };
    const parts: string[] = [];
    if (anyErr.status != null) {
      parts.push(`Status: ${String(anyErr.status)}`);
    }
    if (anyErr.error != null) {
      parts.push(String(anyErr.error));
    }
    if (anyErr.data != null && typeof anyErr.data === "object") {
      const maybeDetail = (anyErr.data as { detail?: unknown }).detail;
      if (maybeDetail) {
        parts.push(String(maybeDetail));
      }
    }
    return parts.length ? parts.join(" • ") : "Request failed.";
  }
  return "Request failed.";
}

export function GlobalSearchResults({ query }: { query?: string }) {
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") ?? "";
  const effectiveQuery = queryFromUrl || query || "";
  const trimmed = effectiveQuery.trim();
  const shouldSearch = Boolean(trimmed);

  const {
    data: items = [],
    isFetching: isFetchingItems,
    error: itemsError,
  } = useGetItemsQuery(shouldSearch ? { search: trimmed } : undefined, {
    skip: !shouldSearch,
  });
  const {
    data: categories = [],
    isFetching: isFetchingCategories,
    error: categoriesError,
  } = useGetCategoriesQuery(shouldSearch ? { search: trimmed } : undefined, {
    skip: !shouldSearch,
  });
  const {
    data: stocks = [],
    isFetching: isFetchingStocks,
    error: stocksError,
  } = useGetStocksQuery(shouldSearch ? { search: trimmed } : undefined, {
    skip: !shouldSearch,
  });
  const {
    data: movements = [],
    isFetching: isFetchingMovements,
    error: movementsError,
  } = useGetStockTransactionsQuery(shouldSearch ? { search: trimmed } : undefined, {
    skip: !shouldSearch,
  });
  const {
    data: audits = [],
    isFetching: isFetchingAudits,
    error: auditsError,
  } = useGetAuditsQuery(shouldSearch ? { search: trimmed } : undefined, {
    skip: !shouldSearch,
  });
  const {
    data: assignments = [],
    isFetching: isFetchingAssignments,
    error: assignmentsError,
  } = useGetAssignmentsQuery(shouldSearch ? { search: trimmed } : undefined, {
    skip: !shouldSearch,
  });

  const isFetching =
    isFetchingItems ||
    isFetchingCategories ||
    isFetchingStocks ||
    isFetchingMovements ||
    isFetchingAudits ||
    isFetchingAssignments;

  const firstError =
    itemsError ||
    categoriesError ||
    stocksError ||
    movementsError ||
    auditsError ||
    assignmentsError;
  const errorMessage = getRtkErrorMessage(firstError);

  const rows = useMemo<SearchRow[]>(() => {
    if (!shouldSearch) {
      return [];
    }

    const merged: SearchRow[] = [];
    const itemById = new Map(items.map((item) => [item.id, item]));

    for (const item of items) {
      merged.push({
        key: `item-${item.id}`,
        kind: "Item",
        title: item.title,
        details: `${item.item_number ?? "-"} • ${item.item_type === "FIXED_ASSET" ? "Fixed Asset" : "Consumable"} • ${item.assignment_status}`,
      });
    }

    for (const category of categories) {
      merged.push({
        key: `category-${category.id}`,
        kind: "Category",
        title: category.name,
        details: category.is_consumable ? "Consumable" : "Fixed Asset",
      });
    }

    for (const stock of stocks) {
      const item = itemById.get(stock.item);
      merged.push({
        key: `stock-${stock.id}`,
        kind: "Stock",
        title: item?.title ?? `Item #${stock.item}`,
        details: `${item?.item_number ?? "-"} • Qty ${stock.quantity} ${stock.unit} • Min ${stock.min_threshold} • ${stock.stock_status.replaceAll("_", " ")}`,
      });
    }

    for (const movement of movements) {
      merged.push({
        key: `movement-${movement.id}`,
        kind: "Stock Movement",
        title: movement.item_name,
        details: `${movement.transaction_type.replaceAll("_", " ")} • Qty ${movement.quantity} • Balance ${movement.balance_after}`,
      });
    }

    for (const audit of audits) {
      merged.push({
        key: `audit-${audit.id}`,
        kind: "Audit Log",
        title: audit.item_name,
        details: `${audit.action_type} • ${audit.performed_by_name ?? "-"} • ${audit.remarks || "-"}`,
      });
    }

    for (const assignment of assignments) {
      merged.push({
        key: `assignment-${assignment.id}`,
        kind: "Assignment",
        title: assignment.item_name,
        details: `${assignment.status} • Assign till ${assignment.assign_till ?? "-"} • ${assignment.created_at.slice(0, 10)}`,
      });
    }

    return merged;
  }, [assignments, audits, categories, items, movements, shouldSearch, stocks]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [trimmed]);

  const paginated = useMemo(() => paginateItems(rows, page, pageSize), [page, pageSize, rows]);

  if (!shouldSearch) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center rounded-[1.2rem] bg-white">
        <EmptyState title="Search" description="Type a keyword in the top bar and press Enter." fit />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-[1.2rem] bg-white">
      <div className="flex flex-col gap-1 border-b border-[#eef2f3] px-4 py-3 sm:px-6 lg:shrink-0">
        <h2 className="text-[1rem] font-semibold tracking-[-0.03em] text-[#30363d]">
          Results for “{trimmed}”
        </h2>
        <p className="text-[0.82rem] text-[#7e8790]">
          {isFetching ? "Searching..." : `${rows.length} result(s)`}
        </p>
        {errorMessage ? <p className="text-[0.82rem] text-[#e14d58]">{errorMessage}</p> : null}
      </div>

      {rows.length === 0 ? (
        <div className="min-h-0 flex flex-1 overflow-auto">
          <EmptyState title="No Data Found" fit />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-x-auto px-4 pb-1 sm:px-6">
          <div className="h-full min-h-0 min-w-[920px] overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="sticky top-0 z-10 bg-[#f9fbfb] text-[#7e8790]">
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Result</th>
                  <th className="px-4 py-3 text-left font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {paginated.items.map((row) => (
                  <tr key={row.key} className="border-b border-[#eef2f3]">
                    <td className="px-4 py-3 text-[#5c646d]">{row.kind}</td>
                    <td className="px-4 py-3 font-medium text-[#31363c]">{row.title}</td>
                    <td className="px-4 py-3 text-[#5c646d]">{row.details}</td>
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
