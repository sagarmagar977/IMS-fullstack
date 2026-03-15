"use client";

import { ChevronRight, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  useGetAssetTypesQuery,
  useCreateFixedAssetMutation,
  useCreateItemMutation,
  useGetCategoriesQuery,
  useGetOfficesQuery,
  useUpdateItemMutation,
} from "@/app/redux/api";
import type { InventoryItemApi } from "@/app/redux/api";

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  item?: InventoryItemApi | null;
}

export function AddItemModal({ open, onClose, item }: AddItemModalProps) {
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: offices = [] } = useGetOfficesQuery();
  const { data: assetTypes = [] } = useGetAssetTypesQuery();
  const [createItem, { isLoading }] = useCreateItemMutation();
  const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();
  const [createFixedAsset] = useCreateFixedAssetMutation();

  const [title, setTitle] = useState(item?.title ?? "");
  const [itemNumber, setItemNumber] = useState(item?.item_number ?? "");
  const [serialNumber, setSerialNumber] = useState(item?.serial_number ?? "");
  const [itemType, setItemType] = useState<"FIXED_ASSET" | "CONSUMABLE">(item?.item_type ?? "FIXED_ASSET");
  const [categoryId, setCategoryId] = useState<number | "">(item?.category ?? "");
  const [officeId, setOfficeId] = useState<number | "">(item?.office ?? "");
  const [amount, setAmount] = useState(item?.amount ?? "1");
  const [price, setPrice] = useState("0");
  const [description, setDescription] = useState("");
  const [submitError, setSubmitError] = useState("");
  const isEditMode = Boolean(item);

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) =>
        itemType === "CONSUMABLE" ? category.is_consumable : !category.is_consumable
      ),
    [categories, itemType]
  );

  if (!open) return null;

  const handleSubmit = async () => {
    setSubmitError("");
    if (!title.trim() || !categoryId || !officeId) {
      setSubmitError("Item Name, Category and Office are required.");
      return;
    }

    try {
      if (isEditMode && item) {
        await updateItem({
          id: item.id,
          title: title.trim(),
          item_number: itemNumber.trim() || null,
          category: categoryId,
          office: officeId,
          item_type: itemType,
          status: item.status,
          amount,
          price,
          description: description.trim(),
        }).unwrap();
      } else {
        const created = await createItem({
          title: title.trim(),
          item_number: itemNumber.trim() || null,
          category: categoryId,
          office: officeId,
          item_type: itemType,
          status: "ACTIVE",
          amount,
          price,
          description: description.trim(),
        }).unwrap();

        await createFixedAsset({
          item: created.id,
          serial_number: serialNumber.trim(),
        }).unwrap();
      }

      onClose();
      setTitle("");
      setItemNumber("");
      setSerialNumber("");
      setItemType("FIXED_ASSET");
      setCategoryId("");
      setOfficeId("");
      setAmount("1");
      setPrice("0");
      setDescription("");
    } catch {
      setSubmitError(`Failed to ${isEditMode ? "update" : "create"} item. Check permissions and required values.`);
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex bg-black/40 backdrop-blur-sm">
      <div className="flex-1" />
      <button
        type="button"
        onClick={onClose}
        className="absolute right-[650px] top-10 z-50 rounded-full border border-gray-200 bg-white p-3 shadow-md hover:bg-gray-50"
        aria-label="Close drawer"
      >
        <ChevronRight className="h-5 w-5 text-gray-600" />
      </button>

      <div className="relative flex h-full w-[640px] flex-col bg-white shadow-xl overflow-y-auto">
        <div>
          <div className="flex items-center justify-between px-8 py-6">
            <h2 className="text-lg font-semibold text-gray-900">{isEditMode ? "Edit Item" : "Add New Item"}</h2>
            <button type="button" onClick={onClose} aria-label="Close">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="px-8 pb-6 flex flex-col gap-2 text-sm text-gray-700">
            <p>Select one of the two PRD item types: Fixed Asset or Consumable.</p>
          </div>
        </div>

        <div className="px-8 py-3">
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Type"
              required
              value={itemType}
              onChange={(e) => {
                const nextType = e.target.value as "FIXED_ASSET" | "CONSUMABLE";
                setItemType(nextType);
                setCategoryId("");
              }}
              options={
                assetTypes.length
                  ? assetTypes.map((type) => ({
                      value: type.code,
                      label: type.label,
                    }))
                  : [
                      { value: "FIXED_ASSET", label: "Fixed Asset" },
                      { value: "CONSUMABLE", label: "Consumable" },
                    ]
              }
            />

            <FormSelect
              label="Category"
              required
              value={String(categoryId)}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
              options={filteredCategories.map((c) => ({
                value: String(c.id),
                label: `${c.name} (${c.is_consumable ? "Consumable" : "Fixed Asset"})`,
              }))}
            />

            <FormSelect
              label="Office"
              required
              value={String(officeId)}
              onChange={(e) => setOfficeId(e.target.value ? Number(e.target.value) : "")}
              options={offices.map((o) => ({ value: String(o.id), label: o.name }))}
            />

            <FormInput
              label="Item Name"
              required
              placeholder="Enter item name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <FormInput
              label="Item Number"
              placeholder="Enter item number"
              value={itemNumber}
              onChange={(e) => setItemNumber(e.target.value)}
            />

            <FormInput
              label="Serial Number"
              placeholder="Enter serial number"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
            />

            <FormInput
              label="Amount"
              required
              placeholder="Enter quantity"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <FormInput
              label="Price"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {submitError && <p className="mt-4 text-sm font-medium text-red-600">{submitError}</p>}
        </div>

        <div className="flex justify-center gap-4 border-t px-8 py-5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
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

function FormInput({
  label,
  required,
  placeholder,
  type = "text",
  value,
  onChange,
  readOnly = false,
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-700 placeholder-gray-400 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}

function FormSelect({
  label,
  required,
  value,
  onChange,
  options,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">Choose {label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
