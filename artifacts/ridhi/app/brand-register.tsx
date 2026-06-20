import React, { useState } from "react";
import {
  Dimensions,
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

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "₹2,999",
    period: "/month",
    deals: "Up to 3 active deals",
    color: "#7B2FBE",
    features: ["3 active campaigns", "20 creator slots/deal", "Basic analytics", "Email support"],
    popular: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: "₹7,999",
    period: "/month",
    deals: "Up to 10 active deals",
    color: "#E91E8C",
    features: ["10 active campaigns", "50 creator slots/deal", "Advanced analytics", "Priority support", "Featured badge"],
    popular: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: "₹19,999",
    period: "/month",
    deals: "Unlimited deals",
    color: "#FF6B35",
    features: ["Unlimited campaigns", "Unlimited slots", "Real-time analytics", "Dedicated account manager", "Homepage feature spot"],
    popular: false,
  },
];

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

  // Step 3 — Plan
  const [selectedPlan, setSelectedPlan] = useState("growth");

  const togglePlatform = (p: string) => {
    setSelectedPlats((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const canProceed = [
    brandName.trim().length >= 2 && !!industry,
    contactName.trim().length >= 2 && phone.trim().length >= 10 && email.includes("@"),
    !!brandSize && !!budgetRange,
    !!selectedPlan,
  ][step];

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) { setStep(step + 1); return; }
    setSubmitted(true);
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
          ].map((item) => (
            <View key={item.text} style={[styles.successRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name={item.icon as any} size={18} color={item.color} />
              <Text style={[styles.successRowText, { color: colors.foreground }]}>{item.text}</Text>
            </View>
          ))}

          <GradientButton
            label="Post Your First Deal →"
            onPress={() => router.replace("/brand-post-deal")}
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingBottom: (Platform.OS === "web" ? 84 : insets.bottom) + 40 }]}
      >

        {/* ── STEP 0: Brand Identity ───────────────────────────────────────── */}
        {step === 0 && (
          <View style={styles.stepWrap}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Tell us about your brand</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>This is what creators will see when browsing your campaigns</Text>

            <Field label="Brand / Company Name *" icon="briefcase" color={colors.primary}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: brandName ? colors.primary : colors.border, backgroundColor: colors.card }]}
                placeholder="e.g. boAt Lifestyle, Nykaa, CRED…"
                placeholderTextColor={colors.mutedForeground}
                value={brandName}
                onChangeText={setBrandName}
              />
            </Field>

            <Field label="Tagline (optional)" icon="type" color={colors.mutedForeground}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="e.g. Feel the bass. Live the beat."
                placeholderTextColor={colors.mutedForeground}
                value={tagline}
                onChangeText={setTagline}
                maxLength={80}
              />
            </Field>

            <Field label="Industry / Category *" icon="tag" color={colors.primary}>
              <View style={styles.chipGrid}>
                {INDUSTRIES.map((ind) => (
                  <Pressable
                    key={ind}
                    onPress={() => setIndustry(ind)}
                    style={[
                      styles.chip,
                      { borderColor: industry === ind ? "#E91E8C" : colors.border },
                      industry === ind && { backgroundColor: "#E91E8C18" },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: industry === ind ? "#E91E8C" : colors.mutedForeground }]}>{ind}</Text>
                  </Pressable>
                ))}
              </View>
            </Field>

            <Field label="Platforms you want creators to post on" icon="share-2" color={colors.primary}>
              <View style={styles.chipGrid}>
                {PLATFORMS.map((p) => {
                  const on = selectedPlats.includes(p);
                  return (
                    <Pressable
                      key={p}
                      onPress={() => togglePlatform(p)}
                      style={[styles.chip, { borderColor: on ? "#7B2FBE" : colors.border }, on && { backgroundColor: "#7B2FBE18" }]}
                    >
                      <Text style={[styles.chipText, { color: on ? "#7B2FBE" : colors.mutedForeground }]}>{p}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Field>
          </View>
        )}

        {/* ── STEP 1: Contact Details ──────────────────────────────────────── */}
        {step === 1 && (
          <View style={styles.stepWrap}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Your contact details</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Used for campaign communication and account verification</Text>

            <Field label="Contact Person Name *" icon="user" color={colors.primary}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: contactName ? colors.primary : colors.border, backgroundColor: colors.card }]}
                placeholder="Full name of the marketing / brand person"
                placeholderTextColor={colors.mutedForeground}
                value={contactName}
                onChangeText={setContactName}
              />
            </Field>

            <Field label="Phone Number *" icon="phone" color={colors.primary}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: phone.length >= 10 ? colors.primary : colors.border, backgroundColor: colors.card }]}
                placeholder="+91 98765 43210"
                placeholderTextColor={colors.mutedForeground}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={13}
              />
            </Field>

            <Field label="Business Email *" icon="mail" color={colors.primary}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: email.includes("@") ? colors.primary : colors.border, backgroundColor: colors.card }]}
                placeholder="marketing@yourbrand.com"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Field>

            <Field label="Website (optional)" icon="globe" color={colors.mutedForeground}>
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.card }]}
                placeholder="https://yourbrand.com"
                placeholderTextColor={colors.mutedForeground}
                value={website}
                onChangeText={setWebsite}
                autoCapitalize="none"
              />
            </Field>

            <View style={[styles.infoBox, { backgroundColor: "#7B2FBE10", borderColor: "#7B2FBE30" }]}>
              <Feather name="shield" size={14} color="#7B2FBE" />
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                Your contact details are never shared with creators. Only your brand name, category, and campaign details are visible.
              </Text>
            </View>
          </View>
        )}

        {/* ── STEP 2: Company Profile + Verification ───────────────────────── */}
        {step === 2 && (
          <View style={styles.stepWrap}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Company profile</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Helps us match you with the right creator tier and verify your business</Text>

            <Field label="Brand Size *" icon="users" color={colors.primary}>
              <View style={{ gap: 10 }}>
                {BRAND_SIZES.map((s) => (
                  <Pressable
                    key={s.label}
                    onPress={() => setBrandSize(s.label)}
                    style={[
                      styles.sizeCard,
                      { backgroundColor: colors.card, borderColor: brandSize === s.label ? "#E91E8C" : colors.border },
                      brandSize === s.label && { backgroundColor: "#E91E8C08" },
                    ]}
                  >
                    <Text style={{ fontSize: 24 }}>{s.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.sizeLabel, { color: colors.foreground }]}>{s.label}</Text>
                      <Text style={[styles.sizeSub, { color: colors.mutedForeground }]}>{s.sub}</Text>
                    </View>
                    {brandSize === s.label && <Feather name="check-circle" size={18} color="#E91E8C" />}
                  </Pressable>
                ))}
              </View>
            </Field>

            <Field label="Monthly Creator Budget *" icon="dollar-sign" color={colors.primary}>
              <View style={styles.chipGrid}>
                {BUDGET_RANGES.map((b) => (
                  <Pressable
                    key={b}
                    onPress={() => setBudgetRange(b)}
                    style={[
                      styles.chip,
                      { borderColor: budgetRange === b ? "#7B2FBE" : colors.border },
                      budgetRange === b && { backgroundColor: "#7B2FBE18" },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: budgetRange === b ? "#7B2FBE" : colors.mutedForeground }]}>{b}</Text>
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

        {/* ── STEP 3: Choose Plan ──────────────────────────────────────────── */}
        {step === 3 && (
          <View style={styles.stepWrap}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Choose your plan</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Start free for 14 days — no credit card required</Text>

            <View style={{ gap: 14 }}>
              {PLANS.map((plan) => {
                const active = selectedPlan === plan.id;
                return (
                  <Pressable
                    key={plan.id}
                    onPress={() => setSelectedPlan(plan.id)}
                    style={[
                      styles.planCard,
                      { backgroundColor: colors.card, borderColor: active ? plan.color : colors.border, borderWidth: active ? 2 : 1 },
                    ]}
                  >
                    {plan.popular && (
                      <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
                        <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                      </View>
                    )}
                    {active && (
                      <LinearGradient
                        colors={[plan.color + "10", "transparent"]}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <View style={styles.planTop}>
                      <View>
                        <Text style={[styles.planName, { color: colors.foreground }]}>{plan.name}</Text>
                        <Text style={[styles.planDeals, { color: colors.mutedForeground }]}>{plan.deals}</Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price}</Text>
                        <Text style={[styles.planPeriod, { color: colors.mutedForeground }]}>{plan.period}</Text>
                      </View>
                    </View>
                    <View style={[styles.planDivider, { backgroundColor: colors.border }]} />
                    <View style={{ gap: 8 }}>
                      {plan.features.map((f) => (
                        <View key={f} style={styles.featureRow}>
                          <Feather name="check" size={13} color={plan.color} />
                          <Text style={[styles.featureText, { color: colors.mutedForeground }]}>{f}</Text>
                        </View>
                      ))}
                    </View>
                    {active && (
                      <View style={[styles.selectedMark, { borderColor: plan.color, backgroundColor: plan.color + "15" }]}>
                        <Feather name="check-circle" size={14} color={plan.color} />
                        <Text style={[styles.selectedMarkText, { color: plan.color }]}>Selected</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            <View style={[styles.infoBox, { backgroundColor: "#FFB80010", borderColor: "#FFB80030", marginTop: 8 }]}>
              <Feather name="gift" size={14} color="#FFB800" />
              <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                All plans include a 14-day free trial. Cancel anytime — no lock-in.
              </Text>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: Platform.OS === "web" ? 24 : insets.bottom + 12, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <GradientButton
          label={step === TOTAL_STEPS - 1 ? "Submit & Create Account" : `Continue  →`}
          onPress={handleNext}
          disabled={!canProceed}
        />
      </View>
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

  // success
  successBg:    { alignItems: "center", gap: 12, padding: 32, paddingBottom: 40 },
  successIcon:  { width: 90, height: 90, borderRadius: 45, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  successTitle: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  successSub:   { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  successRow:   { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14 },
  successRowText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  skipBtn:      { alignItems: "center", paddingVertical: 12 },
  skipBtnText:  { fontSize: 14, fontFamily: "Inter_400Regular" },
});
