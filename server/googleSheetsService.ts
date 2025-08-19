import { google } from 'googleapis';
import { storage } from './storage';
import type { Contact, Lead, InsertContact, InsertLead } from '../shared/schema';

interface GoogleSheetsConfig {
  spreadsheetId: string;
  contactsSheetName: string;
  leadsSheetName: string;
}

export class GoogleSheetsService {
  // Extract spreadsheet ID from URL if needed
  private extractSpreadsheetId(input: string): string {
    // If it's already just an ID, return as-is
    if (!input.includes('docs.google.com')) {
      return input;
    }
    
    // Extract ID from URL
    const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      return match[1];
    }
    
    throw new Error('Invalid Google Sheets URL or ID format');
  }
  private sheets: any;
  private config: GoogleSheetsConfig;

  constructor(config: GoogleSheetsConfig) {
    // Extract spreadsheet ID from URL if needed
    this.config = {
      ...config,
      spreadsheetId: this.extractSpreadsheetId(config.spreadsheetId)
    };
    
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

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          // Skip rows with no name (column A) or completely empty rows
          if (!row || row.length === 0 || !row[0] || row[0].toString().trim() === '') {
            continue;
          }

          // Handle empty cells and set proper defaults
          const contactData: InsertContact = {
            name: (row[0] || '').toString().trim(),
            email: row[1] && row[1].toString().trim() ? row[1].toString().trim() : null,
            phone: row[2] && row[2].toString().trim() ? row[2].toString().trim() : null,
            type: row[3] && row[3].toString().trim() ? (row[3].toString().toLowerCase() as any) : 'prospect',
            status: row[4] && row[4].toString().trim() ? (row[4].toString().toLowerCase() as any) : 'active',
            address: row[5] && row[5].toString().trim() ? row[5].toString().trim() : null,
            notes: row[6] && row[6].toString().trim() ? row[6].toString().trim() : null,
            googleSheetsId: null,
          };

          await storage.createContact(contactData, 'test-user-123');
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
          contact.type || '',
          contact.status || '',
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

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          // Skip empty rows or rows without property address
          if (!row || row.length === 0 || !row[0] || row[0].toString().trim() === '') {
            continue;
          }

          // Map your sheet structure: Property Address | Contact Name | Contact Email | Contact Phone | Stage | Priority | Notes | ID
          const leadData: InsertLead = {
            propertyAddress: (row[0] || '').toString().trim(),
            contactName: row[1] && row[1].toString().trim() ? row[1].toString().trim() : null,
            contactEmail: row[2] && row[2].toString().trim() ? row[2].toString().trim() : null,
            contactPhone: row[3] && row[3].toString().trim() ? row[3].toString().trim() : null,
            stage: row[4] && row[4].toString().trim() ? (row[4].toString().toLowerCase() as any) : 'inquiry',
            priority: row[5] && row[5].toString().trim() ? (row[5].toString().toLowerCase() as any) : 'medium',
            notes: row[6] && row[6].toString().trim() ? row[6].toString().trim() : null,
            googleSheetsId: row[7] && row[7].toString().trim() ? row[7].toString().trim() : null,
          };

          // Validate that we have a property address at minimum
          if (!leadData.propertyAddress) {
            continue;
          }

          await storage.createLead(leadData, 'test-user-123');
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
        ['Property Address', 'Contact Name', 'Contact Email', 'Contact Phone', 'Stage', 'Priority', 'Notes', 'ID'] // Header row
      ];

      for (const lead of leads) {
        values.push([
          lead.propertyAddress,
          lead.contactName || '',
          lead.contactEmail || '',
          lead.contactPhone || '',
          lead.stage || '',
          lead.priority || '',
          lead.notes || '',
          lead.id
        ]);
      }

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.config.spreadsheetId,
        range: `${this.config.leadsSheetName}!A1:H`,
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
        return {
          success: false,
          message: 'Google Service Account credentials not configured. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY secrets.'
        };
      }
      
      console.log('Testing Google Sheets access with:', {
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        spreadsheetId: this.config.spreadsheetId,
        hasKey: !!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
      });
      
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

  // Create or verify Google Sheet structure
  async ensureSheetStructure(): Promise<{ success: boolean; message: string }> {
    try {
      // First try to get the spreadsheet
      let spreadsheet;
      try {
        spreadsheet = await this.sheets.spreadsheets.get({
          spreadsheetId: this.config.spreadsheetId,
        });
      } catch (error) {
        return {
          success: false,
          message: `Spreadsheet not found or no access. Please check: 1) The spreadsheet ID is correct, 2) The service account (${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}) has been given Editor access to the spreadsheet`
        };
      }

      const sheets = spreadsheet.data.sheets || [];
      const sheetNames = sheets.map((sheet: any) => sheet.properties?.title);

      // Check if required sheets exist
      const contactsSheetExists = sheetNames.includes(this.config.contactsSheetName);
      const leadsSheetExists = sheetNames.includes(this.config.leadsSheetName);

      // Create missing sheets
      const requests = [];
      
      if (!contactsSheetExists) {
        requests.push({
          addSheet: {
            properties: {
              title: this.config.contactsSheetName
            }
          }
        });
      }

      if (!leadsSheetExists) {
        requests.push({
          addSheet: {
            properties: {
              title: this.config.leadsSheetName
            }
          }
        });
      }

      if (requests.length > 0) {
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.config.spreadsheetId,
          requestBody: { requests }
        });
      }

      // Set up headers for contacts sheet
      if (!contactsSheetExists) {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.config.spreadsheetId,
          range: `${this.config.contactsSheetName}!A1:G1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [['Name', 'Email', 'Phone', 'Type', 'Status', 'Address', 'Notes']]
          },
        });
      }

      // Set up headers for leads sheet
      if (!leadsSheetExists) {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.config.spreadsheetId,
          range: `${this.config.leadsSheetName}!A1:H1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [['Property Address', 'Contact Name', 'Contact Email', 'Contact Phone', 'Stage', 'Priority', 'Notes', 'ID']]
          },
        });
      }

      return {
        success: true,
        message: `Sheet structure verified. Contacts sheet: ${contactsSheetExists ? 'exists' : 'created'}, Leads sheet: ${leadsSheetExists ? 'exists' : 'created'}`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to ensure sheet structure: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}