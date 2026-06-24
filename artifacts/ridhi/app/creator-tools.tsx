import React from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { PrivateHead } from "@/components/PrivateHead";
import { useTrackScreen } from "@/hooks/useAnalytics";

const { width } = Dimensions.get("window");

/* ── Tiered Tool Definitions ─────────────────────────────────────────────── */

type ToolTier = "free" | "starter" | "pro" | "elite";

interface CreatorTool {
  id: string;
  label: string;
  desc: string;
  icon: string;
  color: string;
  route: string;
  tier: ToolTier;
  badge?: string;
  lockedDesc?: string;
}

const FREE_TOOLS: CreatorTool[] = [
  { id: "upload", label: "Upload Studio", desc: "Post photos, videos, text", icon: "upload-cloud", color: "#E91E8C", route: "/create-post", tier: "free" },
  { id: "create", label: "Create Post", desc: "Text, polls, carousels", icon: "edit-3", color: "#2196F3", route: "/create-post", tier: "free" },
  { id: "drafts", label: "My Drafts", desc: "Unfinished posts", icon: "file-text", color: "#7B2FBE", route: "/create-post", tier: "free" },
  { id: "analytics", label: "Basic Analytics", desc: "Views, likes, followers", icon: "bar-chart-2", color: "#4A90E2", route: "/creator-dashboard", tier: "free" },
  { id: "scheduled", label: "Scheduled", desc: "Queue future posts", icon: "calendar", color: "#34C759", route: "/scheduled-content", tier: "free" },
  { id: "music", label: "Music Library", desc: "Trending Indian sounds", icon: "music", color: "#FF6B35", route: "/music-library", tier: "free" },
];

const PREMIUM_TOOLS: CreatorTool[] = [
  { id: "live", label: "Go Live", desc: "Stream to your fans", icon: "radio", color: "#FF3B30", route: "/live-stream", tier: "starter", badge: "Starter", lockedDesc: "Unlock with Creator Starter (₹199/mo)" },
  { id: "podcast", label: "Podcast Studio", desc: "Record & publish episodes", icon: "mic", color: "#8E44AD", route: "/podcast-create", tier: "starter", badge: "Starter", lockedDesc: "Unlock with Creator Starter (₹199/mo)" },
  { id: "hd", label: "HD Upload", desc: "4K video quality", icon: "film", color: "#00BCD4", route: "/create-post", tier: "pro", badge: "Pro", lockedDesc: "Unlock with Creator Pro (₹499/mo)" },
  { id: "ads", label: "Boost & Ads", desc: "Promote your content", icon: "trending-up", color: "#FF9500", route: "/ads-manager", tier: "pro", badge: "Pro", lockedDesc: "Unlock with Creator Pro (₹499/mo)" },
  { id: "fanclub", label: "Fan Club", desc: "3 paid tiers", icon: "users", color: "#7B2FBE", route: "/communities", tier: "pro", badge: "Pro", lockedDesc: "Unlock with Creator Pro (₹499/mo)" },
  { id: "brand", label: "Brand Deals", desc: "Sponsorship marketplace", icon: "briefcase", color: "#E91E8C", route: "/creator-marketplace", tier: "elite", badge: "Elite", lockedDesc: "Unlock with Creator Elite (₹999/mo)" },
  { id: "radio", label: "Ridhi Radio", desc: "Featured podcast playlist", icon: "radio", color: "#FFB800", route: "/my-podcast-channel", tier: "elite", badge: "Elite", lockedDesc: "Unlock with Creator Elite (₹999/mo)" },
  { id: "manager", label: "Account Manager", desc: "Dedicated support", icon: "headphones", color: "#34C759", route: "/help-support", tier: "elite", badge: "Elite", lockedDesc: "Unlock with Creator Elite (₹999/mo)" },
];

const ALL_TOOLS = [...FREE_TOOLS, ...PREMIUM_TOOLS];

function getTierRank(tier: ToolTier): number {
  return { free: 0, starter: 1, pro: 2, elite: 3 }[tier];
}

function canAccess(userTier: ToolTier | null | undefined, toolTier: ToolTier): boolean {
  const userRank = userTier ? getTierRank(userTier) : 0;
  return userRank >= getTierRank(toolTier);
}

function getTierLabel(tier: ToolTier): string {
  return { free: "Free", starter: "Starter", pro: "Pro", elite: "Elite" }[tier];
}

function getTierColor(tier: ToolTier): string {
  return { free: "#34C759", starter: "#2196F3", pro: "#9C27B0", elite: "#E91E8C" }[tier];
}

export default function CreatorToolsScreen() {
  useTrackScreen("creator_tools");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const userTier: ToolTier = (user?.creatorPlan as ToolTier) || "free";
  const tierColor = getTierColor(userTier);
  const tierLabel = getTierLabel(userTier);

  const handleToolPress = (tool: CreatorTool) => {
    if (canAccess(userTier, tool.tier)) {
      router.push(tool.route as any);
    } else {
      Alert.alert(
        `${getTierLabel(tool.tier)} Feature`,
        tool.lockedDesc || `Upgrade to ${getTierLabel(tool.tier)} to unlock this tool.`,
        [
          { text: "Not Now", style: "cancel" },
          { text: "Upgrade", onPress: () => router.push("/subscription" as any) },
        ]
      );
    }
  };

  const renderTool = (tool: CreatorTool) => {
    const unlocked = canAccess(userTier, tool.tier);
    const isPremium = tool.tier !== "free";

    return (
      <Pressable
        key={tool.id}
        onPress={() => handleToolPress(tool)}
        style={[
          styles.toolCard,
          {
            backgroundColor: unlocked ? colors.card : colors.muted + "40",
            borderColor: unlocked ? colors.border : colors.muted + "60",
            opacity: unlocked ? 1 : 0.75,
          },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
          <View style={[styles.toolIcon, { backgroundColor: unlocked ? tool.color + "20" : colors.muted + "30" }]}>
            <Feather name={tool.icon as any} size={22} color={unlocked ? tool.color : colors.mutedForeground} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={[styles.toolLabel, { color: unlocked ? colors.foreground : colors.mutedForeground }]}>{tool.label}</Text>
              {isPremium && (
                <View style={[styles.badge, { backgroundColor: unlocked ? tool.color + "20" : colors.muted + "40" }]}>
                  <Text style={[styles.badgeText, { color: unlocked ? tool.color : colors.mutedForeground }]}>{tool.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.toolDesc, { color: unlocked ? colors.mutedForeground : colors.mutedForeground + "88" }]}>
              {unlocked ? tool.desc : tool.lockedDesc}
            </Text>
          </View>
        </View>
        {!unlocked && (
          <View style={[styles.lockIcon, { backgroundColor: colors.muted + "30" }]}>
            <Feather name="lock" size={14} color={colors.mutedForeground} />
          </View>
        )}
        {unlocked && <Feather name="chevron-right" size={18} color={colors.mutedForeground} />}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PrivateHead />

      {/* ── Header ── */}
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Creator Tools</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.tierCard}>
          <View style={[styles.tierBadge, { backgroundColor: tierColor + "25" }]}>
            <Feather name="zap" size={16} color={tierColor} />
            <Text style={[styles.tierBadgeText, { color: tierColor }]}>{tierLabel} Creator</Text>
          </View>
          <Text style={styles.tierDesc}>
            {userTier === "free"
              ? "You have access to basic creation tools. Upgrade to unlock live streaming, HD uploads, and more."
              : userTier === "starter"
              ? "Go live and start your podcast. Upgrade to Pro for HD streaming and advanced analytics."
              : userTier === "pro"
              ? "HD streaming, advanced analytics, and fan clubs unlocked. Go Elite for brand deals."
              : "All creator tools unlocked. You have access to everything Ridhi offers."}
          </Text>
          {userTier !== "elite" && (
            <Pressable
              onPress={() => router.push("/subscription" as any)}
              style={[styles.upgradeBtn, { backgroundColor: tierColor }]}>
              <Feather name="arrow-up-circle" size={14} color="#fff" />
              <Text style={styles.upgradeText}>
                {userTier === "free" ? "Get Creator Pass" : userTier === "starter" ? "Upgrade to Pro" : "Upgrade to Elite"}
              </Text>
            </Pressable>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32, gap: 24 }}
      >
        {/* ── Free Tools ── */}
        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Basic Tools (Free)</Text>
          <View style={styles.toolList}>{FREE_TOOLS.map(renderTool)}</View>
        </View>

        {/* ── Premium Tools ── */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Premium Tools</Text>
            <Pressable onPress={() => router.push("/subscription" as any)}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See Plans</Text>
            </Pressable>
          </View>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
            Upgrade your Creator Pass to unlock these advanced tools.
          </Text>
          <View style={styles.toolList}>{PREMIUM_TOOLS.map(renderTool)}</View>
        </View>

        {/* ── Creator Pass CTA ── */}
        {userTier === "free" && (
          <LinearGradient
            colors={[colors.primary + "15", colors.secondary + "10"]}
            style={[styles.ctaCard, { borderColor: colors.primary + "30" }]}
          >
            <Text style={[styles.ctaTitle, { color: colors.foreground }]}>Unlock Your Full Potential</Text>
            <Text style={[styles.ctaSub, { color: colors.mutedForeground }]}>
              10,000+ creators on Ridhi earn with live streaming, brand deals, and fan clubs.
            </Text>
            <View style={styles.ctaStats}>
              {[
                { label: "Go Live", icon: "radio" },
                { label: "HD Upload", icon: "film" },
                { label: "Brand Deals", icon: "briefcase" },
                { label: "Fan Club", icon: "users" },
              ].map((s) => (
                <View key={s.label} style={[styles.ctaStat, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Feather name={s.icon as any} size={16} color={colors.primary} />
                  <Text style={[styles.ctaStatText, { color: colors.foreground }]}>{s.label}</Text>
                </View>
              ))}
            </View>
            <Pressable
              onPress={() => router.push("/subscription" as any)}
              style={[styles.ctaButton, { backgroundColor: colors.primary }]}>
              <Text style={styles.ctaButtonText}>Explore Creator Pass</Text>
            </Pressable>
          </LinearGradient>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20, gap: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { padding: 4 },
  headerTitle: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  tierCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tierBadgeText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  tierDesc: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  upgradeText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  sectionSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 12 },
  seeAll: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  toolList: { gap: 10 },
  toolCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  toolIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  toolLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  toolDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: { fontSize: 9, fontFamily: "Inter_700Bold" },
  lockIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  ctaTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  ctaSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  ctaStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  ctaStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  ctaStatText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  ctaButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  ctaButtonText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
});
