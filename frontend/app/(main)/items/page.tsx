import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ItemsTable } from "@/components/items/ItemsTable";

export default function ItemsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#D9E1E1]">
      <DashboardHeader
        title="Items"
        searchPlaceholder="Search Item"
        backHref="/dashboard"
      />
      <div className="p-6">
        <ItemsTable />
      </div>
    </div>
  );
}