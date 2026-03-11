
import { baseApi } from "./baseApi";

export const itemsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getItems: builder.query({
      query: () => "items/",
    }),
  }),
});

export const { useGetItemsQuery } = itemsApi;