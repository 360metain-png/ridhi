import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { Avatar } from "@/components/Avatar";
import { GradientButton } from "@/components/GradientButton";
import { RidhiCoin } from "@/components/RidhiCoin";
import { PrivateHead } from "@/components/PrivateHead";

const COIN_IMAGE = require("../assets/images/ridhi_coin.png");


const { width } = Dimensions.get("window");

const HOST_LEVELS = [
  { level: 1, label: "Starter", badge: "Bronze", emoji: "🥉", target: 50000, color: "#CD7F32", earnings: "₹5K–₹10K" },
  { level: 2, label: "Rising", badge: "Silver", emoji: "🥈", target: 100000, color: "#C0C0C0", earnings: "₹10K–₹25K" },
  { level: 3, label: "Popular", badge: "Gold", emoji: "🥇", target: 300000, color: "#FFB800", earnings: "₹25K–₹60K" },
  { level: 4, label: "Star Host", badge: "Platinum", emoji: "💎", target: 700000, color: "#E5E4E2", earnings: "₹60K–₹1.5L" },
  { level: 5, label: "Elite", badge: "Diamond", emoji: "💠", target: 1500000, color: "#00BCD4", earnings: "₹1.5L–₹3L" },
  { level: 6, label: "Celebrity", badge: "Crown", emoji: "👑", target: 3000000, color: "#E91E8C", earnings: "₹3L–₹7L" },
  { level: 7, label: "Ridhi Icon", badge: "Royal Crown", emoji: "🏆", target: 5000000, color: "#FFB800", earnings: "₹7L+" },
];

const CURRENT_LEVEL = 3;
const CURRENT_COINS = 180000;

// How coins are split between Host and Ridhi platform
const HOST_COIN_SPLIT = [
  { level: 1, badge: "Bronze", emoji: "🥉", hostPct: 40, ridhiPct: 60, color: "#CD7F32" },
  { level: 2, badge: "Silver", emoji: "🥈", hostPct: 45, ridhiPct: 55, color: "#C0C0C0" },
  { level: 3, badge: "Gold",   emoji: "🥇", hostPct: 50, ridhiPct: 50, color: "#FFB800" },
  { level: 4, badge: "Platinum", emoji: "💎", hostPct: 55, ridhiPct: 45, color: "#E5E4E2" },
  { level: 5, badge: "Diamond", emoji: "💠", hostPct: 60, ridhiPct: 40, color: "#00BCD4" },
  { level: 6, badge: "Crown",  emoji: "👑", hostPct: 65, ridhiPct: 35, color: "#E91E8C" },
  { level: 7, badge: "Royal Crown", emoji: "🏆", hostPct: 70, ridhiPct: 30, color: "#FFB800" },
];

const EARNINGS_BREAKDOWN = [
  { source: "Video Calls", amount: "₹14,200", coins: 71000, icon: "video", color: "#7B2FBE" },
  { source: "Audio Calls", amount: "₹8,400", coins: 42000, icon: "phone", color: "#34C759" },
  { source: "Virtual Gifts", amount: "₹19,600", coins: 98000, icon: "gift", color: "#E91E8C" },
  { source: "Live Streams", amount: "₹11,000", coins: 55000, icon: "radio", color: "#FF6B35" },
  { source: "Fan Clubs", amount: "₹4,800", icon: "heart", color: "#FF3B6F", coins: 24000 },
];

const GIFT_STATS = [
  { emoji: "🌹", name: "Rose", count: 842, coins: 8420 },
  { emoji: "💗", name: "Heart", count: 214, coins: 10700 },
  { emoji: "🎂", name: "Cake", count: 87, coins: 8700 },
  { emoji: "🚗", name: "Car", count: 4, coins: 20000 },
];

const MONTHLY_BARS = [0.3, 0.45, 0.6, 0.5, 0.72, 0.85, 0.92, 0.78, 0.88, 0.76, 0.95, 1.0];
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export default function HostProfileScreen() {
  useTrackScreen("host_profile");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [tab, setTab] = useState<"overview" | "earnings" | "levels">("overview");
  const progressAnim = useRef(new Animated.Value(0)).current;

  // ── Registration gate state ─────────────────────────────────────────────────
  const [regName, setRegName]       = useState(user?.name ?? "");
  const [regPhone, setRegPhone]     = useState(user?.phone ?? "");
  const [regCity, setRegCity]       = useState(user?.city ?? "");
  const [regGender, setRegGender]   = useState<"male" | "female" | "">("");
  const [regAgreed, setRegAgreed]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const gateAnim    = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;
  const checkAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!user?.isHost) {
      Animated.spring(gateAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }).start();
    }
  }, [user?.isHost]);

  const handleHostRegister = async () => {
    if (!regName.trim())   { Alert.alert("Required", "Please enter your full name."); return; }
    if (!regPhone.trim())  { Alert.alert("Required", "Please enter your WhatsApp number."); return; }
    if (!regCity.trim())   { Alert.alert("Required", "Please enter your city."); return; }
    if (!regGender)        { Alert.alert("Required", "Please select your gender."); return; }
    if (!regAgreed)        { Alert.alert("Required", "Please accept the Host Agreement to continue."); return; }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    setSubmitted(true);
    Animated.parallel([
      Animated.timing(successAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(checkAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6, delay: 200 }),
    ]).start();
    await new Promise((r) => setTimeout(r, 2400));
    const activeUntil = new Date();
    activeUntil.setDate(activeUntil.getDate() + 30);
    await updateProfile({
      isHost: true,
      hostRegisteredAt: new Date().toISOString(),
      hostMonthlyHours: 0,
      hostActiveUntil: activeUntil.toISOString(),
      name: regName.trim(),
      phone: regPhone.trim(),
      city: regCity.trim(),
    });
  };

  // ── Pre-compute progress (must be before any conditional return) ────────────
  const currentLvl = HOST_LEVELS[CURRENT_LEVEL - 1];
  const nextLvl    = HOST_LEVELS[CURRENT_LEVEL] || HOST_LEVELS[CURRENT_LEVEL - 1];
  const progressPct = Math.min(CURRENT_COINS / nextLvl.target, 1);
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  useEffect(() => {
    if (user?.isHost) {
      Animated.timing(progressAnim, { toValue: progressPct, duration: 1200, useNativeDriver: false }).start();
    }
  }, [user?.isHost]);

  // ── KYC gate: must be verified before registering as host ──────────────
  const kycVerified = user?.kycStatus === "verified";

  if (!kycVerified) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ minHeight: "100%" }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#7B2FBE", "#E91E8C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: topPad + 24, paddingHorizontal: 24, paddingBottom: 28 }}>
          <Pressable onPress={() => router.back()} style={{ padding: 6, marginBottom: 12 }}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <View style={{ alignItems: "center", gap: 14 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
              <Feather name="shield" size={36} color="#fff" />
            </View>
            <Text style={{ color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" }}>Identity Verification Required</Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 }}>
              Complete E-KYC (Aadhaar + PAN) before you can register as a Host and start earning.
            </Text>
          </View>
          <View style={{ marginTop: 24, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 16, padding: 16, gap: 12 }}>
            {[
              { icon: "credit-card", text: "Aadhaar OTP verification via UIDAI" },
              { icon: "file-text",   text: "PAN card verification via NSDL" },
              { icon: "home",        text: "Bank account penny-drop verification" },
            ].map((item) => (
              <View key={item.text} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Feather name={item.icon as any} size={16} color="#FFB800" />
                <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontFamily: "Inter_400Regular" }}>{item.text}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
        <View style={{ padding: 24, gap: 14 }}>
          <Pressable onPress={() => router.push("/kyc")}>
            <LinearGradient colors={["#7B2FBE", "#E91E8C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 16 }}>
              <Feather name="shield" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" }}>Complete E-KYC Now</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: colors.mutedForeground, fontSize: 14, fontFamily: "Inter_500Medium", textAlign: "center" }}>Go Back</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // ── Show registration gate if not a host ────────────────────────────────────
  if (!user?.isHost) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.background }}
          contentContainerStyle={{ minHeight: "100%" }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero gradient */}
          <LinearGradient
            colors={["#7B2FBE", "#E91E8C"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={[regStyles.hero, { paddingTop: topPad + 12 }]}
          >
            <Pressable onPress={() => router.back()} style={regStyles.backBtn}>
              <Feather name="arrow-left" size={22} color="#fff" />
            </Pressable>

            <Animated.View style={{ transform: [{ scale: gateAnim }], alignItems: "center" }}>
              <View style={regStyles.heroIcon}>
                <Image source={COIN_IMAGE} style={{ width: 36, height: 36 }} resizeMode="contain" />
              </View>
              <Text style={regStyles.heroTitle}>Become a Host</Text>
              <Text style={regStyles.heroSub}>
                Earn real money by going live, taking calls{"\n"}and entertaining your fans on Ridhi
              </Text>
            </Animated.View>

            {/* Earnings band */}
            <View style={regStyles.earningsBand}>
              {[
                { label: "Starter", value: "₹5K–₹10K", emoji: "🥉" },
                { label: "Star Host", value: "₹60K–₹1.5L", emoji: "💎" },
                { label: "Celebrity", value: "₹3L–₹7L+", emoji: "👑" },
              ].map((e) => (
                <View key={e.label} style={regStyles.earningsItem}>
                  <Text style={regStyles.earningsEmoji}>{e.emoji}</Text>
                  <Text style={regStyles.earningsValue}>{e.value}</Text>
                  <Text style={regStyles.earningsLabel}>{e.label}</Text>
                </View>
              ))}
            </View>
          </LinearGradient>

          {/* Benefits */}
          <View style={[regStyles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[regStyles.sectionTitle, { color: colors.foreground }]}>Why become a Host?</Text>
            {[
              { icon: "trending-up", text: "Earn from Video & Audio calls, Live streams, Gifts", color: "#22C55E" },
              { icon: "trending-up", text: "Level up from Bronze to Crown — unlock higher payouts", color: "#FFB800" },
              { icon: "users", text: "Build your own fan base and fan clubs", color: "#7B2FBE" },
              { icon: "shield", text: "Dedicated support and weekly payouts", color: "#E91E8C" },
            ].map((b, i) => (
              <View key={i} style={regStyles.benefitRow}>
                <View style={[regStyles.benefitIcon, { backgroundColor: b.color + "20" }]}>
                  <Feather name={b.icon as any} size={16} color={b.color} />
                </View>
                <Text style={[regStyles.benefitText, { color: colors.foreground }]}>{b.text}</Text>
              </View>
            ))}
          </View>

          {/* Requirements */}
          <View style={[regStyles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[regStyles.sectionTitle, { color: colors.foreground }]}>Requirements</Text>
            {["18+ years old", "Smartphone with good camera & internet", "E-KYC verified (Aadhaar / PAN)", "Agreeable personality & regular schedule"].map((r, i) => (
              <View key={i} style={regStyles.reqRow}>
                <View style={[regStyles.reqDot, { backgroundColor: colors.primary }]} />
                <Text style={[regStyles.reqText, { color: colors.mutedForeground }]}>{r}</Text>
              </View>
            ))}
          </View>

          {/* Success overlay */}
          {submitted && (
            <Animated.View style={[regStyles.successOverlay, { opacity: successAnim }]}>
              <LinearGradient colors={["#7B2FBE", "#22C55E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={regStyles.successGrad}>
                <Animated.View style={[regStyles.successCheck, { transform: [{ scale: checkAnim }] }]}>
                  <Feather name="check" size={40} color="#fff" />
                </Animated.View>
                <Text style={regStyles.successTitle}>Application Submitted! 🎉</Text>
                <Text style={regStyles.successSub}>
                  Welcome to the Ridhi Host family, {regName.split(" ")[0]}!{"\n"}
                  You must complete 30 hours of live streams per month to maintain your registration.
                </Text>
                <Text style={regStyles.successSub2}>Opening your Host Dashboard…</Text>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Registration form */}
          <View style={[regStyles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[regStyles.sectionTitle, { color: colors.foreground }]}>Host Registration</Text>

            <Text style={[regStyles.fieldLabel, { color: colors.mutedForeground }]}>Full Name *</Text>
            <TextInput
              value={regName}
              onChangeText={setRegName}
              placeholder="Enter your full name"
              placeholderTextColor={colors.mutedForeground}
              style={[regStyles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
            />

            <Text style={[regStyles.fieldLabel, { color: colors.mutedForeground }]}>WhatsApp Number *</Text>
            <TextInput
              value={regPhone}
              onChangeText={setRegPhone}
              placeholder="+91 XXXXX XXXXX"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
              style={[regStyles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
            />

            <Text style={[regStyles.fieldLabel, { color: colors.mutedForeground }]}>City *</Text>
            <TextInput
              value={regCity}
              onChangeText={setRegCity}
              placeholder="Mumbai, Delhi, Bangalore…"
              placeholderTextColor={colors.mutedForeground}
              style={[regStyles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
            />

            <Text style={[regStyles.fieldLabel, { color: colors.mutedForeground }]}>Gender *</Text>
            <View style={regStyles.genderRow}>
              {([
                { key: "male",   label: "Male",   icon: "👨" },
                { key: "female", label: "Female",  icon: "👩" },
              ] as const).map((g) => {
                const sel = regGender === g.key;
                return (
                  <Pressable
                    key={g.key}
                    onPress={() => setRegGender(g.key)}
                    style={[
                      regStyles.genderChip,
                      {
                        backgroundColor: sel ? colors.primary + "18" : colors.background,
                        borderColor:     sel ? colors.primary : colors.border,
                        borderWidth:     sel ? 1.5 : 1,
                      },
                    ]}
                  >
                    <Text style={regStyles.genderEmoji}>{g.icon}</Text>
                    <Text style={[regStyles.genderLabel, { color: sel ? colors.primary : colors.foreground }]}>
                      {g.label.split("  ")[1]}
                    </Text>
                    {sel && (
                      <View style={[regStyles.genderCheck, { backgroundColor: colors.primary }]}>
                        <Feather name="check" size={9} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Agreement checkbox */}
            <Pressable onPress={() => setRegAgreed(!regAgreed)} style={regStyles.agreeRow}>
              <View style={[regStyles.checkbox, { borderColor: regAgreed ? colors.primary : colors.border, backgroundColor: regAgreed ? colors.primary : "transparent" }]}>
                {regAgreed && <Feather name="check" size={12} color="#fff" />}
              </View>
              <Text style={[regStyles.agreeText, { color: colors.mutedForeground }]}>
                I agree to the <Text style={{ color: colors.primary }}>Host Agreement</Text> and platform guidelines
              </Text>
            </Pressable>

            <GradientButton
              label={submitting ? "Submitting…" : "Apply to Become a Host 🌟"}
              onPress={handleHostRegister}
              style={{ marginTop: 8, opacity: submitting ? 0.7 : 1 }}
            />

            <Text style={[regStyles.disclaimer, { color: colors.mutedForeground }]}>
              Applications are reviewed within 24–48 hours. You'll be notified via SMS/email.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <>
      <PrivateHead />
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[currentLvl.color + "22", "transparent"]}
        style={[styles.headerGlow, { height: topPad + 120 }]}
      />

      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.surface + "F0", borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Host Profile</Text>
        <LinearGradient colors={[currentLvl.color, currentLvl.color + "AA"]} style={styles.levelChip}>
          <Text style={styles.levelChipEmoji}>{currentLvl.emoji}</Text>
          <Text style={styles.levelChipText}>L{CURRENT_LEVEL}</Text>
        </LinearGradient>
      </View>

      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {(["overview", "earnings", "levels"] as const).map((t) => (
          <Pressable key={t} style={styles.tabItem} onPress={() => setTab(t)}>
            {t === tab && <LinearGradient colors={[colors.primary + "20", "transparent"]} style={StyleSheet.absoluteFill} />}
            <Text style={[styles.tabText, { color: t === tab ? colors.primary : colors.mutedForeground }]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
            {t === tab && <View style={[styles.tabUnderline, { backgroundColor: colors.primary }]} />}
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 40 }}>
        {tab === "overview" && (
          <>
            <LinearGradient
              colors={[currentLvl.color + "22", currentLvl.color + "08"]}
              style={[styles.profileCard, { borderColor: currentLvl.color + "50" }]}
            >
              <View style={styles.profileCardTop}>
                <View style={styles.avatarWrap}>
                  <Avatar name={user?.name ?? "Host"} size={68} hasStory />
                  <LinearGradient colors={[currentLvl.color, currentLvl.color + "AA"]} style={styles.avatarBadge}>
                    <Text style={styles.avatarBadgeText}>{currentLvl.emoji}</Text>
                  </LinearGradient>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.profileName, { color: colors.foreground }]}>{user?.name ?? "Your Name"}</Text>
                  <Text style={[styles.profileLevel, { color: currentLvl.color }]}>
                    L{CURRENT_LEVEL} {currentLvl.label} · {currentLvl.badge}
                  </Text>
                  <Text style={[styles.profileEarnings, { color: colors.mutedForeground }]}>
                    Est. {currentLvl.earnings}/month
                  </Text>
                </View>
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
                    Progress to L{CURRENT_LEVEL + 1} ({nextLvl.badge})
                  </Text>
                  <Text style={[styles.progressValue, { color: currentLvl.color }]}>
                    {(CURRENT_COINS / 1000).toFixed(0)}K / {(nextLvl.target / 1000).toFixed(0)}K coins
                  </Text>
                </View>
                <View style={[styles.progressBarBg, { backgroundColor: colors.muted }]}>
                  <Animated.View style={[styles.progressBarFill, { width: progressWidth }]}>
                    <LinearGradient colors={[currentLvl.color, nextLvl.color]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
                  </Animated.View>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.kpiGrid}>
              {[
                { label: "Live Hours", value: "142h", icon: "radio", color: colors.primary },
                { label: "Total Calls", value: "1,847", icon: "phone", color: colors.success },
                { label: "Gifts Received", value: "3,241", icon: "gift", color: colors.gold },
                { label: "Fan Club Members", value: "284", icon: "heart", color: "#FF3B6F" },
              ].map((k) => (
                <View key={k.label} style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.kpiIcon, { backgroundColor: k.color + "20" }]}>
                    <Feather name={k.icon as any} size={16} color={k.color} />
                  </View>
                  <Text style={[styles.kpiValue, { color: colors.foreground }]}>{k.value}</Text>
                  <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>{k.label}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.giftsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Top Gifts Received</Text>
              <View style={styles.giftsList}>
                {GIFT_STATS.map((g) => (
                  <View key={g.name} style={[styles.giftRow, { borderBottomColor: colors.border }]}>
                    <Text style={styles.giftEmoji}>{g.emoji}</Text>
                    <Text style={[styles.giftName, { color: colors.foreground }]}>{g.name}</Text>
                    <Text style={[styles.giftCount, { color: colors.mutedForeground }]}>×{g.count}</Text>
                    <Text style={[styles.giftCoins, { color: colors.gold }]}><Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />{g.coins.toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.withdrawRow}>
              <GradientButton label="💸 Request Withdrawal" onPress={() => router.push("/withdraw")} style={{ flex: 1 }} />
            </View>
          </>
        )}

        {tab === "earnings" && (
          <>
            <View style={[styles.totalEarningsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>Total Earnings This Month</Text>
              <Text style={[styles.totalAmount, { color: colors.success }]}>₹58,000</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />
                <Text style={[styles.totalCoins, { color: colors.gold }]}>290,000 coins</Text>
              </View>
            </View>

            <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Monthly Coins Earned (2025)</Text>
              <View style={styles.chartBars}>
                {MONTHLY_BARS.map((h, i) => (
                  <View key={i} style={styles.barWrap}>
                    <View style={[styles.barBg, { backgroundColor: colors.muted }]}>
                      <LinearGradient colors={[currentLvl.color, currentLvl.color + "60"]} style={[styles.barFill, { height: 90 * h }]} />
                    </View>
                    <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{MONTHS[i]}</Text>
                  </View>
                ))}
              </View>
            </View>

            {EARNINGS_BREAKDOWN.map((e) => (
              <View key={e.source} style={[styles.earningRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.earningIcon, { backgroundColor: e.color + "20" }]}>
                  <Feather name={e.icon as any} size={16} color={e.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.earningSource, { color: colors.foreground }]}>{e.source}</Text>
                  <Text style={[styles.earningCoins, { color: colors.mutedForeground }]}><Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />{e.coins.toLocaleString()}</Text>
                </View>
                <Text style={[styles.earningAmount, { color: colors.success }]}>{e.amount}</Text>
              </View>
            ))}
          </>
        )}

        {tab === "levels" && (
          <>
            <Text style={[styles.levelsSubtitle, { color: colors.mutedForeground }]}>
              Earn coins through calls, gifts & live streams to level up
            </Text>
            {HOST_LEVELS.map((lvl) => {
              const isCurrent = lvl.level === CURRENT_LEVEL;
              const isUnlocked = lvl.level < CURRENT_LEVEL;
              return (
                <LinearGradient
                  key={lvl.level}
                  colors={isCurrent ? [lvl.color + "25", lvl.color + "08"] : isUnlocked ? [colors.success + "08", colors.card] : [colors.card, colors.card]}
                  style={[styles.levelCard, { borderColor: isCurrent ? lvl.color + "60" : isUnlocked ? colors.success + "30" : colors.border }]}
                >
                  <Text style={styles.levelEmoji}>{lvl.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={styles.levelCardHeader}>
                      <Text style={[styles.levelCardTitle, { color: colors.foreground }]}>
                        L{lvl.level} {lvl.label}
                      </Text>
                      {isCurrent && (
                        <LinearGradient colors={[lvl.color, lvl.color + "AA"]} style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>YOU ARE HERE</Text>
                        </LinearGradient>
                      )}
                      {isUnlocked && !isCurrent && (
                        <View style={[styles.unlockedBadge, { backgroundColor: colors.success + "20" }]}>
                          <Feather name="check" size={10} color={colors.success} />
                          <Text style={[styles.unlockedText, { color: colors.success }]}>Unlocked</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.levelBadgeName, { color: lvl.color }]}>{lvl.badge} Badge</Text>
                    <View style={styles.levelMeta}>
                      <Text style={[styles.levelMetaText, { color: colors.mutedForeground }]}><Image source={COIN_IMAGE} style={{ width: 16, height: 16 }} resizeMode="contain" />{(lvl.target / 100000).toFixed(1)}L coins/month
                      </Text>
                      <Text style={[styles.levelMetaText, { color: colors.success }]}>{lvl.earnings}</Text>
                    </View>
                  </View>
                </LinearGradient>
              );
            })}

            {/* ── COIN SPLIT BREAKDOWN ── */}
            <View style={[styles.splitCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.splitHeader}>
                <LinearGradient colors={["#E91E8C", "#7B2FBE"]} style={styles.splitHeaderIcon}>
                  <Feather name="pie-chart" size={16} color="#fff" />
                </LinearGradient>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                  <Text style={[styles.splitTitle, { color: colors.foreground }]}>How Every</Text>
                  <RidhiCoin size={16} />
                  <Text style={[styles.splitTitle, { color: colors.foreground }]}>100 Is Split</Text>
                </View>
              </View>
              <Text style={[styles.splitSubtitle, { color: colors.mutedForeground }]}>
                Your share grows with every level.
              </Text>

              {HOST_COIN_SPLIT.map((row) => {
                const isCur = row.level === CURRENT_LEVEL;
                return (
                  <View key={row.level}
                    style={[styles.splitRow, isCur && { backgroundColor: row.color + "12", borderRadius: 12, borderWidth: 1, borderColor: row.color + "40" }]}>
                    <Text style={styles.splitEmoji}>{row.emoji}</Text>
                    <Text style={[styles.splitBadge, { color: row.color, width: 76 }]}>{row.badge}</Text>

                    {/* HOST bar */}
                    <View style={{ flex: 1, gap: 3 }}>
                      <View style={styles.splitBarRow}>
                        <View style={[styles.splitBarFill, { width: `${row.hostPct}%` as any, backgroundColor: "#34C759" }]} />
                        <View style={[styles.splitBarFill, { width: `${row.ridhiPct}%` as any, backgroundColor: "#7B2FBE40" }]} />
                      </View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={[styles.splitPctLabel, { color: "#34C759" }]}>You {row.hostPct}%</Text>
                        <Text style={[styles.splitPctLabel, { color: "#7B2FBE" }]}>Ridhi {row.ridhiPct}%</Text>
                      </View>
                    </View>

                    {isCur && (
                      <View style={[styles.splitCurBadge, { backgroundColor: row.color }]}>
                        <Text style={styles.splitCurText}>YOU</Text>
                      </View>
                    )}
                  </View>
                );
              })}

            </View>

            {/* ── EXAMPLE CALCULATION ── */}
            <View style={[styles.exampleCard, { backgroundColor: "#FFB80010", borderColor: "#FFB80035" }]}>
              <Text style={[styles.exampleTitle, { color: colors.foreground }]}>💡 Example — Gold Host (L3)</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                <Text style={[styles.exampleSub, { color: colors.mutedForeground }]}>Fan sends</Text>
                <RidhiCoin size={13} />
                <Text style={[styles.exampleSub, { color: colors.mutedForeground }]}>1,000 as a gift during your live</Text>
              </View>
              <View style={{ gap: 8, marginTop: 10 }}>
                {[
                  { who: "You (Host)",        pct: "50%", amount: "500 → ₹400", color: "#34C759",  icon: "mic" },
                  { who: "Ridhi Platform",    pct: "50%", amount: "500 → ₹400", color: "#7B2FBE",  icon: "shield" },
                ].map(({ who, pct, amount, color, icon }) => (
                  <View key={who} style={styles.exampleRow}>
                    <View style={[styles.exampleIcon, { backgroundColor: color + "20" }]}>
                      <Feather name={icon as any} size={13} color={color} />
                    </View>
                    <Text style={[styles.exampleWho, { color: colors.foreground }]}>{who}</Text>
                    <Text style={[styles.examplePct, { color }]}>{pct}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                      <RidhiCoin size={12} />
                      <Text style={[styles.exampleAmt, { color: colors.mutedForeground }]}>{amount}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                <RidhiCoin size={13} />
                <Text style={[styles.exampleFooter, { color: colors.mutedForeground }]}>
                  1 Ridhi Coin = ₹0.80 withdrawal value
                </Text>
              </View>
            </View>

            {/* ── RIDHI'S BENEFIT ── */}
            <View style={[styles.ridhiBenefitCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.splitTitle, { color: colors.foreground }]}>📊 What Ridhi Earns</Text>
              <Text style={[styles.splitSubtitle, { color: colors.mutedForeground, marginBottom: 10 }]}>
                Ridhi's revenue keeps the platform free, funds technology, safety teams, and marketing that brings more fans to you.
              </Text>
              {[
                { label: "Platform cut (coins)",    desc: "30–60% of every coin spent on hosts",             color: "#7B2FBE", icon: "percent"   },
                { label: "Coin recharge margin",    desc: "₹0.20 per coin bought by users",                  color: "#E91E8C", icon: "credit-card" },
                { label: "VIP subscriptions",       desc: "₹49–₹6,999/mo from fans upgrading for perks",     color: "#FFB800", icon: "star"      },
                { label: "Creator Pass & Fan Clubs",desc: "Monthly plans from creators & fan club members",   color: "#34C759", icon: "users"     },
                { label: "Brand partnerships",      desc: "Brands buy coins to gift viral/top hosts",         color: "#00BCD4", icon: "briefcase" },
                { label: "Ad products",             desc: "Coin-based ad placement & brand partnership fees",  color: "#FF6B35", icon: "trending-up" },
              ].map(({ label, desc, color, icon }) => (
                <View key={label} style={styles.ridhiBenefitRow}>
                  <View style={[styles.ridhiBenefitIcon, { backgroundColor: color + "20" }]}>
                    <Feather name={icon as any} size={14} color={color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.ridhiBenefitLabel, { color: colors.foreground }]}>{label}</Text>
                    <Text style={[styles.ridhiBenefitDesc, { color: colors.mutedForeground }]}>{desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
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
  headerTitle: { flex: 1, fontSize: 18, fontFamily: "Inter_700Bold" },
  levelChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  levelChipEmoji: { fontSize: 14 },
  levelChipText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  tabBar: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 12, position: "relative", overflow: "hidden" },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  tabUnderline: { position: "absolute", bottom: 0, left: 16, right: 16, height: 2, borderRadius: 1 },
  profileCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 14 },
  profileCardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatarWrap: { position: "relative" },
  avatarBadge: {
    position: "absolute", bottom: -2, right: -2,
    width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#08080F",
  },
  avatarBadgeText: { fontSize: 12 },
  profileName: { fontSize: 18, fontFamily: "Inter_700Bold" },
  profileLevel: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginTop: 3 },
  profileEarnings: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  progressSection: { gap: 8 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 4 },
  progressLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  progressValue: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  progressBarBg: { height: 10, borderRadius: 5, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 5, overflow: "hidden" },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  kpiCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 7,
  },
  kpiIcon: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  kpiValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  kpiLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  giftsCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  giftsList: { gap: 0 },
  giftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  giftEmoji: { fontSize: 22 },
  giftName: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  giftCount: { fontSize: 13, fontFamily: "Inter_400Regular" },
  giftCoins: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  withdrawRow: { flexDirection: "row", gap: 10 },
  totalEarningsCard: { borderRadius: 18, borderWidth: 1, padding: 20, alignItems: "center", gap: 6 },
  totalLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  totalAmount: { fontSize: 36, fontFamily: "Inter_700Bold" },
  totalCoins: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  chartCard: { borderRadius: 18, borderWidth: 1, padding: 16 },
  chartBars: { flexDirection: "row", alignItems: "flex-end", gap: 4, justifyContent: "space-between", marginTop: 12 },
  barWrap: { flex: 1, alignItems: "center", gap: 5 },
  barBg: { width: "100%", height: 90, borderRadius: 5, overflow: "hidden", justifyContent: "flex-end" },
  barFill: { width: "100%", borderRadius: 5 },
  barLabel: { fontSize: 9, fontFamily: "Inter_500Medium" },
  earningRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  earningIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  earningSource: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  earningCoins: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  earningAmount: { fontSize: 16, fontFamily: "Inter_700Bold" },
  levelsSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  levelCard: { borderRadius: 16, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  // Coin split section
  splitCard:        { borderRadius: 18, borderWidth: 1, padding: 16, gap: 10 },
  splitHeader:      { flexDirection: "row", alignItems: "center", gap: 10 },
  splitHeaderIcon:  { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  splitTitle:       { fontSize: 15, fontFamily: "Inter_700Bold", flex: 1 },
  splitSubtitle:    { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  splitRow:         { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6, paddingHorizontal: 6 },
  splitEmoji:       { fontSize: 18, width: 24, textAlign: "center" },
  splitBadge:       { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  splitBarRow:      { flexDirection: "row", height: 10, borderRadius: 5, overflow: "hidden" },
  splitBarFill:     { height: "100%" },
  splitPctLabel:    { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  splitCurBadge:    { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  splitCurText:     { color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold" },
  splitAgentNote:   { flexDirection: "row", alignItems: "flex-start", gap: 7, borderRadius: 10, borderWidth: 1, padding: 10 },
  splitAgentNoteText: { flex: 1, fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },
  // Example calculation
  exampleCard:      { borderRadius: 16, borderWidth: 1, padding: 16 },
  exampleTitle:     { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 2 },
  exampleSub:       { fontSize: 12, fontFamily: "Inter_400Regular" },
  exampleRow:       { flexDirection: "row", alignItems: "center", gap: 8 },
  exampleIcon:      { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  exampleWho:       { flex: 1, fontSize: 13, fontFamily: "Inter_600SemiBold" },
  examplePct:       { fontSize: 13, fontFamily: "Inter_700Bold", width: 36, textAlign: "right" },
  exampleAmt:       { fontSize: 12, fontFamily: "Inter_400Regular", width: 110, textAlign: "right" },
  exampleFooter:    { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 8, textAlign: "center" },
  // Ridhi benefit section
  ridhiBenefitCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 10 },
  ridhiBenefitRow:  { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  ridhiBenefitIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  ridhiBenefitLabel:{ fontSize: 13, fontFamily: "Inter_600SemiBold" },
  ridhiBenefitDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  levelEmoji: { fontSize: 28 },
  levelCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" },
  levelCardTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  currentBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  currentBadgeText: { color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  unlockedBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  unlockedText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  levelBadgeName: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  levelMeta: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  levelMetaText: { fontSize: 12, fontFamily: "Inter_400Regular" },
});

const regStyles = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 28, gap: 16, alignItems: "center" },
  backBtn: { alignSelf: "flex-start", padding: 6, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", marginBottom: 8 },
  heroIcon: { width: 80, height: 80, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  heroTitle: { color: "#fff", fontSize: 28, fontFamily: "Inter_700Bold", textAlign: "center", letterSpacing: -0.5 },
  heroSub: { color: "rgba(255,255,255,0.82)", fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  earningsBand: { flexDirection: "row", gap: 0, backgroundColor: "rgba(0,0,0,0.18)", borderRadius: 16, overflow: "hidden", width: "100%" },
  earningsItem: { flex: 1, alignItems: "center", paddingVertical: 12, gap: 3 },
  earningsEmoji: { fontSize: 20 },
  earningsValue: { color: "#FFB800", fontSize: 13, fontFamily: "Inter_700Bold" },
  earningsLabel: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontFamily: "Inter_500Medium" },
  section: { marginHorizontal: 14, marginTop: 14, borderRadius: 18, borderWidth: 1, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  benefitRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  benefitIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  benefitText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  reqRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  reqDot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  reqText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: -4 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, fontFamily: "Inter_400Regular" },
  genderRow:   { flexDirection: "row", gap: 8 },
  genderChip:  { flex: 1, flexDirection: "column", alignItems: "center", gap: 4, borderRadius: 12, borderWidth: 1, paddingVertical: 11, paddingHorizontal: 4, position: "relative" },
  genderEmoji: { fontSize: 22 },
  genderLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  genderCheck: { position: "absolute", top: 6, right: 6, width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  agreeRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 4 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  agreeText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
  disclaimer: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 16, marginTop: 8, marginBottom: 8 },
  successOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 },
  successGrad: { flex: 1, minHeight: 500, alignItems: "center", justifyContent: "center", gap: 16, padding: 40 },
  successCheck: { width: 96, height: 96, borderRadius: 48, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  successTitle: { color: "#fff", fontSize: 26, fontFamily: "Inter_700Bold", textAlign: "center" },
  successSub: { color: "rgba(255,255,255,0.88)", fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  successSub2: { color: "rgba(255,255,255,0.55)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 8 },
});
