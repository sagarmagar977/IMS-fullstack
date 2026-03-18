import { baseApi } from "./baseApi";
import { normalizeListResponse, type ListResult, unwrapListResponse } from "./utils";

export type InventoryItemApi = {
  id: number;
  title: string;
  item_number: string | null;
  item_type: "FIXED_ASSET" | "CONSUMABLE";
  status: string;
  amount: string;
  price?: string;
  currency?: string;
  department?: string;
  manufacturer?: string;
  purchased_date?: string | null;
  description?: string;
  dynamic_data?: Record<string, unknown>;
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
  department?: string;
  manufacturer?: string;
  purchased_date?: string | null;
  image?: File | null;
  pi_document?: File | null;
  warranty_document?: File | null;
  description?: string;
  dynamic_data?: Record<string, unknown>;
};

export type CreateFixedAssetPayload = {
  item: number;
  serial_number?: string | null;
  asset_tag?: string;
  purchase_date?: string | null;
  warranty_expiry_date?: string | null;
  invoice_file?: File | null;
};

export type FixedAssetApi = {
  id: number;
  item: number;
  asset_tag: string;
  serial_number: string | null;
  purchase_date: string | null;
  warranty_expiry_date: string | null;
};

export type AssetTypeApi = {
  id: number;
  code: "FIXED_ASSET" | "CONSUMABLE";
  label: string;
  is_consumable: boolean;
  is_active: boolean;
};

type GetItemsParams = {
  search?: string;
  status?: string;
  item_type?: "FIXED_ASSET" | "CONSUMABLE";
  assignment_status?: "ASSIGNED" | "UNASSIGNED";
  office?: number;
  category?: number;
  ordering?: string;
  page?: number;
  page_size?: number;
};

export const itemsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getItems: builder.query<ListResult<InventoryItemApi>, GetItemsParams | void>({
      query: (arg) => {
        const params = {
          search: arg?.search || undefined,
          status: arg?.status || undefined,
          item_type: arg?.item_type || undefined,
          assignment_status: arg?.assignment_status || undefined,
          office: arg?.office || undefined,
          category: arg?.category || undefined,
          ordering: arg?.ordering || undefined,
          page: arg?.page || undefined,
          page_size: arg?.page_size || undefined,
        };
        return { url: "inventory-items/", params };
      },
      transformResponse: (response: InventoryItemApi[] | { results: InventoryItemApi[] }) =>
        normalizeListResponse(response),
      providesTags: ["Items"],
    }),
    getAssetTypes: builder.query<AssetTypeApi[], void>({
      query: () => "asset-types/",
      transformResponse: (response: AssetTypeApi[] | { results: AssetTypeApi[] }) =>
        unwrapListResponse(response),
    }),
    getFixedAssets: builder.query<FixedAssetApi[], { item?: number } | void>({
      query: (arg) => ({
        url: "fixed-assets/",
        params: {
          item: arg?.item || undefined,
        },
      }),
      transformResponse: (response: FixedAssetApi[] | { results: FixedAssetApi[] }) =>
        unwrapListResponse(response),
      providesTags: ["Items"],
    }),
    createItem: builder.mutation<InventoryItemApi, CreateInventoryItemPayload>({
      query: (payload) => ({
        url: "inventory-items/",
        method: "POST",
        body: buildItemFormData(payload),
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
        body: buildItemFormData(payload),
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
        body: buildFixedAssetFormData(payload),
      }),
      invalidatesTags: ["Items", "RecentActivities"],
    }),
    updateFixedAsset: builder.mutation<
      FixedAssetApi,
      Partial<CreateFixedAssetPayload> & { id: number }
    >({
      query: ({ id, ...payload }) => ({
        url: `fixed-assets/${id}/`,
        method: "PATCH",
        body: buildFixedAssetFormData(payload as CreateFixedAssetPayload),
      }),
      invalidatesTags: ["Items", "RecentActivities"],
    }),
  }),
});

function buildItemFormData(payload: Partial<CreateInventoryItemPayload>) {
  const formData = new FormData();

  appendDefinedValue(formData, "category", payload.category);
  appendDefinedValue(formData, "office", payload.office);
  appendDefinedValue(formData, "title", payload.title);
  appendDefinedValue(formData, "item_number", payload.item_number);
  appendDefinedValue(formData, "item_type", payload.item_type);
  appendDefinedValue(formData, "status", payload.status);
  appendDefinedValue(formData, "amount", payload.amount);
  appendDefinedValue(formData, "price", payload.price);
  appendDefinedValue(formData, "currency", payload.currency);
  appendDefinedValue(formData, "department", payload.department);
  appendDefinedValue(formData, "manufacturer", payload.manufacturer);
  appendDefinedValue(formData, "purchased_date", payload.purchased_date);
  appendDefinedValue(formData, "description", payload.description);

  if (payload.image) {
    formData.append("image", payload.image);
  }
  if (payload.pi_document) {
    formData.append("pi_document", payload.pi_document);
  }
  if (payload.warranty_document) {
    formData.append("warranty_document", payload.warranty_document);
  }
  if (payload.dynamic_data) {
    formData.append("dynamic_data", JSON.stringify(payload.dynamic_data));
  }

  return formData;
}

function buildFixedAssetFormData(payload: CreateFixedAssetPayload) {
  const formData = new FormData();

  appendDefinedValue(formData, "item", payload.item);
  appendDefinedValue(formData, "serial_number", payload.serial_number);
  appendDefinedValue(formData, "asset_tag", payload.asset_tag);
  appendDefinedValue(formData, "purchase_date", payload.purchase_date);
  appendDefinedValue(formData, "warranty_expiry_date", payload.warranty_expiry_date);
  if (payload.invoice_file) {
    formData.append("invoice_file", payload.invoice_file);
  }

  return formData;
}

function appendDefinedValue(formData: FormData, key: string, value: unknown) {
  if (value === undefined || value === null) {
    return;
  }

  formData.append(key, String(value));
}

export const {
  useGetItemsQuery,
  useGetAssetTypesQuery,
  useGetFixedAssetsQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
  useCreateFixedAssetMutation,
  useUpdateFixedAssetMutation,
} = itemsApi;
