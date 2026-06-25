import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors"
import { useTrackScreen } from "@/hooks/useAnalytics";
;
import { useAuth } from "@/contexts/AuthContext";
import { CoinBadge } from "@/components/CoinBadge";
import { GradientButton } from "@/components/GradientButton";
import { PrivateHead } from "@/components/PrivateHead";
const COIN_IMAGE = require("../assets/images/ridhi_coin.png");

const BADGES = [
  { id: "b1", name: "First Post", icon: "edit-3", desc: "Published your first post", earned: true, color: "#E91E8C" },
  { id: "b2", name: "Social Butterfly", icon: "users", desc: "Got 100 followers", earned: true, color: "#7B2FBE" },
  { id: "b3", name: "Coin Collector", icon: "star", desc: "Earned 500 coins", earned: true, color: "#FFB800" },
  { id: "b4", name: "Viral Creator", icon: "trending-up", desc: "Post reached 10K views", earned: false, color: "#FF6B35" },
  { id: "b5", name: "Community Leader", icon: "shield", desc: "Created a community", earned: false, color: "#4A90E2" },
  { id: "b6", name: "Live Star", icon: "video", desc: "Go live 5 times", earned: false, color: "#34C759" },
  { id: "b7", name: "Streak Master", icon: "zap", desc: "7-day login streak", earned: true, color: "#FF3B30" },
  { id: "b8", name: "Explorer", icon: "compass", desc: "Visit all sections of the app", earned: false, color: "#5AC8FA" },
];

const CHALLENGES = [
  { id: "c1", title: "Monsoon Moments", desc: "Post a monsoon photo with #MonsoonMagic", reward: 100, participants: 14200, ends: "3 days", joined: true },
  { id: "c2", title: "Street Food Diaries", desc: "Share your fav street food experience", reward: 150, participants: 9800, ends: "5 days", joined: false },
  { id: "c3", title: "Dance India Dance", desc: "Post a 30-second dance reel", reward: 200, participants: 32100, ends: "7 days", joined: false },
];

const REFERRALS = [
  { id: "r1", name: "Rohan K", joined: "2 days ago", earned: 50, status: "verified" },
  { id: "r2", name: "Sunita J", joined: "5 days ago", earned: 50, status: "verified" },
  { id: "r3", name: "Kiran N", joined: "1 week ago", earned: 50, status: "pending" },
];

export default function ReferralScreen() {
  useTrackScreen("referral");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addCoins } = useAuth();
  const [streak] = useState(7);
  const [claimedToday, setClaimedToday] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const referralCode = `RIDHI${(user?.name ?? "USER").replace(/\s/g, "").slice(0, 5).toUpperCase()}`;

  const shareCode = async () => {
    try {
      await Share.share({
        message: `Join me on Ridhi — India's coolest social app! Use my referral code ${referralCode} and get 50 free coins after you sign up. Download: https://ridhi.app`,
        title: "Ridhi",
        url: "https://ridhi.app",
      });
    } catch {}
  };

  const claimDailyBonus = () => {
    if (claimedToday) return;
    addCoins(1 + streak);
    setClaimedToday(true);
  };

  return (
    <>
      <PrivateHead />
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary + "25", colors.secondary + "15", "transparent"]}
        style={[styles.header, { paddingTop: topPad + 10 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Rewards & Referral</Text>
        <CoinBadge amount={user?.coins ?? 0} size="sm" />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <View style={[styles.streakCard, { borderColor: colors.border }]}>
          <LinearGradient colors={[colors.gold + "30", colors.accent + "15"]} style={styles.streakInner}>
            <View style={styles.streakLeft}>
              <Text style={[styles.streakLabel, { color: colors.mutedForeground }]}>Daily Streak</Text>
              <View style={styles.streakRow}>
                <Feather name="zap" size={28} color={colors.gold} />
                <Text style={[styles.streakCount, { color: colors.foreground }]}>{streak}</Text>
                <Text style={[styles.streakDays, { color: colors.mutedForeground }]}>days</Text>
              </View>
            </View>
            <Pressable
              onPress={claimDailyBonus}
              style={[
                styles.claimBtn,
                { backgroundColor: claimedToday ? colors.muted : colors.gold },
              ]}
            >
              {claimedToday ? (
                <>
                  <Feather name="check" size={16} color={colors.mutedForeground} />
                  <Text style={[styles.claimText, { color: colors.mutedForeground }]}>Claimed</Text>
                </>
              ) : (
                <>
                  <Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />
                  <Text style={[styles.claimText, { color: "#fff" }]}>+{1 + streak} coins</Text>
                </>
              )}
            </Pressable>
          </LinearGradient>
          <View style={styles.streakDots}>
            {Array.from({ length: 7 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.streakDot,
                  { backgroundColor: i < streak ? colors.gold : colors.muted },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={[styles.referralCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.referralTop}>
            <View>
              <Text style={[styles.referralTitle, { color: colors.foreground }]}>Invite Friends & Earn</Text>
              <Text style={[styles.referralSub, { color: colors.mutedForeground }]}>Get 50 coins per verified referral</Text>
            </View>
            <View style={[styles.referralReward, { backgroundColor: colors.primary + "18" }]}>
              <Image source={COIN_IMAGE} style={{ width: 14, height: 14 }} resizeMode="contain" />
              <Text style={[styles.referralRewardText, { color: colors.primary }]}>50 coins</Text>
            </View>
          </View>
          <View style={[styles.codeBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Text style={[styles.code, { color: colors.foreground }]}>{referralCode}</Text>
            <Pressable style={[styles.copyBtn, { backgroundColor: colors.secondary + "18" }]}>
              <Feather name="copy" size={16} color={colors.secondary} />
            </Pressable>
          </View>
          <GradientButton label="Share Referral Link" onPress={shareCode} style={{ marginTop: 4 }} />

          {REFERRALS.length > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Your Referrals</Text>
              {REFERRALS.map((r) => (
                <View key={r.id} style={styles.referralRow}>
                  <Feather name="user" size={14} color={colors.mutedForeground} />
                  <Text style={[styles.referralName, { color: colors.foreground }]}>{r.name}</Text>
                  <Text style={[styles.referralDate, { color: colors.mutedForeground }]}>{r.joined}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: r.status === "verified" ? colors.success + "20" : colors.gold + "20" }]}>
                    <Text style={[styles.statusText, { color: r.status === "verified" ? colors.success : colors.gold }]}>
                      {r.status === "verified" ? `+${r.earned}` : "Pending"}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Achievement Badges</Text>
        <View style={styles.badgesGrid}>
          {BADGES.map((badge) => (
            <View
              key={badge.id}
              style={[
                styles.badgeItem,
                {
                  backgroundColor: badge.earned ? colors.card : colors.muted + "60",
                  borderColor: badge.earned ? badge.color + "40" : colors.border,
                  opacity: badge.earned ? 1 : 0.5,
                },
              ]}
            >
              <View style={[styles.badgeIcon, { backgroundColor: badge.color + "20" }]}>
                <Feather name={badge.icon as any} size={22} color={badge.earned ? badge.color : colors.mutedForeground} />
              </View>
              <Text style={[styles.badgeName, { color: badge.earned ? colors.foreground : colors.mutedForeground }]} numberOfLines={1}>
                {badge.name}
              </Text>
              {badge.earned && (
                <View style={[styles.earnedDot, { backgroundColor: badge.color }]} />
              )}
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Trending Challenges</Text>
        <View style={styles.challengesList}>
          {CHALLENGES.map((ch) => (
            <View key={ch.id} style={[styles.challengeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.challengeTop}>
                <Text style={[styles.challengeTitle, { color: colors.foreground }]}>{ch.title}</Text>
                <View style={[styles.rewardBadge, { backgroundColor: colors.gold + "20" }]}>
                  <Image source={COIN_IMAGE} style={{ width: 12, height: 12 }} resizeMode="contain" />
                  <Text style={[styles.rewardText, { color: colors.gold }]}>{ch.reward}</Text>
                </View>
              </View>
              <Text style={[styles.challengeDesc, { color: colors.mutedForeground }]}>{ch.desc}</Text>
              <View style={styles.challengeMeta}>
                <Feather name="users" size={12} color={colors.mutedForeground} />
                <Text style={[styles.challengeMetaText, { color: colors.mutedForeground }]}>
                  {ch.participants.toLocaleString()} joined
                </Text>
                <Feather name="clock" size={12} color={colors.mutedForeground} style={{ marginLeft: 12 }} />
                <Text style={[styles.challengeMetaText, { color: colors.mutedForeground }]}>{ch.ends} left</Text>
              </View>
              <Pressable
                style={[
                  styles.joinBtn,
                  { backgroundColor: ch.joined ? colors.success + "18" : colors.primary, borderColor: ch.joined ? colors.success + "40" : colors.primary },
                ]}
              >
                <Text style={[styles.joinBtnText, { color: ch.joined ? colors.success : "#fff" }]}>
                  {ch.joined ? "Joined" : "Join Challenge"}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  streakCard: { margin: 16, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  streakInner: { padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  streakLeft: { gap: 4 },
  streakLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  streakRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  streakCount: { fontSize: 36, fontFamily: "Inter_700Bold" },
  streakDays: { fontSize: 16, fontFamily: "Inter_400Regular" },
  claimBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  claimText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  streakDots: { flexDirection: "row", gap: 6, padding: 14, justifyContent: "center" },
  streakDot: { width: 32, height: 8, borderRadius: 4 },
  referralCard: { marginHorizontal: 16, borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  referralTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  referralTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  referralSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  referralReward: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  referralRewardText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  codeBox: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12 },
  code: { fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  copyBtn: { padding: 8, borderRadius: 8 },
  sectionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 },
  referralRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 },
  referralName: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  referralDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", paddingHorizontal: 16, marginTop: 20, marginBottom: 12 },
  badgesGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  badgeItem: { width: "22%", alignItems: "center", padding: 10, borderRadius: 14, borderWidth: 1, gap: 6, position: "relative" },
  badgeIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  badgeName: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },
  earnedDot: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4 },
  challengesList: { paddingHorizontal: 16, gap: 12 },
  challengeCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 8 },
  challengeTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  challengeTitle: { fontSize: 15, fontFamily: "Inter_700Bold", flex: 1 },
  rewardBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  rewardText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  challengeDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  challengeMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  challengeMetaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  joinBtn: { paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  joinBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
