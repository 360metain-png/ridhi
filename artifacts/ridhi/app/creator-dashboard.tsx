import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { PrivateHead } from "@/components/PrivateHead";
import { useAuth } from "@/contexts/AuthContext";
import { useTrackScreen } from "@/hooks/useAnalytics";

const { width } = Dimensions.get("window");

/* ── Tier Definitions ────────────────────────────────────────────── */

type CreatorTier = "free" | "starter" | "pro" | "elite";

function getTierRank(tier: CreatorTier): number {
  return { free: 0, starter: 1, pro: 2, elite: 3 }[tier];
}

function getTierLabel(tier: CreatorTier): string {
  return { free: "Free", starter: "Starter", pro: "Pro", elite: "Elite" }[tier];
}

function getTierColor(tier: CreatorTier): string {
  return { free: "#34C759", starter: "#2196F3", pro: "#9C27B0", elite: "#E91E8C" }[tier];
}

/* ── Mock Data ────────────────────────────────────────────── */

// Basic analytics (free)
const BASIC_ANALYTICS = [
  { label: "Total Views", value: "24.8K", change: "+12%", icon: "eye", positive: true },
  { label: "New Followers", value: "342", change: "+8%", icon: "user-plus", positive: true },
  { label: "Profile Visits", value: "1.2K", change: "+23%", icon: "activity", positive: true },
  { label: "Reach", value: "8.4K", change: "-3%", icon: "radio", positive: false },
];

// Advanced analytics (pro/elite)
const ADVANCED_ANALYTICS = [
  { label: "Watch Time", value: "1.2K hrs", change: "+18%", icon: "clock", positive: true },
  { label: "Avg View Duration", value: "2:34", change: "+5%", icon: "watch", positive: true },
  { label: "Click-Through Rate", value: "8.4%", change: "+1.2%", icon: "mouse-pointer", positive: true },
  { label: "Returning Viewers", value: "3.1K", change: "+15%", icon: "rotate-ccw", positive: true },
  { label: "Unique Viewers", value: "18.2K", change: "+9%", icon: "users", positive: true },
  { label: "Impressions", value: "142K", change: "+22%", icon: "hash", positive: true },
  { label: "Engagement Rate", value: "4.8%", change: "+0.6%", icon: "heart", positive: true },
  { label: "Subscriber Conversion", value: "2.1%", change: "+0.3%", icon: "user-check", positive: true },
];

const TOP_CONTENT = [
  { id: "1", title: "Mumbai street food vlog", views: "8.2K", likes: 412, type: "video" as const },
  { id: "2", title: "Sunrise at Marine Drive", views: "5.1K", likes: 287, type: "image" as const },
  { id: "3", title: "Morning run challenge", views: "3.4K", likes: 198, type: "reel" as const },
];

// Advanced content (pro/elite)
const ADVANCED_CONTENT = [
  { id: "1", title: "Mumbai street food vlog", views: "8.2K", likes: 412, comments: 89, shares: 34, retention: "72%", type: "video" as const },
  { id: "2", title: "Sunrise at Marine Drive", views: "5.1K", likes: 287, comments: 56, shares: 21, retention: "65%", type: "image" as const },
  { id: "3", title: "Morning run challenge", views: "3.4K", likes: 198, comments: 45, shares: 67, retention: "58%", type: "reel" as const },
  { id: "4", title: "Diwali special recipe", views: "2.8K", likes: 156, comments: 78, shares: 42, retention: "81%", type: "video" as const },
];

const EARNINGS = [
  { source: "Virtual Gifts", amount: "₹1,240", icon: "gift", color: "#E91E8C" },
  { source: "Creator Fund", amount: "₹890", icon: "trending-up", color: "#34C759" },
  { source: "Coin Tips", amount: "₹320", icon: "star", color: "#FFB800" },
  { source: "Download Earnings", amount: "₹0", icon: "download", color: "#7B2FBE" },
];

// Advanced earnings (pro/elite)
const ADVANCED_EARNINGS = [
  { source: "Virtual Gifts", amount: "₹1,240", trend: "+12%", icon: "gift", color: "#E91E8C" },
  { source: "Creator Fund", amount: "₹890", trend: "+8%", icon: "trending-up", color: "#34C759" },
  { source: "Coin Tips", amount: "₹320", trend: "+5%", icon: "star", color: "#FFB800" },
  { source: "Download Earnings", amount: "₹0", trend: "0%", icon: "download", color: "#7B2FBE" },
  { source: "Live Stream Gifts", amount: "₹2,100", trend: "+24%", icon: "radio", color: "#FF6B35" },
  { source: "Fan Club Subs", amount: "₹450", trend: "+15%", icon: "users", color: "#4A90E2" },
  { source: "Brand Deals", amount: "₹0", trend: "N/A", icon: "briefcase", color: "#00BCD4", locked: true },
];

// Demographics data (pro/elite)
const DEMOGRAPHICS = {
  age: [
    { label: "13-17", pct: 15 },
    { label: "18-24", pct: 42 },
    { label: "25-34", pct: 28 },
    { label: "35-44", pct: 10 },
    { label: "45+", pct: 5 },
  ],
  gender: [
    { label: "Male", pct: 58 },
    { label: "Female", pct: 40 },
    { label: "Other", pct: 2 },
  ],
  topCities: [
    { city: "Mumbai", pct: 22 },
    { city: "Delhi", pct: 18 },
    { city: "Bangalore", pct: 14 },
    { city: "Hyderabad", pct: 10 },
    { city: "Chennai", pct: 8 },
  ],
  devices: [
    { label: "Android", pct: 72 },
    { label: "iOS", pct: 26 },
    { label: "Web", pct: 2 },
  ],
};

// Revenue projection (elite)
const REVENUE_PROJECTION = [
  { month: "Jul", actual: 2450, projected: 2800 },
  { month: "Aug", actual: 0, projected: 3200 },
  { month: "Sep", actual: 0, projected: 4100 },
  { month: "Oct", actual: 0, projected: 5200 },
  { month: "Nov", actual: 0, projected: 6800 },
  { month: "Dec", actual: 0, projected: 8500 },
];

interface BarData { label: string; height: number; }

const WEEK_BAR_DATA: BarData[] = [
  { label: "Mon", height: 0.4 },
  { label: "Tue", height: 0.65 },
  { label: "Wed", height: 0.55 },
  { label: "Thu", height: 0.8 },
  { label: "Fri", height: 0.9 },
  { label: "Sat", height: 1.0 },
  { label: "Sun", height: 0.7 },
];

const MONTH_BAR_DATA: BarData[] = [
  { label: "Jan", height: 0.3 },
  { label: "Feb", height: 0.45 },
  { label: "Mar", height: 0.6 },
  { label: "Apr", height: 0.5 },
  { label: "May", height: 0.72 },
  { label: "Jun", height: 0.85 },
  { label: "Jul", height: 0.92 },
  { label: "Aug", height: 0.78 },
  { label: "Sep", height: 0.88 },
  { label: "Oct", height: 0.76 },
  { label: "Nov", height: 0.95 },
  { label: "Dec", height: 1.0 },
];

/* ── Components ────────────────────────────────────────────── */

function ProgressBar({ pct, color, bgColor }: { pct: number; color: string; bgColor: string }) {
  return (
    <View style={[styles.progressTrack, { backgroundColor: bgColor }]}>
      <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

function LockOverlay({ label }: { label: string }) {
  const colors = useColors();
  return (
    <View style={[styles.lockOverlay, { backgroundColor: colors.background + "DD" }]}>
      <View style={[styles.lockBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="lock" size={20} color={colors.primary} />
        <Text style={[styles.lockText, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.lockSub, { color: colors.mutedForeground }]}>Upgrade to unlock</Text>
      </View>
    </View>
  );
}

/* ── Main Screen ────────────────────────────────────────────── */

export default function CreatorDashboardScreen() {
  useTrackScreen("creator_dashboard");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [period, setPeriod] = useState<"week" | "month" | "all">("week");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const userTier: CreatorTier = (user?.creatorPlan as CreatorTier) || "free";
  const tierColor = getTierColor(userTier);
  const tierLabel = getTierLabel(userTier);
  const isPro = getTierRank(userTier) >= 2;
  const isElite = getTierRank(userTier) >= 3;

  const showUpgrade = (target: CreatorTier) => {
    Alert.alert(
      `${getTierLabel(target)} Feature`,
      `Upgrade to ${getTierLabel(target)} to unlock advanced analytics and insights.`,
      [
        { text: "Not Now", style: "cancel" },
        { text: "Upgrade", onPress: () => router.push("/subscription" as any) },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PrivateHead />

      {/* ── Header ── */}
      <LinearGradient colors={[colors.primary, colors.secondary]} style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Creator Dashboard</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.tierBadge}>
          <View style={[styles.tierDot, { backgroundColor: tierColor }]} />
          <Text style={styles.tierText}>{tierLabel} Creator</Text>
        </View>

        <View style={styles.earningsBlock}>
          <Text style={styles.earningsLabel}>Total Earnings</Text>
          <Text style={styles.earningsValue}>₹2,450</Text>
          <Text style={styles.earningsSub}>This month · Updated just now</Text>
        </View>

        <View style={styles.periodRow}>
          {(["week", "month", "all"] as const).map((p) => (
            <Pressable
              key={p}
              onPress={() => setPeriod(p)}
              style={[styles.periodBtn, period === p && { backgroundColor: "rgba(255,255,255,0.25)" }]}
            >
              <Text style={styles.periodText}>
                {p === "week" ? "This Week" : p === "month" ? "This Month" : "All Time"}
              </Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 84 : insets.bottom + 32 }}
      >
        {/* ── KYC Banner ── */}
        {user?.kycStatus !== "verified" ? (
          <Pressable onPress={() => router.push("/kyc" as any)} style={styles.kycBanner}>
            <View style={styles.kycLeft}>
              <Feather name="alert-triangle" size={18} color="#FFB800" />
              <View>
                <Text style={styles.kycTitle}>Complete E-KYC to Unlock Earnings</Text>
                <Text style={styles.kycSub}>Aadhaar + PAN + Bank · 2-5 minutes</Text>
              </View>
            </View>
            <View style={styles.kycAction}>
              <Text style={styles.kycActionText}>Verify</Text>
              <Feather name="arrow-right" size={14} color="#FFB800" />
            </View>
          </Pressable>
        ) : (
          <View style={[styles.kycBanner, { borderColor: "#22C55E40", backgroundColor: "#22C55E10" }]}>
            <View style={styles.kycLeft}>
              <Feather name="check-circle" size={18} color="#22C55E" />
              <View>
                <Text style={[styles.kycTitle, { color: "#22C55E" }]}>E-KYC Verified ✓</Text>
                <Text style={styles.kycSub}>Withdrawals enabled</Text>
              </View>
            </View>
            <Feather name="check" size={14} color="#22C55E" />
          </View>
        )}

        {/* ── BASIC ANALYTICS (Free) ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Basic Analytics</Text>
          <View style={styles.statsGrid}>
            {BASIC_ANALYTICS.map((stat) => (
              <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.statIcon, { backgroundColor: colors.primary + "18" }]}>
                  <Feather name={stat.icon as any} size={18} color={colors.primary} />
                </View>
                <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
                <Text style={[styles.statChange, { color: stat.positive ? colors.success : colors.destructive }]}>
                  {stat.change}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── ADVANCED ANALYTICS (Pro/Elite) ── */}
        <View style={[styles.section, { position: "relative" }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Advanced Analytics
              <Text style={[styles.proBadge, { color: tierColor }]}> {isPro ? "✓" : "Pro"}</Text>
            </Text>
          </View>
          <View style={styles.statsGrid}>
            {ADVANCED_ANALYTICS.map((stat) => (
              <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: isPro ? 1 : 0.5 }]}>
                <View style={[styles.statIcon, { backgroundColor: isPro ? colors.primary + "18" : colors.muted + "30" }]}>
                  <Feather name={stat.icon as any} size={18} color={isPro ? colors.primary : colors.mutedForeground} />
                </View>
                <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
                <Text style={[styles.statChange, { color: stat.positive ? colors.success : colors.destructive }]}>
                  {stat.change}
                </Text>
              </View>
            ))}
          </View>
          {!isPro && (
            <Pressable onPress={() => showUpgrade("pro")} style={StyleSheet.absoluteFill}>
              <LockOverlay label="Advanced Analytics" />
            </Pressable>
          )}
        </View>

        {/* ── VIEWS CHART ── */}
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>
            Views {period === "week" ? "This Week" : period === "month" ? "This Month" : "All Time"}
          </Text>
          <View style={styles.barChart}>
            {(period === "week" ? WEEK_BAR_DATA : MONTH_BAR_DATA).map((bar, i) => (
              <View key={i} style={styles.barCol}>
                <View style={styles.barWrap}>
                  <LinearGradient colors={[colors.primary, colors.secondary]} style={[styles.bar, { height: 120 * bar.height }]} />
                </View>
                <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{bar.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── DEMOGRAPHICS (Pro/Elite) ── */}
        <View style={[styles.section, { position: "relative" }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Audience Demographics
              <Text style={[styles.proBadge, { color: tierColor }]}> {isPro ? "✓" : "Pro"}</Text>
            </Text>
          </View>
          <View style={[styles.demoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.demoTitle, { color: colors.foreground }]}>Age Distribution</Text>
            {DEMOGRAPHICS.age.map((d) => (
              <View key={d.label} style={styles.demoRow}>
                <Text style={[styles.demoLabel, { color: colors.mutedForeground }]}>{d.label}</Text>
                <ProgressBar pct={d.pct} color={colors.primary} bgColor={colors.muted + "40"} />
                <Text style={[styles.demoPct, { color: colors.foreground }]}>{d.pct}%</Text>
              </View>
            ))}

            <Text style={[styles.demoTitle, { color: colors.foreground, marginTop: 16 }]}>Gender</Text>
            <View style={styles.genderRow}>
              {DEMOGRAPHICS.gender.map((g) => (
                <View key={g.label} style={[styles.genderItem, { backgroundColor: colors.muted + "20" }]}>
                  <Text style={[styles.genderPct, { color: colors.foreground }]}>{g.pct}%</Text>
                  <Text style={[styles.genderLabel, { color: colors.mutedForeground }]}>{g.label}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.demoTitle, { color: colors.foreground, marginTop: 16 }]}>Top Cities</Text>
            {DEMOGRAPHICS.topCities.map((c) => (
              <View key={c.city} style={styles.demoRow}>
                <Text style={[styles.demoLabel, { color: colors.mutedForeground, width: 100 }]}>{c.city}</Text>
                <ProgressBar pct={c.pct} color={colors.secondary} bgColor={colors.muted + "40"} />
                <Text style={[styles.demoPct, { color: colors.foreground }]}>{c.pct}%</Text>
              </View>
            ))}
          </View>
          {!isPro && (
            <Pressable onPress={() => showUpgrade("pro")} style={StyleSheet.absoluteFill}>
              <LockOverlay label="Audience Demographics" />
            </Pressable>
          )}
        </View>

        {/* ── TOP CONTENT ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Top Content</Text>
          {(isPro ? ADVANCED_CONTENT : TOP_CONTENT).map((content) => (
            <View key={content.id} style={[styles.contentRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.contentIcon, { backgroundColor: colors.primary + "18" }]}>
                <Feather name={content.type === "reel" ? "play" : content.type === "image" ? "image" : "video"} size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contentTitle, { color: colors.foreground }]}>{content.title}</Text>
                <Text style={[styles.contentMeta, { color: colors.mutedForeground }]}>
                  {content.views} views · {content.likes} likes
                  {isPro && " · " + (content as any).retention + " retention"}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </View>
          ))}
        </View>

        {/* ── REVENUE PROJECTION (Elite) ── */}
        <View style={[styles.section, { position: "relative" }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Revenue Projection
              <Text style={[styles.proBadge, { color: tierColor }]}> {isElite ? "✓" : "Elite"}</Text>
            </Text>
          </View>
          <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.chartTitle, { color: colors.foreground }]}>6-Month Revenue Forecast</Text>
            <View style={styles.barChart}>
              {REVENUE_PROJECTION.map((m, i) => (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barWrap}>
                    {m.actual > 0 && (
                      <LinearGradient colors={[colors.success, colors.success + "80"]} style={[styles.bar, { height: (m.actual / 10000) * 120 }]} />
                    )}
                    {m.actual === 0 && (
                      <View style={[styles.bar, { height: (m.projected / 10000) * 120, backgroundColor: colors.muted + "40" }]} />
                    )}
                  </View>
                  <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{m.month}</Text>
                  <Text style={[styles.barValue, { color: m.actual > 0 ? colors.success : colors.mutedForeground }]}>
                    {m.actual > 0 ? "₹" + (m.actual / 1000).toFixed(1) + "K" : "₹" + (m.projected / 1000).toFixed(1) + "K"}
                  </Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 8 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success }} />
                <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Actual</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.muted + "40" }} />
                <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Projected</Text>
              </View>
            </View>
          </View>
          {!isElite && (
            <Pressable onPress={() => showUpgrade("elite")} style={StyleSheet.absoluteFill}>
              <LockOverlay label="Revenue Projection" />
            </Pressable>
          )}
        </View>

        {/* ── EARNINGS ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Earnings Breakdown</Text>
          {(isPro ? ADVANCED_EARNINGS : EARNINGS).map((e: any) => (
            <View key={e.source} style={[styles.earningRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.earningIcon, { backgroundColor: e.color + "20" }]}>
                <Feather name={e.icon as any} size={18} color={e.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.earningSource, { color: colors.foreground }]}>{e.source}</Text>
                {isPro && e.trend && (
                  <Text style={[styles.earningTrend, { color: e.trend.startsWith("+") ? colors.success : e.trend === "0%" ? colors.mutedForeground : colors.mutedForeground }]}>
                    {e.trend}
                  </Text>
                )}
              </View>
              <Text style={[styles.earningAmt, { color: e.locked ? colors.mutedForeground : colors.foreground }]}>
                {e.amount}
                {e.locked && <Text style={{ fontSize: 11, color: colors.mutedForeground }}> (Locked)</Text>}
              </Text>
            </View>
          ))}
        </View>

        {/* ── WITHDRAWAL ── */}
        <View style={[styles.section, { paddingBottom: 20 }]}>
          <Pressable
            onPress={() => router.push("/withdraw" as any)}
            style={[styles.withdrawBtn, { backgroundColor: colors.primary }]}>
            <Feather name="arrow-up-circle" size={18} color="#fff" />
            <Text style={styles.withdrawText}>Request Withdrawal</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const CARD_W = (width - 52) / 2;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24, gap: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { padding: 4 },
  headerTitle: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tierDot: { width: 8, height: 8, borderRadius: 4 },
  tierText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  earningsBlock: { gap: 4 },
  earningsLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "Inter_400Regular" },
  earningsValue: { color: "#fff", fontSize: 40, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  earningsSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular" },
  periodRow: { flexDirection: "row", gap: 8 },
  periodBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  periodText: { color: "#fff", fontSize: 12, fontFamily: "Inter_500Medium" },
  kycBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#FFB80040",
    backgroundColor: "#FFB80012",
    gap: 10,
  },
  kycLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  kycTitle: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#FFB800" },
  kycSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#FFB800BB", marginTop: 2 },
  kycAction: { flexDirection: "row", alignItems: "center", gap: 4 },
  kycActionText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#FFB800" },
  section: { paddingHorizontal: 16, paddingTop: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 12 },
  proBadge: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    width: CARD_W,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statChange: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  chartCard: { marginHorizontal: 16, padding: 16, borderRadius: 18, borderWidth: 1, gap: 16 },
  chartTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  barChart: { flexDirection: "row", alignItems: "flex-end", gap: 8, height: 160 },
  barCol: { flex: 1, alignItems: "center", gap: 6 },
  barWrap: { flex: 1, justifyContent: "flex-end", width: "100%" },
  bar: { width: "100%", borderRadius: 6, minHeight: 4 },
  barLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  barValue: { fontSize: 10, fontFamily: "Inter_700Bold" },
  legendText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  demoCard: { marginHorizontal: 16, padding: 16, borderRadius: 18, borderWidth: 1, gap: 10 },
  demoTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  demoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  demoLabel: { fontSize: 12, fontFamily: "Inter_400Regular", width: 50 },
  demoPct: { fontSize: 12, fontFamily: "Inter_700Bold", width: 30, textAlign: "right" },
  progressTrack: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  genderRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  genderItem: { flex: 1, alignItems: "center", padding: 12, borderRadius: 12 },
  genderPct: { fontSize: 20, fontFamily: "Inter_700Bold" },
  genderLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  contentIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  contentTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  contentMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  earningRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  earningIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  earningSource: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  earningTrend: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginTop: 2 },
  earningAmt: { fontSize: 16, fontFamily: "Inter_700Bold" },
  withdrawBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  withdrawText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  lockBox: {
    alignItems: "center",
    gap: 8,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  lockText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  lockSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
