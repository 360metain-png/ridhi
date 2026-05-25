import { pgTable, uuid, text, timestamp, integer, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { users } from "./users";

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  likesCount: integer("likes_count").notNull().default(0),
  commentsCount: integer("comments_count").notNull().default(0),
  sharesCount: integer("shares_count").notNull().default(0),
  city: text("city"),
  language: varchar("language", { length: 20 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).omit({ id: true, likesCount: true, commentsCount: true, sharesCount: true, createdAt: true });
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
