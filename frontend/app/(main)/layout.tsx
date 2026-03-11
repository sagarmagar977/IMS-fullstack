import { Sidebar } from "@/components/layout/Sidebar";
import { StoreProvider } from "@/app/providers/StoreProvider";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
      <StoreProvider>{children}</StoreProvider>
      
    </div>
  );
}
