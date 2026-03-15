import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SettingTable } from "@/components/setting/SettingTable";

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#d0d8d8] lg:h-full lg:min-h-0">
      <DashboardHeader title="Settings" searchPlaceholder="Search settings" backHref="/dashboard" />
      <div className="flex min-h-0 flex-1 px-4 pb-2 pt-2 sm:px-6 sm:pb-3 sm:pt-3 lg:overflow-hidden lg:px-8 lg:pb-3 lg:pt-4">
        <div className="min-h-0 flex-1 overflow-auto">
          <SettingTable />
        </div>
      </div>
    </div>
  );
}
