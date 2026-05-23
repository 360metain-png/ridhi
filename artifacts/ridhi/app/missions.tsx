import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { MISSIONS, DAILY_REWARD_STREAK, Mission } from "@/data/coinEconomy";
import { PrivateHead } from "@/components/PrivateHead";

const COIN_IMAGE = require("@/assets/images/ridhi_coin.png");
const { width } = Dimensions.get("window");

const TABS = [
  { id: "daily",    label: "Daily" },
  { id: "weekly",   label: "Weekly" },
  { id: "one_time", label: "One-Time" },
];

function ProgressBar({ progress, total, color }: { progress: number; total: number; color: string }) {
  const pct = Math.min(progress / total, 1);
  return (
    <View style={pbarStyles.track}>
      <View style={[pbarStyles.fill, { width: `${pct * 100}%` as any, backgroundColor: color }]} />
    </View>
  );
}
const pbarStyles = StyleSheet.create({
  track: { height: 5, borderRadius: 4, backgroundColor: "rgba(0,0,0,0.08)", overflow: "hidden", flex: 1 },
  fill: { height: "100%", borderRadius: 4 },
});

function MissionCard({ mission, onClaim }: { mission: Mission; onClaim: (m: Mission) => void }) {
  const colors = useColors();
  const catColor =
    mission.category === "content"  ? "#7B2FBE" :
    mission.category === "social"   ? "#E91E8C" :
    mission.category === "recharge" ? "#FFB800" : "#3B82F6";

  const done = mission.progress >= mission.total;
  const canClaim = done && !mission.completed;

  return (
    <View style={[styles.mCard, { backgroundColor: colors.card, borderColor: mission.completed ? colors.border : canClaim ? catColor + "60" : colors.border, borderWidth: canClaim ? 1.5 : 1 }]}>
      <View style={[styles.mIcon, { backgroundColor: catColor + "18" }]}>
        <Feather name={mission.icon as any} size={20} color={catColor} />
      </View>
      <View style={{ flex: 1, gap: 5 }}>
        <View style={styles.mTitleRow}>
          <Text style={[styles.mTitle, { color: mission.completed ? colors.mutedForeground : colors.foreground }]}>{mission.title}</Text>
          {mission.completed && (
            <View style={[styles.doneBadge, { backgroundColor: "#22C55E20" }]}>
              <Feather name="check" size={10} color="#22C55E" />
              <Text style={styles.doneText}>Done</Text>
            </View>
          )}
        </View>
        <Text style={[styles.mDesc, { color: colors.mutedForeground }]}>{mission.desc}</Text>
        <View style={styles.mBottom}>
          <ProgressBar progress={mission.progress} total={mission.total} color={catColor} />
          <Text style={[styles.mProgress, { color: colors.mutedForeground }]}>
            {mission.progress}/{mission.total}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={() => !mission.completed && canClaim && onClaim(mission)}
        style={[
          styles.rewardBtn,
          {
            backgroundColor: mission.completed ? colors.muted : canClaim ? catColor : colors.muted,
            opacity: mission.completed ? 0.5 : 1,
          },
        ]}
      >
        <Image source={COIN_IMAGE} style={{ width: 13, height: 13 }} resizeMode="contain" />
        <Text style={[styles.rewardBtnText, { color: mission.completed ? colors.mutedForeground : "#fff" }]}>
          +{mission.reward}
        </Text>
      </Pressable>
    </View>
  );
}

export default function MissionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addCoins } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "one_time">("daily");
  const [missions, setMissions] = useState(MISSIONS);
  const [claimedCoins, setClaimedCoins] = useState(0);

  const filtered = missions.filter((m) => m.type === activeTab);

  const totalToday = MISSIONS.filter((m) => m.type === "daily").reduce((s, m) => s + m.reward, 0);
  const earnedToday = MISSIONS.filter((m) => m.type === "daily" && m.completed).reduce((s, m) => s + m.reward, 0);

  const handleClaim = (mission: Mission) => {
    addCoins(mission.reward);
    setClaimedCoins((prev) => prev + mission.reward);
    setMissions((prev) => prev.map((m) => m.id === mission.id ? { ...m, completed: true } : m));
  };

  const currentDay = DAILY_REWARD_STREAK.findIndex((d) => !d.claimed);

  return (
    <>
      <PrivateHead />
      <View style={[styles.wrap, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.secondary]} style={[styles.header, { paddingTop: topPad + 8 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Earn Coins</Text>
            <Text style={styles.headerSub}>Complete missions to earn Ridhi Coins</Text>
          </View>
          <Pressable onPress={() => router.push("/wallet")} style={styles.walletBtn}>
            <Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />
            <Text style={styles.walletBtnText}>{(user?.coins ?? 0).toLocaleString()}</Text>
          </Pressable>
        </View>

        {/* Progress overview */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.progressTitle}>Today's Progress</Text>
              <Text style={styles.progressSub}>{earnedToday} / {totalToday} coins earned</Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPct}>{Math.round((earnedToday / totalToday) * 100)}%</Text>
            </View>
          </View>
          <View style={[pbarStyles.track, { marginTop: 10, backgroundColor: "rgba(255,255,255,0.3)" }]}>
            <View style={[pbarStyles.fill, { width: `${(earnedToday / totalToday) * 100}%` as any, backgroundColor: "#fff" }]} />
          </View>
        </View>

        {/* Streak calendar */}
        <View style={{ marginTop: 14 }}>
          <Text style={styles.streakLabel}>Login Streak Rewards</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            <View style={{ flexDirection: "row", gap: 8, paddingRight: 16 }}>
              {DAILY_REWARD_STREAK.map((d, i) => {
                const isToday = i === currentDay;
                const isPast = d.claimed;
                return (
                  <View
                    key={d.day}
                    style={[
                      styles.streakDay,
                      {
                        backgroundColor: isPast ? "rgba(255,255,255,0.25)" : isToday ? "#fff" : "rgba(255,255,255,0.1)",
                        borderWidth: isToday ? 2 : 0,
                        borderColor: isToday ? colors.gold : "transparent",
                      },
                    ]}
                  >
                    {isPast ? (
                      <Feather name="check" size={14} color="#fff" />
                    ) : (
                      <Image source={COIN_IMAGE} style={{ width: 14, height: 14 }} resizeMode="contain" />
                    )}
                    <Text style={[styles.streakReward, { color: isToday ? colors.primary : "#fff" }]}>+{d.reward}</Text>
                    <Text style={[styles.streakDayLabel, { color: isToday ? colors.mutedForeground : "rgba(255,255,255,0.7)" }]}>
                      Day {d.day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={[styles.tabsBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {TABS.map((t) => {
          const active = activeTab === t.id;
          const count = missions.filter((m) => m.type === t.id && !m.completed).length;
          return (
            <Pressable key={t.id} onPress={() => setActiveTab(t.id as any)} style={[styles.tab, { borderBottomColor: active ? colors.primary : "transparent" }]}>
              <Text style={[styles.tabText, { color: active ? colors.primary : colors.mutedForeground }]}>{t.label}</Text>
              {count > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.tabBadgeText}>{count}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: insets.bottom + 24 }}>
        {/* Referral bonus card */}
        {activeTab === "one_time" && (
          <Pressable
            onPress={() => router.push("/referral")}
            style={[styles.referralCard, { backgroundColor: colors.gold + "14", borderColor: colors.gold + "40" }]}
          >
            <View style={[styles.referralIcon, { backgroundColor: colors.gold + "25" }]}>
              <Feather name="user-plus" size={22} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.referralTitle, { color: colors.foreground }]}>Refer Friends, Earn Big!</Text>
              <Text style={[styles.referralSub, { color: colors.mutedForeground }]}>Get 100 coins per friend who joins & recharges</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.gold} />
          </Pressable>
        )}

        {filtered.map((m) => (
          <MissionCard key={m.id} mission={m} onClaim={handleClaim} />
        ))}

        {claimedCoins > 0 && (
          <View style={[styles.claimedBanner, { backgroundColor: "#22C55E14", borderColor: "#22C55E40" }]}>
            <Feather name="check-circle" size={18} color="#22C55E" />
            <Text style={[styles.claimedText, { color: "#22C55E" }]}>+{claimedCoins} coins earned this session!</Text>
          </View>
        )}
      </ScrollView>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  backBtn: { padding: 4 },
  headerTitle: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  walletBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.22)", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  walletBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  progressCard: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, padding: 14 },
  progressRow: { flexDirection: "row", alignItems: "center" },
  progressTitle: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  progressSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  progressCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  progressPct: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  streakLabel: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  streakDay: { alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, minWidth: 58 },
  streakReward: { fontSize: 13, fontFamily: "Inter_700Bold" },
  streakDayLabel: { fontSize: 9, fontFamily: "Inter_400Regular" },
  tabsBar: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12, borderBottomWidth: 2, flexDirection: "row", justifyContent: "center", gap: 5 },
  tabText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  tabBadge: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  tabBadgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  referralCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  referralIcon: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  referralTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  referralSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  mCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16 },
  mIcon: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  mTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  mTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  doneBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  doneText: { color: "#22C55E", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  mDesc: { fontSize: 12, fontFamily: "Inter_400Regular" },
  mBottom: { flexDirection: "row", alignItems: "center", gap: 8 },
  mProgress: { fontSize: 11, fontFamily: "Inter_400Regular" },
  rewardBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12 },
  rewardBtnText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  claimedBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderRadius: 14, borderWidth: 1 },
  claimedText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
