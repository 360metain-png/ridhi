import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { users } from "./users";

export const follows = pgTable("follows", {
  id: uuid("id").defaultRandom().primaryKey(),
  followerId: uuid("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followingId: uuid("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Prevent duplicate follows
  followUnique: table.followerId && table.followingId,
}));

export const insertFollowSchema = createInsertSchema(follows).omit({ id: true, createdAt: true });
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type Follow = typeof follows.$inferSelect;
