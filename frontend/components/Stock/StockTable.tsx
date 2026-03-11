"use client";

import { Search, SlidersHorizontal, Plus, Upload } from "lucide-react";
import { TablePagination } from "@/components/ui/TablePagination";
import { useState, useMemo } from "react";
import { CreateTransaction } from "./CreateTransaction";

const stockData = [
    {
        name: "Toner Cartridge",
        category: "Toner",
        unit: "pcs",
        qty: 34,
        minQty: 20,
        status: "low",
        updated: "22 Jan 2026",
    },
    {
        name: "A4 Paper",
        category: "Stationery",
        unit: "ream",
        qty: 250,
        minQty: 100,
        status: "onboarding",
        updated: "22 Jan 2026",
    },
    {
        name: "Registration Form",
        category: "Forms",
        unit: "packet",
        qty: 55,
        minQty: 50,
        status: "onboarding",
        updated: "22 Jan 2026",
    },
    {
        name: "Ink Bottle",
        category: "Stationery",
        unit: "bottle",
        qty: 0,
        minQty: 10,
        status: "out",
        updated: "22 Jan 2026",
    },
];

export function StockTable() {
    const [openDrawer, setOpenDrawer] = useState(false);
    const [search, setSearch] = useState("");

    const filteredStock = useMemo(() => {
      if (!search.trim()) return stockData;
      const term = search.trim().toLowerCase();
      return stockData.filter(
        (row) =>
          row.name.toLowerCase().includes(term) ||
          row.category.toLowerCase().includes(term) ||
          row.unit.toLowerCase().includes(term) ||
          row.status.toLowerCase().includes(term)
      );
    }, [search]);

    return (
        <div className="bg-white rounded-xl h-[555px] flex flex-col">
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

                    <button
                        onClick={() => setOpenDrawer(true)}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        Create Transaction
                    </button>
                    <button
                        title="Upload File"
                        className="flex h-10 w-10 items-center justify-center rounded-lg  text-blue-500 "
                    >
                        <Upload className="h-4 w-4" />
                    </button>


                </div>
            </div>

            {/* Table */}
            <div className="px-6 h-[380px]">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500">
                            <th className="px-4 py-3 text-left font-medium">Item Name</th>
                            <th className="px-4 py-3 text-left font-medium">Category</th>
                            <th className="px-4 py-3 text-left font-medium">Unit</th>
                            <th className="px-4 py-3 text-left font-medium">Current Qty</th>
                            <th className="px-4 py-3 text-left font-medium">Min Qty</th>
                            <th className="px-4 py-3 text-left font-medium">Status</th>
                            <th className="px-4 py-3 text-left font-medium">Last Updated</th>
                            <th className="px-4 py-3 text-left font-medium">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredStock.map((row, i) => (
                            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-900">{row.name}</td>
                                <td className="px-4 py-3 text-gray-600">{row.category}</td>
                                <td className="px-4 py-3 text-gray-600">{row.unit}</td>
                                <td className="px-4 py-3 text-gray-600">{row.qty}</td>
                                <td className="px-4 py-3 text-gray-600">{row.minQty}</td>

                                <td className="px-4 py-3">
                                    {row.status === "low" && (
                                        <span className="text-red-600 text-xs font-medium">
                                            Low Stock
                                        </span>
                                    )}
                                    {row.status === "onboarding" && (
                                        <span className="text-blue-600 text-xs font-medium">
                                            ON BOARDING
                                        </span>
                                    )}
                                    {row.status === "out" && (
                                        <span className="text-purple-600 text-xs font-medium">
                                            Out of Stock
                                        </span>
                                    )}
                                </td>

                                <td className="px-4 py-3 text-gray-600">{row.updated}</td>

                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <button className="h-8 w-8 rounded-md bg-amber-50 text-amber-600 hover:bg-amber-100">
                                            👁
                                        </button>
                                        <button className="h-8 w-8 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100">
                                            ✏️
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

            <TablePagination />
            <CreateTransaction open={openDrawer} onClose={() => setOpenDrawer(false)} />
        </div>

    );
}