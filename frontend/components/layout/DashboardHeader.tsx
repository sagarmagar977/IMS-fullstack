"use client";
import { IoIosNotificationsOutline } from "react-icons/io";
import { ChevronLeft, Search as SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function DashboardHeader({
  title,
  searchPlaceholder = "Search",
  backHref,
}: {
  title: string;
  searchPlaceholder?: string;
  backHref?: string;
}) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    }
  };

  return (
    <header className="relative border-b border-gray-200 bg-white px-6 py-9">
      {/* Title + chevron on the left */}
      <h1 className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xl font-semibold text-gray-900">
        {backHref && (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center justify-center rounded-full  bg-white p-1.5 text-gray-900 hover:bg-gray-50"
            aria-label="Go back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {title}
      </h1>

      {/* Search bar centered */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder={searchPlaceholder}
            className="w-64 rounded-lg border border-gray-300 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="Search"
          />
        </div>
      </div>

      {/* Right side items */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4">
        {/* Notifications */}
        <button
          type="button"
          className="rounded-lg p-2 text-gray-700 bg-gray-100"
          aria-label="Notifications"
        >
          <IoIosNotificationsOutline className="h-5 w-5" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 pl-2 pr-3 py-2">
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700">
            CP
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">Lashang Tamang</p>
            <p className="text-xs text-gray-500">Store Manager</p>
          </div>
          <span className="text-gray-400" aria-hidden>
            ▼
          </span>
        </div>
      </div>
    </header>
  );
}