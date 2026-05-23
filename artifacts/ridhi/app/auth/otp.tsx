import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { GradientButton } from "@/components/GradientButton";
import { apiFetch, ApiError } from "@/utils/api";
import { FloatingEmojiBg } from "@/components/FloatingEmojiBg";

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const { contact, type, demoOtp: initialDemoOtp } = useLocalSearchParams<{
    contact: string;
    type: string;
    demoOtp?: string;
  }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | undefined>(initialDemoOtp);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = useCallback((text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    setError("");
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyPress = useCallback((key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setOtp((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
    }
  }, [otp]);

  /** Auto-fill the OTP boxes when user taps the demo banner */
  const handleAutoFill = useCallback(() => {
    if (!demoOtp || demoOtp.length !== 6) return;
    const digits = demoOtp.split("");
    setOtp(digits);
    setError("");
    inputRefs.current[5]?.focus();
  }, [demoOtp]);

  const isComplete = otp.every((d) => d !== "");

  const handleVerify = async () => {
    if (!isComplete) return;
    setLoading(true);
    setError("");
    try {
      await apiFetch("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ contact, type, otp: otp.join("") }),
      });
      router.replace("/auth/profile-setup");
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Verification failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resendLoading) return;
    setResendLoading(true);
    setResendMsg("");
    setError("");
    try {
      const resp = await apiFetch("/api/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ contact, type }),
      }) as { demo?: boolean; otp?: string };
      setTimer(30);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      // Update demo OTP if the server returned a new one
      if (resp?.demo && resp?.otp) {
        setDemoOtp(resp.otp);
        setResendMsg("New OTP generated");
      } else {
        setDemoOtp(undefined);
        setResendMsg("OTP resent successfully");
      }
      setTimeout(() => setResendMsg(""), 3000);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : "Failed to resend OTP.";
      setError(msg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FloatingEmojiBg preset="otp" />
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <LinearGradient colors={[colors.primary + "20", colors.secondary + "10"]} style={styles.iconBg}>
          <Feather name="shield" size={32} color={colors.primary} />
        </LinearGradient>

        <Text style={[styles.title, { color: colors.foreground }]}>Verify OTP</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          We've sent a 6-digit code to{"\n"}
          <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>{contact}</Text>
        </Text>

        {/* ── Demo OTP banner ─────────────────────────────────────────── */}
        {!!demoOtp && (
          <Pressable onPress={handleAutoFill} style={styles.demoBanner} accessibilityRole="button" accessibilityLabel="Tap to auto-fill OTP">
            <LinearGradient
              colors={["#7B2FBE22", "#E91E8C18"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <Feather name="info" size={15} color="#E91E8C" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.demoBannerTitle}>Test Mode — tap to auto-fill</Text>
              <Text style={styles.demoBannerCode}>{demoOtp}</Text>
            </View>
            <Feather name="chevron-right" size={16} color="#7B2FBE" />
          </Pressable>
        )}

        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <View
              key={i}
              style={[
                styles.otpCell,
                {
                  backgroundColor: error ? "#FF3B3010" : digit ? colors.primary + "15" : "rgba(255,255,255,0.08)",
                  borderColor: error
                    ? "#FF3B30"
                    : digit
                    ? colors.primary
                    : "rgba(255,255,255,0.35)",
                  borderWidth: error || digit ? 2 : 1.5,
                },
              ]}
            >
              <Text style={[styles.otpCellText, { color: digit ? colors.foreground : colors.mutedForeground + "CC" }]}>
                {digit || "\u2014"}
              </Text>
              <TextInput
                ref={(ref) => { inputRefs.current[i] = ref; }}
                style={StyleSheet.absoluteFill}
                value={digit}
                onChangeText={(t) => handleChange(t, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                autoFocus={i === 0}
                selectionColor={colors.primary}
                caretHidden
              />
            </View>
          ))}
        </View>

        {!!error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {!!resendMsg && (
          <Text style={[styles.successText, { color: colors.primary }]}>{resendMsg}</Text>
        )}

        <GradientButton
          label="Verify & Continue"
          onPress={handleVerify}
          loading={loading}
          disabled={!isComplete || loading}
          style={{ width: "100%" }}
        />

        <Pressable
          disabled={timer > 0 || resendLoading}
          style={styles.resend}
          onPress={handleResend}
        >
          {resendLoading ? (
            <Text style={[styles.resendText, { color: colors.mutedForeground }]}>Sending…</Text>
          ) : (
            <Text style={[styles.resendText, { color: timer > 0 ? colors.mutedForeground : colors.primary }]}>
              {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20 },
  backBtn: { padding: 8, alignSelf: "flex-start" },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: "center",
    gap: 20,
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  demoBanner: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#7B2FBE44",
    overflow: "hidden",
  },
  demoBannerTitle: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#E91E8C",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  demoBannerCode: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#EEEEF5",
    letterSpacing: 6,
  },
  otpRow: { flexDirection: "row", gap: 10, marginVertical: 4 },
  otpCell: {
    width: 48,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  otpCellText: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    lineHeight: 28,
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#FF3B30",
    textAlign: "center",
    marginTop: -8,
  },
  successText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    marginTop: -8,
  },
  resend: { paddingVertical: 4 },
  resendText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
