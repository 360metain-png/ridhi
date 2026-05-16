import React, { useState } from "react";
import {
  Dimensions,
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

const { height } = Dimensions.get("window");

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"phone" | "email">("phone");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!value.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    router.push({ pathname: "/auth/otp", params: { contact: value, type: tab } });
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
        <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.logoCircle}>
          <Text style={styles.logoText}>R</Text>
        </LinearGradient>
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
    paddingTop: 20,
    gap: 20,
    alignItems: "center",
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E91E8C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  logoText: { fontSize: 36, fontFamily: "Inter_700Bold", color: "#fff" },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center" },
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
    height: 56,
  },
  countryCode: {
    paddingHorizontal: 14,
    height: "100%",
    justifyContent: "center",
    borderRightWidth: 1,
  },
  countryText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  input: { flex: 1, paddingHorizontal: 14, fontSize: 16, fontFamily: "Inter_400Regular" },
  terms: { fontSize: 12, textAlign: "center", lineHeight: 18, fontFamily: "Inter_400Regular" },
});
