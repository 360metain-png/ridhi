import React, { useState } from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { GradientButton } from "@/components/GradientButton";
import { useAuth } from "@/contexts/AuthContext";

const LOGO = require("../../assets/images/ridhi_logo.png");
const { height } = Dimensions.get("window");

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [tab, setTab] = useState<"phone" | "email">("phone");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!value.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    router.push({ pathname: "/auth/otp", params: { contact: value, type: tab } });
  };

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider);
    await new Promise((r) => setTimeout(r, 1200));
    setSocialLoading(null);
    login({
      id: "social_" + Date.now(),
      name: provider === "google" ? "Google User" : provider === "apple" ? "Apple User" : "Facebook User",
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

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={[colors.primary + "15", colors.secondary + "08", "transparent"]}
        style={styles.topGlow}
      />

      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.logoCircle}>
          <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>Welcome to Ridhi</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          India's fastest growing social community
        </Text>

        <View style={[styles.tabRow, { backgroundColor: colors.muted }]}>
          <Pressable
            style={[styles.tabBtn, tab === "phone" && { backgroundColor: colors.surface }]}
            onPress={() => setTab("phone")}
          >
            <Feather name="smartphone" size={16} color={tab === "phone" ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.tabText, { color: tab === "phone" ? colors.primary : colors.mutedForeground }]}>
              Phone
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tabBtn, tab === "email" && { backgroundColor: colors.surface }]}
            onPress={() => setTab("email")}
          >
            <Feather name="mail" size={16} color={tab === "email" ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.tabText, { color: tab === "email" ? colors.primary : colors.mutedForeground }]}>
              Email
            </Text>
          </Pressable>
        </View>

        <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          {tab === "phone" && (
            <View style={[styles.countryCode, { borderRightColor: colors.border }]}>
              <Text style={[styles.countryText, { color: colors.foreground }]}>🇮🇳 +91</Text>
            </View>
          )}
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder={tab === "phone" ? "Enter mobile number" : "Enter email address"}
            placeholderTextColor={colors.mutedForeground}
            value={value}
            onChangeText={setValue}
            keyboardType={tab === "phone" ? "phone-pad" : "email-address"}
            autoCapitalize="none"
            autoFocus
          />
        </View>

        <GradientButton
          label="Get OTP"
          onPress={handleContinue}
          loading={loading}
          disabled={value.length < 6}
          style={{ width: "100%" }}
        />

        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>or continue with</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        <View style={styles.socialRow}>
          <Pressable
            onPress={() => handleSocialLogin("google")}
            style={[styles.socialBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            {socialLoading === "google" ? (
              <Feather name="loader" size={20} color={colors.mutedForeground} />
            ) : (
              <Text style={styles.socialIcon}>G</Text>
            )}
            <Text style={[styles.socialLabel, { color: colors.foreground }]}>Google</Text>
          </Pressable>

          <Pressable
            onPress={() => handleSocialLogin("apple")}
            style={[styles.socialBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            {socialLoading === "apple" ? (
              <Feather name="loader" size={20} color={colors.mutedForeground} />
            ) : (
              <Feather name="smartphone" size={20} color={colors.foreground} />
            )}
            <Text style={[styles.socialLabel, { color: colors.foreground }]}>Apple</Text>
          </Pressable>

          <Pressable
            onPress={() => handleSocialLogin("facebook")}
            style={[styles.socialBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            {socialLoading === "facebook" ? (
              <Feather name="loader" size={20} color={colors.mutedForeground} />
            ) : (
              <Text style={[styles.socialIcon, { color: "#1877F2" }]}>f</Text>
            )}
            <Text style={[styles.socialLabel, { color: colors.foreground }]}>Facebook</Text>
          </Pressable>
        </View>

        <Pressable onPress={handleGuestAccess} style={styles.guestBtn}>
          {socialLoading === "guest" ? (
            <Feather name="loader" size={16} color={colors.mutedForeground} />
          ) : (
            <Feather name="user" size={16} color={colors.mutedForeground} />
          )}
          <Text style={[styles.guestText, { color: colors.mutedForeground }]}>Continue as Guest</Text>
        </Pressable>

        <Text style={[styles.terms, { color: colors.mutedForeground }]}>
          By continuing, you agree to our{" "}
          <Text style={{ color: colors.primary }}>Terms of Service</Text> and{" "}
          <Text style={{ color: colors.primary }}>Privacy Policy</Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topGlow: { position: "absolute", top: 0, left: 0, right: 0, height: height * 0.4 },
  header: { paddingHorizontal: 20 },
  backBtn: { padding: 8, alignSelf: "flex-start" },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 14,
    alignItems: "center",
  },
  logoCircle: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: { width: 72, height: 72 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  tabRow: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    width: "100%",
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
  },
  tabText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: "hidden",
    width: "100%",
    height: 52,
  },
  countryCode: {
    paddingHorizontal: 14,
    height: "100%",
    justifyContent: "center",
    borderRightWidth: 1,
  },
  countryText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  input: { flex: 1, paddingHorizontal: 14, fontSize: 16, fontFamily: "Inter_400Regular" },
  dividerRow: { flexDirection: "row", alignItems: "center", width: "100%", gap: 10 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  socialRow: { flexDirection: "row", width: "100%", gap: 10 },
  socialBtn: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  socialIcon: { fontSize: 20, fontFamily: "Inter_700Bold" },
  socialLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  guestBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
  },
  guestText: { fontSize: 14, fontFamily: "Inter_400Regular", textDecorationLine: "underline" },
  terms: { fontSize: 11, textAlign: "center", lineHeight: 16, fontFamily: "Inter_400Regular" },
});
