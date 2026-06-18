import { Router } from "express";
import {
  getOtpConfig,
  setOtpProvider,
  type OtpProvider,
} from "../lib/otpConfig";
import { isFirebaseConfigured } from "../lib/firebaseAdmin";
import { requireSuperAdmin } from "../lib/auth";
import { auditFromRequest } from "../lib/audit";
import { adminRateLimit } from "../lib/rateLimit";

const router = Router();

const MSG91_AUTH_KEY = process.env["MSG91_AUTH_KEY"];
const MSG91_TEMPLATE_ID = process.env["MSG91_OTP_TEMPLATE_ID"];

// ── GET /api/admin/otp-config ──
// Read current OTP provider configuration + availability status
router.get("/admin/otp-config", (req, res) => {
  const cfg = getOtpConfig();
  res.json({
    ...cfg,
    providers: {
      msg91: {
        available: !!MSG91_AUTH_KEY && !!MSG91_TEMPLATE_ID,
        configured: !!MSG91_AUTH_KEY && !!MSG91_TEMPLATE_ID,
      },
      firebase: {
        available: isFirebaseConfigured(),
        configured: isFirebaseConfigured(),
      },
    },
  });
});

// ── POST /api/admin/otp-config ──
// Switch active provider (Super Admin only)
router.post("/admin/otp-config", requireSuperAdmin, adminRateLimit, (req, res) => {
  const { provider, changedBy } = req.body as {
    provider: string;
    changedBy?: string;
  };

  const validProviders: OtpProvider[] = ["msg91", "firebase", "auto"];
  if (!validProviders.includes(provider as OtpProvider)) {
    res.status(400).json({
      success: false,
      error: `Invalid provider. Must be one of: ${validProviders.join(", ")}`,
    });
    return;
  }

  // Validate the chosen provider is actually available
  if (provider === "msg91" && (!MSG91_AUTH_KEY || !MSG91_TEMPLATE_ID)) {
    res.status(400).json({
      success: false,
      error: "MSG91 is not configured. Set MSG91_AUTH_KEY and MSG91_OTP_TEMPLATE_ID.",
    });
    return;
  }
  if (provider === "firebase" && !isFirebaseConfigured()) {
    res.status(400).json({
      success: false,
      error: "Firebase is not configured. Set GOOGLE_APPLICATION_CREDENTIALS.",
    });
    return;
  }

  setOtpProvider(provider as OtpProvider, changedBy || "super_admin");
  const cfg = getOtpConfig();

  req.log.info({ provider, changedBy: cfg.changedBy }, "OTP provider switched");
  res.json({ success: true, config: cfg });
});

export default router;
