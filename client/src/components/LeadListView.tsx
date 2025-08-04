import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, Edit, Phone, Mail, MapPin, Calendar, Flag } from "lucide-react";
import { type Lead } from "@shared/schema";
import EditLeadModal from "./EditLeadModal";

const stageBadgeColors = {
  inquiry: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  meeting_booked: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
  proposal_sent: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
  contract_sent: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
  signed: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
  closed: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
};

const priorityColors = {
  low: "text-gray-500 dark:text-gray-400",
  medium: "text-yellow-600 dark:text-yellow-400",
  high: "text-red-600 dark:text-red-400",
};

export default function LeadListView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const filteredLeads = leads.filter(lead => 
    lead.propertyAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatStage = (stage: string) => {
    switch (stage) {
      case 'inquiry': return 'Inquiry';
      case 'meeting_booked': return 'Meeting Booked';
      case 'proposal_sent': return 'Proposal Sent';
      case 'contract_sent': return 'Contract Sent';
      case 'signed': return 'Signed';
      case 'closed': return 'Closed';
      default: return stage;
    }
  };

  const formatTimeframe = (timeframe: string) => {
    switch (timeframe) {
      case 'select_date': return 'Select Date';
      case 'less_than_3_months': return '< 3 months';
      case '3_to_6_months': return '3-6 months';
      case '6_to_12_months': return '6-12 months';
      default: return timeframe;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <CardTitle className="text-xl sm:text-2xl font-bold">All Leads</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                  data-testid="input-search-leads"
                />
              </div>
              <Badge variant="secondary" className="text-sm w-fit self-center sm:self-auto">
                {filteredLeads.length} total leads
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property Address</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Timeframe</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {searchTerm ? "No leads found matching your search" : "No leads available"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{lead.propertyAddress}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{lead.contactName}</div>
                          {lead.contactEmail && (
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Mail className="h-3 w-3" />
                              <span>{lead.contactEmail}</span>
                            </div>
                          )}
                          {lead.contactPhone && (
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Phone className="h-3 w-3" />
                              <span>{lead.contactPhone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={stageBadgeColors[lead.stage as keyof typeof stageBadgeColors]}
                        >
                          {formatStage(lead.stage || 'inquiry')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Flag className={`h-4 w-4 ${priorityColors[lead.priority as keyof typeof priorityColors]}`} />
                          <span className="capitalize">{lead.priority}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.timeframe && (
                          <div className="flex items-center space-x-1 text-sm">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span>{formatTimeframe(lead.timeframe)}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingLead(lead)}
                          data-testid={`button-edit-lead-${lead.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <EditLeadModal
        lead={editingLead}
        open={!!editingLead}
        onOpenChange={(open: boolean) => !open && setEditingLead(null)}
      />
    </div>
  );
}