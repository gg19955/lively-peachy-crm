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
import { useUserSessionContext } from "@/context/session-context";

export default function Dashboard() {
  const { toast } = useToast();

  const [, setLocation] = useLocation();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null,
  );

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
                contactsPerPage={5}
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

            <LeadPipeline
              onToggleFeed={() => setLocation("/leads?view=feed")}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
