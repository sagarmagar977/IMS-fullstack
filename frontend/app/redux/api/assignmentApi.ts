import { baseApi } from "./baseApi";
import { unwrapListResponse } from "./utils";

export type AssignmentApi = {
  id: number;
  item: number;
  item_name: string;
  item_number: string | null;
  assigned_to_user: number | null;
  assigned_to_office: number | null;
  status: "ASSIGNED" | "RETURNED";
  assign_till: string | null;
  created_at: string;
};

export type AssignmentSummaryApi = {
  assigned_to_user: number | null;
  assigned_to_user__first_name: string | null;
  assigned_to_user__last_name: string | null;
  assigned_to_user__username: string | null;
  assigned_to_office: number | null;
  assigned_to_office__name: string | null;
  total_items: number;
  active: number;
  overdue: number;
  returned: number;
};

export type CreateAssignmentPayload = {
  item: number;
  assigned_to_user?: number | null;
  assigned_to_office?: number | null;
  handover_date: string;
  assign_till?: string | null;
  handover_condition?: "GOOD" | "FAIR" | "DAMAGED";
  status?: "ASSIGNED" | "RETURNED";
  remarks?: string;
};

export const assignmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAssignments: builder.query<AssignmentApi[], { search?: string } | void>({
      query: (arg) => {
        const params = arg && "search" in arg && arg.search ? { search: arg.search } : undefined;
        return { url: "item-assignments/", params };
      },
      transformResponse: (response: AssignmentApi[] | { results: AssignmentApi[] }) =>
        unwrapListResponse(response),
      providesTags: ["Assignments"],
    }),
    getAssignmentSummaryByAssignee: builder.query<AssignmentSummaryApi[], void>({
      query: () => "item-assignments/summary-by-assignee/",
      transformResponse: (response: AssignmentSummaryApi[] | { results: AssignmentSummaryApi[] }) =>
        unwrapListResponse(response),
      providesTags: ["AssignmentSummary"],
    }),
    createAssignment: builder.mutation<AssignmentApi, CreateAssignmentPayload>({
      query: (payload) => ({
        url: "item-assignments/",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Assignments", "AssignmentSummary", "Items", "RecentActivities"],
    }),
    updateAssignment: builder.mutation<
      AssignmentApi,
      Partial<CreateAssignmentPayload> & {
        id: number;
        returned_at?: string | null;
        return_condition?: "GOOD" | "FAIR" | "DAMAGED" | null;
      }
    >({
      query: ({ id, ...payload }) => ({
        url: `item-assignments/${id}/`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["Assignments", "AssignmentSummary", "Items", "RecentActivities"],
    }),
    deleteAssignment: builder.mutation<void, number>({
      query: (id) => ({
        url: `item-assignments/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Assignments", "AssignmentSummary", "Items", "RecentActivities"],
    }),
  }),
});

export const {
  useGetAssignmentsQuery,
  useGetAssignmentSummaryByAssigneeQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
} = assignmentApi;
