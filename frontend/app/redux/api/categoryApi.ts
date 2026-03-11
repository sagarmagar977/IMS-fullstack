import {baseApi} from "./baseApi";

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => "categories/",
    }),
  }),
});

export const { useGetCategoriesQuery } = categoryApi;