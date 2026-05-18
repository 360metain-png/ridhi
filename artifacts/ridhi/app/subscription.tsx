import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

// ── Plans ─────────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "free", name: "Free", price: "₹0", period: "forever", color: "#888",
    gradient: ["#555", "#333"] as const,
    features: ["Basic profile","20 coins/day","Standard feed","Basic chat","5 stories/day"],
    missing: ["No audio/video calls","No VIP badge","No exclusive content","Limited communities"],
  },
  {
    id: "silver", name: "Silver", price: "₹99", period: "/month", color: "#A0A0A0",
    gradient: ["#9E9E9E", "#616161"] as const, popular: false,
    features: ["50 coins/day","5 random calls/day","Silver VIP badge","Priority feed","Unlimited stories","20 communities","Chat translations"],
    missing: ["No video calls","Limited gifts"],
  },
  {
    id: "gold", name: "Gold", price: "₹249", period: "/month", color: "#FFB800",
    gradient: ["#FFB800", "#FF8F00"] as const, popular: true,
    features: ["150 coins/day","Unlimited random calls","Gold VIP badge","AI feed recommendations","Unlimited stories","Unlimited communities","AI captions & translations","Creator fund access","Priority support","Run Ad Promotions"],
    missing: [],
  },
  {
    id: "vip", name: "VIP Diamond", price: "₹599", period: "/month", color: "#7B2FBE",
    gradient: ["#E91E8C", "#7B2FBE"] as const,
    features: ["500 coins/day","Unlimited everything","Diamond VIP badge","Exclusive VIP content","Featured creator status","Advanced analytics","Custom profile effects","Dedicated account manager","Early feature access","Ad-free experience","Priority Ad placement"],
    missing: [],
  },
];

const FAN_TIERS = [
  { id: "supporter", name: "Supporter",  price: "₹49/month",  color: "#34C759", icon: "heart",
    perks: ["Exclusive badge","Creator posts access","Monthly shoutout"] },
  { id: "superfan",  name: "Super Fan",  price: "₹149/month", color: "#FF9500", icon: "star",
    perks: ["All Supporter perks","Direct message creator","Exclusive live access","Monthly coin rewards"] },
  { id: "vipfan",    name: "VIP Fan",    price: "₹399/month", color: "#E91E8C", icon: "award",
    perks: ["All Super Fan perks","1:1 video call/month","Custom fan badge","Featured in creator posts"] },
];

// ── Boost / Promote data ──────────────────────────────────────────────────────
type Objective = "reach" | "leads" | "reactions";
const OBJECTIVES: { id: Objective; icon: string; label: string; sub: string; color: string; accent: string }[] = [
  { id: "reach",     icon: "globe",      label: "Reach",     color: "#7B2FBE", accent: "#7B2FBE20",
    sub: "Show your profile/post to thousands of new users across India" },
  { id: "leads",     icon: "user-plus",  label: "Leads",     color: "#2196F3", accent: "#2196F320",
    sub: "Drive profile visits, follow requests and DM conversations" },
  { id: "reactions", icon: "heart",      label: "Reactions", color: "#E91E8C", accent: "#E91E8C20",
    sub: "Maximise likes, comments and reshares on your promoted post" },
];

const CITIES = ["Anywhere in India","Delhi","Mumbai","Bangalore","Chennai","Hyderabad","Pune","Kolkata","Jaipur","Ahmedabad","Kochi"];
const INTERESTS_LIST = ["Music","Travel","Gaming","Food","Fashion","Sports","Tech","Fitness","Movies","Comedy","Dance","Art"];
const BUDGETS = [
  { label: "₹50/day",  value: 50,  reach: "800–1.2K" },
  { label: "₹100/day", value: 100, reach: "2–3.5K" },
  { label: "₹250/day", value: 250, reach: "6–9K" },
  { label: "₹500/day", value: 500, reach: "14–20K" },
];
const DURATIONS = [
  { label: "1 day",   days: 1 },
  { label: "3 days",  days: 3 },
  { label: "7 days",  days: 7 },
  { label: "14 days", days: 14 },
];

function estimateReach(budgetVal: number, days: number, obj: Objective) {
  const mult = obj === "reach" ? 1 : obj === "reactions" ? 0.65 : 0.5;
  const baseRange = BUDGETS.find(b => b.value === budgetVal)?.reach ?? "800–1.2K";
  const [lo, hi] = baseRange.replace("K","").split("–").map(Number);
  const totalLo = Math.round(lo * days * mult * 1000 / 1000);
  const totalHi = Math.round(hi * days * mult * 1000 / 1000);
  if (totalHi >= 1000) return `${(totalLo/1000).toFixed(0)}K–${(totalHi/1000).toFixed(0)}K people`;
  return `${totalLo}–${totalHi} people`;
}

// ── Boost Flow (3 steps) ──────────────────────────────────────────────────────
function BoostSection({ colors }: { colors: ReturnType<typeof useColors> }) {
  const [step, setStep] = useState<1 | 2 | 3 | "done">(1);
  const [objective,  setObjective]  = useState<Objective>("reach");
  const [genderPick, setGenderPick] = useState<"all" | "male" | "female">("all");
  const [agePick,    setAgePick]    = useState<"18-24" | "25-34" | "35-44" | "all">("all");
  const [cityPick,   setCityPick]   = useState(CITIES[0]);
  const [interests,  setInterests]  = useState<string[]>([]);
  const [budget,     setBudget]     = useState(100);
  const [duration,   setDuration]   = useState(3);
  const [promoted,   setPromoted]   = useState<"profile" | "post">("profile");

  const obj = OBJECTIVES.find(o => o.id === objective)!;
  const totalBudget = budget * duration;

  const toggleInterest = (i: string) =>
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  if (step === "done") {
    return (
      <View style={[styles.doneCtr, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={styles.doneCircle}>
          <Feather name="check" size={32} color="#fff" />
        </LinearGradient>
        <Text style={[styles.doneTitle, { color: colors.foreground }]}>Promotion Launched! 🎉</Text>
        <Text style={[styles.doneSub, { color: colors.mutedForeground }]}>
          Your {obj.label} campaign is live. We'll notify you when it reaches your estimated audience.
        </Text>
        <View style={[styles.doneStats, { backgroundColor: colors.muted }]}>
          {[
            { label: "Objective",  val: obj.label },
            { label: "Est. Reach", val: estimateReach(budget, duration, objective) },
            { label: "Budget",     val: `₹${totalBudget}` },
            { label: "Duration",   val: `${duration} day${duration > 1 ? "s" : ""}` },
          ].map(({ label, val }) => (
            <View key={label} style={styles.doneStat}>
              <Text style={[styles.doneStatVal, { color: colors.primary }]}>{val}</Text>
              <Text style={[styles.doneStatLabel, { color: colors.mutedForeground }]}>{label}</Text>
            </View>
          ))}
        </View>
        <Pressable onPress={() => setStep(1)} style={[styles.doneBtn, { borderColor: colors.border }]}>
          <Text style={[styles.doneBtnText, { color: colors.foreground }]}>Create Another Boost</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.boostWrap}>
      {/* Progress bar */}
      <View style={styles.progressRow}>
        {[1, 2, 3].map((s) => (
          <View key={s} style={styles.progressStep}>
            <View style={[
              styles.progressDot,
              { backgroundColor: s <= step ? colors.primary : colors.muted,
                borderColor: s === step ? colors.primary : "transparent" }
            ]}>
              {s < step
                ? <Feather name="check" size={11} color="#fff" />
                : <Text style={[styles.progressNum, { color: s <= step ? "#fff" : colors.mutedForeground }]}>{s}</Text>}
            </View>
            {s < 3 && <View style={[styles.progressLine, { backgroundColor: s < step ? colors.primary : colors.muted }]} />}
          </View>
        ))}
      </View>

      {/* ── Step 1: Choose Objective ── */}
      {step === 1 && (
        <View style={styles.stepBlock}>
          <Text style={[styles.stepTitle, { color: colors.foreground }]}>Choose Your Goal</Text>
          <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>What do you want this promotion to achieve?</Text>
          {OBJECTIVES.map((o) => (
            <Pressable
              key={o.id}
              onPress={() => setObjective(o.id)}
              style={[styles.objCard, {
                backgroundColor: objective === o.id ? o.accent : colors.card,
                borderColor: objective === o.id ? o.color : colors.border,
                borderWidth: objective === o.id ? 2 : 1,
              }]}
            >
              <View style={[styles.objIcon, { backgroundColor: o.accent }]}>
                <Feather name={o.icon as any} size={22} color={o.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.objLabel, { color: colors.foreground }]}>{o.label}</Text>
                <Text style={[styles.objSub, { color: colors.mutedForeground }]}>{o.sub}</Text>
              </View>
              {objective === o.id && (
                <View style={[styles.objCheck, { backgroundColor: o.color }]}>
                  <Feather name="check" size={12} color="#fff" />
                </View>
              )}
            </Pressable>
          ))}

          {/* What to promote */}
          <Text style={[styles.miniLabel, { color: colors.foreground }]}>Promote</Text>
          <View style={styles.promoteRow}>
            {(["profile", "post"] as const).map((p) => (
              <Pressable
                key={p}
                onPress={() => setPromoted(p)}
                style={[styles.promoteBtn, {
                  flex: 1,
                  backgroundColor: promoted === p ? colors.primary : colors.card,
                  borderColor: promoted === p ? colors.primary : colors.border,
                }]}
              >
                <Feather name={p === "profile" ? "user" : "image"} size={16} color={promoted === p ? "#fff" : colors.mutedForeground} />
                <Text style={[styles.promoteBtnText, { color: promoted === p ? "#fff" : colors.foreground }]}>
                  {p === "profile" ? "My Profile" : "A Post"}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={() => setStep(2)} style={styles.nextBtn}>
            <LinearGradient colors={["#7B2FBE", "#E91E8C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
              <Text style={styles.nextBtnText}>Next: Target Audience</Text>
              <Feather name="arrow-right" size={16} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>
      )}

      {/* ── Step 2: Target Audience ── */}
      {step === 2 && (
        <View style={styles.stepBlock}>
          <Text style={[styles.stepTitle, { color: colors.foreground }]}>Target Audience</Text>
          <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Define who sees your promotion</Text>

          {/* Gender */}
          <Text style={[styles.miniLabel, { color: colors.foreground }]}>Gender</Text>
          <View style={styles.chipRow}>
            {(["all", "male", "female"] as const).map((g) => (
              <Pressable
                key={g}
                onPress={() => setGenderPick(g)}
                style={[styles.chip, {
                  backgroundColor: genderPick === g ? colors.primary : colors.card,
                  borderColor: genderPick === g ? colors.primary : colors.border,
                }]}
              >
                <Text style={[styles.chipText, { color: genderPick === g ? "#fff" : colors.foreground }]}>
                  {g === "all" ? "All" : g === "male" ? "Men" : "Women"}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Age */}
          <Text style={[styles.miniLabel, { color: colors.foreground }]}>Age Range</Text>
          <View style={styles.chipRow}>
            {(["all", "18-24", "25-34", "35-44"] as const).map((a) => (
              <Pressable
                key={a}
                onPress={() => setAgePick(a)}
                style={[styles.chip, {
                  backgroundColor: agePick === a ? colors.primary : colors.card,
                  borderColor: agePick === a ? colors.primary : colors.border,
                }]}
              >
                <Text style={[styles.chipText, { color: agePick === a ? "#fff" : colors.foreground }]}>
                  {a === "all" ? "Any Age" : a}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* City */}
          <Text style={[styles.miniLabel, { color: colors.foreground }]}>City / Region</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={[styles.chipRow, { flexWrap: "nowrap" }]}>
              {CITIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCityPick(c)}
                  style={[styles.chip, {
                    backgroundColor: cityPick === c ? colors.primary : colors.card,
                    borderColor: cityPick === c ? colors.primary : colors.border,
                  }]}
                >
                  <Text style={[styles.chipText, { color: cityPick === c ? "#fff" : colors.foreground }]}>{c}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Interests */}
          <Text style={[styles.miniLabel, { color: colors.foreground }]}>Interests (optional)</Text>
          <View style={styles.chipRow}>
            {INTERESTS_LIST.map((interest) => {
              const sel = interests.includes(interest);
              return (
                <Pressable
                  key={interest}
                  onPress={() => toggleInterest(interest)}
                  style={[styles.chip, {
                    backgroundColor: sel ? colors.secondary + "30" : colors.card,
                    borderColor: sel ? colors.secondary : colors.border,
                  }]}
                >
                  <Text style={[styles.chipText, { color: sel ? colors.secondary : colors.foreground }]}>{interest}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.navRow}>
            <Pressable onPress={() => setStep(1)} style={[styles.backStepBtn, { borderColor: colors.border }]}>
              <Feather name="arrow-left" size={16} color={colors.foreground} />
              <Text style={[styles.backStepText, { color: colors.foreground }]}>Back</Text>
            </Pressable>
            <Pressable onPress={() => setStep(3)} style={{ flex: 1 }}>
              <LinearGradient colors={["#7B2FBE", "#E91E8C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
                <Text style={styles.nextBtnText}>Next: Budget</Text>
                <Feather name="arrow-right" size={16} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      )}

      {/* ── Step 3: Budget & Duration ── */}
      {step === 3 && (
        <View style={styles.stepBlock}>
          <Text style={[styles.stepTitle, { color: colors.foreground }]}>Budget & Duration</Text>
          <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Set your daily spend and how long to run</Text>

          {/* Daily budget */}
          <Text style={[styles.miniLabel, { color: colors.foreground }]}>Daily Budget</Text>
          <View style={styles.chipRow}>
            {BUDGETS.map((b) => (
              <Pressable
                key={b.value}
                onPress={() => setBudget(b.value)}
                style={[styles.budgetChip, {
                  backgroundColor: budget === b.value ? colors.primary : colors.card,
                  borderColor: budget === b.value ? colors.primary : colors.border,
                }]}
              >
                <Text style={[styles.budgetChipLabel, { color: budget === b.value ? "#fff" : colors.foreground }]}>{b.label}</Text>
                <Text style={[styles.budgetChipSub, { color: budget === b.value ? "rgba(255,255,255,0.75)" : colors.mutedForeground }]}>~{b.reach}</Text>
              </Pressable>
            ))}
          </View>

          {/* Duration */}
          <Text style={[styles.miniLabel, { color: colors.foreground }]}>Duration</Text>
          <View style={styles.chipRow}>
            {DURATIONS.map((d) => (
              <Pressable
                key={d.days}
                onPress={() => setDuration(d.days)}
                style={[styles.chip, {
                  backgroundColor: duration === d.days ? colors.primary : colors.card,
                  borderColor: duration === d.days ? colors.primary : colors.border,
                }]}
              >
                <Text style={[styles.chipText, { color: duration === d.days ? "#fff" : colors.foreground }]}>{d.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Estimate card */}
          <LinearGradient colors={["#7B2FBE20", "#E91E8C20"]} style={[styles.estimateCard, { borderColor: "#7B2FBE30" }]}>
            <View style={styles.estimateRow}>
              <View style={styles.estimateStat}>
                <Feather name="users" size={18} color="#7B2FBE" />
                <Text style={[styles.estimateVal, { color: colors.foreground }]}>{estimateReach(budget, duration, objective)}</Text>
                <Text style={[styles.estimateLabel, { color: colors.mutedForeground }]}>Est. Reach</Text>
              </View>
              <View style={[styles.estimateDivider, { backgroundColor: colors.border }]} />
              <View style={styles.estimateStat}>
                <Feather name="zap" size={18} color="#E91E8C" />
                <Text style={[styles.estimateVal, { color: colors.foreground }]}>₹{totalBudget}</Text>
                <Text style={[styles.estimateLabel, { color: colors.mutedForeground }]}>Total Cost</Text>
              </View>
              <View style={[styles.estimateDivider, { backgroundColor: colors.border }]} />
              <View style={styles.estimateStat}>
                <Feather name={obj.icon as any} size={18} color={obj.color} />
                <Text style={[styles.estimateVal, { color: colors.foreground }]}>{obj.label}</Text>
                <Text style={[styles.estimateLabel, { color: colors.mutedForeground }]}>Objective</Text>
              </View>
            </View>
            <Text style={[styles.estimateNote, { color: colors.mutedForeground }]}>
              Estimates are based on your targeting. Actual results may vary.
            </Text>
          </LinearGradient>

          {/* Summary */}
          <View style={[styles.summaryCard, { backgroundColor: colors.muted }]}>
            <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Campaign Summary</Text>
            {[
              { label: "Promote",   val: promoted === "profile" ? "My Profile" : "A Post" },
              { label: "Objective", val: obj.label },
              { label: "Gender",    val: genderPick === "all" ? "All genders" : genderPick === "male" ? "Men" : "Women" },
              { label: "Age",       val: agePick === "all" ? "All ages" : agePick },
              { label: "City",      val: cityPick },
              { label: "Duration",  val: `${duration} day${duration > 1 ? "s" : ""}` },
            ].map(({ label, val }) => (
              <View key={label} style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{label}</Text>
                <Text style={[styles.summaryVal, { color: colors.foreground }]}>{val}</Text>
              </View>
            ))}
          </View>

          <View style={styles.navRow}>
            <Pressable onPress={() => setStep(2)} style={[styles.backStepBtn, { borderColor: colors.border }]}>
              <Feather name="arrow-left" size={16} color={colors.foreground} />
              <Text style={[styles.backStepText, { color: colors.foreground }]}>Back</Text>
            </Pressable>
            <Pressable onPress={() => setStep("done")} style={{ flex: 1 }}>
              <LinearGradient colors={["#7B2FBE", "#E91E8C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextBtnGrad}>
                <Feather name="zap" size={16} color="#fff" />
                <Text style={styles.nextBtnText}>Launch for ₹{totalBudget}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
type Section = "plans" | "fan" | "boost";

export default function SubscriptionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeSection, setActiveSection] = useState<Section>("plans");
  const [selectedPlan,  setSelectedPlan]  = useState("free");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={[styles.topGrad, { paddingTop: topPad + 10 }]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Premium & Promotions</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.headerSub}>Unlock the full Ridhi experience & grow your audience</Text>

        {/* 3-tab switcher */}
        <View style={[styles.sectionTabs, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          {(["plans", "boost", "fan"] as Section[]).map((s) => {
            const labels: Record<Section, string> = { plans: "VIP Plans", boost: "Boost & Ads", fan: "Fan Clubs" };
            return (
              <Pressable
                key={s}
                onPress={() => setActiveSection(s)}
                style={[styles.sectionTab, activeSection === s && styles.sectionTabActive]}
              >
                <Text style={[styles.sectionTabText, activeSection === s && styles.sectionTabTextActive]}>
                  {labels[s]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* ── VIP Plans ── */}
        {activeSection === "plans" && (
          <View style={styles.plansSection}>
            {PLANS.map((plan) => (
              <Pressable
                key={plan.id}
                onPress={() => setSelectedPlan(plan.id)}
                style={[styles.planCard, {
                  backgroundColor: colors.card,
                  borderColor: selectedPlan === plan.id ? plan.color : colors.border,
                  borderWidth: selectedPlan === plan.id ? 2 : 1,
                }]}
              >
                {plan.popular && (
                  <LinearGradient colors={[plan.gradient[0], plan.gradient[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.popularBadge}>
                    <Text style={styles.popularText}>⭐ Most Popular</Text>
                  </LinearGradient>
                )}
                <View style={styles.planHeader}>
                  <LinearGradient colors={[plan.gradient[0], plan.gradient[1]]} style={styles.planIconCircle}>
                    <Feather name="award" size={20} color="#fff" />
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.planName, { color: colors.foreground }]}>{plan.name}</Text>
                    <View style={styles.priceRow}>
                      <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price}</Text>
                      <Text style={[styles.planPeriod, { color: colors.mutedForeground }]}>{plan.period}</Text>
                    </View>
                  </View>
                  {selectedPlan === plan.id && (
                    <View style={[styles.checkCircle, { backgroundColor: plan.color }]}>
                      <Feather name="check" size={14} color="#fff" />
                    </View>
                  )}
                </View>
                <View style={styles.featuresList}>
                  {plan.features.map((f) => (
                    <View key={f} style={styles.featureRow}>
                      <Feather name="check-circle" size={14} color="#34C759" />
                      <Text style={[styles.featureText, { color: colors.foreground }]}>{f}</Text>
                    </View>
                  ))}
                  {plan.missing.map((f) => (
                    <View key={f} style={styles.featureRow}>
                      <Feather name="x-circle" size={14} color={colors.mutedForeground} />
                      <Text style={[styles.featureText, { color: colors.mutedForeground }]}>{f}</Text>
                    </View>
                  ))}
                </View>
                {plan.id !== "free" && (
                  <LinearGradient colors={[plan.gradient[0], plan.gradient[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.subscribeBtn}>
                    <Text style={styles.subscribeBtnText}>
                      {selectedPlan === plan.id ? "Current Plan" : `Subscribe — ${plan.price}${plan.period}`}
                    </Text>
                  </LinearGradient>
                )}
              </Pressable>
            ))}

            {/* Payment methods */}
            <View style={[styles.paymentInfo, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.paymentTitle, { color: colors.foreground }]}>Payment Methods</Text>
              <View style={styles.paymentMethods}>
                {[
                  { label: "UPI",       icon: "smartphone", color: "#00BCD4" },
                  { label: "Razorpay",  icon: "credit-card",color: "#2962FF" },
                  { label: "Google Pay",icon: "globe",       color: "#34A853" },
                  { label: "PhonePe",   icon: "zap",         color: "#5F259F" },
                  { label: "Paytm",     icon: "shopping-bag",color: "#00BAF2" },
                ].map((pm) => (
                  <View key={pm.label} style={[styles.paymentMethod, { backgroundColor: colors.muted }]}>
                    <Feather name={pm.icon as any} size={16} color={pm.color} />
                    <Text style={[styles.paymentMethodLabel, { color: colors.foreground }]}>{pm.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ── Boost & Ads ── */}
        {activeSection === "boost" && (
          <View style={{ padding: 16 }}>
            {/* Instagram-style hero */}
            <LinearGradient colors={["#7B2FBE15", "#E91E8C10"]} style={[styles.boostHero, { borderColor: "#7B2FBE30" }]}>
              <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={styles.boostHeroIcon}>
                <Feather name="trending-up" size={26} color="#fff" />
              </LinearGradient>
              <Text style={[styles.boostHeroTitle, { color: colors.foreground }]}>Reach More People</Text>
              <Text style={[styles.boostHeroSub, { color: colors.mutedForeground }]}>
                Promote your profile or posts to thousands of targeted Ridhi users — just like Instagram Ads, built for India.
              </Text>
              <View style={styles.boostStatRow}>
                {[
                  { val: "1.4Cr+", label: "Active Users" },
                  { val: "₹50/day", label: "Start From" },
                  { val: "3 Goals", label: "Objectives" },
                ].map(({ val, label }) => (
                  <View key={label} style={styles.boostStatItem}>
                    <Text style={[styles.boostStatVal, { color: colors.primary }]}>{val}</Text>
                    <Text style={[styles.boostStatLabel, { color: colors.mutedForeground }]}>{label}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>

            <BoostSection colors={colors} />
          </View>
        )}

        {/* ── Fan Clubs ── */}
        {activeSection === "fan" && (
          <View style={styles.fanSection}>
            <Text style={[styles.fanDesc, { color: colors.mutedForeground }]}>
              Become a fan member of your favourite creators and unlock exclusive content, perks and direct access.
            </Text>
            {FAN_TIERS.map((tier) => (
              <View key={tier.id} style={[styles.fanCard, { backgroundColor: colors.card, borderColor: tier.color + "50" }]}>
                <LinearGradient colors={[tier.color + "20", "transparent"]} style={styles.fanCardGrad} />
                <View style={styles.fanCardHeader}>
                  <View style={[styles.fanIconCircle, { backgroundColor: tier.color + "20" }]}>
                    <Feather name={tier.icon as any} size={22} color={tier.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fanName, { color: colors.foreground }]}>{tier.name}</Text>
                    <Text style={[styles.fanPrice, { color: tier.color }]}>{tier.price}</Text>
                  </View>
                  <Pressable style={[styles.joinBtn, { backgroundColor: tier.color }]}>
                    <Text style={styles.joinBtnText}>Join</Text>
                  </Pressable>
                </View>
                <View style={styles.fanPerks}>
                  {tier.perks.map((p) => (
                    <View key={p} style={styles.perkRow}>
                      <Feather name="check" size={13} color={tier.color} />
                      <Text style={[styles.perkText, { color: colors.foreground }]}>{p}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
            <View style={[styles.creatorCTA, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
              <Feather name="zap" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.ctaTitle, { color: colors.foreground }]}>Are you a Creator?</Text>
                <Text style={[styles.ctaSub, { color: colors.mutedForeground }]}>Set up your own fan membership tiers and earn from your fans</Text>
              </View>
              <Pressable onPress={() => router.push("/creator-dashboard")} style={[styles.ctaBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.ctaBtnText}>Set Up</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:   { flex: 1 },
  topGrad:     { paddingBottom: 16 },
  headerRow:   { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 4 },
  backBtn:     { padding: 8 },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSub:   { textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular", marginBottom: 14, paddingHorizontal: 20 },

  sectionTabs:         { flexDirection: "row", marginHorizontal: 16, borderRadius: 10, padding: 3 },
  sectionTab:          { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  sectionTabActive:    { backgroundColor: "rgba(255,255,255,0.9)" },
  sectionTabText:      { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.75)" },
  sectionTabTextActive:{ color: "#7B2FBE" },

  // ── Plans ──
  plansSection:    { padding: 16, gap: 14 },
  planCard:        { borderRadius: 18, overflow: "hidden" },
  popularBadge:    { paddingVertical: 6, paddingHorizontal: 16 },
  popularText:     { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  planHeader:      { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, paddingBottom: 8 },
  planIconCircle:  { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  planName:        { fontSize: 17, fontFamily: "Inter_700Bold" },
  priceRow:        { flexDirection: "row", alignItems: "baseline", gap: 2 },
  planPrice:       { fontSize: 22, fontFamily: "Inter_700Bold" },
  planPeriod:      { fontSize: 13, fontFamily: "Inter_400Regular" },
  checkCircle:     { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  featuresList:    { paddingHorizontal: 16, paddingBottom: 12, gap: 6 },
  featureRow:      { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText:     { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  subscribeBtn:    { margin: 12, marginTop: 4, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  subscribeBtnText:{ color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  paymentInfo:     { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  paymentTitle:    { fontSize: 15, fontFamily: "Inter_700Bold" },
  paymentMethods:  { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  paymentMethod:   { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
  paymentMethodLabel:{ fontSize: 12, fontFamily: "Inter_500Medium" },

  // ── Boost hero ──
  boostHero:       { borderRadius: 20, borderWidth: 1, padding: 20, alignItems: "center", marginBottom: 20, gap: 8 },
  boostHeroIcon:   { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  boostHeroTitle:  { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  boostHeroSub:    { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  boostStatRow:    { flexDirection: "row", gap: 24, marginTop: 8 },
  boostStatItem:   { alignItems: "center" },
  boostStatVal:    { fontSize: 17, fontFamily: "Inter_700Bold" },
  boostStatLabel:  { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },

  // ── Boost flow ──
  boostWrap:       { gap: 0 },
  progressRow:     { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  progressStep:    { flexDirection: "row", alignItems: "center" },
  progressDot:     { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  progressNum:     { fontSize: 12, fontFamily: "Inter_700Bold" },
  progressLine:    { width: 40, height: 2, marginHorizontal: 4 },
  stepBlock:       { gap: 14 },
  stepTitle:       { fontSize: 18, fontFamily: "Inter_700Bold" },
  stepSub:         { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: -8 },
  miniLabel:       { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: -6 },

  objCard:         { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  objIcon:         { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  objLabel:        { fontSize: 15, fontFamily: "Inter_700Bold" },
  objSub:          { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2, lineHeight: 17 },
  objCheck:        { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },

  promoteRow:      { flexDirection: "row", gap: 10 },
  promoteBtn:      { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 11, borderRadius: 12, borderWidth: 1 },
  promoteBtnText:  { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  chipRow:         { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip:            { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText:        { fontSize: 13, fontFamily: "Inter_500Medium" },

  budgetChip:      { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1, alignItems: "center", minWidth: 80 },
  budgetChipLabel: { fontSize: 14, fontFamily: "Inter_700Bold" },
  budgetChipSub:   { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },

  estimateCard:    { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  estimateRow:     { flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
  estimateStat:    { alignItems: "center", gap: 4 },
  estimateVal:     { fontSize: 15, fontFamily: "Inter_700Bold", marginTop: 4 },
  estimateLabel:   { fontSize: 11, fontFamily: "Inter_400Regular" },
  estimateDivider: { width: 1, height: 40 },
  estimateNote:    { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },

  summaryCard:     { borderRadius: 14, padding: 14, gap: 8 },
  summaryTitle:    { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 2 },
  summaryRow:      { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel:    { fontSize: 12, fontFamily: "Inter_400Regular" },
  summaryVal:      { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  nextBtn:         {},
  nextBtnGrad:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14 },
  nextBtnText:     { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  navRow:          { flexDirection: "row", gap: 10, alignItems: "stretch" },
  backStepBtn:     { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1 },
  backStepText:    { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  doneCtr:         { borderRadius: 20, borderWidth: 1, padding: 24, alignItems: "center", gap: 12 },
  doneCircle:      { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  doneTitle:       { fontSize: 20, fontFamily: "Inter_700Bold" },
  doneSub:         { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  doneStats:       { width: "100%", borderRadius: 14, padding: 14, flexDirection: "row", justifyContent: "space-around" },
  doneStat:        { alignItems: "center", gap: 4 },
  doneStatVal:     { fontSize: 15, fontFamily: "Inter_700Bold" },
  doneStatLabel:   { fontSize: 11, fontFamily: "Inter_400Regular" },
  doneBtn:         { borderRadius: 12, borderWidth: 1, paddingHorizontal: 24, paddingVertical: 10 },
  doneBtnText:     { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  // ── Fan ──
  fanSection:      { padding: 16, gap: 14 },
  fanDesc:         { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  fanCard:         { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  fanCardGrad:     { position: "absolute", top: 0, left: 0, right: 0, height: 60 },
  fanCardHeader:   { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, paddingBottom: 10 },
  fanIconCircle:   { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  fanName:         { fontSize: 16, fontFamily: "Inter_700Bold" },
  fanPrice:        { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  joinBtn:         { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  joinBtnText:     { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  fanPerks:        { paddingHorizontal: 16, paddingBottom: 14, gap: 6 },
  perkRow:         { flexDirection: "row", alignItems: "center", gap: 8 },
  perkText:        { fontSize: 13, fontFamily: "Inter_400Regular" },
  creatorCTA:      { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  ctaTitle:        { fontSize: 14, fontFamily: "Inter_700Bold" },
  ctaSub:          { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  ctaBtn:          { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  ctaBtnText:      { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
});
