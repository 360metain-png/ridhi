import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
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
import { Avatar } from "@/components/Avatar";
import { GradientButton } from "@/components/GradientButton";

const { width } = Dimensions.get("window");

const AGENT_LEVELS = [
  { level: "A1", label: "Starter Agent", hosts: 5, volume: "₹50K", bonus: "2%", color: "#8B7355" },
  { level: "A2", label: "Rising Agent", hosts: 20, volume: "₹2L", bonus: "3%", color: "#C0C0C0" },
  { level: "A3", label: "Pro Agent", hosts: 50, volume: "₹5L", bonus: "5%", color: "#FFB800" },
  { level: "A4", label: "Elite Agent", hosts: 100, volume: "₹10L", bonus: "7%", color: "#E5E4E2" },
  { level: "A5", label: "Master Agent", hosts: 250, volume: "₹25L", bonus: "10%", color: "#00BCD4" },
];

const MY_HOSTS = [
  { id: "h1", name: "Priya Sharma", city: "Mumbai", level: "L4", earnings: "₹48K", status: "active", calls: 142 },
  { id: "h2", name: "Kavya R", city: "Hyderabad", level: "L3", earnings: "₹29K", status: "active", calls: 98 },
  { id: "h3", name: "Rahul Verma", city: "Delhi", level: "L5", earnings: "₹82K", status: "active", calls: 214 },
  { id: "h4", name: "Meera K", city: "Kochi", level: "L2", earnings: "₹14K", status: "inactive", calls: 41 },
  { id: "h5", name: "Dev Patel", city: "Bangalore", level: "L3", earnings: "₹31K", status: "active", calls: 107 },
];

const WEEKLY_STATS = [0.4, 0.6, 0.55, 0.75, 0.9, 1.0, 0.85];
const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const AGENT = {
  name: "Arjun Kumar",
  level: "A3",
  levelLabel: "Pro Agent",
  levelColor: "#FFB800",
  activeHosts: 14,
  totalHosts: 20,
  monthVolume: "₹3.2L",
  commission: "₹16,000",
  nextLevelTarget: 50,
  bonus: "5%",
};

export default function AgentDashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [tab, setTab] = useState<"overview" | "hosts" | "levels">("overview");
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const progressPct = AGENT.activeHosts / AGENT.nextLevelTarget;
  const MAX_BAR = 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[AGENT.levelColor + "20", "transparent"]}
        style={[styles.headerGlow, { height: topPad + 120 }]}
      />

      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.surface + "F0", borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Agent Dashboard</Text>
        <LinearGradient colors={[AGENT.levelColor, AGENT.levelColor + "CC"]} style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{AGENT.level}</Text>
        </LinearGradient>
      </View>

      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {(["overview", "hosts", "levels"] as const).map((t) => (
          <Pressable key={t} style={styles.tabItem} onPress={() => setTab(t)}>
            {t === tab && <LinearGradient colors={[colors.primary + "20", "transparent"]} style={StyleSheet.absoluteFill} />}
            <Text style={[styles.tabText, { color: t === tab ? colors.primary : colors.mutedForeground }]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
            {t === tab && <View style={[styles.tabUnderline, { backgroundColor: colors.primary }]} />}
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
        {tab === "overview" && (
          <>
            <LinearGradient
              colors={[AGENT.levelColor + "25", AGENT.levelColor + "08"]}
              style={[styles.agentCard, { borderColor: AGENT.levelColor + "40" }]}
            >
              <View style={styles.agentCardTop}>
                <Avatar name={AGENT.name} size={52} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.agentName, { color: colors.foreground }]}>{AGENT.name}</Text>
                  <View style={styles.agentLevelRow}>
                    <LinearGradient colors={[AGENT.levelColor, AGENT.levelColor + "CC"]} style={styles.agentLevelBadge}>
                      <Text style={styles.agentLevelText}>{AGENT.level}</Text>
                    </LinearGradient>
                    <Text style={[styles.agentLevelLabel, { color: AGENT.levelColor }]}>{AGENT.levelLabel}</Text>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.bonusText, { color: AGENT.levelColor }]}>{AGENT.bonus}</Text>
                  <Text style={[styles.bonusLabel, { color: colors.mutedForeground }]}>Commission</Text>
                </View>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
                    Progress to A4
                  </Text>
                  <Text style={[styles.progressValue, { color: AGENT.levelColor }]}>
                    {AGENT.activeHosts}/{AGENT.nextLevelTarget} hosts
                  </Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
                  <LinearGradient
                    colors={[AGENT.levelColor, AGENT.levelColor + "80"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${Math.round(progressPct * 100)}%` as any }]}
                  />
                </View>
              </View>
            </LinearGradient>

            <View style={styles.statsGrid}>
              {[
                { label: "Active Hosts", value: AGENT.activeHosts.toString(), icon: "users", color: colors.success },
                { label: "Monthly Volume", value: AGENT.monthVolume, icon: "trending-up", color: colors.gold },
                { label: "Commission Earned", value: AGENT.commission, icon: "dollar-sign", color: colors.primary },
                { label: "Avg Host Level", value: "L3.2", icon: "award", color: colors.secondary },
              ].map((s) => (
                <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.statIcon, { backgroundColor: s.color + "20" }]}>
                    <Feather name={s.icon as any} size={16} color={s.color} />
                  </View>
                  <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.chartTitle, { color: colors.foreground }]}>Weekly Volume</Text>
              <View style={styles.chartBars}>
                {WEEKLY_STATS.map((h, i) => (
                  <View key={i} style={styles.barWrap}>
                    <View style={[styles.barBg, { height: MAX_BAR, backgroundColor: colors.muted }]}>
                      <LinearGradient
                        colors={[AGENT.levelColor, AGENT.levelColor + "60"]}
                        style={[styles.barFill, { height: MAX_BAR * h }]}
                      />
                    </View>
                    <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{WEEK_DAYS[i]}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.quickActionsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.quickActionsTitle, { color: colors.foreground }]}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                {[
                  { icon: "user-plus", label: "Recruit Host", color: colors.success },
                  { icon: "bar-chart-2", label: "Reports", color: colors.gold },
                  { icon: "message-circle", label: "Host Chat", color: colors.secondary },
                  { icon: "shield", label: "Warnings", color: colors.destructive },
                ].map((a) => (
                  <Pressable key={a.label} style={[styles.quickActionBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                    <View style={[styles.quickActionIcon, { backgroundColor: a.color + "20" }]}>
                      <Feather name={a.icon as any} size={18} color={a.color} />
                    </View>
                    <Text style={[styles.quickActionLabel, { color: colors.foreground }]}>{a.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}

        {tab === "hosts" && (
          <>
            <View style={styles.hostsHeader}>
              <Text style={[styles.hostsHeaderText, { color: colors.foreground }]}>
                My Hosts ({MY_HOSTS.length})
              </Text>
              <GradientButton label="+ Recruit" onPress={() => {}} small />
            </View>
            {MY_HOSTS.map((host) => (
              <View key={host.id} style={[styles.hostRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Avatar name={host.name} size={44} />
                <View style={{ flex: 1 }}>
                  <View style={styles.hostNameRow}>
                    <Text style={[styles.hostName, { color: colors.foreground }]}>{host.name}</Text>
                    <View style={[styles.hostLevelBadge, {
                      backgroundColor: host.status === "active" ? colors.success + "20" : colors.muted,
                    }]}>
                      <View style={[styles.hostStatusDot, {
                        backgroundColor: host.status === "active" ? colors.success : colors.mutedForeground,
                      }]} />
                      <Text style={[styles.hostLevelText, {
                        color: host.status === "active" ? colors.success : colors.mutedForeground,
                      }]}>{host.status}</Text>
                    </View>
                  </View>
                  <Text style={[styles.hostMeta, { color: colors.mutedForeground }]}>
                    {host.city} · Level {host.level} · {host.calls} calls
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.hostEarning, { color: colors.success }]}>{host.earnings}</Text>
                  <Text style={[styles.hostEarningLabel, { color: colors.mutedForeground }]}>this month</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {tab === "levels" && (
          <>
            <Text style={[styles.levelsTitle, { color: colors.foreground }]}>Agent Level System</Text>
            {AGENT_LEVELS.map((lvl, idx) => {
              const isCurrent = lvl.level === AGENT.level;
              return (
                <LinearGradient
                  key={lvl.level}
                  colors={isCurrent ? [lvl.color + "25", lvl.color + "08"] : [colors.card, colors.card]}
                  style={[styles.levelCard, { borderColor: isCurrent ? lvl.color + "60" : colors.border }]}
                >
                  <View style={[styles.levelBadgeCircle, { backgroundColor: lvl.color + "25" }]}>
                    <Text style={styles.levelBadgeCircleText}>{lvl.level}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.levelCardHeader}>
                      <Text style={[styles.levelCardName, { color: colors.foreground }]}>{lvl.label}</Text>
                      {isCurrent && (
                        <LinearGradient colors={[lvl.color, lvl.color + "AA"]} style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>CURRENT</Text>
                        </LinearGradient>
                      )}
                    </View>
                    <View style={styles.levelCardStats}>
                      <Text style={[styles.levelStat, { color: colors.mutedForeground }]}>👥 {lvl.hosts} hosts</Text>
                      <Text style={[styles.levelStat, { color: colors.mutedForeground }]}>📈 {lvl.volume}/mo</Text>
                      <Text style={[styles.levelStat, { color: lvl.color }]}>💰 {lvl.bonus} bonus</Text>
                    </View>
                  </View>
                </LinearGradient>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGlow: { position: "absolute", top: 0, left: 0, right: 0 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  backBtn: { padding: 6 },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold" },
  levelBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  levelBadgeText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    position: "relative",
    overflow: "hidden",
  },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  tabUnderline: { position: "absolute", bottom: 0, left: 16, right: 16, height: 2, borderRadius: 1 },
  agentCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 14 },
  agentCardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  agentName: { fontSize: 17, fontFamily: "Inter_700Bold" },
  agentLevelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  agentLevelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  agentLevelText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  agentLevelLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  bonusText: { fontSize: 20, fontFamily: "Inter_700Bold" },
  bonusLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  progressSection: { gap: 8 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  progressValue: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  progressBar: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  statIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  chartCard: { borderRadius: 18, borderWidth: 1, padding: 16 },
  chartTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 16 },
  chartBars: { flexDirection: "row", alignItems: "flex-end", gap: 8, justifyContent: "space-between" },
  barWrap: { flex: 1, alignItems: "center", gap: 6 },
  barBg: { width: "100%", borderRadius: 6, overflow: "hidden", justifyContent: "flex-end" },
  barFill: { width: "100%", borderRadius: 6 },
  barLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  quickActionsCard: { borderRadius: 18, borderWidth: 1, padding: 16 },
  quickActionsTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 12 },
  quickActionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickActionBtn: {
    flex: 1,
    minWidth: (width - 52) / 2,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  quickActionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  quickActionLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  hostsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  hostsHeaderText: { fontSize: 17, fontFamily: "Inter_700Bold" },
  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  hostNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  hostName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  hostLevelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  hostStatusDot: { width: 6, height: 6, borderRadius: 3 },
  hostLevelText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  hostMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  hostEarning: { fontSize: 15, fontFamily: "Inter_700Bold" },
  hostEarningLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  levelsTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 4 },
  levelCard: { borderRadius: 16, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  levelBadgeCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  levelBadgeCircleText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
  levelCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  levelCardName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  currentBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  currentBadgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  levelCardStats: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  levelStat: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
