import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { StockTable } from "@/components/Stock/StockTable";
import { StockHistoryTable } from "@/components/Stock/StockHistoryTable";

export default function StockPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#D9E1E1]">
      <DashboardHeader
        title="Stock"
        searchPlaceholder="Search"
        backHref="/items"
      />
      <div className="p-6">
        <StockTable />
        <StockHistoryTable />
      </div>
    </div>
  );
}
