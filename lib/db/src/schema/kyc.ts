import { pgTable, uuid, text, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const kycRecords = pgTable("kyc_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique(),

  // Aadhaar
  aadhaarNumber: varchar("aadhaar_number", { length: 14 }), // masked: XXXX XXXX 1234
  aadhaarVerified: boolean("aadhaar_verified").default(false).notNull(),
  aadhaarVerifiedAt: timestamp("aadhaar_verified_at", { withTimezone: true }),
  aadhaarClientId: text("aadhaar_client_id"), // provider reference

  // PAN
  panNumber: varchar("pan_number", { length: 10 }),
  panVerified: boolean("pan_verified").default(false).notNull(),
  panVerifiedAt: timestamp("pan_verified_at", { withTimezone: true }),
  panHolderName: text("pan_holder_name"),

  // Bank
  bankAccountNumber: text("bank_account_number"),
  bankIfsc: varchar("bank_ifsc", { length: 11 }),
  bankName: text("bank_name"),
  bankHolderName: text("bank_holder_name"),
  bankVerified: boolean("bank_verified").default(false).notNull(),
  bankVerifiedAt: timestamp("bank_verified_at", { withTimezone: true }),

  // Overall status
  status: varchar("status", { length: 20 }).default("not_started").notNull(),
    // not_started | pending | under_review | approved | rejected

  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewedBy: text("reviewed_by"),
  rejectionReason: text("rejection_reason"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertKycRecordSchema = createInsertSchema(kycRecords).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertKycRecord = z.infer<typeof insertKycRecordSchema>;
export type KycRecord = typeof kycRecords.$inferSelect;
