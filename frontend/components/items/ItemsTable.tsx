"use client";

import React, { useState, useMemo } from "react";
import { TablePagination } from "@/components/ui/TablePagination";
import { AddItemModal } from "./AddItemModal";
import { AssignItemModal } from "./AssignItemModal";

const items = [
  {
    name: "Laptop - Dell 5420",
    type: "Laptop",
    category: "Fixed Asset",
    serial: "SN-DL5420-118",
    amount: "1 pcs",
    status: "Assigned",
    assignedTo: "H. Shrestha",
  },
  {
    name: "Laptop - Dell 5420",
    type: "Laptop",
    category: "Fixed Asset",
    serial: "SN-DL5420-118",
    amount: "1 pcs",
    status: "Assigned",
    assignedTo: "H. Shrestha",
  },
  {
    name: "Printer - HP M404",
    type: "Printer",
    category: "Fixed Asset",
    serial: "SN-HP404-118",
    amount: "3 pcs",
    status: "Unassigned",
    assignedTo: "-",
  },
  {
    name: "Toner Cartridge",
    type: "Consumables",
    category: "Consumable",
    serial: "SN-TC-118",
    amount: "5 pcs",
    status: "Low stock",
    assignedTo: "-",
  },
];

export function ItemsTable() {
  const [open, setOpen] = React.useState(false);
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const term = search.trim().toLowerCase();
    return items.filter(
      (row) =>
        row.name.toLowerCase().includes(term) ||
        row.serial.toLowerCase().includes(term) ||
        row.type.toLowerCase().includes(term) ||
        row.category.toLowerCase().includes(term) ||
        row.assignedTo.toLowerCase().includes(term)
    );
  }, [search]);

  return (
    <>
      <div className="flex h-[555px] flex-col rounded-xl bg-white">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="relative w-72">
            <input
              type="search"
              placeholder="Search Item"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Filter
            </button>

            <button
              onClick={() => setOpen(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add Item
            </button>

            <button className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100">
              Bulk import (CSV)
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="h-[380px] px-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500">
                <th className="px-4 py-3 text-left font-medium">Item Name</th>
                <th className="px-4 py-3 text-left font-medium">Item Type</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Serial</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Assigned To</th>
                <th className="px-4 py-3 text-left font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-gray-900">{row.name}</td>
                  <td className="px-4 py-3 text-gray-600">{row.type}</td>
                  <td className="px-4 py-3 text-gray-600">{row.category}</td>
                  <td className="px-4 py-3 text-gray-600">{row.serial}</td>
                  <td className="px-4 py-3 text-gray-600">{row.amount}</td>

                  <td className="px-4 py-3">
                    {row.status === "Assigned" && (
                      <span className="text-xs font-medium text-green-600">
                        Assigned
                      </span>
                    )}
                    {row.status === "Unassigned" && (
                      <span className="text-xs font-medium text-blue-600">
                        Unassigned
                      </span>
                    )}
                    {row.status === "Low stock" && (
                      <span className="text-xs font-medium text-red-600">
                        Low stock
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {row.assignedTo}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="h-8 w-8 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100">
                      ✏️ 
                      </button>
                      <button onClick={() => setAssignOpen(true)} className="h-8 w-8 rounded-md bg-amber-50 text-amber-600 hover:bg-amber-100">
                         👁
                      </button>
                      <button className="h-8 w-8 rounded-md bg-red-50 text-red-600 hover:bg-red-100">
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <TablePagination />
      </div>

      <AddItemModal open={open} onClose={() => setOpen(false)} />
      <AssignItemModal open={assignOpen} onClose={() => setAssignOpen(false)} />
    </>
  );
}