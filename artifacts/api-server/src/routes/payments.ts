import { Router } from "express";
import crypto from "crypto";

const router = Router();

// ── Razorpay client (lazy-init so server starts even without keys) ─────────────
let razorpayInstance: any = null;

async function getRazorpay() {
  const keyId     = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keyId || !keySecret) return null;
  if (razorpayInstance) return razorpayInstance;
  const { default: Razorpay } = await import("razorpay");
  razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return razorpayInstance;
}

const TEST_MODE = !process.env["RAZORPAY_KEY_ID"];

// ── Server-side order stores ──────────────────────────────────────────────────
// createdOrders: IDs issued by this server's create-order endpoint.
//   Only orders present here can be verified; rejects foreign order IDs.
// verifiedOrders: maps orderId → paymentId after passing verification.
//   The mobile client polls this via /payments/status/:orderId.
// In-memory only; sufficient for the current mock-heavy architecture.
const createdOrders  = new Set<string>();
const verifiedOrders = new Map<string, string>();

// ── POST /api/payments/create-order ──────────────────────────────────────────
router.post("/payments/create-order", async (req, res) => {
  const { amount, currency = "INR", receipt, notes } = req.body as {
    amount: number;       // in paise (₹1 = 100 paise)
    currency?: string;
    receipt?: string;
    notes?: Record<string, string>;
  };

  if (!amount || amount < 100) {
    res.status(400).json({ error: "Amount must be at least ₹1 (100 paise)" });
    return;
  }

  const rzp = await getRazorpay();

  if (!rzp) {
    // Test-mode: return a simulated order and record it server-side
    const simulatedOrderId = "order_" + Math.random().toString(36).slice(2, 14).toUpperCase();
    createdOrders.add(simulatedOrderId);
    req.log.info({ amount, simulatedOrderId }, "Test-mode payment order created");
    res.json({
      id:       simulatedOrderId,
      amount,
      currency,
      testMode: true,
      keyId:    "rzp_test_placeholder",
    });
    return;
  }

  try {
    const order = await rzp.orders.create({
      amount,
      currency,
      receipt:  receipt ?? `rcpt_${Date.now()}`,
      notes:    notes ?? {},
    });

    createdOrders.add(order.id);
    req.log.info({ orderId: order.id, amount }, "Razorpay order created");

    res.json({
      id:       order.id,
      amount:   order.amount,
      currency: order.currency,
      testMode: false,
      keyId:    process.env["RAZORPAY_KEY_ID"],
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create Razorpay order");
    res.status(502).json({ error: "Payment gateway error. Please try again." });
  }
});

// ── POST /api/payments/verify ─────────────────────────────────────────────────
// IMPORTANT: test-mode is determined entirely by the server (TEST_MODE env
// constant). Client-supplied testMode flags are intentionally ignored so an
// attacker cannot forge verification by sending { testMode: true }.
router.post("/payments/verify", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body as {
      razorpay_order_id:   string;
      razorpay_payment_id: string;
      razorpay_signature?: string;
    };

  if (!razorpay_order_id || !razorpay_payment_id) {
    res.status(400).json({ error: "Missing required payment fields" });
    return;
  }

  // Reject orders not issued by this server — prevents verification of
  // fabricated or externally-supplied order IDs.
  if (!createdOrders.has(razorpay_order_id)) {
    req.log.warn({ razorpay_order_id }, "Verification rejected: unknown order ID");
    res.status(400).json({ error: "Unknown order" });
    return;
  }

  // Test-mode is determined by the server, not the caller.
  if (TEST_MODE) {
    verifiedOrders.set(razorpay_order_id, razorpay_payment_id);
    req.log.info({ razorpay_order_id }, "Test-mode payment verified");
    res.json({ success: true, testMode: true, paymentId: razorpay_payment_id });
    return;
  }

  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keySecret) {
    res.status(503).json({ error: "Payment gateway not configured" });
    return;
  }

  if (!razorpay_signature) {
    res.status(400).json({ error: "Missing payment signature" });
    return;
  }

  const body     = razorpay_order_id + "|" + razorpay_payment_id;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");

  if (expected !== razorpay_signature) {
    req.log.warn({ razorpay_order_id }, "Payment signature mismatch — possible fraud");
    res.status(400).json({ error: "Invalid payment signature" });
    return;
  }

  verifiedOrders.set(razorpay_order_id, razorpay_payment_id);
  req.log.info({ razorpay_payment_id }, "Razorpay payment verified");
  res.json({ success: true, testMode: false, paymentId: razorpay_payment_id });
});

// ── GET /api/payments/status/:orderId ────────────────────────────────────────
// Lets the mobile app check whether a given order was server-verified after the
// in-app browser returns. Only returns success=true if the order passed
// signature verification (or test-mode verification) on this server.
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
// Returns public config (key_id only — never expose key_secret to client)
router.get("/payments/config", (_req, res) => {
  res.json({
    keyId:    process.env["RAZORPAY_KEY_ID"] ?? null,
    testMode: TEST_MODE,
    currency: "INR",
  });
});

// ── GET /api/payments/checkout ────────────────────────────────────────────────
// Serves an HTML page that auto-opens Razorpay checkout.js
router.get("/payments/checkout", (req, res) => {
  const { orderId, keyId, amount, desc, name, email, contact } = req.query as Record<string, string>;

  const html = `<!DOCTYPE html>
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
        backdropclose: false,
        escape: false,
        handleback: true,
        ondismiss: function() { showFail('Payment was cancelled.'); }
      },
      handler: function(response) {
        fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature
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
      try {
        var rzp = new Razorpay(options);
        rzp.open();
        document.getElementById('msg').textContent = 'Complete payment in the form above…';
      } catch(e) {
        showFail('Could not open payment form: ' + e.message);
      }
    });
  </script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

export default router;
