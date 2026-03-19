import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api/proxy/",
  credentials: "same-origin",
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401 && typeof window !== "undefined") {
    window.location.href = "/login";
  }
  return result;
};

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
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});
