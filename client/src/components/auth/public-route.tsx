import { Navigate } from "react-router-dom";
import { renderFallback } from "../RenterFallback";
import { useUserSessionContext } from "@/context/session-context";

interface PublicRouteProps {
  children: React.ReactNode;
  route?: string;
}

export function PublicRoute({ children, route = "/" }: PublicRouteProps) {
  const { userSession, loading } = useUserSessionContext();

  if (loading) {
    return <>{renderFallback}</>;
  }

  if (userSession) {
    return <Navigate to={route} replace />;
  }

  return <>{children}</>;
}
