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
import { Avatar } from "@/components/Avatar";
import { FloatingEmojiBg } from "@/components/FloatingEmojiBg";

const COIN_IMAGE = require("@/assets/images/ridhi_coin.png");


const { width } = Dimensions.get("window");

type GameType = "all" | "ludo" | "carrom";
type BattleMode = "1v1" | "couple" | "team";

const ROOM_TIERS = [
  { id: "beginner", label: "Beginner", entry: 50,    prize: 80,    players: 1842, color: "#4CAF50", colorDark: "#2E7D32", icon: "🌱" },
  { id: "silver",   label: "Silver",   entry: 200,   prize: 320,   players: 976,  color: "#9E9E9E", colorDark: "#757575", icon: "🥈" },
  { id: "gold",     label: "Gold",     entry: 500,   prize: 800,   players: 543,  color: "#FFB800", colorDark: "#FF8C00", icon: "🥇" },
  { id: "platinum", label: "Platinum", entry: 2000,  prize: 3200,  players: 218,  color: "#00BCD4", colorDark: "#0097A7", icon: "💎" },
  { id: "vip",      label: "VIP Room", entry: 10000, prize: 16000, players: 47,   color: "#E91E8C", colorDark: "#7B2FBE", icon: "👑" },
];

const ACTIVE_ROOMS = [
  { id: "r1",  game: "ludo",   host: "Priya S",    entry: 50,    players: 3, maxPlayers: 4, tier: "Beginner", viewers: 142 },
  { id: "r2",  game: "carrom", host: "Rahul M",    entry: 200,   players: 1, maxPlayers: 2, tier: "Silver",   viewers: 58  },
  { id: "r3",  game: "ludo",   host: "Kavya R",    entry: 500,   players: 3, maxPlayers: 4, tier: "Gold",     viewers: 312 },
  { id: "r4",  game: "carrom", host: "Arjun K",    entry: 2000,  players: 2, maxPlayers: 2, tier: "Platinum", viewers: 780 },
  { id: "r5",  game: "ludo",   host: "Dev T",      entry: 10000, players: 2, maxPlayers: 4, tier: "VIP",      viewers: 2104 },
  { id: "r6",  game: "ludo",   host: "Sneha P",    entry: 50,    players: 2, maxPlayers: 4, tier: "Beginner", viewers: 87  },
  { id: "r7",  game: "carrom", host: "Vivek A",    entry: 500,   players: 1, maxPlayers: 2, tier: "Gold",     viewers: 203 },
  { id: "r8",  game: "ludo",   host: "Meera J",    entry: 200,   players: 3, maxPlayers: 4, tier: "Silver",   viewers: 134 },
  { id: "r9",  game: "carrom", host: "Rohan D",    entry: 10000, players: 1, maxPlayers: 2, tier: "VIP",      viewers: 1876 },
  { id: "r10", game: "ludo",   host: "Ananya S",   entry: 2000,  players: 2, maxPlayers: 4, tier: "Platinum", viewers: 498 },
];

const DAILY_MISSIONS = [
  { id: "m1", task: "Win 3 Games", reward: 100, progress: 1, total: 3, done: false },
  { id: "m2", task: "Play 1 Hour", reward: "Bonus XP", progress: 22, total: 60, done: false },
  { id: "m3", task: "Invite a Friend", reward: "Referral Coins", progress: 1, total: 1, done: true },
  { id: "m4", task: "Join a Tournament", reward: "Gift Coupon", progress: 0, total: 1, done: false },
];

const TIER_COLORS: Record<string, string> = {
  Beginner: "#4CAF50",
  Silver: "#9E9E9E",
  Gold: "#FFB800",
  Platinum: "#00BCD4",
  VIP: "#E91E8C",
};

export default function GamesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [gameFilter, setGameFilter] = useState<GameType>("all");
  const [battleMode, setBattleMode] = useState<BattleMode>("1v1");

  const filteredRooms = ACTIVE_ROOMS.filter((r) =>
    gameFilter === "all" ? true : r.game === gameFilter
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FloatingEmojiBg preset="match" />
      <LinearGradient
        colors={["#1A0A2E", colors.secondary + "40", colors.background]}
        style={[styles.heroBg, { paddingTop: topPad + 8 }]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>🎮 Gaming Arena</Text>
            <View style={[styles.liveTag, { backgroundColor: colors.success + "20" }]}>
              <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.liveText, { color: colors.success }]}>8,420 online · LIVE</Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push("/tournaments" as any)}
            style={[styles.tourneyBtn, { backgroundColor: colors.gold + "20", borderColor: colors.gold + "40" }]}
          >
            <Feather name="award" size={16} color={colors.gold} />
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: "Games Today", value: "24,816" },
            { label: "Coins Won", value: "12.6L" },
            { label: "Top Prize", value: "₹16,000" },
          ].map((s) => (
            <View key={s.label} style={[styles.statBox, { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.12)" }]}>
              <Text style={[styles.statVal, { color: "#EEEEF5" }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: "rgba(255,255,255,0.55)" }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={styles.gameFilterRow}>
          {(["all", "ludo", "carrom"] as GameType[]).map((g) => (
            <Pressable
              key={g}
              onPress={() => setGameFilter(g)}
              style={[
                styles.gameFilterBtn,
                {
                  backgroundColor: gameFilter === g ? colors.secondary : colors.card,
                  borderColor: gameFilter === g ? colors.secondary : colors.border,
                },
              ]}
            >
              <Text style={styles.gameFilterEmoji}>
                {g === "all" ? "🎮" : g === "ludo" ? "🎲" : "🎯"}
              </Text>
              <Text style={[styles.gameFilterText, { color: gameFilter === g ? "#fff" : colors.mutedForeground }]}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.modeRow}>
          {(["1v1", "couple", "team"] as BattleMode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => setBattleMode(m)}
              style={[
                styles.modeBtn,
                {
                  backgroundColor: battleMode === m ? colors.primary + "20" : "transparent",
                  borderColor: battleMode === m ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={styles.modeEmoji}>
                {m === "1v1" ? "⚔️" : m === "couple" ? "💑" : "👥"}
              </Text>
              <Text style={[styles.modeText, { color: battleMode === m ? colors.primary : colors.mutedForeground }]}>
                {m === "1v1" ? "1 vs 1" : m === "couple" ? "Couple" : "Team 2v2"}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Choose Room</Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>Entry fee determines prize pool</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tierRow}>
          {ROOM_TIERS.map((tier) => (
            <Pressable
              key={tier.id}
              onPress={() =>
                router.push({
                  pathname: "/game-room" as any,
                  params: { game: gameFilter === "all" ? "ludo" : gameFilter, mode: battleMode, entry: tier.entry, tier: tier.label },
                })
              }
              style={styles.tierCard}
            >
              <LinearGradient
                colors={[tier.color + "30", tier.colorDark + "10"]}
                style={[styles.tierCardInner, { borderColor: tier.color + "60" }]}
              >
                {/* LIVE badge */}
                <View style={[styles.tierLiveBadge, { backgroundColor: colors.success }]}>
                  <View style={styles.tierLiveDot} />
                  <Text style={styles.tierLiveText}>LIVE</Text>
                </View>
                <Text style={styles.tierIcon}>{tier.icon}</Text>
                <Text style={[styles.tierLabel, { color: "#fff" }]}>{tier.label}</Text>
                <View style={[styles.tierEntry, { backgroundColor: tier.color + "20" }]}>
                  <Text style={[styles.tierEntryText, { color: tier.color }]}><Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />{tier.entry}</Text>
                </View>
                <Text style={[styles.tierPrize, { color: colors.gold }]}>Win {tier.prize}</Text>
                <View style={styles.tierPlayers}>
                  <View style={[styles.playerDot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.tierPlayersText, { color: "rgba(255,255,255,0.7)" }]}>{tier.players.toLocaleString()} playing</Text>
                </View>
              </LinearGradient>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Live Rooms</Text>
            <Pressable onPress={() => router.push("/tournaments" as any)}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.roomsList}>
          {filteredRooms.map((room) => {
            const tierColor = TIER_COLORS[room.tier] ?? colors.primary;
            return (
              <Pressable
                key={room.id}
                onPress={() =>
                  router.push({
                    pathname: "/game-room" as any,
                    params: { game: room.game, mode: "1v1", entry: room.entry, tier: room.tier },
                  })
                }
                style={[styles.roomCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.roomGameBadge, { backgroundColor: tierColor + "20" }]}>
                  <Text style={styles.roomGameEmoji}>{room.game === "ludo" ? "🎲" : "🎯"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.roomTop}>
                    <Text style={[styles.roomHost, { color: colors.foreground }]}>{room.host}'s Room</Text>
                    <View style={[styles.roomTierBadge, { backgroundColor: tierColor + "20", borderColor: tierColor + "40" }]}>
                      <Text style={[styles.roomTierText, { color: tierColor }]}>{room.tier}</Text>
                    </View>
                  </View>
                  <View style={styles.roomMeta}>
                    <Text style={[styles.roomMetaText, { color: colors.mutedForeground }]}><Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />{room.entry} entry · {room.players}/{room.maxPlayers} players
                    </Text>
                    <View style={styles.roomViewers}>
                      <Feather name="eye" size={11} color={colors.mutedForeground} />
                      <Text style={[styles.roomViewersText, { color: colors.mutedForeground }]}>{room.viewers}</Text>
                    </View>
                  </View>
                </View>
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  style={styles.joinBtn}
                >
                  <Text style={styles.joinBtnText}>Join</Text>
                </LinearGradient>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.createRoomCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <LinearGradient
            colors={[colors.secondary + "25", colors.primary + "15"]}
            style={styles.createRoomInner}
          >
            <View>
              <Text style={[styles.createRoomTitle, { color: colors.foreground }]}>Create Private Room</Text>
              <Text style={[styles.createRoomSub, { color: colors.mutedForeground }]}>Invite friends or host a public match</Text>
            </View>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/game-room" as any,
                  params: { game: "ludo", mode: battleMode, entry: 100, tier: "Custom", host: "true" },
                })
              }
            >
              <LinearGradient colors={[colors.secondary, colors.primary]} style={styles.createBtn}>
                <Feather name="plus" size={16} color="#fff" />
                <Text style={styles.createBtnText}>Create</Text>
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Daily Missions</Text>
        </View>

        <View style={styles.missionsList}>
          {DAILY_MISSIONS.map((m) => (
            <View key={m.id} style={[styles.missionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.missionLeft}>
                <Text style={[styles.missionTask, { color: colors.foreground }]}>{m.task}</Text>
                <View style={[styles.missionBar, { backgroundColor: colors.muted }]}>
                  <View
                    style={[
                      styles.missionProgress,
                      {
                        backgroundColor: m.done ? colors.success : colors.primary,
                        width: `${Math.min(100, (m.progress / m.total) * 100)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.missionProgressText, { color: colors.mutedForeground }]}>
                  {m.progress}/{m.total}
                </Text>
              </View>
              <View style={[styles.missionReward, { backgroundColor: m.done ? colors.success + "20" : colors.gold + "20" }]}>
                <Text style={[styles.missionRewardText, { color: m.done ? colors.success : colors.gold }]}>
                  {m.done ? "✓ Done" : typeof m.reward === "number" ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                      <Text style={{ color: m.done ? colors.success : colors.gold }}>{`+${m.reward} `}</Text>
                      <Image source={COIN_IMAGE} style={{ width: 13, height: 13 }} resizeMode="contain" />
                    </View>
                  ) : m.reward}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroBg: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, alignItems: "center", gap: 4 },
  heroTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  liveTag: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  liveText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  tourneyBtn: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  statsRow: { flexDirection: "row", gap: 8 },
  statBox: { flex: 1, alignItems: "center", padding: 12, borderRadius: 12, borderWidth: 1 },
  statVal: { fontSize: 16, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2, textAlign: "center" },
  gameFilterRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingTop: 16 },
  gameFilterBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  gameFilterEmoji: { fontSize: 15 },
  gameFilterText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  modeRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingTop: 10 },
  modeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  modeEmoji: { fontSize: 14 },
  modeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  section: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  sectionSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  tierRow: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  tierCard: { width: 130 },
  tierCardInner: { borderRadius: 16, borderWidth: 1, padding: 14, alignItems: "center", gap: 8 },
  tierIcon: { fontSize: 28 },
  tierLabel: { fontSize: 15, fontFamily: "Inter_700Bold" },
  tierEntry: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tierEntryText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  tierPrize: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  tierLiveBadge:  { position: "absolute", top: 8, right: 8, flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  tierLiveDot:    { width: 5, height: 5, borderRadius: 3, backgroundColor: "#fff", opacity: 0.9 },
  tierLiveText:   { fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.5 },
  tierPlayers: { flexDirection: "row", alignItems: "center", gap: 5 },
  playerDot: { width: 7, height: 7, borderRadius: 4 },
  tierPlayersText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  roomsList: { paddingHorizontal: 16, gap: 10 },
  roomCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  roomGameBadge: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  roomGameEmoji: { fontSize: 22 },
  roomTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  roomHost: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  roomTierBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  roomTierText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  roomMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  roomMetaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  roomViewers: { flexDirection: "row", alignItems: "center", gap: 3 },
  roomViewersText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  joinBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  joinBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  createRoomCard: { marginHorizontal: 16, marginTop: 16, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  createRoomInner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  createRoomTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  createRoomSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  createBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  createBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  missionsList: { paddingHorizontal: 16, gap: 10 },
  missionCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  missionLeft: { flex: 1, gap: 6 },
  missionTask: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  missionBar: { height: 4, borderRadius: 2, overflow: "hidden" },
  missionProgress: { height: "100%", borderRadius: 2 },
  missionProgressText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  missionReward: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  missionRewardText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
