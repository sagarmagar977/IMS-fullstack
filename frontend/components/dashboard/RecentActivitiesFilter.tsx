"use client";

import type { ActivitiesFilterState } from "@/types";

type RecentActivitiesFilterProps = {
  open: boolean;
  draft: ActivitiesFilterState;
  onChangeDraft: (next: ActivitiesFilterState) => void;
  onReset: () => void;
  onApply: () => void;
  onClose: () => void;
};

export function RecentActivitiesFilter({
  open,
  draft,
  onChangeDraft,
  onReset,
  onApply,
  onClose,
}: RecentActivitiesFilterProps) {
  if (!open) return null;

  const update = (partial: Partial<ActivitiesFilterState>) =>
    onChangeDraft({ ...draft, ...partial });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Filter"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Filter</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Select Date</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                type="date"
                value={draft.from}
                onChange={(e) => update({ from: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-label="From date"
              />
              <input
                type="date"
                value={draft.to}
                onChange={(e) => update({ to: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-label="To date"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              value={draft.category}
              onChange={(e) =>
                update({ category: e.target.value as ActivitiesFilterState["category"] })
              }
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              aria-label="Category"
            >
              <option value="">All</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Office">Office</option>
            </select>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">Select Item Type</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(["Fixed Asset", "Consumable"] as const).map((t) => (
                <label
                  key={t}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
                >
                  <input
                    type="radio"
                    name="itemType"
                    value={t}
                    checked={draft.itemType === t}
                    onChange={() => update({ itemType: t })}
                  />
                  {t}
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => update({ itemType: "" })}
              className="mt-2 text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              Clear item type
            </button>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">Select Item Status</p>
            <div className="mt-2 space-y-2">
              {(["Assigned", "Unassigned", "Damaged"] as const).map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={draft.status === s}
                    onChange={() => update({ status: s })}
                  />
                  {s}
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => update({ status: "" })}
              className="mt-2 text-xs font-medium text-gray-500 hover:text-gray-700"
            >
              Clear status
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onReset}
            className="text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onApply}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

