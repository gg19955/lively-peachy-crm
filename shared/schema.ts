import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contacts table
export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  company: varchar("company"),
  address: varchar("address"),
  type: varchar("type").default("guest"), // real_estate_professional, builder_developer, designer, business_owner, content_creator, guest, property_owner
  status: varchar("status").default("active"), // active, inactive
  notes: text("notes"),
  airtableId: varchar("airtable_id").unique(),
  googleSheetsId: varchar("google_sheets_id").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

// Interactions/Timeline entries
export const interactions = pgTable("interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contactId: varchar("contact_id").references(() => contacts.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(), // phone, email, meeting, note, site_visit
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Property leads
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyAddress: varchar("property_address").notNull(),
  propertyType: varchar("property_type").default("house"), // house, villa, apartment, townhouse, the_lively_collection
  stage: varchar("stage").default("inquiry"), // inquiry, meeting_booked, proposal_sent, contract_sent, signed, closed
  priority: varchar("priority").default("medium"), // low, medium, high
  contactName: varchar("contact_name"),
  contactEmail: varchar("contact_email"),
  contactPhone: varchar("contact_phone"),
  timeframe: varchar("timeframe"), // select_date, less_than_3_months, 3_to_6_months, 6_to_12_months
  reminderDate: timestamp("reminder_date"),
  notes: text("notes"),
  attachments: text("attachments").array(), // Array of file paths
  airtableId: varchar("airtable_id").unique(),
  googleSheetsId: varchar("google_sheets_id").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

// Airtable sync log
export const airtableSyncLog = pgTable("airtable_sync_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type").notNull(), // contacts, leads, interactions
  entityId: varchar("entity_id").notNull(),
  airtableId: varchar("airtable_id"),
  syncStatus: varchar("sync_status").notNull(), // pending, success, error
  lastSyncAt: timestamp("last_sync_at").defaultNow(),
  errorMessage: text("error_message"),
});

// Relations
export const contactsRelations = relations(contacts, ({ many, one }) => ({
  interactions: many(interactions),
  createdByUser: one(users, {
    fields: [contacts.createdBy],
    references: [users.id],
  }),
}));

export const interactionsRelations = relations(interactions, ({ one }) => ({
  contact: one(contacts, {
    fields: [interactions.contactId],
    references: [contacts.id],
  }),
  user: one(users, {
    fields: [interactions.userId],
    references: [users.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  createdByUser: one(users, {
    fields: [leads.createdBy],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  contactsCreated: many(contacts),
  interactions: many(interactions),
  leadsCreated: many(leads),
}));

// Insert schemas
export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export const insertInteractionSchema = createInsertSchema(interactions).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
});

export const insertAirtableSyncLogSchema = createInsertSchema(airtableSyncLog).omit({
  id: true,
  lastSyncAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Interaction = typeof interactions.$inferSelect;
export type InsertInteraction = z.infer<typeof insertInteractionSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type AirtableSyncLog = typeof airtableSyncLog.$inferSelect;
export type InsertAirtableSyncLog = z.infer<typeof insertAirtableSyncLogSchema>;
