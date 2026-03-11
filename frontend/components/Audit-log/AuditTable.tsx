"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Upload, Paperclip } from "lucide-react";
import { TablePagination } from "@/components/ui/TablePagination";

const historyData = [
  {
    date: "22 Jan 2026",
    action: "Stock In",
    qty: "+20",
    balance: 34,
    by: "Rajesh Shrestha",
    remarks: "Received from Province",
    invoice: true,
  },
  {
    date: "21 Jan 2026",
    action: "Stock Out",
    qty: "-50",
    balance: 14,
    by: "Panchaj Yadav",
    remarks: "Issued to Ward 12",
    invoice: true,
  },
  {
    date: "19 Jan 2026",
    action: "Damage",
    qty: "-5",
    balance: 15,
    by: "Sunil Thapa",
    remarks: "Damaged in transit",
    invoice: true,
  },
  {
    date: "18 Jan 2026",
    action: "Stock In",
    qty: "+30",
    balance: 20,
    by: "Madhav Chaudhary",
    remarks: "Replenishment",
    invoice: true,
  },
];

export function AuditTable() {
  const [search, setSearch] = useState("");

  const filteredHistory = useMemo(() => {
    if (!search.trim()) return historyData;
    const term = search.trim().toLowerCase();
    return historyData.filter(
      (row) =>
        row.date.toLowerCase().includes(term) ||
        row.action.toLowerCase().includes(term) ||
        row.by.toLowerCase().includes(term) ||
        row.remarks.toLowerCase().includes(term) ||
        String(row.balance).includes(term) ||
        row.qty.includes(term)
    );
  }, [search]);

  return (
    <div className="bg-white rounded-xl h-[555px] flex flex-col ">
      {/* Header */}
      <div className="px-6 pt-5">
        <h3 className="text-lg font-semibold text-gray-700">
          Stock Movement History (Audit Log)
        </h3>
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search Item"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>

          <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            <Upload className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 h-[380px] overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500">
              <th className="px-4 py-3 text-left font-medium">Timestamp</th>
              <th className="px-4 py-3 text-left font-medium">Action</th>
              <th className="px-4 py-3 text-left font-medium">Qty</th>
              <th className="px-4 py-3 text-left font-medium">
                Balance After
              </th>
              <th className="px-4 py-3 text-left font-medium">
                Performed By
              </th>
              <th className="px-4 py-3 text-left font-medium">Remarks</th>
              <th className="px-4 py-3 text-left font-medium">
                Attachments
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredHistory.map((row, i) => (
              <tr
                key={i}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-4 py-3 text-gray-600">{row.date}</td>
                <td className="px-4 py-3 text-gray-600">{row.action}</td>
                <td className="px-4 py-3 text-gray-600">{row.qty}</td>
                <td className="px-4 py-3 text-gray-600">{row.balance}</td>
                <td className="px-4 py-3 text-gray-600">{row.by}</td>
                <td className="px-4 py-3 text-gray-600">{row.remarks}</td>
                <td className="px-4 py-3">
                  {row.invoice && (
                    <button
                      title="View Invoice"
                      className="text-gray-500 hover:text-blue-600"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TablePagination />
    </div>
  );
}