"use client";

import {
  Briefcase,
  Building2,
  Package,
  TriangleAlert,
  UserMinus,
} from "lucide-react";
import { useGetDashboardSummaryQuery } from "@/app/redux/api";

const iconClass = "h-4 w-4";

export function ItemSummaryCards() {
  const { data } = useGetDashboardSummaryQuery();

  const cards = [
    {
      value: data?.total_inventory_items ?? 0,
      label: "Total Inventory Items",
      icon: <Package className={iconClass} />,
      box: "bg-[#fef2e6]",
      iconColor: "text-[#ef9f3b]",
    },
    {
      value: data?.assigned_assets ?? 0,
      label: "Assigned Assets",
      icon: <Briefcase className={iconClass} />,
      box: "bg-[#ece9ff]",
      iconColor: "text-[#7f6edb]",
    },
    {
      value: data?.unassigned_assets ?? 0,
      label: "Unassigned Assets",
      icon: <UserMinus className={iconClass} />,
      box: "bg-[#eaf4ff]",
      iconColor: "text-[#2a8dd8]",
    },
    {
      value: data?.low_stock_items ?? 0,
      label: "Low Stock Alerts",
      icon: <TriangleAlert className={iconClass} />,
      box: "bg-[#ffeaf3]",
      iconColor: "text-[#f2639c]",
    },
    {
      value: data?.active_offices ?? 0,
      label: "Active Offices",
      icon: <Building2 className={iconClass} />,
      box: "bg-[#fff6df]",
      iconColor: "text-[#e7b12a]",
    },
  ];

  return (
    <section className="rounded-[1.05rem] border border-[#dfe7e7] bg-white shadow-[0_5px_12px_rgba(22,32,51,0.028)] lg:shrink-0">
      <div className="border-b border-[#edf1f1] px-4 py-2 sm:px-5 lg:px-6">
        <h2 className="text-[0.94rem] font-semibold tracking-[-0.03em] text-[#30363d] lg:text-[0.98rem]">
          Item Summary
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card, index) => {
          const isTotalInventory = card.label === "Total Inventory Items";

          return (
            <div
              key={card.label}
              className="relative flex min-h-[3.85rem] flex-col justify-center gap-0.5 px-4 py-2 sm:min-h-[4rem] lg:px-2.5"
            >
              {index !== cards.length - 1 ? (
                <span className="absolute right-0 top-3.5 hidden h-[calc(100%-1.75rem)] w-px bg-[#ebefef] lg:block" />
              ) : null}
              {index < cards.length - 1 ? (
                <span className="absolute bottom-0 left-5 right-5 h-px bg-[#eef2f2] sm:hidden" />
              ) : null}
              {index < 4 ? (
                <span className="absolute bottom-0 left-5 right-5 hidden h-px bg-[#eef2f2] sm:block lg:hidden" />
              ) : null}
              {index % 2 === 0 && index < 4 ? (
                <span className="absolute right-0 top-3.5 hidden h-[calc(100%-1.75rem)] w-px bg-[#ebefef] sm:block lg:hidden" />
              ) : null}

              <div className="flex items-center justify-center gap-2">
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${card.box}`}>
                  <span className={card.iconColor}>{card.icon}</span>
                </div>
                <p className="text-[clamp(1.05rem,1.1vw,1.28rem)] font-semibold leading-none tracking-[-0.03em] text-[#2f353c]">
                  {card.value.toLocaleString()}
                </p>
              </div>
              <div className="text-center text-[0.56rem] font-medium uppercase leading-none tracking-[0.035em] text-[#7f8790]">
                <div>{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
