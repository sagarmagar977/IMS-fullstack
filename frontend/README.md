This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Structure

```
ims-frontend/
├── app/
│   ├── (main)/                    # Main app layout group
│   │   ├── assignments/
│   │   │   └── page.tsx
│   │   ├── audit-logs/
│   │   │   └── page.tsx
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── image/
│   │   │   └── no-data.png
│   │   ├── items/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   ├── stock/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── redux/
│   │   ├── api/
│   │   │   ├── baseApi.ts
│   │   │   ├── authApi.ts
│   │   │   ├── itemsApi.ts
│   │   │   ├── assignmentApi.ts
│   │   │   ├── categoryApi.ts
│   │   │   ├── stockApi.ts
│   │   │   ├── auditApi.ts
│   │   │   └── index.ts
│   │   ├── store.ts
│   │   └── hooks.ts
│   └── providers/
│       └── StoreProvider.tsx
│
├── components/
│   ├── Assignment/
│   │   ├── AddAssignment.tsx
│   │   ├── AssignmentTable.tsx
│   │   └── ViewAssignedItems.tsx
│   ├── Audit-log/
│   │   └── AuditTable.tsx
│   ├── Category /
│   │   ├── CategoryTable.tsx
│   │   └── CreateNewCategory.tsx
│   ├── dashboard/
│   │   ├── ItemSummaryCards.tsx
│   │   ├── RecentActivitiesFilter.tsx
│   │   └── RecentActivitiesTable.tsx
│   ├── items/
│   │   ├── AddItemModal.tsx
│   │   ├── AssignItemModal.tsx
│   │   └── ItemsTable.tsx
│   ├── layout/
│   │   ├── DashboardHeader.tsx
│   │   └── Sidebar.tsx
│   ├── login/
│   │   └── LoginCard.jsx
│   ├── setting/
│   │   └── SettingTable.tsx
│   ├── Stock/
│   │   ├── CreateTransaction.tsx
│   │   ├── StockHistoryTable.tsx
│   │   └── StockTable.tsx
│   └── ui/
│       ├── button.tsx
│       ├── checkbox.tsx
│       ├── input.tsx
│       └── TablePagination.tsx
│
├── lib/
│   └── utils.ts
│
├── types/
│   └── index.ts
│
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

## API (RTK Query)

APIs use `fetchBaseQuery` with base URL from `NEXT_PUBLIC_API_URL` (default: `/api`). Use RTK Query hooks:

```tsx
import { useGetItemsQuery, useAddItemMutation } from "@/app/redux/api";

function ItemsList() {
  const { data: items, isLoading } = useGetItemsQuery();
  const [addItem] = useAddItemMutation();

  if (isLoading) return <p>Loading...</p>;
  return (
    <ul>
      {items?.map((item) => <li key={item.id}>{item.name}</li>)}
    </ul>
  );
}
```

Available APIs: `authApi`, `itemsApi`, `assignmentApi`, `categoryApi`, `stockApi`, `auditApi`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
