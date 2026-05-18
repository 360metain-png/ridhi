import React, { useState } from "react";
import {
  Dimensions, Platform, Pressable, ScrollView,
  StyleSheet, Text, View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

// ── Plan definitions ───────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "free", name: "Free", badge: "FREE", price: "₹0", period: "forever",
    color: "#888888", gradient: ["#555", "#333"] as [string, string],
    coinsDay: 20, calls: "None", badge2: "—",
    features: ["Basic profile", "20 coins/day", "Standard feed", "5 stories/day", "5 communities"],
    locked: ["Audio / Video calls", "VIP badge", "Creator fund", "Exclusive content", "Boost & Ads", "AI recommendations"],
  },
  {
    id: "silver", name: "Silver", badge: "SILVER", price: "₹99", period: "/month",
    color: "#A0A0A0", gradient: ["#9E9E9E", "#616161"] as [string, string],
    coinsDay: 50, calls: "5/day", badge2: "Silver badge",
    features: ["50 coins/day", "5 random calls/day", "Silver VIP badge", "Priority feed", "Unlimited stories", "20 communities", "Chat translations"],
    locked: ["Video calls", "Creator fund", "Featured creator", "Custom effects"],
  },
  {
    id: "gold", name: "Gold", badge: "GOLD", price: "₹249", period: "/month",
    color: "#FFB800", gradient: ["#FFB800", "#FF8F00"] as [string, string],
    popular: true,
    coinsDay: 150, calls: "Unlimited", badge2: "Gold badge",
    features: ["150 coins/day", "Unlimited calls", "Gold VIP badge", "AI feed + captions", "Creator fund access", "Unlimited communities", "Run Ad promotions", "Priority support", "Early features"],
    locked: ["Diamond badge", "Featured creator status", "Dedicated manager"],
  },
  {
    id: "vip", name: "VIP Diamond", badge: "DIAMOND", price: "₹599", period: "/month",
    color: "#E91E8C", gradient: ["#E91E8C", "#7B2FBE"] as [string, string],
    coinsDay: 500, calls: "Unlimited", badge2: "Diamond badge",
    features: ["500 coins/day", "Unlimited everything", "Diamond VIP badge", "Featured creator status", "VIP exclusive content", "Advanced analytics", "Custom profile effects", "Dedicated account manager", "Priority ad placement", "Ad-free experience", "Early feature access"],
    locked: [],
  },
];

// ── Unlock features showcase ───────────────────────────────────────────────────
const UNLOCK_CATEGORIES = [
  {
    title: "Profile & Discovery",
    icon: "user",
    color: "#E91E8C",
    items: [
      { label: "VIP Badge",             plan: "silver", icon: "award"       },
      { label: "Priority in Search",    plan: "silver", icon: "search"      },
      { label: "AI-Powered Feed",       plan: "gold",   icon: "zap"         },
      { label: "Featured Creator",      plan: "vip",    icon: "star"        },
      { label: "Custom Profile Effects",plan: "vip",    icon: "sliders"     },
      { label: "Ad-Free Experience",    plan: "vip",    icon: "shield"      },
    ],
  },
  {
    title: "Creator Tools",
    icon: "trending-up",
    color: "#7B2FBE",
    items: [
      { label: "Unlimited Stories",     plan: "silver", icon: "circle"      },
      { label: "Chat Translations",     plan: "silver", icon: "globe"       },
      { label: "Creator Fund Access",   plan: "gold",   icon: "dollar-sign" },
      { label: "Boost & Ad Campaigns",  plan: "gold",   icon: "bar-chart-2" },
      { label: "Advanced Analytics",    plan: "vip",    icon: "pie-chart"   },
      { label: "Dedicated Manager",     plan: "vip",    icon: "headphones"  },
    ],
  },
  {
    title: "Social & Chat",
    icon: "message-circle",
    color: "#2196F3",
    items: [
      { label: "5 Random Calls/Day",    plan: "silver", icon: "phone"       },
      { label: "Unlimited Communities", plan: "gold",   icon: "users"       },
      { label: "Unlimited Calls",       plan: "gold",   icon: "video"       },
      { label: "VIP Exclusive Content", plan: "vip",    icon: "lock"        },
      { label: "Early Feature Access",  plan: "gold",   icon: "clock"       },
      { label: "Priority Support",      plan: "gold",   icon: "life-buoy"   },
    ],
  },
  {
    title: "Coins & Rewards",
    icon: "dollar-sign",
    color: "#FFB800",
    items: [
      { label: "50 Coins / Day",        plan: "silver", icon: "gift"        },
      { label: "150 Coins / Day",       plan: "gold",   icon: "gift"        },
      { label: "500 Coins / Day",       plan: "vip",    icon: "gift"        },
      { label: "Priority Ad Placement", plan: "vip",    icon: "target"      },
    ],
  },
];

const PLAN_COLOR: Record<string, string> = {
  silver: "#A0A0A0",
  gold:   "#FFB800",
  vip:    "#E91E8C",
};

const PLAN_RANK: Record<string, number> = {
  free: 0, silver: 1, gold: 2, vip: 3,
};

// ── Fan tiers ──────────────────────────────────────────────────────────────────
const FAN_TIERS = [
  {
    id: "supporter", name: "Supporter", price: "₹49/month", color: "#34C759", icon: "heart",
    perks: ["Exclusive badge on your profile", "Access to creator-only posts", "Monthly creator shoutout"],
  },
  {
    id: "superfan", name: "Super Fan", price: "₹149/month", color: "#FF9500", icon: "star",
    perks: ["All Supporter perks", "Direct message the creator", "Exclusive live access", "Monthly coin rewards"],
  },
  {
    id: "vipfan", name: "VIP Fan", price: "₹399/month", color: "#E91E8C", icon: "award",
    perks: ["All Super Fan perks", "1:1 video call per month", "Custom fan badge", "Featured in creator posts"],
  },
];

// ── Boost data ─────────────────────────────────────────────────────────────────
type BoostObjective = "reach" | "leads" | "reactions";
const OBJECTIVES = [
  { id: "reach" as const,     icon: "globe",      label: "Reach",     color: "#7B2FBE", accent: "#7B2FBE20",
    sub: "Show your profile/post to thousands of new users across India" },
  { id: "leads" as const,     icon: "user-plus",  label: "Leads",     color: "#2196F3", accent: "#2196F320",
    sub: "Drive profile visits, follow requests and DM conversations" },
  { id: "reactions" as const, icon: "heart",      label: "Reactions", color: "#E91E8C", accent: "#E91E8C20",
    sub: "Maximise likes, comments and reshares on your promoted post" },
];

const CITIES    = ["Anywhere in India","Delhi","Mumbai","Bangalore","Chennai","Hyderabad","Pune","Kolkata","Jaipur","Ahmedabad","Kochi"];
const INTERESTS = ["Music","Travel","Gaming","Food","Fashion","Sports","Tech","Fitness","Movies","Comedy","Dance","Art"];
const BUDGETS   = [
  { label: "₹50/day",  value: 50,  reach: "800–1.2K" },
  { label: "₹100/day", value: 100, reach: "2–3.5K"   },
  { label: "₹250/day", value: 250, reach: "6–9K"      },
  { label: "₹500/day", value: 500, reach: "14–20K"    },
];
const DURATIONS = [
  { label: "1 day",   days: 1  },
  { label: "3 days",  days: 3  },
  { label: "7 days",  days: 7  },
  { label: "14 days", days: 14 },
];

function estimateReach(budgetVal: number, days: number, obj: BoostObjective) {
  const mult = obj === "reach" ? 1 : obj === "reactions" ? 0.65 : 0.5;
  const base  = BUDGETS.find(b => b.value === budgetVal)?.reach ?? "800–1.2K";
  const [lo, hi] = base.replace("K", "").split("–").map(Number);
  const lo2 = Math.round(lo * days * mult * 1000 / 1000);
  const hi2 = Math.round(hi * days * mult * 1000 / 1000);
  return hi2 >= 1000 ? `${(lo2 / 1000).toFixed(0)}K–${(hi2 / 1000).toFixed(0)}K people` : `${lo2}–${hi2} people`;
}

// ── Boost section (3-step) ─────────────────────────────────────────────────────
function BoostSection({ colors }: { colors: ReturnType<typeof useColors> }) {
  const [step,      setStep]      = useState<1 | 2 | 3 | "done">(1);
  const [objective, setObjective] = useState<BoostObjective>("reach");
  const [gender,    setGender]    = useState<"all" | "male" | "female">("all");
  const [age,       setAge]       = useState<"all" | "18-24" | "25-34" | "35-44">("all");
  const [city,      setCity]      = useState(CITIES[0]);
  const [selIntr,   setSelIntr]   = useState<string[]>([]);
  const [budget,    setBudget]    = useState(100);
  const [duration,  setDuration]  = useState(3);
  const [promote,   setPromote]   = useState<"profile" | "post">("profile");

  const obj = OBJECTIVES.find(o => o.id === objective)!;
  const total = budget * duration;
  const toggleIntr = (i: string) =>
    setSelIntr(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

  const Chip = ({ label, selected, onPress, accent }: { label: string; selected: boolean; onPress: () => void; accent?: string }) => (
    <Pressable onPress={onPress} style={[bs.chip, {
      backgroundColor: selected ? (accent ?? colors.primary) : colors.card,
      borderColor:     selected ? (accent ?? colors.primary) : colors.border,
    }]}>
      <Text style={[bs.chipTxt, { color: selected ? "#fff" : colors.foreground }]}>{label}</Text>
    </Pressable>
  );

  if (step === "done") {
    return (
      <View style={[bs.doneCtr, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={bs.doneCircle}>
          <Feather name="check" size={32} color="#fff" />
        </LinearGradient>
        <Text style={[bs.doneTitle, { color: colors.foreground }]}>Promotion Launched!</Text>
        <Text style={[bs.doneSub, { color: colors.mutedForeground }]}>
          Your {obj.label} campaign is live. You'll be notified as it reaches your audience.
        </Text>
        <View style={[bs.doneStats, { backgroundColor: colors.muted }]}>
          {[
            { label: "Objective",  val: obj.label },
            { label: "Est. Reach", val: estimateReach(budget, duration, objective) },
            { label: "Budget",     val: `₹${total}` },
            { label: "Duration",   val: `${duration} day${duration > 1 ? "s" : ""}` },
          ].map(({ label, val }) => (
            <View key={label} style={bs.doneStat}>
              <Text style={[bs.doneStatVal, { color: colors.primary }]}>{val}</Text>
              <Text style={[bs.doneStatLbl, { color: colors.mutedForeground }]}>{label}</Text>
            </View>
          ))}
        </View>
        <Pressable onPress={() => setStep(1)} style={[bs.doneBtn, { borderColor: colors.border }]}>
          <Text style={[bs.doneBtnTxt, { color: colors.foreground }]}>Create Another Boost</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ gap: 0 }}>
      {/* Progress */}
      <View style={bs.progRow}>
        {[1, 2, 3].map((s, i) => (
          <View key={s} style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={[bs.progDot, { backgroundColor: s <= step ? colors.primary : colors.muted, borderColor: s === step ? colors.primary : "transparent" }]}>
              {s < step
                ? <Feather name="check" size={11} color="#fff" />
                : <Text style={[bs.progNum, { color: s <= step ? "#fff" : colors.mutedForeground }]}>{s}</Text>}
            </View>
            {i < 2 && <View style={[bs.progLine, { backgroundColor: s < (step as number) ? colors.primary : colors.muted }]} />}
          </View>
        ))}
      </View>

      {/* Step 1 */}
      {step === 1 && (
        <View style={{ gap: 14 }}>
          <Text style={[bs.stepTitle, { color: colors.foreground }]}>Choose Your Goal</Text>
          <Text style={[bs.stepSub, { color: colors.mutedForeground }]}>What do you want this promotion to achieve?</Text>
          {OBJECTIVES.map((o) => (
            <Pressable key={o.id} onPress={() => setObjective(o.id)}
              style={[bs.objCard, { backgroundColor: objective === o.id ? o.accent : colors.card, borderColor: objective === o.id ? o.color : colors.border, borderWidth: objective === o.id ? 2 : 1 }]}>
              <View style={[bs.objIcon, { backgroundColor: o.accent }]}>
                <Feather name={o.icon as any} size={22} color={o.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[bs.objLabel, { color: colors.foreground }]}>{o.label}</Text>
                <Text style={[bs.objSub, { color: colors.mutedForeground }]}>{o.sub}</Text>
              </View>
              {objective === o.id && <View style={[bs.objCheck, { backgroundColor: o.color }]}><Feather name="check" size={12} color="#fff" /></View>}
            </Pressable>
          ))}

          {objective === "leads" && (
            <Pressable onPress={() => router.push("/lead-form-builder" as any)}
              style={[bs.leadPrompt, { backgroundColor: "#2196F312", borderColor: "#2196F340" }]}>
              <View style={[bs.leadIcon, { backgroundColor: "#2196F320" }]}><Feather name="clipboard" size={20} color="#2196F3" /></View>
              <View style={{ flex: 1 }}>
                <Text style={[bs.leadTitle, { color: colors.foreground }]}>Build a Lead Form</Text>
                <Text style={[bs.leadSub, { color: colors.mutedForeground }]}>Collect name, phone, requirements when users click your ad</Text>
              </View>
              <Feather name="arrow-right" size={16} color="#2196F3" />
            </Pressable>
          )}

          <Text style={[bs.miniLabel, { color: colors.foreground }]}>Promote</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {(["profile", "post"] as const).map((p) => (
              <Pressable key={p} onPress={() => setPromote(p)}
                style={[bs.promBtn, { flex: 1, backgroundColor: promote === p ? colors.primary : colors.card, borderColor: promote === p ? colors.primary : colors.border }]}>
                <Feather name={p === "profile" ? "user" : "image"} size={16} color={promote === p ? "#fff" : colors.mutedForeground} />
                <Text style={[bs.promBtnTxt, { color: promote === p ? "#fff" : colors.foreground }]}>{p === "profile" ? "My Profile" : "A Post"}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={() => setStep(2)}>
            <LinearGradient colors={["#7B2FBE", "#E91E8C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={bs.nextGrad}>
              <Text style={bs.nextTxt}>Next: Target Audience</Text>
              <Feather name="arrow-right" size={16} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <View style={{ gap: 14 }}>
          <Text style={[bs.stepTitle, { color: colors.foreground }]}>Target Audience</Text>
          <Text style={[bs.stepSub, { color: colors.mutedForeground }]}>Define who sees your promotion</Text>

          <Text style={[bs.miniLabel, { color: colors.foreground }]}>Gender</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {(["all", "male", "female"] as const).map(g => (
              <Chip key={g} label={g === "all" ? "All" : g === "male" ? "Men" : "Women"} selected={gender === g} onPress={() => setGender(g)} />
            ))}
          </View>

          <Text style={[bs.miniLabel, { color: colors.foreground }]}>Age Range</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {(["all", "18-24", "25-34", "35-44"] as const).map(a => (
              <Chip key={a} label={a === "all" ? "Any Age" : a} selected={age === a} onPress={() => setAge(a)} />
            ))}
          </View>

          <Text style={[bs.miniLabel, { color: colors.foreground }]}>City / Region</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {CITIES.map(c => <Chip key={c} label={c} selected={city === c} onPress={() => setCity(c)} />)}
            </View>
          </ScrollView>

          <Text style={[bs.miniLabel, { color: colors.foreground }]}>Interests (optional)</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {INTERESTS.map(i => (
              <Chip key={i} label={i} selected={selIntr.includes(i)} onPress={() => toggleIntr(i)} accent="#7B2FBE" />
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: 10, alignItems: "stretch" }}>
            <Pressable onPress={() => setStep(1)} style={[bs.backBtn, { borderColor: colors.border }]}>
              <Feather name="arrow-left" size={16} color={colors.foreground} />
              <Text style={[bs.backTxt, { color: colors.foreground }]}>Back</Text>
            </Pressable>
            <Pressable onPress={() => setStep(3)} style={{ flex: 1 }}>
              <LinearGradient colors={["#7B2FBE", "#E91E8C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={bs.nextGrad}>
                <Text style={bs.nextTxt}>Next: Budget</Text>
                <Feather name="arrow-right" size={16} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <View style={{ gap: 14 }}>
          <Text style={[bs.stepTitle, { color: colors.foreground }]}>Budget & Duration</Text>
          <Text style={[bs.stepSub, { color: colors.mutedForeground }]}>Set your daily spend and how long to run</Text>

          <Text style={[bs.miniLabel, { color: colors.foreground }]}>Daily Budget</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {BUDGETS.map(b => (
              <Pressable key={b.value} onPress={() => setBudget(b.value)}
                style={[bs.budChip, { backgroundColor: budget === b.value ? colors.primary : colors.card, borderColor: budget === b.value ? colors.primary : colors.border }]}>
                <Text style={[bs.budLabel, { color: budget === b.value ? "#fff" : colors.foreground }]}>{b.label}</Text>
                <Text style={[bs.budSub, { color: budget === b.value ? "rgba(255,255,255,0.75)" : colors.mutedForeground }]}>~{b.reach}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[bs.miniLabel, { color: colors.foreground }]}>Duration</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {DURATIONS.map(d => (
              <Chip key={d.days} label={d.label} selected={duration === d.days} onPress={() => setDuration(d.days)} />
            ))}
          </View>

          <LinearGradient colors={["#7B2FBE20", "#E91E8C20"]} style={[bs.estCard, { borderColor: "#7B2FBE30" }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center" }}>
              {[
                { icon: "users", val: estimateReach(budget, duration, objective), label: "Est. Reach",  color: "#7B2FBE" },
                { icon: "zap",   val: `₹${total}`,                                label: "Total Cost",  color: "#E91E8C" },
                { icon: obj.icon, val: obj.label,                                  label: "Objective",  color: obj.color },
              ].map(({ icon, val, label, color }, i) => (
                <View key={i} style={{ alignItems: "center", gap: 4 }}>
                  <Feather name={icon as any} size={18} color={color} />
                  <Text style={[bs.estVal, { color: colors.foreground }]}>{val}</Text>
                  <Text style={[bs.estLbl, { color: colors.mutedForeground }]}>{label}</Text>
                </View>
              ))}
            </View>
            <Text style={[bs.estNote, { color: colors.mutedForeground }]}>Estimates based on your targeting. Actual results may vary.</Text>
          </LinearGradient>

          <View style={[bs.sumCard, { backgroundColor: colors.muted }]}>
            <Text style={[bs.sumTitle, { color: colors.foreground }]}>Campaign Summary</Text>
            {[
              { label: "Promote",   val: promote === "profile" ? "My Profile" : "A Post" },
              { label: "Objective", val: obj.label },
              { label: "Gender",    val: gender === "all" ? "All genders" : gender === "male" ? "Men" : "Women" },
              { label: "Age",       val: age === "all" ? "All ages" : age },
              { label: "City",      val: city },
              { label: "Duration",  val: `${duration} day${duration > 1 ? "s" : ""}` },
            ].map(({ label, val }) => (
              <View key={label} style={bs.sumRow}>
                <Text style={[bs.sumLabel, { color: colors.mutedForeground }]}>{label}</Text>
                <Text style={[bs.sumVal, { color: colors.foreground }]}>{val}</Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: 10, alignItems: "stretch" }}>
            <Pressable onPress={() => setStep(2)} style={[bs.backBtn, { borderColor: colors.border }]}>
              <Feather name="arrow-left" size={16} color={colors.foreground} />
              <Text style={[bs.backTxt, { color: colors.foreground }]}>Back</Text>
            </Pressable>
            <Pressable onPress={() => setStep("done")} style={{ flex: 1 }}>
              <LinearGradient colors={["#7B2FBE", "#E91E8C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={bs.nextGrad}>
                <Feather name="zap" size={16} color="#fff" />
                <Text style={bs.nextTxt}>Launch for ₹{total}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

// ── Plan comparison matrix ─────────────────────────────────────────────────────
const COMPARE_ROWS = [
  { label: "Daily Coins",         free: "20",           silver: "50",            gold: "150",             vip: "500"             },
  { label: "Random Calls",        free: "✗",            silver: "5/day",         gold: "Unlimited",       vip: "Unlimited"       },
  { label: "Stories",             free: "5/day",        silver: "Unlimited",     gold: "Unlimited",       vip: "Unlimited"       },
  { label: "Communities",         free: "5",            silver: "20",            gold: "Unlimited",       vip: "Unlimited"       },
  { label: "VIP Badge",           free: "✗",            silver: "Silver",        gold: "Gold",            vip: "Diamond"         },
  { label: "AI Feed",             free: "✗",            silver: "✗",             gold: "✓",               vip: "✓"               },
  { label: "Creator Fund",        free: "✗",            silver: "✗",             gold: "✓",               vip: "✓"               },
  { label: "Boost & Ads",         free: "✗",            silver: "✗",             gold: "✓",               vip: "Priority"        },
  { label: "Chat Translation",    free: "✗",            silver: "✓",             gold: "✓",               vip: "✓"               },
  { label: "Featured Creator",    free: "✗",            silver: "✗",             gold: "✗",               vip: "✓"               },
  { label: "Custom Effects",      free: "✗",            silver: "✗",             gold: "✗",               vip: "✓"               },
  { label: "Dedicated Manager",   free: "✗",            silver: "✗",             gold: "✗",               vip: "✓"               },
  { label: "Ad-Free",             free: "✗",            silver: "✗",             gold: "✗",               vip: "✓"               },
];

function CompareTable({ colors }: { colors: ReturnType<typeof useColors> }) {
  const colW = (width - 32) / 5;
  const cols = [
    { key: "label",  head: "Feature",  color: colors.foreground,  bg: "transparent" },
    { key: "free",   head: "Free",     color: "#888",             bg: "#88888818"   },
    { key: "silver", head: "Silver",   color: "#A0A0A0",          bg: "#A0A0A018"   },
    { key: "gold",   head: "Gold",     color: "#FFB800",          bg: "#FFB80018"   },
    { key: "vip",    head: "Diamond",  color: "#E91E8C",          bg: "#E91E8C18"   },
  ] as const;

  return (
    <View style={[styles.tableWrap, { borderColor: colors.border }]}>
      {/* Head */}
      <View style={[styles.tableRow, { backgroundColor: colors.muted }]}>
        {cols.map(c => (
          <View key={c.key} style={[styles.tableCell, { width: colW, backgroundColor: c.bg }]}>
            <Text style={[styles.tableHead, { color: c.color }]}>{c.head}</Text>
          </View>
        ))}
      </View>
      {/* Rows */}
      {COMPARE_ROWS.map((row, i) => (
        <View key={row.label} style={[styles.tableRow, { backgroundColor: i % 2 === 0 ? colors.card : colors.muted + "40" }]}>
          {cols.map(c => {
            const val = row[c.key as keyof typeof row];
            const isTick = val === "✓" || val === "Priority";
            const isCross= val === "✗";
            return (
              <View key={c.key} style={[styles.tableCell, { width: colW }]}>
                {isTick  ? <Feather name="check-circle" size={13} color={c.key === "label" ? colors.foreground : c.color} />
               : isCross ? <Text style={[styles.tableCross, { color: colors.mutedForeground }]}>—</Text>
               : <Text style={[styles.tableTxt, { color: c.key === "label" ? colors.mutedForeground : c.color }]} numberOfLines={1}>{val}</Text>}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
type Section = "plans" | "boost" | "fan";

export default function SubscriptionScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const [section,      setSection]      = useState<Section>("plans");
  const [selectedPlan, setSelectedPlan] = useState("gold");
  const [showCompare,  setShowCompare]  = useState(false);
  const [unlockCat,    setUnlockCat]    = useState(0);

  const currentPlan = PLANS.find(p => p.id === selectedPlan)!;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>

      {/* ── Gradient header ── */}
      <LinearGradient colors={["#E91E8C", "#7B2FBE"]} style={[styles.header, { paddingTop: topPad + 10 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.headerTitle}>Premium & Promotions</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero tagline */}
        <View style={styles.heroWrap}>
          <LinearGradient colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.1)"]} style={styles.crownBadge}>
            <Feather name="zap" size={22} color="#FFD700" />
          </LinearGradient>
          <Text style={styles.heroTitle}>Unlock the full{"\n"}Ridhi experience</Text>
          <Text style={styles.heroSub}>Grow your audience · Earn more · Access exclusive features</Text>
        </View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          {[
            { val: "1.4Cr+", label: "Active Users"      },
            { val: "4",      label: "Premium Plans"     },
            { val: "₹99",    label: "Starts From/Month" },
          ].map(({ val, label }) => (
            <View key={label} style={styles.statItem}>
              <Text style={styles.statVal}>{val}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Tab bar */}
        <View style={[styles.tabBar, { backgroundColor: "rgba(255,255,255,0.18)" }]}>
          {([
            { key: "plans" as Section, label: "VIP Plans",  icon: "award"       },
            { key: "boost" as Section, label: "Boost Ads",  icon: "trending-up" },
            { key: "fan"   as Section, label: "Fan Clubs",  icon: "heart"       },
          ]).map(({ key, label, icon }) => (
            <Pressable key={key} onPress={() => setSection(key)}
              style={[styles.tabBtn, section === key && styles.tabBtnActive]}>
              <Feather name={icon as any} size={13} color={section === key ? "#7B2FBE" : "rgba(255,255,255,0.8)"} />
              <Text style={[styles.tabTxt, section === key && styles.tabTxtActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      {/* ── Content ── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        {/* ══════════════ VIP PLANS ══════════════ */}
        {section === "plans" && (
          <View style={styles.sectionWrap}>

            {/* What you unlock — category selector */}
            <View style={[styles.unlockCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.unlockCardTitle, { color: colors.foreground }]}>What You Unlock</Text>
              <Text style={[styles.unlockCardSub, { color: colors.mutedForeground }]}>Tap a category to explore features</Text>

              {/* Category tabs */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, flexDirection: "row" }}>
                {UNLOCK_CATEGORIES.map((cat, i) => (
                  <Pressable key={cat.title} onPress={() => setUnlockCat(i)}
                    style={[styles.catTab, { backgroundColor: unlockCat === i ? cat.color : colors.muted, borderColor: unlockCat === i ? cat.color : "transparent" }]}>
                    <Feather name={cat.icon as any} size={12} color={unlockCat === i ? "#fff" : colors.mutedForeground} />
                    <Text style={[styles.catTabTxt, { color: unlockCat === i ? "#fff" : colors.foreground }]}>{cat.title}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Features grid for selected category */}
              <View style={styles.featGrid}>
                {UNLOCK_CATEGORIES[unlockCat].items.map((item) => {
                  const col = PLAN_COLOR[item.plan] ?? "#888";
                  return (
                    <View key={item.label} style={[styles.featCell, { backgroundColor: col + "12", borderColor: col + "30" }]}>
                      <View style={[styles.featIcon, { backgroundColor: col + "20" }]}>
                        <Feather name={item.icon as any} size={14} color={col} />
                      </View>
                      <Text style={[styles.featLabel, { color: colors.foreground }]}>{item.label}</Text>
                      <View style={[styles.featPlanBadge, { backgroundColor: col }]}>
                        <Text style={styles.featPlanTxt}>{item.plan === "vip" ? "Diamond" : item.plan.charAt(0).toUpperCase() + item.plan.slice(1)}+</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Plan cards */}
            {PLANS.map((plan) => {
              const sel = selectedPlan === plan.id;
              return (
                <Pressable key={plan.id} onPress={() => setSelectedPlan(plan.id)}
                  style={[styles.planCard, { backgroundColor: colors.card, borderColor: sel ? plan.color : colors.border, borderWidth: sel ? 2 : 1 }]}>

                  {plan.popular && (
                    <LinearGradient colors={plan.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.popularBanner}>
                      <Feather name="star" size={11} color="#fff" />
                      <Text style={styles.popularText}>Most Popular</Text>
                    </LinearGradient>
                  )}

                  <View style={styles.planTop}>
                    <LinearGradient colors={plan.gradient} style={styles.planIconWrap}>
                      <Feather name={plan.id === "free" ? "user" : plan.id === "silver" ? "shield" : plan.id === "gold" ? "award" : "zap"} size={22} color="#fff" />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.planName, { color: colors.foreground }]}>{plan.name}</Text>
                      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 2 }}>
                        <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price}</Text>
                        <Text style={[styles.planPeriod, { color: colors.mutedForeground }]}>{plan.period}</Text>
                      </View>
                    </View>
                    {sel && (
                      <View style={[styles.selCheck, { backgroundColor: plan.color }]}>
                        <Feather name="check" size={14} color="#fff" />
                      </View>
                    )}
                  </View>

                  {/* Highlights row */}
                  <View style={[styles.planHighlights, { backgroundColor: plan.color + "10", borderColor: plan.color + "25" }]}>
                    {[
                      { icon: "gift", val: `${plan.coinsDay} coins/day` },
                      { icon: "phone", val: plan.calls + " calls" },
                      { icon: "award", val: plan.badge2 },
                    ].map(({ icon, val }) => (
                      <View key={val} style={styles.planHL}>
                        <Feather name={icon as any} size={12} color={plan.color} />
                        <Text style={[styles.planHLTxt, { color: plan.color }]}>{val}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Features */}
                  <View style={styles.featList}>
                    {plan.features.map(f => (
                      <View key={f} style={styles.featRow}>
                        <Feather name="check-circle" size={14} color="#34C759" />
                        <Text style={[styles.featTxt, { color: colors.foreground }]}>{f}</Text>
                      </View>
                    ))}
                    {plan.locked.slice(0, 2).map(f => (
                      <View key={f} style={styles.featRow}>
                        <Feather name="lock" size={13} color={colors.mutedForeground} />
                        <Text style={[styles.featTxt, { color: colors.mutedForeground }]}>{f}</Text>
                      </View>
                    ))}
                    {plan.locked.length > 2 && (
                      <Text style={[styles.moreLocked, { color: colors.mutedForeground }]}>+{plan.locked.length - 2} more locked features</Text>
                    )}
                  </View>

                  {plan.id !== "free" && (
                    <LinearGradient colors={plan.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.subBtn}>
                      <Text style={styles.subBtnTxt}>
                        {sel ? `Upgrade to ${plan.name} — ${plan.price}${plan.period}` : `Subscribe — ${plan.price}${plan.period}`}
                      </Text>
                    </LinearGradient>
                  )}
                </Pressable>
              );
            })}

            {/* Compare Plans toggle */}
            <Pressable onPress={() => setShowCompare(v => !v)}
              style={[styles.compareToggle, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="grid" size={16} color={colors.primary} />
              <Text style={[styles.compareToggleTxt, { color: colors.primary }]}>
                {showCompare ? "Hide" : "View"} Full Feature Comparison
              </Text>
              <Feather name={showCompare ? "chevron-up" : "chevron-down"} size={16} color={colors.primary} />
            </Pressable>

            {showCompare && (
              <>
                <Text style={[styles.compareTitle, { color: colors.foreground }]}>Feature Comparison</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <CompareTable colors={colors} />
                </ScrollView>
              </>
            )}

            {/* Payment methods */}
            <View style={[styles.payCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.payTitle, { color: colors.foreground }]}>Secure Indian Payments</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                {[
                  { label: "UPI",        icon: "smartphone",  color: "#00BCD4" },
                  { label: "Razorpay",   icon: "credit-card", color: "#2962FF" },
                  { label: "Google Pay", icon: "globe",       color: "#34A853" },
                  { label: "PhonePe",    icon: "zap",         color: "#5F259F" },
                  { label: "Paytm",      icon: "shopping-bag",color: "#00BAF2" },
                ].map(pm => (
                  <View key={pm.label} style={[styles.payMethod, { backgroundColor: colors.muted }]}>
                    <Feather name={pm.icon as any} size={15} color={pm.color} />
                    <Text style={[styles.payMethodTxt, { color: colors.foreground }]}>{pm.label}</Text>
                  </View>
                ))}
              </View>
              <Text style={[styles.payNote, { color: colors.mutedForeground }]}>
                Auto-renews monthly. Cancel anytime. GST included.
              </Text>
            </View>
          </View>
        )}

        {/* ══════════════ BOOST & ADS ══════════════ */}
        {section === "boost" && (
          <View style={styles.sectionWrap}>
            {/* Hero */}
            <LinearGradient colors={["#7B2FBE15", "#E91E8C10"]} style={[styles.boostHero, { borderColor: "#7B2FBE30" }]}>
              <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={styles.boostHeroIcon}>
                <Feather name="trending-up" size={26} color="#fff" />
              </LinearGradient>
              <Text style={[styles.boostTitle, { color: colors.foreground }]}>Grow Your Reach</Text>
              <Text style={[styles.boostSub, { color: colors.mutedForeground }]}>
                Promote your profile or posts to thousands of targeted Ridhi users — like Instagram Ads, built for India.
              </Text>
              <View style={{ flexDirection: "row", gap: 24 }}>
                {[
                  { val: "1.4Cr+", label: "Active Users" },
                  { val: "₹50/day", label: "Start From"  },
                  { val: "3 Goals", label: "Objectives"  },
                ].map(({ val, label }) => (
                  <View key={label} style={{ alignItems: "center" }}>
                    <Text style={[styles.boostStatVal, { color: colors.primary }]}>{val}</Text>
                    <Text style={[styles.boostStatLbl, { color: colors.mutedForeground }]}>{label}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>

            {/* Want to run a Business Ad? */}
            <Pressable onPress={() => router.push("/ads-manager" as any)}
              style={[styles.bizAdBanner, { backgroundColor: "#7B2FBE12", borderColor: "#7B2FBE30" }]}>
              <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={styles.bizAdIcon}>
                <Feather name="zap" size={18} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={[styles.bizAdTitle, { color: colors.foreground }]}>Running a Business?</Text>
                <Text style={[styles.bizAdSub, { color: colors.mutedForeground }]}>
                  Launch full ad campaigns with targeting, budgets & analytics in Ridhi Ads Manager
                </Text>
              </View>
              <Feather name="arrow-right" size={16} color="#7B2FBE" />
            </Pressable>

            <BoostSection colors={colors} />
          </View>
        )}

        {/* ══════════════ FAN CLUBS ══════════════ */}
        {section === "fan" && (
          <View style={styles.sectionWrap}>
            <Text style={[styles.fanDesc, { color: colors.mutedForeground }]}>
              Support your favourite creators and unlock exclusive content, perks and direct access — or set up your own fan membership as a creator.
            </Text>

            {FAN_TIERS.map((tier) => (
              <View key={tier.id} style={[styles.fanCard, { backgroundColor: colors.card, borderColor: tier.color + "50" }]}>
                <LinearGradient colors={[tier.color + "20", "transparent"]} style={styles.fanCardGrad} />
                <View style={styles.fanHead}>
                  <View style={[styles.fanIconCircle, { backgroundColor: tier.color + "20" }]}>
                    <Feather name={tier.icon as any} size={22} color={tier.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fanName, { color: colors.foreground }]}>{tier.name}</Text>
                    <Text style={[styles.fanPrice, { color: tier.color }]}>{tier.price}</Text>
                  </View>
                  <Pressable style={[styles.joinBtn, { backgroundColor: tier.color }]}>
                    <Text style={styles.joinTxt}>Join</Text>
                  </Pressable>
                </View>
                <View style={styles.perksWrap}>
                  {tier.perks.map(p => (
                    <View key={p} style={styles.perkRow}>
                      <Feather name="check" size={13} color={tier.color} />
                      <Text style={[styles.perkTxt, { color: colors.foreground }]}>{p}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            {/* Creator CTA */}
            <View style={[styles.creatorCTA, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
              <Feather name="zap" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.creatorTitle, { color: colors.foreground }]}>Are you a Creator?</Text>
                <Text style={[styles.creatorSub, { color: colors.mutedForeground }]}>
                  Set up your own fan membership tiers and earn monthly from your followers
                </Text>
              </View>
              <Pressable onPress={() => router.push("/creator-dashboard")}
                style={[styles.creatorBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.creatorBtnTxt}>Set Up</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Boost sub-styles ───────────────────────────────────────────────────────────
const bs = StyleSheet.create({
  chip:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipTxt:     { fontSize: 13, fontFamily: "Inter_500Medium" },
  progRow:     { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  progDot:     { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  progNum:     { fontSize: 12, fontFamily: "Inter_700Bold" },
  progLine:    { width: 40, height: 2, marginHorizontal: 4 },
  stepTitle:   { fontSize: 18, fontFamily: "Inter_700Bold" },
  stepSub:     { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: -8 },
  miniLabel:   { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: -6 },
  objCard:     { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  objIcon:     { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  objLabel:    { fontSize: 15, fontFamily: "Inter_700Bold" },
  objSub:      { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2, lineHeight: 17 },
  objCheck:    { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  leadPrompt:  { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14 },
  leadIcon:    { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  leadTitle:   { fontSize: 14, fontFamily: "Inter_700Bold" },
  leadSub:     { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  promBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 11, borderRadius: 12, borderWidth: 1 },
  promBtnTxt:  { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  nextGrad:    { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14 },
  nextTxt:     { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  backBtn:     { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1 },
  backTxt:     { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  budChip:     { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1, alignItems: "center", minWidth: 80 },
  budLabel:    { fontSize: 14, fontFamily: "Inter_700Bold" },
  budSub:      { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  estCard:     { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  estVal:      { fontSize: 15, fontFamily: "Inter_700Bold", marginTop: 4 },
  estLbl:      { fontSize: 11, fontFamily: "Inter_400Regular" },
  estNote:     { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  sumCard:     { borderRadius: 14, padding: 14, gap: 8 },
  sumTitle:    { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 2 },
  sumRow:      { flexDirection: "row", justifyContent: "space-between" },
  sumLabel:    { fontSize: 12, fontFamily: "Inter_400Regular" },
  sumVal:      { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  doneCtr:     { borderRadius: 20, borderWidth: 1, padding: 24, alignItems: "center", gap: 12 },
  doneCircle:  { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  doneTitle:   { fontSize: 20, fontFamily: "Inter_700Bold" },
  doneSub:     { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  doneStats:   { width: "100%", borderRadius: 14, padding: 14, flexDirection: "row", justifyContent: "space-around" },
  doneStat:    { alignItems: "center", gap: 4 },
  doneStatVal: { fontSize: 15, fontFamily: "Inter_700Bold" },
  doneStatLbl: { fontSize: 11, fontFamily: "Inter_400Regular" },
  doneBtn:     { borderRadius: 12, borderWidth: 1, paddingHorizontal: 24, paddingVertical: 10 },
  doneBtnTxt:  { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});

// ── Main styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:         { flex: 1 },
  header:       { paddingHorizontal: 16, paddingBottom: 0 },
  headerRow:    { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backBtn:      { padding: 8 },
  headerTitle:  { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  heroWrap:     { alignItems: "center", gap: 8, marginBottom: 16 },
  crownBadge:   { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  heroTitle:    { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff", textAlign: "center", lineHeight: 32 },
  heroSub:      { fontSize: 12, color: "rgba(255,255,255,0.82)", fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 17 },
  statsStrip:   { flexDirection: "row", justifyContent: "space-around", paddingVertical: 12, marginHorizontal: -16, paddingHorizontal: 16, backgroundColor: "rgba(0,0,0,0.12)", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(255,255,255,0.15)", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.15)" },
  statItem:     { alignItems: "center" },
  statVal:      { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  statLabel:    { fontSize: 10, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular", marginTop: 1 },
  tabBar:       { flexDirection: "row", marginTop: 10, marginHorizontal: -16, paddingHorizontal: 8, borderRadius: 0, paddingVertical: 4 },
  tabBtn:       { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 9, borderRadius: 8 },
  tabBtnActive: { backgroundColor: "rgba(255,255,255,0.92)" },
  tabTxt:       { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.8)" },
  tabTxtActive: { color: "#7B2FBE" },
  sectionWrap:  { padding: 16, gap: 14 },

  // Unlock card
  unlockCard:      { borderRadius: 18, borderWidth: 1, padding: 16, gap: 14 },
  unlockCardTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  unlockCardSub:   { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: -8 },
  catTab:          { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  catTabTxt:       { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  featGrid:        { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  featCell:        { width: (width - 64) / 2, borderRadius: 12, borderWidth: 1, padding: 11, gap: 6 },
  featIcon:        { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  featLabel:       { fontSize: 12, fontFamily: "Inter_600SemiBold", lineHeight: 15 },
  featPlanBadge:   { alignSelf: "flex-start", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  featPlanTxt:     { color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold" },

  // Plan card
  planCard:      { borderRadius: 18, overflow: "hidden" },
  popularBanner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 7 },
  popularText:   { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  planTop:       { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, paddingBottom: 8 },
  planIconWrap:  { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  planName:      { fontSize: 17, fontFamily: "Inter_700Bold" },
  planPrice:     { fontSize: 24, fontFamily: "Inter_700Bold" },
  planPeriod:    { fontSize: 13, fontFamily: "Inter_400Regular" },
  selCheck:      { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  planHighlights:{ flexDirection: "row", justifyContent: "space-around", marginHorizontal: 12, borderRadius: 12, borderWidth: 1, paddingVertical: 9, marginBottom: 2 },
  planHL:        { flexDirection: "row", alignItems: "center", gap: 4 },
  planHLTxt:     { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  featList:      { paddingHorizontal: 16, paddingVertical: 10, gap: 7 },
  featRow:       { flexDirection: "row", alignItems: "center", gap: 8 },
  featTxt:       { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  moreLocked:    { fontSize: 11, fontFamily: "Inter_400Regular", marginLeft: 22 },
  subBtn:        { margin: 12, marginTop: 4, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  subBtnTxt:     { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },

  // Compare
  compareToggle:    { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, borderWidth: 1, paddingVertical: 13 },
  compareToggleTxt: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  compareTitle:     { fontSize: 16, fontFamily: "Inter_700Bold" },
  tableWrap:        { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  tableRow:         { flexDirection: "row" },
  tableCell:        { paddingVertical: 9, paddingHorizontal: 5, alignItems: "center", justifyContent: "center" },
  tableHead:        { fontSize: 10, fontFamily: "Inter_700Bold", textAlign: "center" },
  tableTxt:         { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  tableCross:       { fontSize: 12, fontFamily: "Inter_400Regular" },

  // Payment
  payCard:      { borderRadius: 16, borderWidth: 1, padding: 16 },
  payTitle:     { fontSize: 15, fontFamily: "Inter_700Bold" },
  payMethod:    { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
  payMethodTxt: { fontSize: 12, fontFamily: "Inter_500Medium" },
  payNote:      { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 10, textAlign: "center" },

  // Boost
  boostHero:    { borderRadius: 20, borderWidth: 1, padding: 20, alignItems: "center", gap: 10 },
  boostHeroIcon:{ width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  boostTitle:   { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  boostSub:     { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  boostStatVal: { fontSize: 17, fontFamily: "Inter_700Bold" },
  boostStatLbl: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  bizAdBanner:  { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  bizAdIcon:    { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  bizAdTitle:   { fontSize: 14, fontFamily: "Inter_700Bold" },
  bizAdSub:     { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },

  // Fan
  fanDesc:       { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  fanCard:       { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  fanCardGrad:   { position: "absolute", top: 0, left: 0, right: 0, height: 60 },
  fanHead:       { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, paddingBottom: 10 },
  fanIconCircle: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  fanName:       { fontSize: 16, fontFamily: "Inter_700Bold" },
  fanPrice:      { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  joinBtn:       { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  joinTxt:       { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  perksWrap:     { paddingHorizontal: 16, paddingBottom: 14, gap: 6 },
  perkRow:       { flexDirection: "row", alignItems: "center", gap: 8 },
  perkTxt:       { fontSize: 13, fontFamily: "Inter_400Regular" },
  creatorCTA:    { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  creatorTitle:  { fontSize: 14, fontFamily: "Inter_700Bold" },
  creatorSub:    { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  creatorBtn:    { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  creatorBtnTxt: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
});
