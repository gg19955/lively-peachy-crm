import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { insertContactSchema, insertInteractionSchema, insertLeadSchema } from "@shared/schema";
import { z } from "zod";

// Utility function to extract spreadsheet ID from URL
function extractSpreadsheetId(input: string): string {
  if (!input.includes('docs.google.com')) {
    return input;
  }
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  throw new Error('Invalid Google Sheets URL or ID format');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - temporarily disabled for testing
  // await setupAuth(app);

  // Mock auth routes for testing
  app.get('/api/auth/user', async (req: any, res) => {
    // Return mock user for testing
    res.json({ 
      id: "test-user-123", 
      email: "test@example.com", 
      firstName: "Test", 
      lastName: "User" 
    });
  });

  // Stats endpoint
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Contact routes
  app.get('/api/contacts', async (req, res) => {
    try {
      const searchTerm = req.query.search as string;
      const contacts = await storage.getContacts(searchTerm);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.get('/api/contacts/:id', async (req, res) => {
    try {
      const contact = await storage.getContact(req.params.id);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      console.error("Error fetching contact:", error);
      res.status(500).json({ message: "Failed to fetch contact" });
    }
  });

  app.post('/api/contacts', async (req: any, res) => {
    try {
      const userId = "test-user-123"; // Mock user for testing
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData, userId);
      
      // Try to sync to Google Sheets (don't fail if this fails)
      try {
        const { GoogleSheetsService } = await import('./googleSheetsService');
        if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY && process.env.GOOGLE_SHEETS_ID) {
          const googleSheetsService = new GoogleSheetsService({
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            contactsSheetName: 'Contacts',
            leadsSheetName: 'Leads'
          });
          await googleSheetsService.exportContacts();
          console.log("Contact synced to Google Sheets successfully");
        }
      } catch (syncError) {
        console.warn("Failed to sync contact to Google Sheets:", syncError);
        // Don't fail the request if Google Sheets sync fails
      }
      
      res.status(201).json(contact);
    } catch (error) {
      console.error("Error creating contact:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  app.put('/api/contacts/:id', async (req, res) => {
    try {
      const contactData = insertContactSchema.partial().parse(req.body);
      const contact = await storage.updateContact(req.params.id, contactData);
      res.json(contact);
    } catch (error) {
      console.error("Error updating contact:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  app.delete('/api/contacts/:id', async (req, res) => {
    try {
      await storage.deleteContact(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting contact:", error);
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  // Interaction routes
  app.get('/api/contacts/:id/interactions', async (req, res) => {
    try {
      const interactions = await storage.getContactInteractions(req.params.id);
      res.json(interactions);
    } catch (error) {
      console.error("Error fetching interactions:", error);
      res.status(500).json({ message: "Failed to fetch interactions" });
    }
  });

  app.post('/api/interactions', async (req: any, res) => {
    try {
      const userId = "test-user-123"; // Mock user for testing
      const interactionData = insertInteractionSchema.parse(req.body);
      const interaction = await storage.createInteraction(interactionData, userId);
      res.status(201).json(interaction);
    } catch (error) {
      console.error("Error creating interaction:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create interaction" });
    }
  });

  // Lead routes
  app.get('/api/leads', async (req, res) => {
    try {
      const stage = req.query.stage as string;
      const leads = await storage.getLeads(stage);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.get('/api/leads/by-stage', async (req, res) => {
    try {
      const leadsByStage = await storage.getLeadsByStage();
      res.json(leadsByStage);
    } catch (error) {
      console.error("Error fetching leads by stage:", error);
      res.status(500).json({ message: "Failed to fetch leads by stage" });
    }
  });

  app.get('/api/leads/:id', async (req, res) => {
    try {
      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Error fetching lead:", error);
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  app.post('/api/leads', async (req: any, res) => {
    try {
      const userId = "test-user-123"; // Mock user for testing
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData, userId);
      res.status(201).json(lead);
    } catch (error) {
      console.error("Error creating lead:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.put('/api/leads/:id', async (req, res) => {
    try {
      const leadData = insertLeadSchema.partial().parse(req.body);
      const lead = await storage.updateLead(req.params.id, leadData);
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.patch('/api/leads/:id', async (req, res) => {
    try {
      const leadData = insertLeadSchema.partial().parse(req.body);
      const lead = await storage.updateLead(req.params.id, leadData);
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.delete('/api/leads/:id', async (req, res) => {
    try {
      await storage.deleteLead(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Object storage routes for file uploads
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const userId = "test-user-123"; // Mock user for testing
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  app.put("/api/leads/:id/attachments", async (req, res) => {
    if (!req.body.attachmentURL) {
      return res.status(400).json({ error: "attachmentURL is required" });
    }

    const userId = "test-user-123"; // Mock user for testing

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.attachmentURL,
        {
          owner: userId,
          visibility: "private", // Lead attachments should be private
        },
      );

      // Update lead with new attachment
      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      const currentAttachments = lead.attachments || [];
      const updatedAttachments = [...currentAttachments, objectPath];

      await storage.updateLead(req.params.id, { attachments: updatedAttachments });

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting lead attachment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Airtable integration endpoints
  app.post('/api/airtable/sync', async (req, res) => {
    try {
      const { airtableService } = await import('./airtableService');
      const result = await airtableService.performFullSync();
      
      // Log the sync operation
      await storage.createSyncLog({
        entityType: 'full_sync',
        entityId: 'all',
        syncStatus: 'success',
        errorMessage: null,
      });

      res.json({
        message: "Airtable sync completed successfully",
        result: result
      });
    } catch (error) {
      console.error("Error syncing with Airtable:", error);
      
      // Log the sync error
      try {
        await storage.createSyncLog({
          entityType: 'full_sync',
          entityId: 'all',
          syncStatus: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
      } catch (logError) {
        console.error("Failed to log sync error:", logError);
      }

      res.status(500).json({ 
        message: "Failed to sync with Airtable",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Import contacts from Airtable
  app.post('/api/airtable/import/contacts', async (req, res) => {
    try {
      const { airtableService } = await import('./airtableService');
      const tableName = req.body.tableName || 'Contacts';
      const result = await airtableService.syncContactsFromAirtable(tableName);
      
      res.json({
        message: "Contacts imported successfully",
        imported: result.imported,
        updated: result.updated
      });
    } catch (error) {
      console.error("Error importing contacts:", error);
      res.status(500).json({ 
        message: "Failed to import contacts",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Import leads from Airtable
  app.post('/api/airtable/import/leads', async (req, res) => {
    try {
      const { airtableService } = await import('./airtableService');
      const tableName = req.body.tableName || 'Leads';
      const result = await airtableService.syncLeadsFromAirtable(tableName);
      
      res.json({
        message: "Leads imported successfully",
        imported: result.imported,
        updated: result.updated
      });
    } catch (error) {
      console.error("Error importing leads:", error);
      res.status(500).json({ 
        message: "Failed to import leads",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Export contacts to Airtable
  app.post('/api/airtable/export/contacts', async (req, res) => {
    try {
      const { airtableService } = await import('./airtableService');
      const tableName = req.body.tableName || 'Contacts';
      const result = await airtableService.exportContactsToAirtable(tableName);
      
      res.json({
        message: "Contacts exported successfully",
        exported: result.exported
      });
    } catch (error) {
      console.error("Error exporting contacts:", error);
      res.status(500).json({ 
        message: "Failed to export contacts",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Export leads to Airtable
  app.post('/api/airtable/export/leads', async (req, res) => {
    try {
      const { airtableService } = await import('./airtableService');
      const tableName = req.body.tableName || 'Leads';
      const result = await airtableService.exportLeadsToAirtable(tableName);
      
      res.json({
        message: "Leads exported successfully",
        exported: result.exported
      });
    } catch (error) {
      console.error("Error exporting leads:", error);
      res.status(500).json({ 
        message: "Failed to export leads",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Google Sheets integration endpoints
  app.post('/api/google-sheets/test', async (req, res) => {
    try {
      const { GoogleSheetsService } = await import('./googleSheetsService');
      const { spreadsheetId, contactsSheetName, leadsSheetName } = req.body;
      
      const service = new GoogleSheetsService({
        spreadsheetId: extractSpreadsheetId(spreadsheetId),
        contactsSheetName: contactsSheetName || 'Contacts',
        leadsSheetName: leadsSheetName || 'Leads'
      });
      
      const result = await service.testConnection();
      res.json(result);
    } catch (error) {
      console.error("Error testing Google Sheets connection:", error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/api/google-sheets/sync', async (req, res) => {
    try {
      const { GoogleSheetsService } = await import('./googleSheetsService');
      const { spreadsheetId, contactsSheetName, leadsSheetName } = req.body;
      
      const service = new GoogleSheetsService({
        spreadsheetId: extractSpreadsheetId(spreadsheetId),
        contactsSheetName: contactsSheetName || 'Contacts',
        leadsSheetName: leadsSheetName || 'Leads'
      });
      
      const result = await service.fullSync();
      res.json(result);
    } catch (error) {
      console.error("Error syncing with Google Sheets:", error);
      res.status(500).json({ 
        message: "Failed to sync with Google Sheets",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/api/google-sheets/import/contacts', async (req, res) => {
    try {
      const { GoogleSheetsService } = await import('./googleSheetsService');
      const { spreadsheetId, sheetName } = req.body;
      
      const service = new GoogleSheetsService({
        spreadsheetId: extractSpreadsheetId(spreadsheetId),
        contactsSheetName: sheetName || 'Contacts',
        leadsSheetName: 'Leads'
      });
      
      const result = await service.importContacts();
      res.json(result);
    } catch (error) {
      console.error("Error importing contacts:", error);
      res.status(500).json({ 
        message: "Failed to import contacts",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/api/google-sheets/import/leads', async (req, res) => {
    try {
      const { GoogleSheetsService } = await import('./googleSheetsService');
      const { spreadsheetId, sheetName } = req.body;
      
      const service = new GoogleSheetsService({
        spreadsheetId: extractSpreadsheetId(spreadsheetId),
        contactsSheetName: 'Contacts',
        leadsSheetName: sheetName || 'Leads'
      });
      
      const result = await service.importLeads();
      res.json(result);
    } catch (error) {
      console.error("Error importing leads:", error);
      res.status(500).json({ 
        message: "Failed to import leads",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/api/google-sheets/export/contacts', async (req, res) => {
    try {
      const { GoogleSheetsService } = await import('./googleSheetsService');
      const { spreadsheetId, sheetName } = req.body;
      
      const service = new GoogleSheetsService({
        spreadsheetId: extractSpreadsheetId(spreadsheetId),
        contactsSheetName: sheetName || 'Contacts',
        leadsSheetName: 'Leads'
      });
      
      const result = await service.exportContacts();
      res.json(result);
    } catch (error) {
      console.error("Error exporting contacts:", error);
      res.status(500).json({ 
        message: "Failed to export contacts",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/api/google-sheets/export/leads', async (req, res) => {
    try {
      const { GoogleSheetsService } = await import('./googleSheetsService');
      const { spreadsheetId, sheetName } = req.body;
      
      const service = new GoogleSheetsService({
        spreadsheetId: extractSpreadsheetId(spreadsheetId),
        contactsSheetName: 'Contacts',
        leadsSheetName: sheetName || 'Leads'
      });
      
      const result = await service.exportLeads();
      res.json(result);
    } catch (error) {
      console.error("Error exporting leads:", error);
      res.status(500).json({ 
        message: "Failed to export leads",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
