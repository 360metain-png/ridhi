import React, { useState, useRef, useEffect } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { RidhiCoin } from "@/components/RidhiCoin";
import { CoinAmount } from "@/components/CoinAmount";
import { Avatar } from "@/components/Avatar";
import {
  PODCAST_ROOM_SPEAKERS,
  PODCAST_ROOM_CHAT,
  COIN_ACTIONS,
  type PodcastSpeaker,
  type PodcastChatMsg,
} from "@/data/podcastData";

const { width, height } = Dimensions.get("window");

const ROOM_TITLE = "Morning Chai with Maya ☕";
const ROOM_CATEGORY = "Relationships";
const IS_VIP = false;
const INITIAL_LISTENERS = 1247;
const LISTENER_NAMES = ["Rahul", "Sneha", "Vikram", "Anjali", "Devraj", "Pooja"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function PulseDot() {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.7, duration: 650, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 650, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.pulseDot, { transform: [{ scale }] }]} />
  );
}

function SpeakingRing({ speaking }: { speaking: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (speaking) {
      opacity.setValue(1);
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.14, duration: 650, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 650, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scale.setValue(1);
      opacity.setValue(0);
    }
  }, [speaking]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.speakingRing, { transform: [{ scale }], opacity }]}
    />
  );
}

function SpeakerCard({ speaker, large = false }: { speaker: PodcastSpeaker; large?: boolean }) {
  const size = large ? 84 : 62;
  return (
    <View style={styles.speakerCard}>
      <View style={{ width: size + 8, height: size + 8, alignItems: "center", justifyContent: "center" }}>
        <SpeakingRing speaking={speaker.isSpeaking} />
        <Avatar name={speaker.name} size={size} hasStory={speaker.isSpeaking} />
        {speaker.isMuted && (
          <View style={styles.mutedBadge}>
            <Feather name="mic-off" size={8} color="#fff" />
          </View>
        )}
      </View>
      <View style={{ alignItems: "center", gap: 2 }}>
        <View style={styles.speakerNameRow}>
          <Text style={styles.speakerName} numberOfLines={1}>
            {speaker.name.split(" ")[0]}
          </Text>
          {speaker.isVerified && (
            <Feather name="check-circle" size={10} color="#7B2FBE" />
          )}
        </View>
        {speaker.isHost && (
          <View style={styles.hostChip}>
            <Text style={styles.hostChipText}>🎙️ HOST</Text>
          </View>
        )}
        {!speaker.isHost && (
          <Text style={styles.speakerFollowers}>{speaker.followersCount}</Text>
        )}
      </View>
    </View>
  );
}

function ChatBubble({ msg }: { msg: PodcastChatMsg }) {
  const accentColor =
    msg.type === "priority" ? "#E91E8C"
    : msg.type === "question" ? "#7B2FBE"
    : msg.type === "pin"      ? "#FFB800"
    : "transparent";
  const hasBorder = msg.type !== "chat" && msg.type !== "join";
  return (
    <View
      style={[
        styles.chatBubble,
        hasBorder && { borderLeftWidth: 2.5, borderLeftColor: accentColor, backgroundColor: accentColor + "14" },
        msg.type === "join" && { opacity: 0.6 },
      ]}
    >
      <Avatar name={msg.user} size={30} />
      <View style={{ flex: 1 }}>
        <View style={styles.chatMeta}>
          <Text style={styles.chatUser}>{msg.user}</Text>
          {msg.coins != null && (
            <View style={[styles.coinTag, { backgroundColor: accentColor + "30" }]}>
              <CoinAmount amount={msg.coins} size={12} color={accentColor} fontSize={11} />
            </View>
          )}
          <Text style={styles.chatTime}>{msg.time}</Text>
        </View>
        <Text style={styles.chatText} numberOfLines={3}>{msg.text}</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PodcastRoomScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 60 : insets.top + 8;
  const bottomPad = Platform.OS === "web" ? 16 : insets.bottom + 4;

  const [chatOpen, setChatOpen] = useState(false);
  const [coinsOpen, setCoinsOpen] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [following, setFollowing] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [messages, setMessages] = useState<PodcastChatMsg[]>(PODCAST_ROOM_CHAT);
  const [listenerCount, setListenerCount] = useState(INITIAL_LISTENERS);
  const [coinBalance, setCoinBalance] = useState(320);

  const chatRef = useRef<FlatList>(null);
  const chatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const id = setInterval(
      () => setListenerCount((c) => Math.max(100, c + Math.floor(Math.random() * 7) - 3)),
      3500
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    Animated.spring(chatAnim, {
      toValue: chatOpen ? 1 : 0,
      useNativeDriver: true,
      tension: 70,
      friction: 12,
    }).start();
  }, [chatOpen]);

  const chatTranslateY = chatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [height * 0.56, 0],
  });

  const sendMessage = () => {
    if (!chatMsg.trim()) return;
    const newMsg: PodcastChatMsg = {
      id: `u${Date.now()}`,
      user: "You",
      text: chatMsg.trim(),
      type: "chat",
      time: "now",
    };
    setMessages((prev) => [...prev, newMsg]);
    setChatMsg("");
    setTimeout(() => chatRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const useCoinAction = (action: typeof COIN_ACTIONS[number]) => {
    if (coinBalance < action.coins) return;
    setCoinBalance((b) => b - action.coins);
    const newMsg: PodcastChatMsg = {
      id: `ca${Date.now()}`,
      user: "You",
      text:
        action.id === "ask"      ? "❓ [Question] " + (chatMsg || "Your question here")
        : action.id === "priority" ? "⚡ PRIORITY: " + (chatMsg || "Your priority question")
        : action.id === "pin"      ? "📌 PINNED: "   + (chatMsg || "Your pinned message")
        : action.label,
      coins: action.coins,
      type:
        action.id === "ask"      ? "question"
        : action.id === "priority" ? "priority"
        : action.id === "pin"      ? "pin"
        : "chat",
      time: "now",
    };
    setMessages((prev) => [...prev, newMsg]);
    setCoinsOpen(false);
    if (!chatOpen) setChatOpen(true);
    setTimeout(() => chatRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const host = PODCAST_ROOM_SPEAKERS.find((s) => s.isHost)!;
  const coHosts = PODCAST_ROOM_SPEAKERS.filter((s) => !s.isHost);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#0D0118", "#1A0533", "#0A0010"]}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: topPad }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.liveBadge}>
            <PulseDot />
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
          <Text style={styles.headerTitle} numberOfLines={1}>{ROOM_TITLE}</Text>
          <View style={styles.listenerRow}>
            <Feather name="users" size={12} color="rgba(255,255,255,0.5)" />
            <Text style={styles.listenerText}>
              {listenerCount.toLocaleString("en-IN")} listening
            </Text>
          </View>
        </View>
        <Pressable style={styles.headerBtn} onPress={() => {}}>
          <Feather name="share-2" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* ── Stage ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.stage,
          { paddingBottom: chatOpen ? height * 0.56 + bottomPad + 74 : bottomPad + 74 },
        ]}
      >
        {/* Category */}
        <View style={styles.categoryChip}>
          <Text style={styles.categoryChipText}>{ROOM_CATEGORY}</Text>
        </View>

        {/* VIP banner */}
        {IS_VIP && (
          <LinearGradient colors={["#FFB80030", "#FFB80008"]} style={styles.vipBanner}>
            <Feather name="star" size={14} color="#FFB800" />
            <Text style={styles.vipBannerText}>VIP Room · 99 </Text>
            <RidhiCoin size={14} />
            <Text style={styles.vipBannerText}> entry</Text>
          </LinearGradient>
        )}

        {/* Host */}
        <View style={styles.hostSection}>
          <View style={{ width: 100, height: 100, alignItems: "center", justifyContent: "center" }}>
            <SpeakingRing speaking={host.isSpeaking} />
            <LinearGradient
              colors={host.isSpeaking ? ["#E91E8C", "#7B2FBE"] : ["#2A1060", "#1A0533"]}
              style={styles.hostRingGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Avatar name={host.name} size={84} hasStory />
            </LinearGradient>
          </View>
          <View style={{ alignItems: "center", gap: 4, marginTop: 10 }}>
            <View style={styles.hostNameRow}>
              <Text style={styles.hostName}>{host.name}</Text>
              {host.isVerified && (
                <Feather name="check-circle" size={15} color="#7B2FBE" />
              )}
            </View>
            <View style={styles.hostBadge}>
              <Text style={styles.hostBadgeText}>🎙️ HOST · {host.followersCount} followers</Text>
            </View>
          </View>
        </View>

        {/* On Stage */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>On Stage</Text>
          <View style={styles.dividerLine} />
        </View>
        <View style={styles.speakersRow}>
          {coHosts.map((sp) => (
            <SpeakerCard key={sp.id} speaker={sp} />
          ))}
        </View>

        {/* In Room */}
        <View style={[styles.dividerRow, { marginTop: 24 }]}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>In Room</Text>
          <View style={styles.dividerLine} />
        </View>
        <View style={styles.listenersCluster}>
          {LISTENER_NAMES.map((name, i) => (
            <View key={i} style={{ marginLeft: i === 0 ? 0 : -12, zIndex: 6 - i }}>
              <Avatar name={name} size={38} />
            </View>
          ))}
          <View style={styles.moreCount}>
            <Text style={styles.moreCountText}>
              +{(listenerCount - LISTENER_NAMES.length).toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        {/* Fan Club promo */}
        <LinearGradient colors={["#7B2FBE22", "#E91E8C11"]} style={styles.fanPromo}>
          <View style={styles.fanPromoLeft}>
            <Text style={styles.fanPromoTitle}>Join Maya's Fan Club 💜</Text>
            <Text style={styles.fanPromoSub}>Exclusive rooms · Fan badge · Priority speaking</Text>
          </View>
          <View style={styles.fanPromoPlans}>
            <View style={[styles.fanPlanChip, { borderColor: "#9E9E9E" }]}>
              <Text style={styles.fanPlanText}>Basic</Text>
              <CoinAmount amount={99} size={13} fontSize={12} fontFamily="Inter_700Bold" />
            </View>
            <View style={[styles.fanPlanChip, { borderColor: "#FFB800" }]}>
              <Text style={styles.fanPlanText}>Premium</Text>
              <CoinAmount amount={299} size={13} fontSize={12} fontFamily="Inter_700Bold" />
            </View>
            <View style={[styles.fanPlanChip, { borderColor: "#E91E8C" }]}>
              <Text style={styles.fanPlanText}>VIP Fan</Text>
              <CoinAmount amount={999} size={13} fontSize={12} fontFamily="Inter_700Bold" />
            </View>
          </View>
        </LinearGradient>
      </ScrollView>

      {/* ── Chat Panel ── */}
      {chatOpen && (
        <Animated.View
          style={[
            styles.chatPanel,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              height: height * 0.52,
              bottom: bottomPad + 68,
              transform: [{ translateY: chatTranslateY }],
            },
          ]}
        >
          <View style={[styles.chatPanelHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.chatPanelTitle, { color: colors.text }]}>Live Chat</Text>
            <View style={styles.msgCountBadge}>
              <Text style={styles.msgCountText}>{messages.length}</Text>
            </View>
            <Pressable onPress={() => setChatOpen(false)} style={{ marginLeft: "auto" }}>
              <Feather name="chevron-down" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <FlatList
            ref={chatRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => <ChatBubble msg={item} />}
            contentContainerStyle={{ padding: 12, gap: 8 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => chatRef.current?.scrollToEnd({ animated: false })}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={[styles.chatInputRow, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
              <TextInput
                style={[styles.chatInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.text }]}
                placeholder="Say something..."
                placeholderTextColor={colors.mutedForeground}
                value={chatMsg}
                onChangeText={setChatMsg}
                returnKeyType="send"
                onSubmitEditing={sendMessage}
              />
              <Pressable
                onPress={sendMessage}
                style={[styles.sendBtn, { backgroundColor: chatMsg.trim() ? "#7B2FBE" : colors.muted }]}
              >
                <Feather name="send" size={15} color={chatMsg.trim() ? "#fff" : colors.mutedForeground} />
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      )}

      {/* ── Bottom Bar ── */}
      <View style={[styles.bottomBar, { paddingBottom: bottomPad }]}>
        <Pressable
          onPress={() => setHandRaised((h) => !h)}
          style={[styles.barItem, handRaised && styles.barItemActive]}
        >
          <Text style={styles.barEmoji}>✋</Text>
          <Text style={[styles.barLabel, handRaised && { color: "#E91E8C" }]}>
            {handRaised ? "Lower" : "Raise"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setChatOpen((c) => !c)}
          style={[styles.barItem, chatOpen && styles.barItemActive]}
        >
          <View style={{ position: "relative" }}>
            <Feather name="message-circle" size={24} color={chatOpen ? "#7B2FBE" : "rgba(255,255,255,0.7)"} />
            <View style={styles.msgBadge}>
              <Text style={styles.msgBadgeText}>{messages.length > 99 ? "99" : messages.length}</Text>
            </View>
          </View>
          <Text style={[styles.barLabel, chatOpen && { color: "#7B2FBE" }]}>Chat</Text>
        </Pressable>

        <Pressable onPress={() => setCoinsOpen(true)} style={styles.barItemCenter}>
          <LinearGradient
            colors={["#E91E8C", "#7B2FBE"]}
            style={styles.coinsBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <RidhiCoin size={22} />
          </LinearGradient>
          <Text style={styles.barLabel}>{coinBalance}</Text>
        </Pressable>

        <Pressable
          onPress={() => setFollowing((f) => !f)}
          style={[styles.barItem, following && styles.barItemActive]}
        >
          <Feather name="heart" size={24} color={following ? "#E91E8C" : "rgba(255,255,255,0.7)"} />
          <Text style={[styles.barLabel, following && { color: "#E91E8C" }]}>
            {following ? "Following" : "Follow"}
          </Text>
        </Pressable>

        <Pressable style={styles.barItem} onPress={() => {}}>
          <Feather name="share-2" size={24} color="rgba(255,255,255,0.7)" />
          <Text style={styles.barLabel}>Share</Text>
        </Pressable>
      </View>

      {/* ── Coin Actions Modal ── */}
      <Modal
        visible={coinsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCoinsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setCoinsOpen(false)}>
          <Pressable
            style={[styles.coinSheet, { backgroundColor: colors.surface }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

            {/* Balance row */}
            <LinearGradient colors={["#7B2FBE22", "#E91E8C11"]} style={styles.balanceCard}>
              <RidhiCoin size={30} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.balLabel, { color: colors.mutedForeground }]}>Your Balance</Text>
                <Text style={[styles.balValue, { color: colors.text }]}>{coinBalance} Coins</Text>
              </View>
              <Pressable
                onPress={() => { setCoinsOpen(false); router.push("/wallet"); }}
                style={[styles.rechargeBtn, { borderColor: "#7B2FBE" }]}
              >
                <Text style={styles.rechargeBtnText}>+ Recharge</Text>
              </Pressable>
            </LinearGradient>

            <Text style={[styles.sheetSectionTitle, { color: colors.text }]}>Use Coins in This Room</Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
              {COIN_ACTIONS.map((action) => {
                const canAfford = coinBalance >= action.coins;
                return (
                  <Pressable
                    key={action.id}
                    onPress={() => useCoinAction(action)}
                    style={[
                      styles.actionRow,
                      { backgroundColor: colors.card, borderColor: colors.border },
                      !canAfford && { opacity: 0.45 },
                    ]}
                  >
                    <LinearGradient
                      colors={[action.color, action.color + "BB"]}
                      style={styles.actionIcon}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Feather name={action.icon as any} size={18} color="#fff" />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
                      <Text style={[styles.actionDesc, { color: colors.mutedForeground }]}>{action.desc}</Text>
                    </View>
                    <View style={[styles.actionCostBadge, { backgroundColor: action.color + "20", borderColor: action.color + "40" }]}>
                      <CoinAmount amount={action.coins} size={14} color={action.color} fontSize={13} />
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center", gap: 3, paddingHorizontal: 8 },
  liveBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,59,48,0.85)",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  pulseDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#fff" },
  liveBadgeText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.5 },
  headerTitle: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 15, textAlign: "center" },
  listenerRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  listenerText: { color: "rgba(255,255,255,0.5)", fontFamily: "Inter_400Regular", fontSize: 12 },

  // Stage
  stage: { alignItems: "center", paddingHorizontal: 24, paddingTop: 8 },
  categoryChip: {
    backgroundColor: "#7B2FBE40",
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 20,
  },
  categoryChipText: { color: "#C9A0F5", fontFamily: "Inter_600SemiBold", fontSize: 13 },
  vipBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 12, borderRadius: 12, marginBottom: 16, width: "100%",
  },
  vipBannerText: { color: "#FFB800", fontFamily: "Inter_600SemiBold", fontSize: 14 },

  // Host
  hostSection: { alignItems: "center", marginBottom: 20 },
  hostRingGrad: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center" },
  hostNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  hostName: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 18 },
  hostBadge: {
    backgroundColor: "#7B2FBE30",
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
  },
  hostBadgeText: { color: "#C9A0F5", fontFamily: "Inter_500Medium", fontSize: 12 },

  // Speaking ring
  speakingRing: {
    borderRadius: 1000,
    borderWidth: 2.5,
    borderColor: "#E91E8C",
  },

  // Dividers
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, width: "100%", marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.1)" },
  dividerLabel: { color: "rgba(255,255,255,0.4)", fontFamily: "Inter_500Medium", fontSize: 12 },

  // Speakers
  speakersRow: { flexDirection: "row", justifyContent: "center", flexWrap: "wrap", gap: 20, width: "100%" },
  speakerCard: { alignItems: "center", gap: 6, width: 78 },
  speakerNameRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  speakerName: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 12, maxWidth: 60 },
  speakerFollowers: { color: "rgba(255,255,255,0.4)", fontFamily: "Inter_400Regular", fontSize: 10 },
  hostChip: { backgroundColor: "#E91E8C30", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  hostChipText: { color: "#E91E8C", fontFamily: "Inter_600SemiBold", fontSize: 10 },
  mutedBadge: {
    position: "absolute", bottom: 0, right: 0,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: "#FF3B30", alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "#0D0118",
  },

  // Listeners
  listenersCluster: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  moreCount: {
    marginLeft: 8, backgroundColor: "rgba(123,47,190,0.3)",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14,
  },
  moreCountText: { color: "rgba(255,255,255,0.7)", fontFamily: "Inter_600SemiBold", fontSize: 12 },

  // Fan Club promo
  fanPromo: { width: "100%", borderRadius: 16, padding: 16, gap: 10 },
  fanPromoLeft: { gap: 3 },
  fanPromoTitle: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 },
  fanPromoSub: { color: "rgba(255,255,255,0.5)", fontFamily: "Inter_400Regular", fontSize: 12 },
  fanPromoPlans: { flexDirection: "row", gap: 8 },
  fanPlanChip: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, alignItems: "center" },
  fanPlanText: { color: "rgba(255,255,255,0.7)", fontFamily: "Inter_500Medium", fontSize: 10 },
  fanPlanCoins: { color: "#FFB800", fontFamily: "Inter_700Bold", fontSize: 11 },

  // Chat panel
  chatPanel: {
    position: "absolute", left: 0, right: 0,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  chatPanelHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chatPanelTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  msgCountBadge: {
    backgroundColor: "#7B2FBE", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10,
  },
  msgCountText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 11 },
  chatBubble: { flexDirection: "row", gap: 10, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 10 },
  chatMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  chatUser: { color: "rgba(255,255,255,0.8)", fontFamily: "Inter_600SemiBold", fontSize: 12 },
  coinTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  coinTagText: { fontFamily: "Inter_700Bold", fontSize: 10 },
  chatTime: { color: "rgba(255,255,255,0.3)", fontFamily: "Inter_400Regular", fontSize: 10, marginLeft: "auto" as any },
  chatText: { color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  chatInputRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  chatInput: {
    flex: 1, borderWidth: 1, borderRadius: 22,
    paddingHorizontal: 14, paddingVertical: 9,
    fontFamily: "Inter_400Regular", fontSize: 14,
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
  },

  // Bottom bar
  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", justifyContent: "space-around",
    paddingTop: 10,
    backgroundColor: "rgba(13,1,24,0.97)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  barItem: { alignItems: "center", gap: 4, paddingVertical: 4, paddingHorizontal: 6, borderRadius: 12 },
  barItemActive: { backgroundColor: "rgba(123,47,190,0.15)" },
  barItemCenter: { alignItems: "center", gap: 3 },
  barEmoji: { fontSize: 24 },
  barLabel: { color: "rgba(255,255,255,0.45)", fontFamily: "Inter_500Medium", fontSize: 10 },
  coinsBtn: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: "center", justifyContent: "center",
    ...(Platform.OS === "web"
      ? { boxShadow: "0 4px 14px rgba(233,30,140,0.5)" }
      : { shadowColor: "#E91E8C", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 }),
  },
  msgBadge: {
    position: "absolute", top: -4, right: -6,
    backgroundColor: "#E91E8C", borderRadius: 8,
    paddingHorizontal: 4, paddingVertical: 1, minWidth: 16, alignItems: "center",
  },
  msgBadgeText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 9 },

  // Coin sheet modal
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  coinSheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40,
    maxHeight: height * 0.72,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 18 },
  balanceCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 16, borderRadius: 16, marginBottom: 18,
  },
  balLabel: { fontFamily: "Inter_400Regular", fontSize: 12, marginBottom: 2 },
  balValue: { fontFamily: "Inter_700Bold", fontSize: 20 },
  rechargeBtn: {
    borderWidth: 1.5, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  rechargeBtnText: { color: "#7B2FBE", fontFamily: "Inter_600SemiBold", fontSize: 13 },
  sheetSectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16, marginBottom: 14 },
  actionRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 14, borderRadius: 14, borderWidth: 1,
  },
  actionIcon: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontFamily: "Inter_700Bold", fontSize: 14, marginBottom: 2 },
  actionDesc: { fontFamily: "Inter_400Regular", fontSize: 12 },
  actionCostBadge: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  actionCostText: { fontFamily: "Inter_700Bold", fontSize: 13 },
});
