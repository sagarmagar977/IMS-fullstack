import { baseApi } from "./baseApi";
import { normalizeListResponse, type ListResult, unwrapListResponse } from "./utils";

export type DashboardSummaryApi = {
  total_inventory_items: number;
  assigned_assets: number;
  unassigned_assets: number;
  low_stock_items: number;
  active_offices: number;
};

export type RecentInventoryActivityApi = {
  id: number;
  item_name: string;
  unique_number: string | null;
  performed_by: string | null;
  date: string;
  amount: string;
  status: string;
  action: string;
};

export type GlobalSearchResultApi = {
  key: string;
  kind: "Item" | "Category" | "Stock" | "Stock Movement" | "Audit Log" | "Assignment";
  title: string;
  details: string;
};

type GetRecentInventoryActivitiesParams = {
  search?: string;
  from?: string;
  to?: string;
  action_type?: string;
  item_type?: "FIXED_ASSET" | "CONSUMABLE";
  category?: number;
  page?: number;
  page_size?: number;
};

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummaryApi, void>({
      query: () => "reports/dashboard-summary/",
      providesTags: ["DashboardSummary"],
    }),
    getRecentInventoryActivities: builder.query<ListResult<RecentInventoryActivityApi>, GetRecentInventoryActivitiesParams | void>({
      query: (arg) => ({
        url: "reports/recent-inventory-activities/",
        params: {
          search: arg?.search || undefined,
          from: arg?.from || undefined,
          to: arg?.to || undefined,
          action_type: arg?.action_type || undefined,
          item_type: arg?.item_type || undefined,
          category: arg?.category || undefined,
          page: arg?.page || undefined,
          page_size: arg?.page_size || undefined,
        },
      }),
      transformResponse: (
        response: RecentInventoryActivityApi[] | { results: RecentInventoryActivityApi[] }
      ) => normalizeListResponse(response),
      providesTags: ["RecentActivities"],
    }),
    getGlobalSearchResults: builder.query<GlobalSearchResultApi[], { q: string; limit?: number }>({
      query: ({ q, limit = 10 }) => ({
        url: "reports/global-search/",
        params: { q, limit },
      }),
      transformResponse: (response: GlobalSearchResultApi[] | { results: GlobalSearchResultApi[] }) =>
        unwrapListResponse(response),
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetRecentInventoryActivitiesQuery,
  useGetGlobalSearchResultsQuery,
} = reportsApi;
