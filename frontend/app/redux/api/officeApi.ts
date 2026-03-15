import { baseApi } from "./baseApi";
import { unwrapListResponse } from "./utils";

export type OfficeApi = {
  id: number;
  name: string;
  level: string;
  parent_office: number | null;
  location_code: string;
};

export const officeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOffices: builder.query<OfficeApi[], void>({
      query: () => "offices/",
      transformResponse: (response: OfficeApi[] | { results: OfficeApi[] }) =>
        unwrapListResponse(response),
      providesTags: ["Offices"],
    }),
  }),
});

export const { useGetOfficesQuery } = officeApi;
