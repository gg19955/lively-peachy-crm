import { Navigate, useSearchParams } from "react-router-dom";
import { useUserSessionContext } from "@/context/session-context";
import { renderFallback } from "../RenterFallback";

interface ProtectedRouteProps {
  children: React.ReactNode;
  route?: string;
}

export function ProtectedRoute({
  children,
  route = "/",
}: ProtectedRouteProps): JSX.Element {
  const { userSession, loading } = useUserSessionContext();

  const [searchParams] = useSearchParams();

  if (loading) {
    return <>{renderFallback}</>;
  }

  if (!userSession) {
    return <Navigate to={`${route}?${searchParams}`} replace />;
  }

  return <>{children}</>;
}
