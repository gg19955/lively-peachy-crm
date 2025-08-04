import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useState, DragEvent } from "react";
import { Lead } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AddLeadModal from "./AddLeadModal";
// import EditLeadModal from "./EditLeadModal"; // TODO: Create EditLeadModal component

const stageColors = {
  inquiry: "bg-blue-50 border-blue-200 text-blue-900",
  meeting_booked: "bg-yellow-50 border-yellow-200 text-yellow-900", 
  signed: "bg-green-50 border-green-200 text-green-900",
  closed: "bg-gray-50 border-gray-200 text-gray-900",
};

const stageLabels = {
  inquiry: "New Leads",
  meeting_booked: "Meeting Booked", 
  signed: "Signed",
  closed: "Closed",
};

export default function LeadPipeline() {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads/by-stage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Lead stage updated successfully",
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

  const mainStages = ["inquiry", "meeting_booked", "signed", "closed"];

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Lead Pipeline</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="space-y-3">
                      {[...Array(2)].map((_, j) => (
                        <div key={j} className="h-16 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Property Leads</CardTitle>
            <Button 
              onClick={() => setShowAddLead(true)}
              data-testid="button-add-lead"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Lead
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lead Pipeline */}
            <div className="lg:col-span-2">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Lead Pipeline</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        className="min-h-[100px] space-y-3"
                        data-testid={`dropzone-${stage}`}
                      >
                        {stageLeads.length === 0 ? (
                          <div className="text-xs text-gray-500 text-center py-8">
                            No leads in this stage
                          </div>
                        ) : (
                          stageLeads.slice(0, 3).map((lead: Lead) => (
                            <div 
                              key={lead.id}
                              className={`bg-white rounded-lg p-3 border border-gray-100 cursor-move hover:shadow-sm transition-all duration-200 ${
                                draggedLead?.id === lead.id ? 'opacity-50 rotate-3 shadow-lg' : ''
                              }`}
                              data-testid={`card-lead-${lead.id}`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, lead)}
                              onDragEnd={handleDragEnd}
                              onClick={() => setEditingLead(lead)}
                            >
                              <p className="text-sm font-medium text-gray-900">
                                {lead.propertyAddress || "Property Inquiry"}
                              </p>
                              <p className="text-xs text-gray-500" data-testid={`text-lead-contact-${lead.id}`}>
                                {lead.contactName || "No contact name"}
                              </p>
                              <p className="text-xs text-gray-400">
                                {lead.timeframe ? lead.timeframe.replace(/_/g, ' ').replace(/^./, str => str.toUpperCase()) : "Timeframe TBD"}
                              </p>
                            </div>
                          ))
                        )}
                        {stageLeads.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{stageLeads.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      <AddLeadModal
        open={showAddLead}
        onOpenChange={setShowAddLead}
      />
      
      {/* TODO: Implement EditLeadModal component */}
    </>
  );
}
