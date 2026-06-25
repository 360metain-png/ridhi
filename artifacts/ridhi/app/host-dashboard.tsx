import React, { useState, useMemo } from "react";
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
import { useColors } from "@/hooks/useColors"
import { useTrackScreen } from "@/hooks/useAnalytics";
;
import { useAuth, UserProfile } from "@/contexts/AuthContext";
import { PrivateHead } from "@/components/PrivateHead";
import { ReportSheet } from "@/components/ReportSheet";

const { width } = Dimensions.get("window");

// ── Mock host data ────────────────────────────────────────────────────────────

const HOST_DATA = {
  name:          "Priya Sharma",
  id:            "HOST-4821",
  level:         "L5",
  levelName:     "Diamond",
  levelColor:    "#4FC3F7",
  levelEmoji:    "💎",
  nextLevel:     "L6",
  nextLevelName: "Elite",
  // Progress toward next level
  coinsEarned:   2_100_000,
  coinsTarget:   3_500_000,
  streamHours:   612,
  streamTarget:  1_000,
  pkWins:        22,
  pkTarget:      35,
  // Earnings
  earningsTotal:    42_800,
  earningsMonth:    8_450,
  earningsPending:  2_100,
  earningsGifts:    5_200,
  earningsCreator:  2_100,
  earningsTips:     1_150,
  // Stream stats
  totalStreams:     284,
  streamsThisMonth: 18,
  streakDays:       7,
  avgViewers:       340,
  totalPKWins:      22,
  // KYC
  kycStatus:     "verified" as "verified" | "pending" | "rejected",
  kycDate:       "Dec 10, 2025",
  // Coins
  coinBalance:   4_820,
  giftsToday:    380,
};

const RECENT_ACTIVITY = [
  { id: "a1", type: "gift",    desc: "Gift received — 500 coins from @user823",   amount: "+₹350",  date: "Today, 4:12 PM",  positive: true  },
  { id: "a2", type: "payout",  desc: "Payout processed to HDFC ****3821",          amount: "₹5,000", date: "Dec 20, 2:00 PM", positive: false },
  { id: "a3", type: "pk",      desc: "PK Battle Win vs @Meena_Live",               amount: "+2 pts", date: "Dec 19, 9:30 PM", positive: true  },
  { id: "a4", type: "gift",    desc: "Gift received — 200 coins from @arjun_k",   amount: "+₹140",  date: "Dec 19, 8:15 PM", positive: true  },
  { id: "a5", type: "bonus",   desc: "Weekly activity bonus credited",             amount: "+₹200",  date: "Dec 18",          positive: true  },
];

const ASSIGNED_AGENT = {
  name: "Arjun Kumar",
  level: "A3",
  levelLabel: "Super Agent",
  levelColor: "#FFB800",
  phone: "+91 XXXXX XXXXX",
  email: "arjun.kumar@ridhi.app",
  hostCount: 14,
};

const QUICK_ACTIONS = [
  { icon: "radio",          label: "Go Live",         route: "/live-stream",        color: "#E91E8C" },
  { icon: "arrow-up-circle",label: "Request Payout",  route: "/withdraw",           color: "#34C759" },
  { icon: "shield",         label: "KYC Status",      route: "/kyc",                color: "#7B2FBE" },
  { icon: "star",           label: "Creator Stats",   route: "/creator-dashboard",  color: "#FF9800" },
  { icon: "dollar-sign",    label: "Coin Wallet",     route: "/wallet",             color: "#00BCD4" },
  { icon: "book-open",      label: "Handbook",        route: "/help-support",       color: "#607D8B" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function pct(val: number, max: number) {
  return Math.min(100, Math.round((val / max) * 100));
}

function fmtCoins(n: number) {
  if (n >= 10_00_000) return `${(n / 10_00_000).toFixed(1)}L`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PkBattleHostCard({ user }: { user: UserProfile | null }) {
  const status = user?.pkBattleStatus || "not_requested";
  const colors = useColors();

  const meta: Record<string, { emoji: string; title: string; sub: string; bg: string; text: string; icon: string }> = {
    not_requested: {
      emoji: "🎯",
      title: "Not Requested",
      sub: "Complete E-verification, then request PK Battle host approval.",
      bg: "#7B2FBE15",
      text: "#7B2FBE",
      icon: "zap",
    },
    requested: {
      emoji: "⏳",
      title: "Pending Review",
      sub: "Your request is awaiting Super Admin approval.",
      bg: "#FFB80015",
      text: "#F57F17",
      icon: "clock",
    },
    approved: {
      emoji: "✨",
      title: "Approved Host",
      sub: "You can host PK Battles and earn coins.",
      bg: "#34C75915",
      text: "#2E7D32",
      icon: "check-circle",
    },
    rejected: {
      emoji: "🚫",
      title: "Not Approved",
      sub: user?.pkBattleRejectionReason || "Request rejected. Contact support.",
      bg: "#FF3B3015",
      text: "#C62828",
      icon: "x-circle",
    },
  };

  const m = meta[status];
  return (
    <View style={[styles.pkCard, { backgroundColor: m.bg }]}>
      <View style={[styles.pkCardLeft, { backgroundColor: m.text + "20" }]}>
        <Feather name={m.icon as any} size={22} color={m.text} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.pkCardTitle, { color: m.text }]}>{m.title}</Text>
        <Text style={[styles.pkCardSub, { color: colors.mutedForeground }]}>{m.sub}</Text>
      </View>
    </View>
  );
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${value}%` as any, backgroundColor: color }]} />
    </View>
  );
}

function StatCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
        <Feather name={icon as any} size={16} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub && <Text style={styles.statSub}>{sub}</Text>}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function HostDashboard() {
  useTrackScreen("host_dashboard");
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { user } = useAuth();
  const [tab, setTab] = useState<"overview" | "earnings" | "streams">("overview");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const h       = HOST_DATA;

  // Host activity checkpoint
  const hostHours = user?.hostMonthlyHours ?? 0;
  const hostHoursPct = Math.min(100, Math.round((hostHours / 30) * 100));
  const hostDaysLeft = useMemo(() => {
    if (!user?.isHost || !user?.hostActiveUntil) return null;
    const now = new Date();
    const activeUntil = new Date(user.hostActiveUntil);
    const diffMs = activeUntil.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [user?.hostActiveUntil, user?.isHost]);
  const isHostExpired = hostDaysLeft === 0;

  const kycColors = {
    verified: { bg: "#E8F5E9", text: "#2E7D32", icon: "check-circle" },
    pending:  { bg: "#FFF8E1", text: "#F57F17", icon: "clock"        },
    rejected: { bg: "#FFEBEE", text: "#C62828", icon: "x-circle"     },
  };
  const kyc = kycColors[h.kycStatus];

  return (
    <>
      <PrivateHead />
      <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ── Header gradient ── */}
      <LinearGradient
        colors={["#7B2FBE", "#E91E8C"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 8 }]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Host Dashboard</Text>
          <Pressable onPress={() => router.push("/notifications" as any)} style={styles.backBtn}>
            <Feather name="bell" size={22} color="#fff" />
          </Pressable>
        </View>

        {/* Level badge + name */}
        <View style={styles.hostInfo}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelEmoji}>{h.levelEmoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.hostName}>{user?.name ?? h.name}</Text>
            <View style={styles.hostMeta}>
              <View style={[styles.levelPill, { backgroundColor: h.levelColor + "30", borderColor: h.levelColor }]}>
                <Text style={[styles.levelPillText, { color: h.levelColor }]}>{h.level} {h.levelName}</Text>
              </View>
              <Text style={styles.hostId}>  ·  {h.id}</Text>
            </View>
          </View>
        </View>

        {/* Progress to next level */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Progress to {h.nextLevel} {h.nextLevelName}</Text>
          <View style={styles.progressRow}>
            <Feather name="gift"  size={12} color="#fff" />
            <Text style={styles.progressLabel}>Coins  {fmtCoins(h.coinsEarned)} / {fmtCoins(h.coinsTarget)}</Text>
            <Text style={styles.progressPct}>{pct(h.coinsEarned, h.coinsTarget)}%</Text>
          </View>
          <ProgressBar value={pct(h.coinsEarned, h.coinsTarget)} color="#E91E8C" />

          <View style={[styles.progressRow, { marginTop: 8 }]}>
            <Feather name="radio" size={12} color="#fff" />
            <Text style={styles.progressLabel}>Stream hrs  {h.streamHours}h / {h.streamTarget}h</Text>
            <Text style={styles.progressPct}>{pct(h.streamHours, h.streamTarget)}%</Text>
          </View>
          <ProgressBar value={pct(h.streamHours, h.streamTarget)} color="#4FC3F7" />

          <View style={[styles.progressRow, { marginTop: 8 }]}>
            <Feather name="zap" size={12} color="#fff" />
            <Text style={styles.progressLabel}>PK wins  {h.pkWins} / {h.pkTarget}</Text>
            <Text style={styles.progressPct}>{pct(h.pkWins, h.pkTarget)}%</Text>
          </View>
          <ProgressBar value={pct(h.pkWins, h.pkTarget)} color="#FFB800" />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]}>

        {/* ── Host Activity Checkpoint Banner ── */}
        {user?.isHost && hostDaysLeft !== null && (
          <View style={[styles.checkpointBanner, { backgroundColor: isHostExpired ? "#FFEBEE" : hostDaysLeft <= 3 ? "#FFF8E1" : "#E8F5E9" }]}>
            <View style={styles.checkpointLeft}>
              <Feather
                name={isHostExpired ? "alert-triangle" : "radio"}
                size={18}
                color={isHostExpired ? "#C62828" : hostDaysLeft <= 3 ? "#F57F17" : "#2E7D32"}
              />
              <View style={{ flex: 1 }}>
                {isHostExpired ? (
                  <>
                    <Text style={styles.checkpointTitle}>Host Registration Expired</Text>
                    <Text style={styles.checkpointSub}>You must re-register to continue hosting.</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.checkpointTitle}>Host Activity Checkpoint</Text>
                    <Text style={styles.checkpointSub}>
                      {hostDaysLeft} day{hostDaysLeft !== 1 ? "s" : ""} left to complete 30 hours of live streams.
                    </Text>
                  </>
                )}
              </View>
            </View>
            <View style={styles.checkpointRight}>
              <Text style={[styles.checkpointHours, { color: isHostExpired ? "#C62828" : hostDaysLeft <= 3 ? "#F57F17" : "#2E7D32" }]}>
                {hostHours.toFixed(1)}h
              </Text>
              <Text style={styles.checkpointTotal}>/ 30h</Text>
              <ProgressBar value={hostHoursPct} color={isHostExpired ? "#C62828" : hostDaysLeft <= 3 ? "#F57F17" : "#2E7D32"} />
            </View>
          </View>
        )}

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map(a => (
              <Pressable
                key={a.label}
                onPress={() => router.push(a.route as any)}
                style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.75 : 1 }]}
              >
                <View style={[styles.actionIcon, { backgroundColor: a.color + "20" }]}>
                  <Feather name={a.icon as any} size={22} color={a.color} />
                </View>
                <Text style={[styles.actionLabel, { color: colors.text }]}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Earnings Summary ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Earnings</Text>
          <View style={[styles.earningsCard, { backgroundColor: colors.card }]}>
            <View style={styles.earningsMain}>
              <View>
                <Text style={[styles.earningsLabel2, { color: colors.mutedForeground }]}>Total Earned</Text>
                <Text style={[styles.earningsTotal, { color: colors.text }]}>₹{h.earningsTotal.toLocaleString("en-IN")}</Text>
              </View>
              <View style={styles.earningsRight}>
                <View style={styles.earningsPendingPill}>
                  <Feather name="clock" size={11} color="#F57F17" />
                  <Text style={styles.earningsPendingText}>₹{h.earningsPending.toLocaleString("en-IN")} pending</Text>
                </View>
                <Text style={[styles.earningsMonth, { color: colors.primary }]}>+₹{h.earningsMonth.toLocaleString("en-IN")} this month</Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.earningsBreakdown}>
              {[
                { label: "Virtual Gifts", amount: h.earningsGifts,   icon: "gift",       color: "#E91E8C" },
                { label: "Creator Fund",  amount: h.earningsCreator, icon: "trending-up", color: "#34C759" },
                { label: "Coin Tips",     amount: h.earningsTips,    icon: "star",        color: "#FFB800" },
              ].map(e => (
                <View key={e.label} style={styles.earningsRow}>
                  <View style={[styles.earningsRowIcon, { backgroundColor: e.color + "15" }]}>
                    <Feather name={e.icon as any} size={13} color={e.color} />
                  </View>
                  <Text style={[styles.earningsRowLabel, { color: colors.mutedForeground }]}>{e.label}</Text>
                  <Text style={[styles.earningsRowAmount, { color: colors.text }]}>₹{e.amount.toLocaleString("en-IN")}</Text>
                </View>
              ))}
            </View>
            {user?.kycStatus === "verified" ? (
              <Pressable
                onPress={() => router.push("/withdraw" as any)}
                style={styles.payoutBtn}
              >
                <LinearGradient colors={["#7B2FBE", "#E91E8C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.payoutBtnGrad}>
                  <Feather name="arrow-up-circle" size={16} color="#fff" />
                  <Text style={styles.payoutBtnText}>Request Payout</Text>
                </LinearGradient>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => router.push("/kyc" as any)}
                style={[styles.payoutBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: "#FFB80040" }]}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 16, paddingHorizontal: 20, borderRadius: 16, backgroundColor: "#FFB80015" }}>
                  <Feather name="shield" size={16} color="#FFB800" />
                  <Text style={{ color: "#FFB800", fontSize: 15, fontFamily: "Inter_700Bold" }}>Complete KYC to Withdraw</Text>
                </View>
              </Pressable>
            )}
          </View>
        </View>

        {/* ── Stream Stats ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Stream Statistics</Text>
          <View style={styles.statsGrid}>
            <StatCard icon="radio"   label="Total Streams"   value={`${h.totalStreams}`}     sub={`${h.streamsThisMonth} this month`} color="#7B2FBE" />
            <StatCard icon="clock"   label="Hours Streamed"  value={`${h.streamHours}h`}     sub={`of ${h.streamTarget}h target`}     color="#E91E8C" />
            <StatCard icon="zap"     label="PK Wins"         value={`${h.totalPKWins}`}       sub={`of ${h.pkTarget} target`}          color="#FFB800" />
            <StatCard icon="users"   label="Avg Viewers"     value={`${h.avgViewers}`}        sub="per stream"                         color="#4FC3F7" />
            <StatCard icon="sun"     label="Streak"          value={`${h.streakDays}d`}       sub="active streak"                      color="#FF5722" />
            <StatCard icon="dollar-sign" label="Coin Balance" value={`${fmtCoins(h.coinBalance)}`} sub={`${h.giftsToday} today`}      color="#34C759" />
          </View>
        </View>

        {/* ── PK Battle Host Status ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>PK Battle Host Status</Text>
          <PkBattleHostCard user={user} />
        </View>

        {/* ── My Agent ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Agent</Text>
          <View style={[styles.agentCard, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
            <View style={styles.agentAvatar}>
              <Text style={styles.agentAvatarText}>{ASSIGNED_AGENT.name.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.agentNameRow}>
                <Text style={[styles.agentName, { color: colors.text }]}>{ASSIGNED_AGENT.name}</Text>
                <View style={[styles.agentLevelBadge, { backgroundColor: ASSIGNED_AGENT.levelColor + "20" }]}>
                  <Text style={[styles.agentLevelText, { color: ASSIGNED_AGENT.levelColor }]}>{ASSIGNED_AGENT.level}</Text>
                </View>
              </View>
              <Text style={[styles.agentEmail, { color: colors.mutedForeground }]}>{ASSIGNED_AGENT.email}</Text>
              <Text style={[styles.agentPhone, { color: colors.mutedForeground }]}>{ASSIGNED_AGENT.phone}</Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 4 }}>
              <Text style={[styles.agentName, { color: ASSIGNED_AGENT.levelColor }]}>{ASSIGNED_AGENT.levelLabel}</Text>
              <Text style={[styles.agentPhone, { color: colors.mutedForeground }]}>{ASSIGNED_AGENT.hostCount} hosts</Text>
            </View>
          </View>
        </View>

        {/* ── KYC Status ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>KYC Verification</Text>
          <Pressable
            onPress={() => router.push("/kyc" as any)}
            style={[styles.kycCard, { backgroundColor: kyc.bg }]}
          >
            <View style={styles.kycLeft}>
              <Feather name={kyc.icon as any} size={28} color={kyc.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.kycTitle, { color: kyc.text }]}>
                {h.kycStatus === "verified" ? "KYC Verified" : h.kycStatus === "pending" ? "KYC Pending Review" : "KYC Rejected — Resubmit"}
              </Text>
              <Text style={[styles.kycSub, { color: kyc.text + "BB" }]}>
                {h.kycStatus === "verified"
                  ? `Aadhaar + Bank verified · ${h.kycDate}`
                  : h.kycStatus === "pending"
                  ? "Submitted — under review by your agent. Usually 24–48 hrs."
                  : "Your documents were rejected. Tap to resubmit with correct documents."}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={kyc.text} />
          </Pressable>
        </View>

        {/* ── Recent Activity ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
          <View style={[styles.activityCard, { backgroundColor: colors.card }]}>
            {RECENT_ACTIVITY.map((a, i) => {
              const actIcon = a.type === "gift" ? "gift" : a.type === "payout" ? "arrow-up-circle" : a.type === "pk" ? "zap" : a.type === "bonus" ? "star" : "activity";
              const actColor = a.type === "gift" ? "#E91E8C" : a.type === "payout" ? "#7B2FBE" : a.type === "pk" ? "#FFB800" : "#34C759";
              return (
                <View key={a.id} style={[styles.activityRow, i < RECENT_ACTIVITY.length - 1 && styles.activityBorder, { borderColor: colors.border }]}>
                  <View style={[styles.activityIcon, { backgroundColor: actColor + "15" }]}>
                    <Feather name={actIcon as any} size={14} color={actColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.activityDesc, { color: colors.text }]} numberOfLines={1}>{a.desc}</Text>
                    <Text style={[styles.activityDate, { color: colors.mutedForeground }]}>{a.date}</Text>
                  </View>
                  <Text style={[styles.activityAmount, { color: a.positive ? "#34C759" : colors.mutedForeground }]}>{a.amount}</Text>
                </View>
              );
            })}
          </View>
        </View>

      </ScrollView>
    </View>
  </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:       { flex: 1 },
  header:          { paddingBottom: 20, paddingHorizontal: 16 },
  headerRow:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  backBtn:         { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerTitle:     { fontSize: 17, fontWeight: "700", color: "#fff" },

  hostInfo:        { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  levelBadge:      { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  levelEmoji:      { fontSize: 26 },
  hostName:        { fontSize: 18, fontWeight: "800", color: "#fff", marginBottom: 4 },
  hostMeta:        { flexDirection: "row", alignItems: "center" },
  levelPill:       { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  levelPillText:   { fontSize: 11, fontWeight: "700" },
  hostId:          { fontSize: 11, color: "rgba(255,255,255,0.6)" },

  progressCard:    { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14, padding: 14 },
  progressTitle:   { fontSize: 12, fontWeight: "700", color: "#fff", marginBottom: 10 },
  progressRow:     { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  progressLabel:   { flex: 1, fontSize: 11, color: "rgba(255,255,255,0.85)" },
  progressPct:     { fontSize: 11, fontWeight: "700", color: "#fff", width: 34, textAlign: "right" },
  progressTrack:   { height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.25)", overflow: "hidden" },
  progressFill:    { height: "100%", borderRadius: 3 },

  body:            { paddingHorizontal: 16, paddingTop: 16 },
  section:         { marginBottom: 20 },
  sectionTitle:    { fontSize: 15, fontWeight: "800", marginBottom: 10 },

  actionsGrid:     { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionBtn:       { alignItems: "center", width: (width - 32 - 50) / 3, paddingVertical: 12, borderRadius: 12, backgroundColor: "transparent" },
  actionIcon:      { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  actionLabel:     { fontSize: 11, fontWeight: "600", textAlign: "center" },

  earningsCard:    { borderRadius: 16, padding: 16 },
  earningsMain:    { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 },
  earningsLabel2:  { fontSize: 12, marginBottom: 2 },
  earningsTotal:   { fontSize: 26, fontWeight: "900" },
  earningsRight:   { alignItems: "flex-end", gap: 6 },
  earningsPendingPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FFF8E1", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  earningsPendingText: { fontSize: 11, fontWeight: "600", color: "#F57F17" },
  earningsMonth:   { fontSize: 12, fontWeight: "700" },
  divider:         { height: 1, marginBottom: 12 },
  earningsBreakdown: { gap: 8, marginBottom: 14 },
  earningsRow:     { flexDirection: "row", alignItems: "center", gap: 10 },
  earningsRowIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  earningsRowLabel:{ flex: 1, fontSize: 13 },
  earningsRowAmount: { fontSize: 14, fontWeight: "700" },
  payoutBtn:       { borderRadius: 12, overflow: "hidden" },
  payoutBtnGrad:   { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12 },
  payoutBtnText:   { fontSize: 14, fontWeight: "700", color: "#fff" },

  statsGrid:       { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard:        { width: (width - 32 - 10) / 2, backgroundColor: "rgba(123,47,190,0.06)", borderRadius: 14, padding: 14, alignItems: "flex-start" },
  statIcon:        { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statValue:       { fontSize: 20, fontWeight: "900", color: "#7B2FBE", marginBottom: 2 },
  statLabel:       { fontSize: 11, fontWeight: "600", color: "#555", marginBottom: 1 },
  statSub:         { fontSize: 10, color: "#999" },

  kycCard:         { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, padding: 16 },
  kycLeft:         { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.6)", alignItems: "center", justifyContent: "center" },
  kycTitle:        { fontSize: 14, fontWeight: "800", marginBottom: 3 },
  kycSub:          { fontSize: 12, lineHeight: 17 },

  agentCard:       { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, padding: 16 },
  agentAvatar:     { width: 48, height: 48, borderRadius: 24, backgroundColor: "#7B2FBE", alignItems: "center", justifyContent: "center" },
  agentAvatarText: { fontSize: 16, fontWeight: "800", color: "#fff" },
  agentNameRow:    { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  agentName:       { fontSize: 15, fontWeight: "800" },
  agentLevelBadge: { backgroundColor: "#7B2FBE20", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  agentLevelText:  { fontSize: 10, fontWeight: "700", color: "#7B2FBE" },
  agentEmail:      { fontSize: 11, marginBottom: 1 },
  agentPhone:      { fontSize: 11 },
  contactBtn:      { width: 38, height: 38, borderRadius: 19, backgroundColor: "#7B2FBE15", alignItems: "center", justifyContent: "center" },
  complaintRow:    { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#C6282820" },
  complaintText:   { flex: 1, fontSize: 13, fontWeight: "600" },

  pkCard:          { borderRadius: 16, padding: 16, gap: 10, flexDirection: "row", alignItems: "center" },
  pkCardLeft:      { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  pkCardTitle:     { fontSize: 14, fontWeight: "800", marginBottom: 3 },
  pkCardSub:       { fontSize: 12, lineHeight: 17 },

  activityCard:    { borderRadius: 16, overflow: "hidden" },
  activityRow:     { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  activityBorder:  { borderBottomWidth: 1 },
  activityIcon:    { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  activityDesc:    { fontSize: 13, fontWeight: "500", marginBottom: 2 },
  activityDate:    { fontSize: 11 },
  activityAmount:  { fontSize: 13, fontWeight: "700" },

  // Host checkpoint banner
  checkpointBanner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, marginBottom: 16, borderWidth: 1, borderColor: "#00000010" },
  checkpointLeft:   { flexDirection: "row", alignItems: "flex-start", gap: 10, flex: 1 },
  checkpointTitle: { fontSize: 13, fontWeight: "700", marginBottom: 2 },
  checkpointSub:    { fontSize: 11, color: "#666" },
  checkpointRight: { alignItems: "flex-end", width: 80 },
  checkpointHours: { fontSize: 18, fontWeight: "800" },
  checkpointTotal: { fontSize: 11, fontWeight: "600", color: "#999", marginBottom: 4 },
});
