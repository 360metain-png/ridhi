import { pgTable, uuid, text, timestamp, varchar, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const coinTransactions = pgTable("coin_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  // Transaction type: free_earn, free_spend, paid_recharge, paid_spend, gift_send, gift_receive, manual_credit, manual_debit, refund, expired
  type: varchar("type", { length: 30 }).notNull(),
  // Direction: credit (+) or debit (-)
  direction: varchar("direction", { length: 10 }).notNull(), // 'credit' | 'debit'
  // Total amount (free + paid)
  amount: integer("amount").notNull().default(0),
  // Free coin portion of this transaction
  freeAmount: integer("free_amount").notNull().default(0),
  // Paid coin portion of this transaction
  paidAmount: integer("paid_amount").notNull().default(0),
  // Balances after transaction
  balanceFree: integer("balance_free").notNull().default(0),
  balancePaid: integer("balance_paid").notNull().default(0),
  // Source of coins (for free_earn): daily_login, referral, mission, ad_reward, contest, manual, bonus, other
  source: varchar("source", { length: 30 }).notNull().default("other"),
  // Description of transaction
  description: text("description").notNull().default(""),
  // Related entity ID (e.g., referral user ID, mission ID, gift recipient ID)
  relatedId: text("related_id"),
  // Admin note for manual adjustments
  adminNote: text("admin_note"),
  // Admin who performed manual adjustment
  adminName: text("admin_name"),
  // Expiry date for free coins (30 days from credit)
  freeCoinsExpireAt: timestamp("free_coins_expire_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCoinTransactionSchema = createInsertSchema(coinTransactions).omit({ id: true, createdAt: true });
export type InsertCoinTransaction = z.infer<typeof insertCoinTransactionSchema>;
export type CoinTransaction = typeof coinTransactions.$inferSelect;

// Coin Economy Configuration - free coin budget limits and safeguards
export const coinEconomyConfig = pgTable("coin_economy_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Daily free coin budget across ALL users (platform-wide cap)
  dailyFreeCoinBudget: integer("daily_free_coin_budget").notNull().default(50000),
  // Per-user free coin earning cap per day
  dailyFreeCoinPerUserCap: integer("daily_free_coin_per_user_cap").notNull().default(500),
  // Per-user free coin earning cap per month
  monthlyFreeCoinPerUserCap: integer("monthly_free_coin_per_user_cap").notNull().default(5000),
  // Free coin expiry in days (free coins expire after this period)
  freeCoinExpiryDays: integer("free_coin_expiry_days").notNull().default(30),
  // Alert threshold: free coin outflow / paid coin inflow ratio (e.g., 0.3 = 30%)
  freeToPaidRatioAlert: integer("free_to_paid_ratio_alert").notNull().default(30), // stored as percentage
  // Alert threshold: daily free coin budget used percentage
  dailyBudgetUsedAlert: integer("daily_budget_used_alert").notNull().default(80), // percentage
  // Whether free coin earning is globally enabled
  freeCoinEarningEnabled: integer("free_coin_earning_enabled").notNull().default(1), // 1 = true, 0 = false
  // Whether to automatically pause free coin earning when budget is exceeded
  autoPauseOnBudgetExhaust: integer("auto_pause_on_budget_exhaust").notNull().default(1), // 1 = true
  // Updated at
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCoinEconomyConfigSchema = createInsertSchema(coinEconomyConfig).omit({ id: true, updatedAt: true });
export type InsertCoinEconomyConfig = z.infer<typeof insertCoinEconomyConfigSchema>;
export type CoinEconomyConfig = typeof coinEconomyConfig.$inferSelect;
