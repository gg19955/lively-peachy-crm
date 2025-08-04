import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/Sidebar";
import { RefreshCw, Download, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AirtableSyncPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [contactsTableName, setContactsTableName] = useState("Contacts");
  const [leadsTableName, setLeadsTableName] = useState("Leads");

  const fullSyncMutation = useMutation({
    mutationFn: () => apiRequest("/api/airtable/sync", { method: "POST" }),
    onSuccess: (data) => {
      toast({
        title: "Sync Complete",
        description: `Successfully synced with Airtable. ${JSON.stringify(data.result)}`,
      });
      // Invalidate all data to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync with Airtable",
        variant: "destructive",
      });
    },
  });

  const importContactsMutation = useMutation({
    mutationFn: () => apiRequest("/api/airtable/import/contacts", { 
      method: "POST",
      body: JSON.stringify({ tableName: contactsTableName })
    }),
    onSuccess: (data) => {
      toast({
        title: "Import Complete",
        description: `Imported ${data.imported} new contacts, updated ${data.updated} existing contacts`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import contacts",
        variant: "destructive",
      });
    },
  });

  const importLeadsMutation = useMutation({
    mutationFn: () => apiRequest("/api/airtable/import/leads", { 
      method: "POST",
      body: JSON.stringify({ tableName: leadsTableName })
    }),
    onSuccess: (data) => {
      toast({
        title: "Import Complete",
        description: `Imported ${data.imported} new leads, updated ${data.updated} existing leads`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import leads",
        variant: "destructive",
      });
    },
  });

  const exportContactsMutation = useMutation({
    mutationFn: () => apiRequest("/api/airtable/export/contacts", { 
      method: "POST",
      body: JSON.stringify({ tableName: contactsTableName })
    }),
    onSuccess: (data) => {
      toast({
        title: "Export Complete",
        description: `Exported ${data.exported} contacts to Airtable`,
      });
    },
    onError: (error) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export contacts",
        variant: "destructive",
      });
    },
  });

  const exportLeadsMutation = useMutation({
    mutationFn: () => apiRequest("/api/airtable/export/leads", { 
      method: "POST",
      body: JSON.stringify({ tableName: leadsTableName })
    }),
    onSuccess: (data) => {
      toast({
        title: "Export Complete",
        description: `Exported ${data.exported} leads to Airtable`,
      });
    },
    onError: (error) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export leads",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight" data-testid="heading-airtable-sync">Airtable Sync</h1>
              <p className="text-muted-foreground">
                Synchronize your PropertyCRM data with Airtable
              </p>
            </div>
          </div>

          {/* Full Sync */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Full Synchronization
              </CardTitle>
              <CardDescription>
                Perform a complete bidirectional sync between PropertyCRM and Airtable.
                This will import new data from Airtable and export new PropertyCRM data to Airtable.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => fullSyncMutation.mutate()}
                disabled={fullSyncMutation.isPending}
                className="w-full"
                data-testid="button-full-sync"
              >
                {fullSyncMutation.isPending ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {fullSyncMutation.isPending ? "Syncing..." : "Start Full Sync"}
              </Button>
            </CardContent>
          </Card>

          {/* Contacts Sync */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Contacts Synchronization
              </CardTitle>
              <CardDescription>
                Import and export contacts between PropertyCRM and Airtable
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contacts-table-name">Airtable Table Name</Label>
                <Input
                  id="contacts-table-name"
                  value={contactsTableName}
                  onChange={(e) => setContactsTableName(e.target.value)}
                  placeholder="Contacts"
                  data-testid="input-contacts-table-name"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => importContactsMutation.mutate()}
                  disabled={importContactsMutation.isPending}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-import-contacts"
                >
                  {importContactsMutation.isPending ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  {importContactsMutation.isPending ? "Importing..." : "Import from Airtable"}
                </Button>
                <Button
                  onClick={() => exportContactsMutation.mutate()}
                  disabled={exportContactsMutation.isPending}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-export-contacts"
                >
                  {exportContactsMutation.isPending ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {exportContactsMutation.isPending ? "Exporting..." : "Export to Airtable"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Leads Sync */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Leads Synchronization
              </CardTitle>
              <CardDescription>
                Import and export leads between PropertyCRM and Airtable
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="leads-table-name">Airtable Table Name</Label>
                <Input
                  id="leads-table-name"
                  value={leadsTableName}
                  onChange={(e) => setLeadsTableName(e.target.value)}
                  placeholder="Leads"
                  data-testid="input-leads-table-name"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => importLeadsMutation.mutate()}
                  disabled={importLeadsMutation.isPending}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-import-leads"
                >
                  {importLeadsMutation.isPending ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  {importLeadsMutation.isPending ? "Importing..." : "Import from Airtable"}
                </Button>
                <Button
                  onClick={() => exportLeadsMutation.mutate()}
                  disabled={exportLeadsMutation.isPending}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-export-leads"
                >
                  {exportLeadsMutation.isPending ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {exportLeadsMutation.isPending ? "Exporting..." : "Export to Airtable"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Airtable Base Structure</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Make sure your Airtable base has tables with the following field names:
                </p>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h5 className="font-medium mb-2">Contacts Table Fields:</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Name (Single line text)</li>
                      <li>• Email (Email)</li>
                      <li>• Phone (Phone number)</li>
                      <li>• Company (Single line text)</li>
                      <li>• Address (Single line text)</li>
                      <li>• Contact Type (Single select: tenant, landlord, vendor, prospect)</li>
                      <li>• Status (Single select: active, inactive, pending)</li>
                      <li>• Notes (Long text)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Leads Table Fields:</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Property Address (Single line text)</li>
                      <li>• Property Type (Single select: residential, commercial, industrial, land)</li>
                      <li>• Lead Stage (Single select: new, contacted, qualified, proposal, negotiation, closed, lost)</li>
                      <li>• Priority (Single select: low, medium, high, urgent)</li>
                      <li>• Contact Name (Single line text)</li>
                      <li>• Contact Email (Email)</li>
                      <li>• Contact Phone (Phone number)</li>
                      <li>• Budget (Single line text)</li>
                      <li>• Notes (Long text)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}