import { Router } from "express";
import crypto from "crypto";
import {
  getPaymentConfig,
  getProviderAvailability,
  type PaymentProvider,
} from "../lib/paymentConfig";

const router = Router();

// ── Provider clients (lazy-init) ────────────────────────────────────────────
let razorpayInstance: any = null;
let cashfreeInstance: any = null;

async function getRazorpay() {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keyId || !keySecret) return null;
  if (razorpayInstance) return razorpayInstance;
  const { default: Razorpay } = await import("razorpay");
  razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return razorpayInstance;
}

// ── Test mode detection ─────────────────────────────────────────────────────
function isTestMode(): boolean {
  const cfg = getPaymentConfig();
  const availability = getProviderAvailability();
  const active = cfg.activeProvider;
  return !availability[active].configured;
}

// ── Server-side order stores ─────────────────────────────────────────────────
const createdOrders  = new Set<string>();
const verifiedOrders = new Map<string, string>();

// ── Provider-specific order creation ────────────────────────────────────────
interface OrderResponse {
  id: string;
  amount: number;
  currency: string;
  testMode: boolean;
  keyId?: string;
  checkoutUrl?: string; // for redirect-based providers (instamojo)
}

async function createRazorpayOrder(
  amount: number,
  currency: string,
  receipt: string,
  notes: Record<string, string>,
): Promise<OrderResponse> {
  const rzp = await getRazorpay();
  if (!rzp) {
    const id = "order_rzp_test_" + Math.random().toString(36).slice(2, 14).toUpperCase();
    return { id, amount, currency, testMode: true, keyId: "rzp_test_placeholder" };
  }
  const order = await rzp.orders.create({ amount, currency, receipt, notes });
  return {
    id: order.id,
    amount: order.amount,
    currency: order.currency,
    testMode: false,
    keyId: process.env["RAZORPAY_KEY_ID"]!,
  };
}

async function createCashfreeOrder(
  amount: number,
  currency: string,
  receipt: string,
  notes: Record<string, string>,
): Promise<OrderResponse> {
  const clientId = process.env["CASHFREE_CLIENT_ID"];
  const clientSecret = process.env["CASHFREE_CLIENT_SECRET"];
  if (!clientId || !clientSecret) {
    const id = "order_cf_test_" + Math.random().toString(36).slice(2, 14).toUpperCase();
    return { id, amount, currency, testMode: true, keyId: "cf_test_placeholder" };
  }
  // Cashfree API v2 order creation
  const isProd = clientId.startsWith("CF") && !clientId.includes("TEST");
  const baseUrl = isProd
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

  const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
  const body = {
    order_id: orderId,
    order_amount: amount / 100, // Cashfree uses rupees, not paise
    order_currency: currency,
    customer_details: {
      customer_id: receipt,
      customer_name: notes.name || "Ridhi User",
      customer_email: notes.email || "user@ridhi.app",
      customer_phone: notes.contact || "9999999999",
    },
    order_meta: {
      return_url: `${process.env["REPLIT_DOMAINS"] || "https://ridhi.app"}/api/payments/callback?provider=cashfree&order_id=${orderId}`,
      notify_url: `${process.env["REPLIT_DOMAINS"] || "https://ridhi.app"}/api/payments/webhook/cashfree`,
    },
  };

  try {
    const res = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": clientId,
        "x-client-secret": clientSecret,
        "x-api-version": "2023-08-01",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Cashfree API error: ${res.status}`);
    const data = await res.json() as any;
    return {
      id: data.order_id,
      amount,
      currency,
      testMode: !isProd,
      keyId: clientId,
      checkoutUrl: data.payment_session_id,
    };
  } catch {
    // Fallback to test mode on API error
    return {
      id: orderId,
      amount,
      currency,
      testMode: true,
      keyId: clientId,
    };
  }
}

async function createPhonePeOrder(
  amount: number,
  currency: string,
  receipt: string,
  notes: Record<string, string>,
): Promise<OrderResponse> {
  const merchantId = process.env["PHONEPE_MERCHANT_ID"];
  const saltKey = process.env["PHONEPE_SALT_KEY"];
  if (!merchantId || !saltKey) {
    const id = "order_pp_test_" + Math.random().toString(36).slice(2, 14).toUpperCase();
    return { id, amount, currency, testMode: true };
  }

  const isProd = !merchantId.startsWith("PGTEST");
  const baseUrl = isProd
    ? "https://api.phonepe.com/apis/hermes"
    : "https://api-preprod.phonepe.com/apis/hermes";

  const orderId = `RIDHI_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const payload = {
    merchantId,
    merchantTransactionId: orderId,
    merchantUserId: receipt,
    amount,
    callbackUrl: `${process.env["REPLIT_DOMAINS"] || "https://ridhi.app"}/api/payments/callback?provider=phonepe&order_id=${orderId}`,
    mobileNumber: notes.contact || "9999999999",
    deviceContext: { deviceOS: "ANDROID" },
    paymentInstrument: { type: "PAY_PAGE" },
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");
  const toHash = payloadBase64 + "/pg/v1/pay" + saltKey;
  const xVerify = crypto.createHash("sha256").update(toHash).digest("hex") + "###1";

  try {
    const res = await fetch(`${baseUrl}/pg/v1/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
      },
      body: JSON.stringify({ request: payloadBase64 }),
    });
    if (!res.ok) throw new Error(`PhonePe API error: ${res.status}`);
    const data = await res.json() as any;
    return {
      id: orderId,
      amount,
      currency,
      testMode: !isProd,
      checkoutUrl: data.data?.instrumentResponse?.redirectInfo?.url || data.data?.redirectUrl,
    };
  } catch {
    return { id: orderId, amount, currency, testMode: true };
  }
}

async function createInstamojoOrder(
  amount: number,
  currency: string,
  receipt: string,
  notes: Record<string, string>,
): Promise<OrderResponse> {
  const apiKey = process.env["INSTAMOJO_API_KEY"];
  const authToken = process.env["INSTAMOJO_AUTH_TOKEN"];
  if (!apiKey || !authToken) {
    const id = "order_ij_test_" + Math.random().toString(36).slice(2, 14).toUpperCase();
    return { id, amount, currency, testMode: true };
  }

  const isProd = !authToken.startsWith("test_");
  const baseUrl = isProd
    ? "https://www.instamojo.com/api/1.1"
    : "https://test.instamojo.com/api/1.1";

  try {
    const formData = new URLSearchParams();
    formData.append("amount", (amount / 100).toFixed(2));
    formData.append("purpose", notes.label || "Ridhi Payment");
    formData.append("buyer_name", notes.name || "Ridhi User");
    formData.append("email", notes.email || "user@ridhi.app");
    formData.append("phone", notes.contact || "9999999999");
    formData.append("redirect_url", `${process.env["REPLIT_DOMAINS"] || "https://ridhi.app"}/api/payments/callback?provider=instamojo`);
    formData.append("send_email", "false");
    formData.append("send_sms", "false");

    const res = await fetch(`${baseUrl}/payment-requests/`, {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "X-Auth-Token": authToken,
      },
      body: formData,
    });
    if (!res.ok) throw new Error(`Instamojo API error: ${res.status}`);
    const data = await res.json() as any;
    return {
      id: data.payment_request?.id || `order_ij_${Date.now()}`,
      amount,
      currency,
      testMode: !isProd,
      checkoutUrl: data.payment_request?.longurl,
    };
  } catch {
    const id = `order_ij_test_${Date.now()}`;
    return { id, amount, currency, testMode: true };
  }
}

async function createProviderOrder(
  provider: PaymentProvider,
  amount: number,
  currency: string,
  receipt: string,
  notes: Record<string, string>,
): Promise<OrderResponse> {
  switch (provider) {
    case "razorpay":  return createRazorpayOrder(amount, currency, receipt, notes);
    case "cashfree":  return createCashfreeOrder(amount, currency, receipt, notes);
    case "phonepe":   return createPhonePeOrder(amount, currency, receipt, notes);
    case "instamojo": return createInstamojoOrder(amount, currency, receipt, notes);
    default:          return createRazorpayOrder(amount, currency, receipt, notes);
  }
}

// ── POST /api/payments/create-order ──────────────────────────────────────────
router.post("/payments/create-order", async (req, res) => {
  const { amount, currency = "INR", receipt, notes } = req.body as {
    amount: number;
    currency?: string;
    receipt?: string;
    notes?: Record<string, string>;
  };

  if (!amount || amount < 100) {
    res.status(400).json({ error: "Amount must be at least \u20b91 (100 paise)" });
    return;
  }

  const cfg = getPaymentConfig();
  const provider = cfg.activeProvider;

  try {
    const order = await createProviderOrder(
      provider,
      amount,
      currency,
      receipt ?? `rcpt_${Date.now()}`,
      notes ?? {},
    );
    createdOrders.add(order.id);
    req.log.info({ orderId: order.id, amount, provider }, `${provider} order created`);
    res.json({ ...order, provider });
  } catch (err) {
    req.log.error({ err, provider }, "Failed to create payment order");
    res.status(502).json({ error: "Payment gateway error. Please try again." });
  }
});

// ── POST /api/payments/verify ─────────────────────────────────────────────────
router.post("/payments/verify", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    order_id,
    payment_id,
    provider,
    signature,
  } = req.body as {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    order_id?: string;
    payment_id?: string;
    provider?: PaymentProvider;
    signature?: string;
  };

  const resolvedOrderId = razorpay_order_id || order_id || "";
  const resolvedPaymentId = razorpay_payment_id || payment_id || "";

  if (!resolvedOrderId || !resolvedPaymentId) {
    res.status(400).json({ error: "Missing required payment fields" });
    return;
  }

  // Reject unknown orders
  if (!createdOrders.has(resolvedOrderId)) {
    req.log.warn({ orderId: resolvedOrderId }, "Verification rejected: unknown order ID");
    res.status(400).json({ error: "Unknown order" });
    return;
  }

  const cfg = getPaymentConfig();
  const activeProvider = provider || cfg.activeProvider;

  // Test mode
  if (isTestMode()) {
    verifiedOrders.set(resolvedOrderId, resolvedPaymentId);
    req.log.info({ orderId: resolvedOrderId }, "Test-mode payment verified");
    res.json({ success: true, testMode: true, paymentId: resolvedPaymentId, provider: activeProvider });
    return;
  }

  // Provider-specific verification
  let verified = false;
  try {
    switch (activeProvider) {
      case "razorpay": {
        const keySecret = process.env["RAZORPAY_KEY_SECRET"];
        if (!keySecret || !razorpay_signature) break;
        const body = resolvedOrderId + "|" + resolvedPaymentId;
        const expected = crypto.createHmac("sha256", keySecret).update(body).digest("hex");
        verified = expected === razorpay_signature;
        break;
      }
      case "cashfree": {
        // Cashfree verification uses order status API
        const clientId = process.env["CASHFREE_CLIENT_ID"];
        const clientSecret = process.env["CASHFREE_CLIENT_SECRET"];
        if (!clientId || !clientSecret) break;
        const isProd = clientId.startsWith("CF") && !clientId.includes("TEST");
        const baseUrl = isProd ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";
        const statusRes = await fetch(`${baseUrl}/orders/${resolvedOrderId}`, {
          headers: {
            "x-client-id": clientId,
            "x-client-secret": clientSecret,
            "x-api-version": "2023-08-01",
          },
        });
        if (statusRes.ok) {
          const data = await statusRes.json() as any;
          verified = data.order_status === "PAID";
        }
        break;
      }
      case "phonepe": {
        const merchantId = process.env["PHONEPE_MERCHANT_ID"];
        const saltKey = process.env["PHONEPE_SALT_KEY"];
        if (!merchantId || !saltKey) break;
        const isProd = !merchantId.startsWith("PGTEST");
        const baseUrl = isProd
          ? "https://api.phonepe.com/apis/hermes"
          : "https://api-preprod.phonepe.com/apis/hermes";
        const toHash = `/pg/v1/status/${merchantId}/${resolvedOrderId}` + saltKey;
        const xVerify = crypto.createHash("sha256").update(toHash).digest("hex") + "###1";
        const statusRes = await fetch(`${baseUrl}/pg/v1/status/${merchantId}/${resolvedOrderId}`, {
          headers: {
            "Content-Type": "application/json",
            "X-VERIFY": xVerify,
            "X-MERCHANT-ID": merchantId,
          },
        });
        if (statusRes.ok) {
          const data = await statusRes.json() as any;
          verified = data.code === "PAYMENT_SUCCESS";
        }
        break;
      }
      case "instamojo": {
        const apiKey = process.env["INSTAMOJO_API_KEY"];
        const authToken = process.env["INSTAMOJO_AUTH_TOKEN"];
        if (!apiKey || !authToken) break;
        const isProd = !authToken.startsWith("test_");
        const baseUrl = isProd
          ? "https://www.instamojo.com/api/1.1"
          : "https://test.instamojo.com/api/1.1";
        const statusRes = await fetch(`${baseUrl}/payment-requests/${resolvedOrderId}/`, {
          headers: {
            "X-Api-Key": apiKey,
            "X-Auth-Token": authToken,
          },
        });
        if (statusRes.ok) {
          const data = await statusRes.json() as any;
          verified = data.payment_request?.status === "Completed";
        }
        break;
      }
    }
  } catch (err) {
    req.log.error({ err, provider: activeProvider }, "Payment verification error");
  }

  if (verified) {
    verifiedOrders.set(resolvedOrderId, resolvedPaymentId);
    req.log.info({ paymentId: resolvedPaymentId, provider: activeProvider }, "Payment verified");
    res.json({ success: true, testMode: false, paymentId: resolvedPaymentId, provider: activeProvider });
  } else {
    req.log.warn({ orderId: resolvedOrderId }, "Payment verification failed");
    res.status(400).json({ error: "Invalid payment signature or status" });
  }
});

// ── GET /api/payments/status/:orderId ────────────────────────────────────────
router.get("/payments/status/:orderId", (req, res) => {
  const { orderId } = req.params;
  const paymentId = verifiedOrders.get(orderId);
  if (paymentId) {
    res.json({ verified: true, paymentId });
  } else {
    res.json({ verified: false });
  }
});

// ── GET /api/payments/config ──────────────────────────────────────────────────
router.get("/payments/config", (_req, res) => {
  const cfg = getPaymentConfig();
  const availability = getProviderAvailability();
  const active = cfg.activeProvider;

  res.json({
    provider: active,
    testMode: isTestMode(),
    currency: "INR",
    available: availability[active].available,
    configured: availability[active].configured,
    // Provider-specific public keys
    razorpayKeyId: process.env["RAZORPAY_KEY_ID"] ?? null,
    cashfreeClientId: process.env["CASHFREE_CLIENT_ID"] ?? null,
    phonepeMerchantId: process.env["PHONEPE_MERCHANT_ID"] ?? null,
  });
});

// ── GET /api/payments/provider ────────────────────────────────────────────────
// Tells the client which payment provider is currently active
router.get("/payments/provider", (_req, res) => {
  const cfg = getPaymentConfig();
  const availability = getProviderAvailability();
  res.json({
    provider: cfg.activeProvider,
    testMode: isTestMode(),
    available: availability[cfg.activeProvider].available,
  });
});

// ── GET /api/payments/checkout ────────────────────────────────────────────────
// Serves an HTML page that opens the active provider's checkout
router.get("/payments/checkout", (req, res) => {
  const { orderId, keyId, amount, desc, name, email, contact, provider } =
    req.query as Record<string, string>;

  const cfg = getPaymentConfig();
  const activeProvider = provider || cfg.activeProvider;

  if (activeProvider === "razorpay") {
    const html = renderRazorpayCheckout({ orderId, keyId, amount, desc, name, email, contact });
    res.setHeader("Content-Type", "text/html");
    res.send(html);
    return;
  }

  // For redirect-based providers, redirect directly to their checkout URL
  // The checkout URL should have been returned in the create-order response
  if (activeProvider === "phonepe" || activeProvider === "instamojo" || activeProvider === "cashfree") {
    const redirectUrl = req.query.checkoutUrl as string;
    if (redirectUrl) {
      res.redirect(redirectUrl);
      return;
    }
  }

  // Fallback: generic payment page
  const html = renderGenericCheckout({ orderId, amount, desc, provider: activeProvider });
  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

// ── GET /api/payments/callback ───────────────────────────────────────────────
// Handles redirect callbacks from redirect-based providers
router.get("/payments/callback", (req, res) => {
  const { provider, order_id, transactionId, payment_id } = req.query as Record<string, string>;
  const resolvedOrderId = order_id || "";
  const resolvedPaymentId = transactionId || payment_id || "";

  if (!resolvedOrderId || !resolvedPaymentId) {
    res.status(400).send("Invalid callback parameters");
    return;
  }

  if (createdOrders.has(resolvedOrderId)) {
    verifiedOrders.set(resolvedOrderId, resolvedPaymentId);
  }

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:sans-serif;background:#0d0d0d;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:24px;text-align:center}
.logo{font-size:28px;font-weight:800;background:linear-gradient(135deg,#E91E8C,#7B2FBE);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.success{color:#34C759;font-size:20px;font-weight:700;margin:16px 0}
.close{color:#888;font-size:14px;margin-top:16px}</style></head>
<body><div class="logo">Ridhi</div><div class="success">✅ Payment Received</div>
<p>Transaction: ${resolvedPaymentId}</p><p class="close">You can close this tab.</p></body></html>`;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

// ── Helper: Razorpay checkout HTML ─────────────────────────────────────────────
function renderRazorpayCheckout(params: Record<string, string>) {
  const { orderId, keyId, amount, desc, name, email, contact } = params;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <title>Ridhi – Secure Payment</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           background: #0d0d0d; color: #fff; display: flex; flex-direction: column;
           align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .logo { font-size: 28px; font-weight: 800; margin-bottom: 8px;
            background: linear-gradient(135deg, #E91E8C, #7B2FBE);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .sub  { font-size: 14px; color: #888; margin-bottom: 32px; }
    .spin { width: 40px; height: 40px; border: 3px solid #333;
            border-top-color: #E91E8C; border-radius: 50%;
            animation: spin 0.8s linear infinite; margin-bottom: 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    p { font-size: 14px; color: #aaa; }
    .success { color: #34C759; font-size: 20px; font-weight: 700; margin-bottom: 8px; }
    .fail    { color: #FF3B30; font-size: 20px; font-weight: 700; margin-bottom: 8px; }
    .txn     { font-size: 12px; color: #888; margin-top: 8px; word-break: break-all; }
    .badge   { margin-top: 24px; font-size: 11px; color: #555; }
  </style>
</head>
<body>
  <div class="logo">Ridhi</div>
  <div class="sub">Secure Payment Gateway</div>
  <div class="spin" id="spin"></div>
  <p id="msg">Opening payment…</p>
  <div class="badge">🔒 Powered by Razorpay · PCI DSS Compliant</div>

  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <script>
    function showSuccess(paymentId) {
      document.getElementById('spin').style.display = 'none';
      document.getElementById('msg').innerHTML =
        '<div class="success">✅ Payment Successful!</div>' +
        '<p>Transaction ID:<br/><span class="txn">' + paymentId + '</span></p>' +
        '<p style="margin-top:16px;color:#aaa;">You can now close this tab and return to Ridhi.</p>';
    }
    function showFail(reason) {
      document.getElementById('spin').style.display = 'none';
      document.getElementById('msg').innerHTML =
        '<div class="fail">❌ Payment Failed</div>' +
        '<p>' + (reason || 'Something went wrong. Please try again.') + '</p>' +
        '<p style="margin-top:16px;color:#aaa;">Close this tab to return to Ridhi.</p>';
    }
    var options = {
      key:         '${keyId ?? ""}',
      order_id:    '${orderId ?? ""}',
      amount:      ${amount ?? 0},
      currency:    'INR',
      name:        'Ridhi',
      description: '${(desc ?? "Payment").replace(/'/g, "\\'")}',
      image:       'https://via.placeholder.com/80x80/E91E8C/fff?text=R',
      prefill: {
        name:    '${(name ?? "").replace(/'/g, "\\'")}',
        email:   '${(email ?? "").replace(/'/g, "\\'")}',
        contact: '${(contact ?? "").replace(/'/g, "\\'")}'
      },
      theme: { color: '#E91E8C' },
      modal: {
        backdropclose: false, escape: false, handleback: true,
        ondismiss: function() { showFail('Payment was cancelled.'); }
      },
      handler: function(response) {
        fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            provider: 'razorpay'
          })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.success) { showSuccess(response.razorpay_payment_id); }
          else { showFail('Verification failed. Contact support.'); }
        })
        .catch(function() { showFail('Network error during verification.'); });
      }
    };
    window.addEventListener('load', function() {
      try { var rzp = new Razorpay(options); rzp.open();
        document.getElementById('msg').textContent = 'Complete payment in the form above…';
      } catch(e) { showFail('Could not open payment form: ' + e.message); }
    });
  </script>
</body>
</html>`;
}

function renderGenericCheckout(params: Record<string, string>) {
  const { orderId, amount, desc, provider } = params;
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:sans-serif;background:#0d0d0d;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:24px;text-align:center}
.logo{font-size:28px;font-weight:800;background:linear-gradient(135deg,#E91E8C,#7B2FBE);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.msg{font-size:16px;color:#888;margin:16px 0}</style></head>
<body><div class="logo">Ridhi</div>
<p class="msg">Redirecting to ${provider || "payment gateway"}…</p>
<p>Order: ${orderId}</p><p>Amount: ₹${Number(amount || 0) / 100}</p></body></html>`;
}

export default router;
