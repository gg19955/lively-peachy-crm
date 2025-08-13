import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Download, Upload, RefreshCw, TestTube, Settings, ExternalLink } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function GoogleSheetsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [contactsSheetName, setContactsSheetName] = useState("Contacts");
  const [leadsSheetName, setLeadsSheetName] = useState("Leads");

  const testConnectionMutation = useMutation({
    mutationFn: () => apiRequest({ 
      url: "/api/google-sheets/test", 
      method: "POST",
      body: { spreadsheetId, contactsSheetName, leadsSheetName }
    }),
    onSuccess: (data) => {
      toast({
        title: "Connection Test",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const fullSyncMutation = useMutation({
    mutationFn: () => apiRequest({ 
      url: "/api/google-sheets/sync", 
      method: "POST",
      body: { spreadsheetId, contactsSheetName, leadsSheetName }
    }),
    onSuccess: (data) => {
      toast({
        title: "Sync Complete",
        description: `Imported ${data.contactsImported} contacts, ${data.leadsImported} leads. Exported ${data.contactsExported} contacts, ${data.leadsExported} leads.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const importContactsMutation = useMutation({
    mutationFn: () => apiRequest({ 
      url: "/api/google-sheets/import/contacts",
      method: "POST",
      body: { spreadsheetId, sheetName: contactsSheetName }
    }),
    onSuccess: (data) => {
      toast({
        title: "Import Complete",
        description: `Imported ${data.imported} contacts from Google Sheets.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const importLeadsMutation = useMutation({
    mutationFn: () => apiRequest({ 
      url: "/api/google-sheets/import/leads",
      method: "POST",
      body: { spreadsheetId, sheetName: leadsSheetName }
    }),
    onSuccess: (data) => {
      toast({
        title: "Import Complete",
        description: `Imported ${data.imported} leads from Google Sheets.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
    onError: (error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const exportContactsMutation = useMutation({
    mutationFn: () => apiRequest({ 
      url: "/api/google-sheets/export/contacts",
      method: "POST",
      body: { spreadsheetId, sheetName: contactsSheetName }
    }),
    onSuccess: (data) => {
      toast({
        title: "Export Complete",
        description: `Exported ${data.exported} contacts to Google Sheets.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please Log In",
          description: "You need to be logged in to export data. Redirecting to login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const exportLeadsMutation = useMutation({
    mutationFn: () => apiRequest({ 
      url: "/api/google-sheets/export/leads",
      method: "POST",
      body: { spreadsheetId, sheetName: leadsSheetName }
    }),
    onSuccess: (data) => {
      toast({
        title: "Export Complete",
        description: `Exported ${data.exported} leads to Google Sheets.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Please Log In",
          description: "You need to be logged in to export data. Redirecting to login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950" data-testid="google-sheets-page">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100" data-testid="page-title">
              Google Sheets Integration
            </h1>
            <Button
              variant="outline"
              onClick={() => window.open("https://sheets.google.com", "_blank")}
              data-testid="button-open-sheets"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Google Sheets
            </Button>
          </div>

          <Card data-testid="card-configuration">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration
              </CardTitle>
              <CardDescription>
                Configure your Google Sheets connection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="spreadsheetId">Spreadsheet ID</Label>
                <Input
                  id="spreadsheetId"
                  placeholder="Enter your Google Sheets spreadsheet ID"
                  value={spreadsheetId}
                  onChange={(e) => setSpreadsheetId(e.target.value)}
                  data-testid="input-spreadsheet-id"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Find this in your Google Sheets URL: https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactsSheet">Contacts Sheet Name</Label>
                  <Input
                    id="contactsSheet"
                    placeholder="Contacts"
                    value={contactsSheetName}
                    onChange={(e) => setContactsSheetName(e.target.value)}
                    data-testid="input-contacts-sheet"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leadsSheet">Leads Sheet Name</Label>
                  <Input
                    id="leadsSheet"
                    placeholder="Leads"
                    value={leadsSheetName}
                    onChange={(e) => setLeadsSheetName(e.target.value)}
                    data-testid="input-leads-sheet"
                  />
                </div>
              </div>

              <Button
                onClick={() => testConnectionMutation.mutate()}
                disabled={!spreadsheetId || testConnectionMutation.isPending}
                className="w-full"
                data-testid="button-test-connection"
              >
                <TestTube className="h-4 w-4 mr-2" />
                {testConnectionMutation.isPending ? "Testing..." : "Test Connection"}
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card data-testid="card-contacts-sync">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Contacts Synchronization
                </CardTitle>
                <CardDescription>
                  Import and export contacts between PropertyCRM and Google Sheets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Sheet Name</Label>
                  <Input
                    value={contactsSheetName}
                    onChange={(e) => setContactsSheetName(e.target.value)}
                    placeholder="Contacts"
                    data-testid="input-contacts-table-name"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => importContactsMutation.mutate()}
                    disabled={!spreadsheetId || importContactsMutation.isPending}
                    className="flex-1"
                    data-testid="button-import-contacts"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {importContactsMutation.isPending ? "Importing..." : "Import from Sheets"}
                  </Button>
                  <Button
                    onClick={() => exportContactsMutation.mutate()}
                    disabled={!spreadsheetId || exportContactsMutation.isPending}
                    variant="outline"
                    className="flex-1"
                    data-testid="button-export-contacts"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {exportContactsMutation.isPending ? "Exporting..." : "Export to Sheets"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-leads-sync">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Leads Synchronization
                </CardTitle>
                <CardDescription>
                  Import and export leads between PropertyCRM and Google Sheets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Sheet Name</Label>
                  <Input
                    value={leadsSheetName}
                    onChange={(e) => setLeadsSheetName(e.target.value)}
                    placeholder="Leads"
                    data-testid="input-leads-table-name"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => importLeadsMutation.mutate()}
                    disabled={!spreadsheetId || importLeadsMutation.isPending}
                    className="flex-1"
                    data-testid="button-import-leads"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {importLeadsMutation.isPending ? "Importing..." : "Import from Sheets"}
                  </Button>
                  <Button
                    onClick={() => exportLeadsMutation.mutate()}
                    disabled={!spreadsheetId || exportLeadsMutation.isPending}
                    variant="outline"
                    className="flex-1"
                    data-testid="button-export-leads"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {exportLeadsMutation.isPending ? "Exporting..." : "Export to Sheets"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-full-sync">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Full Synchronization
              </CardTitle>
              <CardDescription>
                Perform a complete bidirectional sync between PropertyCRM and Google Sheets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => fullSyncMutation.mutate()}
                disabled={!spreadsheetId || fullSyncMutation.isPending}
                className="w-full"
                size="lg"
                data-testid="button-full-sync"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {fullSyncMutation.isPending ? "Syncing..." : "Full Sync"}
              </Button>
            </CardContent>
          </Card>

          <Card data-testid="card-setup-instructions">
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Google Sheets Structure</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Make sure your Google Sheets has sheets with the following column headers:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-sm">Contacts Sheet Fields:</h5>
                    <ul className="text-xs text-gray-600 mt-1 space-y-1">
                      <li>• Name (required)</li>
                      <li>• Email</li>
                      <li>• Phone</li>
                      <li>• Type (tenant, landlord, vendor, prospect)</li>
                      <li>• Status (active, inactive)</li>
                      <li>• Address</li>
                      <li>• Notes</li>
                      <li>• ID (for tracking)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm">Leads Sheet Fields:</h5>
                    <ul className="text-xs text-gray-600 mt-1 space-y-1">
                      <li>• Property Address (required)</li>
                      <li>• Contact Name (required)</li>
                      <li>• Contact Email</li>
                      <li>• Contact Phone</li>
                      <li>• Stage (inquiry, viewing, negotiation, closed)</li>
                      <li>• Priority (low, medium, high)</li>
                      <li>• Estimated Value</li>
                      <li>• Notes</li>
                      <li>• ID (for tracking)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Service Account Setup</h4>
                <p className="text-sm text-gray-600">
                  To connect to Google Sheets, you need to set up Google Service Account credentials. 
                  The system requires GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY environment variables.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}