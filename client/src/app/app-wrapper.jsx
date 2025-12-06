"use client";

import { ConfigProvider, App } from "antd";

export default function AppWrapper({ children }) {
  return (
    <ConfigProvider>
      <App>{children}</App>
    </ConfigProvider>
  );
}
