import { pgTable, uuid, text, timestamp, varchar, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  city: text("city"),
  gender: varchar("gender", { length: 10 }).notNull().default("other"),
  language: varchar("language", { length: 20 }).notNull().default("english"),
  // Legacy single coins column — kept for backward compatibility
  // coins = freeCoins + paidCoins
  coins: integer("coins").notNull().default(100),
  // Dual-coin tracking: free coins (budgeted, earnable, expirable)
  freeCoins: integer("free_coins").notNull().default(100),
  // Paid coins (real money recharges, never expire)
  paidCoins: integer("paid_coins").notNull().default(0),
  plan: varchar("plan", { length: 20 }).notNull().default("free"),
  interests: jsonb("interests").$type<string[]>().notNull().default([]),

  // PK Battle host approval
  pkBattleApproved: integer("pk_battle_approved").notNull().default(0),
    // 0 = not_requested | 1 = requested | 2 = approved | 3 = rejected
  pkBattleRequestedAt: timestamp("pk_battle_requested_at", { withTimezone: true }),
  pkBattleApprovedAt: timestamp("pk_battle_approved_at", { withTimezone: true }),
  pkBattleApprovedBy: text("pk_battle_approved_by"),
  pkBattleRejectionReason: text("pk_battle_rejection_reason"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
