import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AuditTable } from "@/components/Audit-log/AuditTable";

export default function AuditLogsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#D9E1E1]">
      <DashboardHeader
        title="Audit Log"
        searchPlaceholder="Search"
        backHref="/stock"
      />
      <div className="p-6">
        <AuditTable />
      </div>
    </div>
  );
}
