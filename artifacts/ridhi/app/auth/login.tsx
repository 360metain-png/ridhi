import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientButton } from "@/components/GradientButton";
import { useAuth } from "@/contexts/AuthContext";
import { sendFirebaseOtp, storeFirebaseConfirmation, isFirebaseReady } from "@/lib/firebaseAuth";
import { apiFetch, ApiError } from "@/utils/api";
import * as AppleAuthentication from "expo-apple-authentication";

const LOGO = require("../../assets/images/ridhi_logo.png");

const BG       = "#08080F";
const BORDER   = "rgba(255,255,255,0.08)";
const TEXT     = "#EEEEF5";
const MUTED    = "#55556A";
const PRIMARY  = "#E91E8C";
const SECONDARY = "#7B2FBE";
const INPUT_BG = "#141424";

/* ── Floating hearts (same engine as onboarding) ─────────────────── */
const FLOAT_ITEMS = [
  { emoji: "❤️",  x: 0.06, size: 22, dur: 7200, delay: 0,    spin: 12  },
  { emoji: "💕",  x: 0.20, size: 16, dur: 9000, delay: 700,  spin: -8  },
  { emoji: "💗",  x: 0.38, size: 26, dur: 6800, delay: 1500, spin: 18  },
  { emoji: "💖",  x: 0.58, size: 15, dur: 8500, delay: 300,  spin: -22 },
  { emoji: "💓",  x: 0.76, size: 20, dur: 7800, delay: 2000, spin: 10  },
  { emoji: "💝",  x: 0.90, size: 18, dur: 9500, delay: 1100, spin: -6  },
  { emoji: "💞",  x: 0.14, size: 13, dur: 8200, delay: 2900, spin: 28  },
  { emoji: "✨",  x: 0.48, size: 18, dur: 7000, delay: 450,  spin: -15 },
  { emoji: "💫",  x: 0.68, size: 16, dur: 8800, delay: 3300, spin: 14  },
  { emoji: "🌸",  x: 0.30, size: 18, dur: 9200, delay: 2600, spin: 20  },
  { emoji: "💜",  x: 0.84, size: 22, dur: 7500, delay: 4000, spin: -28 },
  { emoji: "🧡",  x: 0.50, size: 14, dur: 8000, delay: 1800, spin: 16  },
];

function FloatingHeart({
  emoji, x, size, dur, delay, spin, screenWidth, screenHeight,
}: {
  emoji: string; x: number; size: number; dur: number; delay: number; spin: number;
  screenWidth: number; screenHeight: number;
}) {
  const anim   = useRef(new Animated.Value(0)).current;
  const wiggle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.loop(
        Animated.timing(anim, { toValue: 1, duration: dur, easing: Easing.linear, useNativeDriver: true })
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(wiggle, { toValue: 1,  duration: dur * 0.4, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(wiggle, { toValue: -1, duration: dur * 0.4, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(wiggle, { toValue: 0,  duration: dur * 0.2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [screenHeight + size, -size * 2] });
  const translateX = wiggle.interpolate({ inputRange: [-1, 0, 1], outputRange: [-14, 0, 14] });
  const opacity    = anim.interpolate({ inputRange: [0, 0.07, 0.88, 1], outputRange: [0, 0.6, 0.6, 0] });
  const rotate     = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${spin}deg`] });
  const scale      = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.7, 1.1, 0.7] });

  return (
    <Animated.Text
      style={{
        position: "absolute",
        left: x * screenWidth,
        fontSize: size,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate }, { scale }],
        pointerEvents: "none",
      } as object}
      selectable={false}
    >
      {emoji}
    </Animated.Text>
  );
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { login } = useAuth();

  const [tab,          setTab]          = useState<"phone" | "email">("phone");
  const [value,        setValue]        = useState("");
  const [inputError,   setInputError]   = useState("");
  const [loading,      setLoading]      = useState(false);
  const [socialLoading,setSocialLoading]= useState<string | null>(null);
  const [focused,      setFocused]      = useState(false);

  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(contentAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
  }, []);

  /* ── Android back — go to onboarding instead of crashing ───────── */
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      router.replace("/auth/onboarding");
      return true; // consumed
    });
    return () => sub.remove();
  }, []);

  const validate = (): boolean => {
    const v = value.trim();
    if (!v) {
      setInputError(tab === "phone" ? "Please enter your phone number" : "Please enter your email");
      return false;
    }
    if (tab === "phone") {
      const digits = v.replace(/\D/g, "");
      if (digits.length < 10) {
        setInputError("Enter a valid 10-digit mobile number");
        return false;
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        setInputError("Enter a valid email address");
        return false;
      }
    }
    setInputError("");
    return true;
  };

  const handleContinue = useCallback(async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { apiFetch } = await import("@/utils/api");

      // 1. Ask backend which OTP provider is active
      const providerResp = await apiFetch("/api/auth/otp-provider") as { provider: string };

      // 2. If Firebase is active and Firebase is ready client-side
      if (providerResp.provider === "firebase" && isFirebaseReady() && tab === "phone") {
        const phone = "+91" + value.trim().replace(/\D/g, "");
        const fbResult = await sendFirebaseOtp(phone);
        if (!fbResult.ok) {
          setInputError(fbResult.error || "Failed to send OTP via Firebase");
          return;
        }
        storeFirebaseConfirmation(fbResult.confirmationResult);
        router.push({
          pathname: "/auth/otp",
          params: { contact: value.trim(), type: tab, provider: "firebase" },
        });
        return;
      }

      // 3. MSG91 / demo / auto fallback flow
      await apiFetch("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ contact: value.trim(), type: tab }),
      });
      router.push({ pathname: "/auth/otp", params: { contact: value.trim(), type: tab } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send OTP. Please try again.";
      setInputError(msg);
    } finally {
      setLoading(false);
    }
  }, [value, tab]);

  const handleSocialLogin = useCallback(async (provider: string) => {
    setSocialLoading(provider);
    try {
      if (provider === "apple" && Platform.OS === "ios") {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });
        const name = credential.fullName?.givenName
          ? `${credential.fullName.givenName} ${credential.fullName.familyName || ""}`.trim()
          : "Ridhi User";
        const id = credential.user;
        const email = credential.email || `${credential.user}@ridhi.app`;
        const resp = await apiFetch<{ success: boolean; token?: string; userId?: string }>("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ id, name, email }),
        });
        login({
          id,
          name,
          phone: "",
          email,
          avatar: "",
          city: "Mumbai",
          age: 25,
          gender: "other",
          interests: [],
          coins: 100,
          followers: 0,
          following: 0,
          posts: 0,
        }, resp.token);
        router.replace("/(tabs)");
        return;
      }
      // Google / Facebook / other — mock fallback for now
      await new Promise((r) => setTimeout(r, 1000));
      const id = "social_" + Date.now();
      const name = provider === "google" ? "Rahul Sharma" : "Arjun Kumar";
      const email = provider + "@ridhi.app";
      const resp = await apiFetch<{ success: boolean; token?: string; userId?: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ id, name, email }),
      });
      login({
        id,
        name,
        phone: "", email, avatar: "",
        city: "Mumbai", age: 25, gender: "other", interests: [],
        coins: 100, followers: 0, following: 0, posts: 0,
      }, resp.token);
      router.replace("/(tabs)");
    } catch (err: any) {
      if (err.code === "ERR_REQUEST_CANCELED") {
        // User cancelled — do nothing
      } else {
        setInputError("Apple Sign-In failed. Please try again.");
      }
    } finally {
      setSocialLoading(null);
    }
  }, [login]);

  const handleGuestAccess = useCallback(async () => {
    setSocialLoading("guest");
    await new Promise((r) => setTimeout(r, 600));
    setSocialLoading(null);
    const id = "guest_" + Date.now();
    const resp = await apiFetch<{ success: boolean; token?: string; userId?: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ id, name: "Guest User", email: "guest@ridhi.app" }),
    });
    login({
      id,
      name: "Guest User", phone: "", email: "guest@ridhi.app", avatar: "",
      city: "India", age: 18, gender: "other", interests: [],
      coins: 20, followers: 0, following: 0, posts: 0,
    }, resp.token);
    router.replace("/(tabs)");
  }, [login]);

  const handleTabPhone = useCallback(() => { setTab("phone"); setValue(""); setInputError(""); }, []);
  const handleTabEmail = useCallback(() => { setTab("email"); setValue(""); setInputError(""); }, []);
  const handleChangeText = useCallback((v: string) => { setValue(v); if (inputError) setInputError(""); }, [inputError]);
  const handleFocus = useCallback(() => setFocused(true),  []);
  const handleBlur  = useCallback(() => setFocused(false), []);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: BG }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* ── Dark gradient base ── */}
      <LinearGradient colors={[BG, "#0C0618", BG]} style={StyleSheet.absoluteFill} />

      {/* ── Floating hearts background ── */}
      {FLOAT_ITEMS.map((item, i) => (
        <FloatingHeart
          key={i}
          emoji={item.emoji}
          x={item.x}
          size={item.size}
          dur={item.dur}
          delay={item.delay}
          spin={item.spin}
          screenWidth={width}
          screenHeight={height}
        />
      ))}

      {/* ── Back button (goes to onboarding) ── */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          onPress={() => router.replace("/auth/onboarding")}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Go back to onboarding"
        >
          <Feather name="arrow-left" size={22} color={TEXT} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: contentAnim,
              transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}
        >
          {/* Logo */}
          <View style={styles.logoWrap}>
            <LinearGradient colors={[PRIMARY + "25", SECONDARY + "15"]} style={styles.logoGlowRing} />
            <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
          </View>

          <View style={styles.titleGroup}>
            <Text style={styles.title}>Welcome to Ridhi</Text>
            <Text style={styles.subtitle}>India's Social Universe</Text>
          </View>

          {/* Phone / Email toggle */}
          <View style={[styles.tabRow, { backgroundColor: INPUT_BG }]}>
            <Pressable
              style={[styles.tabBtn, tab === "phone" && styles.tabBtnActive]}
              onPress={handleTabPhone}
              accessibilityRole="tab"
              accessibilityLabel="Phone login"
              accessibilityState={{ selected: tab === "phone" }}
            >
              {tab === "phone" && (
                <LinearGradient colors={[PRIMARY + "20", SECONDARY + "15"]} style={StyleSheet.absoluteFill} />
              )}
              <Feather name="smartphone" size={15} color={tab === "phone" ? PRIMARY : MUTED} />
              <Text style={[styles.tabText, { color: tab === "phone" ? PRIMARY : MUTED }]}>Phone</Text>
            </Pressable>
            <Pressable
              style={[styles.tabBtn, tab === "email" && styles.tabBtnActive]}
              onPress={handleTabEmail}
              accessibilityRole="tab"
              accessibilityLabel="Email login"
              accessibilityState={{ selected: tab === "email" }}
            >
              {tab === "email" && (
                <LinearGradient colors={[PRIMARY + "20", SECONDARY + "15"]} style={StyleSheet.absoluteFill} />
              )}
              <Feather name="mail" size={15} color={tab === "email" ? PRIMARY : MUTED} />
              <Text style={[styles.tabText, { color: tab === "email" ? PRIMARY : MUTED }]}>Email</Text>
            </Pressable>
          </View>

          {/* Input */}
          <View
            style={[
              styles.inputWrap,
              focused && {
                borderColor: PRIMARY + "60",
                ...(Platform.OS === "web"
                  ? { boxShadow: `0 0 10px ${PRIMARY}40` }
                  : { shadowColor: PRIMARY, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 10 }),
              },
            ]}
          >
            {tab === "phone" && (
              <View style={[styles.countryCode, { borderRightColor: BORDER }]}>
                <Text style={styles.countryText}>🇮🇳 +91</Text>
              </View>
            )}
            <TextInput
              style={styles.input}
              placeholder={tab === "phone" ? "Enter mobile number" : "Enter email address"}
              placeholderTextColor={MUTED}
              value={value}
              onChangeText={handleChangeText}
              keyboardType={tab === "phone" ? "phone-pad" : "email-address"}
              autoCapitalize="none"
              onFocus={handleFocus}
              onBlur={handleBlur}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              accessibilityLabel={tab === "phone" ? "Mobile number" : "Email address"}
            />
          </View>
          {!!inputError && (
            <Text style={styles.errorText}>{inputError}</Text>
          )}

          <GradientButton
            label="Get OTP →"
            onPress={handleContinue}
            loading={loading}
            disabled={value.length < 6}
            style={{ width: "100%" }}
          />

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social buttons */}
          <View style={styles.socialRow}>
            {([
              { id: "google",   label: "Google",   letter: "G", color: "#FFFFFF" },
              { id: "apple",    label: "Apple",     letter: "",  color: "#FFFFFF", icon: "smartphone" as const },
              { id: "facebook", label: "Facebook",  letter: "f", color: "#1877F2" },
            ] as Array<{ id: string; label: string; letter: string; color: string; icon?: React.ComponentProps<typeof Feather>["name"] }>).map(({ id, label, icon, letter, color }) => (
              <Pressable
                key={id}
                onPress={() => handleSocialLogin(id)}
                style={({ pressed }) => [styles.socialBtn, pressed && { opacity: 0.7 }]}
                accessibilityRole="button"
                accessibilityLabel={`Continue with ${label}`}
              >
                <LinearGradient
                  colors={["#141424", "#1A1A2E"]}
                  style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
                />
                {socialLoading === id ? (
                  <Feather name="loader" size={20} color={MUTED} />
                ) : icon ? (
                  <Feather name={icon} size={20} color={color} />
                ) : (
                  <Text style={[styles.socialLetter, { color }]}>{letter}</Text>
                )}
                <Text style={styles.socialLabel}>{label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Guest */}
          <Pressable
            onPress={handleGuestAccess}
            style={styles.guestBtn}
            accessibilityRole="button"
            accessibilityLabel="Continue as Guest"
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.04)", "rgba(255,255,255,0.06)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            {socialLoading === "guest" ? (
              <Feather name="loader" size={16} color={MUTED} />
            ) : (
              <Feather name="user" size={16} color={MUTED} />
            )}
            <Text style={styles.guestText}>Continue as Guest</Text>
          </Pressable>

          <Text style={styles.terms}>
            By continuing, you agree to our{" "}
            <Text style={{ color: PRIMARY }}>Terms of Service</Text> and{" "}
            <Text style={{ color: PRIMARY }}>Privacy Policy</Text>
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  header:       { paddingHorizontal: 20, paddingBottom: 4 },
  backBtn:      { padding: 8, alignSelf: "flex-start" },
  scrollContent:{ flexGrow: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 16,
    alignItems: "center",
  },
  logoWrap: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  logoGlowRing: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  logoImage: { width: 68, height: 68 },
  titleGroup: { alignItems: "center", gap: 6 },
  title:    { fontSize: 26, fontFamily: "Inter_700Bold",    color: TEXT,  letterSpacing: -0.6 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: MUTED, textAlign: "center" },
  tabRow: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
    width: "100%",
    borderWidth: 1,
    borderColor: BORDER,
    overflow: "hidden",
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
    minHeight: 44,
  },
  tabBtnActive: {
    borderWidth: 1,
    borderColor: PRIMARY + "30",
  },
  tabText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: INPUT_BG,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    overflow: "hidden",
    width: "100%",
    height: 54,
  },
  countryCode: {
    paddingHorizontal: 14,
    height: "100%",
    justifyContent: "center",
    borderRightWidth: 1,
  },
  countryText: { fontSize: 15, fontFamily: "Inter_500Medium", color: TEXT },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: TEXT,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#FF3B30",
    alignSelf: "flex-start",
    marginTop: -4,
    marginBottom: 4,
  },
  dividerRow:  { flexDirection: "row", alignItems: "center", width: "100%", gap: 10 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: BORDER },
  dividerText: { fontSize: 12, fontFamily: "Inter_400Regular", color: MUTED },
  socialRow:   { flexDirection: "row", width: "100%", gap: 10 },
  socialBtn: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    gap: 5,
    overflow: "hidden",
    position: "relative",
    minHeight: 70,
  },
  socialLetter: { fontSize: 20, fontFamily: "Inter_700Bold" },
  socialLabel:  { fontSize: 12, fontFamily: "Inter_500Medium", color: TEXT },
  guestBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    width: "100%",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    minHeight: 50,
  },
  guestText: { fontSize: 14, fontFamily: "Inter_500Medium", color: MUTED },
  terms: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    fontFamily: "Inter_400Regular",
    color: MUTED,
    paddingHorizontal: 8,
  },
});
