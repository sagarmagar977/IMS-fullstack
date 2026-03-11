"use client";

import { X, ChevronRight } from "lucide-react";

interface AssignItemModalProps {
  open: boolean;
  onClose: () => void;
}

export function AssignItemModal({ open, onClose }: AssignItemModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-9999 flex bg-black/40 backdrop-blur-sm">
      {/* Spacer */}
      <div className="flex-1" />

      {/* Floating chevron button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-[650px] top-10 z-50 rounded-full border border-gray-200 bg-white p-3 shadow-md hover:bg-gray-50"
      >
        <ChevronRight className="h-5 w-5 text-gray-600" />
      </button>

      {/* Drawer */}
      <div className="relative flex h-full w-[640px] flex-col bg-white shadow-xl ">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Assign Item
          </h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Item Name" value="Laptop - Dell 5420" />
            <FormInput label="Item Number" value="Laptop - Dell 5420" />

            <FormSelect label="Assign To" required />
            <FormInput label="Item Name" required placeholder="Enter item name" />

            <FormSelect label="Assign Till" required />
            <FormInput label="Item Name" required placeholder="Enter item name" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-4 px-8 py-5 bg-white border-t shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">          <button
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

/* ================= Reusable ================= */

function FormInput({
  label,
  required,
  placeholder,
  value,
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  value?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 ">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        defaultValue={value}
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-400 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}

function FormSelect({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 ">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-400 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
        <option className="text-gray-400">Choose {label}</option>
      </select>
    </div>
  );
}