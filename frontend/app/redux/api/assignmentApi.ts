
import {baseApi} from "./baseApi";

export const assignmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAssignments: builder.query({
      query: () => "assignments/",
    }),
  }),
});

export const { useGetAssignmentsQuery } = assignmentApi;