import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ItemSummaryCards } from "@/components/dashboard/ItemSummaryCards";
import { RecentActivitiesTable } from "@/components/dashboard/RecentActivitiesTable";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#D9E1E1]">
      <DashboardHeader
        title="Dashboard"
        searchPlaceholder="Search"
        backHref="/items"
      />
      <div className="p-6 space-y-6">
        <ItemSummaryCards />
        <RecentActivitiesTable />
      </div>
    </div>
  );
}