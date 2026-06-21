import { Router } from "express";
import {
  getAnalyticsConfig,
  setAnalyticsConfig,
  type AnalyticsConfig,
} from "../lib/analyticsConfig";
import { requireSuperAdmin } from "../lib/auth";
import { adminRateLimit } from "../lib/rateLimit";

const router = Router();

// ── GET /api/admin/analytics-config ──
// Read current analytics configuration (Super Admin only)
router.get("/admin/analytics-config", requireSuperAdmin, adminRateLimit, (req, res) => {
  const cfg = getAnalyticsConfig();
  res.json({
    ...cfg,
    providers: {
      googleAnalytics: {
        available: !!cfg.googleAnalytics.measurementId,
        configured: !!cfg.googleAnalytics.measurementId,
      },
      facebookPixel: {
        available: !!cfg.facebookPixel.pixelId,
        configured: !!cfg.facebookPixel.pixelId,
      },
    },
  });
});

// ── GET /api/analytics-config ──
// Public endpoint — mobile app reads this to know which analytics are active
router.get("/analytics-config", (req, res) => {
  const cfg = getAnalyticsConfig();
  res.json({
    googleAnalytics: {
      enabled: cfg.googleAnalytics.enabled,
      measurementId: cfg.googleAnalytics.measurementId,
    },
    facebookPixel: {
      enabled: cfg.facebookPixel.enabled,
      pixelId: cfg.facebookPixel.pixelId,
    },
  });
});

// ── POST /api/admin/analytics-config ──
// Update analytics configuration (Super Admin only)
router.post("/admin/analytics-config", requireSuperAdmin, adminRateLimit, (req, res) => {
  const body = req.body as {
    googleAnalytics?: Partial<AnalyticsConfig["googleAnalytics"]>;
    facebookPixel?: Partial<AnalyticsConfig["facebookPixel"]>;
    changedBy?: string;
  };

  const updates: Partial<AnalyticsConfig> = {};

  if (body.googleAnalytics) {
    updates.googleAnalytics = {
      enabled: body.googleAnalytics.enabled ?? false,
      measurementId: body.googleAnalytics.measurementId || "",
      apiSecret: body.googleAnalytics.apiSecret || "",
    };
  }

  if (body.facebookPixel) {
    updates.facebookPixel = {
      enabled: body.facebookPixel.enabled ?? false,
      pixelId: body.facebookPixel.pixelId || "",
      accessToken: body.facebookPixel.accessToken || "",
    };
  }

  setAnalyticsConfig(updates, body.changedBy || "super_admin");
  const cfg = getAnalyticsConfig();

  req.log.info(
    { googleEnabled: cfg.googleAnalytics.enabled, fbEnabled: cfg.facebookPixel.enabled },
    "Analytics config updated"
  );

  res.json({
    success: true,
    config: {
      googleAnalytics: {
        enabled: cfg.googleAnalytics.enabled,
        measurementId: cfg.googleAnalytics.measurementId,
        apiSecret: cfg.googleAnalytics.apiSecret ? "••••••••" : "",
      },
      facebookPixel: {
        enabled: cfg.facebookPixel.enabled,
        pixelId: cfg.facebookPixel.pixelId,
        accessToken: cfg.facebookPixel.accessToken ? "••••••••" : "",
      },
      lastChangedAt: cfg.lastChangedAt,
      changedBy: cfg.changedBy,
    },
  });
});

export default router;
