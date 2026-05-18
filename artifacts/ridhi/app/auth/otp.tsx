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
  const { contact, type } = useLocalSearchParams<{ contact: string; type: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState("");
  const [resendMsg, setResendMsg] = useState("");
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
      await apiFetch("/api/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ contact, type }),
      });
      setTimer(30);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      setResendMsg("OTP resent successfully");
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

        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputRefs.current[i] = ref; }}
              style={[
                styles.otpBox,
                {
                  backgroundColor: colors.muted,
                  borderColor: error
                    ? "#FF3B30"
                    : digit
                    ? colors.primary
                    : colors.border,
                  color: colors.foreground,
                },
              ]}
              value={digit}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              autoFocus={i === 0}
            />
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
    gap: 24,
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
  otpRow: { flexDirection: "row", gap: 10, marginVertical: 8 },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#FF3B30",
    textAlign: "center",
    marginTop: -12,
  },
  successText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    marginTop: -12,
  },
  resend: { paddingVertical: 4 },
  resendText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
