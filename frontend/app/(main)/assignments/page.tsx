import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AssignmentTable } from "@/components/Assignment/AssignmentTable";

export default function AssignmentsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#D9E1E1]">
      <DashboardHeader
        title="Assignments"
        searchPlaceholder="Search"
        backHref="/items"
      />
      <div className="p-6">
        <AssignmentTable />
      </div>
    </div>
  );
}
