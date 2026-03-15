"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  PanelLeftClose,
  Folder,
  House,
  Package,
  PackagePlus,
  Settings,
  ShoppingBag,
  SquareChartGantt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearAuthSession } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: House },
  { href: "/items", label: "Items", icon: ShoppingBag },
  { href: "/categories", label: "Categories", icon: Folder },
  { href: "/assignments", label: "Assignee", icon: Package },
  { href: "/stock", label: "Stock (Consumables)", icon: PackagePlus },
  { href: "/audit-logs", label: "Audit Log", icon: SquareChartGantt },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAuthSession();
    onClose?.();
    router.replace("/login");
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[#172134]/30 transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(82vw,19rem)] flex-col border-r border-[#d6dbdb] bg-[#f3f4f2] px-4 py-4 transition-transform duration-200 lg:sticky lg:top-0 lg:z-10 lg:h-full lg:w-[clamp(10.5rem,13vw,11.75rem)] lg:translate-x-0 lg:overflow-hidden lg:border-r lg:border-[#d5dcdc] lg:px-3 lg:py-3",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-[#e1e5e5] pb-4 lg:pb-3">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden bg-transparent lg:h-7 lg:w-7">
              <Image
                src="/image/Nepal Government logo.svg"
                alt="Nepal Government Logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain lg:h-7 lg:w-7"
                priority
              />
            </div>
            <span className="text-[1.9rem] font-semibold leading-none tracking-[-0.05em] text-[#162033] lg:text-[1.5rem]">
              IMS
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#3f4349] hover:bg-[#e7ebeb] lg:hidden"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-[#3f4349] hover:bg-[#e7ebeb] lg:inline-flex"
            aria-label="Sidebar pinned"
          >
           
          </button>
        </div>

        <nav className="mt-5 flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1 lg:mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "relative flex min-h-[3.35rem] items-center gap-3 rounded-[1.125rem] px-4 py-3 text-[1rem] font-medium text-[#494d53] transition-colors lg:min-h-[2.35rem] lg:gap-2.5 lg:rounded-[0.7rem] lg:px-2.25 lg:py-1.5 lg:text-[0.77rem]",
                  isActive
                    ? "bg-[#e8eef4] pl-5 text-[#1676d1] lg:pl-3"
                    : "hover:bg-[#e9edee] hover:text-[#1676d1]"
                )}
              >
                {isActive ? (
                  <span className="absolute left-0 top-3 h-[1.9rem] w-1 rounded-r-full bg-[#1676d1] lg:top-[0.42rem] lg:h-[1.5rem]" />
                ) : null}
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl lg:h-6 lg:w-6",
                    isActive ? "text-[#1676d1]" : "text-[#3f4349]"
                  )}
                >
                  <Icon className="h-5 w-5 stroke-[1.8] lg:h-[0.88rem] lg:w-[0.88rem]" />
                </span>
                <span className={cn("leading-snug", item.href === "/stock" ? "max-w-[10rem] lg:max-w-[6.6rem]" : "")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-5 inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-[1rem] bg-[#1676d1] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1268b8] lg:min-h-[2.35rem] lg:rounded-[0.7rem] lg:px-3 lg:py-1.5 lg:text-[0.8rem]"
        >
          <span>Logout</span>
          <LogOut className="h-4 w-4 stroke-[2] lg:h-[0.85rem] lg:w-[0.85rem]" />
        </button>
      </aside>
    </>
  );
}
