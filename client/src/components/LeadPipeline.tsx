import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Lead } from "@shared/schema";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import AddLeadModal from "./AddLeadModal";
import EditLeadModal from "./EditLeadModal";

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
  const [showAddLead, setShowAddLead] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const { data: leads, isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: leadsByStage } = useQuery<Array<{stage: string, count: number}>>({
    queryKey: ["/api/leads/by-stage"],
  });

  const getLeadsByStage = (stage: string) => {
    return leads?.filter((lead: Lead) => lead.stage === stage) || [];
  };

  const getStageCount = (stage: string) => {
    return leadsByStage?.find((item: any) => item.stage === stage)?.count || 0;
  };

  const mainStages = ["inquiry", "meeting_booked", "signed", "closed"];

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
                      className={`rounded-lg p-4 border ${stageColors[stage as keyof typeof stageColors]}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium">
                          {stageLabels[stage as keyof typeof stageLabels]}
                        </h5>
                        <Badge variant="secondary" className="text-xs">
                          {count}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {stageLeads.length === 0 ? (
                          <div className="text-xs text-gray-500 text-center py-4">
                            No leads in this stage
                          </div>
                        ) : (
                          stageLeads.slice(0, 3).map((lead: Lead) => (
                            <div 
                              key={lead.id}
                              className="bg-white rounded-lg p-3 border border-gray-100 cursor-pointer hover:shadow-sm transition-shadow"
                              data-testid={`card-lead-${lead.id}`}
                              onClick={() => setEditingLead(lead)}
                            >
                              <p className="text-sm font-medium text-gray-900">
                                {lead.propertyAddress || "Property Inquiry"}
                              </p>
                              <p className="text-xs text-gray-500" data-testid={`text-lead-contact-${lead.id}`}>
                                {lead.contactName || "No contact name"}
                              </p>
                              <p className="text-xs text-gray-400">
                                ${lead.estimatedValue ? lead.estimatedValue.toLocaleString() : "Value TBD"}
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
            
            {/* Recent Activity */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">Recent Activity</h4>
              <div className="space-y-3">
                {leads && leads.length > 0 ? (
                  leads.slice(0, 5).map((lead: Lead) => (
                    <div 
                      key={lead.id}
                      className="border border-gray-200 rounded-lg p-3"
                      data-testid={`activity-lead-${lead.id}`}
                    >
                      <p className="text-sm font-medium text-gray-900">
                        New lead inquiry
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        inquiry from {lead.contactName || "Unknown contact"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "Date unknown"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p className="text-sm">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
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
