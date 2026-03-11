"use client";

import { X, ChevronRight } from "lucide-react";

interface CreateNewCategoryDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CreateNewCategoryDrawer({
  open,
  onClose,
}: CreateNewCategoryDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-9999 flex bg-black/40 backdrop-blur-sm">
      {/* Spacer */}
      <div className="flex-1" />

      {/* Floating chevron */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-[650px] top-10 z-50 rounded-full border border-gray-200 bg-white p-3 shadow-md hover:bg-gray-50"
      >
        <ChevronRight className="h-5 w-5 text-gray-600" />
      </button>

      {/* Drawer */}
      <div className="relative flex h-full w-[640px] flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Create New Category
          </h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6">
          {/* Category name */}
          <FormInput label="Category Name" required placeholder="Enter category name" />

          {/* Add fields */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Add New Form Field Below
            </p>

            <div className="flex flex-wrap gap-3">
              <FieldButton label="Add Text" />
              <FieldButton label="Add Number" />
              <FieldButton label="Add Date" />
              <FieldButton label="Add Radio (Single Select)" />
              <FieldButton label="Add Checkbox" />
              <FieldButton label="Add File Upload" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-4 border-t bg-white px-8 py-5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <button
            onClick={onClose}
            className="rounded-lg border px-6 py-2 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= Reusable UI ================= */

function FormInput({
  label,
  required,
  placeholder,
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-400 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}
function FieldButton({ label }: { label: string }) {
  return (
    <button className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
      {label}
    </button>
  );
}
