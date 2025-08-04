import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import StatsCards from "@/components/StatsCards";
import ContactsList from "@/components/ContactsList";
import ContactDetail from "@/components/ContactDetail";
import LeadPipeline from "@/components/LeadPipeline";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Contact Management" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <StatsCards />
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <ContactsList 
                onSelectContact={setSelectedContactId}
                selectedContactId={selectedContactId}
              />
              <div className="hidden xl:block">
                <ContactDetail contactId={selectedContactId} />
              </div>
              
              {/* Mobile contact detail modal or overlay would go here */}
              {selectedContactId && (
                <div className="xl:hidden">
                  <ContactDetail contactId={selectedContactId} />
                </div>
              )}
            </div>

            <LeadPipeline onToggleFeed={() => setLocation("/leads?view=feed")} />
          </div>
        </main>
      </div>
    </div>
  );
}
