import {baseApi} from "./baseApi";

export const stockApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStocks : builder.query({
      query: () => "stocks/",
    }),
  }),
});

export const { useGetStocksQuery } = stockApi;