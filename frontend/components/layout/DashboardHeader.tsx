"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Bell, ChevronDown, ChevronLeft, Search as SearchIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { getDisplayName, getStoredUserEmail } from "@/lib/auth";

export function DashboardHeader({
  title,
  searchPlaceholder = "Search",
  backHref,
  enableGlobalSearch = true,
  globalSearchHref = "/search",
  globalSearchParam = "q",
}: {
  title: string;
  searchPlaceholder?: string;
  backHref?: string;
  enableGlobalSearch?: boolean;
  globalSearchHref?: string;
  globalSearchParam?: string;
  }) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState("");
  const userEmail = useSyncExternalStore(
    () => () => {},
    getStoredUserEmail,
    () => ""
  );

  useEffect(() => {
    if (pathname !== globalSearchHref) {
      setSearchValue("");
      return;
    }
  }, [globalSearchHref, pathname]);

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    }
  };

  const handleSubmitSearch = () => {
    if (!enableGlobalSearch) {
      return;
    }

    const trimmed = searchValue.trim();
    if (!trimmed) {
      if (pathname === globalSearchHref) {
        router.replace(globalSearchHref, { scroll: false });
      }
      return;
    }

    const next = new URLSearchParams();
    next.set(globalSearchParam, trimmed);
    router.push(`${globalSearchHref}?${next.toString()}`);
  };

  const displayName = getDisplayName(userEmail);
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 border-b border-[#d5dcdc] bg-[#f7f7f5]/96 px-4 py-3 backdrop-blur sm:px-5 lg:px-6 lg:py-4">
      <div className="flex w-full flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="flex items-center gap-2 text-[1.05rem] font-semibold tracking-[-0.025em] text-[#2d3138] lg:text-[1.12rem]">
          {backHref && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center justify-center rounded-full bg-transparent p-1 text-[#2e3338] hover:bg-[#eef2f3]"
              aria-label="Go back"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {title}
        </h1>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
          <div className="relative w-full sm:max-w-[17rem] lg:w-[clamp(11.5rem,19vw,14rem)]">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2c3137]" />
            <input
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSubmitSearch();
                }
              }}
              className="h-9 w-full rounded-[0.7rem] border border-[#d7dddd] bg-[#fbfbf9] py-2 pl-9 pr-4 text-[0.8rem] text-[#2b2f34] placeholder:text-[#b3b7bb] focus:border-[#4e8fc5] focus:outline-none focus:ring-1 focus:ring-[#4e8fc5] lg:h-[2.15rem]"
              aria-label="Search"
            />
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-[0.7rem] border border-[#e2e7e7] bg-[#fbfbfa] text-[#3c434a] hover:bg-[#eef2f3] lg:h-[2.15rem] lg:w-[2.15rem]"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>

            <div className="flex min-w-0 items-center gap-2 rounded-[0.8rem] bg-[#fbfbfa] px-2.5 py-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1d7fd7] text-[0.72rem] font-semibold text-white">
                {initials || "SM"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[0.8rem] font-semibold text-[#252b32]">{displayName}</p>
                <p className="truncate text-[0.66rem] text-[#8a939d]">{userEmail || "Store Manager"}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#5e6770]" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
