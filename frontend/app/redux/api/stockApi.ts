import { baseApi } from "./baseApi";
import { normalizeListResponse, type ListResult } from "./utils";

export type ConsumableStockApi = {
  id: number;
  item: number;
  initial_quantity?: string;
  quantity: string;
  min_threshold: string;
  reorder_alert_enabled?: boolean;
  unit: string;
  stock_status: "OUT_OF_STOCK" | "LOW_STOCK" | "ON_BOARDED";
};

export type CreateConsumableStockPayload = {
  item: number;
  initial_quantity: string | number;
  quantity: string | number;
  min_threshold: string | number;
  reorder_alert_enabled: boolean;
  unit: string;
};

export type ConsumableStockTransactionApi = {
  id: number;
  stock: number;
  transaction_type: "STOCK_IN" | "STOCK_OUT" | "DAMAGE" | "ADJUSTMENT";
  quantity: string;
  balance_after: string;
  item_name: string;
  item_number: string | null;
  performed_by_name: string | null;
  description: string;
  created_at: string;
};

export type CreateStockTransactionPayload = {
  stock: number;
  transaction_type: "STOCK_IN" | "STOCK_OUT" | "DAMAGE" | "ADJUSTMENT";
  quantity: string | number;
  amount?: string | number;
  status?: string;
  assigned_to?: number | null;
  department?: string;
  description?: string;
};

type GetStocksParams = {
  search?: string;
  item?: number;
  reorder_alert_enabled?: boolean;
  stock_status?: "OUT_OF_STOCK" | "LOW_STOCK" | "ON_BOARDED";
  page?: number;
  page_size?: number;
};

type GetStockTransactionsParams = {
  search?: string;
  stock?: number;
  transaction_type?: "STOCK_IN" | "STOCK_OUT" | "DAMAGE" | "ADJUSTMENT";
  status?: string;
  performed_by?: number;
  assigned_to?: number;
  page?: number;
  page_size?: number;
};

export const stockApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStocks: builder.query<ListResult<ConsumableStockApi>, GetStocksParams | void>({
      query: (arg) => ({
        url: "consumable-stocks/",
        params: {
          search: arg?.search || undefined,
          item: arg?.item || undefined,
          reorder_alert_enabled: arg?.reorder_alert_enabled,
          stock_status: arg?.stock_status || undefined,
          page: arg?.page || undefined,
          page_size: arg?.page_size || undefined,
        },
      }),
      transformResponse: (response: ConsumableStockApi[] | { results: ConsumableStockApi[] }) =>
        normalizeListResponse(response),
      providesTags: ["Stocks"],
    }),
    getStockTransactions: builder.query<ListResult<ConsumableStockTransactionApi>, GetStockTransactionsParams | void>({
      query: (arg) => ({
        url: "consumable-stock-transactions/",
        params: {
          search: arg?.search || undefined,
          stock: arg?.stock || undefined,
          transaction_type: arg?.transaction_type || undefined,
          status: arg?.status || undefined,
          performed_by: arg?.performed_by || undefined,
          assigned_to: arg?.assigned_to || undefined,
          page: arg?.page || undefined,
          page_size: arg?.page_size || undefined,
        },
      }),
      transformResponse: (
        response: ConsumableStockTransactionApi[] | { results: ConsumableStockTransactionApi[] }
      ) => normalizeListResponse(response),
      providesTags: ["StockTransactions"],
    }),
    createStockTransaction: builder.mutation<
      ConsumableStockTransactionApi,
      CreateStockTransactionPayload
    >({
      query: (payload) => ({
        url: "consumable-stock-transactions/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Stocks", "StockTransactions", "Audits", "RecentActivities", "DashboardSummary"],
    }),
    createConsumableStock: builder.mutation<ConsumableStockApi, CreateConsumableStockPayload>({
      query: (payload) => ({
        url: "consumable-stocks/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Stocks", "Items", "DashboardSummary", "RecentActivities"],
    }),
    updateConsumableStock: builder.mutation<
      ConsumableStockApi,
      Partial<CreateConsumableStockPayload> & { id: number }
    >({
      query: ({ id, ...payload }) => ({
        url: `consumable-stocks/${id}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["Stocks", "Items", "DashboardSummary", "RecentActivities"],
    }),
    deleteStock: builder.mutation<void, number>({
      query: (id) => ({
        url: `consumable-stocks/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Stocks", "StockTransactions", "Audits", "RecentActivities", "DashboardSummary"],
    }),
  }),
});

export const {
  useGetStocksQuery,
  useGetStockTransactionsQuery,
  useCreateStockTransactionMutation,
  useCreateConsumableStockMutation,
  useUpdateConsumableStockMutation,
  useDeleteStockMutation,
} = stockApi;
