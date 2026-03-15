import { baseApi } from "./baseApi";
import { unwrapListResponse } from "./utils";

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

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummaryApi, void>({
      query: () => "reports/dashboard-summary/",
      providesTags: ["DashboardSummary"],
    }),
    getRecentInventoryActivities: builder.query<RecentInventoryActivityApi[], void>({
      query: () => "reports/recent-inventory-activities/",
      transformResponse: (
        response: RecentInventoryActivityApi[] | { results: RecentInventoryActivityApi[] }
      ) => unwrapListResponse(response),
      providesTags: ["RecentActivities"],
    }),
  }),
});

export const {
  useGetDashboardSummaryQuery,
  useGetRecentInventoryActivitiesQuery,
} = reportsApi;
