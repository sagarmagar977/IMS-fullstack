import { baseApi } from "./baseApi";
import { unwrapListResponse } from "./utils";

export type CategoryApi = {
  id: number;
  name: string;
  is_consumable: boolean;
};

export type CreateCategoryPayload = {
  name: string;
  is_consumable: boolean;
};

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryApi[], { search?: string } | void>({
      query: (arg) => {
        const params = arg && "search" in arg && arg.search ? { search: arg.search } : undefined;
        return { url: "categories/", params };
      },
      transformResponse: (response: CategoryApi[] | { results: CategoryApi[] }) =>
        unwrapListResponse(response),
      providesTags: ["Categories"],
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
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
