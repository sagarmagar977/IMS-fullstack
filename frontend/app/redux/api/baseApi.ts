import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ACCESS_TOKEN_KEY } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/api-base";

export const baseApi = createApi({
  reducerPath: "api",
  tagTypes: [
    "Items",
    "Categories",
    "Assignments",
    "AssignmentSummary",
    "Stocks",
    "StockTransactions",
    "Audits",
    "DashboardSummary",
    "RecentActivities",
    "Offices",
  ],
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  endpoints: () => ({}),
});
