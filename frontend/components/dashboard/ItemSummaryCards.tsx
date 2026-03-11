const cards = [
  {
    value: "24,680",
    label: "Total Inventory Items",
    icon: "📦",
    bg: "bg-orange-50",
    iconColor: "text-orange-500",
  },
  {
    value: "18,945",
    label: "Assigned Assets",
    icon: "💼",
    bg: "bg-purple-50",
    iconColor: "text-purple-500",
  },
  {
    value: "3,120",
    label: "Unassigned Assets",
    icon: "👤",
    bg: "bg-sky-50",
    iconColor: "text-sky-500",
  },
  {
    value: "46",
    label: "Low Stock Alerts",
    icon: "⬇️",
    bg: "bg-pink-50",
    iconColor: "text-pink-500",
  },
  {
    value: "6,742",
    label: "Active Offices",
    icon: "🏢",
    bg: "bg-yellow-50",
    iconColor: "text-yellow-500",
  },
];

export function ItemSummaryCards() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      {/* Heading */}
      <div className="px-4 pt-2 pb-1">
        <h2 className="text-sm font-semibold text-gray-800">
          Item Summary
        </h2>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card, index) => (
          <div
            key={card.label}
            className="relative flex flex-col items-center gap-2 px-5 py-4 text-center"
          >
            {/* Vertical divider (desktop only, not full height) */}
            {index !== cards.length - 1 && (
              <span className="absolute right-0 top-4 hidden h-[calc(100%-2rem)] w-px bg-gray-200 lg:block" />
            )}

            <div
              className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bg}`}
            >
              <span className={`text-xl ${card.iconColor}`}>
                {card.icon}
              </span>
            </div>

            <p className="text-lg font-semibold text-gray-900 leading-none">
              {card.value}
            </p>
            <p className="text-xs text-gray-500 leading-tight">
              {card.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}