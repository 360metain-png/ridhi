import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/Avatar";

const { width, height } = Dimensions.get("window");

const GIFTS = [
  { id: "g1", emoji: "🌹", name: "Rose", coins: 10 },
  { id: "g2", emoji: "💗", name: "Heart", coins: 50 },
  { id: "g3", emoji: "🎂", name: "Cake", coins: 100 },
  { id: "g4", emoji: "🚗", name: "Car", coins: 5000 },
  { id: "g5", emoji: "🛥️", name: "Yacht", coins: 25000 },
  { id: "g6", emoji: "✈️", name: "Jet", coins: 100000 },
];

const REACTIONS = ["😂", "😮", "😤", "🔥", "👏", "💀", "🎉", "❤️"];

const OPPONENT = {
  name: "Rahul Verma",
  city: "Delhi",
  level: "Gold",
  coins: 1240,
  winRate: "64%",
};

const LUDO_GRID_SIZE = Math.min(width - 40, 340);
const SAFE_SPOTS = [1, 9, 14, 22, 27, 35, 40, 48];

function LudoBoardPreview({ colors }: { colors: any }) {
  return (
    <View style={[styles.boardWrapper, { width: LUDO_GRID_SIZE, height: LUDO_GRID_SIZE }]}>
      <LinearGradient
        colors={[colors.secondary + "25", colors.primary + "10"]}
        style={[styles.boardBg, { borderColor: colors.border }]}
      >
        <View style={styles.boardQuadrant}>
          <LinearGradient colors={["#E91E8C40", "#E91E8C20"]} style={styles.quadHome}>
            <View style={styles.pieceGrid}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={[styles.piece, { backgroundColor: "#E91E8C" }]} />
              ))}
            </View>
          </LinearGradient>
          <LinearGradient colors={["#4CAF5040", "#4CAF5020"]} style={styles.quadHome}>
            <View style={styles.pieceGrid}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={[styles.piece, { backgroundColor: "#4CAF50" }]} />
              ))}
            </View>
          </LinearGradient>
        </View>
        <View style={[styles.boardCenter, { backgroundColor: colors.card }]}>
          <Text style={styles.boardCenterText}>🏆</Text>
        </View>
        <View style={styles.boardQuadrant}>
          <LinearGradient colors={["#FFB80040", "#FFB80020"]} style={styles.quadHome}>
            <View style={styles.pieceGrid}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={[styles.piece, { backgroundColor: "#FFB800" }]} />
              ))}
            </View>
          </LinearGradient>
          <LinearGradient colors={["#7B2FBE40", "#7B2FBE20"]} style={styles.quadHome}>
            <View style={styles.pieceGrid}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={[styles.piece, { backgroundColor: "#7B2FBE" }]} />
              ))}
            </View>
          </LinearGradient>
        </View>
        <View style={styles.boardLabel}>
          <Text style={[styles.boardLabelText, { color: colors.mutedForeground }]}>Tap to enter game</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

function CarromBoardPreview({ colors }: { colors: any }) {
  const SIZE = LUDO_GRID_SIZE;
  return (
    <View style={[styles.boardWrapper, { width: SIZE, height: SIZE }]}>
      <LinearGradient
        colors={["#3E2723", "#4E342E", "#3E2723"]}
        style={[styles.boardBg, { borderColor: "#8D6E63", borderWidth: 3 }]}
      >
        <View style={[styles.carromInner, { borderColor: "rgba(255,255,255,0.15)" }]}>
          <View style={[styles.carromCenter, { borderColor: "rgba(255,255,255,0.3)" }]}>
            <Text style={{ fontSize: 24 }}>⚫</Text>
          </View>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
            const angle = (i / 9) * 2 * Math.PI;
            const r = 50;
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            return (
              <View
                key={i}
                style={[
                  styles.carromPiece,
                  {
                    backgroundColor: i % 2 === 0 ? "#fff" : "#212121",
                    transform: [{ translateX: x }, { translateY: y }],
                  },
                ]}
              />
            );
          })}
        </View>
        <View style={[styles.carromCorner, { top: 8, left: 8 }]} />
        <View style={[styles.carromCorner, { top: 8, right: 8 }]} />
        <View style={[styles.carromCorner, { bottom: 8, left: 8 }]} />
        <View style={[styles.carromCorner, { bottom: 8, right: 8 }]} />
        <View style={styles.boardLabel}>
          <Text style={[styles.boardLabelText, { color: "rgba(255,255,255,0.5)" }]}>Tap to enter game</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

export default function GameRoomScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ game: string; mode: string; entry: string; tier: string; host?: string }>();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 24 : insets.bottom;

  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(false);
  const [showGifts, setShowGifts] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [myCoins, setMyCoins] = useState(0);
  const [opCoins, setOpCoins] = useState(0);
  const [timer, setTimer] = useState(0);
  const [gameState, setGameState] = useState<"waiting" | "playing" | "ended">("waiting");
  const [sentGift, setSentGift] = useState<string | null>(null);
  const [reaction, setReaction] = useState<string | null>(null);
  const giftAnim = useRef(new Animated.Value(0)).current;
  const reactionAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<any>(null);

  const entry = parseInt(params.entry ?? "50");
  const prize = Math.floor(entry * 1.6);
  const game = params.game ?? "ludo";
  const tier = params.tier ?? "Beginner";
  const isHost = params.host === "true";

  useEffect(() => {
    const t = setTimeout(() => setGameState("playing"), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
        setMyCoins((prev) => prev + Math.floor(Math.random() * 5));
        setOpCoins((prev) => prev + Math.floor(Math.random() * 6));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const sendGift = (gift: typeof GIFTS[0]) => {
    setSentGift(`${gift.emoji} ${gift.name}`);
    setShowGifts(false);
    Animated.sequence([
      Animated.timing(giftAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(giftAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setSentGift(null));
  };

  const sendReaction = (r: string) => {
    setReaction(r);
    setShowReactions(false);
    Animated.sequence([
      Animated.spring(reactionAnim, { toValue: 1, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(reactionAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setReaction(null));
  };

  const endGame = () => {
    clearInterval(timerRef.current);
    setGameState("ended");
  };

  const totalCoins = myCoins + opCoins || 1;
  const myPct = Math.round((myCoins / totalCoins) * 100);
  const opPct = 100 - myPct;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#1A0A2E", colors.secondary + "35", colors.background]}
        style={[styles.header, { paddingTop: topPad + 8 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{game === "ludo" ? "🎲 Ludo" : "🎯 Carrom"} · {tier}</Text>
          <View style={[styles.timerBadge, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <Feather name="clock" size={12} color="#fff" />
            <Text style={styles.timerText}>{formatTime(timer)}</Text>
          </View>
        </View>
        <View style={[styles.entryBadge, { backgroundColor: colors.gold + "25" }]}>
          <Text style={[styles.entryText, { color: colors.gold }]}>🪙 {entry}</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 80 }}>
        <View style={styles.playersRow}>
          <View style={styles.playerCard}>
            <Avatar name="You" size={52} hasStory />
            <Text style={[styles.playerName, { color: colors.foreground }]}>You</Text>
            <View style={[styles.coinPill, { backgroundColor: colors.primary + "20" }]}>
              <Text style={[styles.coinPillText, { color: colors.primary }]}>🪙 {myCoins}</Text>
            </View>
          </View>

          <View style={styles.vsCenter}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.vsBadge}>
              <Text style={styles.vsText}>VS</Text>
            </LinearGradient>
            {gameState === "waiting" ? (
              <Text style={[styles.waitText, { color: colors.mutedForeground }]}>Waiting...</Text>
            ) : (
              <View style={styles.prizeBox}>
                <Text style={[styles.prizeLabel, { color: colors.mutedForeground }]}>Prize</Text>
                <Text style={[styles.prizeValue, { color: colors.gold }]}>🪙 {prize}</Text>
              </View>
            )}
          </View>

          <View style={styles.playerCard}>
            <Avatar name={OPPONENT.name} size={52} hasStory />
            <Text style={[styles.playerName, { color: colors.foreground }]} numberOfLines={1}>{OPPONENT.name.split(" ")[0]}</Text>
            <View style={[styles.coinPill, { backgroundColor: colors.secondary + "20" }]}>
              <Text style={[styles.coinPillText, { color: colors.secondary }]}>🪙 {opCoins}</Text>
            </View>
          </View>
        </View>

        {gameState === "playing" && (
          <View style={styles.coinBattle}>
            <View style={[styles.coinBattleBar, { backgroundColor: colors.muted }]}>
              <Animated.View style={[styles.myBar, { width: `${myPct}%`, backgroundColor: colors.primary }]} />
              <Animated.View style={[styles.opBar, { width: `${opPct}%`, backgroundColor: colors.secondary }]} />
            </View>
            <View style={styles.coinBattleLabels}>
              <Text style={[styles.coinBattleLabel, { color: colors.primary }]}>{myPct}%</Text>
              <Text style={[styles.coinBattleLabel, { color: colors.secondary }]}>{opPct}%</Text>
            </View>
          </View>
        )}

        <View style={styles.boardArea}>
          {game === "ludo" ? (
            <LudoBoardPreview colors={colors} />
          ) : (
            <CarromBoardPreview colors={colors} />
          )}
        </View>

        <View style={[styles.controlsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable
            onPress={() => setMicOn((v) => !v)}
            style={[styles.controlBtn, { backgroundColor: micOn ? colors.success + "20" : colors.muted, borderColor: micOn ? colors.success + "40" : colors.border }]}
          >
            <Feather name={micOn ? "mic" : "mic-off"} size={20} color={micOn ? colors.success : colors.mutedForeground} />
          </Pressable>

          <Pressable
            onPress={() => setVideoOn((v) => !v)}
            style={[styles.controlBtn, { backgroundColor: videoOn ? colors.primary + "20" : colors.muted, borderColor: videoOn ? colors.primary + "40" : colors.border }]}
          >
            <Feather name={videoOn ? "video" : "video-off"} size={20} color={videoOn ? colors.primary : colors.mutedForeground} />
          </Pressable>

          <Pressable
            onPress={() => setShowReactions(true)}
            style={[styles.controlBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
          >
            <Text style={styles.controlEmoji}>😊</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowGifts(true)}
            style={[styles.controlBtn, { backgroundColor: colors.gold + "15", borderColor: colors.gold + "30" }]}
          >
            <Feather name="gift" size={20} color={colors.gold} />
          </Pressable>

          <Pressable
            onPress={endGame}
            style={[styles.controlBtn, { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "30" }]}
          >
            <Feather name="flag" size={20} color={colors.destructive} />
          </Pressable>
        </View>

        {gameState === "ended" && (
          <LinearGradient
            colors={[colors.gold + "25", colors.primary + "20"]}
            style={[styles.resultCard, { borderColor: colors.gold + "40" }]}
          >
            <Text style={styles.resultEmoji}>{myCoins > opCoins ? "🏆" : "😢"}</Text>
            <Text style={[styles.resultTitle, { color: colors.foreground }]}>
              {myCoins > opCoins ? "You Won!" : "Better luck next time!"}
            </Text>
            <Text style={[styles.resultSub, { color: colors.mutedForeground }]}>
              {myCoins > opCoins ? `+${prize} coins added to wallet` : `${entry} coins deducted`}
            </Text>
            <View style={styles.resultBtns}>
              <Pressable
                onPress={() => setGameState("waiting")}
                style={[styles.resultBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.resultBtnText}>Play Again</Text>
              </Pressable>
              <Pressable
                onPress={() => router.back()}
                style={[styles.resultBtn, { backgroundColor: colors.muted }]}
              >
                <Text style={[styles.resultBtnText, { color: colors.foreground }]}>Exit</Text>
              </Pressable>
            </View>
          </LinearGradient>
        )}
      </ScrollView>

      {sentGift && (
        <Animated.View
          style={[
            styles.giftFloat,
            {
              opacity: giftAnim,
              transform: [{ scale: giftAnim }, { translateY: giftAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
            },
          ]}
        >
          <LinearGradient colors={[colors.secondary, colors.primary]} style={styles.giftFloatInner}>
            <Text style={styles.giftFloatText}>{sentGift}</Text>
          </LinearGradient>
        </Animated.View>
      )}

      {reaction && (
        <Animated.View
          style={[
            styles.reactionFloat,
            {
              opacity: reactionAnim,
              transform: [{ scale: reactionAnim }],
            },
          ]}
        >
          <Text style={styles.reactionText}>{reaction}</Text>
        </Animated.View>
      )}

      <Modal visible={showGifts} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowGifts(false)}>
          <View style={[styles.giftsPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.giftsDrag, { backgroundColor: colors.border }]} />
            <Text style={[styles.giftsTitle, { color: colors.foreground }]}>Send a Gift</Text>
            <View style={styles.giftsGrid}>
              {GIFTS.map((g) => (
                <Pressable
                  key={g.id}
                  onPress={() => sendGift(g)}
                  style={[styles.giftItem, { backgroundColor: colors.muted, borderColor: colors.border }]}
                >
                  <Text style={styles.giftEmoji}>{g.emoji}</Text>
                  <Text style={[styles.giftName, { color: colors.foreground }]}>{g.name}</Text>
                  <Text style={[styles.giftCoins, { color: colors.gold }]}>🪙 {g.coins.toLocaleString()}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={showReactions} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowReactions(false)}>
          <View style={[styles.reactionsPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {REACTIONS.map((r) => (
              <Pressable key={r} onPress={() => sendReaction(r)} style={styles.reactionBtn}>
                <Text style={styles.reactionBtnText}>{r}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14 },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, alignItems: "center", gap: 5 },
  headerTitle: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  timerBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  timerText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  entryBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  entryText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  playersRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, gap: 8 },
  playerCard: { flex: 1, alignItems: "center", gap: 6 },
  playerName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  coinPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  coinPillText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  vsCenter: { alignItems: "center", gap: 8 },
  vsBadge: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  vsText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  waitText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  prizeBox: { alignItems: "center", gap: 2 },
  prizeLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  prizeValue: { fontSize: 13, fontFamily: "Inter_700Bold" },
  coinBattle: { paddingHorizontal: 20, paddingTop: 12, gap: 5 },
  coinBattleBar: { height: 8, borderRadius: 4, flexDirection: "row", overflow: "hidden" },
  myBar: { height: "100%" },
  opBar: { height: "100%" },
  coinBattleLabels: { flexDirection: "row", justifyContent: "space-between" },
  coinBattleLabel: { fontSize: 12, fontFamily: "Inter_700Bold" },
  boardArea: { alignItems: "center", paddingVertical: 16 },
  boardWrapper: { borderRadius: 16, overflow: "hidden" },
  boardBg: { flex: 1, padding: 12 },
  boardQuadrant: { flex: 1, flexDirection: "row", gap: 6 },
  quadHome: { flex: 1, borderRadius: 10, padding: 10, alignItems: "center", justifyContent: "center" },
  pieceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, width: 50 },
  piece: { width: 18, height: 18, borderRadius: 9 },
  boardCenter: { position: "absolute", top: "40%", left: "40%", width: "20%", height: "20%", borderRadius: 8, alignItems: "center", justifyContent: "center" },
  boardCenterText: { fontSize: 20 },
  boardLabel: { position: "absolute", bottom: 10, left: 0, right: 0, alignItems: "center" },
  boardLabelText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  carromInner: { position: "absolute", top: 12, left: 12, right: 12, bottom: 12, borderRadius: 8, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  carromCenter: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  carromPiece: { position: "absolute", width: 20, height: 20, borderRadius: 10 },
  carromCorner: { position: "absolute", width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "rgba(255,255,255,0.3)" },
  controlsRow: { flexDirection: "row", justifyContent: "center", gap: 12, marginHorizontal: 20, padding: 14, borderRadius: 20, borderWidth: 1 },
  controlBtn: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  controlEmoji: { fontSize: 20 },
  resultCard: { marginHorizontal: 20, marginTop: 16, borderRadius: 20, borderWidth: 1, padding: 24, alignItems: "center", gap: 8 },
  resultEmoji: { fontSize: 48 },
  resultTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  resultSub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  resultBtns: { flexDirection: "row", gap: 12, marginTop: 8 },
  resultBtn: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 14 },
  resultBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  giftFloat: { position: "absolute", bottom: 120, left: 20, right: 20, alignItems: "center" },
  giftFloatInner: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  giftFloatText: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  reactionFloat: { position: "absolute", top: "35%", left: 0, right: 0, alignItems: "center" },
  reactionText: { fontSize: 64 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" },
  giftsPanel: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderWidth: 1 },
  giftsDrag: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 14 },
  giftsTitle: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 16 },
  giftsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  giftItem: { width: (width - 60) / 3, alignItems: "center", padding: 12, borderRadius: 14, borderWidth: 1, gap: 4 },
  giftEmoji: { fontSize: 28 },
  giftName: { fontSize: 13, fontFamily: "Inter_500Medium" },
  giftCoins: { fontSize: 12, fontFamily: "Inter_700Bold" },
  reactionsPanel: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: 20, marginBottom: 40, borderRadius: 20, padding: 12, borderWidth: 1, justifyContent: "center", gap: 6 },
  reactionBtn: { padding: 10 },
  reactionBtnText: { fontSize: 32 },
});
