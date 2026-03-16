import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, clearAuthSession, storeAccessToken } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/api-base";

const rawBaseQuery = fetchBaseQuery({
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
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401 || typeof window === "undefined") {
    return result;
  }

  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    clearAuthSession();
    window.location.href = "/login";
    return result;
  }

  const refreshResult = await rawBaseQuery(
    {
      url: "auth/token/refresh/",
      method: "POST",
      body: { refresh: refreshToken },
    },
    api,
    extraOptions
  );

  const refreshData = refreshResult.data as { access?: string } | undefined;
  if (refreshData?.access) {
    storeAccessToken(refreshData.access);
    result = await rawBaseQuery(args, api, extraOptions);
    return result;
  }

  clearAuthSession();
  window.location.href = "/login";
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
