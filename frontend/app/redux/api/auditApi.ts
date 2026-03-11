import { baseApi } from './baseApi';


export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAudits: builder.query({
      query: () => "audits/",
    }),
  }),
});

export const { useGetAuditsQuery } = auditApi;  