"use client";

import { ChevronRight, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  useCreateAssignmentMutation,
  useGetItemsQuery,
  useGetOfficesQuery,
} from "@/app/redux/api";

interface AddAssignmentProps {
  open: boolean;
  onClose: () => void;
}

export function AddAssignment({ open, onClose }: AddAssignmentProps) {
  const { data: items = [] } = useGetItemsQuery();
  const { data: offices = [] } = useGetOfficesQuery();
  const [createAssignment, { isLoading }] = useCreateAssignmentMutation();

  const [itemId, setItemId] = useState<number | "">("");
  const [officeId, setOfficeId] = useState<number | "">("");
  const [handoverDate, setHandoverDate] = useState("");
  const [assignTill, setAssignTill] = useState("");
  const [condition, setCondition] = useState<"GOOD" | "FAIR" | "DAMAGED">("GOOD");
  const [remarks, setRemarks] = useState("");
  const [submitError, setSubmitError] = useState("");

  const assignableItems = useMemo(
    () => items.filter((item) => item.assignment_status !== "ASSIGNED"),
    [items]
  );

  if (!open) return null;

  const handleSubmit = async () => {
    setSubmitError("");

    if (!itemId || !officeId || !handoverDate) {
      setSubmitError("Item, Office and Handover Date are required.");
      return;
    }

    try {
      await createAssignment({
        item: itemId,
        assigned_to_office: officeId,
        handover_date: handoverDate,
        assign_till: assignTill || null,
        handover_condition: condition,
        status: "ASSIGNED",
        remarks,
      }).unwrap();

      setItemId("");
      setOfficeId("");
      setHandoverDate("");
      setAssignTill("");
      setCondition("GOOD");
      setRemarks("");
      onClose();
    } catch {
      setSubmitError("Failed to create assignment. Ensure item is not already assigned and you have permission.");
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
            <h2 className="text-lg font-semibold text-gray-900">Create Assignment</h2>
            <button type="button" onClick={onClose} aria-label="Close">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="px-8 py-3">
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Item"
              required
              value={String(itemId)}
              onChange={(e) => setItemId(e.target.value ? Number(e.target.value) : "")}
              options={assignableItems.map((i) => ({ value: String(i.id), label: `${i.title} (${i.item_number ?? "-"})` }))}
            />

            <FormSelect
              label="Assign To Office"
              required
              value={String(officeId)}
              onChange={(e) => setOfficeId(e.target.value ? Number(e.target.value) : "")}
              options={offices.map((o) => ({ value: String(o.id), label: o.name }))}
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

            <FormSelect
              label="Condition"
              required
              value={condition}
              onChange={(e) => setCondition(e.target.value as "GOOD" | "FAIR" | "DAMAGED")}
              options={[
                { value: "GOOD", label: "Good" },
                { value: "FAIR", label: "Fair" },
                { value: "DAMAGED", label: "Damaged" },
              ]}
            />
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium text-gray-700">
              Remarks
            </label>
            <textarea
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
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
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {isLoading ? "Saving..." : "Create Assignment"}
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
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
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
        className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-500 placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
