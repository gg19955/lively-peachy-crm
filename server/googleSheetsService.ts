import { google } from 'googleapis';
import { storage } from './storage';
import type { Contact, Lead, InsertContact, InsertLead } from '../shared/schema';

interface GoogleSheetsConfig {
  spreadsheetId: string;
  contactsSheetName: string;
  leadsSheetName: string;
}

export class GoogleSheetsService {
  private sheets: any;
  private config: GoogleSheetsConfig;

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
    
    // Format the private key properly by handling different escape patterns
    let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '';
    
    // Handle various newline escape patterns
    privateKey = privateKey
      .replace(/\\\\n/g, '\n')  // Double-escaped newlines
      .replace(/\\n/g, '\n')    // Escaped newlines
      .trim();
    
    // Debug: Check if key format is correct
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('Private key must contain -----BEGIN PRIVATE KEY----- header');
    }
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
        type: 'service_account',
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  // Import contacts from Google Sheets
  async importContacts(): Promise<{ imported: number; errors: string[] }> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range: `${this.config.contactsSheetName}!A2:Z`, // Skip header row
      });

      const rows = response.data.values || [];
      let imported = 0;
      const errors: string[] = [];

      for (const row of rows) {
        try {
          if (!row[0] || !row[1]) continue; // Skip empty rows

          const contactData: InsertContact = {
            name: row[0] || '',
            email: row[1] || '',
            phone: row[2] || '',
            type: (row[3] as any) || 'prospect',
            status: (row[4] as any) || 'active',
            address: row[5] || '',
            notes: row[6] || '',
            googleSheetsId: row[7] || null, // Store Google Sheets row ID if available
          };

          await storage.createContact(contactData, 'system');
          imported++;
        } catch (error) {
          errors.push(`Error importing contact "${row[0]}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return { imported, errors };
    } catch (error) {
      throw new Error(`Failed to import contacts from Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Export contacts to Google Sheets
  async exportContacts(): Promise<{ exported: number; errors: string[] }> {
    try {
      const contacts = await storage.getContacts();
      const values = [
        ['Name', 'Email', 'Phone', 'Type', 'Status', 'Address', 'Notes', 'ID'] // Header row
      ];

      for (const contact of contacts) {
        values.push([
          contact.name,
          contact.email || '',
          contact.phone || '',
          contact.type,
          contact.status,
          contact.address || '',
          contact.notes || '',
          contact.id
        ]);
      }

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.config.spreadsheetId,
        range: `${this.config.contactsSheetName}!A1:H`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });

      return { exported: contacts.length, errors: [] };
    } catch (error) {
      throw new Error(`Failed to export contacts to Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Import leads from Google Sheets
  async importLeads(): Promise<{ imported: number; errors: string[] }> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range: `${this.config.leadsSheetName}!A2:Z`, // Skip header row
      });

      const rows = response.data.values || [];
      let imported = 0;
      const errors: string[] = [];

      for (const row of rows) {
        try {
          if (!row[0] || !row[1]) continue; // Skip empty rows

          const leadData: InsertLead = {
            propertyAddress: row[0] || '',
            contactName: row[1] || '',
            contactEmail: row[2] || '',
            contactPhone: row[3] || '',
            stage: (row[4] as any) || 'inquiry',
            priority: (row[5] as any) || 'medium',
            estimatedValue: row[6] ? parseFloat(row[6]) : null,
            notes: row[7] || '',
            googleSheetsId: row[8] || null, // Store Google Sheets row ID if available
          };

          await storage.createLead(leadData, 'system');
          imported++;
        } catch (error) {
          errors.push(`Error importing lead "${row[0]}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return { imported, errors };
    } catch (error) {
      throw new Error(`Failed to import leads from Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Export leads to Google Sheets
  async exportLeads(): Promise<{ exported: number; errors: string[] }> {
    try {
      const leads = await storage.getLeads();
      const values = [
        ['Property Address', 'Contact Name', 'Contact Email', 'Contact Phone', 'Stage', 'Priority', 'Estimated Value', 'Notes', 'ID'] // Header row
      ];

      for (const lead of leads) {
        values.push([
          lead.propertyAddress,
          lead.contactName,
          lead.contactEmail || '',
          lead.contactPhone || '',
          lead.stage,
          lead.priority,
          lead.estimatedValue?.toString() || '',
          lead.notes || '',
          lead.id
        ]);
      }

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.config.spreadsheetId,
        range: `${this.config.leadsSheetName}!A1:I`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });

      return { exported: leads.length, errors: [] };
    } catch (error) {
      throw new Error(`Failed to export leads to Google Sheets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Full bidirectional sync
  async fullSync(): Promise<{ 
    contactsImported: number; 
    contactsExported: number; 
    leadsImported: number; 
    leadsExported: number; 
    errors: string[] 
  }> {
    const errors: string[] = [];
    let contactsImported = 0;
    let contactsExported = 0;
    let leadsImported = 0;
    let leadsExported = 0;

    try {
      // Import contacts
      const contactImportResult = await this.importContacts();
      contactsImported = contactImportResult.imported;
      errors.push(...contactImportResult.errors);

      // Export contacts
      const contactExportResult = await this.exportContacts();
      contactsExported = contactExportResult.exported;
      errors.push(...contactExportResult.errors);

      // Import leads
      const leadImportResult = await this.importLeads();
      leadsImported = leadImportResult.imported;
      errors.push(...leadImportResult.errors);

      // Export leads
      const leadExportResult = await this.exportLeads();
      leadsExported = leadExportResult.exported;
      errors.push(...leadExportResult.errors);

    } catch (error) {
      errors.push(`Full sync error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      contactsImported,
      contactsExported,
      leadsImported,
      leadsExported,
      errors
    };
  }

  // Test connection to Google Sheets
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Debug: validate credentials are set
      if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
        throw new Error('Google Service Account credentials not properly configured');
      }
      
      // Try to access a simple range first to test permissions
      const testResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range: 'A1:A1', // Just get one cell to test access
      });
      
      // If we get here, the API access works - now get sheet metadata
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.config.spreadsheetId,
      });

      return {
        success: true,
        message: `Connected to spreadsheet: ${response.data.properties?.title || 'Untitled'}`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Provide helpful error messages for common issues
      if (errorMessage.includes('DECODER routines::unsupported')) {
        return {
          success: false,
          message: 'Private key format error. Please ensure you copied the entire private_key field from your Google Service Account JSON file, including all \\n characters exactly as they appear.'
        };
      }
      
      if (errorMessage.includes('invalid_grant: Invalid grant: account not found')) {
        return {
          success: false,
          message: 'Service account not found. Please verify: 1) The GOOGLE_SERVICE_ACCOUNT_EMAIL matches your JSON file exactly, 2) Google Sheets API is enabled in your Google Cloud project, 3) The service account exists and is active.'
        };
      }
      
      if (errorMessage.includes('Requested entity was not found')) {
        return {
          success: false,
          message: 'Spreadsheet not found. Please verify: 1) The spreadsheet ID is correct, 2) The service account has been shared with the spreadsheet (add the service account email as an editor), 3) Google Sheets API is enabled in your Google Cloud project.'
        };
      }
      
      return {
        success: false,
        message: `Connection failed: ${errorMessage}`
      };
    }
  }
}