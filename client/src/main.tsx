import { createRoot } from "react-dom/client";
import "./index.css";

import { StrictMode } from "react";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App";
import { routesSection } from "./routes/sections";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { ThemeProvider } from "./components/ThemeProvider";

// ----------------------------------------------------------------------

function RootLayout() {
  return (
    <>
      <App>
        <Toaster />
        <Outlet />
      </App>
    </>
  );
}

const router = createBrowserRouter([
  {
    Component: RootLayout,
    errorElement: <ErrorBoundary />,
    children: routesSection,
  },
]);

const root = createRoot(document.getElementById("root")!);

root.render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="property-crm-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
);
