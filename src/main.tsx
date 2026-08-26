import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { BusinessProvider } from "./Context/BusinessContext";

import {
  BrandingProvider,
} from "./Context/BrandingContext";

import AppErrorBoundary
  from "./components/AppErrorBoundary";

import {
  initializeGlobalErrorCapture,
} from "./services/globalErrorCapture";

initializeGlobalErrorCapture();

ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
).render(
<AppErrorBoundary>
  <BusinessProvider>
    <BrandingProvider>
      <App />
    </BrandingProvider>
  </BusinessProvider>
</AppErrorBoundary>
);
