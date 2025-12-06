import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./api/baseApi";
import authReducer from "./slices/authSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      // Add the generated reducer as a specific top-level slice
      [baseApi.reducerPath]: baseApi.reducer,
      // Auth reducer
      auth: authReducer,
    },
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of RTK Query
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });
};
