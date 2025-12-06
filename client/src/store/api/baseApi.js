import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the base URL for your API
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    credentials: "include", // Include cookies for httpOnly tokens
    prepareHeaders: (headers, { getState }) => {
      // Get token from state if you have auth slice
      const token = getState().auth.accessToken;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["User", "Message", "Chat"], // Define tag types for cache invalidation
  endpoints: (builder) => ({
    // Add your endpoints here
    // Example:
    // getUsers: builder.query({
    //   query: () => "/users",
    //   providesTags: ["User"],
    // }),
  }),
});

// Export hooks for usage in functional components
// export const { useGetUsersQuery } = baseApi;
