"use client";

import { ChevronRight, X } from "lucide-react";

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddItemModal({ open, onClose }: AddItemModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-9999 flex bg-black/40 backdrop-blur-sm">
      {/* Spacer (overlay click does not close, use chevron / buttons instead) */}
      <div className="flex-1" />
      <button
        type="button"
        onClick={onClose}
        className="absolute right-[650px] top-10 z-50 
                   rounded-full border border-gray-200 
                   bg-white p-3 shadow-md hover:bg-gray-50"
        aria-label="Close drawer"
      >
        <ChevronRight className="h-5 w-5 text-gray-600" />
      </button>


      {/* Right Drawer */}
      <div className="relative flex h-full w-[640px] flex-col bg-white shadow-xl overflow-y-auto">
        {/* Header */}
        <div>
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Add New Item
            </h2>
            <button type="button" onClick={onClose} aria-label="Close">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Checkboxes */}
          <div className="px-8 pb-6 flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" className="w-4 h-4" />
              Fixed Asset
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" className="w-4 h-4" />
              Consumable Item
            </label>
          </div>
        </div>

        {/* Body */}
        <div className=" px-8 py-3">



          {/* Form Grid */}
          <div className="grid grid-cols-2 gap-4 ">
            {/* LEFT COLUMN */}

            <FormInput label="Type" required placeholder="Choose type" />
            <FormInput label="Item Name" required placeholder="Enter item name" />

            <FormFile label="Image" required />
            <FormSelect label="Status" required />

            <FormInput label="Serial Number" required placeholder="Enter serial number" />
            <FormInput label="Item Number" required placeholder="Enter item number" />

            <FormSelect label="Assigned To" required />
            <FormInput label="Amount" required placeholder="Enter amount" />

            <FormInput label="Price" required placeholder="Enter price" />
            <FormInput label="Date of Purchased" required placeholder="dd/mm/yyyy" type="date" />

            <FormSelect label="Currency" required />
            <FormFile label="PI Document" required />

            <FormSelect label="Store" required />
            <FormSelect label="Project" required />

            <FormSelect label="Department" required />
            <FormSelect label="Category" required />

            <FormFile label="Warranty" required />
            <FormSelect label="Manufacturer" required />
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder=""
              className="mt-2 w-full rounded-lg border border-gray-300 
             bg-gray-50 px-4 py-2 text-sm text-gray-700 
             placeholder-gray-300
             focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center gap-4 border-t px-8 py-5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
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

/* ================== Reusable Inputs ================== */

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
        className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-700 placeholder-gray-400 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
      <select className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-400 placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
        <option className="text-gray-400">Choose {label}</option>
      </select>
    </div>
  );
}
function FormFile({
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
      <input
        type="file"
        className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-400 placeholder-gray-500 px-4 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-600 hover:file:bg-blue-100"
      />
    </div>
    
  );
}
