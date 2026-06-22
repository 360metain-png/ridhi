import { pgTable, uuid, text, timestamp, integer, varchar, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { users } from "./users";

export const adCampaigns = pgTable("ad_campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  brandId: uuid("brand_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  headline: text("headline").notNull(),
  body: text("body"),
  cta: text("cta").notNull().default("Learn More"),
  format: varchar("format", { length: 20 }).notNull(), // feed, story, reel, banner, explore
  creativeUri: text("creative_uri"),
  isVideo: boolean("is_video").notNull().default(false),
  // Targeting
  targetCities: jsonb("target_cities").$type<string[]>().notNull().default([]),
  targetAges: jsonb("target_ages").$type<string[]>().notNull().default([]),
  targetGenders: jsonb("target_genders").$type<string[]>().notNull().default([]),
  targetInterests: jsonb("target_interests").$type<string[]>().notNull().default([]),
  // Budget
  dailyBudget: integer("daily_budget").notNull().default(100),
  totalBudget: integer("total_budget").notNull().default(1000),
  durationDays: integer("duration_days").notNull().default(7),
  // Payment
  payMethod: varchar("pay_method", { length: 20 }).notNull().default("coins"), // coins, razorpay, upi
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, active, paused, completed, rejected
  // Analytics
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  // Schedule
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAdCampaignSchema = createInsertSchema(adCampaigns).omit({
  id: true,
  impressions: true,
  clicks: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAdCampaign = z.infer<typeof insertAdCampaignSchema>;
export type AdCampaignRow = typeof adCampaigns.$inferSelect;
