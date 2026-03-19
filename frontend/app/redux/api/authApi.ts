import { baseApi } from "./baseApi";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  email: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      async queryFn(credentials) {
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            credentials: "same-origin",
            body: JSON.stringify(credentials),
          });

          const data = await response.json().catch(() => null);
          if (!response.ok) {
            return {
              error: {
                status: response.status,
                data: data ?? { detail: "Login failed." },
              },
            };
          }

          if (!data?.success || typeof data.email !== "string") {
            return {
              error: {
                status: "PARSING_ERROR",
                data: data ?? { detail: "Unexpected server response while logging in." },
                error: "Unexpected server response while logging in.",
                originalStatus: response.status,
              },
            };
          }

          return { data };
        } catch {
          return {
            error: {
              status: "FETCH_ERROR",
              error: "Cannot reach login endpoint.",
            },
          };
        }
      },
    }),
  }),
});

export const { useLoginMutation } = authApi;
