"use client";

import { useState } from "react";
import { X, ChevronRight } from "lucide-react";
import { useCreateCategoryMutation, useUpdateCategoryMutation } from "@/app/redux/api";
import type { CategoryApi } from "@/app/redux/api";

interface CreateNewCategoryDrawerProps {
  open: boolean;
  onClose: () => void;
  category?: CategoryApi | null;
}

export function CreateNewCategoryDrawer({
  open,
  onClose,
  category,
}: CreateNewCategoryDrawerProps) {
  const [name, setName] = useState(category?.name ?? "");
  const [isConsumable, setIsConsumable] = useState(category?.is_consumable ?? false);
  const [submitError, setSubmitError] = useState("");
  const [createCategory, { isLoading }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const isEditMode = Boolean(category);

  if (!open) return null;

  const handleSubmit = async () => {
    setSubmitError("");
    if (!name.trim()) {
      setSubmitError("Category name is required.");
      return;
    }

    try {
      if (category) {
        await updateCategory({ id: category.id, name: name.trim(), is_consumable: isConsumable }).unwrap();
      } else {
        await createCategory({ name: name.trim(), is_consumable: isConsumable }).unwrap();
      }
      setName("");
      setIsConsumable(false);
      onClose();
    } catch {
      setSubmitError(`Failed to ${isEditMode ? "update" : "create"} category. Check permissions and input values.`);
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex bg-black/40 backdrop-blur-sm">
      <div className="flex-1" />

      <button
        type="button"
        onClick={onClose}
        className="absolute right-[650px] top-10 z-50 rounded-full border border-gray-200 bg-white p-3 shadow-md hover:bg-gray-50"
      >
        <ChevronRight className="h-5 w-5 text-gray-600" />
      </button>

      <div className="relative flex h-full w-[640px] flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between px-8 py-6">
          <h2 className="text-lg font-semibold text-gray-900">{isEditMode ? "Edit Category" : "Create New Category"}</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-700 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isConsumable}
                onChange={(e) => setIsConsumable(e.target.checked)}
              />
              Mark as consumable category
            </label>
            <p className="mt-2 text-xs text-gray-500">
              PRD alignment: use this to separate fixed assets from consumables.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Add New Form Field Below</p>
            <div className="flex flex-wrap gap-3">
              <FieldButton label="Add Text" />
              <FieldButton label="Add Number" />
              <FieldButton label="Add Date" />
              <FieldButton label="Add Radio (Single Select)" />
              <FieldButton label="Add Checkbox" />
              <FieldButton label="Add File Upload" />
            </div>
          </div>

          {submitError && <p className="text-sm font-medium text-red-600">{submitError}</p>}
        </div>

        <div className="flex justify-center gap-4 border-t bg-white px-8 py-5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <button
            onClick={onClose}
            className="rounded-lg border px-6 py-2 text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isLoading || isUpdating}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {isLoading || isUpdating ? "Saving..." : isEditMode ? "Save Changes" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      {label}
    </button>
  );
}
