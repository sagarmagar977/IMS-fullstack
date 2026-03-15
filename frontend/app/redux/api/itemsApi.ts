import { baseApi } from "./baseApi";
import { unwrapListResponse } from "./utils";

export type InventoryItemApi = {
  id: number;
  title: string;
  item_number: string | null;
  item_type: "FIXED_ASSET" | "CONSUMABLE";
  status: string;
  amount: string;
  serial_number: string | null;
  assigned_to: string | null;
  assignment_status: "ASSIGNED" | "UNASSIGNED";
  category: number;
  office: number;
};

export type CreateInventoryItemPayload = {
  category: number;
  office: number;
  title: string;
  item_number?: string | null;
  item_type: "FIXED_ASSET" | "CONSUMABLE";
  status?: string;
  amount?: string | number;
  price?: string | number;
  currency?: string;
  store?: string;
  project?: string;
  department?: string;
  manufacturer?: string;
  purchased_date?: string | null;
  description?: string;
};

export type CreateFixedAssetPayload = {
  item: number;
  serial_number?: string | null;
  asset_tag?: string;
  purchase_date?: string | null;
  warranty_expiry_date?: string | null;
};

export type AssetTypeApi = {
  id: number;
  code: "FIXED_ASSET" | "CONSUMABLE";
  label: string;
  is_consumable: boolean;
  is_active: boolean;
};

export const itemsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getItems: builder.query<InventoryItemApi[], { search?: string } | void>({
      query: (arg) => {
        const params = arg && "search" in arg && arg.search ? { search: arg.search } : undefined;
        return { url: "inventory-items/", params };
      },
      transformResponse: (response: InventoryItemApi[] | { results: InventoryItemApi[] }) =>
        unwrapListResponse(response),
      providesTags: ["Items"],
    }),
    getAssetTypes: builder.query<AssetTypeApi[], void>({
      query: () => "asset-types/",
      transformResponse: (response: AssetTypeApi[] | { results: AssetTypeApi[] }) =>
        unwrapListResponse(response),
    }),
    createItem: builder.mutation<InventoryItemApi, CreateInventoryItemPayload>({
      query: (payload) => ({
        url: "inventory-items/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Items", "DashboardSummary", "RecentActivities"],
    }),
    updateItem: builder.mutation<
      InventoryItemApi,
      Partial<CreateInventoryItemPayload> & { id: number }
    >({
      query: ({ id, ...payload }) => ({
        url: `inventory-items/${id}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["Items", "DashboardSummary", "RecentActivities", "Stocks", "AssignmentSummary"],
    }),
    deleteItem: builder.mutation<void, number>({
      query: (id) => ({
        url: `inventory-items/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Items", "DashboardSummary", "RecentActivities", "Stocks", "AssignmentSummary"],
    }),
    createFixedAsset: builder.mutation<
      { id: number; item: number; serial_number: string | null },
      CreateFixedAssetPayload
    >({
      query: (payload) => ({
        url: "fixed-assets/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Items", "RecentActivities"],
    }),
  }),
});

export const {
  useGetItemsQuery,
  useGetAssetTypesQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
  useCreateFixedAssetMutation,
} = itemsApi;
