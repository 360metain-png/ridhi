import { pgTable, uuid, text, timestamp, varchar, integer, boolean, jsonb, date, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/* ── App Install Events ──────────────────────────────────────── */

export const appInstalls = pgTable("app_installs", {
  id: uuid("id").defaultRandom().primaryKey(),

  // User link (nullable for pre-signup installs)
  userId: uuid("user_id"),

  // Device / platform
  platform: varchar("platform", { length: 20 }).notNull(), // "android" | "ios"
  osVersion: varchar("os_version", { length: 30 }),
  deviceBrand: varchar("device_brand", { length: 50 }),
  deviceModel: varchar("device_model", { length: 50 }),
  deviceType: varchar("device_type", { length: 20 }).default("phone"), // phone | tablet

  // App version at install
  appVersion: varchar("app_version", { length: 20 }),
  buildNumber: varchar("build_number", { length: 20 }),

  // Attribution / source
  installSource: varchar("install_source", { length: 50 }).notNull().default("organic"),
  // organic | play_store | app_store | referral | facebook_ads | google_ads |
  // instagram_ads | influencer | whatsapp_share | sms_campaign | qr_code | website
  campaignId: varchar("campaign_id", { length: 50 }), // e.g., "diwali_2024" or "fb_ad_123"
  referrerCode: varchar("referrer_code", { length: 30 }), // referral code used
  utmSource: varchar("utm_source", { length: 50 }),
  utmMedium: varchar("utm_medium", { length: 50 }),
  utmCampaign: varchar("utm_campaign", { length: 100 }),

  // Location
  country: varchar("country", { length: 10 }).notNull().default("IN"),
  state: varchar("state", { length: 50 }),
  city: varchar("city", { length: 50 }),
  lat: numeric("lat", { precision: 10, scale: 6 }),
  lng: numeric("lng", { precision: 10, scale: 6 }),
  ipAddress: varchar("ip_address", { length: 45 }),

  // Store info
  storeListingLocale: varchar("store_listing_locale", { length: 10 }).default("en-IN"),
  storeVariant: varchar("store_variant", { length: 20 }), // A/B test variant

  // Install event
  installedAt: timestamp("installed_at", { withTimezone: true }).notNull().defaultNow(),
  isUninstalled: boolean("is_uninstalled").notNull().default(false),
  uninstalledAt: timestamp("uninstalled_at", { withTimezone: true }),
  uninstallReason: varchar("uninstall_reason", { length: 50 }),
  // storage_full | app_crash | not_useful | too_many_ads | found_alternative | privacy_concern | other

  // Engagement before uninstall
  daysActiveBeforeUninstall: integer("days_active_before_uninstall"),
  sessionsBeforeUninstall: integer("sessions_before_uninstall"),

  // First open
  firstOpenedAt: timestamp("first_opened_at", { withTimezone: true }),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  onboardingDropoffStep: varchar("onboarding_dropoff_step", { length: 30 }),
  // splash | phone_input | otp | name | age_gender | city | interests | profile_photo | done

  // Re-install tracking
  isReinstall: boolean("is_reinstall").notNull().default(false),
  previousInstallId: uuid("previous_install_id"),

  // Push token (FCM/APNs)
  pushToken: text("push_token"),
  pushTokenUpdatedAt: timestamp("push_token_updated_at", { withTimezone: true }),

  // Metadata
  rawAttribution: jsonb("raw_attribution").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAppInstallSchema = createInsertSchema(appInstalls).omit({
  id: true, createdAt: true,
});
export type InsertAppInstall = z.infer<typeof insertAppInstallSchema>;
export type AppInstall = typeof appInstalls.$inferSelect;

/* ── App Reviews (from Play Store / App Store) ───────────────── */

export const appReviews = pgTable("app_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Store identifiers
  platform: varchar("platform", { length: 20 }).notNull(), // android | ios
  storeReviewId: varchar("store_review_id", { length: 100 }).notNull().unique(), // Play Store / App Store review ID
  storeVersion: varchar("store_version", { length: 20 }), // app version at review time

  // Reviewer
  reviewerName: varchar("reviewer_name", { length: 100 }),
  reviewerId: varchar("reviewer_id", { length: 100 }), // store-specific user ID
  userId: uuid("user_id"), // linked Ridhi user if we can identify

  // Review content
  rating: integer("rating").notNull(), // 1-5
  title: text("title"),
  body: text("body"),
  language: varchar("language", { length: 10 }).default("en"),

  // Sentiment
  sentiment: varchar("sentiment", { length: 20 }).default("neutral"), // positive | neutral | negative
  sentimentScore: numeric("sentiment_score", { precision: 4, scale: 3 }), // -1.0 to 1.0
  keyTopics: jsonb("key_topics").$type<string[]>(), // e.g., ["crashes", "dating", "ads"]

  // Device info from review
  deviceModel: varchar("device_model", { length: 50 }),
  osVersion: varchar("os_version", { length: 30 }),

  // Store metadata
  helpfulCount: integer("helpful_count").default(0), // thumbs up
  totalReplies: integer("total_replies").default(0),
  isReplySent: boolean("is_reply_sent").default(false),
  replyText: text("reply_text"),
  replySentAt: timestamp("reply_sent_at", { withTimezone: true }),
  repliedBy: varchar("replied_by", { length: 50 }), // admin email or "auto"

  // Review lifecycle
  reviewDate: date("review_date").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  isDeleted: boolean("is_deleted").default(false),

  // Import tracking
  importedAt: timestamp("imported_at", { withTimezone: true }).notNull().defaultNow(),
  importSource: varchar("import_source", { length: 20 }).default("api"), // api | csv | manual
});

export const insertAppReviewSchema = createInsertSchema(appReviews).omit({
  id: true, importedAt: true,
});
export type InsertAppReview = z.infer<typeof insertAppReviewSchema>;
export type AppReview = typeof appReviews.$inferSelect;

/* ── Daily App Store Metrics (aggregated) ───────────────── */

export const appStoreDailyMetrics = pgTable("app_store_daily_metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull(),
  platform: varchar("platform", { length: 20 }).notNull(), // android | ios | combined

  // Installs
  installs: integer("installs").notNull().default(0),
  uninstalls: integer("uninstalls").notNull().default(0),
  netInstalls: integer("net_installs").notNull().default(0),
  reinstalls: integer("reinstalls").notNull().default(0),
  firstTimeInstalls: integer("first_time_installs").notNull().default(0),

  // Active devices
  activeDevices: integer("active_devices").notNull().default(0),
  newActiveDevices: integer("new_active_devices").notNull().default(0),

  // Store page views
  storeListingViews: integer("store_listing_views").notNull().default(0),
  storeListingVisitors: integer("store_listing_visitors").notNull().default(0),
  conversionRate: numeric("conversion_rate", { precision: 5, scale: 2 }), // percentage

  // Ratings
  ratingAvg: numeric("rating_avg", { precision: 3, scale: 2 }),
  ratingCount: integer("rating_count").default(0),
  rating1: integer("rating_1").default(0),
  rating2: integer("rating_2").default(0),
  rating3: integer("rating_3").default(0),
  rating4: integer("rating_4").default(0),
  rating5: integer("rating_5").default(0),
  newReviews: integer("new_reviews").default(0),

  // Crashes
  crashes: integer("crashes").default(0),
  crashRate: numeric("crash_rate", { precision: 5, scale: 2 }), // percentage
  anrs: integer("anrs").default(0), // Application Not Responding

  // Revenue
  revenueInr: integer("revenue_inr").default(0),
  refunds: integer("refunds").default(0),

  // Top source breakdown (JSON)
  sourceBreakdown: jsonb("source_breakdown").$type<Record<string, number>>(),
  // { "organic": 500, "google_ads": 200, "referral": 100, ... }

  // Top country breakdown
  countryBreakdown: jsonb("country_breakdown").$type<Record<string, number>>(),
  // { "IN": 800, "US": 50, "GB": 30, ... }

  // Top device breakdown
  deviceBreakdown: jsonb("device_breakdown").$type<Record<string, number>>(),
  // { "Samsung": 400, "Xiaomi": 300, "iPhone": 250, ... }

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAppStoreDailyMetricsSchema = createInsertSchema(appStoreDailyMetrics).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertAppStoreDailyMetrics = z.infer<typeof insertAppStoreDailyMetricsSchema>;
export type AppStoreDailyMetrics = typeof appStoreDailyMetrics.$inferSelect;
