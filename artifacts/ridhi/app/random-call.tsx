import React, { useState, useEffect, useRef } from "react";
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
import { FloatingEmojiBg } from "@/components/FloatingEmojiBg";

const COIN_IMAGE = require("@/assets/images/ridhi_coin.png");


// ── Pricing per blueprint ─────────────────────────────────────────────────────
const HOST_TIERS = [
  { id: "new",       label: "New Host",      audioRate: 10,  videoRate: 25,  color: "#4CAF50", badge: "🌱" },
  { id: "popular",   label: "Popular",       audioRate: 20,  videoRate: 50,  color: "#2196F3", badge: "⭐" },
  { id: "vip",       label: "VIP Host",      audioRate: 40,  videoRate: 100, color: "#FFB800", badge: "💎" },
  { id: "celebrity", label: "Celebrity",     audioRate: 80,  videoRate: 200, color: "#E91E8C", badge: "👑" },
];

const VIDEO_ADDONS = [
  { id: "hd",          label: "HD Video",        cost: 10, icon: "film" },
  { id: "beauty",      label: "Beauty Mode",      cost: 5,  icon: "sun" },
  { id: "voice",       label: "Voice Effects",    cost: 5,  icon: "activity" },
  { id: "translate",   label: "Auto-Translate",   cost: 15, icon: "globe" },
  { id: "priority",    label: "VIP Priority",     cost: 20, icon: "zap" },
];

const VOICE_EFFECTS = [
  { id: "normal",  label: "Normal",   icon: "mic" },
  { id: "deep",    label: "Deep",     icon: "volume-2" },
  { id: "echo",    label: "Echo",     icon: "radio" },
  { id: "robot",   label: "Robot",    icon: "cpu" },
  { id: "girl",    label: "Cute",     icon: "heart" },
  { id: "bass",    label: "Bass",     icon: "bar-chart-2" },
];

const ICEBREAKERS = [
  "What's your favourite Indian dish? 🍛",
  "Describe your day in one emoji! 😄",
  "Which city in India would you love to visit?",
  "What's your go-to Bollywood song? 🎵",
  "Beach 🏖️ or Mountains 🏔️?",
  "Tell me something funny that happened this week!",
];

const ONLINE_HOSTS = [
  // ── Female hosts ────────────────────────────────────────────────────────────
  { id: "h1",  gender: "female" as const, name: "Ananya Singh",   city: "Delhi",     language: "Hindi",     tier: "popular",   rating: 4.8, calls: 2840, verified: true,  isFav: false },
  { id: "h2",  gender: "female" as const, name: "Priya Mehta",    city: "Mumbai",    language: "Marathi",   tier: "vip",       rating: 4.9, calls: 1240, verified: true,  isFav: true  },
  { id: "h3",  gender: "female" as const, name: "Kavya Reddy",    city: "Hyderabad", language: "Telugu",    tier: "celebrity", rating: 5.0, calls: 8420, verified: true,  isFav: false },
  { id: "h4",  gender: "female" as const, name: "Meera Pillai",   city: "Kochi",     language: "Malayalam", tier: "new",       rating: 4.5, calls: 84,   verified: false, isFav: false },
  { id: "h5",  gender: "female" as const, name: "Riya Das",       city: "Kolkata",   language: "Bengali",   tier: "popular",   rating: 4.7, calls: 1840, verified: true,  isFav: false },
  { id: "h6",  gender: "female" as const, name: "Simran Kaur",    city: "Amritsar",  language: "Punjabi",   tier: "vip",       rating: 4.8, calls: 960,  verified: true,  isFav: false },
  { id: "h7",  gender: "female" as const, name: "Divya Iyer",     city: "Chennai",   language: "Tamil",     tier: "popular",   rating: 4.6, calls: 1320, verified: true,  isFav: false },
  { id: "h8",  gender: "female" as const, name: "Nandini Joshi",  city: "Pune",      language: "Hindi",     tier: "new",       rating: 4.3, calls: 45,   verified: false, isFav: false },
  // ── Male hosts ──────────────────────────────────────────────────────────────
  { id: "h9",  gender: "male" as const,   name: "Rohan Sharma",   city: "Delhi",     language: "Hindi",     tier: "popular",   rating: 4.7, calls: 2100, verified: true,  isFav: false },
  { id: "h10", gender: "male" as const,   name: "Arjun Nair",     city: "Kochi",     language: "Malayalam", tier: "vip",       rating: 4.9, calls: 1560, verified: true,  isFav: false },
  { id: "h11", gender: "male" as const,   name: "Karthik Reddy",  city: "Hyderabad", language: "Telugu",    tier: "celebrity", rating: 4.8, calls: 6200, verified: true,  isFav: false },
  { id: "h12", gender: "male" as const,   name: "Vikram Mehta",   city: "Mumbai",    language: "Hindi",     tier: "popular",   rating: 4.6, calls: 1980, verified: true,  isFav: false },
  { id: "h13", gender: "male" as const,   name: "Sourav Das",     city: "Kolkata",   language: "Bengali",   tier: "new",       rating: 4.4, calls: 120,  verified: false, isFav: false },
  { id: "h14", gender: "male" as const,   name: "Harpreet Singh", city: "Amritsar",  language: "Punjabi",   tier: "vip",       rating: 4.7, calls: 870,  verified: true,  isFav: false },
  { id: "h15", gender: "male" as const,   name: "Aditya Raj",     city: "Bangalore", language: "Kannada",   tier: "popular",   rating: 4.5, calls: 1430, verified: true,  isFav: false },
  { id: "h16", gender: "male" as const,   name: "Siddharth K",    city: "Chennai",   language: "Tamil",     tier: "new",       rating: 4.2, calls: 60,   verified: false, isFav: false },
];

const CALL_LANGUAGES = [
  "Any Language", "Hindi", "Bengali", "Telugu", "Marathi", "Tamil",
  "Gujarati", "Kannada", "Malayalam", "Punjabi", "Odia", "English",
];

type PreferGender = "Any" | "Female" | "Male";

type CallMode = "idle" | "searching" | "preview" | "confirming" | "calling" | "connected";
type CallType = "audio" | "video";

const CALL_ACTIVE_MODES: CallMode[] = ["preview", "confirming", "calling", "connected"];

export default function RandomCallScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addCoins } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [callType, setCallType]         = useState<CallType>("audio");
  const [tierId, setTierId]             = useState("popular");
  const [activeAddons, setActiveAddons] = useState<string[]>([]);
  const [mode, setMode]                 = useState<CallMode>("idle");
  const [matched, setMatched]           = useState<typeof ONLINE_HOSTS[0] | null>(null);
  const [duration, setDuration]         = useState(0);
  const [previewLeft, setPreviewLeft]   = useState(15);
  const [muted, setMuted]               = useState(false);
  const [cameraOff, setCameraOff]       = useState(false);
  const [voiceEffect, setVoiceEffect]   = useState("normal");
  const [showEffects, setShowEffects]   = useState(false);
  const [showIce, setShowIce]           = useState(false);
  const [iceIdx, setIceIdx]             = useState(0);
  const [favs, setFavs]                 = useState<string[]>(["h2"]);
  const [showTab, setShowTab]           = useState<"all" | "favs">("all");
  const [reportVisible, setReportVisible] = useState(false);
  const [reportDone, setReportDone]       = useState(false);
  const [preferGender, setPreferGender] = useState<PreferGender>("Any");
  const [preferLanguage, setPreferLanguage] = useState<string>(user?.language ?? "Any Language");

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const tier = HOST_TIERS.find((t) => t.id === tierId)!;
  const rate  = callType === "audio" ? tier.audioRate : tier.videoRate;
  const addonCostPerMin = activeAddons.reduce((s, id) => {
    return s + (VIDEO_ADDONS.find((a) => a.id === id)?.cost ?? 0);
  }, 0);
  const totalRate = rate + (callType === "video" ? addonCostPerMin : 0);
  const est5min   = totalRate * 5;
  const coinsSpent = Math.floor(duration / 60) * totalRate + (duration % 60 > 0 ? totalRate : 0);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Duration timer
  useEffect(() => {
    let t: ReturnType<typeof setInterval>;
    if (mode === "connected") {
      t = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => clearInterval(t);
  }, [mode]);

  // 15-sec free preview countdown
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

  // Block screenshots & screen recordings when a call is active
  useEffect(() => {
    if (Platform.OS === "web") return;
    if (CALL_ACTIVE_MODES.includes(mode)) {
      ScreenCapture.preventScreenCaptureAsync("ridhi-call");
    } else {
      ScreenCapture.allowScreenCaptureAsync("ridhi-call");
    }
    return () => { ScreenCapture.allowScreenCaptureAsync("ridhi-call"); };
  }, [mode]);

  // Pulse while searching
  useEffect(() => {
    if (mode === "searching") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.25, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
        ])
      ).start();

      // Build pool respecting gender + language + tier preferences
      let pool = ONLINE_HOSTS.filter((h) => {
        const genderOk =
          preferGender === "Any" ||
          (preferGender === "Female" && h.gender === "female") ||
          (preferGender === "Male"   && h.gender === "male");
        const langOk =
          preferLanguage === "Any Language" || h.language === preferLanguage;
        return genderOk && langOk;
      });

      // Try to further narrow by tier; fall back gracefully
      const byTier = pool.filter((h) => h.tier === tierId);
      if (byTier.length > 0) pool = byTier;
      if (pool.length === 0) pool = ONLINE_HOSTS; // absolute fallback

      const timeout = setTimeout(() => {
        const u = pool[Math.floor(Math.random() * pool.length)];
        setMatched(u);
        setMode("preview");
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [mode, tierId, preferGender, preferLanguage]);

  const startSearch = () => {
    if ((user?.coins ?? 0) < totalRate) return;
    setDuration(0);
    setMatched(null);
    setMode("searching");
  };

  const confirmCall = () => {
    setMode("calling");
    setTimeout(() => setMode("connected"), 1500);
  };

  const skipUser = () => {
    setMode("searching");
    setMatched(null);
  };

  const endCall = () => {
    if (mode === "connected") {
      addCoins(-Math.min(coinsSpent, user?.coins ?? 0));
    }
    setMode("idle");
    setMatched(null);
    setDuration(0);
  };

  const toggleAddon = (id: string) =>
    setActiveAddons((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);

  const toggleFav = (id: string) =>
    setFavs((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);

  const displayedHosts = ONLINE_HOSTS.filter((h) => {
    if (showTab === "favs" && !favs.includes(h.id)) return false;
    const genderOk =
      preferGender === "Any" ||
      (preferGender === "Female" && h.gender === "female") ||
      (preferGender === "Male"   && h.gender === "male");
    const langOk =
      preferLanguage === "Any Language" || h.language === preferLanguage;
    return genderOk && langOk;
  });

  // ──────────────────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FloatingEmojiBg preset="match" />
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

      {/* ── IDLE ─────────────────────────────────────────────────────────────── */}
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
                {preferGender === "Any" ? "All genders" : preferGender + " hosts"}
                {" · "}
                {preferLanguage === "Any Language" ? "Any language" : preferLanguage}
              </Text>
            </View>
            <View style={[styles.safetyBadge, { backgroundColor: colors.success + "20" }]}>
              <Feather name="shield" size={12} color={colors.success} />
              <Text style={[styles.safetyText, { color: colors.success }]}>Safe</Text>
            </View>
          </LinearGradient>

          {/* ── I want to talk to ─────────────────────────────────────────── */}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>I Want To Talk To</Text>
          <View style={styles.genderRow}>
            {([
              { value: "Any",    label: "Anyone",  icon: "users",     color: "#7B2FBE" },
              { value: "Female", label: "Women",   icon: "heart",     color: "#E91E8C" },
              { value: "Male",   label: "Men",     icon: "user",      color: "#2196F3" },
            ] as { value: PreferGender; label: string; icon: string; color: string }[]).map((opt) => {
              const active = preferGender === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setPreferGender(opt.value)}
                  style={[
                    styles.genderBtn,
                    {
                      backgroundColor: active ? opt.color + "20" : colors.card,
                      borderColor: active ? opt.color : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.genderIconWrap, { backgroundColor: active ? opt.color + "25" : colors.muted }]}>
                    <Feather name={opt.icon as any} size={20} color={active ? opt.color : colors.mutedForeground} />
                  </View>
                  <Text style={[styles.genderBtnLabel, { color: active ? opt.color : colors.foreground }]}>
                    {opt.label}
                  </Text>
                  {active && (
                    <View style={[styles.genderCheck, { backgroundColor: opt.color }]}>
                      <Feather name="check" size={10} color="#fff" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* ── Speaking Language ─────────────────────────────────────────── */}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Speaking Language</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.langScroll}
          >
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

          {/* Call type */}
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
                  from {t === "audio" ? "10" : "25"} coins/min
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Host tier selector */}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Host Tier</Text>
          <View style={styles.tierGrid}>
            {HOST_TIERS.map((t) => {
              const myRate = callType === "audio" ? t.audioRate : t.videoRate;
              const active = tierId === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setTierId(t.id)}
                  style={[
                    styles.tierBtn,
                    {
                      backgroundColor: active ? t.color + "20" : colors.card,
                      borderColor: active ? t.color : colors.border,
                    },
                  ]}
                >
                  <Text style={styles.tierEmoji}>{t.badge}</Text>
                  <Text style={[styles.tierLabel, { color: active ? t.color : colors.foreground }]}>{t.label}</Text>
                  <Text style={[styles.tierRate, { color: active ? t.color : colors.mutedForeground }]}><Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />{myRate}/min
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Video add-ons */}
          {callType === "video" && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Premium Add-Ons</Text>
              <View style={styles.addonGrid}>
                {VIDEO_ADDONS.map((a) => {
                  const on = activeAddons.includes(a.id);
                  return (
                    <Pressable
                      key={a.id}
                      onPress={() => toggleAddon(a.id)}
                      style={[
                        styles.addonBtn,
                        { backgroundColor: on ? colors.primary + "18" : colors.card, borderColor: on ? colors.primary : colors.border },
                      ]}
                    >
                      <Feather name={a.icon as any} size={15} color={on ? colors.primary : colors.mutedForeground} />
                      <Text style={[styles.addonLabel, { color: on ? colors.primary : colors.foreground }]}>{a.label}</Text>
                      <Text style={[styles.addonCost, { color: on ? colors.primary : colors.mutedForeground }]}>+{a.cost}/min</Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* Cost estimate */}
          <View style={[styles.costBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.costRow}>
              <Text style={[styles.costLabel, { color: colors.mutedForeground }]}>{tier.badge} {tier.label} rate</Text>
              <Text style={[styles.costVal, { color: colors.foreground }]}><Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />{rate}/min</Text>
            </View>
            {callType === "video" && activeAddons.length > 0 && (
              <View style={styles.costRow}>
                <Text style={[styles.costLabel, { color: colors.mutedForeground }]}>Add-ons</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text style={[styles.costVal, { color: colors.foreground }]}>+</Text>
                  <Image source={COIN_IMAGE} style={{ width: 14, height: 14 }} resizeMode="contain" />
                  <Text style={[styles.costVal, { color: colors.foreground }]}>{addonCostPerMin}/min</Text>
                </View>
              </View>
            )}
            <View style={[styles.costRow, styles.costTotal]}>
              <Text style={[styles.costLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Estimated 5-min cost
              </Text>
              <Text style={[styles.costVal, { color: colors.primary, fontFamily: "Inter_700Bold", fontSize: 16 }]}><Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />{est5min}
              </Text>
            </View>
          </View>

          {/* Host list */}
          <View style={styles.hostListHeader}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginBottom: 0 }]}>Hosts Online</Text>
            <View style={styles.tabRow}>
              {(["all", "favs"] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setShowTab(t)}
                  style={[styles.tabBtn, { backgroundColor: showTab === t ? colors.primary : colors.muted }]}
                >
                  <Text style={[styles.tabText, { color: showTab === t ? "#fff" : colors.mutedForeground }]}>
                    {t === "all" ? "All" : "❤️ Favs"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          {displayedHosts.map((h) => {
            const ht = HOST_TIERS.find((t) => t.id === h.tier)!;
            const isFav = favs.includes(h.id);
            return (
              <View key={h.id} style={[styles.hostCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Avatar name={h.name} size={44} />
                <View style={{ flex: 1 }}>
                  <View style={styles.hostNameRow}>
                    <Text style={[styles.hostName, { color: colors.foreground }]}>{h.name}</Text>
                    {h.verified && <Feather name="check-circle" size={13} color="#2196F3" />}
                    <View style={[styles.tierBadge, { backgroundColor: ht.color + "20" }]}>
                      <Text style={[styles.tierBadgeText, { color: ht.color }]}>{ht.badge} {ht.label}</Text>
                    </View>
                  </View>
                  <Text style={[styles.hostSub, { color: colors.mutedForeground }]}>
                    {h.city} · {h.language} · ⭐ {h.rating} · {h.calls.toLocaleString()} calls
                  </Text>
                </View>
                <View style={styles.hostActions}>
                  <Pressable onPress={() => toggleFav(h.id)}>
                    <Feather name="heart" size={18} color={isFav ? colors.primary : colors.mutedForeground} />
                  </Pressable>
                  <View style={[styles.hostOnlineDot, { backgroundColor: colors.success }]} />
                </View>
              </View>
            );
          })}

          {/* Start button */}
          <Pressable onPress={startSearch} disabled={(user?.coins ?? 0) < totalRate} style={[styles.startBtn, { opacity: (user?.coins ?? 0) < totalRate ? 0.5 : 1 }]}>
            <LinearGradient colors={[colors.secondary, colors.primary]} style={styles.startBtnInner}>
              <Feather name={callType === "audio" ? "mic" : "video"} size={20} color="#fff" />
              <Text style={styles.startBtnText}>
                Start {callType === "audio" ? "Audio" : "Video"} Call — {tier.badge} {tier.label}
              </Text>
            </LinearGradient>
          </Pressable>

          {(user?.coins ?? 0) < totalRate && (
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

      {/* ── SEARCHING ────────────────────────────────────────────────────────── */}
      {mode === "searching" && (
        <View style={styles.centeredState}>
          <Animated.View style={[styles.pulseRing1, { borderColor: tier.color + "40", transform: [{ scale: pulseAnim }] }]} />
          <Animated.View style={[styles.pulseRing2, { borderColor: tier.color + "20", transform: [{ scale: pulseAnim }] }]} />
          <View style={[styles.searchAvatar, { backgroundColor: colors.card }]}>
            <Text style={{ fontSize: 40 }}>{tier.badge}</Text>
          </View>
          <Text style={[styles.searchTitle, { color: colors.foreground }]}>Finding {tier.label}…</Text>
          <Text style={[styles.searchSub, { color: colors.mutedForeground }]}>
            🗣️ Matching {user?.language ?? "Hindi"} speakers · {callType === "audio" ? "🎙️ Audio" : "📹 Video"}
          </Text>
          <Pressable onPress={() => setMode("idle")} style={[styles.cancelBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="x" size={16} color={colors.destructive} />
            <Text style={[styles.cancelText, { color: colors.destructive }]}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {/* ── FREE PREVIEW (15 sec) ─────────────────────────────────────────────── */}
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
              {matched.verified && <Feather name="check-circle" size={14} color="#2196F3" />}
            </View>
            <Text style={[styles.previewSub, { color: colors.mutedForeground }]}>
              {matched.city} · {matched.language} · ⭐ {matched.rating}
            </Text>
            <View style={[styles.tierPillLarge, { backgroundColor: HOST_TIERS.find((t) => t.id === matched.tier)!.color + "20" }]}>
              <Text style={[styles.tierPillText, { color: HOST_TIERS.find((t) => t.id === matched.tier)!.color }]}>
                {HOST_TIERS.find((t) => t.id === matched.tier)!.badge} {HOST_TIERS.find((t) => t.id === matched.tier)!.label}
              </Text>
            </View>
            <View style={[styles.costInfoBox, { backgroundColor: colors.muted }]}>
              <Text style={[styles.costInfoText, { color: colors.mutedForeground }]}><Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />{totalRate}/min · Est. 5 min = {est5min} coins
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
            <Pressable onPress={() => setMode("idle")} style={{ marginTop: 8 }}>
              <Text style={[styles.previewDecline, { color: colors.mutedForeground }]}>✕ Decline & go back</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ── CONFIRMING (preview time ran out) ────────────────────────────────── */}
      {mode === "confirming" && matched && (
        <View style={styles.centeredState}>
          <View style={[styles.confirmBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.confirmTitle, { color: colors.foreground }]}>Continue the call?</Text>
            <Text style={[styles.confirmSub, { color: colors.mutedForeground }]}>
              Free preview ended. Coins will be deducted at
            </Text>
            <Text style={[styles.confirmRate, { color: colors.primary }]}><Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />{totalRate} coins / minute</Text>
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

      {/* ── CALLING / CONNECTED ──────────────────────────────────────────────── */}
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
              {matched.verified && <Feather name="check-circle" size={15} color="#2196F3" />}
            </View>
            <Text style={[styles.callSub, { color: colors.mutedForeground }]}>
              {matched.city} · {matched.language}
            </Text>
            {mode === "calling" && (
              <Text style={[styles.connectingText, { color: colors.mutedForeground }]}>Connecting…</Text>
            )}
            {mode === "connected" && (
              <View style={styles.callLiveRow}>
                <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.liveTimer, { color: colors.success }]}>{fmt(duration)}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Image source={COIN_IMAGE} style={{ width: 14, height: 14 }} resizeMode="contain" />
                  <Text style={[styles.liveCost, { color: colors.gold }]}>-{coinsSpent}</Text>
                </View>
              </View>
            )}
          </View>

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

          {/* Voice effects drawer (audio only) */}
          {showEffects && callType === "audio" && mode === "connected" && (
            <View style={[styles.effectsDrawer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.effectsTitle, { color: colors.mutedForeground }]}>Voice Effect</Text>
              <View style={styles.effectsGrid}>
                {VOICE_EFFECTS.map((e) => (
                  <Pressable
                    key={e.id}
                    onPress={() => setVoiceEffect(e.id)}
                    style={[
                      styles.effectBtn,
                      { backgroundColor: voiceEffect === e.id ? colors.primary + "20" : colors.muted, borderColor: voiceEffect === e.id ? colors.primary : "transparent" },
                    ]}
                  >
                    <Feather name={e.icon as any} size={16} color={voiceEffect === e.id ? colors.primary : colors.mutedForeground} />
                    <Text style={[styles.effectLabel, { color: voiceEffect === e.id ? colors.primary : colors.foreground }]}>{e.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
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
            {callType === "audio" && (
              <Pressable onPress={() => setShowEffects((v) => !v)}
                style={[styles.ctrlBtn, { backgroundColor: showEffects ? colors.secondary + "30" : colors.card }]}>
                <Feather name="activity" size={20} color={showEffects ? colors.secondary : colors.foreground} />
              </Pressable>
            )}
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

      {/* Complaint against Host Modal */}
      <Modal visible={reportVisible} transparent animationType="slide" onRequestClose={() => setReportVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setReportVisible(false)}>
          <View style={[styles.reportSheet, { backgroundColor: colors.card }]}>
            <View style={[styles.reportHandle, { backgroundColor: colors.border }]} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: colors.destructive + "18", alignItems: "center", justifyContent: "center" }}>
                <Feather name="flag" size={16} color={colors.destructive} />
              </View>
              <View>
                <Text style={[styles.reportTitle, { color: colors.foreground, marginBottom: 0 }]}>Complaint against Host</Text>
                <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>
                  {callType === "video" ? "Video" : "Audio"} call · Your report is confidential
                </Text>
              </View>
            </View>
            {[
              "Inappropriate or offensive language",
              "Harassment or personal attacks",
              "Abusive behavior during call",
              "Scam or fraud attempt",
              "Nudity or explicit content",
              "Underage host",
              "Other",
            ].map((r) => (
              <Pressable
                key={r}
                onPress={() => {
                  setReportVisible(false);
                  setReportDone(true);
                  setTimeout(() => setReportDone(false), 2500);
                }}
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

      {/* ── Complaint submitted toast ── */}
      {reportDone && (
        <View style={[styles.callToast, { pointerEvents: "none" }]}>
          <Feather name="check-circle" size={15} color="#34C759" />
          <Text style={styles.callToastText}>Complaint submitted to Ridhi team 🙏</Text>
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  headerBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },

  idleContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 0 },
  onlineBanner: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, marginBottom: 22 },
  onlineBannerText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  onlineBannerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  safetyBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  safetyText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10, marginTop: 4 },

  typeRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  typeBtn: { flex: 1, alignItems: "center", padding: 18, borderRadius: 16, borderWidth: 1.5, gap: 6 },
  typeName: { fontSize: 15, fontFamily: "Inter_700Bold" },
  typeSub: { fontSize: 11, fontFamily: "Inter_400Regular" },

  tierGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  tierBtn: { width: "47%", padding: 14, borderRadius: 14, borderWidth: 1.5, alignItems: "center", gap: 4 },
  tierEmoji: { fontSize: 24 },
  tierLabel: { fontSize: 13, fontFamily: "Inter_700Bold" },
  tierRate: { fontSize: 11, fontFamily: "Inter_500Medium" },

  addonGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  addonBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  addonLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  addonCost: { fontSize: 10, fontFamily: "Inter_400Regular" },

  costBox: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 20, gap: 8 },
  costRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  costTotal: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#ffffff20", paddingTop: 8, marginTop: 4 },
  costLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  costVal: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  hostListHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  tabRow: { flexDirection: "row", gap: 6 },
  tabBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  tabText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  hostCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  hostNameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  hostName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  hostSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 3 },
  hostActions: { alignItems: "center", gap: 6 },
  hostOnlineDot: { width: 8, height: 8, borderRadius: 4 },
  tierBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, marginLeft: 2 },
  tierBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },

  startBtn: { borderRadius: 16, overflow: "hidden", marginTop: 8, marginBottom: 12 },
  startBtnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16 },
  startBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  rechargeHint: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  rechargeText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  disclaimer: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 17, marginBottom: 8 },

  centeredState: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  pulseRing1: { position: "absolute", width: 180, height: 180, borderRadius: 90, borderWidth: 2 },
  pulseRing2: { position: "absolute", width: 230, height: 230, borderRadius: 115, borderWidth: 2 },
  searchAvatar: { width: 110, height: 110, borderRadius: 55, alignItems: "center", justifyContent: "center" },
  searchTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginTop: 16 },
  searchSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4, textAlign: "center" },
  cancelBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, borderWidth: 1, marginTop: 20 },
  cancelText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },

  previewBg: { position: "absolute", top: 0, left: 0, right: 0, height: "45%" },
  videoPreviewBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  videoPreviewLabel: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "Inter_400Regular" },
  previewPanel: { width: "100%", borderRadius: 24, borderWidth: 1, padding: 24, alignItems: "center", gap: 8, marginTop: 180 },
  previewCountdown: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginBottom: 8 },
  previewCountdownText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  previewNameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  previewName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  previewSub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  tierPillLarge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12 },
  tierPillText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  costInfoBox: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, marginTop: 4 },
  costInfoText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  previewBtns: { flexDirection: "row", gap: 12, marginTop: 12, width: "100%" },
  previewSkip: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 14, borderWidth: 1 },
  previewSkipText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  previewConnect: { flex: 2, borderRadius: 14, overflow: "hidden" },
  previewConnectInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 14 },
  previewConnectText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  previewDecline: { fontSize: 13, fontFamily: "Inter_400Regular" },

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
  liveCost: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  icebreakerBubble: { marginHorizontal: 20, padding: 14, borderRadius: 14, borderWidth: 1, gap: 6 },
  icebreakerText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  icebreakerNext: { fontSize: 12, fontFamily: "Inter_400Regular" },

  effectsDrawer: { marginHorizontal: 20, padding: 14, borderRadius: 14, borderWidth: 1, gap: 10 },
  effectsTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.7 },
  effectsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  effectBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  effectLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },

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

  // ── Gender preference ──────────────────────────────────────────────────────
  genderRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  genderBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 6,
    position: "relative",
  },
  genderIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  genderBtnLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  genderCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Language chips ─────────────────────────────────────────────────────────
  langScroll: { paddingHorizontal: 0, gap: 8, paddingBottom: 4, flexDirection: "row" },
  langChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  langChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
});
