import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import ContactsPage from "@/pages/contacts";
import LeadsPage from "@/pages/leads";
import AirtableSyncPage from "@/pages/airtable-sync";

function Router() {
  // Temporarily bypass authentication for testing
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/contacts" component={ContactsPage} />
      <Route path="/leads" component={LeadsPage} />
      <Route path="/airtable-sync" component={AirtableSyncPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
