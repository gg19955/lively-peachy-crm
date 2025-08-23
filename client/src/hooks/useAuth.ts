import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Check if the error is an authentication error
  const isAuthError = error && error.message?.includes("401");

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !isAuthError,
  };
}
