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
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 84 : 32 }}
      >
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

          <Pressable style={[styles.withdrawBtn, { backgroundColor: colors.primary }]}>
            <Feather name="arrow-up-circle" size={18} color="#fff" />
            <Text style={styles.withdrawText}>Request Withdrawal</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Creator Tools</Text>
          <View style={styles.toolsGrid}>
            {[
              { icon: "upload-cloud", label: "Upload Studio", color: "#E91E8C" },
              { icon: "radio", label: "Go Live", color: "#FF3B30" },
              { icon: "bar-chart-2", label: "Analytics", color: "#4A90E2" },
              { icon: "users", label: "Fan Club", color: "#7B2FBE" },
            ].map((tool) => (
              <Pressable
                key={tool.label}
                style={[styles.tool, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.toolIcon, { backgroundColor: tool.color + "20" }]}>
                  <Feather name={tool.icon as any} size={22} color={tool.color} />
                </View>
                <Text style={[styles.toolLabel, { color: colors.foreground }]}>{tool.label}</Text>
              </Pressable>
            ))}
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
});
