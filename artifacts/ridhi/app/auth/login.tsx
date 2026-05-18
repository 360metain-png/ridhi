import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GradientButton } from "@/components/GradientButton";
import { useAuth } from "@/contexts/AuthContext";
import { sendOtp } from "@/services/api";

const LOGO = require("../../assets/images/ridhi_logo.png");
const { width, height } = Dimensions.get("window");

const BG = "#08080F";
const CARD = "#0F0F1C";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#EEEEF5";
const MUTED = "#55556A";
const PRIMARY = "#E91E8C";
const SECONDARY = "#7B2FBE";
const INPUT_BG = "#141424";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [tab, setTab] = useState<"phone" | "email">("phone");
  const [value, setValue] = useState("");
  const [inputError, setInputError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const contentAnim = useRef(new Animated.Value(0)).current;
  const orbAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(orbAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
          Animated.timing(orbAnim, { toValue: 0, duration: 4000, useNativeDriver: true }),
        ])
      ),
    ]).start();
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

  const handleContinue = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const contact = tab === "phone"
        ? value.trim().replace(/\D/g, "")
        : value.trim();
      await sendOtp(contact, tab);
      router.push({ pathname: "/auth/otp", params: { contact, type: tab } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send OTP. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider);
    await new Promise((r) => setTimeout(r, 1000));
    setSocialLoading(null);
    login({
      id: "social_" + Date.now(),
      name: provider === "google" ? "Rahul Sharma" : provider === "apple" ? "Priya Singh" : "Arjun Kumar",
      phone: "",
      email: provider + "@ridhi.app",
      avatar: "",
      city: "Mumbai",
      age: 25,
      gender: "other",
      interests: [],
      coins: 100,
      followers: 0,
      following: 0,
      posts: 0,
    });
    router.replace("/(tabs)");
  };

  const handleGuestAccess = async () => {
    setSocialLoading("guest");
    await new Promise((r) => setTimeout(r, 600));
    setSocialLoading(null);
    login({
      id: "guest_" + Date.now(),
      name: "Guest User",
      phone: "",
      email: "guest@ridhi.app",
      avatar: "",
      city: "India",
      age: 18,
      gender: "other",
      interests: [],
      coins: 20,
      followers: 0,
      following: 0,
      posts: 0,
    });
    router.replace("/(tabs)");
  };

  const orbTranslate = orbAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const orbOpacity = orbAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.18, 0.28, 0.18] });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient colors={[BG, "#0C0C18", BG]} style={StyleSheet.absoluteFill} />

      <Animated.View style={[styles.orb1, { opacity: orbOpacity, transform: [{ translateY: orbTranslate }] }]} />
      <Animated.View style={[styles.orb2, { opacity: orbOpacity, transform: [{ translateY: orbTranslate }] }]} />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
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
          <View style={styles.logoWrap}>
            <LinearGradient
              colors={[PRIMARY + "25", SECONDARY + "15"]}
              style={styles.logoGlowRing}
            />
            <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
          </View>

          <View style={styles.titleGroup}>
            <Text style={styles.title}>Welcome to Ridhi</Text>
            <Text style={styles.subtitle}>India's fastest growing social community</Text>
          </View>

          <View style={[styles.tabRow, { backgroundColor: "#141424" }]}>
            <Pressable
              style={[styles.tabBtn, tab === "phone" && styles.tabBtnActive]}
              onPress={() => { setTab("phone"); setValue(""); setInputError(""); }}
            >
              {tab === "phone" && (
                <LinearGradient colors={[PRIMARY + "20", SECONDARY + "15"]} style={StyleSheet.absoluteFill} />
              )}
              <Feather name="smartphone" size={15} color={tab === "phone" ? PRIMARY : MUTED} />
              <Text style={[styles.tabText, { color: tab === "phone" ? PRIMARY : MUTED }]}>Phone</Text>
            </Pressable>
            <Pressable
              style={[styles.tabBtn, tab === "email" && styles.tabBtnActive]}
              onPress={() => { setTab("email"); setValue(""); setInputError(""); }}
            >
              {tab === "email" && (
                <LinearGradient colors={[PRIMARY + "20", SECONDARY + "15"]} style={StyleSheet.absoluteFill} />
              )}
              <Feather name="mail" size={15} color={tab === "email" ? PRIMARY : MUTED} />
              <Text style={[styles.tabText, { color: tab === "email" ? PRIMARY : MUTED }]}>Email</Text>
            </Pressable>
          </View>

          <View style={[styles.inputWrap, focused && styles.inputFocused]}>
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
              onChangeText={(v) => { setValue(v); if (inputError) setInputError(""); }}
              keyboardType={tab === "phone" ? "phone-pad" : "email-address"}
              autoCapitalize="none"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
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

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            {[
              { id: "google", label: "Google", icon: null, letter: "G", color: "#FFFFFF" },
              { id: "apple", label: "Apple", icon: "smartphone" as const, letter: null, color: "#FFFFFF" },
              { id: "facebook", label: "Facebook", icon: null, letter: "f", color: "#1877F2" },
            ].map(({ id, label, icon, letter, color }) => (
              <Pressable
                key={id}
                onPress={() => handleSocialLogin(id)}
                style={({ pressed }) => [styles.socialBtn, pressed && { opacity: 0.7 }]}
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

          <Pressable onPress={handleGuestAccess} style={styles.guestBtn}>
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
  container: { flex: 1, backgroundColor: BG },
  orb1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: PRIMARY,
    top: -80,
    left: -80,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 80,
  },
  orb2: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: SECONDARY,
    bottom: height * 0.15,
    right: -60,
    shadowColor: SECONDARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
  },
  header: { paddingHorizontal: 20, paddingBottom: 4 },
  backBtn: { padding: 8, alignSelf: "flex-start" },
  scrollContent: { flexGrow: 1 },
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
  title: { fontSize: 26, fontFamily: "Inter_700Bold", color: TEXT, letterSpacing: -0.6 },
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
  inputFocused: {
    borderColor: PRIMARY + "60",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  countryCode: {
    paddingHorizontal: 14,
    height: "100%",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  countryText: { fontSize: 15, fontFamily: "Inter_500Medium", color: TEXT },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: TEXT,
  },
  errorText: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#FF3B30", alignSelf: "flex-start", marginTop: -4, marginBottom: 4 },
  dividerRow: { flexDirection: "row", alignItems: "center", width: "100%", gap: 10 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: BORDER },
  dividerText: { fontSize: 12, fontFamily: "Inter_400Regular", color: MUTED },
  socialRow: { flexDirection: "row", width: "100%", gap: 10 },
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
  },
  socialLetter: { fontSize: 20, fontFamily: "Inter_700Bold" },
  socialLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: TEXT },
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
