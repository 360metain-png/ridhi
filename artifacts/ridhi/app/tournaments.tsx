import React, { useState } from "react";
import {
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
import { Avatar } from "@/components/Avatar";

const COIN_IMAGE = require("@/assets/images/ridhi_coin.png");


type TourneyTab = "daily" | "festival" | "my";

const DAILY_TOURNAMENTS = [
  {
    id: "dt1",
    name: "Ludo Battle Arena",
    game: "ludo",
    emoji: "🎲",
    entry: 100,
    prizePool: 10000,
    players: 228,
    maxPlayers: 256,
    startsIn: "Live Now",
    status: "live",
    topPrize: "5,000 🪙 + VIP Badge",
    color: "#E91E8C",
  },
  {
    id: "dt2",
    name: "Ludo Grand Prix 🏆",
    game: "ludo",
    emoji: "🎲",
    entry: 200,
    prizePool: 25000,
    players: 118,
    maxPlayers: 128,
    startsIn: "Live Now",
    status: "live",
    topPrize: "12,500 🪙 + Crown",
    color: "#FFB800",
  },
  {
    id: "dt3",
    name: "Couple Tournament 💑",
    game: "ludo",
    emoji: "💑",
    entry: 150,
    prizePool: 15000,
    players: 62,
    maxPlayers: 64,
    startsIn: "Live Now",
    status: "live",
    topPrize: "7,500 🪙 each + Couple Crown",
    color: "#FF6B35",
  },
  {
    id: "dt4",
    name: "Creator Match ⭐",
    game: "ludo",
    emoji: "⭐",
    entry: 500,
    prizePool: 50000,
    players: 14,
    maxPlayers: 16,
    startsIn: "Live Now",
    status: "live",
    topPrize: "25,000 🪙 + Creator Badge",
    color: "#7B2FBE",
  },
  {
    id: "dt5",
    name: "Regional Battle 🗺️",
    game: "ludo",
    emoji: "🗺️",
    entry: 50,
    prizePool: 5000,
    players: 480,
    maxPlayers: 512,
    startsIn: "Live Now",
    status: "live",
    topPrize: "2,500 🪙 + Visibility Boost",
    color: "#00BCD4",
  },
  {
    id: "dt6",
    name: "Diwali Coin Cup 🪔",
    game: "ludo",
    emoji: "🪔",
    entry: 1000,
    prizePool: 500000,
    players: 420,
    maxPlayers: 512,
    startsIn: "Live Now",
    status: "live",
    topPrize: "2,50,000 🪙 + Diwali Crown",
    color: "#FF8C00",
  },
  {
    id: "dt7",
    name: "New Year Mega Battle 🎆",
    game: "ludo",
    emoji: "🎆",
    entry: 2000,
    prizePool: 1000000,
    players: 890,
    maxPlayers: 1024,
    startsIn: "Live Now",
    status: "live",
    topPrize: "5,00,000 🪙 + Mega Crown",
    color: "#4CAF50",
  },
];

const FESTIVAL_TOURNAMENTS = [
  {
    id: "ft1",
    name: "Diwali Coin Cup 🪔",
    date: "Oct 20–22",
    prizePool: "5 Lakh Coins",
    entry: 1000,
    badge: "🏆 Mega Event",
    color: "#FFB800",
    bgColor: "#3D2B00",
  },
  {
    id: "ft2",
    name: "Valentine Couple Battle ❤️",
    date: "Feb 14",
    prizePool: "2 Lakh Coins",
    entry: 500,
    badge: "💑 Couple Special",
    color: "#E91E8C",
    bgColor: "#2D0018",
  },
  {
    id: "ft3",
    name: "Eid Gaming Event 🌙",
    date: "Dates TBA",
    prizePool: "3 Lakh Coins",
    entry: 750,
    badge: "🌟 Festival",
    color: "#00BCD4",
    bgColor: "#001A20",
  },
  {
    id: "ft4",
    name: "New Year Mega Battle 🎆",
    date: "Dec 31 – Jan 1",
    prizePool: "10 Lakh Coins",
    entry: 2000,
    badge: "👑 Grand Event",
    color: "#7B2FBE",
    bgColor: "#12002D",
  },
];

const MY_HISTORY = [
  { id: "h1", name: "Ludo Battle Arena", date: "Today", rank: 3, prize: 1200, game: "ludo", emoji: "🎲" },
  { id: "h2", name: "Ludo Grand Prix", date: "Yesterday", rank: 12, prize: 0, game: "ludo", emoji: "🎲" },
  { id: "h3", name: "Regional Battle", date: "2 days ago", rank: 1, prize: 2500, game: "ludo", emoji: "🎲" },
];

const RANK_REWARDS = [
  { rank: "Top 1", reward: "Coins + VIP Badge", color: "#FFD700" },
  { rank: "Top 2", reward: "Coins", color: "#C0C0C0" },
  { rank: "Top 3", reward: "Bonus Rewards", color: "#CD7F32" },
  { rank: "Top 10", reward: "Visibility Boost", color: "#7B2FBE" },
];

export default function TournamentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [tab, setTab] = useState<TourneyTab>("daily");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#1A0A2E", colors.secondary + "50", colors.background]}
        style={[styles.header, { paddingTop: topPad + 8 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🏆 Tournaments</Text>
          <Text style={styles.headerSub}>Compete. Win. Dominate.</Text>
        </View>
        <Pressable
          onPress={() => router.push("/leaderboard" as any)}
          style={[styles.lbBtn, { backgroundColor: colors.gold + "20" }]}
        >
          <Feather name="bar-chart-2" size={18} color={colors.gold} />
        </Pressable>
      </LinearGradient>

      <View style={styles.tabRow}>
        {(["daily", "festival", "my"] as TourneyTab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[
              styles.tabBtn,
              { backgroundColor: tab === t ? colors.primary : colors.card, borderColor: tab === t ? colors.primary : colors.border },
            ]}
          >
            <Text style={[styles.tabText, { color: tab === t ? "#fff" : colors.mutedForeground }]}>
              {t === "daily" ? "Daily" : t === "festival" ? "Festival" : "My History"}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        {tab === "daily" && (
          <>
            <View style={styles.rewardTable}>
              <Text style={[styles.rewardTableTitle, { color: colors.foreground }]}>Tournament Rewards</Text>
              <View style={styles.rewardRows}>
                {RANK_REWARDS.map((r) => (
                  <View key={r.rank} style={[styles.rewardRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.rankBadge, { backgroundColor: r.color + "25" }]}>
                      <Text style={[styles.rankBadgeText, { color: r.color }]}>{r.rank}</Text>
                    </View>
                    <Text style={[styles.rewardText, { color: colors.foreground }]}>{r.reward}</Text>
                    <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today's Tournaments</Text>
            </View>

            <View style={styles.tourneyList}>
              {DAILY_TOURNAMENTS.map((t) => (
                <View key={t.id} style={[styles.tourneyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <LinearGradient
                    colors={[t.color + "15", "transparent"]}
                    style={styles.tourneyCardInner}
                  >
                    <View style={styles.tourneyTop}>
                      <View style={[styles.tourneyGameBadge, { backgroundColor: t.color + "20" }]}>
                        <Text style={styles.tourneyGameEmoji}>{t.emoji}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.tourneyName, { color: colors.foreground }]}>{t.name}</Text>
                        <Text style={[styles.tourneyGame, { color: colors.mutedForeground }]}>
                          {t.game.charAt(0).toUpperCase() + t.game.slice(1)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              t.status === "live"
                                ? colors.success + "20"
                                : t.status === "registering"
                                ? colors.primary + "20"
                                : colors.muted,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                t.status === "live"
                                  ? colors.success
                                  : t.status === "registering"
                                  ? colors.primary
                                  : colors.mutedForeground,
                            },
                          ]}
                        >
                          {t.status === "live" ? "🔴 Live" : t.status === "registering" ? "Open" : "Soon"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.tourneyStats}>
                      <View style={styles.tourneyStat}>
                        <Text style={[styles.tourneyStatVal, { color: colors.gold }]}><Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />{t.prizePool.toLocaleString()}</Text>
                        <Text style={[styles.tourneyStatLabel, { color: colors.mutedForeground }]}>Prize Pool</Text>
                      </View>
                      <View style={styles.tourneyStat}>
                        <Text style={[styles.tourneyStatVal, { color: colors.foreground }]}>{t.players}/{t.maxPlayers}</Text>
                        <Text style={[styles.tourneyStatLabel, { color: colors.mutedForeground }]}>Players</Text>
                      </View>
                      <View style={styles.tourneyStat}>
                        <Text style={[styles.tourneyStatVal, { color: colors.foreground }]}><Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />{t.entry}</Text>
                        <Text style={[styles.tourneyStatLabel, { color: colors.mutedForeground }]}>Entry</Text>
                      </View>
                    </View>

                    <View style={[styles.prizeRow, { backgroundColor: t.color + "12", borderColor: t.color + "25" }]}>
                      <Feather name="award" size={13} color={t.color} />
                      <Text style={[styles.prizeText, { color: t.color }]}>Top prize: {t.topPrize}</Text>
                    </View>

                    <View style={styles.tourneyBottom}>
                      <Text style={[styles.startsIn, { color: colors.mutedForeground }]}>
                        🕐 {t.startsIn}
                      </Text>
                      <Pressable
                        onPress={() =>
                          router.push({
                            pathname: "/game-room" as any,
                            params: { game: t.game, mode: "1v1", entry: t.entry, tier: "Tournament" },
                          })
                        }
                      >
                        <LinearGradient
                          colors={[t.color, t.color + "AA"]}
                          style={styles.joinTourneyBtn}
                        >
                          <Text style={styles.joinTourneyText}>
                            {t.status === "live" ? "Join Now" : "Register"}
                          </Text>
                        </LinearGradient>
                      </Pressable>
                    </View>
                  </LinearGradient>
                </View>
              ))}
            </View>
          </>
        )}

        {tab === "festival" && (
          <View style={styles.festList}>
            {FESTIVAL_TOURNAMENTS.map((f) => (
              <View key={f.id} style={[styles.festCard, { backgroundColor: f.bgColor, borderColor: f.color + "40" }]}>
                <View style={styles.festTop}>
                  <Text style={[styles.festName, { color: "#fff" }]}>{f.name}</Text>
                  <View style={[styles.festBadge, { backgroundColor: f.color + "30", borderColor: f.color + "50" }]}>
                    <Text style={[styles.festBadgeText, { color: f.color }]}>{f.badge}</Text>
                  </View>
                </View>
                <Text style={[styles.festDate, { color: "rgba(255,255,255,0.6)" }]}>📅 {f.date}</Text>
                <View style={styles.festBottom}>
                  <View>
                    <Text style={[styles.festPrize, { color: f.color }]}>{f.prizePool}</Text>
                    <Text style={[styles.festPrizeLabel, { color: "rgba(255,255,255,0.5)" }]}>Total Prize Pool</Text>
                  </View>
                  <View style={[styles.festEntry, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
                    <Text style={{ color: "#fff", fontSize: 12, fontFamily: "Inter_500Medium" }}><Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />{f.entry} entry</Text>
                  </View>
                </View>
                <Pressable style={[styles.festNotifyBtn, { borderColor: f.color + "60" }]}>
                  <Feather name="bell" size={14} color={f.color} />
                  <Text style={[styles.festNotifyText, { color: f.color }]}>Notify Me</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {tab === "my" && (
          <View style={styles.historyList}>
            {MY_HISTORY.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🎮</Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No tournaments played yet</Text>
                <Pressable onPress={() => setTab("daily")}>
                  <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.emptyBtn}>
                    <Text style={styles.emptyBtnText}>Browse Tournaments</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ) : (
              MY_HISTORY.map((h) => (
                <View key={h.id} style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.historyGame, { backgroundColor: colors.muted }]}>
                    <Text style={styles.historyEmoji}>{h.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.historyName, { color: colors.foreground }]}>{h.name}</Text>
                    <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>{h.date}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <View
                      style={[
                        styles.rankBadge,
                        {
                          backgroundColor:
                            h.rank <= 3 ? colors.gold + "25" : colors.muted,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.rankBadgeText,
                          { color: h.rank <= 3 ? colors.gold : colors.mutedForeground },
                        ]}
                      >
                        #{h.rank}
                      </Text>
                    </View>
                    {h.prize > 0 && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Text style={[styles.historyPrize, { color: colors.success }]}>+{h.prize}</Text>
                        <Image source={COIN_IMAGE} style={{ width: 14, height: 14 }} resizeMode="contain" />
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, alignItems: "center", gap: 3 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },
  lbBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tabRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  rewardTable: { marginHorizontal: 16, marginBottom: 4 },
  rewardTableTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 10 },
  rewardRows: { gap: 6 },
  rewardRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  rankBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  rankBadgeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  rewardText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  section: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  tourneyList: { paddingHorizontal: 16, gap: 12 },
  tourneyCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  tourneyCardInner: { padding: 14, gap: 10 },
  tourneyTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  tourneyGameBadge: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tourneyGameEmoji: { fontSize: 22 },
  tourneyName: { fontSize: 15, fontFamily: "Inter_700Bold" },
  tourneyGame: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  tourneyStats: { flexDirection: "row", justifyContent: "space-between" },
  tourneyStat: { alignItems: "center", gap: 3 },
  tourneyStatVal: { fontSize: 14, fontFamily: "Inter_700Bold" },
  tourneyStatLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  prizeRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  prizeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  tourneyBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  startsIn: { fontSize: 13, fontFamily: "Inter_400Regular" },
  joinTourneyBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 12 },
  joinTourneyText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  festList: { paddingHorizontal: 16, gap: 14 },
  festCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 10 },
  festTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  festName: { flex: 1, fontSize: 16, fontFamily: "Inter_700Bold" },
  festBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  festBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  festDate: { fontSize: 13, fontFamily: "Inter_400Regular" },
  festBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  festPrize: { fontSize: 18, fontFamily: "Inter_700Bold" },
  festPrizeLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  festEntry: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  festNotifyBtn: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center", paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  festNotifyText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  historyList: { paddingHorizontal: 16, gap: 10 },
  historyCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  historyGame: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  historyEmoji: { fontSize: 22 },
  historyName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  historyDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  historyPrize: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  emptyBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, marginTop: 4 },
  emptyBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
});
