import { Router } from "express";
import {
  getPaymentConfig,
  setPaymentProvider,
  getProviderAvailability,
  type PaymentProvider,
} from "../lib/paymentConfig";

const router = Router();

/** Simple Super Admin check — in production, replace with real JWT role validation */
function isSuperAdmin(req: any): boolean {
  const header = req.headers["x-admin-role"];
  return header === "super_admin";
}

// ── GET /api/admin/payment-config ──
// Read current payment provider configuration + availability status
router.get("/admin/payment-config", (_req, res) => {
  const cfg = getPaymentConfig();
  res.json({
    ...cfg,
    providers: getProviderAvailability(),
  });
});

// ── POST /api/admin/payment-config ──
// Switch active payment provider (Super Admin only)
router.post("/admin/payment-config", (req, res) => {
  if (!isSuperAdmin(req)) {
    res.status(403).json({ success: false, error: "Super Admin access required" });
    return;
  }

  const { provider, changedBy } = req.body as {
    provider: string;
    changedBy?: string;
  };

  const validProviders: PaymentProvider[] = [
    "razorpay",
    "cashfree",
    "phonepe",
    "instamojo",
  ];

  if (!validProviders.includes(provider as PaymentProvider)) {
    res.status(400).json({
      success: false,
      error: `Invalid provider. Must be one of: ${validProviders.join(", ")}`,
    });
    return;
  }

  const availability = getProviderAvailability();
  const target = provider as PaymentProvider;
  if (!availability[target].available) {
    res.status(400).json({
      success: false,
      error: `${target} is not configured. Please set the required environment variables first.`,
    });
    return;
  }

  setPaymentProvider(target, changedBy || "super_admin");
  res.json({
    success: true,
    activeProvider: target,
    lastChangedAt: new Date().toISOString(),
    changedBy: changedBy || "super_admin",
  });
});

export default router;
