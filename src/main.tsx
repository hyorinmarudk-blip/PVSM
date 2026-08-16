import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { BusinessProvider } from "./context/BusinessContext";

import {
  BrandingProvider,
} from "./context/BrandingContext";

ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
).render(
  <React.StrictMode>
    <BusinessProvider>
      <BrandingProvider>
        <App />
      </BrandingProvider>
    </BusinessProvider>
  </React.StrictMode>,
);
