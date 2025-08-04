import {
  users,
  contacts,
  interactions,
  leads,
  airtableSyncLog,
  type User,
  type UpsertUser,
  type Contact,
  type InsertContact,
  type Interaction,
  type InsertInteraction,
  type Lead,
  type InsertLead,
  type AirtableSyncLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Contact operations
  getContacts(searchTerm?: string): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact, userId: string): Promise<Contact>;
  updateContact(id: string, contact: Partial<InsertContact>): Promise<Contact>;
  deleteContact(id: string): Promise<void>;

  // Interaction operations
  getContactInteractions(contactId: string): Promise<(Interaction & { user: User })[]>;
  createInteraction(interaction: InsertInteraction, userId: string): Promise<Interaction>;

  // Lead operations
  getLeads(stage?: string): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead, userId: string): Promise<Lead>;
  updateLead(id: string, lead: Partial<InsertLead>): Promise<Lead>;
  deleteLead(id: string): Promise<void>;
  getLeadsByStage(): Promise<{ stage: string; count: number }[]>;

  // Statistics
  getStats(): Promise<{
    totalContacts: number;
    activeLeads: number;
    properties: number;
    thisMonth: number;
  }>;

  // Airtable sync operations
  createSyncLog(log: Omit<AirtableSyncLog, 'id' | 'lastSyncAt'>): Promise<AirtableSyncLog>;
  updateSyncLog(id: string, updates: Partial<AirtableSyncLog>): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Contact operations
  async getContacts(searchTerm?: string): Promise<Contact[]> {
    let query = db.select().from(contacts);
    
    if (searchTerm) {
      query = query.where(
        or(
          ilike(contacts.name, `%${searchTerm}%`),
          ilike(contacts.email, `%${searchTerm}%`),
          ilike(contacts.company, `%${searchTerm}%`)
        )
      );
    }
    
    return query.orderBy(desc(contacts.updatedAt));
  }

  async getContact(id: string): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }

  async createContact(contact: InsertContact, userId: string): Promise<Contact> {
    const [newContact] = await db
      .insert(contacts)
      .values({ ...contact, createdBy: userId })
      .returning();
    return newContact;
  }

  async updateContact(id: string, contact: Partial<InsertContact>): Promise<Contact> {
    const [updatedContact] = await db
      .update(contacts)
      .set({ ...contact, updatedAt: new Date() })
      .where(eq(contacts.id, id))
      .returning();
    return updatedContact;
  }

  async deleteContact(id: string): Promise<void> {
    await db.delete(contacts).where(eq(contacts.id, id));
  }

  // Interaction operations
  async getContactInteractions(contactId: string): Promise<(Interaction & { user: User })[]> {
    const result = await db
      .select({
        id: interactions.id,
        contactId: interactions.contactId,
        userId: interactions.userId,
        type: interactions.type,
        notes: interactions.notes,
        createdAt: interactions.createdAt,
        user: users,
      })
      .from(interactions)
      .leftJoin(users, eq(interactions.userId, users.id))
      .where(eq(interactions.contactId, contactId))
      .orderBy(desc(interactions.createdAt));

    return result.map(row => ({
      id: row.id,
      contactId: row.contactId,
      userId: row.userId,
      type: row.type,
      notes: row.notes,
      createdAt: row.createdAt,
      user: row.user!,
    }));
  }

  async createInteraction(interaction: InsertInteraction, userId: string): Promise<Interaction> {
    const [newInteraction] = await db
      .insert(interactions)
      .values({ ...interaction, userId })
      .returning();
    return newInteraction;
  }

  // Lead operations
  async getLeads(stage?: string): Promise<Lead[]> {
    let query = db.select().from(leads);
    
    if (stage) {
      query = query.where(eq(leads.leadStage, stage));
    }
    
    return query.orderBy(desc(leads.createdAt));
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async createLead(lead: InsertLead, userId: string): Promise<Lead> {
    const [newLead] = await db
      .insert(leads)
      .values({ ...lead, createdBy: userId })
      .returning();
    return newLead;
  }

  async updateLead(id: string, lead: Partial<InsertLead>): Promise<Lead> {
    const [updatedLead] = await db
      .update(leads)
      .set({ ...lead, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return updatedLead;
  }

  async deleteLead(id: string): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  async getLeadsByStage(): Promise<{ stage: string; count: number }[]> {
    const result = await db
      .select({
        stage: leads.leadStage,
        count: sql<number>`count(*)::int`,
      })
      .from(leads)
      .groupBy(leads.leadStage);

    return result.map(row => ({
      stage: row.stage || 'unknown',
      count: row.count,
    }));
  }

  // Statistics
  async getStats(): Promise<{
    totalContacts: number;
    activeLeads: number;
    properties: number;
    thisMonth: number;
  }> {
    const [contactsCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(contacts);

    const [activeLeadsCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(and(
        eq(leads.leadStage, 'new'),
        or(
          eq(leads.leadStage, 'contacted'),
          eq(leads.leadStage, 'qualified')
        )
      ));

    const [propertiesCount] = await db
      .select({ count: sql<number>`count(distinct ${leads.propertyType})::int` })
      .from(leads);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const [thisMonthCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(leads)
      .where(sql`${leads.createdAt} >= ${thisMonth}`);

    return {
      totalContacts: contactsCount.count,
      activeLeads: activeLeadsCount.count,
      properties: propertiesCount.count,
      thisMonth: thisMonthCount.count,
    };
  }

  // Airtable sync operations
  async createSyncLog(log: Omit<AirtableSyncLog, 'id' | 'lastSyncAt'>): Promise<AirtableSyncLog> {
    const [syncLog] = await db
      .insert(airtableSyncLog)
      .values(log)
      .returning();
    return syncLog;
  }

  async updateSyncLog(id: string, updates: Partial<AirtableSyncLog>): Promise<void> {
    await db
      .update(airtableSyncLog)
      .set({ ...updates, lastSyncAt: new Date() })
      .where(eq(airtableSyncLog.id, id));
  }
}

export const storage = new DatabaseStorage();
