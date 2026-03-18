import { Suspense } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ItemSummaryCards } from "@/components/dashboard/ItemSummaryCards";
import { RecentActivitiesTable } from "@/components/dashboard/RecentActivitiesTable";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#d0d8d8] lg:h-full lg:min-h-0">
      <DashboardHeader
        title="Dashboard"
        searchPlaceholder="Search"
        backHref="/items"
      />
      <div className="flex min-h-0 w-full flex-1 flex-col gap-2 px-4 py-2.5 sm:px-5 lg:px-6 lg:overflow-hidden lg:py-2">
        <ItemSummaryCards />
        <Suspense fallback={<div className="min-h-[20rem] rounded-[1.2rem] border border-[#e5ecec] bg-white" />}>
          <RecentActivitiesTable />
        </Suspense>
      </div>
    </div>
  );
}
