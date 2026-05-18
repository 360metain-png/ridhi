import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
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
import { verifyOtp, resendOtp } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const OTP_LENGTH = 6;

export default function OtpScreen() {
  const { contact, type } = useLocalSearchParams<{ contact: string; type: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(30);
  const [channel, setChannel] = useState<"sms" | "whatsapp" | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  const isComplete = otp.every((d) => d !== "");

  const handleVerify = async () => {
    if (!contact) return;
    setError("");
    setLoading(true);
    try {
      const code = otp.join("");
      const result = await verifyOtp(contact, code);
      await login({
        id: result.userId ?? `user_${Date.now()}`,
        phone: result.phone ?? contact,
      });
      router.replace("/auth/profile-setup");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Verification failed. Please try again.";
      setError(msg);
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!contact || timer > 0) return;
    setError("");
    try {
      const result = await resendOtp(contact);
      setChannel(result.channel ?? null);
      setTimer(60);
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not resend OTP.";
      Alert.alert("Error", msg);
    }
  };

  const channelLabel = channel === "whatsapp" ? "WhatsApp" : channel === "sms" ? "SMS" : type === "phone" ? "WhatsApp / SMS" : "email";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          {`We've sent a 6-digit code via ${channelLabel} to`}{"\n"}
          <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
            {type === "phone" ? `+91 ${contact}` : contact}
          </Text>
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
                  borderColor: error ? "#FF3B30" : digit ? colors.primary : colors.border,
                  color: colors.foreground,
                },
              ]}
              value={digit}
              onChangeText={(t) => { handleChange(t, i); if (error) setError(""); }}
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

        <GradientButton
          label="Verify & Continue"
          onPress={handleVerify}
          loading={loading}
          disabled={!isComplete}
          style={{ width: "100%" }}
        />

        <Pressable
          disabled={timer > 0}
          style={styles.resend}
          onPress={handleResend}
        >
          <Text style={[styles.resendText, { color: timer > 0 ? colors.mutedForeground : colors.primary }]}>
            {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
          </Text>
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
  resend: { paddingVertical: 4 },
  resendText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#FF3B30",
    textAlign: "center",
    marginTop: -8,
  },
});
