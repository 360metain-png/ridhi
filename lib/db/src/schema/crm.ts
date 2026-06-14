import { pgTable, uuid, text, timestamp, varchar, integer, boolean, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/* ── CRM Tickets ────────────────────────────────────────────────────── */

export const crmTickets = pgTable("crm_tickets", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Ticket metadata
  ticketNumber: varchar("ticket_number", { length: 20 }).notNull().unique(), // e.g., "RID-2024-001234"
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("open"),
  // open | in_progress | pending | resolved | closed | escalated | spam
  priority: varchar("priority", { length: 10 }).notNull().default("medium"),
  // low | medium | high | urgent | critical
  category: varchar("category", { length: 30 }).notNull().default("general"),
  // general | account | billing | technical | content_moderation | harassment |
  // feature_request | bug_report | payment | kyc | host_issue | agent_issue |
  // creator_issue | dating_safety | data_privacy | refund | app_crash
  subcategory: varchar("subcategory", { length: 40 }),

  // Requester info
  requesterType: varchar("requester_type", { length: 15 }).notNull().default("user"),
  // user | host | agent | creator | guest | internal
  requesterId: uuid("requester_id"), // linked user_id if registered
  requesterName: varchar("requester_name", { length: 100 }),
  requesterEmail: varchar("requester_email", { length: 100 }),
  requesterPhone: varchar("requester_phone", { length: 20 }),

  // Assignment
  assignedTo: uuid("assigned_to"), // admin user ID
  assignedTeam: varchar("assigned_team", { length: 30 }).default("support"),
  // support | billing | technical | moderation | legal | executive
  assignedAt: timestamp("assigned_at", { withTimezone: true }),
  reassignedCount: integer("reassigned_count").default(0),

  // SLA tracking
  slaPolicy: varchar("sla_policy", { length: 30 }).default("standard"),
  // standard | premium | enterprise | internal
  slaResponseHours: integer("sla_response_hours").default(24),
  slaResolutionHours: integer("sla_resolution_hours").default(72),
  slaFirstResponseAt: timestamp("sla_first_response_at", { withTimezone: true }),
  slaResolvedAt: timestamp("sla_resolved_at", { withTimezone: true }),
  slaBreached: boolean("sla_breached").default(false),
  slaBreachedAt: timestamp("sla_breached_at", { withTimezone: true }),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  reopenedAt: timestamp("reopened_at", { withTimezone: true }),
  reopenCount: integer("reopen_count").default(0),

  // Resolution
  resolution: text("resolution"),
  resolutionType: varchar("resolution_type", { length: 20 }),
  // fixed | explained | refunded | escalated | wont_fix | duplicate | user_error
  satisfactionRating: integer("satisfaction_rating"), // 1-5
  satisfactionComment: text("satisfaction_comment"),

  // Source
  source: varchar("source", { length: 20 }).default("app"),
  // app | email | phone | whatsapp | web_portal | internal | social_media | play_store_review
  sourceDetail: text("source_detail"),

  // Related entities
  relatedPostId: uuid("related_post_id"),
  relatedUserId: uuid("related_user_id"), // user being reported
  relatedTransactionId: varchar("related_transaction_id", { length: 50 }),
  relatedOrderId: varchar("related_order_id", { length: 50 }),

  // Tags
  tags: jsonb("tags").$type<string[]>(),

  // Internal notes
  internalNotes: jsonb("internal_notes").$type<{ note: string; by: string; at: string }[]>(),

  // Metadata
  channel: varchar("channel", { length: 20 }).default("in_app"),
  // in_app | email | chat | phone | video | social
  language: varchar("language", { length: 10 }).default("en"),
  sentiment: varchar("sentiment", { length: 15 }).default("neutral"),
  // positive | neutral | negative | angry | frustrated

  // Merge tracking
  mergedIntoId: uuid("merged_into_id"),
  isMerged: boolean("is_merged").default(false),

  // Spam / auto-classification
  isSpam: boolean("is_spam").default(false),
  spamScore: integer("spam_score").default(0), // 0-100
  autoClassified: boolean("auto_classified").default(false),
});

export const insertCrmTicketSchema = createInsertSchema(crmTickets).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertCrmTicket = z.infer<typeof insertCrmTicketSchema>;
export type CrmTicket = typeof crmTickets.$inferSelect;

/* ── Ticket Comments / Thread ────────────────────────────────── */

export const crmTicketComments = pgTable("crm_ticket_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticketId: uuid("ticket_id").notNull(),

  // Author
  authorId: uuid("author_id"),
  authorName: varchar("author_name", { length: 100 }).notNull(),
  authorRole: varchar("author_role", { length: 20 }).notNull().default("agent"),
  // agent | admin | super_admin | user | system | bot
  isInternal: boolean("is_internal").default(false),
  isSystem: boolean("is_system").default(false),

  // Content
  body: text("body").notNull(),
  attachments: jsonb("attachments").$type<{ name: string; url: string; size: number; type: string }[]>(),

  // Metadata
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  editedAt: timestamp("edited_at", { withTimezone: true }),
  isDeleted: boolean("is_deleted").default(false),

  // Actions embedded in comment
  actionType: varchar("action_type", { length: 30 }),
  // status_change | assignment_change | priority_change | merge | split | note
  actionData: jsonb("action_data").$type<Record<string, unknown>>(),
});

export const insertCrmTicketCommentSchema = createInsertSchema(crmTicketComments).omit({
  id: true, createdAt: true,
});
export type InsertCrmTicketComment = z.infer<typeof insertCrmTicketCommentSchema>;
export type CrmTicketComment = typeof crmTicketComments.$inferSelect;

/* ── CRM Contacts / Customer Profiles ────────────────────────── */

export const crmContacts = pgTable("crm_contacts", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Identity
  userId: uuid("user_id"), // linked to users table
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  type: varchar("type", { length: 15 }).notNull().default("user"),
  // user | host | agent | creator | business | vip | internal

  // Profile
  avatar: text("avatar"),
  bio: text("bio"),
  city: varchar("city", { length: 50 }),
  state: varchar("state", { length: 50 }),
  country: varchar("country", { length: 10 }).default("IN"),
  language: varchar("language", { length: 10 }).default("en"),

  // CRM fields
  status: varchar("status", { length: 20 }).default("active"),
  // active | inactive | blocked | churned | prospect
  lifecycleStage: varchar("lifecycle_stage", { length: 20 }).default("lead"),
  // lead | trial | active | engaged | loyal | churned | reactivated
  segment: varchar("segment", { length: 30 }).default("standard"),
  // standard | premium | enterprise | influencer | power_user | at_risk
  tags: jsonb("tags").$type<string[]>(),

  // Engagement
  totalTickets: integer("total_tickets").default(0),
  openTickets: integer("open_tickets").default(0),
  lastContactAt: timestamp("last_contact_at", { withTimezone: true }),
  lastTicketAt: timestamp("last_ticket_at", { withTimezone: true }),
  avgSatisfaction: integer("avg_satisfaction"), // 1-5
  npsScore: integer("nps_score"), // -10 to 10

  // Business value
  totalRevenue: integer("total_revenue").default(0), // INR
  totalCoins: integer("total_coins").default(0),
  subscriptionPlan: varchar("subscription_plan", { length: 20 }),
  subscriptionStatus: varchar("subscription_status", { length: 20 }),
  firstPurchaseAt: timestamp("first_purchase_at", { withTimezone: true }),
  lastPurchaseAt: timestamp("last_purchase_at", { withTimezone: true }),

  // Support history
  preferredChannel: varchar("preferred_channel", { length: 20 }).default("in_app"),
  // in_app | email | phone | whatsapp | chat
  supportTier: varchar("support_tier", { length: 20 }).default("standard"),
  // standard | priority | vip | dedicated
  assignedAgent: uuid("assigned_agent"),
  assignedAgentName: varchar("assigned_agent_name", { length: 100 }),

  // Notes
  notes: jsonb("notes").$type<{ note: string; by: string; at: string; category: string }[]>(),

  // Custom fields
  customFields: jsonb("custom_fields").$type<Record<string, string>>(),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCrmContactSchema = createInsertSchema(crmContacts).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertCrmContact = z.infer<typeof insertCrmContactSchema>;
export type CrmContact = typeof crmContacts.$inferSelect;

/* ── CRM Macros / Response Templates ──────────────────────────── */

export const crmMacros = pgTable("crm_macros", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  body: text("body").notNull(),
  category: varchar("category", { length: 30 }).default("general"),
  // general | greeting | apology | escalation | refund | technical | billing | kyc
  tags: jsonb("tags").$type<string[]>(),
  isActive: boolean("is_active").default(true),
  isShared: boolean("is_shared").default(true),
  createdBy: uuid("created_by"),
  createdByName: varchar("created_by_name", { length: 100 }),
  useCount: integer("use_count").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCrmMacroSchema = createInsertSchema(crmMacros).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertCrmMacro = z.infer<typeof insertCrmMacroSchema>;
export type CrmMacro = typeof crmMacros.$inferSelect;

/* ── CRM Team / Agent Performance ───────────────────────────── */

export const crmAgentPerformance = pgTable("crm_agent_performance", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentId: uuid("agent_id").notNull(),
  agentName: varchar("agent_name", { length: 100 }).notNull(),
  period: date("period").notNull(), // daily aggregation

  // Ticket metrics
  ticketsAssigned: integer("tickets_assigned").default(0),
  ticketsResolved: integer("tickets_resolved").default(0),
  ticketsEscalated: integer("tickets_escalated").default(0),
  ticketsReopened: integer("tickets_reopened").default(0),

  // Performance
  avgResolutionTime: integer("avg_resolution_time"), // minutes
  avgFirstResponseTime: integer("avg_first_response_time"), // minutes
  avgSatisfaction: integer("avg_satisfaction"), // 1-5
  slaCompliance: integer("sla_compliance").default(100), // percentage

  // Activity
  commentsAdded: integer("comments_added").default(0),
  macrosUsed: integer("macros_used").default(0),
  internalNotes: integer("internal_notes").default(0),

  // Quality
  qualityScore: integer("quality_score").default(100), // 0-100
  reviewsReceived: integer("reviews_received").default(0),
  positiveReviews: integer("positive_reviews").default(0),
  negativeReviews: integer("negative_reviews").default(0),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCrmAgentPerformanceSchema = createInsertSchema(crmAgentPerformance).omit({
  id: true, createdAt: true,
});
export type InsertCrmAgentPerformance = z.infer<typeof insertCrmAgentPerformanceSchema>;
export type CrmAgentPerformance = typeof crmAgentPerformance.$inferSelect;
