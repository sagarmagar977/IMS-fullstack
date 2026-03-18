import { Suspense } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ItemsTable } from "@/components/items/ItemsTable";

export default function ItemsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#d9e1e1] lg:h-full lg:min-h-0">
      <DashboardHeader
        title="Items"
        searchPlaceholder="Search Item"
        backHref="/dashboard"
      />
      <div className="flex min-h-0 flex-1 px-4 pb-2 pt-2 sm:px-5 sm:pb-3 sm:pt-2.5 lg:overflow-hidden lg:px-6 lg:pb-2 lg:pt-2.5">
        <Suspense fallback={<div className="flex-1 rounded-xl bg-white" />}>
          <ItemsTable />
        </Suspense>
      </div>
    </div>
  );
}
