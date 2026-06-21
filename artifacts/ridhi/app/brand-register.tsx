import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors"
import { useTrackScreen } from "@/hooks/useAnalytics";
;
import { GradientButton } from "@/components/GradientButton";
import { SeoHead } from "@/components/SeoHead";
import { PaymentSheet } from "@/components/PaymentSheet";
import { useAuth } from "@/contexts/AuthContext";
const COIN_IMAGE = require("../assets/images/ridhi_coin.png");

const { width } = Dimensions.get("window");

const INDUSTRIES = [
  "Beauty & Skincare", "Fashion & Apparel", "Food & Beverage", "Tech & Gadgets",
  "Travel & Hospitality", "Gaming", "Health & Fitness", "Finance & Fintech",
  "Education & EdTech", "Home & Lifestyle", "Automobiles", "Entertainment",
  "Sports", "E-commerce", "Real Estate", "Other",
];

const PLATFORMS = [
  "Ridhi",
  "Instagram",
  "YouTube",
  "YouTube Shorts",
  "Facebook",
  "Twitter/X",
  "LinkedIn",
  "TikTok",
  "Moj",
  "ShareChat",
  "Snapchat",
  "Pinterest",
  "WhatsApp Status",
  "Threads",
  "Reddit",
];

const BUDGET_RANGES = [
  "₹5K – ₹25K / month",
  "₹25K – ₹1L / month",
  "₹1L – ₹5L / month",
  "₹5L+ / month",
];

const BRAND_SIZES = [
  { label: "Startup",    sub: "1–50 employees",   emoji: "🌱" },
  { label: "SME",        sub: "51–500 employees",  emoji: "🏢" },
  { label: "Enterprise", sub: "500+ employees",    emoji: "🏙️" },
  { label: "Agency",     sub: "Managing clients",  emoji: "🎯" },
];

const BRAND_REGISTRATION_FEE = 1000;
const COIN_TO_RUPEE = 0.8;
const BRAND_REGISTRATION_COINS = Math.ceil(BRAND_REGISTRATION_FEE / COIN_TO_RUPEE);

const TOTAL_STEPS = 4;

export default function BrandRegisterScreen() {
  useTrackScreen("brand_register");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Step 0 — Brand identity
  const [brandName,     setBrandName]     = useState("");
  const [tagline,       setTagline]       = useState("");
  const [industry,      setIndustry]      = useState("");
  const [selectedPlats, setSelectedPlats] = useState<string[]>(["Ridhi"]);

  // Step 1 — Contact details
  const [contactName,  setContactName]  = useState("");
  const [phone,        setPhone]        = useState("");
  const [email,        setEmail]        = useState("");
  const [website,      setWebsite]      = useState("");

  // Step 2 — Company profile
  const [brandSize,   setBrandSize]   = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [gst,         setGst]         = useState("");
  const [pan,         setPan]         = useState("");

  // Step 3 — Payment
  const [payMethod, setPayMethod] = useState<"direct" | "coins" | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showCoinConfirm, setShowCoinConfirm] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  const { user, deductCoins, updateProfile } = useAuth();
  const coinBalance = user?.coins ?? 0;

  const togglePlatform = (p: string) => {
    setSelectedPlats((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const canProceed = [
    brandName.trim().length >= 2 && !!industry,
    contactName.trim().length >= 2 && phone.trim().length >= 10 && email.includes("@"),
    !!brandSize && !!budgetRange,
    paymentDone,
  ][step];

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) { setStep(step + 1); return; }
    // Step 3 = payment already handled, show success
    setSubmitted(true);
  };

  const markBrandRegistered = () => {
    if (user) {
      const activeUntil = new Date();
      activeUntil.setDate(activeUntil.getDate() + 30);
      updateProfile({
        isBrandRegistered: true,
        brandRegisteredAt: new Date().toISOString(),
        brandActiveUntil: activeUntil.toISOString(),
      });
    }
  };

  const handlePaySuccess = () => {
    setShowPayment(false);
    setPaymentDone(true);
    markBrandRegistered();
  };

  const handleCoinPay = async () => {
    if (coinBalance < BRAND_REGISTRATION_COINS) {
      Alert.alert("Insufficient Coins", `You need ${BRAND_REGISTRATION_COINS} coins. Go to Wallet to recharge.`, [
        { text: "Cancel", style: "cancel" },
        { text: "Go to Wallet", onPress: () => router.push("/wallet" as any) },
      ]);
      return;
    }
    setShowCoinConfirm(false);
    const ok = await deductCoins(BRAND_REGISTRATION_COINS);
    if (!ok) {
      Alert.alert("Payment Failed", "Could not deduct coins. Please try again.");
      return;
    }
    setPaymentDone(true);
    markBrandRegistered();
  };

  const progress = (step + 1) / TOTAL_STEPS;

  // ── Success screen ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <LinearGradient colors={["#0A0020", "#1C0040", colors.background]} style={[styles.successBg, { paddingTop: topPad + 20 }]}>
          <View style={styles.successIcon}>
            <Text style={{ fontSize: 52 }}>🎉</Text>
          </View>
          <Text style={styles.successTitle}>Brand Profile Created!</Text>
          <Text style={[styles.successSub, { color: "rgba(255,255,255,0.6)" }]}>
            Welcome to Ridhi Creator Marketplace.{"\n"}Your account is under review — we'll notify you within 24 hours.
          </Text>
        </LinearGradient>

        <View style={{ padding: 24, gap: 14 }}>
          {[
            { icon: "check-circle", text: "Brand profile saved",                  color: "#22C55E" },
            { icon: "clock",        text: "Account under review (24 hrs)",        color: "#FFB800" },
            { icon: "mail",         text: `Confirmation sent to ${email || "your email"}`, color: "#7B2FBE" },
            { icon: "alert-circle", text: "Run 1 campaign every 30 days to stay active", color: "#CA8A04" },
          ].map((item) => (
            <View key={item.text} style={[styles.successRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name={item.icon as any} size={18} color={item.color} />
              <Text style={[styles.successRowText, { color: colors.foreground }]}>{item.text}</Text>
            </View>
          ))}

          <GradientButton
            label="Go to Ads Manager →"
            onPress={() => router.replace("/ads-manager")}
            style={{ marginTop: 8 }}
          />
          <Pressable onPress={() => router.back()} style={styles.skipBtn}>
            <Text style={[styles.skipBtnText, { color: colors.mutedForeground }]}>Back to Marketplace</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <>
      <SeoHead
        title="Brand Registration — Join Ridhi Creator Marketplace | India"
        description="Register your brand on Ridhi Creator Marketplace. Connect with influencers, post deals, and grow your business through India's top social platform."
      />
      <View style={[styles.root, { backgroundColor: colors.background }]}>

      {/* Header */}
      <LinearGradient colors={["#0A0020", "#1C0040", colors.background]} style={[styles.header, { paddingTop: topPad + 8 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => (step > 0 ? setStep(step - 1) : router.back())} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.headerTitle}>Brand Registration</Text>
            <Text style={styles.headerSub}>Step {step + 1} of {TOTAL_STEPS}</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: "#E91E8C" }]} />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>

        {/* ── STEP 0: Brand Identity ─────────────────────────────────────── */}
        {step === 0 && (
          <View style={styles.stepWrap}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Brand Identity</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Tell us about your brand</Text>

            <Field label="Brand Name *" icon="type" color={colors.mutedForeground}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="e.g. Lakme, Swiggy, Noise"
                placeholderTextColor={colors.mutedForeground}
                value={brandName}
                onChangeText={setBrandName}
                maxLength={40}
              />
            </Field>

            <Field label="Tagline" icon="align-left" color={colors.mutedForeground}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="Short tagline or slogan"
                placeholderTextColor={colors.mutedForeground}
                value={tagline}
                onChangeText={setTagline}
                maxLength={60}
              />
            </Field>

            <Field label="Industry *" icon="grid" color={colors.mutedForeground}>
              <View style={styles.chipGrid}>
                {INDUSTRIES.map((ind) => (
                  <Pressable
                    key={ind}
                    onPress={() => setIndustry(ind)}
                    style={[
                      styles.chip,
                      { backgroundColor: industry === ind ? colors.primary : colors.card, borderColor: industry === ind ? colors.primary : colors.border },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: industry === ind ? "#fff" : colors.foreground }]}>{ind}</Text>
                  </Pressable>
                ))}
              </View>
            </Field>

            <Field label="Platforms" icon="share-2" color={colors.mutedForeground}>
              <View style={styles.chipGrid}>
                {PLATFORMS.map((p) => (
                  <Pressable
                    key={p}
                    onPress={() => togglePlatform(p)}
                    style={[
                      styles.chip,
                      { backgroundColor: selectedPlats.includes(p) ? colors.primary : colors.card, borderColor: selectedPlats.includes(p) ? colors.primary : colors.border },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: selectedPlats.includes(p) ? "#fff" : colors.foreground }]}>{p}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={[styles.helperText, { color: colors.mutedForeground }]}>
                {selectedPlats.length} platform{selectedPlats.length !== 1 ? "s" : ""} selected
              </Text>
            </Field>
          </View>
        )}

        {/* ── STEP 1: Contact Details ──────────────────────────────────── */}
        {step === 1 && (
          <View style={styles.stepWrap}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Contact Details</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Who should we reach for deals?</Text>

            <Field label="Contact Person *" icon="user" color={colors.mutedForeground}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="Full name"
                placeholderTextColor={colors.mutedForeground}
                value={contactName}
                onChangeText={setContactName}
              />
            </Field>

            <Field label="Phone *" icon="phone" color={colors.mutedForeground}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="+91 98765 43210"
                placeholderTextColor={colors.mutedForeground}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </Field>

            <Field label="Email *" icon="mail" color={colors.mutedForeground}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="contact@company.com"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Field>

            <Field label="Website" icon="globe" color={colors.mutedForeground}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="https://company.com"
                placeholderTextColor={colors.mutedForeground}
                value={website}
                onChangeText={setWebsite}
                autoCapitalize="none"
              />
            </Field>
          </View>
        )}

        {/* ── STEP 2: Company Profile ────────────────────────────────────── */}
        {step === 2 && (
          <View style={styles.stepWrap}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Company Profile</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Help creators understand your scale</Text>

            <Field label="Company Size *" icon="users" color={colors.mutedForeground}>
              <View style={{ gap: 10 }}>
                {BRAND_SIZES.map((s) => (
                  <Pressable
                    key={s.label}
                    onPress={() => setBrandSize(s.label)}
                    style={[
                      styles.sizeCard,
                      { backgroundColor: colors.card, borderColor: brandSize === s.label ? colors.primary : colors.border },
                    ]}
                  >
                    <Text style={{ fontSize: 28 }}>{s.emoji}</Text>
                    <View>
                      <Text style={[styles.sizeLabel, { color: colors.foreground }]}>{s.label}</Text>
                      <Text style={[styles.sizeSub, { color: colors.mutedForeground }]}>{s.sub}</Text>
                    </View>
                    {brandSize === s.label && (
                      <Feather name="check-circle" size={20} color={colors.primary} />
                    )}
                  </Pressable>
                ))}
              </View>
            </Field>

            <Field label="Monthly Budget Range *" icon="trending-up" color={colors.mutedForeground}>
              <View style={styles.chipGrid}>
                {BUDGET_RANGES.map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setBudgetRange(r)}
                    style={[
                      styles.chip,
                      { backgroundColor: budgetRange === r ? colors.primary : colors.card, borderColor: budgetRange === r ? colors.primary : colors.border },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: budgetRange === r ? "#fff" : colors.foreground }]}>{r}</Text>
                  </Pressable>
                ))}
              </View>
            </Field>

            <Field label="GST Number (optional)" icon="file-text" color={colors.mutedForeground}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="22AAAAA0000A1Z5"
                placeholderTextColor={colors.mutedForeground}
                value={gst}
                onChangeText={(t) => setGst(t.toUpperCase())}
                autoCapitalize="characters"
                maxLength={15}
              />
            </Field>

            <Field label="PAN Number (optional)" icon="credit-card" color={colors.mutedForeground}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="AAAAA0000A"
                placeholderTextColor={colors.mutedForeground}
                value={pan}
                onChangeText={(t) => setPan(t.toUpperCase())}
                autoCapitalize="characters"
                maxLength={10}
              />
            </Field>

            <View style={[styles.infoBox, { backgroundColor: "#22C55E10", borderColor: "#22C55E30" }]}>
              <Feather name="lock" size={14} color="#22C55E" />
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                GST & PAN are optional but help us fast-track verification and unlock invoice generation for your campaigns.
              </Text>
            </View>
          </View>
        )}

        {/* ── STEP 3: Pay & Register ──────────────────────────────────────────── */}
        {step === 3 && (
          <View style={styles.stepWrap}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Complete Registration</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
              One-time fee to activate your brand on Ridhi Creator Marketplace
            </Text>

            {/* Fee card */}
            <View style={[styles.payCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={[styles.payIcon, { backgroundColor: colors.primary + "20" }]}>
                  <Feather name="briefcase" size={24} color={colors.primary} />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground }}>Brand Registration</Text>
                  <Text style={{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Lifetime access · No hidden fees</Text>
                </View>
              </View>
              <View style={[styles.payDivider, { backgroundColor: colors.border }]} />
              <View style={styles.payRow}>
                <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Registration Fee</Text>
                <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground }}>₹{BRAND_REGISTRATION_FEE.toLocaleString("en-IN")}</Text>
              </View>
              <View style={styles.payRow}>
                <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>In Coins</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />
                  <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.primary }}>{BRAND_REGISTRATION_COINS}</Text>
                </View>
              </View>
              <View style={[styles.payDivider, { backgroundColor: colors.border }]} />
              <View style={{ gap: 6 }}>
                {[
                  "Unlimited brand deals",
                  "Creator marketplace access",
                  "Campaign analytics",
                  "Invoice & GST support",
                  "Priority support",
                ].map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Feather name="check" size={13} color={colors.primary} />
                    <Text style={[styles.featureText, { color: colors.mutedForeground }]}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Payment Method */}
            <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground }}>Choose Payment Method</Text>
            <View style={{ gap: 10 }}>
              <Pressable
                onPress={() => setPayMethod("coins")}
                style={[styles.payCard, { backgroundColor: colors.card, borderColor: payMethod === "coins" ? colors.primary : colors.border }]}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={[styles.payIcon, { backgroundColor: "#FFB80020" }]}>
                    <Image source={COIN_IMAGE} style={{ width: 22, height: 22 }} resizeMode="contain" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.payLabel, { color: colors.foreground }]}>Ridhi Coins</Text>
                    <Text style={[styles.paySub, { color: colors.mutedForeground }]}>You have {coinBalance.toLocaleString("en-IN")} coins</Text>
                  </View>
                  <Text style={[styles.payAmount, { color: colors.primary }]}>{BRAND_REGISTRATION_COINS} coins</Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => setPayMethod("direct")}
                style={[styles.payCard, { backgroundColor: colors.card, borderColor: payMethod === "direct" ? colors.primary : colors.border }]}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={[styles.payIcon, { backgroundColor: "#22C55E20" }]}>
                    <Feather name="credit-card" size={22} color="#22C55E" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.payLabel, { color: colors.foreground }]}>Direct Payment</Text>
                    <Text style={[styles.paySub, { color: colors.mutedForeground }]}>UPI, Card, Net Banking via Razorpay</Text>
                  </View>
                  <Text style={[styles.payAmount, { color: colors.primary }]}>₹{BRAND_REGISTRATION_FEE.toLocaleString("en-IN")}</Text>
                </View>
              </Pressable>
            </View>

            {paymentDone && (
              <View style={[styles.infoBox, { backgroundColor: "#22C55E10", borderColor: "#22C55E30" }]}>
                <Feather name="check-circle" size={16} color="#22C55E" />
                <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                  Payment confirmed! Tap "Submit & Create Account" to complete registration.
                </Text>
              </View>
            )}
          </View>
        )}

      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: Platform.OS === "web" ? 24 : insets.bottom + 12, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <GradientButton
          label={step === TOTAL_STEPS - 1 ? "Submit & Create Account" : `Continue  →`}
          onPress={() => {
            if (step === 3 && payMethod === "direct" && !paymentDone) {
              setShowPayment(true);
            } else if (step === 3 && payMethod === "coins" && !paymentDone) {
              setShowCoinConfirm(true);
            } else {
              handleNext();
            }
          }}
          disabled={!canProceed}
        />
      </View>

      {/* Payment Sheet */}
      <PaymentSheet
        visible={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePaySuccess}
        amount={BRAND_REGISTRATION_FEE}
        label="Brand Registration"
        sublabel={`Register ${brandName || "Your Brand"} on Ridhi Creator Marketplace`}
        noGst={false}
      />

      {/* Coin Confirm Modal */}
      {showCoinConfirm && (
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.6)" }]}
          onPress={() => setShowCoinConfirm(false)}
        >
          <View style={[styles.confirmSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Image source={COIN_IMAGE} style={{ width: 28, height: 28 }} resizeMode="contain" />
              <Text style={[styles.confirmTitle, { color: colors.foreground }]}>Confirm Payment</Text>
            </View>
            <Text style={[styles.confirmBody, { color: colors.mutedForeground }]}>
              Pay {BRAND_REGISTRATION_COINS} coins for Brand Registration?
            </Text>
            <View style={[styles.confirmRow, { borderColor: colors.border }]}>
              <Pressable onPress={() => setShowCoinConfirm(false)} style={[styles.confirmBtn, { borderColor: colors.border }]}>
                <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleCoinPay} style={[styles.confirmBtn, { backgroundColor: colors.primary }]}>
                <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" }}>Pay {BRAND_REGISTRATION_COINS} coins</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      )}
    </View>
    </>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function Field({ label, icon, color, children }: { label: string; icon: string; color: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8, width: "100%" }}>
      <View style={styles.fieldLabelRow}>
        <Feather name={icon as any} size={13} color={color} />
        <Text style={[styles.fieldLabel, { color }]}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.1)" },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSub:   { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)", marginTop: 2 },
  progressTrack: { height: 4, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 2, overflow: "hidden" },
  progressFill:  { height: 4, borderRadius: 2 },

  scroll:   { padding: 20 },
  stepWrap: { gap: 20 },
  stepTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  stepSub:   { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20, marginTop: -10 },

  fieldLabelRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  fieldLabel:    { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },

  input: { fontSize: 15, fontFamily: "Inter_400Regular", paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1.5 },

  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip:     { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  chipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  helperText: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 6 },

  sizeCard:  { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 14, borderWidth: 1.5, padding: 14 },
  sizeLabel: { fontSize: 15, fontFamily: "Inter_700Bold" },
  sizeSub:   { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },

  infoBox:  { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, borderWidth: 1, padding: 14 },
  infoText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },

  planCard:  { borderRadius: 18, padding: 18, gap: 14, overflow: "hidden", position: "relative" },
  popularBadge:     { position: "absolute", top: 12, right: 12, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  popularBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.5 },
  planTop:    { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  planName:   { fontSize: 18, fontFamily: "Inter_700Bold" },
  planDeals:  { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  planPrice:  { fontSize: 22, fontFamily: "Inter_700Bold" },
  planPeriod: { fontSize: 12, fontFamily: "Inter_400Regular" },
  planDivider: { height: StyleSheet.hairlineWidth },
  featureRow:  { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  selectedMark:     { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  selectedMarkText: { fontSize: 12, fontFamily: "Inter_700Bold" },

  bottomBar:  { padding: 16, borderTopWidth: StyleSheet.hairlineWidth },

  // Payment
  payCard:    { borderRadius: 16, borderWidth: 1.5, padding: 16, gap: 12 },
  payIcon:    { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  payDivider: { height: StyleSheet.hairlineWidth },
  payRow:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  payLabel:   { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  paySub:     { fontSize: 12, fontFamily: "Inter_400Regular" },
  payAmount:  { fontSize: 14, fontFamily: "Inter_700Bold" },

  // success
  successBg:    { alignItems: "center", gap: 12, padding: 32, paddingBottom: 40 },
  successIcon:  { width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  successSub:   { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  successRow:   { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14 },
  successRowText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  skipBtn:      { alignItems: "center", paddingVertical: 12 },
  skipBtnText:  { fontSize: 14, fontFamily: "Inter_400Regular" },

  // Modal
  modalOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  confirmSheet: { borderRadius: 24, padding: 28, gap: 14, width: "100%", maxWidth: 340, borderWidth: 1 },
  confirmTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  confirmBody: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  confirmRow: { flexDirection: "row", gap: 10, width: "100%", marginTop: 4 },
  confirmBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: "center" },
});