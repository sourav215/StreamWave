import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // Track initial hydration
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "authCredentials",
          JSON.stringify({ user, accessToken })
        );
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      // Clear from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("authCredentials");
      }
    },
    // Action to restore auth from localStorage
    restoreAuth: (state, action) => {
      const { user, accessToken } = action.payload;
      if (user && accessToken) {
        state.user = user;
        state.accessToken = accessToken;
        state.isAuthenticated = true;
      }
      state.isLoading = false;
    },
    // Action to clear loading state
    setAuthLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, logout, restoreAuth, setAuthLoading } =
  authSlice.actions;
export default authSlice.reducer;
