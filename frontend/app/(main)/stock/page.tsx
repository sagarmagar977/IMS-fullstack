import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { StockTable } from "@/components/Stock/StockTable";
import { StockHistoryTable } from "@/components/Stock/StockHistoryTable";

export default function StockPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#d9e1e1] lg:h-full lg:min-h-0">
      <DashboardHeader
        title="Stock"
        searchPlaceholder="Search"
        backHref="/items"
      />
      <div className="flex min-h-0 flex-1 px-4 pb-2 pt-2 sm:px-5 sm:pb-3 sm:pt-2.5 lg:overflow-hidden lg:px-6 lg:pb-2 lg:pt-2.5">
        <div className="min-h-0 flex-1 overflow-y-auto scroll-smooth snap-y snap-mandatory">
          <section className="flex h-full snap-start snap-always py-2 sm:py-3">
            <StockTable />
          </section>
          <section className="flex h-full snap-start snap-always py-2 sm:py-3">
            <StockHistoryTable />
          </section>
        </div>
      </div>
    </div>
  );
}
