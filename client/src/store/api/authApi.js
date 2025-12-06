import { baseApi } from "./baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // User registration - sends OTP to email
    registerUser: builder.mutation({
      query: (data) => ({
        url: "/auth/user-registration",
        method: "POST",
        body: data,
      }),
    }),

    // Verify OTP and complete registration
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: "/auth/verify-user",
        method: "POST",
        body: data,
      }),
    }),

    // User login
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login-user",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useRegisterUserMutation,
  useVerifyOtpMutation,
  useLoginUserMutation,
} = authApi;
