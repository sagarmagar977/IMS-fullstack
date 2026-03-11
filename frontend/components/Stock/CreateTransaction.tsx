"use client";

import { ChevronRight, X, Upload } from "lucide-react";

interface CreateTransactionProps {
  open: boolean;
  onClose: () => void;
}

export function CreateTransaction({
  open,
  onClose,
}: CreateTransactionProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-9999 flex bg-black/40 backdrop-blur-sm">
      {/* Spacer */}
      <div className="flex-1" />

      {/* Floating chevron button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-[650px]  top-10 z-50 
                   rounded-full border border-gray-200 
                   bg-white p-3 shadow-md hover:bg-gray-50"
        aria-label="Close drawer"
      >
        <ChevronRight className="h-5 w-5 text-gray-600" />
      </button>

      {/* Drawer */}
      <div className="relative flex h-full w-[640px] flex-col bg-white shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Consumables Stock Transaction
          </h2>
          <button type="button" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-3">
          <div className="grid grid-cols-2 gap-4">
            <FormSelect label="Transaction" required />
            <FormInput label="Item Name" required placeholder="Enter item name" />

            <FormFile label="Image" />
            <FormSelect label="Status" required />

            <FormInput label="Quantity Details" placeholder="Quantity" />
            <FormInput label="Item Number" placeholder="Enter item number" />

            <FormSelect label="Assigned To" />
            <FormInput label="Amount" placeholder="Enter amount" />

            <FormSelect label="Department" required />
            <FormSelect label="Category" />
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="text-sm font-medium text-gray-700 ">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Input description"
              className="mt-2 w-full rounded-lg border border-gray-300 
              bg-gray-50 px-4 py-2 text-sm text-gray-700 
              focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-4 border-t px-8 py-5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <button
            onClick={onClose}

            className="rounded-lg border px-6 py-2 text-gray-700 hover:bg-gray-100 "
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

/* ================= reusable inputs ================= */

function FormInput({
  label,
  required,
  placeholder,
  type = "text",
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-gray-300 text-gray-700 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
        <option>Choose {label}</option>
      </select>
    </div>
  );
}

function FormFile({
  label,
}: {
  label: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-2 relative">
        <input
          type="file"
          className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-600 hover:file:bg-blue-100"
        />
        <Upload className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}