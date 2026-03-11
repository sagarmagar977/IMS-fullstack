import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { CategoryTable } from "@/components/Category /CategoryTable";

export default function CategoriesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#D9E1E1]">
      <DashboardHeader
        title="Categories"
        searchPlaceholder="Search"
        backHref="/items"
      />
      <div className="p-6">
        <CategoryTable />
      </div>
    </div>
  );
}
