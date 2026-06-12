import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useColors } from "@/hooks/useColors";
const COIN_IMAGE = require("../assets/images/ridhi_coin.png");

// ── API helpers ────────────────────────────────────────────────────────────────
const API_BASE = process.env["EXPO_PUBLIC_DOMAIN"]
  ? `https://${process.env["EXPO_PUBLIC_DOMAIN"]}/api`
  : "/api";

async function createOrder(amountInPaise: number, label: string) {
  try {
    const res = await fetch(`${API_BASE}/payments/create-order`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ amount: amountInPaise, notes: { label } }),
    });
    if (!res.ok) return null;
    return await res.json() as {
      id: string; amount: number; testMode: boolean; keyId?: string;
      provider: string; checkoutUrl?: string;
    };
  } catch {
    return null;
  }
}

// ── API helpers (continued) ────────────────────────────────────────────────────
async function verifyOrder(orderId: string, paymentId: string, provider?: string) {
  try {
    const res = await fetch(`${API_BASE}/payments/verify`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        razorpay_order_id:   orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature:  "",
        provider,
      }),
    });
    if (!res.ok) return false;
    const data = await res.json() as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

async function checkOrderStatus(orderId: string): Promise<{ verified: boolean; paymentId?: string }> {
  try {
    const res = await fetch(`${API_BASE}/payments/status/${encodeURIComponent(orderId)}`);
    if (!res.ok) return { verified: false };
    return await res.json() as { verified: boolean; paymentId?: string };
  } catch {
    return { verified: false };
  }
}

// ── Types ──────────────────────────────────────────────────────────────────────
type PayStep = "select" | "processing" | "success" | "failed";
type PayMethod = "upi" | "card" | "netbanking" | "wallet";

export interface PaymentSheetProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (txnId: string) => void;
  amount: number;
  label: string;
  sublabel?: string;
  walletBalance?: number;
  noGst?: boolean;
}

// ── UPI Apps ───────────────────────────────────────────────────────────────────
const UPI_APPS = [
  { id: "gpay",    name: "Google Pay", icon: "globe"        as const, color: "#4285F4" },
  { id: "phonepe", name: "PhonePe",    icon: "smartphone"   as const, color: "#5F259F" },
  { id: "paytm",   name: "Paytm",      icon: "shopping-bag" as const, color: "#00BAF2" },
  { id: "bhim",    name: "BHIM UPI",   icon: "shield"       as const, color: "#00875A" },
];

// ── Banks ─────────────────────────────────────────────────────────────────────
const BANKS = [
  "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank",
  "Kotak Mahindra Bank", "Punjab National Bank", "Bank of Baroda",
  "Canara Bank", "Union Bank of India", "IDBI Bank",
];

// ── Processing status messages ─────────────────────────────────────────────────
const PROCESSING_STEPS = [
  "Connecting to bank…",
  "Authenticating…",
  "Processing payment…",
  "Verifying…",
  "Confirming…",
];

function generateTxnId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "RDH";
  for (let i = 0; i < 12; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function formatCard(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 16);
  return digits.match(/.{1,4}/g)?.join(" ") ?? digits;
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length > 2) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

// ── Spinner ────────────────────────────────────────────────────────────────────
function Spinner({ color }: { color: string }) {
  const rotate = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 900, useNativeDriver: true, easing: Easing.linear })
    ).start();
  }, []);
  return (
    <Animated.View style={{ transform: [{ rotate: rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] }}>
      <Feather name="loader" size={44} color={color} />
    </Animated.View>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function PaymentSheet({ visible, onClose, onSuccess, amount, label, sublabel, walletBalance = 2450, noGst = false }: PaymentSheetProps) {
  const colors = useColors();

  const [step,        setStep]        = useState<PayStep>("select");
  const [method,      setMethod]      = useState<PayMethod>("upi");
  const [upiApp,      setUpiApp]      = useState<string | null>(null);
  const [upiId,       setUpiId]       = useState("");
  const [cardNo,      setCardNo]      = useState("");
  const [expiry,      setExpiry]      = useState("");
  const [cvv,         setCvv]         = useState("");
  const [cardName,    setCardName]    = useState("");
  const [bank,        setBank]        = useState<string | null>(null);
  const [procStatus,  setProcStatus]  = useState(0);
  const [txnId,       setTxnId]       = useState("");
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Reset when opened
  useEffect(() => {
    if (visible) {
      setStep("select");
      setMethod("upi");
      setUpiApp(null);
      setUpiId("");
      setCardNo(""); setExpiry(""); setCvv(""); setCardName("");
      setBank(null);
    }
  }, [visible]);

  // Success scale-in animation
  useEffect(() => {
    if (step === "success") {
      scaleAnim.setValue(0);
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }).start();
    }
  }, [step]);

  const gst = noGst ? 0 : Math.round(amount * 0.18);
  const total = amount + gst;

  const canPay = () => {
    if (method === "upi")        return upiApp !== null || upiId.includes("@");
    if (method === "card")       return cardNo.replace(/\s/g, "").length === 16 && expiry.length === 5 && cvv.length === 3 && cardName.trim().length >= 2;
    if (method === "netbanking") return bank !== null;
    if (method === "wallet")     return walletBalance >= total;
    return false;
  };

  const handlePay = async () => {
    setStep("processing");
    setProcStatus(0);

    // Try backend order creation first
    const amountInPaise = total * 100;  // backends use paise (₹1 = 100 paise)
    const order = await createOrder(amountInPaise, label);
    const provider = order?.provider ?? "razorpay";

    if (order && !order.testMode) {
      // Redirect-based providers (Cashfree, PhonePe, Instamojo)
      if (provider !== "razorpay" && order.checkoutUrl) {
        await WebBrowser.openBrowserAsync(order.checkoutUrl, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          toolbarColor:      "#E91E8C",
        });
        const status = await checkOrderStatus(order.id);
        if (status.verified && status.paymentId) {
          setTxnId(status.paymentId.slice(0, 16).toUpperCase());
          setStep("success");
        } else {
          setStep("failed");
        }
        return;
      }

      // Razorpay: open backend-hosted checkout page in system browser
      const checkoutUrl = `${API_BASE}/payments/checkout?` + new URLSearchParams({
        orderId:  order.id,
        keyId:    order.keyId || "",
        amount:   String(order.amount),
        desc:     label,
        provider,
      }).toString();
      await WebBrowser.openBrowserAsync(checkoutUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        toolbarColor:      "#E91E8C",
      });
      const status = await checkOrderStatus(order.id);
      if (status.verified && status.paymentId) {
        setTxnId(status.paymentId.slice(0, 16).toUpperCase());
        setStep("success");
      } else {
        setStep("failed");
      }
      return;
    }

    // Test / simulation mode
    const simOrderId   = order?.id ?? ("order_sim_" + Date.now());
    const simPaymentId = generateTxnId();

    await new Promise<void>((resolve) => {
      let i = 0;
      const iv = setInterval(() => {
        i++;
        if (i < PROCESSING_STEPS.length) {
          setProcStatus(i);
        } else {
          clearInterval(iv);
          resolve();
        }
      }, 600);
    });

    const verified = await verifyOrder(simOrderId, simPaymentId, provider);
    if (verified) {
      setTxnId(simPaymentId);
      setStep("success");
    } else {
      setStep("failed");
    }
  };

  const handleDone = () => {
    onSuccess(txnId);
    onClose();
  };

  const METHODS: { key: PayMethod; label: string; icon: React.ComponentProps<typeof Feather>["name"] }[] = [
    { key: "upi",        label: "UPI",         icon: "zap"         },
    { key: "card",       label: "Card",         icon: "credit-card" },
    { key: "netbanking", label: "Net Banking",  icon: "globe"       },
    { key: "wallet",     label: "Wallet",       icon: "star"        },
  ];

  const now = new Date();
  const ts  = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
             + " · " + now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={step === "select" ? onClose : undefined}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.sheetWrap}>
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* ── SELECT METHOD ───────────────────────────────────────────────── */}
          {step === "select" && (
            <>
              {/* Header */}
              <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Secure Payment</Text>
                  <Text style={[styles.sheetSublabel, { color: colors.mutedForeground }]}>{label}</Text>
                </View>
                <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.muted }]}>
                  <Feather name="x" size={16} color={colors.foreground} />
                </Pressable>
              </View>

              {/* Amount summary */}
              <View style={[styles.amountRow, { backgroundColor: "#E91E8C10", borderColor: "#E91E8C30" }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>Amount</Text>
                  <Text style={[styles.amountVal, { color: colors.foreground }]}>₹{amount.toLocaleString("en-IN")}</Text>
                  {sublabel && <Text style={[styles.amountSub, { color: colors.mutedForeground }]}>{sublabel}</Text>}
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  {!noGst && (
                    <>
                      <Text style={[styles.amountLabel, { color: colors.mutedForeground }]}>+ GST (18%)</Text>
                      <Text style={[styles.gstVal, { color: "#FF8C42" }]}>+₹{gst.toLocaleString("en-IN")}</Text>
                    </>
                  )}
                  <View style={[styles.totalPill, { backgroundColor: colors.primary }]}>
                    <Text style={styles.totalPillText}>Total ₹{total.toLocaleString("en-IN")}</Text>
                  </View>
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Method tabs */}
                <View style={styles.methodRow}>
                  {METHODS.map((m) => {
                    const sel = method === m.key;
                    return (
                      <Pressable key={m.key} onPress={() => setMethod(m.key)}
                        style={[styles.methodTab, { backgroundColor: sel ? colors.primary : colors.muted, borderColor: sel ? colors.primary : colors.border }]}>
                        <Feather name={m.icon} size={14} color={sel ? "#fff" : colors.foreground} />
                        <Text style={[styles.methodTabText, { color: sel ? "#fff" : colors.foreground }]}>{m.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* ── UPI ─────────────────────────────────────────────────── */}
                {method === "upi" && (
                  <View style={styles.methodContent}>
                    <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Quick Pay</Text>
                    <View style={styles.upiAppsGrid}>
                      {UPI_APPS.map((app) => {
                        const sel = upiApp === app.id;
                        return (
                          <Pressable key={app.id} onPress={() => { setUpiApp(app.id); setUpiId(""); }}
                            style={[styles.upiAppBtn, { backgroundColor: sel ? app.color + "18" : colors.muted, borderColor: sel ? app.color : colors.border, borderWidth: sel ? 2 : 1 }]}>
                            <View style={[styles.upiAppIcon, { backgroundColor: app.color + "22" }]}>
                              <Feather name={app.icon} size={18} color={app.color} />
                            </View>
                            <Text style={[styles.upiAppName, { color: colors.foreground }]}>{app.name}</Text>
                            {sel && <Feather name="check-circle" size={14} color={app.color} style={{ position: "absolute", top: 6, right: 6 }} />}
                          </Pressable>
                        );
                      })}
                    </View>

                    <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 12 }]}>Or enter UPI ID</Text>
                    <View style={[styles.inputWrap, { borderColor: upiId.includes("@") ? colors.primary : colors.border, backgroundColor: colors.background }]}>
                      <Feather name="at-sign" size={16} color={colors.mutedForeground} />
                      <TextInput
                        style={[styles.input, { color: colors.foreground }]}
                        placeholder="yourname@upi"
                        placeholderTextColor={colors.mutedForeground}
                        value={upiId}
                        onChangeText={(v) => { setUpiId(v); setUpiApp(null); }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                      {upiId.includes("@") && <Feather name="check" size={16} color="#34C759" />}
                    </View>
                    <Text style={[styles.hint, { color: colors.mutedForeground }]}>Supported: GPay, PhonePe, Paytm, BHIM, all UPI apps</Text>
                  </View>
                )}

                {/* ── CARD ─────────────────────────────────────────────────── */}
                {method === "card" && (
                  <View style={styles.methodContent}>
                    <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Card Number</Text>
                    <View style={[styles.inputWrap, { borderColor: cardNo.replace(/\s/g, "").length === 16 ? colors.primary : colors.border, backgroundColor: colors.background }]}>
                      <Feather name="credit-card" size={16} color={colors.mutedForeground} />
                      <TextInput
                        style={[styles.input, { color: colors.foreground, letterSpacing: 2 }]}
                        placeholder="0000 0000 0000 0000"
                        placeholderTextColor={colors.mutedForeground}
                        value={cardNo}
                        onChangeText={(v) => setCardNo(formatCard(v))}
                        keyboardType="numeric"
                        maxLength={19}
                      />
                    </View>

                    <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Expiry</Text>
                        <View style={[styles.inputWrap, { borderColor: expiry.length === 5 ? colors.primary : colors.border, backgroundColor: colors.background }]}>
                          <TextInput
                            style={[styles.input, { color: colors.foreground }]}
                            placeholder="MM/YY"
                            placeholderTextColor={colors.mutedForeground}
                            value={expiry}
                            onChangeText={(v) => setExpiry(formatExpiry(v))}
                            keyboardType="numeric"
                            maxLength={5}
                          />
                        </View>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>CVV</Text>
                        <View style={[styles.inputWrap, { borderColor: cvv.length === 3 ? colors.primary : colors.border, backgroundColor: colors.background }]}>
                          <TextInput
                            style={[styles.input, { color: colors.foreground }]}
                            placeholder="•••"
                            placeholderTextColor={colors.mutedForeground}
                            value={cvv}
                            onChangeText={(v) => setCvv(v.replace(/\D/g, "").slice(0, 3))}
                            keyboardType="numeric"
                            maxLength={3}
                            secureTextEntry
                          />
                        </View>
                      </View>
                    </View>

                    <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 4 }]}>Name on Card</Text>
                    <View style={[styles.inputWrap, { borderColor: cardName.trim().length >= 2 ? colors.primary : colors.border, backgroundColor: colors.background }]}>
                      <Feather name="user" size={16} color={colors.mutedForeground} />
                      <TextInput
                        style={[styles.input, { color: colors.foreground }]}
                        placeholder="As printed on card"
                        placeholderTextColor={colors.mutedForeground}
                        value={cardName}
                        onChangeText={setCardName}
                        autoCapitalize="words"
                      />
                    </View>

                    <View style={[styles.secureBadge, { backgroundColor: "#34C75910", borderColor: "#34C75930" }]}>
                      <Feather name="lock" size={12} color="#34C759" />
                      <Text style={[styles.secureText, { color: "#34C759" }]}>256-bit SSL secured · RuPay, Visa, Mastercard accepted</Text>
                    </View>
                  </View>
                )}

                {/* ── NET BANKING ──────────────────────────────────────────── */}
                {method === "netbanking" && (
                  <View style={styles.methodContent}>
                    <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Select Your Bank</Text>
                    {BANKS.map((b) => {
                      const sel = bank === b;
                      return (
                        <Pressable key={b} onPress={() => setBank(b)}
                          style={[styles.bankRow, { borderColor: sel ? colors.primary : colors.border, backgroundColor: sel ? colors.primary + "10" : colors.background }]}>
                          <View style={[styles.bankIcon, { backgroundColor: sel ? colors.primary + "20" : colors.muted }]}>
                            <Feather name="home" size={14} color={sel ? colors.primary : colors.mutedForeground} />
                          </View>
                          <Text style={[styles.bankName, { color: colors.foreground }]}>{b}</Text>
                          {sel && <Feather name="check-circle" size={18} color={colors.primary} />}
                        </Pressable>
                      );
                    })}
                  </View>
                )}

                {/* ── RIDHI WALLET ─────────────────────────────────────────── */}
                {method === "wallet" && (
                  <View style={styles.methodContent}>
                    <View style={[styles.walletCard, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
                      <View style={[styles.walletIcon, { backgroundColor: colors.primary + "20" }]}>
                        <Image source={COIN_IMAGE} style={{ width: 22, height: 22 }} resizeMode="contain" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.walletLabel, { color: colors.foreground }]}>Ridhi Wallet</Text>
                        <Text style={[styles.walletBal, { color: colors.primary }]}>Balance: ₹{walletBalance.toLocaleString("en-IN")}</Text>
                      </View>
                      {walletBalance >= total ? (
                        <View style={[styles.sufficientBadge, { backgroundColor: "#34C75918", borderColor: "#34C75940" }]}>
                          <Feather name="check" size={12} color="#34C759" />
                          <Text style={[styles.sufficientText, { color: "#34C759" }]}>Sufficient</Text>
                        </View>
                      ) : (
                        <View style={[styles.sufficientBadge, { backgroundColor: "#F43F5E18", borderColor: "#F43F5E40" }]}>
                          <Feather name="x" size={12} color="#F43F5E" />
                          <Text style={[styles.sufficientText, { color: "#F43F5E" }]}>Low balance</Text>
                        </View>
                      )}
                    </View>

                    <View style={[styles.deductRow, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.deductLabel, { color: colors.mutedForeground }]}>Amount to deduct</Text>
                      <Text style={[styles.deductVal, { color: colors.foreground }]}>₹{total.toLocaleString("en-IN")}</Text>
                    </View>
                    {walletBalance < total && (
                      <Text style={[styles.hint, { color: "#F43F5E" }]}>Insufficient balance. Please add money or choose another payment method.</Text>
                    )}
                  </View>
                )}
              </ScrollView>

              {/* Pay button */}
              <View style={[styles.payBtnWrap, { borderTopColor: colors.border }]}>
                <View style={[styles.pgRow, { borderColor: colors.border }]}>
                  <Feather name="shield" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.pgText, { color: colors.mutedForeground }]}>Powered by Razorpay · PCI DSS compliant</Text>
                </View>
                <Pressable onPress={canPay() ? handlePay : undefined} style={{ opacity: canPay() ? 1 : 0.4 }}>
                  <View style={[styles.payBtn, { backgroundColor: colors.primary }]}>
                    <Feather name="lock" size={16} color="#fff" />
                    <Text style={styles.payBtnText}>Pay ₹{total.toLocaleString("en-IN")}</Text>
                  </View>
                </Pressable>
              </View>
            </>
          )}

          {/* ── PROCESSING ──────────────────────────────────────────────────── */}
          {step === "processing" && (
            <View style={styles.processingWrap}>
              <Spinner color={colors.primary} />
              <Text style={[styles.procTitle, { color: colors.foreground }]}>Processing Payment</Text>
              <Text style={[styles.procStatus, { color: colors.mutedForeground }]}>{PROCESSING_STEPS[procStatus]}</Text>
              <View style={[styles.procAmountBadge, { backgroundColor: colors.muted }]}>
                <Text style={[styles.procAmountText, { color: colors.foreground }]}>₹{total.toLocaleString("en-IN")}</Text>
              </View>
              <Text style={[styles.procHint, { color: colors.mutedForeground }]}>Do not close this window</Text>
            </View>
          )}

          {/* ── FAILED ──────────────────────────────────────────────────────── */}
          {step === "failed" && (
            <View style={styles.processingWrap}>
              <View style={[styles.failCircle]}>
                <Feather name="x" size={42} color="#fff" />
              </View>
              <Text style={[styles.procTitle, { color: colors.foreground }]}>Payment Not Confirmed</Text>
              <Text style={[styles.procStatus, { color: colors.mutedForeground, textAlign: "center", paddingHorizontal: 24 }]}>
                We could not verify your payment with our server. No charge has been applied.
              </Text>
              <Pressable onPress={() => setStep("select")} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.retryBtnText}>Try Again</Text>
              </Pressable>
              <Pressable onPress={onClose} style={[styles.retryBtn, { backgroundColor: colors.muted, marginTop: 8 }]}>
                <Text style={[styles.retryBtnText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>
            </View>
          )}

          {/* ── SUCCESS ─────────────────────────────────────────────────────── */}
          {step === "success" && (
            <View style={styles.successWrap}>
              <Animated.View style={[styles.successCircle, { transform: [{ scale: scaleAnim }] }]}>
                <View style={styles.successInner}>
                  <Feather name="check" size={42} color="#fff" />
                </View>
              </Animated.View>

              <Text style={[styles.successTitle, { color: colors.foreground }]}>Payment Successful!</Text>
              <Text style={[styles.successLabel, { color: colors.mutedForeground }]}>{label}</Text>

              <View style={[styles.receiptCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                {[
                  { label: "Amount Paid",    val: `₹${total.toLocaleString("en-IN")}` },
                  { label: "Payment Method", val: method === "upi" ? (upiApp ? UPI_APPS.find(a => a.id === upiApp)?.name ?? "UPI" : upiId) : method === "card" ? "Card ending " + cardNo.slice(-4) : method === "netbanking" ? bank ?? "Net Banking" : "Ridhi Wallet" },
                  { label: "Transaction ID", val: txnId },
                  { label: "Date & Time",    val: ts },
                  { label: "Status",         val: "✅ Success" },
                ].map(({ label: l, val }, i, arr) => (
                  <View key={l} style={[styles.receiptRow, { borderBottomColor: colors.border, borderBottomWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0 }]}>
                    <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>{l}</Text>
                    <Text style={[styles.receiptVal, { color: colors.foreground }]} numberOfLines={1}>{val}</Text>
                  </View>
                ))}
              </View>

              <Pressable onPress={handleDone} style={[styles.doneBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.doneBtnText}>Done</Text>
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay:        { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  sheetWrap:      { flex: 1, justifyContent: "flex-end" },
  sheet:          { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "92%", overflow: "hidden" },
  handle:         { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 10, marginBottom: 4 },
  sheetHeader:    { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  sheetTitle:     { fontSize: 18, fontFamily: "Inter_700Bold" },
  sheetSublabel:  { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  closeBtn:       { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },

  amountRow:      { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginTop: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  amountLabel:    { fontSize: 11, fontFamily: "Inter_400Regular" },
  amountVal:      { fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 2 },
  amountSub:      { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
  gstVal:         { fontSize: 14, fontFamily: "Inter_600SemiBold", marginTop: 2 },
  totalPill:      { marginTop: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  totalPillText:  { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },

  methodRow:      { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  methodTab:      { flex: 1, flexDirection: "column", alignItems: "center", gap: 4, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  methodTabText:  { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  methodContent:  { paddingHorizontal: 16, paddingTop: 12, gap: 10 },

  fieldLabel:     { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: -4 },
  inputWrap:      { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11 },
  input:          { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  hint:           { fontSize: 11, fontFamily: "Inter_400Regular" },

  upiAppsGrid:    { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  upiAppBtn:      { width: "47%", alignItems: "center", gap: 6, padding: 14, borderRadius: 14, borderWidth: 1 },
  upiAppIcon:     { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  upiAppName:     { fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "center" },

  secureBadge:    { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, borderWidth: 1, padding: 10, marginTop: 4 },
  secureText:     { fontSize: 11, fontFamily: "Inter_400Regular", flex: 1 },

  bankRow:        { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderRadius: 12, padding: 12 },
  bankIcon:       { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  bankName:       { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },

  walletCard:     { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 16, borderWidth: 1, padding: 16 },
  walletIcon:     { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  walletLabel:    { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  walletBal:      { fontSize: 13, fontFamily: "Inter_700Bold", marginTop: 2 },
  sufficientBadge:{ flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  sufficientText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  deductRow:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 12, padding: 14 },
  deductLabel:    { fontSize: 13, fontFamily: "Inter_400Regular" },
  deductVal:      { fontSize: 16, fontFamily: "Inter_700Bold" },

  payBtnWrap:     { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingTop: 10, paddingBottom: Platform.OS === "ios" ? 34 : 16, gap: 8 },
  pgRow:          { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center" },
  pgText:         { fontSize: 11, fontFamily: "Inter_400Regular" },
  payBtn:         { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 16, paddingVertical: 16 },
  payBtnText:     { color: "#fff", fontSize: 17, fontFamily: "Inter_700Bold" },

  processingWrap: { alignItems: "center", justifyContent: "center", paddingVertical: 60, paddingHorizontal: 24, gap: 16 },
  procTitle:      { fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 8 },
  procStatus:     { fontSize: 14, fontFamily: "Inter_400Regular" },
  procAmountBadge:{ paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginTop: 4 },
  procAmountText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  procHint:       { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 8 },

  failCircle:     { width: 90, height: 90, borderRadius: 45, backgroundColor: "#F43F5E", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  retryBtn:       { paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, alignItems: "center", minWidth: 200 },
  retryBtnText:   { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  successWrap:    { alignItems: "center", paddingHorizontal: 20, paddingTop: 30, paddingBottom: Platform.OS === "ios" ? 40 : 24, gap: 12 },
  successCircle:  { width: 90, height: 90, borderRadius: 45, backgroundColor: "#34C75920", alignItems: "center", justifyContent: "center" },
  successInner:   { width: 72, height: 72, borderRadius: 36, backgroundColor: "#34C759", alignItems: "center", justifyContent: "center" },
  successTitle:   { fontSize: 22, fontFamily: "Inter_700Bold", marginTop: 4 },
  successLabel:   { fontSize: 13, fontFamily: "Inter_400Regular" },
  receiptCard:    { width: "100%", borderRadius: 16, borderWidth: 1, overflow: "hidden", marginTop: 8 },
  receiptRow:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 11 },
  receiptLabel:   { fontSize: 12, fontFamily: "Inter_400Regular" },
  receiptVal:     { fontSize: 12, fontFamily: "Inter_600SemiBold", maxWidth: "60%", textAlign: "right" },
  doneBtn:        { width: "100%", borderRadius: 16, paddingVertical: 15, alignItems: "center", marginTop: 8 },
  doneBtnText:    { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
});
