import { Router } from "express";
import { db } from "@workspace/db";
import { adCampaigns, users } from "@workspace/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { requireUser, getUserId, type AuthenticatedRequest } from "../lib/auth";

const router = Router();

// ── POST /api/ads/campaigns — create a new ad campaign ──
router.post("/ads/campaigns", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req) as string;
  const {
    headline,
    body,
    cta,
    format,
    creativeUri,
    isVideo,
    targetCities,
    targetAges,
    targetGenders,
    targetInterests,
    dailyBudget,
    totalBudget,
    durationDays,
    payMethod,
  } = req.body as {
    headline?: string;
    body?: string;
    cta?: string;
    format?: string;
    creativeUri?: string;
    isVideo?: boolean;
    targetCities?: string[];
    targetAges?: string[];
    targetGenders?: string[];
    targetInterests?: string[];
    dailyBudget?: number;
    totalBudget?: number;
    durationDays?: number;
    payMethod?: string;
  };

  if (!headline || !format) {
    res.status(400).json({ success: false, error: "headline and format are required" });
    return;
  }

  try {
    const now = new Date();
    const endsAt = new Date(now.getTime() + (durationDays || 7) * 24 * 60 * 60 * 1000);

    const [campaign] = await db.insert(adCampaigns).values({
      brandId: userId,
      headline,
      body: body || "",
      cta: cta || "Learn More",
      format,
      creativeUri: creativeUri || null,
      isVideo: isVideo ?? false,
      targetCities: targetCities || [],
      targetAges: targetAges || [],
      targetGenders: targetGenders || [],
      targetInterests: targetInterests || [],
      dailyBudget: dailyBudget || 100,
      totalBudget: totalBudget || 1000,
      durationDays: durationDays || 7,
      payMethod: payMethod || "coins",
      status: "pending",
      startsAt: now,
      endsAt,
    }).returning();

    req.log.info({ campaignId: campaign.id, brandId: userId }, "ad campaign created");
    res.json({ success: true, campaign });
  } catch (err) {
    req.log.error({ err, userId }, "ad campaign creation failed");
    res.status(500).json({ success: false, error: "Failed to create campaign" });
  }
});

// ── GET /api/ads/campaigns — list brand's own campaigns ──
router.get("/ads/campaigns", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req) as string;

  try {
    const campaigns = await db
      .select()
      .from(adCampaigns)
      .where(eq(adCampaigns.brandId, userId))
      .orderBy(adCampaigns.createdAt);

    res.json({ success: true, campaigns });
  } catch (err) {
    req.log.error({ err, userId }, "ad campaign list failed");
    res.status(500).json({ success: false, error: "Failed to list campaigns" });
  }
});

// ── GET /api/ads/feed — get targeted ads for the user's feed ──
router.get("/ads/feed", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req) as string;
  const userCity = req.query.city as string | undefined;
  const userAge = req.query.age as string | undefined;
  const userGender = req.query.gender as string | undefined;
  const userInterests = (req.query.interests as string || "").split(",").filter(Boolean);
  const format = req.query.format as string || "feed"; // feed, banner, popup, story, reel, explore
  const limit = Math.min(parseInt(req.query.limit as string || "5"), 10);

  try {
    // Get user profile for targeting if not provided in query
    let city = userCity;
    let age = userAge;
    let gender = userGender;
    let interests = userInterests;

    if (!city || !age || !gender) {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (user) {
        city = city || user.city || "All India";
        // age is not stored directly, so we use a placeholder
        age = age || "25-34";
        gender = gender || user.gender || "All";
        interests = interests.length > 0 ? interests : (user.interests as string[]) || [];
      }
    }

    const now = new Date();

    // Build targeting filter: campaigns must be active and within date range
    const baseConditions = and(
      eq(adCampaigns.status, "active"),
      gte(adCampaigns.endsAt, now),
      lte(adCampaigns.startsAt, now),
      eq(adCampaigns.format, format)
    );

    const campaigns = await db
      .select()
      .from(adCampaigns)
      .where(baseConditions)
      .limit(limit);

    // Filter by targeting in application code (JSONB arrays are tricky in SQL)
    const targeted = campaigns.filter((c) => {
      // City match: if "All India" is in targetCities, or city matches
      const cities = (c.targetCities || []) as string[];
      const cityMatch = cities.length === 0 || cities.includes("All India") || cities.includes(city || "All India");

      // Age match: if targetAges is empty, or any age range matches
      const ages = (c.targetAges || []) as string[];
      const ageMatch = ages.length === 0 || ages.includes(age || "All");

      // Gender match: if "All" is in targetGenders, or matches
      const genders = (c.targetGenders || []) as string[];
      const genderMatch = genders.length === 0 || genders.includes("All") || genders.includes(gender || "All");

      // Interest match: if targetInterests is empty, or any overlap
      const interestsList = (c.targetInterests || []) as string[];
      const interestMatch = interestsList.length === 0 || interestsList.some((i) => interests.includes(i));

      return cityMatch && ageMatch && genderMatch && interestMatch;
    });

    res.json({ success: true, ads: targeted });
  } catch (err) {
    req.log.error({ err, userId }, "ad feed fetch failed");
    res.status(500).json({ success: false, error: "Failed to fetch ads" });
  }
});

// ── POST /api/ads/:id/impression — track an ad impression ──
router.post("/ads/:id/impression", requireUser, async (req: AuthenticatedRequest, res) => {
  const campaignId = req.params.id as string;

  try {
    await db
      .update(adCampaigns)
      .set({ impressions: sql`${adCampaigns.impressions} + 1` })
      .where(eq(adCampaigns.id, campaignId));

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err, campaignId }, "ad impression tracking failed");
    res.status(500).json({ success: false, error: "Failed to track impression" });
  }
});

// ── POST /api/ads/:id/click — track an ad click ──
router.post("/ads/:id/click", requireUser, async (req: AuthenticatedRequest, res) => {
  const campaignId = req.params.id as string;

  try {
    await db
      .update(adCampaigns)
      .set({ clicks: sql`${adCampaigns.clicks} + 1` })
      .where(eq(adCampaigns.id, campaignId));

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err, campaignId }, "ad click tracking failed");
    res.status(500).json({ success: false, error: "Failed to track click" });
  }
});

// ── PATCH /api/ads/:id/status — update campaign status (brand owner) ──
router.patch("/ads/:id/status", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req) as string;
  const campaignId = req.params.id as string;
  const { status } = req.body as { status?: string };

  if (!status || !["pending", "active", "paused", "completed", "rejected"].includes(status)) {
    res.status(400).json({ success: false, error: "Invalid status" });
    return;
  }

  try {
    const [campaign] = await db
      .select()
      .from(adCampaigns)
      .where(eq(adCampaigns.id, campaignId))
      .limit(1);

    if (!campaign || campaign.brandId !== userId) {
      res.status(403).json({ success: false, error: "Not authorized" });
      return;
    }

    await db
      .update(adCampaigns)
      .set({ status })
      .where(eq(adCampaigns.id, campaignId));

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err, campaignId }, "ad status update failed");
    res.status(500).json({ success: false, error: "Failed to update status" });
  }
});

export default router;
