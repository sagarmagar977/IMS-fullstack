"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-[#d7dede] lg:h-dvh lg:overflow-hidden">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#d4dcdc] bg-[#f4f5f2] px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dbe1e1] bg-white text-[#2f3640]"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="text-lg font-semibold tracking-[-0.03em] text-[#162033]">IMS</div>
        <div className="w-10" aria-hidden="true" />
      </div>

      <div className="flex min-h-[calc(100dvh-4.125rem)] w-full lg:h-dvh lg:min-h-0 lg:overflow-hidden lg:bg-[#eef2f1]">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="min-w-0 flex-1 overflow-x-hidden bg-[#d7dede] lg:overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
