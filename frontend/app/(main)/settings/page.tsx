import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SettingTable } from "@/components/setting/SettingTable";

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#D9E1E1]">
      <DashboardHeader
        title="Settings"
        searchPlaceholder="Search"
        backHref="/items"
      />
      <div className="p-6">
         <SettingTable />
      </div>
    </div>
  );
}
