import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  Image,
  Easing,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ScreenCapture from "expo-screen-capture";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/Avatar";
import { CoinBadge } from "@/components/CoinBadge";
import { PrivateHead } from "@/components/PrivateHead";

const COIN_IMAGE = require("@/assets/images/ridhi_coin.png");

// ── Categories ────────────────────────────────────────────────────────
const CALL_CATEGORIES = [
  { id: "any",         label: "Any",         emoji: "🌟" },
  { id: "art",         label: "Art",         emoji: "🎨" },
  { id: "dance",       label: "Dance",       emoji: "💃" },
  { id: "songs",       label: "Songs",       emoji: "🎵" },
  { id: "romantic",    label: "Romantic",    emoji: "💖" },
  { id: "technology",  label: "Technology",  emoji: "💻" },
  { id: "comedy",      label: "Comedy",      emoji: "😂" },
  { id: "poetry",      label: "Poetry",      emoji: "✍️" },
  { id: "gaming",      label: "Gaming",      emoji: "🎮" },
  { id: "food",        label: "Food",        emoji: "🍜" },
  { id: "travel",      label: "Travel",      emoji: "✈️" },
];

const CALL_LANGUAGES = [
  "Any Language", "Hindi", "Bengali", "Telugu", "Marathi", "Tamil",
  "Gujarati", "Kannada", "Malayalam", "Punjabi", "Odia", "English",
  "Urdu", "Assamese",
];

// ── WebSocket URL helper ───────────────────────────────────────────────
function getWsUrl(): string {
  const domain = process.env["EXPO_PUBLIC_DOMAIN"];
  if (domain) return `wss://${domain}/ws/calls`;
  if (Platform.OS === "web") {
    const host = typeof window !== "undefined" ? window.location.host : "localhost";
    const proto = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss" : "ws";
    return `${proto}://${host}/ws/calls`;
  }
  return "ws://localhost:5000/ws/calls";
}

// ── Types ─────────────────────────────────────────────────────────────────────────
type PreferGender = "Any" | "Female" | "Male";
type CallMode = "idle" | "searching" | "preview" | "confirming" | "calling" | "connected";
type CallType = "audio" | "video";
type CallCategory = typeof CALL_CATEGORIES[number]["id"];

const CALL_ACTIVE_MODES: CallMode[] = ["preview", "confirming", "calling", "connected"];

// ── Anonymous peer data for random calls ───────────────────────────────────
interface PeerInfo {
  id: string;
  name: string;
  gender: string;
  language: string;
  category: string;
  avatar?: string;
  city?: string;
  age?: number;
  bio?: string;
}

// Demo peers — never expose real names, cities, or avatars
const DEMO_PEERS: PeerInfo[] = [
  { id: "p1", name: "Ridhi 1", gender: "female", language: "Hindi",     category: "songs" },
  { id: "p2", name: "Ridhi 2", gender: "female", language: "Marathi",   category: "dance" },
  { id: "p3", name: "Ridhi 3", gender: "female", language: "Telugu",    category: "romantic" },
  { id: "p4", name: "Ridhi 4", gender: "male",   language: "Hindi",     category: "technology" },
  { id: "p5", name: "Ridhi 5", gender: "male",   language: "Malayalam", category: "art" },
  { id: "p6", name: "Ridhi 6", gender: "female", language: "Punjabi",   category: "comedy" },
  { id: "p7", name: "Ridhi 7", gender: "male",   language: "Hindi",     category: "gaming" },
  { id: "p8", name: "Ridhi 8", gender: "female", language: "Malayalam", category: "poetry" },
];

// ── Coin pricing ─────────────────────────────────────────────────────────────────────────
const AUDIO_RATE = 10;
const VIDEO_RATE = 25;

export default function RandomCallScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addCoins, deductCoins } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // ── State ───────────────────────────────────────────────────────────────
  const [callType, setCallType]         = useState<CallType>("audio");
  const [mode, setMode]                 = useState<CallMode>("idle");
  const [matched, setMatched]           = useState<PeerInfo | null>(null);
  const [duration, setDuration]         = useState(0);
  const [previewLeft, setPreviewLeft]   = useState(15);
  const [muted, setMuted]               = useState(false);
  const [cameraOff, setCameraOff]       = useState(false);
  const [showIce, setShowIce]           = useState(false);
  const [iceIdx, setIceIdx]             = useState(0);
  const [reportVisible, setReportVisible] = useState(false);
  const [reportDone, setReportDone]       = useState(false);
  const [preferGender, setPreferGender] = useState<PreferGender>("Any");
  const [preferLanguage, setPreferLanguage] = useState<string>(user?.language ?? "Any Language");
  const [callCategory, setCallCategory] = useState<CallCategory>("any");
  const [callId, setCallId]             = useState<string | null>(null);
  const [coinsSpent, setCoinsSpent]     = useState(0);
  const [coinsEarned, setCoinsEarned]   = useState(0);
  const [searchDots, setSearchDots]     = useState("");
  const [searchPhase, setSearchPhase]   = useState(0);

  // WebSocket ref
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ring1Anim = useRef(new Animated.Value(0)).current;
  const ring2Anim = useRef(new Animated.Value(0)).current;
  const ring3Anim = useRef(new Animated.Value(0)).current;
  const orbitAnim = useRef(new Animated.Value(0)).current;
  const coinAnim  = useRef(new Animated.Value(0)).current;

  const rate = callType === "audio" ? AUDIO_RATE : VIDEO_RATE;
  const est5min = rate * 5;
  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── Cross-gender enforcement ──────────────────────────────────────
  // Men always connect to women, women always connect to men
  const enforcedGender: PreferGender = useCallback(() => {
    if (user?.gender === "male") return "Female";
    if (user?.gender === "female") return "Male";
    return preferGender;
  }, [user?.gender, preferGender])();

  // ── WebSocket ───────────────────────────────────────────────────────────────────────
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    try {
      const ws = new WebSocket(getWsUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        // Send join message — use persona or stay anonymous
        const p = user?.callPersona;
        const showName = p?.name?.trim() || false;
        ws.send(JSON.stringify({
          type: "join",
          payload: {
            userId: user?.id ?? "anonymous",
            name: showName ? p!.name!.trim() : "",
            gender: user?.gender ?? "other",
            language: preferLanguage === "Any Language" ? "Any" : preferLanguage,
            category: callCategory,
            avatar: p?.showAvatar ? p.avatar : undefined,
            city: p?.showCity ? p.city : undefined,
            age: p?.showAge ? p.age : undefined,
            bio: p?.showBio ? p.bio : undefined,
            callType,
            coinRate: rate,
          },
        }));
      };

      ws.onmessage = (e) => {
        let msg: any;
        try { msg = JSON.parse(e.data); } catch { return; }
        switch (msg.type) {
          case "waiting":
            setMode("searching");
            break;
          case "matched": {
            const peer = msg.payload?.peer as PeerInfo;
            if (peer) {
              setMatched(peer);
              setCallId(msg.payload.callId);
              setMode("preview");
              setPreviewLeft(15);
            }
            break;
          }
          case "call_starting":
            setMode("calling");
            break;
          case "call_connected":
            setMode("connected");
            setDuration(0);
            break;
          case "call_ended": {
            const { reason, endedBy, durationSec, coinsSpent: cs } = msg.payload ?? {};
            setCoinsSpent(cs ?? 0);
            // If user disconnected, auto-rematch after 1.5s
            if (reason === "user_disconnected" && endedBy === user?.id) {
              setMode("idle");
              setMatched(null);
              setCallId(null);
            } else if (reason === "peer_disconnected") {
              // Peer left — auto search for next
              setMode("searching");
              setMatched(null);
              setDuration(0);
              setCoinsSpent(0);
              setCoinsEarned(0);
              // Auto rejoin queue after brief delay
              setTimeout(() => {
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                  wsRef.current.send(JSON.stringify({
                    type: "join",
                    payload: {
                      userId: user?.id ?? "anonymous",
                      name: user?.name ?? "Ridhi User",
                      gender: user?.gender ?? "other",
                      language: preferLanguage === "Any Language" ? "Any" : preferLanguage,
                      category: callCategory,
                      avatar: user?.avatar,
                      city: user?.city,
                      callType,
                      coinRate: rate,
                    },
                  }));
                }
              }, 1500);
            } else {
              setMode("idle");
              setMatched(null);
              setCallId(null);
            }
            break;
          }
          case "coin_tick": {
            const { coinsSpent: cs, coinsEarned: ce } = msg.payload ?? {};
            if (cs !== undefined) setCoinsSpent(cs);
            if (ce !== undefined) setCoinsEarned(ce);
            // Animate coin ticker
            coinAnim.setValue(0);
            Animated.timing(coinAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
            break;
          }
          case "pong":
            break;
        }
      };

      ws.onerror = () => {
        // Fallback to mock matching for dev/demo
        if (mode === "searching") {
          setTimeout(() => {
            const pool = DEMO_PEERS.filter((p) => {
              if (user?.gender === "male" && p.gender !== "female") return false;
              if (user?.gender === "female" && p.gender !== "male") return false;
              if (preferLanguage !== "Any Language" && p.language !== preferLanguage) return false;
              if (callCategory !== "any" && p.category !== callCategory) return false;
              return true;
            });
            const poolToUse = pool.length > 0 ? pool : DEMO_PEERS;
            const peer = poolToUse[Math.floor(Math.random() * poolToUse.length)];
            setMatched(peer);
            setCallId(`mock_${Date.now()}`);
            setMode("preview");
            setPreviewLeft(15);
          }, 2500);
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
      };
    } catch {
      // Fallback to mock
      if (mode === "searching") {
        setTimeout(() => {
          const pool = DEMO_PEERS.filter((p) => {
            if (user?.gender === "male" && p.gender !== "female") return false;
            if (user?.gender === "female" && p.gender !== "male") return false;
            return true;
          });
          const poolToUse = pool.length > 0 ? pool : DEMO_PEERS;
          const peer = poolToUse[Math.floor(Math.random() * poolToUse.length)];
          setMatched(peer);
          setCallId(`mock_${Date.now()}`);
          setMode("preview");
          setPreviewLeft(15);
        }, 2500);
      }
    }
  }, [user, preferLanguage, callCategory, callType, rate, mode]);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  }, []);

  // ── Duration timer ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let t: ReturnType<typeof setInterval>;
    if (mode === "connected") {
      t = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => clearInterval(t);
  }, [mode]);

  // ── 15-sec free preview countdown ─────────────────────────────────────────
  useEffect(() => {
    let t: ReturnType<typeof setInterval>;
    if (mode === "preview") {
      setPreviewLeft(15);
      t = setInterval(() => {
        setPreviewLeft((p) => {
          if (p <= 1) { setMode("confirming"); return 0; }
          return p - 1;
        });
      }, 1000);
    }
    return () => clearInterval(t);
  }, [mode]);

  // ── Block screenshots during active call ─────────────────────────────────
  useEffect(() => {
    if (Platform.OS === "web") return;
    if (CALL_ACTIVE_MODES.includes(mode)) {
      ScreenCapture.preventScreenCaptureAsync("ridhi-call");
    } else {
      ScreenCapture.allowScreenCaptureAsync("ridhi-call");
    }
    return () => { ScreenCapture.allowScreenCaptureAsync("ridhi-call"); };
  }, [mode]);

  // ── Cinematic searching animations ─────────────────────────────────
  useEffect(() => {
    if (mode === "searching") {
      // Pulse rings
      Animated.loop(
        Animated.timing(ring1Anim, { toValue: 1, duration: 2000, useNativeDriver: true, easing: Easing.out(Easing.ease) })
      ).start();
      Animated.loop(
        Animated.timing(ring2Anim, { toValue: 1, duration: 2500, useNativeDriver: true, easing: Easing.out(Easing.ease) })
      ).start();
      Animated.loop(
        Animated.timing(ring3Anim, { toValue: 1, duration: 3000, useNativeDriver: true, easing: Easing.out(Easing.ease) })
      ).start();
      // Orbit
      Animated.loop(
        Animated.timing(orbitAnim, { toValue: 1, duration: 4000, useNativeDriver: true, easing: Easing.linear })
      ).start();

      // Search dot animation
      const dotTimer = setInterval(() => {
        setSearchDots((d) => (d.length >= 3 ? "" : d + "."));
      }, 500);

      // Search phase cycling
      const phaseTimer = setInterval(() => {
        setSearchPhase((p) => (p + 1) % 4);
      }, 2000);

      return () => {
        clearInterval(dotTimer);
        clearInterval(phaseTimer);
        ring1Anim.setValue(0);
        ring2Anim.setValue(0);
        ring3Anim.setValue(0);
        orbitAnim.setValue(0);
      };
    }
  }, [mode]);

  // ── Heartbeat while connected ─────────────────────────────────────────────
  useEffect(() => {
    if (mode !== "connected" || !wsRef.current) return;
    const heartbeat = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "heartbeat" }));
      }
    }, 15000);
    return () => clearInterval(heartbeat);
  }, [mode]);

  // ── Search dots text ─────────────────────────────────────────────────────────
  const searchPhases = [
    "Scanning profiles",
    "Matching interests",
    "Connecting hearts",
    "Almost there",
  ];

  // ── Actions ──────────────────────────────────────────────────────────────────────
  const startSearch = () => {
    if ((user?.coins ?? 0) < rate) return;
    setDuration(0);
    setMatched(null);
    setCoinsSpent(0);
    setCoinsEarned(0);
    setCallId(null);
    setMode("searching");
    connectWebSocket();
  };

  const confirmCall = () => {
    setMode("calling");
    setTimeout(() => setMode("connected"), 1500);
    // Notify server
    if (wsRef.current?.readyState === WebSocket.OPEN && callId) {
      wsRef.current.send(JSON.stringify({
        type: "accept",
        payload: { callId, userId: user?.id },
      }));
    }
  };

  const skipUser = () => {
    // End current mock/server call and restart search
    if (callId && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "disconnect",
        payload: { callId, userId: user?.id },
      }));
    }
    setMode("searching");
    setMatched(null);
    setDuration(0);
    setCoinsSpent(0);
    setCoinsEarned(0);
    setCallId(null);
    connectWebSocket();
  };

  const endCall = () => {
    if (callId && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "disconnect",
        payload: { callId, userId: user?.id },
      }));
    }
    // Deduct spent coins
    if (coinsSpent > 0) {
      deductCoins(Math.min(coinsSpent, user?.coins ?? 0));
    }
    setMode("idle");
    setMatched(null);
    setDuration(0);
    setCoinsSpent(0);
    setCoinsEarned(0);
    setCallId(null);
    disconnectWebSocket();
  };

  const handleCancelSearch = () => {
    setMode("idle");
    disconnectWebSocket();
  };

  const ICEBREAKERS = [
    "What's your favourite Indian dish? 🍛",
    "Describe your day in one emoji! 😄",
    "Which city in India would you love to visit?",
    "What's your go-to Bollywood song? 🎵",
    "Beach 🏖️ or Mountains 🏔️?",
    "Tell me something funny that happened this week!",
  ];

  // ── Render ──────────────────────────────────────────────────────────────────────────
  return (
    <>
      <PrivateHead />
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <LinearGradient
          colors={[colors.secondary + "30", colors.primary + "15", "transparent"]}
          style={[styles.header, { paddingTop: topPad + 10 }]}
        >
          <Pressable onPress={() => { endCall(); router.back(); }} style={styles.headerBtn}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Random Calls</Text>
          <CoinBadge amount={user?.coins ?? 0} size="sm" />
        </LinearGradient>

        {/* ── IDLE ───────────────────────────────────────────────────────────────────────── */}
        {mode === "idle" && (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.idleContent} showsVerticalScrollIndicator={false}>
            {/* Online indicator */}
            <LinearGradient colors={[colors.primary + "20", colors.secondary + "15"]} style={styles.onlineBanner}>
              <Feather name="radio" size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.onlineBannerText, { color: colors.foreground }]}>
                  <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold" }}>1,284</Text> online now
                </Text>
                <Text style={[styles.onlineBannerSub, { color: colors.mutedForeground }]}>
                  {enforcedGender === "Any" ? "All genders" : enforcedGender + " hosts"}
                  {" · "}
                  {preferLanguage === "Any Language" ? "Any language" : preferLanguage}
                  {" · "}
                  {CALL_CATEGORIES.find((c) => c.id === callCategory)?.label ?? "Any"}
                </Text>
              </View>
              <View style={[styles.safetyBadge, { backgroundColor: colors.success + "20" }]}>
                <Feather name="shield" size={12} color={colors.success} />
                <Text style={[styles.safetyText, { color: colors.success }]}>Safe</Text>
              </View>
            </LinearGradient>

            {/* ── Cross-gender notice ── */}
            {user?.gender && user.gender !== "other" && (
              <View style={[styles.crossGenderBanner, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
                <Feather name="users" size={14} color={colors.primary} />
                <Text style={[styles.crossGenderText, { color: colors.primary }]}>
                  {user.gender === "male" ? "You'll be matched with women only" : "You'll be matched with men only"}
                </Text>
              </View>
            )}

            {/* ── Call Type ── */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Call Type</Text>
            <View style={styles.typeRow}>
              {(["audio", "video"] as CallType[]).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setCallType(t)}
                  style={[
                    styles.typeBtn,
                    {
                      backgroundColor: callType === t ? (t === "audio" ? colors.secondary : colors.primary) : colors.card,
                      borderColor: callType === t ? "transparent" : colors.border,
                    },
                  ]}
                >
                  <Feather name={t === "audio" ? "mic" : "video"} size={26} color={callType === t ? "#fff" : colors.mutedForeground} />
                  <Text style={[styles.typeName, { color: callType === t ? "#fff" : colors.foreground }]}>
                    {t === "audio" ? "🎙️ Audio" : "📹 Video"}
                  </Text>
                  <Text style={[styles.typeSub, { color: callType === t ? "rgba(255,255,255,0.75)" : colors.mutedForeground }]}>
                    from {t === "audio" ? AUDIO_RATE : VIDEO_RATE} coins/min
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* ── Category ── */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Topic / Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langScroll}>
              {CALL_CATEGORIES.map((cat) => {
                const active = callCategory === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCallCategory(cat.id)}
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: active ? colors.primary : colors.card,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 16, marginRight: 4 }}>{cat.emoji}</Text>
                    <Text style={[styles.catChipText, { color: active ? "#fff" : colors.foreground }]}>
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* ── Language ── */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Speaking Language</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langScroll}>
              {CALL_LANGUAGES.map((lang) => {
                const active = preferLanguage === lang;
                return (
                  <Pressable
                    key={lang}
                    onPress={() => setPreferLanguage(lang)}
                    style={[
                      styles.langChip,
                      {
                        backgroundColor: active ? colors.primary : colors.card,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.langChipText, { color: active ? "#fff" : colors.foreground }]}>
                      {lang}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Cost estimate */}
            <View style={[styles.costBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.costRow}>
                <Text style={[styles.costLabel, { color: colors.mutedForeground }]}>Rate</Text>
                <Text style={[styles.costVal, { color: colors.foreground }]}>
                  <Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />
                  {rate}/min
                </Text>
              </View>
              <View style={[styles.costRow, styles.costTotal]}>
                <Text style={[styles.costLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  Estimated 5-min cost
                </Text>
                <Text style={[styles.costVal, { color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 16 }]}>
                  <Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />
                  {est5min}
                </Text>
              </View>
            </View>

            {/* Start button */}
            <Pressable onPress={startSearch} disabled={(user?.coins ?? 0) < rate} style={[styles.startBtn, { opacity: (user?.coins ?? 0) < rate ? 0.5 : 1 }]}>
              <LinearGradient colors={[colors.secondary, colors.primary]} style={styles.startBtnInner}>
                <Feather name={callType === "audio" ? "mic" : "video"} size={20} color="#fff" />
                <Text style={styles.startBtnText}>
                  Start {callType === "audio" ? "Audio" : "Video"} Call
                </Text>
              </LinearGradient>
            </Pressable>

            {(user?.coins ?? 0) < rate && (
              <Pressable onPress={() => router.push("/wallet")}
                style={[styles.rechargeHint, { backgroundColor: colors.gold + "15", borderColor: colors.gold + "40" }]}>
                <Feather name="alert-circle" size={14} color={colors.gold} />
                <Text style={[styles.rechargeText, { color: colors.gold }]}>
                  Not enough coins · Tap to recharge
                </Text>
              </Pressable>
            )}

            <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
              🛡️ AI moderation active · Report abuse instantly · Women safety controls enabled
            </Text>
          </ScrollView>
        )}

        {/* ── SEARCHING — Cinematic Animation ─────────────────────────────────────────────────── */}
        {mode === "searching" && (
          <View style={styles.centeredState}>
            {/* Animated rings */}
            <Animated.View style={[styles.cineRing, {
              borderColor: colors.primary + "25",
              transform: [{ scale: ring1Anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.2] }) }],
              opacity: ring1Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
            }]} />
            <Animated.View style={[styles.cineRing, {
              borderColor: colors.secondary + "20",
              transform: [{ scale: ring2Anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.0] }) }],
              opacity: ring2Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
            }]} />
            <Animated.View style={[styles.cineRing, {
              borderColor: colors.primary + "15",
              transform: [{ scale: ring3Anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.8] }) }],
              opacity: ring3Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
            }]} />

            {/* Central avatar with orbit particles */}
            <View style={styles.cineCenter}>
              <Animated.View style={{
                position: "absolute",
                width: 12, height: 12, borderRadius: 6,
                backgroundColor: colors.primary,
                transform: [
                  { translateX: orbitAnim.interpolate({ inputRange: [0, 1], outputRange: [60, 60] }) },
                  { translateY: orbitAnim.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, 60, 0, -60, 0] }) },
                ],
              }} />
              <Animated.View style={{
                position: "absolute",
                width: 8, height: 8, borderRadius: 4,
                backgroundColor: colors.secondary,
                transform: [
                  { translateX: orbitAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, -50] }) },
                  { translateY: orbitAnim.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, -50, 0, 50, 0] }) },
                ],
              }} />
              <Animated.View style={{
                position: "absolute",
                width: 10, height: 10, borderRadius: 5,
                backgroundColor: colors.gold,
                transform: [
                  { translateX: orbitAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 40, 0] }) },
                  { translateY: orbitAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-40, 0, -40] }) },
                ],
              }} />

              <View style={[styles.searchAvatar, { backgroundColor: colors.card, borderColor: colors.primary + "50" }]}>
                <Feather name={callType === "audio" ? "mic" : "video"} size={36} color={colors.primary} />
              </View>
            </View>

            <Text style={[styles.searchTitle, { color: colors.foreground }]}>
              {searchPhases[searchPhase]}{searchDots}
            </Text>
            <Text style={[styles.searchSub, { color: colors.mutedForeground }]}>
              👥 {enforcedGender === "Any" ? "All genders" : enforcedGender + " only"}
              {" · "}
              {preferLanguage === "Any Language" ? "Any language" : preferLanguage}
              {" · "}
              {CALL_CATEGORIES.find((c) => c.id === callCategory)?.emoji}{" "}
              {CALL_CATEGORIES.find((c) => c.id === callCategory)?.label}
            </Text>

            {/* Spinning category icons */}
            <View style={styles.shufflingRow}>
              {["art", "dance", "songs", "romantic", "technology", "comedy", "poetry", "gaming", "food", "travel"]
                .slice(searchPhase, searchPhase + 4)
                .map((c) => {
                  const cat = CALL_CATEGORIES.find((x) => x.id === c);
                  return (
                    <View key={c} style={[styles.shuffleItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Text style={{ fontSize: 20 }}>{cat?.emoji}</Text>
                      <Text style={[styles.shuffleLabel, { color: colors.mutedForeground }]}>{cat?.label}</Text>
                    </View>
                  );
                })}
            </View>

            <Pressable onPress={handleCancelSearch} style={[styles.cancelBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name="x" size={16} color={colors.destructive} />
              <Text style={[styles.cancelText, { color: colors.destructive }]}>Cancel</Text>
            </Pressable>
          </View>
        )}

        {/* ── FREE PREVIEW (15 sec) ──────────────────────────────────────────────── */}
        {mode === "preview" && matched && (
          <View style={styles.centeredState}>
            <LinearGradient colors={[colors.secondary + "40", colors.primary + "30"]} style={styles.previewBg}>
              {callType === "video" && (
                <View style={styles.videoPreviewBox}>
                  <Feather name="video" size={40} color="rgba(255,255,255,0.5)" />
                  <Text style={styles.videoPreviewLabel}>Preview</Text>
                </View>
              )}
            </LinearGradient>
            <View style={[styles.previewPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.previewCountdown, { backgroundColor: colors.primary }]}>
                <Text style={styles.previewCountdownText}>FREE PREVIEW — {previewLeft}s</Text>
              </View>
              <Avatar name={matched.name} size={72} />
              <View style={styles.previewNameRow}>
                <Text style={[styles.previewName, { color: colors.foreground }]}>{matched.name}</Text>
                <Feather name="check-circle" size={14} color="#2196F3" />
              </View>
              <Text style={[styles.previewSub, { color: colors.mutedForeground }]}>
                {matched.language} · {CALL_CATEGORIES.find((c) => c.id === matched.category)?.emoji} {CALL_CATEGORIES.find((c) => c.id === matched.category)?.label}
                {matched.age ? ` · ${matched.age}` : ""}
                {matched.bio ? ` · ${matched.bio}` : ""}
              </Text>
              <View style={[styles.costInfoBox, { backgroundColor: colors.muted }]}>
                <Text style={[styles.costInfoText, { color: colors.mutedForeground }]}>
                  <Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />
                  {rate}/min · Est. 5 min = {est5min} coins
                </Text>
              </View>
              <View style={styles.previewBtns}>
                <Pressable onPress={skipUser} style={[styles.previewSkip, { borderColor: colors.border }]}>
                  <Feather name="skip-forward" size={18} color={colors.mutedForeground} />
                  <Text style={[styles.previewSkipText, { color: colors.mutedForeground }]}>Skip</Text>
                </Pressable>
                <Pressable onPress={confirmCall} style={[styles.previewConnect]}>
                  <LinearGradient colors={[colors.secondary, colors.primary]} style={styles.previewConnectInner}>
                    <Feather name="phone" size={18} color="#fff" />
                    <Text style={styles.previewConnectText}>Connect</Text>
                  </LinearGradient>
                </Pressable>
              </View>
              <Pressable onPress={handleCancelSearch} style={{ marginTop: 8 }}>
                <Text style={[styles.previewDecline, { color: colors.mutedForeground }]}>✕ Decline & go back</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── CONFIRMING ─────────────────────────────────────────────────────────────────────────── */}
        {mode === "confirming" && matched && (
          <View style={styles.centeredState}>
            <View style={[styles.confirmBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.confirmTitle, { color: colors.foreground }]}>Continue the call?</Text>
              <Text style={[styles.confirmSub, { color: colors.mutedForeground }]}>
                Free preview ended. Coins will be deducted at
              </Text>
              <Text style={[styles.confirmRate, { color: colors.primary }]}>
                <Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />
                {rate} coins / minute
              </Text>
              <View style={[styles.confirmBalance, { backgroundColor: colors.muted }]}>
                <Feather name="star" size={14} color={colors.gold} />
                <Text style={[styles.confirmBalText, { color: colors.foreground }]}>
                  Your balance: {(user?.coins ?? 0).toLocaleString()} coins
                </Text>
              </View>
              <View style={styles.confirmBtns}>
                <Pressable onPress={skipUser} style={[styles.confirmSkip, { borderColor: colors.border }]}>
                  <Text style={[styles.confirmSkipText, { color: colors.mutedForeground }]}>Skip</Text>
                </Pressable>
                <Pressable onPress={confirmCall} style={styles.confirmOk}>
                  <LinearGradient colors={[colors.secondary, colors.primary]} style={styles.confirmOkInner}>
                    <Text style={styles.confirmOkText}>Continue Call</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* ── CALLING / CONNECTED ──────────────────────────────────────────────────────────────────────────────── */}
        {(mode === "calling" || mode === "connected") && matched && (
          <View style={styles.callRoot}>
            {callType === "video" && (
              <LinearGradient colors={[colors.secondary + "60", colors.primary + "40"]} style={styles.videoFill}>
                <Feather name="video-off" size={44} color="rgba(255,255,255,0.35)" />
              </LinearGradient>
            )}
            <View style={[styles.callInfo, callType === "audio" && { flex: 1, justifyContent: "center" }]}>
              <Avatar name={matched.name} size={88} />
              <View style={styles.callNameRow}>
                <Text style={[styles.callName, { color: colors.foreground }]}>{matched.name}</Text>
                <Feather name="check-circle" size={15} color="#2196F3" />
              </View>
              <Text style={[styles.callSub, { color: colors.mutedForeground }]}>
                {matched.language} · {CALL_CATEGORIES.find((c) => c.id === matched.category)?.emoji} {CALL_CATEGORIES.find((c) => c.id === matched.category)?.label}
                {matched.age ? ` · ${matched.age}` : ""}
                {matched.bio ? ` · ${matched.bio}` : ""}
              </Text>
              {mode === "calling" && (
                <Text style={[styles.connectingText, { color: colors.mutedForeground }]}>Connecting…</Text>
              )}
              {mode === "connected" && (
                <View style={styles.callLiveRow}>
                  <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.liveTimer, { color: colors.success }]}>{fmt(duration)}</Text>
                </View>
              )}
            </View>

            {/* ── LIVE COIN TICKER ── */}
            {mode === "connected" && (
              <View style={[styles.coinTicker, { backgroundColor: "#1C1C2E" }]}>
                <Animated.View style={{
                  transform: [{
                    translateY: coinAnim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }),
                  }],
                  opacity: coinAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
                }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    {/* User spending */}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Image source={COIN_IMAGE} style={{ width: 14, height: 14 }} resizeMode="contain" />
                      <Text style={{ color: "#FF8C42", fontSize: 13, fontFamily: "Inter_600SemiBold" }}>
                        -{coinsSpent}
                      </Text>
                      <Text style={{ color: "#888", fontSize: 10, fontFamily: "Inter_400Regular" }}>spent</Text>
                    </View>
                    <Text style={{ color: "#444", fontSize: 10 }}>|</Text>
                    {/* Host earning */}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Image source={COIN_IMAGE} style={{ width: 14, height: 14 }} resizeMode="contain" />
                      <Text style={{ color: "#34C759", fontSize: 13, fontFamily: "Inter_600SemiBold" }}>
                        +{coinsEarned}
                      </Text>
                      <Text style={{ color: "#888", fontSize: 10, fontFamily: "Inter_400Regular" }}>earned</Text>
                    </View>
                  </View>
                </Animated.View>
              </View>
            )}

            {/* Icebreaker */}
            {showIce && mode === "connected" && (
              <Pressable
                onPress={() => setIceIdx((i) => (i + 1) % ICEBREAKERS.length)}
                style={[styles.icebreakerBubble, { backgroundColor: colors.card, borderColor: colors.primary + "40" }]}
              >
                <Text style={[styles.icebreakerText, { color: colors.foreground }]}>💬 {ICEBREAKERS[iceIdx]}</Text>
                <Text style={[styles.icebreakerNext, { color: colors.primary }]}>Tap for next →</Text>
              </Pressable>
            )}

            {/* Controls */}
            <View style={styles.controls}>
              {callType === "video" && (
                <Pressable onPress={() => setCameraOff((v) => !v)}
                  style={[styles.ctrlBtn, { backgroundColor: cameraOff ? colors.destructive : colors.card }]}>
                  <Feather name={cameraOff ? "video-off" : "video"} size={20} color={cameraOff ? "#fff" : colors.foreground} />
                </Pressable>
              )}
              <Pressable onPress={() => setMuted((v) => !v)}
                style={[styles.ctrlBtn, { backgroundColor: muted ? colors.destructive : colors.card }]}>
                <Feather name={muted ? "mic-off" : "mic"} size={20} color={muted ? "#fff" : colors.foreground} />
              </Pressable>
              <Pressable onPress={endCall} style={styles.endBtn}>
                <Feather name="phone-off" size={24} color="#fff" />
              </Pressable>
              <Pressable onPress={skipUser} style={[styles.ctrlBtn, { backgroundColor: colors.card }]}>
                <Feather name="skip-forward" size={20} color={colors.foreground} />
              </Pressable>
              <Pressable onPress={() => setShowIce((v) => !v)}
                style={[styles.ctrlBtn, { backgroundColor: showIce ? colors.primary + "20" : colors.card }]}>
                <Feather name="message-circle" size={20} color={showIce ? colors.primary : colors.foreground} />
              </Pressable>
              <Pressable onPress={() => setReportVisible(true)} style={[styles.ctrlBtn, { backgroundColor: colors.card }]}>
                <Feather name="flag" size={20} color={colors.destructive} />
              </Pressable>
            </View>
          </View>
        )}

        {/* Report Modal */}
        <Modal visible={reportVisible} transparent animationType="slide" onRequestClose={() => setReportVisible(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setReportVisible(false)}>
            <View style={[styles.reportSheet, { backgroundColor: colors.card }]}>
              <View style={[styles.reportHandle, { backgroundColor: colors.border }]} />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: colors.destructive + "18", alignItems: "center", justifyContent: "center" }}>
                  <Feather name="flag" size={16} color={colors.destructive} />
                </View>
                <View>
                  <Text style={[styles.reportTitle, { color: colors.foreground, marginBottom: 0 }]}>Report User</Text>
                  <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>
                    {callType === "video" ? "Video" : "Audio"} call · Confidential
                  </Text>
                </View>
              </View>
              {[
                "Inappropriate or offensive language",
                "Harassment or personal attacks",
                "Abusive behavior during call",
                "Scam or fraud attempt",
                "Nudity or explicit content",
                "Other",
              ].map((r) => (
                <Pressable
                  key={r}
                  onPress={() => { setReportVisible(false); setReportDone(true); setTimeout(() => setReportDone(false), 2500); }}
                  style={[styles.reportItem, { borderColor: colors.border }]}
                >
                  <Text style={[styles.reportItemText, { color: colors.foreground }]}>{r}</Text>
                  <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
                </Pressable>
              ))}
              <Pressable
                onPress={() => { endCall(); setReportVisible(false); }}
                style={[styles.blockBtn, { backgroundColor: colors.destructive + "18", borderColor: colors.destructive + "30" }]}
              >
                <Feather name="slash" size={16} color={colors.destructive} />
                <Text style={[styles.blockText, { color: colors.destructive }]}>Block & End Call</Text>
              </Pressable>
            </View>
          </Pressable>
        </Modal>

        {/* Report toast */}
        {reportDone && (
          <View style={[styles.callToast, { pointerEvents: "none" }]}>
            <Feather name="check-circle" size={15} color="#34C759" />
            <Text style={styles.callToastText}>Report submitted to Ridhi team 🙏</Text>
          </View>
        )}
      </View>
    </>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  headerBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },

  idleContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 0 },
  onlineBanner: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, marginBottom: 14 },
  onlineBannerText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  onlineBannerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  safetyBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  safetyText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  crossGenderBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 12, borderWidth: 1, marginBottom: 14 },
  crossGenderText: { fontSize: 12, fontFamily: "Inter_500Medium" },

  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10, marginTop: 4 },

  typeRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  typeBtn: { flex: 1, alignItems: "center", padding: 18, borderRadius: 16, borderWidth: 1.5, gap: 6 },
  typeName: { fontSize: 15, fontFamily: "Inter_700Bold" },
  typeSub: { fontSize: 11, fontFamily: "Inter_400Regular" },

  catChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  catChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },

  langScroll: { paddingHorizontal: 0, gap: 8, paddingBottom: 4, flexDirection: "row" },
  langChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  langChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },

  costBox: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 20, gap: 8 },
  costRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  costTotal: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#ffffff20", paddingTop: 8, marginTop: 4 },
  costLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  costVal: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  startBtn: { borderRadius: 16, overflow: "hidden", marginTop: 8, marginBottom: 12 },
  startBtnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16 },
  startBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  rechargeHint: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  rechargeText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  disclaimer: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 17, marginBottom: 8 },

  // ── Cinematic Searching ──
  centeredState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  cineRing: { position: "absolute", width: 200, height: 200, borderRadius: 100, borderWidth: 2 },
  cineCenter: { width: 120, height: 120, alignItems: "center", justifyContent: "center" },
  searchAvatar: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  searchTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 24, textAlign: "center" },
  searchSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 6, textAlign: "center" },
  shufflingRow: { flexDirection: "row", gap: 10, marginTop: 20 },
  shuffleItem: { alignItems: "center", padding: 10, borderRadius: 14, borderWidth: 1, minWidth: 64 },
  shuffleLabel: { fontSize: 10, fontFamily: "Inter_500Medium", marginTop: 4 },
  cancelBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, borderWidth: 1, marginTop: 24 },
  cancelText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },

  // ── Preview ──
  previewBg: { position: "absolute", top: 0, left: 0, right: 0, height: "45%" },
  videoPreviewBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  videoPreviewLabel: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "Inter_400Regular" },
  previewPanel: { width: "100%", borderRadius: 24, borderWidth: 1, padding: 24, alignItems: "center", gap: 8, marginTop: 180 },
  previewCountdown: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginBottom: 8 },
  previewCountdownText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  previewNameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  previewName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  previewSub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  costInfoBox: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, marginTop: 4 },
  costInfoText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  previewBtns: { flexDirection: "row", gap: 12, marginTop: 12, width: "100%" },
  previewSkip: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 14, borderWidth: 1 },
  previewSkipText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  previewConnect: { flex: 2, borderRadius: 14, overflow: "hidden" },
  previewConnectInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14 },
  previewConnectText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  previewDecline: { fontSize: 13, fontFamily: "Inter_400Regular" },

  // ── Confirming ──
  confirmBox: { width: "100%", borderRadius: 24, borderWidth: 1, padding: 24, alignItems: "center", gap: 10 },
  confirmTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  confirmSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  confirmRate: { fontSize: 22, fontFamily: "Inter_700Bold" },
  confirmBalance: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  confirmBalText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  confirmBtns: { flexDirection: "row", gap: 12, marginTop: 8, width: "100%" },
  confirmSkip: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  confirmSkipText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  confirmOk: { flex: 2, borderRadius: 14, overflow: "hidden" },
  confirmOkInner: { padding: 14, alignItems: "center", justifyContent: "center" },
  confirmOkText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },

  // ── Call Active ──
  callRoot: { flex: 1 },
  videoFill: { flex: 1, alignItems: "center", justifyContent: "center" },
  callInfo: { padding: 20, alignItems: "center", gap: 6 },
  callNameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  callName: { fontSize: 24, fontFamily: "Inter_700Bold" },
  callSub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  connectingText: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 6 },
  callLiveRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveTimer: { fontSize: 18, fontFamily: "Inter_700Bold" },

  // ── Live Coin Ticker ──
  coinTicker: { position: "absolute", top: 100, alignSelf: "center", flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },

  icebreakerBubble: { marginHorizontal: 20, padding: 14, borderRadius: 14, borderWidth: 1, gap: 6 },
  icebreakerText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  icebreakerNext: { fontSize: 12, fontFamily: "Inter_400Regular" },

  controls: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 14, paddingVertical: 20, paddingHorizontal: 12 },
  ctrlBtn: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center" },
  endBtn: { width: 62, height: 62, borderRadius: 31, backgroundColor: "#FF3B30", alignItems: "center", justifyContent: "center" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  reportSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 0 },
  reportHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  reportTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 0 },
  reportItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth },
  reportItemText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  blockBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 12 },
  blockText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  callToast: { position: "absolute", bottom: 120, alignSelf: "center", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 24, backgroundColor: "#1C1C2E", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  callToastText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
