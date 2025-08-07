import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Activity } from "lucide-react";
import { useState, DragEvent } from "react";
import { Lead } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AddLeadModal from "./AddLeadModal";
import EditLeadModal from "./EditLeadModal";

const stageColors = {
  inquiry: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
  meeting_booked: "bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300",
  proposal_sent: "bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300",
  contract_sent: "bg-purple-50 border-purple-200 text-purple-900 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300", 
  signed: "bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
  closed: "bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300",
};

const stageLabels = {
  inquiry: "New Leads",
  meeting_booked: "Meeting Booked",
  proposal_sent: "Proposal Sent",
  contract_sent: "Contract Sent", 
  signed: "Signed",
  closed: "Closed",
};

interface LeadPipelineProps {
  onToggleFeed?: () => void;
}

export default function LeadPipeline({ onToggleFeed }: LeadPipelineProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddLead, setShowAddLead] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const { data: leads, isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: leadsByStage } = useQuery<Array<{stage: string, count: number}>>({
    queryKey: ["/api/leads/by-stage"],
  });

  const updateLeadStageMutation = useMutation({
    mutationFn: async ({ leadId, newStage }: { leadId: string; newStage: string }) => {
      return await apiRequest(`/api/leads/${leadId}`, { method: "PUT", body: { stage: newStage } });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/by-stage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      const message = variables.newStage === 'closed' 
        ? "Lead archived successfully" 
        : "Lead stage updated successfully";
      
      toast({
        title: "Success",
        description: message,
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update lead stage",
        variant: "destructive",
      });
    },
  });

  const getLeadsByStage = (stage: string) => {
    return leads?.filter((lead: Lead) => lead.stage === stage) || [];
  };

  const getStageCount = (stage: string) => {
    return leadsByStage?.find((item: any) => item.stage === stage)?.count || 0;
  };

  const mainStages = ["inquiry", "meeting_booked", "proposal_sent", "contract_sent", "signed", "closed"];

  // Drag and Drop handlers
  const handleDragStart = (e: DragEvent<HTMLDivElement>, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, stage: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetStage: string) => {
    e.preventDefault();
    setDragOverStage(null);
    
    if (draggedLead && draggedLead.stage !== targetStage) {
      updateLeadStageMutation.mutate({
        leadId: draggedLead.id,
        newStage: targetStage,
      });
    }
    setDraggedLead(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Property Leads</CardTitle>
            <Button onClick={() => setShowAddLead(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Lead
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Lead Pipeline</h4>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="space-y-3">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <CardTitle className="text-lg sm:text-xl">Property Leads</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleFeed}
                data-testid="button-toggle-feed"
                className="flex items-center gap-2 w-fit"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Lead Feed</span>
                <span className="sm:hidden">Feed</span>
              </Button>
            </div>
            <Button 
              onClick={() => setShowAddLead(true)}
              data-testid="button-add-lead"
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Add New Lead</span>
              <span className="sm:hidden">Add Lead</span>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Lead Pipeline</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {mainStages.map((stage) => {
                  const stageLeads = getLeadsByStage(stage);
                  const count = getStageCount(stage);
                  
                  return (
                    <div 
                      key={stage}
                      className={`rounded-lg p-4 border transition-all duration-200 ${stageColors[stage as keyof typeof stageColors]} ${
                        dragOverStage === stage ? 'ring-2 ring-blue-400 ring-opacity-50 bg-blue-50' : ''
                      }`}
                      onDragOver={(e) => handleDragOver(e, stage)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, stage)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium">
                          {stageLabels[stage as keyof typeof stageLabels]}
                        </h5>
                        <Badge variant="secondary" className="text-xs">
                          {count}
                        </Badge>
                      </div>
                      <div 
                        className="min-h-[200px] space-y-3 max-h-[600px] overflow-y-auto"
                        data-testid={`dropzone-${stage}`}
                      >
                        {stageLeads.length === 0 ? (
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-8">
                            No leads in this stage
                          </div>
                        ) : (
                          stageLeads.map((lead: Lead) => (
                            <div 
                              key={lead.id}
                              className={`bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-100 dark:border-gray-700 cursor-move hover:shadow-sm transition-all duration-200 ${
                                draggedLead?.id === lead.id ? 'opacity-50 rotate-3 shadow-lg' : ''
                              }`}
                              data-testid={`card-lead-${lead.id}`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, lead)}
                              onDragEnd={handleDragEnd}
                              onClick={() => setEditingLead(lead)}
                            >
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {lead.propertyAddress || "Property Inquiry"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400" data-testid={`text-lead-contact-${lead.id}`}>
                                {lead.contactName || "No contact name"}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {lead.timeframe ? lead.timeframe.replace(/_/g, ' ').replace(/^./, str => str.toUpperCase()) : "Timeframe TBD"}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
          </div>
        </CardContent>
      </Card>

      <AddLeadModal
        open={showAddLead}
        onOpenChange={setShowAddLead}
      />
      
      <EditLeadModal
        lead={editingLead}
        open={!!editingLead}
        onOpenChange={(open: boolean) => !open && setEditingLead(null)}
      />
    </>
  );
}
