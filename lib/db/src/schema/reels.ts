import { pgTable, uuid, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { users } from "./users";

export const reels = pgTable("reels", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  caption: text("caption").notNull(),
  gradient: jsonb("gradient").$type<[string, string]>().notNull().default(["#FF6B35", "#E91E8C"]),
  emoji: text("emoji").notNull().default("🔥"),
  likesCount: integer("likes_count").notNull().default(0),
  commentsCount: integer("comments_count").notNull().default(0),
  sharesCount: integer("shares_count").notNull().default(0),
  allowDuet: boolean("allow_duet").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReelSchema = createInsertSchema(reels).omit({
  id: true,
  likesCount: true,
  commentsCount: true,
  sharesCount: true,
  createdAt: true,
});
export type InsertReel = z.infer<typeof insertReelSchema>;
export type Reel = typeof reels.$inferSelect;
