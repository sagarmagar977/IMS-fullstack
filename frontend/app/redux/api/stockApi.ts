import { baseApi } from "./baseApi";
import { unwrapListResponse } from "./utils";

export type ConsumableStockApi = {
  id: number;
  item: number;
  quantity: string;
  min_threshold: string;
  unit: string;
  stock_status: "OUT_OF_STOCK" | "LOW_STOCK" | "ON_BOARDED";
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

export const stockApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStocks: builder.query<ConsumableStockApi[], { search?: string } | void>({
      query: (arg) => {
        const params = arg && "search" in arg && arg.search ? { search: arg.search } : undefined;
        return { url: "consumable-stocks/", params };
      },
      transformResponse: (response: ConsumableStockApi[] | { results: ConsumableStockApi[] }) =>
        unwrapListResponse(response),
      providesTags: ["Stocks"],
    }),
    getStockTransactions: builder.query<ConsumableStockTransactionApi[], { search?: string } | void>({
      query: (arg) => {
        const params = arg && "search" in arg && arg.search ? { search: arg.search } : undefined;
        return { url: "consumable-stock-transactions/", params };
      },
      transformResponse: (
        response: ConsumableStockTransactionApi[] | { results: ConsumableStockTransactionApi[] }
      ) => unwrapListResponse(response),
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
  useDeleteStockMutation,
} = stockApi;
