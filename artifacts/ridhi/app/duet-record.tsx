import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors"
import { useTrackScreen } from "@/hooks/useAnalytics";
;
import { useAuth } from "@/contexts/AuthContext";

const { width, height } = Dimensions.get("window");

export default function DuetRecordScreen() {
  useTrackScreen("duet");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ reelId: string; reelTitle: string; reelUser: string }>();
  const [recording, setRecording] = useState(false);
  const [side, setSide] = useState<"left" | "right">("right");
  const [countdown, setCountdown] = useState(0);

  const topPad = insets.top + 8;

  const startRecording = () => {
    setCountdown(3);
    let c = 3;
    const timer = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(timer);
        setRecording(true);
        setCountdown(0);
        // Simulate recording for 5 seconds
        setTimeout(() => setRecording(false), 5000);
      }
    }, 1000);
  };

  const cancel = () => {
    setRecording(false);
    setCountdown(0);
  };

  const submitDuet = () => {
    router.push({
      pathname: "/create-post",
      params: {
        type: "reel",
        duetWith: params.reelId,
        duetTitle: params.reelTitle,
        duetUser: params.reelUser,
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={[colors.primary + "15", colors.background]} style={{ paddingTop: topPad }}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: 16 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="x" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>
            <Text style={{ color: colors.primary }}>🎙️</Text> Duet
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Info card */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 16, marginBottom: 12 }]}>
          <Feather name="users" size={20} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.infoTitle, { color: colors.foreground }]} numberOfLines={1}>
              Original: {params.reelTitle || "Reel"}
            </Text>
            <Text style={[styles.infoSub, { color: colors.mutedForeground }]}>
              by {params.reelUser || "Unknown"}
            </Text>
          </View>
          <View style={[styles.duetBadge, { backgroundColor: colors.primary + "15" }]}>
            <Text style={{ fontSize: 12, color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Duet</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Split screen preview */}
      <View style={styles.splitScreen}>
        {/* Left: Original video placeholder */}
        <View style={[styles.halfScreen, { backgroundColor: colors.card + "80" }]}>
          <LinearGradient colors={["#FF6B35", "#E91E8C"]} style={[styles.halfScreen, { opacity: 0.3 }]}>
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Feather name="film" size={40} color="#fff" />
              <Text style={{ fontSize: 12, color: "#fff", fontFamily: "Inter_600SemiBold", marginTop: 8 }}>
                Original
              </Text>
              <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular", marginTop: 2 }}>
                {params.reelUser || "Creator"}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: "#fff" }]}>
          <View style={[styles.dividerBadge, { backgroundColor: colors.primary }]}>
            <Text style={{ fontSize: 10, color: "#fff", fontFamily: "Inter_700Bold" }}>VS</Text>
          </View>
        </View>

        {/* Right: User camera placeholder */}
        <View style={[styles.halfScreen, { backgroundColor: colors.card + "80" }]}>
          <LinearGradient colors={[colors.primary + "30", colors.secondary + "20"]} style={[styles.halfScreen, { opacity: 0.5 }]}>
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Feather name="camera" size={40} color={colors.primary} />
              <Text style={{ fontSize: 12, color: colors.foreground, fontFamily: "Inter_600SemiBold", marginTop: 8 }}>
                You
              </Text>
              <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 }}>
                Side-by-side duet
              </Text>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Layout options */}
      <View style={[styles.layoutBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_500Medium" }}>Layout:</Text>
        {(["left", "right"] as const).map((s) => (
          <Pressable
            key={s}
            onPress={() => setSide(s)}
            style={[styles.layoutBtn, { backgroundColor: side === s ? colors.primary : colors.background, borderColor: side === s ? colors.primary : colors.border }]}
          >
            <Text style={{ fontSize: 12, color: side === s ? "#fff" : colors.foreground, fontFamily: "Inter_500Medium" }}>
              {s === "left" ? "You on Left" : "You on Right"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Bottom controls */}
      <View style={[styles.bottomControls, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
        {countdown > 0 ? (
          <View style={{ alignItems: "center" }}>
            <Text style={[styles.countdown, { color: colors.primary }]}>{countdown}</Text>
            <Text style={{ fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Recording starts in...</Text>
          </View>
        ) : recording ? (
          <View style={{ alignItems: "center" }}>
            <View style={[styles.recordingPulse, { backgroundColor: colors.destructive + "20" }]}>
              <View style={[styles.recordingDot, { backgroundColor: colors.destructive }]} />
              <Text style={{ fontSize: 16, color: colors.destructive, fontFamily: "Inter_600SemiBold", marginLeft: 8 }}>Recording...</Text>
            </View>
            <Pressable onPress={cancel} style={[styles.cancelBtn, { borderColor: colors.border }]}>
              <Text style={{ fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_500Medium" }}>Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ alignItems: "center" }}>
            <Pressable onPress={startRecording} style={[styles.recordBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="mic" size={28} color="#fff" />
            </Pressable>
            <Text style={{ fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 12 }}>
              Tap to record duet
            </Text>
            <Pressable onPress={submitDuet} style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 14, color: colors.primary, fontFamily: "Inter_600SemiBold" }}>
                Skip to post creation →
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  infoCard: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 14, borderWidth: 1 },
  infoTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  infoSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  duetBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  splitScreen: { flexDirection: "row", height: height * 0.4, marginHorizontal: 16, borderRadius: 16, overflow: "hidden" },
  halfScreen: { flex: 1, alignItems: "center", justifyContent: "center" },
  divider: { width: 2, alignItems: "center", justifyContent: "center" },
  dividerBadge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  layoutBar: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, marginTop: 12, padding: 10, borderRadius: 12, borderWidth: 1 },
  layoutBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  bottomControls: { flex: 1, alignItems: "center", justifyContent: "center" },
  recordBtn: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  countdown: { fontSize: 64, fontFamily: "Inter_700Bold" },
  recordingPulse: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  recordingDot: { width: 12, height: 12, borderRadius: 6 },
  cancelBtn: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
});
