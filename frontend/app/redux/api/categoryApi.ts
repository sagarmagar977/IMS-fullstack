import { baseApi } from "./baseApi";
import { normalizeListResponse, type ListResult, unwrapListResponse } from "./utils";

export type CategoryApi = {
  id: number;
  name: string;
  is_consumable: boolean;
};

export type CreateCategoryPayload = {
  name: string;
  is_consumable: boolean;
};

export type CustomFieldDefinitionApi = {
  id: number;
  category: number;
  label: string;
  field_type: "TEXT" | "NUMBER" | "DATE" | "BOOLEAN" | "SELECT" | "FILE";
  required: boolean;
  is_unique: boolean;
  select_options: string[];
};

type GetCategoriesParams = {
  search?: string;
  is_consumable?: boolean;
  page?: number;
  page_size?: number;
};

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<ListResult<CategoryApi>, GetCategoriesParams | void>({
      query: (arg) => ({
        url: "categories/",
        params: {
          search: arg?.search || undefined,
          is_consumable: arg?.is_consumable,
          page: arg?.page || undefined,
          page_size: arg?.page_size || undefined,
        },
      }),
      transformResponse: (response: CategoryApi[] | { results: CategoryApi[] }) =>
        normalizeListResponse(response),
      providesTags: ["Categories"],
    }),
    getCustomFields: builder.query<CustomFieldDefinitionApi[], { category?: number } | void>({
      query: (arg) => ({
        url: "custom-fields/",
        params: {
          category: arg?.category || undefined,
        },
      }),
      transformResponse: (
        response: CustomFieldDefinitionApi[] | { results: CustomFieldDefinitionApi[] }
      ) => unwrapListResponse(response),
    }),
    createCategory: builder.mutation<CategoryApi, CreateCategoryPayload>({
      query: (payload) => ({
        url: "categories/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Categories"],
    }),
    updateCategory: builder.mutation<CategoryApi, CreateCategoryPayload & { id: number }>({
      query: ({ id, ...payload }) => ({
        url: `categories/${id}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["Categories", "Items"],
    }),
    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `categories/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories", "Items"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCustomFieldsQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
