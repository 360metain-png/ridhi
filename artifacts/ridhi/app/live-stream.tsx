import React, { useState, useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Image,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";

const COIN_IMAGE = require("@/assets/images/ridhi_coin.png");
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ScreenCapture from "expo-screen-capture";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/Avatar";
import { CoinBadge } from "@/components/CoinBadge";
import { GradientButton } from "@/components/GradientButton";
import { CoinFountainOverlay, useCoinToasts } from "@/components/CoinFountain";
import { PrivateHead } from "@/components/PrivateHead";

const LIVE_GIFTS = [
  { id: "g1", emoji: "🌹", name: "Rose", cost: 10, color: "#FF3B6F" },
  { id: "g2", emoji: "💗", name: "Heart", cost: 50, color: "#E91E8C" },
  { id: "g3", emoji: "🎂", name: "Cake", cost: 100, color: "#FF6B35" },
  { id: "g4", emoji: "🚗", name: "Car", cost: 5000, color: "#7B2FBE" },
  { id: "g5", emoji: "🛥️", name: "Yacht", cost: 25000, color: "#00BCD4" },
  { id: "g6", emoji: "✈️", name: "Jet", cost: 100000, color: "#FFB800" },
];

const LIVE_ROOMS = [
  { id: "l1", host: "Priya Sharma", viewers: 2847, city: "Mumbai", title: "Bollywood Night", coins: 12400, language: "Hindi" },
  { id: "l2", host: "Rahul Verma", viewers: 1203, city: "Delhi", title: "Gaming Live", coins: 4800, language: "Hindi" },
  { id: "l3", host: "Kavya R", viewers: 892, city: "Hyderabad", title: "Telugu Songs", coins: 3200, language: "Telugu" },
  { id: "l4", host: "Meera K", viewers: 541, city: "Kochi", title: "Cooking Malayalam", coins: 1900, language: "Malayalam" },
  { id: "l5", host: "Dev Patel", viewers: 2100, city: "Bangalore", title: "Tech Talk", coins: 8700, language: "English" },
];

const CHAT_MESSAGES = [
  { id: "m1", user: "Ananya", text: "Amazing performance! 🔥", time: "2s" },
  { id: "m2", user: "Rahul", text: "Sent Heart x5", time: "5s", isGift: true, giftColor: "#FF3B6F" },
  { id: "m3", user: "Priya", text: "Love this song!", time: "8s" },
  { id: "m4", user: "Arjun", text: "Sent Star", time: "11s", isGift: true, giftColor: "#FFB800" },
  { id: "m5", user: "Meera", text: "You're the best!", time: "14s" },
  { id: "m6", user: "Kavya", text: "Sent Bolt x2", time: "17s", isGift: true, giftColor: "#7B2FBE" },
];

// ── Big gift flying overlay (for expensive gifts) ──────────────────────────────
function BigGiftOverlay({ gift, onDone }: { gift: typeof LIVE_GIFTS[0]; onDone: () => void }) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 70, friction: 5 }),
        Animated.timing(glow, { toValue: 1, duration: 400, useNativeDriver: false }),
        Animated.timing(rotate, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.delay(1200),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.3, duration: 500, useNativeDriver: true }),
      ]),
    ]).start(() => onDone());
  }, []);

  const rotateInterp = rotate.interpolate({ inputRange: [0, 1], outputRange: ["-15deg", "15deg"] });
  const shadowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] });

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, styles.bigGiftOverlay, { opacity, pointerEvents: "none" }]}
    >
      <Animated.View
        style={[
          styles.bigGiftBg,
          { backgroundColor: gift.color + "40", transform: [{ scale }, { rotate: rotateInterp }] },
        ]}
      >
        <Text style={styles.bigGiftEmoji}>{gift.emoji}</Text>
      </Animated.View>
      <Animated.View style={[styles.bigGiftPill, { borderColor: gift.color, transform: [{ scale }] }]}>
        <Text style={styles.bigGiftPillText}>{gift.name}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <Image source={COIN_IMAGE} style={{ width: 12, height: 12 }} resizeMode="contain" />
            <Text style={{ fontSize: 11, color: "#FFB800" }}>{gift.cost.toLocaleString()} coins</Text>
          </View>
      </Animated.View>
    </Animated.View>
  );
}

// ── Host coin counter pill (animates when coins arrive) ───────────────────────
function HostCoinPill({ coins }: { coins: number }) {
  const scale = useRef(new Animated.Value(1)).current;
  const prevCoins = useRef(coins);

  useEffect(() => {
    if (coins === prevCoins.current) return;
    prevCoins.current = coins;
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.25, useNativeDriver: true, tension: 120, friction: 4 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }),
    ]).start();
  }, [coins]);

  return (
    <Animated.View style={[styles.hostCoinPill, { transform: [{ scale }] }]}>
      <Image source={COIN_IMAGE} style={{ width: 18, height: 18 }} resizeMode="contain" />
      <Text style={[styles.hostCoinText, { color: "#FFB800" }]}>{coins.toLocaleString()}</Text>
    </Animated.View>
  );
}

export default function LiveStreamScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addCoins } = useAuth();
  const { toasts, fire, remove } = useCoinToasts();
  // Block screenshots & screen recordings during live streams (native only)
  useEffect(() => {
    if (Platform.OS === "web") return;
    ScreenCapture.preventScreenCaptureAsync("ridhi-live");
    return () => { ScreenCapture.allowScreenCaptureAsync("ridhi-live"); };
  }, []);

  const [view, setView] = useState<"browse" | "watch" | "host">("browse");
  const [selectedRoom, setSelectedRoom] = useState<typeof LIVE_ROOMS[0] | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(CHAT_MESSAGES);
  const [viewers, setViewers] = useState(0);
  const [liveCoins, setLiveCoins] = useState(0);
  const [hostTitle, setHostTitle] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [hostDuration, setHostDuration] = useState(0);
  const [showGifts, setShowGifts] = useState(false);
  const [bigGift, setBigGift] = useState<typeof LIVE_GIFTS[0] | null>(null);
  const prevLiveCoins = useRef(0);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // Auto-coin events in host mode
  useEffect(() => {
    if (view === "watch" && selectedRoom) setViewers(selectedRoom.viewers);
    if (isLive) {
      const t = setInterval(() => {
        setHostDuration((d) => d + 1);
        if (Math.random() > 0.65) setViewers((v) => v + Math.floor(Math.random() * 5));
        if (Math.random() > 0.75) {
          const earned = Math.floor(Math.random() * 80) + 10;
          setLiveCoins((c) => {
            const next = c + earned;
            return next;
          });
          // Host credit toast
          fire({
            type: "credit",
            amount: earned,
            label: "Gift Received",
            sublabel: "Host Earnings",
            bottom: 120,
          });
        }
      }, 3000);
      return () => clearInterval(t);
    }
  }, [view, selectedRoom, isLive]);

  // Auto-simulate incoming gifts in watch mode
  const autoGiftRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (view === "watch") {
      const names = ["Riya", "Vikram", "Pooja", "Sai", "Naina", "Dev"];
      const pickGift = () => LIVE_GIFTS[Math.floor(Math.random() * 3)];
      autoGiftRef.current = setInterval(() => {
        const g = pickGift();
        const sender = names[Math.floor(Math.random() * names.length)];
        setMessages((prev) => [
          ...prev,
          { id: `am_${Date.now()}`, user: sender, text: `Sent ${g.name}`, time: "now", isGift: true, giftColor: g.color },
        ]);
        // Show credit animation as if we're the host receiving
        fire({ type: "credit", amount: g.cost, label: `${g.emoji} ${g.name}`, sublabel: `From ${sender}`, bottom: 130 });
      }, 4000 + Math.random() * 3000);
    }
    return () => { if (autoGiftRef.current) clearInterval(autoGiftRef.current); };
  }, [view]);

  const sendGift = (gift: typeof LIVE_GIFTS[0]) => {
    if ((user?.coins ?? 0) < gift.cost) return;
    addCoins(-gift.cost);
    const newMsg = {
      id: `m${Date.now()}`,
      user: user?.name?.split(" ")[0] ?? "You",
      text: `Sent ${gift.name}`,
      time: "now",
      isGift: true,
      giftColor: gift.color,
    };
    setMessages((prev) => [...prev, newMsg]);
    setShowGifts(false);

    // Debit toast for user
    fire({ type: "debit", amount: gift.cost, label: `${gift.emoji} ${gift.name}`, sublabel: "Gift Sent", large: gift.cost >= 1000, bottom: 150 });

    // Big gift overlay for premium gifts
    if (gift.cost >= 5000) setBigGift(gift);
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── Browse ──────────────────────────────────────────────────────────────────
  if (view === "browse") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[colors.primary + "25", colors.secondary + "15", "transparent"]}
          style={[styles.header, { paddingTop: topPad + 10 }]}
        >
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Live Streams</Text>
          <GradientButton label="Go Live" onPress={() => setView("host")} small />
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          <View style={[styles.featuredBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <LinearGradient colors={[colors.primary + "30", colors.secondary + "20"]} style={styles.featuredInner}>
              <View style={[styles.liveBadge, { backgroundColor: colors.destructive }]}>
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
              <Text style={[styles.featuredHost, { color: colors.foreground }]}>{LIVE_ROOMS[0].host}</Text>
              <Text style={[styles.featuredTitle, { color: colors.mutedForeground }]}>{LIVE_ROOMS[0].title}</Text>
              <View style={styles.featuredMeta}>
                <Feather name="eye" size={14} color={colors.mutedForeground} />
                <Text style={[styles.featuredMetaText, { color: colors.mutedForeground }]}>
                  {LIVE_ROOMS[0].viewers.toLocaleString()} watching
                </Text>
                <Feather name="star" size={14} color={colors.gold} style={{ marginLeft: 12 }} />
                <Text style={[styles.featuredMetaText, { color: colors.gold }]}>
                  {LIVE_ROOMS[0].coins.toLocaleString()} coins
                </Text>
              </View>
              <GradientButton
                label="Join Stream"
                onPress={() => { setSelectedRoom(LIVE_ROOMS[0]); setView("watch"); }}
                small
                style={{ alignSelf: "flex-start", marginTop: 8 }}
              />
            </LinearGradient>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All Live Rooms</Text>
          {LIVE_ROOMS.map((room) => (
            <Pressable
              key={room.id}
              onPress={() => { setSelectedRoom(room); setView("watch"); }}
              style={[styles.roomCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Avatar name={room.host} size={52} hasStory />
              <View style={{ flex: 1 }}>
                <View style={styles.roomTop}>
                  <Text style={[styles.roomHost, { color: colors.foreground }]}>{room.host}</Text>
                  <View style={[styles.liveBadgeSm, { backgroundColor: colors.destructive }]}>
                    <Text style={styles.liveBadgeSmText}>LIVE</Text>
                  </View>
                </View>
                <Text style={[styles.roomTitle, { color: colors.mutedForeground }]}>{room.title}</Text>
                <View style={styles.roomMeta}>
                  <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.roomMetaText, { color: colors.mutedForeground }]}>{room.city}</Text>
                  <Feather name="eye" size={12} color={colors.mutedForeground} style={{ marginLeft: 8 }} />
                  <Text style={[styles.roomMetaText, { color: colors.mutedForeground }]}>{room.viewers.toLocaleString()}</Text>
                  <Feather name="star" size={12} color={colors.gold} style={{ marginLeft: 8 }} />
                  <Text style={[styles.roomMetaText, { color: colors.gold }]}>{room.coins.toLocaleString()}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ── Watch ──────────────────────────────────────────────────────────────────
  if (view === "watch" && selectedRoom) {
    return (
      <View style={[styles.container, { backgroundColor: "#000" }]}>
        <LinearGradient
          colors={[colors.secondary + "80", colors.primary + "50", "transparent"]}
          style={styles.watchVideo}
        >
          <View style={[styles.watchHeader, { paddingTop: topPad + 8 }]}>
            <Pressable onPress={() => setView("browse")} style={styles.backBtnWhite}>
              <Feather name="arrow-left" size={22} color="#fff" />
            </Pressable>
            <View style={styles.watchMeta}>
              <View style={[styles.liveBadge, { backgroundColor: colors.destructive }]}>
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
              <Feather name="eye" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.watchViewers}>{viewers.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.hostInfo}>
            <Avatar name={selectedRoom.host} size={44} hasStory />
            <View>
              <Text style={styles.watchHostName}>{selectedRoom.host}</Text>
              <Text style={styles.watchHostTitle}>{selectedRoom.title}</Text>
            </View>
            <Pressable style={[styles.followBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.followBtnText}>Follow</Text>
            </Pressable>
          </View>
        </LinearGradient>

        <View style={styles.watchChat}>
          <FlatList
            data={messages}
            keyExtractor={(m) => m.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.chatRow}>
                <Text style={[styles.chatUser, { color: item.isGift ? item.giftColor : colors.primary }]}>
                  {item.user}
                </Text>
                <Text style={[styles.chatText, { color: item.isGift ? item.giftColor : colors.foreground }]}>
                  {item.isGift ? "  " : " "}{item.text}
                </Text>
              </View>
            )}
            contentContainerStyle={{ paddingVertical: 8 }}
          />
        </View>

        {showGifts && (
          <View style={[styles.giftsPanel, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
            <View style={styles.giftsPanelHeader}>
              <Text style={[styles.giftsPanelTitle, { color: colors.foreground }]}>Send a Gift</Text>
              <CoinBadge amount={user?.coins ?? 0} size="sm" />
            </View>
            <View style={styles.giftsGrid}>
              {LIVE_GIFTS.map((g) => (
                <Pressable key={g.id} onPress={() => sendGift(g)} style={styles.giftItem}>
                  <View style={[styles.giftIcon, { backgroundColor: g.color + "20" }]}>
                    <Text style={{ fontSize: 24 }}>{g.emoji}</Text>
                  </View>
                  <Text style={[styles.giftName, { color: colors.foreground }]}>{g.name}</Text>
                  <View style={styles.giftCost}>
                    <Image source={COIN_IMAGE} style={{ width: 14, height: 14 }} resizeMode="contain" />
                    <Text style={[styles.giftCostText, { color: colors.mutedForeground }]}>
                      {g.cost >= 1000 ? `${(g.cost / 1000).toFixed(0)}K` : g.cost}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={[styles.watchInput, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.chatInput, { backgroundColor: colors.muted, color: colors.foreground }]}
            placeholder="Say something..."
            placeholderTextColor={colors.mutedForeground}
            value={message}
            onChangeText={setMessage}
          />
          <Pressable onPress={() => setShowGifts((v) => !v)} style={[styles.giftBtn, { backgroundColor: colors.gold + "20" }]}>
            <Feather name="gift" size={20} color={colors.gold} />
          </Pressable>
          <Pressable
            onPress={() => {
              if (!message.trim()) return;
              setMessages((p) => [...p, { id: `m${Date.now()}`, user: user?.name?.split(" ")[0] ?? "Me", text: message, time: "now" }]);
              setMessage("");
            }}
            style={[styles.sendBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="send" size={16} color="#fff" />
          </Pressable>
        </View>

        {bigGift && <BigGiftOverlay gift={bigGift} onDone={() => setBigGift(null)} />}
        <CoinFountainOverlay toasts={toasts} onRemove={remove} />
      </View>
    );
  }

  // ── Host ──────────────────────────────────────────────────────────────────
  if (view === "host") {
    return (
      <View style={[styles.container, { backgroundColor: "#000" }]}>
        {!isLive ? (
          <View style={[styles.goLiveSetup, { backgroundColor: colors.background }]}>
            <LinearGradient
              colors={[colors.secondary + "25", colors.primary + "15", "transparent"]}
              style={[styles.header, { paddingTop: topPad + 10 }]}
            >
              <Pressable onPress={() => setView("browse")} style={styles.backBtn}>
                <Feather name="arrow-left" size={24} color={colors.foreground} />
              </Pressable>
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>Go Live</Text>
              <View style={{ width: 40 }} />
            </LinearGradient>
            <View style={styles.goLiveContent}>
              <View style={[styles.cameraPreview, { backgroundColor: colors.muted }]}>
                <Feather name="video" size={48} color={colors.mutedForeground} />
                <Text style={[styles.cameraPreviewText, { color: colors.mutedForeground }]}>Camera preview</Text>
              </View>
              <TextInput
                style={[styles.titleInput, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                placeholder="Give your stream a title..."
                placeholderTextColor={colors.mutedForeground}
                value={hostTitle}
                onChangeText={setHostTitle}
              />
              <GradientButton
                label="Start Live Stream"
                onPress={() => { setIsLive(true); setViewers(0); setLiveCoins(0); }}
                style={{ marginTop: 8 }}
              />
              <Text style={[styles.liveDisclaimer, { color: colors.mutedForeground }]}>
                By going live you agree to community guidelines.
              </Text>
            </View>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <LinearGradient colors={[colors.secondary + "80", colors.primary + "50"]} style={styles.hostVideo}>
              <View style={[styles.hostHud, { paddingTop: topPad + 8 }]}>
                <View style={[styles.liveBadge, { backgroundColor: colors.destructive }]}>
                  <Text style={styles.liveBadgeText}>LIVE  {fmt(hostDuration)}</Text>
                </View>
                <View style={styles.hostHudRight}>
                  <View style={styles.hostStats}>
                    <Feather name="eye" size={14} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.hostStatText}>{viewers.toLocaleString()}</Text>
                  </View>
                  <HostCoinPill coins={liveCoins} />
                </View>
              </View>
              <Text style={styles.hostVideoText}>Your camera</Text>
            </LinearGradient>
            <View style={[styles.hostControls, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
              <Pressable style={[styles.controlBtn2, { backgroundColor: colors.muted }]}>
                <Feather name="mic" size={22} color={colors.foreground} />
              </Pressable>
              <Pressable style={[styles.controlBtn2, { backgroundColor: colors.muted }]}>
                <Feather name="camera" size={22} color={colors.foreground} />
              </Pressable>
              <Pressable
                onPress={() => { setIsLive(false); setView("browse"); }}
                style={[styles.endLiveBtn, { backgroundColor: colors.destructive }]}
              >
                <Feather name="x" size={20} color="#fff" />
                <Text style={styles.endLiveText}>End Live</Text>
              </Pressable>
              <Pressable style={[styles.controlBtn2, { backgroundColor: colors.muted }]}>
                <Feather name="share-2" size={22} color={colors.foreground} />
              </Pressable>
              <Pressable style={[styles.controlBtn2, { backgroundColor: colors.muted }]}>
                <Feather name="settings" size={22} color={colors.foreground} />
              </Pressable>
            </View>
            <CoinFountainOverlay toasts={toasts} onRemove={remove} />
          </View>
        )}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { padding: 4 },
  backBtnWhite: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  featuredBanner: { margin: 16, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  featuredInner: { padding: 20, gap: 6 },
  liveBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: "flex-start" },
  liveBadgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  featuredHost: { fontSize: 20, fontFamily: "Inter_700Bold" },
  featuredTitle: { fontSize: 14, fontFamily: "Inter_400Regular" },
  featuredMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  featuredMetaText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", paddingHorizontal: 16, marginBottom: 8 },
  roomCard: { flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 16, marginBottom: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  roomTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  roomHost: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  liveBadgeSm: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  liveBadgeSmText: { color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.8 },
  roomTitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  roomMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  roomMetaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  watchVideo: { height: 300, justifyContent: "space-between", padding: 16 },
  watchHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  watchMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  watchViewers: { color: "rgba(255,255,255,0.9)", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  hostInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  watchHostName: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  watchHostTitle: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_400Regular" },
  followBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  followBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  watchChat: { flex: 1, paddingHorizontal: 12 },
  chatRow: { flexDirection: "row", paddingVertical: 3 },
  chatUser: { fontSize: 13, fontFamily: "Inter_700Bold" },
  chatText: { fontSize: 13, fontFamily: "Inter_400Regular", flexShrink: 1 },
  giftsPanel: { borderTopWidth: 1, padding: 16 },
  giftsPanelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  giftsPanelTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  giftsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  giftItem: { alignItems: "center", gap: 6, width: 64 },
  giftIcon: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  giftName: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  giftCost: { flexDirection: "row", alignItems: "center", gap: 3 },
  giftCostText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  watchInput: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1 },
  chatInput: { flex: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14, fontFamily: "Inter_400Regular" },
  giftBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  goLiveSetup: { flex: 1 },
  goLiveContent: { padding: 20, gap: 16 },
  cameraPreview: { height: 220, borderRadius: 16, alignItems: "center", justifyContent: "center", gap: 12 },
  cameraPreviewText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  titleInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  liveDisclaimer: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18 },
  hostVideo: { flex: 1, justifyContent: "space-between", padding: 16 },
  hostHud: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  hostHudRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  hostStats: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(0,0,0,0.4)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  hostStatText: { color: "rgba(255,255,255,0.9)", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  hostCoinPill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "#FFB80050" },
  hostCoinText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  hostVideoText: { color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  hostControls: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, padding: 20, borderTopWidth: 1 },
  controlBtn2: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  endLiveBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24 },
  endLiveText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  // Big gift overlay
  bigGiftOverlay: { alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.55)" },
  bigGiftBg: { width: 160, height: 160, borderRadius: 80, alignItems: "center", justifyContent: "center" },
  bigGiftEmoji: { fontSize: 72 },
  bigGiftPill: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, borderWidth: 2, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", gap: 4 },
  bigGiftPillText: { color: "#fff", fontSize: 20, fontFamily: "Inter_700Bold" },
});
