import { baseApi } from "./baseApi";
import { unwrapListResponse } from "./utils";

export type AuditLogApi = {
  id: number;
  item_name: string;
  item_number: string | null;
  action_type: string;
  performed_by_name: string | null;
  remarks: string;
  attachment: string | null;
  created_at: string;
};

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAudits: builder.query<AuditLogApi[], { search?: string } | void>({
      query: (arg) => {
        const params = arg && "search" in arg && arg.search ? { search: arg.search } : undefined;
        return { url: "audit-logs/", params };
      },
      transformResponse: (response: AuditLogApi[] | { results: AuditLogApi[] }) =>
        unwrapListResponse(response),
      providesTags: ["Audits"],
    }),
  }),
});

export const { useGetAuditsQuery } = auditApi;
