import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { GlobalErrorNotifier } from "./components/GlobalErrorNotifier";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <GlobalErrorNotifier />
      <App />
    </ErrorBoundary>
  </StrictMode>
);
