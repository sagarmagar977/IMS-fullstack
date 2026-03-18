"use client";

import { ChevronRight, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  useCreateStockTransactionMutation,
  useGetItemsQuery,
  useGetStocksQuery,
} from "@/app/redux/api";

interface CreateTransactionProps {
  open: boolean;
  onClose: () => void;
  initialStockId?: number | null;
  initialTransactionType?: "STOCK_IN" | "STOCK_OUT" | "DAMAGE" | "ADJUSTMENT";
}

export function CreateTransaction({
  open,
  onClose,
  initialStockId,
  initialTransactionType = "STOCK_IN",
}: CreateTransactionProps) {
  const { data: stocks = { items: [], totalItems: 0, next: null, previous: null } } = useGetStocksQuery({ page_size: 1000 });
  const { data: items = { items: [], totalItems: 0, next: null, previous: null } } = useGetItemsQuery({ page_size: 1000 });
  const [createTransaction, { isLoading }] = useCreateStockTransactionMutation();

  const [stockId, setStockId] = useState<number | "">(initialStockId ?? "");
  const [transactionType, setTransactionType] = useState<
    "STOCK_IN" | "STOCK_OUT" | "DAMAGE" | "ADJUSTMENT"
  >(initialTransactionType);
  const [quantity, setQuantity] = useState("1");
  const [amount, setAmount] = useState("0");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [submitError, setSubmitError] = useState("");

  const stockOptions = useMemo(() => {
    return stocks.items.map((s) => {
      const item = items.items.find((i) => i.id === s.item);
      const label = item ? `${item.title} (Qty: ${s.quantity})` : `Stock #${s.id}`;
      return { value: String(s.id), label };
    });
  }, [items.items, stocks.items]);

  if (!open) return null;

  const handleSubmit = async () => {
    setSubmitError("");
    if (!stockId || !quantity) {
      setSubmitError("Stock and Quantity are required.");
      return;
    }

    try {
      await createTransaction({
        stock: stockId,
        transaction_type: transactionType,
        quantity,
        amount,
        department: department.trim(),
        description: description.trim(),
      }).unwrap();

      setStockId("");
      setTransactionType("STOCK_IN");
      setQuantity("1");
      setAmount("0");
      setDepartment("");
      setDescription("");
      onClose();
    } catch {
      setSubmitError("Failed to create stock transaction. Check quantity and permissions.");
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
        <div className="flex items-center justify-between px-8 py-6">
          <h2 className="text-lg font-semibold text-gray-900">Consumables Stock Transaction</h2>
          <button type="button" onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="px-8 py-3">
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Transaction"
              required
              value={transactionType}
              onChange={(e) =>
                setTransactionType(
                  e.target.value as "STOCK_IN" | "STOCK_OUT" | "DAMAGE" | "ADJUSTMENT"
                )
              }
              options={[
                { value: "STOCK_IN", label: "Stock In" },
                { value: "STOCK_OUT", label: "Stock Out" },
                { value: "DAMAGE", label: "Damage" },
                { value: "ADJUSTMENT", label: "Adjustment" },
              ]}
            />

            <FormSelect
              label="Item"
              required
              value={String(stockId)}
              onChange={(e) => setStockId(e.target.value ? Number(e.target.value) : "")}
              options={stockOptions}
            />

            <FormInput
              label="Quantity"
              required
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />

            <FormInput
              label="Amount"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <FormInput
              label="Department"
              placeholder="Choose department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
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
              placeholder="Input description"
              className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {submitError && <p className="mt-4 text-sm font-medium text-red-600">{submitError}</p>}
        </div>

        <div className="flex justify-center gap-4 border-t px-8 py-5 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <button
            onClick={onClose}
            className="rounded-lg border px-6 py-2 text-gray-700 hover:bg-gray-100 "
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {isLoading ? "Saving..." : "Add"}
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
        className="mt-2 w-full rounded-lg border border-gray-300 text-gray-700 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
        className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
