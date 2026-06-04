import React, { useState } from "react";
import {
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

const { width } = Dimensions.get("window");

const ANALYTICS = [
  { label: "Total Views", value: "24.8K", change: "+12%", icon: "eye", positive: true },
  { label: "New Followers", value: "342", change: "+8%", icon: "user-plus", positive: true },
  { label: "Profile Visits", value: "1.2K", change: "+23%", icon: "activity", positive: true },
  { label: "Reach", value: "8.4K", change: "-3%", icon: "radio", positive: false },
];

const TOP_CONTENT = [
  { id: "1", title: "Mumbai street food vlog", views: "8.2K", likes: 412, type: "video" },
  { id: "2", title: "Sunrise at Marine Drive", views: "5.1K", likes: 287, type: "image" },
  { id: "3", title: "Morning run challenge", views: "3.4K", likes: 198, type: "reel" },
];

const EARNINGS = [
  { source: "Virtual Gifts", amount: "₹1,240", icon: "gift", color: "#E91E8C" },
  { source: "Creator Fund", amount: "₹890", icon: "trending-up", color: "#34C759" },
  { source: "Coin Tips", amount: "₹320", icon: "star", color: "#FFB800" },
];

export default function CreatorDashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [period, setPeriod] = useState<"week" | "month" | "all">("week");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const BAR_DATA = [
    { day: "Mon", height: 0.4 },
    { day: "Tue", height: 0.65 },
    { day: "Wed", height: 0.55 },
    { day: "Thu", height: 0.8 },
    { day: "Fri", height: 0.9 },
    { day: "Sat", height: 1.0 },
    { day: "Sun", height: 0.7 },
  ];

  const MAX_BAR = 120;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PrivateHead />
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={[styles.topGrad, { paddingTop: topPad + 10 }]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Creator Dashboard</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.creatorBadge}>
          <Feather name="zap" size={18} color={colors.gold} />
          <Text style={styles.creatorBadgeText}>Creator Account</Text>
        </View>

        <View style={styles.totalEarnings}>
          <Text style={styles.earningsLabel}>Total Earnings</Text>
          <Text style={styles.earningsValue}>₹2,450</Text>
          <Text style={styles.earningsSub}>This month · Updated just now</Text>
        </View>

        <View style={styles.periodRow}>
          {(["week", "month", "all"] as const).map((p) => (
            <Pressable
              key={p}
              onPress={() => setPeriod(p)}
              style={[
                styles.periodBtn,
                period === p && { backgroundColor: "rgba(255,255,255,0.25)" },
              ]}
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
        {/* ── KYC Gate Banner ── */}
        {user?.kycStatus !== "verified" ? (
          <Pressable
            onPress={() => router.push("/kyc" as any)}
            style={styles.kycBanner}
          >
            <View style={styles.kycBannerLeft}>
              <Feather name="alert-triangle" size={18} color="#FFB800" />
              <View>
                <Text style={styles.kycBannerTitle}>Complete E-KYC to Unlock Earnings</Text>
                <Text style={styles.kycBannerSub}>Aadhaar + PAN + Bank verification required · 2–5 minutes</Text>
              </View>
            </View>
            <View style={styles.kycBannerAction}>
              <Text style={styles.kycBannerActionText}>Verify Now</Text>
              <Feather name="arrow-right" size={14} color="#FFB800" />
            </View>
          </Pressable>
        ) : (
          <View style={[styles.kycBanner, { borderColor: "#22C55E40", backgroundColor: "#22C55E10" }]}>
            <View style={styles.kycBannerLeft}>
              <Feather name="check-circle" size={18} color="#22C55E" />
              <View>
                <Text style={[styles.kycBannerTitle, { color: "#22C55E" }]}>E-KYC Verified ✓</Text>
                <Text style={styles.kycBannerSub}>Aadhaar, PAN & Bank verified · Withdrawals enabled</Text>
              </View>
            </View>
            <Feather name="check" size={14} color="#22C55E" />
          </View>
        )}

        <View style={styles.statsGrid}>
          {ANALYTICS.map((stat) => (
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

        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>Views This Week</Text>
          <View style={styles.barChart}>
            {BAR_DATA.map((bar) => (
              <View key={bar.day} style={styles.barCol}>
                <View style={styles.barWrap}>
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    style={[styles.bar, { height: MAX_BAR * bar.height }]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{bar.day}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Top Content</Text>
          {TOP_CONTENT.map((content) => (
            <View
              key={content.id}
              style={[styles.contentRow, { borderBottomColor: colors.border }]}
            >
              <View style={[styles.contentIcon, { backgroundColor: colors.primary + "18" }]}>
                <Feather
                  name={content.type === "reel" ? "play" : content.type === "image" ? "image" : "video"}
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contentTitle, { color: colors.foreground }]}>{content.title}</Text>
                <Text style={[styles.contentMeta, { color: colors.mutedForeground }]}>
                  {content.views} views · {content.likes} likes
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Earnings Breakdown</Text>
          {EARNINGS.map((e) => (
            <View key={e.source} style={[styles.earningRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.earningIcon, { backgroundColor: e.color + "20" }]}>
                <Feather name={e.icon as any} size={18} color={e.color} />
              </View>
              <Text style={[styles.earningSource, { color: colors.foreground }]}>{e.source}</Text>
              <Text style={[styles.earningAmt, { color: colors.foreground }]}>{e.amount}</Text>
            </View>
          ))}

          <Pressable
            onPress={() => router.push("/withdraw" as any)}
            style={[styles.withdrawBtn, { backgroundColor: colors.primary }]}
            accessibilityLabel="Request withdrawal of earnings"
          >
            <Feather name="arrow-up-circle" size={18} color="#fff" />
            <Text style={styles.withdrawText}>Request Withdrawal</Text>
          </Pressable>
        </View>

        <View style={[styles.section, { paddingBottom: 4 }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Host Level Status</Text>
          <LinearGradient
            colors={["#FFB80025", "#FFB80008"]}
            style={[styles.hostLevelCard, { borderColor: "#FFB80050" }]}
          >
            <View style={styles.hostLevelTop}>
              <Text style={styles.hostLevelEmoji}>🥇</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.hostLevelName, { color: colors.foreground }]}>L3 Popular · Gold Badge</Text>
                <Text style={[styles.hostLevelEarnings, { color: "#FFB800" }]}>Est. ₹25K–₹60K / month</Text>
              </View>
              <Pressable onPress={() => router.push("/host-profile" as any)} style={[styles.hostLevelBtn, { backgroundColor: "#FFB80025", borderColor: "#FFB80060" }]}>
                <Text style={[styles.hostLevelBtnText, { color: "#FFB800" }]}>View</Text>
                <Feather name="chevron-right" size={13} color="#FFB800" />
              </Pressable>
            </View>
            <View style={styles.hostLevelProgress}>
              <View style={styles.hostLevelProgressHeader}>
                <Text style={[styles.hostLevelProgressLabel, { color: colors.mutedForeground }]}>Progress to L4 Platinum</Text>
                <Text style={[styles.hostLevelProgressVal, { color: "#FFB800" }]}>1.8L / 3L coins</Text>
              </View>
              <View style={[styles.hostProgressBar, { backgroundColor: colors.muted }]}>
                <LinearGradient colors={["#FFB800", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.hostProgressFill, { width: "60%" }]} />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ── My Leads ── */}
        <View style={[styles.section, { paddingBottom: 4 }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My Leads</Text>
            <Pressable onPress={() => router.push("/lead-form-builder" as any)}
              style={[styles.sectionAction, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "40" }]}>
              <Feather name="plus" size={13} color={colors.primary} />
              <Text style={[styles.sectionActionText, { color: colors.primary }]}>New Form</Text>
            </Pressable>
          </View>

          {/* Stats row */}
          <View style={styles.leadsStatRow}>
            {[
              { val: "312",   label: "Total Leads",     color: "#2196F3", icon: "user-plus" },
              { val: "48",    label: "This Week",        color: "#34C759", icon: "trending-up" },
              { val: "12.4%", label: "Conv. Rate",       color: "#FFB800", icon: "percent" },
            ].map(({ val, label, color, icon }) => (
              <View key={label} style={[styles.leadStat, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.leadStatIcon, { backgroundColor: color + "18" }]}>
                  <Feather name={icon as any} size={16} color={color} />
                </View>
                <Text style={[styles.leadStatVal, { color: colors.foreground }]}>{val}</Text>
                <Text style={[styles.leadStatLabel, { color: colors.mutedForeground }]}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Recent leads */}
          <View style={[styles.leadsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.leadsCardTitle, { color: colors.foreground }]}>Recent Submissions</Text>
            {[
              { name: "Rahul Kumar",   city: "Delhi",     form: "Tech Consultation", time: "2h ago",  phone: "+91 98765 43210" },
              { name: "Ananya Mehta",  city: "Pune",      form: "Tech Consultation", time: "4h ago",  phone: "+91 87654 32109" },
              { name: "Kavya K.",      city: "Chennai",   form: "Tech Consultation", time: "Yesterday",phone: "+91 76543 21098" },
            ].map((lead, i) => (
              <View key={i} style={[styles.leadRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.leadAvatar, { backgroundColor: "#2196F320" }]}>
                  <Text style={[styles.leadAvatarText, { color: "#2196F3" }]}>{lead.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.leadName, { color: colors.foreground }]}>{lead.name}</Text>
                  <Text style={[styles.leadMeta, { color: colors.mutedForeground }]}>{lead.city} · {lead.form}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 3 }}>
                  <Text style={[styles.leadTime, { color: colors.mutedForeground }]}>{lead.time}</Text>
                  <Pressable style={[styles.contactBtn, { backgroundColor: "#2196F320", borderColor: "#2196F340" }]}>
                    <Feather name="phone" size={11} color="#2196F3" />
                    <Text style={styles.contactBtnText}>Call</Text>
                  </Pressable>
                </View>
              </View>
            ))}
            <Pressable onPress={() => router.push("/lead-form-builder" as any)}
              style={[styles.viewAllBtn, { borderColor: colors.border }]}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All Leads & Forms</Text>
              <Feather name="arrow-right" size={14} color={colors.primary} />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Creator Tools</Text>
          <View style={styles.toolsGrid}>
            {[
              { icon: "upload-cloud", label: "Upload Studio",  color: "#E91E8C", route: "/create-post" },
              { icon: "radio",        label: "Go Live",         color: "#FF3B30", route: "/live-stream" },
              { icon: "bar-chart-2",  label: "Analytics",       color: "#4A90E2", route: "/creator-dashboard" },
              { icon: "calendar",     label: "Scheduled",     color: "#34C759", route: "/scheduled-content" },
              { icon: "users",        label: "Fan Club",         color: "#7B2FBE", route: "/communities" },
              { icon: "user-plus",    label: "Lead Forms",       color: "#2196F3", route: "/lead-form-builder" },
              { icon: "trending-up",  label: "Boost & Ads",      color: "#FF9500", route: "/subscription" },
            ].map((tool) => (
              <Pressable
                key={tool.label}
                onPress={() => router.push(tool.route as any)}
                style={[styles.tool, { backgroundColor: colors.card, borderColor: colors.border }]}
                accessibilityLabel={tool.label}
              >
                <View style={[styles.toolIcon, { backgroundColor: tool.color + "20" }]}>
                  <Feather name={tool.icon as any} size={22} color={tool.color} />
                </View>
                <Text style={[styles.toolLabel, { color: colors.foreground }]}>{tool.label}</Text>
              </Pressable>
            ))}
            {/* dummy to maintain even grid */}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const CARD_W = (width - 52) / 2;

const styles = StyleSheet.create({
  container: { flex: 1 },
  topGrad: { paddingHorizontal: 20, paddingBottom: 24, gap: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { padding: 4 },
  headerTitle: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  creatorBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  creatorBadgeText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  totalEarnings: { gap: 4 },
  earningsLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "Inter_400Regular" },
  earningsValue: { color: "#fff", fontSize: 40, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  earningsSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular" },
  periodRow: { flexDirection: "row", gap: 8 },
  periodBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  periodText: { color: "#fff", fontSize: 12, fontFamily: "Inter_500Medium" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, padding: 16 },
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
  barChart: { flexDirection: "row", alignItems: "flex-end", gap: 8, height: 140 },
  barCol: { flex: 1, alignItems: "center", gap: 6 },
  barWrap: { flex: 1, justifyContent: "flex-end", width: "100%" },
  bar: { width: "100%", borderRadius: 6, minHeight: 4 },
  barLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  section: { paddingHorizontal: 16, paddingTop: 24 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 14 },
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
  earningAmt: { fontSize: 16, fontFamily: "Inter_700Bold" },
  withdrawBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 16,
  },
  withdrawText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  toolsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tool: {
    width: CARD_W,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    gap: 10,
  },
  toolIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  toolLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  hostLevelCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 12, marginTop: 4 },
  hostLevelTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  hostLevelEmoji: { fontSize: 28 },
  hostLevelName: { fontSize: 14, fontFamily: "Inter_700Bold" },
  hostLevelEarnings: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 2 },
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
  kycBannerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  kycBannerTitle: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#FFB800" },
  kycBannerSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#FFB800BB", marginTop: 2 },
  kycBannerAction: { flexDirection: "row", alignItems: "center", gap: 4 },
  kycBannerActionText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#FFB800" },
  hostLevelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  hostLevelBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  hostLevelProgress: { gap: 7 },
  hostLevelProgressHeader: { flexDirection: "row", justifyContent: "space-between" },
  hostLevelProgressLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  hostLevelProgressVal: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  hostProgressBar: { height: 8, borderRadius: 4, overflow: "hidden" },
  hostProgressFill: { height: "100%", borderRadius: 4 },

  // ── My Leads ────────────────────────────────────────────────────────────────
  sectionHeaderRow:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  sectionAction:     { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  sectionActionText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  leadsStatRow:      { flexDirection: "row", gap: 10, marginBottom: 12 },
  leadStat:          { flex: 1, alignItems: "center", gap: 6, padding: 12, borderRadius: 14, borderWidth: 1 },
  leadStatIcon:      { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  leadStatVal:       { fontSize: 18, fontFamily: "Inter_700Bold" },
  leadStatLabel:     { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  leadsCard:         { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  leadsCardTitle:    { fontSize: 13, fontFamily: "Inter_700Bold", padding: 14, paddingBottom: 10 },
  leadRow:           { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth },
  leadAvatar:        { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  leadAvatarText:    { fontSize: 14, fontFamily: "Inter_700Bold" },
  leadName:          { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  leadMeta:          { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  leadTime:          { fontSize: 10, fontFamily: "Inter_400Regular" },
  contactBtn:        { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  contactBtnText:    { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#2196F3" },
  viewAllBtn:        { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, padding: 13, borderTopWidth: StyleSheet.hairlineWidth },
  viewAllText:       { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
