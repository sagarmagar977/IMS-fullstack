"use client";

import { useState } from "react";
import { X, ChevronRight } from "lucide-react";
import { useCreateAssignmentMutation, useGetOfficesQuery } from "@/app/redux/api";
import type { InventoryItemApi } from "@/app/redux/api";

interface AssignItemModalProps {
  open: boolean;
  onClose: () => void;
  item?: InventoryItemApi | null;
}

export function AssignItemModal({ open, onClose, item }: AssignItemModalProps) {
  const { data: offices = [] } = useGetOfficesQuery();
  const [createAssignment, { isLoading }] = useCreateAssignmentMutation();
  const [officeId, setOfficeId] = useState<number | "">("");
  const [handoverDate, setHandoverDate] = useState("");
  const [assignTill, setAssignTill] = useState("");
  const [remarks, setRemarks] = useState(item ? `Assigned from ${item.title}` : "");
  const [submitError, setSubmitError] = useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    if (!item || !officeId || !handoverDate) {
      setSubmitError("Item, office and handover date are required.");
      return;
    }

    try {
      await createAssignment({
        item: item.id,
        assigned_to_office: officeId,
        handover_date: handoverDate,
        assign_till: assignTill || null,
        status: "ASSIGNED",
        remarks: remarks.trim(),
      }).unwrap();
      onClose();
    } catch {
      setSubmitError("Failed to assign this item. Check office selection and permissions.");
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

      <div className="relative flex h-full w-[640px] flex-col bg-white shadow-xl ">
        <div className="flex items-center justify-between px-8 py-6">
          <h2 className="text-lg font-semibold text-gray-900">Assign Item</h2>
          <button type="button" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="px-8 py-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Item Name" value={item?.title ?? ""} readOnly />
            <FormInput label="Item Number" value={item?.item_number ?? ""} readOnly />

            <FormSelect
              label="Assign To Office"
              required
              value={String(officeId)}
              onChange={(e) => setOfficeId(e.target.value ? Number(e.target.value) : "")}
              options={offices.map((office) => ({ value: String(office.id), label: office.name }))}
            />
            <FormInput
              label="Handover Date"
              required
              type="date"
              value={handoverDate}
              onChange={(e) => setHandoverDate(e.target.value)}
            />

            <FormInput
              label="Assign Till"
              type="date"
              value={assignTill}
              onChange={(e) => setAssignTill(e.target.value)}
            />
            <FormInput label="Remarks" placeholder="Add assignment remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>

          {submitError ? <p className="mt-4 text-sm font-medium text-red-600">{submitError}</p> : null}
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
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {isLoading ? "Saving..." : "Assign"}
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
      <label className="text-sm font-medium text-gray-700 ">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
      <label className="text-sm font-medium text-gray-700 ">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">Choose {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
