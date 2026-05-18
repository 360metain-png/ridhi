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
import { FloatingEmojiBg } from "@/components/FloatingEmojiBg";

const { width } = Dimensions.get("window");

type AdStatus = "pending" | "active" | "paused" | "completed" | "rejected";
type AdFormat = "feed" | "story" | "reel" | "banner" | "explore";
type AdObjective = "awareness" | "traffic" | "leads" | "sales" | "engagement";

interface AdCampaign {
  id: string;
  bizName: string;
  headline: string;
  format: AdFormat;
  objective: AdObjective;
  status: AdStatus;
  dailyBudget: number;
  totalBudget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  startDate: string;
  endDate: string;
  targetCity: string;
  rejectionReason?: string;
}

const MOCK_CAMPAIGNS: AdCampaign[] = [
  {
    id: "c1", bizName: "Priya's Fashion Store", headline: "Up to 50% off on all fashions!",
    format: "feed", objective: "sales", status: "active",
    dailyBudget: 500, totalBudget: 3500, spent: 2100,
    impressions: 42000, clicks: 630, ctr: 1.5,
    startDate: "12 May", endDate: "18 May", targetCity: "All India",
  },
  {
    id: "c2", bizName: "TechZone Electronics", headline: "Best deals on smartphones this season",
    format: "story", objective: "traffic", status: "active",
    dailyBudget: 1000, totalBudget: 7000, spent: 3000,
    impressions: 60000, clicks: 1200, ctr: 2.0,
    startDate: "15 May", endDate: "21 May", targetCity: "Mumbai, Delhi",
  },
  {
    id: "c3", bizName: "SpiceRoute Foods", headline: "Order fresh home-style meals today!",
    format: "reel", objective: "awareness", status: "pending",
    dailyBudget: 200, totalBudget: 1400, spent: 0,
    impressions: 0, clicks: 0, ctr: 0,
    startDate: "—", endDate: "—", targetCity: "Bangalore",
  },
  {
    id: "c4", bizName: "ZenFit Yoga Studio", headline: "Join ZenFit — Free trial week!",
    format: "banner", objective: "leads", status: "completed",
    dailyBudget: 300, totalBudget: 2100, spent: 2100,
    impressions: 31500, clicks: 472, ctr: 1.5,
    startDate: "1 May", endDate: "7 May", targetCity: "Pune",
  },
  {
    id: "c5", bizName: "FakeAds Inc.", headline: "Misleading health claims…",
    format: "feed", objective: "sales", status: "rejected",
    dailyBudget: 500, totalBudget: 3500, spent: 0,
    impressions: 0, clicks: 0, ctr: 0,
    startDate: "—", endDate: "—", targetCity: "All India",
    rejectionReason: "Misleading claims violate Ridhi Ads policy.",
  },
];

const STATUS_META: Record<AdStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: "Under Review", color: "#FFB800", bg: "#FFB80020" },
  active:    { label: "Running",      color: "#34C759", bg: "#34C75920" },
  paused:    { label: "Paused",       color: "#8E8E93", bg: "#8E8E9320" },
  completed: { label: "Completed",    color: "#2196F3", bg: "#2196F320" },
  rejected:  { label: "Rejected",     color: "#FF3B30", bg: "#FF3B3020" },
};

const FORMAT_ICONS: Record<AdFormat, string> = {
  feed: "layout", story: "circle", reel: "video", banner: "minus", explore: "search",
};

const OBJ_ICONS: Record<AdObjective, string> = {
  awareness: "eye", traffic: "external-link", leads: "users", sales: "shopping-bag", engagement: "heart",
};

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[sc.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[sc.statVal, { color }]}>{value}</Text>
      <Text style={[sc.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
      {sub && <Text style={[sc.statSub, { color: colors.mutedForeground }]}>{sub}</Text>}
    </View>
  );
}
const sc = StyleSheet.create({
  statCard:  { flex: 1, borderRadius: 14, borderWidth: 1, padding: 12, alignItems: "center", gap: 3 },
  statVal:   { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  statSub:   { fontSize: 9, fontFamily: "Inter_400Regular", textAlign: "center" },
});

function CampaignCard({ campaign }: { campaign: AdCampaign }) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[campaign.status];
  const progress = campaign.totalBudget > 0 ? campaign.spent / campaign.totalBudget : 0;

  return (
    <View style={[styles.campCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.campHeader}>
        <View style={[styles.campFormatIcon, { backgroundColor: colors.primary + "20" }]}>
          <Feather name={FORMAT_ICONS[campaign.format] as any} size={16} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.campBiz, { color: colors.foreground }]}>{campaign.bizName}</Text>
          <Text style={[styles.campHeadline, { color: colors.mutedForeground }]} numberOfLines={1}>{campaign.headline}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
          <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      <View style={styles.campMeta}>
        <View style={styles.campMetaItem}>
          <Feather name={OBJ_ICONS[campaign.objective] as any} size={11} color={colors.mutedForeground} />
          <Text style={[styles.campMetaText, { color: colors.mutedForeground }]} numberOfLines={1}>
            {campaign.objective.charAt(0).toUpperCase() + campaign.objective.slice(1)}
          </Text>
        </View>
        <View style={styles.campMetaItem}>
          <Feather name="map-pin" size={11} color={colors.mutedForeground} />
          <Text style={[styles.campMetaText, { color: colors.mutedForeground }]} numberOfLines={1}>{campaign.targetCity}</Text>
        </View>
        <View style={styles.campMetaItem}>
          <Feather name="calendar" size={11} color={colors.mutedForeground} />
          <Text style={[styles.campMetaText, { color: colors.mutedForeground }]}>{campaign.startDate} – {campaign.endDate}</Text>
        </View>
      </View>

      {/* Budget progress */}
      {campaign.status !== "pending" && campaign.status !== "rejected" && (
        <>
          <View style={styles.budgetRow}>
            <Text style={[styles.budgetLabel, { color: colors.mutedForeground }]}>
              Spent: <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>₹{campaign.spent.toLocaleString()}</Text>
              {" "}/ ₹{campaign.totalBudget.toLocaleString()}
            </Text>
            <Text style={[styles.budgetPct, { color: colors.primary }]}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` as any, backgroundColor: colors.primary }]} />
          </View>
        </>
      )}

      {/* Rejection reason */}
      {campaign.status === "rejected" && campaign.rejectionReason && (
        <View style={[styles.rejectNote, { backgroundColor: "#FF3B3012", borderColor: "#FF3B3030" }]}>
          <Feather name="alert-triangle" size={12} color="#FF3B30" />
          <Text style={[styles.rejectText, { color: "#FF3B30" }]}>{campaign.rejectionReason}</Text>
        </View>
      )}

      {/* Expand stats */}
      {(campaign.status === "active" || campaign.status === "completed") && (
        <>
          <Pressable onPress={() => setExpanded(e => !e)} style={styles.expandBtn}>
            <Text style={[styles.expandText, { color: colors.primary }]}>
              {expanded ? "Hide" : "View"} Analytics
            </Text>
            <Feather name={expanded ? "chevron-up" : "chevron-down"} size={14} color={colors.primary} />
          </Pressable>
          {expanded && (
            <View style={[styles.statsGrid, { borderTopColor: colors.border }]}>
              {[
                { label: "Impressions", val: campaign.impressions.toLocaleString(), color: "#7B2FBE" },
                { label: "Clicks",      val: campaign.clicks.toLocaleString(),      color: "#E91E8C" },
                { label: "CTR",         val: `${campaign.ctr}%`,                   color: "#34C759" },
                { label: "Daily Budget",val: `₹${campaign.dailyBudget}`,            color: "#FFB800" },
              ].map(({ label, val, color }) => (
                <View key={label} style={[styles.miniStat, { backgroundColor: color + "12" }]}>
                  <Text style={[styles.miniStatVal, { color }]}>{val}</Text>
                  <Text style={[styles.miniStatLabel, { color: colors.mutedForeground }]}>{label}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}

export default function AdsManagerScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;
  const [tab,   setTab] = useState<"all" | AdStatus>("all");

  const shown = tab === "all" ? MOCK_CAMPAIGNS : MOCK_CAMPAIGNS.filter(c => c.status === tab);
  const totalSpend = MOCK_CAMPAIGNS.reduce((s, c) => s + c.spent, 0);
  const totalImpr  = MOCK_CAMPAIGNS.reduce((s, c) => s + c.impressions, 0);
  const totalClicks= MOCK_CAMPAIGNS.reduce((s, c) => s + c.clicks, 0);
  const activeCnt  = MOCK_CAMPAIGNS.filter(c => c.status === "active").length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FloatingEmojiBg preset="creator" />
      {/* Header */}
      <LinearGradient colors={["#E91E8C", "#7B2FBE"]} style={[styles.header, { paddingTop: topPad + 10 }]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Ridhi Ads</Text>
            <Text style={styles.headerSub}>Business Advertising Manager</Text>
          </View>
          <Pressable
            onPress={() => router.push("/ads-create" as any)}
            style={styles.createBtn}
          >
            <Feather name="plus" size={16} color="#fff" />
            <Text style={styles.createBtnText}>New</Text>
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 60 }]}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Active Campaigns" value={String(activeCnt)}         sub="Running now"                      color="#34C759" />
          <StatCard label="Total Spend"       value={`₹${totalSpend.toLocaleString()}`} sub="All campaigns"          color={colors.primary} />
          <StatCard label="Impressions"       value={`${(totalImpr/1000).toFixed(0)}K`} sub="Total"                  color="#7B2FBE" />
        </View>
        <View style={styles.statsRow}>
          <StatCard label="Total Clicks"      value={totalClicks.toLocaleString()} sub="All time"                   color="#FFB800" />
          <StatCard label="Avg. CTR"          value="1.6%"                        sub="Avg across campaigns"        color="#2196F3" />
          <StatCard label="Campaigns"         value={String(MOCK_CAMPAIGNS.length)} sub={`${MOCK_CAMPAIGNS.length} total`} color="#E91E8C" />
        </View>

        {/* Create CTA */}
        <Pressable onPress={() => router.push("/ads-create" as any)}>
          <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.createCTA}>
            <Feather name="zap" size={20} color="#fff" />
            <View style={{ flex: 1 }}>
              <Text style={styles.createCTATitle}>Launch a New Campaign</Text>
              <Text style={styles.createCTASub}>Target millions of Ridhi users across India · From ₹100/day</Text>
            </View>
            <Feather name="arrow-right" size={18} color="#fff" />
          </LinearGradient>
        </Pressable>

        {/* Filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsRow}>
          {(["all", "active", "pending", "completed", "paused", "rejected"] as ("all" | AdStatus)[]).map((t) => {
            const count = t === "all" ? MOCK_CAMPAIGNS.length : MOCK_CAMPAIGNS.filter(c => c.status === t).length;
            return (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={[styles.tabChip, {
                  backgroundColor: tab === t ? colors.primary : colors.card,
                  borderColor: tab === t ? colors.primary : colors.border,
                }]}
              >
                <Text style={[styles.tabChipText, { color: tab === t ? "#fff" : colors.foreground }]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)} {count > 0 ? `(${count})` : ""}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Campaign list */}
        <View style={styles.campList}>
          {shown.length === 0 ? (
            <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="inbox" size={32} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No campaigns found</Text>
            </View>
          ) : (
            shown.map(c => <CampaignCard key={c.id} campaign={c} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1 },
  header:     { paddingHorizontal: 16, paddingBottom: 16 },
  topBar:     { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn:    { padding: 6 },
  headerTitle:{ color: "#fff", fontSize: 17, fontFamily: "Inter_700Bold" },
  headerSub:  { color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Inter_400Regular" },
  createBtn:  { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  createBtnText:{ color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  scroll:     { padding: 12, gap: 12, paddingBottom: 60 },
  statsRow:   { flexDirection: "row", gap: 8 },
  createCTA:  { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, padding: 16 },
  createCTATitle:{ color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  createCTASub:  { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  tabsScroll: { flexGrow: 0 },
  tabsRow:    { flexDirection: "row", gap: 8, paddingVertical: 4 },
  tabChip:    { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  tabChipText:{ fontSize: 12, fontFamily: "Inter_500Medium" },
  campList:   { gap: 12 },
  campCard:   { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  campHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  campFormatIcon:{ width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  campBiz:    { fontSize: 14, fontFamily: "Inter_700Bold" },
  campHeadline:{ fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  statusBadge:{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20 },
  statusDot:  { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  campMeta:   { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  campMetaItem:{ flexDirection: "row", alignItems: "center", gap: 3 },
  campMetaText:{ fontSize: 11, fontFamily: "Inter_400Regular", maxWidth: 130 },
  budgetRow:  { flexDirection: "row", justifyContent: "space-between" },
  budgetLabel:{ fontSize: 12, fontFamily: "Inter_400Regular" },
  budgetPct:  { fontSize: 12, fontFamily: "Inter_700Bold" },
  progressTrack:{ height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  rejectNote: { flexDirection: "row", alignItems: "flex-start", gap: 6, borderRadius: 10, borderWidth: 1, padding: 10 },
  rejectText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  expandBtn:  { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "center" },
  expandText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statsGrid:  { flexDirection: "row", flexWrap: "wrap", gap: 8, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10 },
  miniStat:   { flex: 1, minWidth: "40%", alignItems: "center", borderRadius: 10, paddingVertical: 8 },
  miniStatVal:{ fontSize: 16, fontFamily: "Inter_700Bold" },
  miniStatLabel:{ fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2 },
  empty:      { alignItems: "center", gap: 10, padding: 40, borderRadius: 16, borderWidth: 1 },
  emptyText:  { fontSize: 14, fontFamily: "Inter_400Regular" },
});
