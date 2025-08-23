import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { usePathname } from "wouter/use-browser-location";
import { UserSessionProvider } from "./context/session-context";
import { queryClient } from "./lib/queryClient";

type AppProps = {
  children: React.ReactNode;
};

function App({ children }: AppProps) {
  useScrollToTop();

  return (
    <UserSessionProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          {children}
        </TooltipProvider>
      </QueryClientProvider>
    </UserSessionProvider>
  );
}

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default App;
