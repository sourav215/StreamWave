"use client";

import { useMemo } from "react";
import { Provider } from "react-redux";
import { makeStore } from "./index";
import { useAuthInit } from "@/hooks/useAuthInit";

function AuthInitializer({ children }) {
  useAuthInit();
  return children;
}

export default function StoreProvider({ children }) {
  const store = useMemo(() => makeStore(), []);

  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  );
}
