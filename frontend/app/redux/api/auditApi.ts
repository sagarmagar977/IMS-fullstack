import { baseApi } from "./baseApi";
import { normalizeListResponse, type ListResult } from "./utils";

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

type GetAuditsParams = {
  search?: string;
  action_type?: string;
  item?: number;
  performed_by?: number;
  page?: number;
  page_size?: number;
};

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAudits: builder.query<ListResult<AuditLogApi>, GetAuditsParams | void>({
      query: (arg) => ({
        url: "audit-logs/",
        params: {
          search: arg?.search || undefined,
          action_type: arg?.action_type || undefined,
          item: arg?.item || undefined,
          performed_by: arg?.performed_by || undefined,
          page: arg?.page || undefined,
          page_size: arg?.page_size || undefined,
        },
      }),
      transformResponse: (response: AuditLogApi[] | { results: AuditLogApi[] }) =>
        normalizeListResponse(response),
      providesTags: ["Audits"],
    }),
  }),
});

export const { useGetAuditsQuery } = auditApi;
