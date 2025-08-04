import { storage } from "./storage";
import type { InsertContact, InsertLead, Contact, Lead } from "@shared/schema";

interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime?: string;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

export class AirtableService {
  private apiKey: string;
  private baseId: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.AIRTABLE_API_KEY!;
    this.baseId = process.env.AIRTABLE_BASE_ID!;
    this.baseUrl = `https://api.airtable.com/v0/${this.baseId}`;

    if (!this.apiKey || !this.baseId) {
      throw new Error("Airtable API key and Base ID are required");
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}/${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Sync contacts from Airtable to local database
  async syncContactsFromAirtable(tableName: string = 'Contacts'): Promise<{ imported: number; updated: number }> {
    let imported = 0;
    let updated = 0;
    let offset: string | undefined;

    do {
      const params = new URLSearchParams();
      if (offset) params.append('offset', offset);
      
      const response: AirtableResponse = await this.makeRequest(
        `${tableName}?${params.toString()}`
      );

      for (const record of response.records) {
        const fields = record.fields;
        
        // Map Airtable fields to our contact schema
        const contactData: InsertContact = {
          name: fields.Name || fields.name || '',
          email: fields.Email || fields.email || null,
          phone: fields.Phone || fields.phone || null,
          contactType: this.mapContactType(fields['Contact Type'] || fields.contactType),
          status: this.mapContactStatus(fields.Status || fields.status),
          company: fields.Company || fields.company || null,
          address: fields.Address || fields.address || null,
          notes: fields.Notes || fields.notes || null,
          airtableId: record.id,
        };

        // Check if contact already exists by Airtable ID
        const existingContacts = await storage.getContacts();
        const existingContact = existingContacts.find(c => c.airtableId === record.id);

        if (existingContact) {
          await storage.updateContact(existingContact.id, contactData);
          updated++;
        } else {
          await storage.createContact(contactData, "airtable-sync");
          imported++;
        }
      }

      offset = response.offset;
    } while (offset);

    return { imported, updated };
  }

  // Sync leads from Airtable to local database
  async syncLeadsFromAirtable(tableName: string = 'Leads'): Promise<{ imported: number; updated: number }> {
    let imported = 0;
    let updated = 0;
    let offset: string | undefined;

    do {
      const params = new URLSearchParams();
      if (offset) params.append('offset', offset);
      
      const response: AirtableResponse = await this.makeRequest(
        `${tableName}?${params.toString()}`
      );

      for (const record of response.records) {
        const fields = record.fields;
        
        // Map Airtable fields to our lead schema
        const leadData: InsertLead = {
          propertyAddress: fields['Property Address'] || fields.propertyAddress || '',
          propertyType: this.mapPropertyType(fields['Property Type'] || fields.propertyType),
          leadStage: this.mapLeadStage(fields['Lead Stage'] || fields.leadStage),
          priority: this.mapPriority(fields.Priority || fields.priority),
          contactName: fields['Contact Name'] || fields.contactName || null,
          contactEmail: fields['Contact Email'] || fields.contactEmail || null,
          contactPhone: fields['Contact Phone'] || fields.contactPhone || null,
          budget: fields.Budget || fields.budget || null,
          notes: fields.Notes || fields.notes || null,
          airtableId: record.id,
        };

        // Check if lead already exists by Airtable ID
        const existingLeads = await storage.getLeads();
        const existingLead = existingLeads.find(l => l.airtableId === record.id);

        if (existingLead) {
          await storage.updateLead(existingLead.id, leadData);
          updated++;
        } else {
          await storage.createLead(leadData, "airtable-sync");
          imported++;
        }
      }

      offset = response.offset;
    } while (offset);

    return { imported, updated };
  }

  // Export contacts to Airtable
  async exportContactsToAirtable(tableName: string = 'Contacts'): Promise<{ exported: number }> {
    const contacts = await storage.getContacts();
    const contactsToExport = contacts.filter(c => !c.airtableId); // Only export new contacts
    
    let exported = 0;
    const batchSize = 10; // Airtable API limit

    for (let i = 0; i < contactsToExport.length; i += batchSize) {
      const batch = contactsToExport.slice(i, i + batchSize);
      const records = batch.map(contact => ({
        fields: {
          Name: contact.name,
          Email: contact.email,
          Phone: contact.phone,
          'Contact Type': contact.contactType,
          Status: contact.status,
          Company: contact.company,
          Address: contact.address,
          Notes: contact.notes,
        }
      }));

      const response = await this.makeRequest(tableName, {
        method: 'POST',
        body: JSON.stringify({ records }),
      });

      // Update local records with Airtable IDs
      for (let j = 0; j < response.records.length; j++) {
        const airtableRecord = response.records[j];
        const localContact = batch[j];
        await storage.updateContact(localContact.id, { airtableId: airtableRecord.id });
      }

      exported += response.records.length;
    }

    return { exported };
  }

  // Export leads to Airtable
  async exportLeadsToAirtable(tableName: string = 'Leads'): Promise<{ exported: number }> {
    const leads = await storage.getLeads();
    const leadsToExport = leads.filter(l => !l.airtableId); // Only export new leads
    
    let exported = 0;
    const batchSize = 10; // Airtable API limit

    for (let i = 0; i < leadsToExport.length; i += batchSize) {
      const batch = leadsToExport.slice(i, i + batchSize);
      const records = batch.map(lead => ({
        fields: {
          'Property Address': lead.propertyAddress,
          'Property Type': lead.propertyType,
          'Lead Stage': lead.leadStage,
          Priority: lead.priority,
          'Contact Name': lead.contactName,
          'Contact Email': lead.contactEmail,
          'Contact Phone': lead.contactPhone,
          Budget: lead.budget,
          Notes: lead.notes,
        }
      }));

      const response = await this.makeRequest(tableName, {
        method: 'POST',
        body: JSON.stringify({ records }),
      });

      // Update local records with Airtable IDs
      for (let j = 0; j < response.records.length; j++) {
        const airtableRecord = response.records[j];
        const localLead = batch[j];
        await storage.updateLead(localLead.id, { airtableId: airtableRecord.id });
      }

      exported += response.records.length;
    }

    return { exported };
  }

  // Full bidirectional sync
  async performFullSync(): Promise<{
    contacts: { imported: number; updated: number; exported: number };
    leads: { imported: number; updated: number; exported: number };
  }> {
    const contactsImport = await this.syncContactsFromAirtable();
    const contactsExport = await this.exportContactsToAirtable();
    
    const leadsImport = await this.syncLeadsFromAirtable();
    const leadsExport = await this.exportLeadsToAirtable();

    return {
      contacts: { ...contactsImport, ...contactsExport },
      leads: { ...leadsImport, ...leadsExport },
    };
  }

  // Helper methods to map field values
  private mapContactType(value: any): 'tenant' | 'landlord' | 'vendor' | 'prospect' {
    if (!value) return 'prospect';
    const normalized = value.toString().toLowerCase();
    if (['tenant', 'landlord', 'vendor', 'prospect'].includes(normalized)) {
      return normalized as 'tenant' | 'landlord' | 'vendor' | 'prospect';
    }
    return 'prospect';
  }

  private mapContactStatus(value: any): 'active' | 'inactive' | 'pending' {
    if (!value) return 'pending';
    const normalized = value.toString().toLowerCase();
    if (['active', 'inactive', 'pending'].includes(normalized)) {
      return normalized as 'active' | 'inactive' | 'pending';
    }
    return 'pending';
  }

  private mapPropertyType(value: any): 'residential' | 'commercial' | 'industrial' | 'land' {
    if (!value) return 'residential';
    const normalized = value.toString().toLowerCase();
    if (['residential', 'commercial', 'industrial', 'land'].includes(normalized)) {
      return normalized as 'residential' | 'commercial' | 'industrial' | 'land';
    }
    return 'residential';
  }

  private mapLeadStage(value: any): 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed' | 'lost' {
    if (!value) return 'new';
    const normalized = value.toString().toLowerCase();
    if (['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'].includes(normalized)) {
      return normalized as 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed' | 'lost';
    }
    return 'new';
  }

  private mapPriority(value: any): 'low' | 'medium' | 'high' | 'urgent' {
    if (!value) return 'medium';
    const normalized = value.toString().toLowerCase();
    if (['low', 'medium', 'high', 'urgent'].includes(normalized)) {
      return normalized as 'low' | 'medium' | 'high' | 'urgent';
    }
    return 'medium';
  }
}

export const airtableService = new AirtableService();