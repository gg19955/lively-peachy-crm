import type { RouteObject } from "react-router";

import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";

// ----------------------------------------------------------------------

export const ContactsPage = lazy(() => import("../pages/contacts"));
export const DashboardPage = lazy(() => import("../pages/dashboard"));
export const GoogleSheetsPage = lazy(() => import("../pages/google-sheets"));
export const LeadsPage = lazy(() => import("../pages/leads"));
export const LoginPage = lazy(() => import("../pages/Login"));
export const SignUpPage = lazy(() => import("../pages/sign-up"));
export const TosPage = lazy(() => import("../pages/term-of-service"));
export const PrivacyPolicyPage = lazy(() => import("../pages/privacy-policy"));
export const NotFoundPage = lazy(() => import("../pages/not-found"));
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PublicRoute } from "@/components/auth/public-route";
import { renderFallback } from "@/components/RenterFallback";

export const routesSection: RouteObject[] = [
  {
    element: (
      <ProtectedRoute route="sign-in">
        <Suspense fallback={renderFallback()}>
          <Outlet />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      { path: "/", element: <DashboardPage /> },

      { path: "google-sheets", element: <GoogleSheetsPage /> },
      { path: "leads", element: <LeadsPage /> },
      { path: "contacts", element: <ContactsPage /> },
    ],
  },

  {
    path: "sign-in",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "sign-up",
    element: (
      <PublicRoute>
        <SignUpPage />
      </PublicRoute>
    ),
  },

  {
    path: "terms-of-service",
    element: <TosPage />,
  },

  {
    path: "privacy-policy",
    element: <PrivacyPolicyPage />,
  },
  {
    path: "404",
    element: <NotFoundPage />,
  },
  { path: "*", element: <NotFoundPage /> },
];
