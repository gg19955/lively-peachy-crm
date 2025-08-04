import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import LeadPipeline from "@/components/LeadPipeline";
import LeadListView from "@/components/LeadListView";
import LeadFeed from "@/components/LeadFeed";
import { Button } from "@/components/ui/button";
import { Kanban, List, Activity } from "lucide-react";

type ViewMode = 'pipeline' | 'list' | 'feed';

export default function LeadsPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Check URL params for initial view mode
  const urlParams = new URLSearchParams(window.location.search);
  const initialView = urlParams.get('view') as ViewMode || 'pipeline';
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);

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
        <Header title="Property Leads" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* View Toggle Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
              <Button
                variant={viewMode === 'pipeline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('pipeline')}
                data-testid="button-pipeline-view"
                className="flex items-center justify-center space-x-1 w-full sm:w-auto"
              >
                <Kanban className="w-4 h-4" />
                <span>Pipeline</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                data-testid="button-list-view"
                className="flex items-center justify-center space-x-1 w-full sm:w-auto"
              >
                <List className="w-4 h-4" />
                <span>All Leads</span>
              </Button>
              <Button
                variant={viewMode === 'feed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('feed')}
                data-testid="button-feed-view"
                className="flex items-center justify-center space-x-1 w-full sm:w-auto"
              >
                <Activity className="w-4 h-4" />
                <span>Activity Feed</span>
              </Button>
            </div>

            {/* Render appropriate view based on mode */}
            {viewMode === 'pipeline' && <LeadPipeline onToggleFeed={() => setViewMode('feed')} />}
            {viewMode === 'list' && <LeadListView />}
            {viewMode === 'feed' && <LeadFeed />}
          </div>
        </main>
      </div>
    </div>
  );
}
