import { env } from "@/config/config-global";
import { QueryClient, QueryFunction } from "@tanstack/react-query";

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  urlOrOptions: string | { method?: string; url?: string; body?: unknown },
  options?: { method?: string; body?: unknown },
): Promise<any> {
  let url: string;
  let method: string;
  let body: unknown;

  if (typeof urlOrOptions === "string") {
    // Legacy format: apiRequest(url, options)
    url = env.apiBaseUrl + urlOrOptions;
    method = options?.method || "GET";
    body = options?.body;
  } else {
    // New format: apiRequest({ url, method, body })
    url = env.apiBaseUrl + urlOrOptions.url;
    method = urlOrOptions.method || "GET";
    body = urlOrOptions.body;
  }

  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers: {
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
