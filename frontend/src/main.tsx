import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SWRConfig } from "swr";
import App from "./App.tsx";
import "./index.css";
import axiosInstance from "./lib/axios.ts";

const swrConfig = {
  fetcher: (res: string) => axiosInstance.get(res).then((r) => r.data),
  focusThrottleInterval: 30000,
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SWRConfig value={swrConfig}>
      <App />
    </SWRConfig>
  </StrictMode>
);
