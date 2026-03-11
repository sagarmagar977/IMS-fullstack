"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

// React Icons imports
import {
  Home01Icon,           // smart house / home
  ShoppingBag01Icon,    // ecommerce / shopping bag
  FolderUploadIcon,     // files/folder / folder-reload alternative
  UserCircleIcon,       // user / user-circle-add alternative
  ShoppingBagAddIcon,   // ecommerce / shopping bag-add
  SquareArrowUp03Icon,  // finance & payment / heart-arrow-up alternative
  Settings01Icon,
  Logout01Icon, // device / settings
} from "hugeicons-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: <Home01Icon className="h-5 w-5" /> },
  { href: "/items", label: "Items", icon: <ShoppingBag01Icon className="h-5 w-5" /> },
  { href: "/categories", label: "Categories", icon: <FolderUploadIcon className="h-5 w-5" /> },
  { href: "/assignments", label: "Assignee", icon: <UserCircleIcon className="h-5 w-5" /> },
  { href: "/stock", label: "Stock (Consumables)", icon: <ShoppingBagAddIcon className="h-5 w-5" /> },
  { href: "/audit-logs", label: "Audit Log", icon: <SquareArrowUp03Icon className="h-5 w-5" /> },
  { href: "/settings", label: "Settings", icon: <Settings01Icon className="h-5 w-5" /> },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r border-gray-200 bg-white">
      {/* Logo / Header */}
      <div className="flex items-center gap-2  border-gray-200 p-7">
        <Image
          src="https://play-lh.googleusercontent.com/XgPMfb6xTqe-4lpJd_XikSM061A8mCG0VIJZdlHKrwI35h4-RnHbF844nDiqXW1VYkw=w600-h300-pc0xffffff-pd"
          alt="IMS Logo"
          width={58}
          height={58}
          className="rounded"
        />
        <Link
          href="/dashboard"
          className="text-lg font-bold text-gray-900"
        >
          IMS
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-gray-100 text-blue-500"
                  : "text-gray-700 hover:bg-blue-100 hover:text-blue-500"
              )}
            >
              <span className="flex items-center text-lg">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-200 p-3">
        <Link
          href="/login"
          className="flex items-center gap-3 rounded-lg bg-blue-500 px-3 py-2.5 text-sm font-medium text-white-900 transition-colors "
        >
          <Logout01Icon className="h-5 w-5" />
          Logout
        </Link>


      </div>
    </aside>
  );

}
