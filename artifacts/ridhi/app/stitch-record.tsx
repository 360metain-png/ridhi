import React, { useState } from "react";
import {
  Dimensions,
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
import { useColors } from "@/hooks/useColors";

const { width, height } = Dimensions.get("window");

const TRIM_OPTIONS = [
  { id: "5s", label: "5 sec", desc: "Quick hook" },
  { id: "10s", label: "10 sec", desc: "Best part" },
  { id: "15s", label: "15 sec", desc: "Full intro" },
  { id: "custom", label: "Custom", desc: "Pick range" },
] as const;

export default function StitchRecordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ reelId: string; reelTitle: string; reelUser: string }>();
  const [selectedTrim, setSelectedTrim] = useState<string>("10s");
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [step, setStep] = useState<"trim" | "record">("trim");

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
        setTimeout(() => {
          setRecording(false);
          setStep("record");
        }, 5000);
      }
    }, 1000);
  };

  const submitStitch = () => {
    router.push({
      pathname: "/create-post",
      params: {
        type: "reel",
        stitchWith: params.reelId,
        stitchTitle: params.reelTitle,
        stitchUser: params.reelUser,
        stitchTrim: selectedTrim,
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={[colors.secondary + "15", colors.background]} style={{ paddingTop: topPad }}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: 16 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="x" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>
            <Text style={{ color: colors.secondary }}>🪟</Text> Stitch
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 16, marginBottom: 12 }]}>
          <Feather name="git-merge" size={20} color={colors.secondary} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.infoTitle, { color: colors.foreground }]} numberOfLines={1}>
              Original: {params.reelTitle || "Reel"}
            </Text>
            <Text style={[styles.infoSub, { color: colors.mutedForeground }]}>
              by {params.reelUser || "Unknown"}
            </Text>
          </View>
          <View style={[styles.stitchBadge, { backgroundColor: colors.secondary + "15" }]}>
            <Text style={{ fontSize: 12, color: colors.secondary, fontFamily: "Inter_600SemiBold" }}>Stitch</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Step indicator */}
      <View style={[styles.stepBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {["Trim", "Record"].map((s, i) => (
          <View key={s} style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={[styles.stepDot, { backgroundColor: (step === "trim" && i === 0) || (step === "record" && i <= 1) ? colors.secondary : colors.border }]}>
              <Text style={{ fontSize: 10, color: "#fff", fontFamily: "Inter_700Bold" }}>{i + 1}</Text>
            </View>
            <Text style={{ fontSize: 12, color: (step === "trim" && i === 0) || (step === "record" && i <= 1) ? colors.foreground : colors.mutedForeground, fontFamily: "Inter_500Medium", marginLeft: 4 }}>
              {s}
            </Text>
          </View>
        ))}
      </View>

      {step === "trim" && (
        <>
          {/* Original preview placeholder */}
          <View style={[styles.previewBox, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 16, marginTop: 12 }]}>
            <LinearGradient colors={["#FFB800", "#E91E8C"]} style={[StyleSheet.absoluteFill, { opacity: 0.2 }]} />
            <View style={{ alignItems: "center", justifyContent: "center", padding: 40 }}>
              <Feather name="scissors" size={40} color={colors.secondary} />
              <Text style={{ fontSize: 14, color: colors.foreground, fontFamily: "Inter_600SemiBold", marginTop: 12 }}>
                Trim the original
              </Text>
              <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 4, textAlign: "center" }}>
                Pick how much of the original video to include before you start recording
              </Text>
            </View>
          </View>

          {/* Trim options */}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginHorizontal: 16, marginTop: 16 }]}>
            How much to include?
          </Text>
          <View style={[styles.trimGrid, { marginHorizontal: 16 }]}>
            {TRIM_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                onPress={() => setSelectedTrim(opt.id)}
                style={[styles.trimCard, {
                  backgroundColor: selectedTrim === opt.id ? colors.secondary + "20" : colors.card,
                  borderColor: selectedTrim === opt.id ? colors.secondary : colors.border,
                }]}
              >
                <Text style={{ fontSize: 16, color: selectedTrim === opt.id ? colors.secondary : colors.foreground, fontFamily: "Inter_700Bold" }}>
                  {opt.label}
                </Text>
                <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 }}>
                  {opt.desc}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flex: 1 }} />
          <Pressable onPress={() => setStep("record")} style={[styles.nextBtn, { backgroundColor: colors.secondary, marginHorizontal: 16, marginBottom: Math.max(insets.bottom, 16) + 16 }]}>
            <Text style={{ fontSize: 16, color: "#fff", fontFamily: "Inter_700Bold" }}>
              Next: Record your part →
            </Text>
          </Pressable>
        </>
      )}

      {step === "record" && (
        <>
          {/* Timeline visualization */}
          <View style={[styles.timeline, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 16, marginTop: 12 }]}>
            <View style={{ flexDirection: "row", height: 40, borderRadius: 8, overflow: "hidden" }}>
              <View style={[styles.timelineSegment, { backgroundColor: colors.secondary + "40", flex: 1 }]}>
                <Text style={{ fontSize: 10, color: colors.secondary, fontFamily: "Inter_500Medium", textAlign: "center" }}>Original</Text>
              </View>
              <View style={[styles.timelineSegment, { backgroundColor: colors.primary + "40", flex: 1 }]}>
                <Text style={{ fontSize: 10, color: colors.primary, fontFamily: "Inter_500Medium", textAlign: "center" }}>Your part</Text>
              </View>
            </View>
          </View>

          {/* Camera placeholder */}
          <View style={[styles.cameraArea, { backgroundColor: colors.card, borderColor: colors.border, marginHorizontal: 16, marginTop: 12, flex: 1 }]}>
            <LinearGradient colors={[colors.primary + "10", colors.secondary + "10"]} style={[StyleSheet.absoluteFill, { borderRadius: 16 }]} />
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Feather name="video" size={48} color={colors.primary} />
              <Text style={{ fontSize: 14, color: colors.foreground, fontFamily: "Inter_600SemiBold", marginTop: 12 }}>
                Camera Preview
              </Text>
              <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 4 }}>
                Your recording will be added after the original
              </Text>
            </View>
          </View>

          {/* Bottom record controls */}
          <View style={[styles.recordControls, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
            {countdown > 0 ? (
              <View style={{ alignItems: "center" }}>
                <Text style={[styles.countdown, { color: colors.secondary }]}>{countdown}</Text>
                <Text style={{ fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Recording starts in...</Text>
              </View>
            ) : recording ? (
              <View style={{ alignItems: "center" }}>
                <View style={[styles.recordingPulse, { backgroundColor: colors.destructive + "20" }]}>
                  <View style={[styles.recordingDot, { backgroundColor: colors.destructive }]} />
                  <Text style={{ fontSize: 16, color: colors.destructive, fontFamily: "Inter_600SemiBold", marginLeft: 8 }}>Recording...</Text>
                </View>
              </View>
            ) : (
              <View style={{ alignItems: "center" }}>
                <Pressable onPress={startRecording} style={[styles.recordBtn, { backgroundColor: colors.primary }]}
                >
                  <Feather name="video" size={28} color="#fff" />
                </Pressable>
                <Text style={{ fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 12 }}>
                  Tap to record your stitch
                </Text>
                <Pressable onPress={submitStitch} style={{ marginTop: 16 }}>
                  <Text style={{ fontSize: 14, color: colors.primary, fontFamily: "Inter_600SemiBold" }}>
                    Skip to post creation →
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </>
      )}
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
  stitchBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  stepBar: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20, marginHorizontal: 16, padding: 10, borderRadius: 12, borderWidth: 1 },
  stepDot: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  previewBox: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  sectionLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  trimGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  trimCard: { flex: 1, minWidth: (width - 48) / 2, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: "center" },
  nextBtn: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, alignItems: "center", marginTop: 16 },
  timeline: { padding: 12, borderRadius: 14, borderWidth: 1 },
  timelineSegment: { alignItems: "center", justifyContent: "center", paddingVertical: 6 },
  cameraArea: { borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  recordControls: { paddingTop: 16, alignItems: "center" },
  recordBtn: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  countdown: { fontSize: 64, fontFamily: "Inter_700Bold" },
  recordingPulse: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  recordingDot: { width: 12, height: 12, borderRadius: 6 },
});
