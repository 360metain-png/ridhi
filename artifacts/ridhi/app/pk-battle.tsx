import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
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
import * as ScreenCapture from "expo-screen-capture";
import { useColors } from "@/hooks/useColors"
import { useTrackScreen } from "@/hooks/useAnalytics";
;
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/Avatar";
import { GradientButton } from "@/components/GradientButton";
import { PrivateHead } from "@/components/PrivateHead";

const COIN_IMAGE = require("../assets/images/ridhi_coin.png");


const { width } = Dimensions.get("window");

const GIFTS = [
  { id: "rose", emoji: "🌹", name: "Rose", coins: 10, color: "#FF3B6F" },
  { id: "heart", emoji: "💗", name: "Heart", coins: 50, color: "#E91E8C" },
  { id: "cake", emoji: "🎂", name: "Cake", coins: 100, color: "#FF6B35" },
  { id: "car", emoji: "🚗", name: "Car", coins: 5000, color: "#7B2FBE" },
  { id: "yacht", emoji: "🛥️", name: "Yacht", coins: 25000, color: "#00BCD4" },
  { id: "jet", emoji: "✈️", name: "Jet", coins: 100000, color: "#FFB800" },
];

const LIVE_BATTLES = [
  {
    id: "b1",
    leftHost: "Priya Sharma", leftCity: "Mumbai", leftCoins: 8420, leftLanguage: "Hindi",
    rightHost: "Kavya R", rightCity: "Hyderabad", rightCoins: 6180, rightLanguage: "Telugu",
    viewers: 3841, duration: "02:14", title: "🔥 Bollywood vs Tollywood",
  },
  {
    id: "b2",
    leftHost: "Rahul Verma", leftCity: "Delhi", leftCoins: 12400, leftLanguage: "Hindi",
    rightHost: "Dev Patel", rightCity: "Bangalore", rightCoins: 9900, rightLanguage: "English",
    viewers: 2104, duration: "01:42", title: "⚡ North vs South",
  },
  {
    id: "b3",
    leftHost: "Meera K", leftCity: "Kochi", leftCoins: 3200, leftLanguage: "Malayalam",
    rightHost: "Ananya S", rightCity: "Kolkata", rightCoins: 4700, rightLanguage: "Bengali",
    viewers: 977, duration: "00:55", title: "🎵 Music Battle",
  },
];

function FloatingGift({ emoji, side }: { emoji: string; side: "left" | "right" }) {
  const anim = useRef(new Animated.Value(0)).current;
  const opacAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(opacAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.Text
      style={{
        position: "absolute",
        fontSize: 32,
        left: side === "left" ? "20%" : "65%",
        top: "50%",
        opacity: opacAnim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -120] }) }],
      }}
    >
      {emoji}
    </Animated.Text>
  );
}

export default function PKBattleScreen() {
  useTrackScreen("pk_battle");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  // Block screenshots & screen recordings during PK battles (native only)
  useEffect(() => {
    if (Platform.OS === "web") return;
    ScreenCapture.preventScreenCaptureAsync("ridhi-pk");
    return () => { ScreenCapture.allowScreenCaptureAsync("ridhi-pk"); };
  }, []);
  const [view, setView] = useState<"browse" | "battle">("browse");
  const [activeBattle, setActiveBattle] = useState<typeof LIVE_BATTLES[0] | null>(null);
  const [leftCoins, setLeftCoins] = useState(0);
  const [rightCoins, setRightCoins] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [ended, setEnded] = useState(false);
  const [floatingGifts, setFloatingGifts] = useState<{ id: string; emoji: string; side: "left" | "right" }[]>([]);
  const [supportSide, setSupportSide] = useState<"left" | "right">("left");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const vsAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(vsAnim, { toValue: 1.18, duration: 600, useNativeDriver: true }),
        Animated.timing(vsAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (view !== "battle" || ended) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { setEnded(true); clearInterval(timer); return 0; }
        return t - 1;
      });
      if (Math.random() > 0.7) {
        setLeftCoins((c) => c + Math.floor(Math.random() * 200));
      }
      if (Math.random() > 0.7) {
        setRightCoins((c) => c + Math.floor(Math.random() * 200));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [view, ended]);

  const joinBattle = (battle: typeof LIVE_BATTLES[0]) => {
    setActiveBattle(battle);
    setLeftCoins(battle.leftCoins);
    setRightCoins(battle.rightCoins);
    setTimeLeft(180);
    setEnded(false);
    setView("battle");
  };

  const sendGift = (gift: typeof GIFTS[0]) => {
    if (supportSide === "left") {
      setLeftCoins((c) => c + gift.coins);
    } else {
      setRightCoins((c) => c + gift.coins);
    }
    const id = Date.now().toString();
    setFloatingGifts((prev) => [...prev, { id, emoji: gift.emoji, side: supportSide }]);
    setTimeout(() => setFloatingGifts((prev) => prev.filter((g) => g.id !== id)), 1600);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const total = leftCoins + rightCoins;
  const leftPct = total > 0 ? leftCoins / total : 0.5;
  const winner = leftCoins >= rightCoins ? activeBattle?.leftHost : activeBattle?.rightHost;

  if (view === "battle" && activeBattle) {
    return (
      <View style={[styles.battleContainer, { backgroundColor: "#08080F" }]}>
        <LinearGradient
          colors={["#E91E8C18", "transparent", "#7B2FBE18"]}
          style={StyleSheet.absoluteFill}
        />

        {floatingGifts.map((g) => (
          <FloatingGift key={g.id} emoji={g.emoji} side={g.side} />
        ))}

        <View style={[styles.battleHeader, { paddingTop: topPad + 8 }]}>
          <Pressable onPress={() => setView("browse")} style={styles.backBtnDark}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>
          <Text style={styles.battleTitle}>{activeBattle.title}</Text>
          <View style={[styles.viewerChip, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
            <Feather name="eye" size={12} color="#fff" />
            <Text style={styles.viewerCount}>{activeBattle.viewers.toLocaleString()}</Text>
          </View>
        </View>

        {ended ? (
          <View style={styles.winnerBanner}>
            <LinearGradient colors={["#FFB800", "#FF6B35"]} style={styles.winnerGradient}>
              <Text style={styles.winnerEmoji}>🏆</Text>
              <Text style={styles.winnerText}>{winner} Wins!</Text>
              <Text style={styles.winnerSub}>PK Battle Champion</Text>
            </LinearGradient>
          </View>
        ) : (
          <View style={styles.timerWrap}>
            <LinearGradient colors={["#E91E8C", "#7B2FBE"]} style={styles.timerBadge}>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </LinearGradient>
          </View>
        )}

        <View style={styles.hostRow}>
          <View style={styles.hostSide}>
            <Avatar name={activeBattle.leftHost} size={64} hasStory />
            <Text style={styles.hostName}>{activeBattle.leftHost}</Text>
            <Text style={styles.hostCity}>{activeBattle.leftCity}</Text>
            <View style={styles.coinRow}>
              <Image source={COIN_IMAGE} style={{ width: 18, height: 18 }} resizeMode="contain" />
              <Text style={[styles.coinCount, { color: "#E91E8C" }]}>
                {leftCoins.toLocaleString()}
              </Text>
            </View>
          </View>

          <Animated.View style={[styles.vsWrap, { transform: [{ scale: vsAnim }] }]}>
            <LinearGradient colors={["#E91E8C", "#7B2FBE"]} style={styles.vsCircle}>
              <Text style={styles.vsText}>PK</Text>
            </LinearGradient>
          </Animated.View>

          <View style={styles.hostSide}>
            <Avatar name={activeBattle.rightHost} size={64} hasStory />
            <Text style={styles.hostName}>{activeBattle.rightHost}</Text>
            <Text style={styles.hostCity}>{activeBattle.rightCity}</Text>
            <View style={styles.coinRow}>
              <Image source={COIN_IMAGE} style={{ width: 18, height: 18 }} resizeMode="contain" />
              <Text style={[styles.coinCount, { color: "#7B2FBE" }]}>
                {rightCoins.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.battleBar}>
          <View style={[styles.battleBarLeft, { flex: Math.max(leftPct, 0.05) }]}>
            <LinearGradient colors={["#E91E8C", "#FF6B35"]} style={StyleSheet.absoluteFill} />
          </View>
          <View style={[styles.battleBarRight, { flex: Math.max(1 - leftPct, 0.05) }]}>
            <LinearGradient colors={["#7B2FBE", "#4A90E2"]} style={StyleSheet.absoluteFill} />
          </View>
        </View>

        <View style={styles.supportToggle}>
          <Text style={styles.supportLabel}>Support:</Text>
          <Pressable
            style={[styles.supportBtn, supportSide === "left" && styles.supportBtnActive]}
            onPress={() => setSupportSide("left")}
          >
            <Text style={styles.supportBtnText}>{activeBattle.leftHost.split(" ")[0]}</Text>
          </Pressable>
          <Pressable
            style={[styles.supportBtn, supportSide === "right" && styles.supportBtnActive]}
            onPress={() => setSupportSide("right")}
          >
            <Text style={styles.supportBtnText}>{activeBattle.rightHost.split(" ")[0]}</Text>
          </Pressable>
        </View>

        {!ended && (
          <View style={styles.giftRowBattle}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingVertical: 8 }}>
              {GIFTS.map((gift) => (
                <Pressable key={gift.id} onPress={() => sendGift(gift)} style={[styles.giftChip, { borderColor: gift.color + "50" }]}>
                  <Text style={styles.giftEmoji}>{gift.emoji}</Text>
                  <Text style={styles.giftCoins}>
                    {gift.coins >= 1000 ? `${(gift.coins / 1000).toFixed(0)}K` : gift.coins}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
        {ended && (
          <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
            <GradientButton label="Watch Next Battle" onPress={() => setView("browse")} style={{ width: "100%" }} />
          </View>
        )}
      </View>
    );
  }

  return (
    <>
      <PrivateHead />
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.destructive + "15", colors.primary + "08", "transparent"]}
        style={[styles.headerGlow, { height: topPad + 100 }]}
      />
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.surface + "F0", borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>⚔️ PK Battles</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{LIVE_BATTLES.length} battles live now</Text>
        </View>
        <LinearGradient colors={["#FF3B30", "#E91E8C"]} style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </LinearGradient>
      </View>

      <FlatList
        data={LIVE_BATTLES}
        keyExtractor={(b) => b.id}
        contentContainerStyle={{ padding: 12, gap: 10, paddingBottom: insets.bottom + 20 }}
        renderItem={({ item }) => {
          const t = item.leftCoins + item.rightCoins;
          const lp = t > 0 ? item.leftCoins / t : 0.5;
          return (
            <Pressable onPress={() => joinBattle(item)}>
              <LinearGradient
                colors={[colors.card, colors.surface]}
                style={[styles.battleCard, { borderColor: colors.border }]}
              >
                <View style={styles.battleCardHeader}>
                  <Text style={[styles.battleCardTitle, { color: colors.foreground }]}>{item.title}</Text>
                  <View style={styles.battleCardMeta}>
                    <Feather name="eye" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.battleCardMetaText, { color: colors.mutedForeground }]}>{item.viewers.toLocaleString()}</Text>
                    <View style={[styles.liveDot, { backgroundColor: colors.destructive }]} />
                    <Text style={[styles.battleCardMetaText, { color: colors.destructive }]}>{item.duration}</Text>
                  </View>
                </View>

                <View style={styles.battleCardHosts}>
                  <View style={styles.battleCardHost}>
                    <Avatar name={item.leftHost} size={46} hasStory />
                    <Text style={[styles.battleCardHostName, { color: colors.foreground }]}>{item.leftHost.split(" ")[0]}</Text>
                    <Text style={[styles.battleCardCoins, { color: "#E91E8C" }]}><Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />{(item.leftCoins / 1000).toFixed(1)}K</Text>
                  </View>
                  <LinearGradient colors={["#E91E8C", "#7B2FBE"]} style={styles.vsMini}>
                    <Text style={styles.vsTextMini}>PK</Text>
                  </LinearGradient>
                  <View style={styles.battleCardHost}>
                    <Avatar name={item.rightHost} size={46} hasStory />
                    <Text style={[styles.battleCardHostName, { color: colors.foreground }]}>{item.rightHost.split(" ")[0]}</Text>
                    <Text style={[styles.battleCardCoins, { color: "#7B2FBE" }]}><Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />{(item.rightCoins / 1000).toFixed(1)}K</Text>
                  </View>
                </View>

                <View style={styles.miniBar}>
                  <View style={[styles.miniBarLeft, { flex: Math.max(lp, 0.05) }]}>
                    <LinearGradient colors={["#E91E8C", "#FF6B35"]} style={StyleSheet.absoluteFill} />
                  </View>
                  <View style={[styles.miniBarRight, { flex: Math.max(1 - lp, 0.05) }]}>
                    <LinearGradient colors={["#7B2FBE", "#4A90E2"]} style={StyleSheet.absoluteFill} />
                  </View>
                </View>

                <View style={styles.joinRow}>
                  <Text style={[styles.joinHint, { color: colors.mutedForeground }]}>Tap to watch & send gifts</Text>
                  <Feather name="chevron-right" size={16} color={colors.primary} />
                </View>
              </LinearGradient>
            </Pressable>
          );
        }}
        ListHeaderComponent={
          <LinearGradient
            colors={["#E91E8C18", "#7B2FBE10"]}
            style={[styles.heroBanner, { borderColor: colors.border }]}
          >
            <Text style={styles.heroBannerEmoji}>⚔️</Text>
            <View>
              <Text style={[styles.heroBannerTitle, { color: colors.foreground }]}>PK Battle Arena</Text>
              <Text style={[styles.heroBannerSub, { color: colors.mutedForeground }]}>Compete, gift & crown the winner</Text>
            </View>
          </LinearGradient>
        }
      />
    </View>
  </>
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
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  liveBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  liveBadgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  heroBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  heroBannerEmoji: { fontSize: 36 },
  heroBannerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  heroBannerSub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  battleCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  battleCardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  battleCardTitle: { fontSize: 15, fontFamily: "Inter_700Bold", flex: 1 },
  battleCardMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  battleCardMetaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  battleCardHosts: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  battleCardHost: { alignItems: "center", gap: 5, flex: 1 },
  battleCardHostName: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  battleCardCoins: { fontSize: 12, fontFamily: "Inter_700Bold" },
  vsMini: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  vsTextMini: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  miniBar: { flexDirection: "row", height: 5, borderRadius: 3, overflow: "hidden" },
  miniBarLeft: { position: "relative", overflow: "hidden" },
  miniBarRight: { position: "relative", overflow: "hidden" },
  joinRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  joinHint: { fontSize: 12, fontFamily: "Inter_400Regular" },
  // Battle view
  battleContainer: { flex: 1 },
  battleHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backBtnDark: { padding: 6 },
  battleTitle: { flex: 1, fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  viewerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  viewerCount: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#fff" },
  timerWrap: { alignItems: "center", paddingVertical: 8 },
  timerBadge: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 24,
    shadowColor: "#E91E8C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  timerText: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 2 },
  winnerBanner: { paddingHorizontal: 24, paddingVertical: 8 },
  winnerGradient: {
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 4,
  },
  winnerEmoji: { fontSize: 48 },
  winnerText: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#fff" },
  winnerSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  hostRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  hostSide: { flex: 1, alignItems: "center", gap: 5 },
  hostName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff", textAlign: "center" },
  hostCity: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },
  coinRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  coinEmoji: { fontSize: 14 },
  coinCount: { fontSize: 16, fontFamily: "Inter_700Bold" },
  vsWrap: { alignItems: "center", justifyContent: "center" },
  vsCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E91E8C",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
  },
  vsText: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  battleBar: { flexDirection: "row", marginHorizontal: 16, height: 8, borderRadius: 4, overflow: "hidden" },
  battleBarLeft: { position: "relative", overflow: "hidden" },
  battleBarRight: { position: "relative", overflow: "hidden" },
  supportToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  supportLabel: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "Inter_500Medium" },
  supportBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  supportBtnActive: {
    backgroundColor: "#E91E8C30",
    borderColor: "#E91E8C",
  },
  supportBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  giftRowBattle: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(255,255,255,0.1)" },
  giftChip: {
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    minWidth: 60,
  },
  giftEmoji: { fontSize: 24 },
  giftCoins: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
