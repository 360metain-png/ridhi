import React, { useState, useEffect } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/Avatar";
import { CoinBadge } from "@/components/CoinBadge";

const CALL_COSTS = { audio: 5, video: 10 };

const ONLINE_USERS = [
  { id: "u1", name: "Ananya Singh", city: "Delhi", language: "Hindi", interests: ["Music", "Travel"], coins: 320 },
  { id: "u2", name: "Priya Mehta", city: "Mumbai", language: "Marathi", interests: ["Dance", "Food"], coins: 180 },
  { id: "u3", name: "Kavya Reddy", city: "Hyderabad", language: "Telugu", interests: ["Books", "Art"], coins: 540 },
  { id: "u4", name: "Meera Pillai", city: "Kochi", language: "Malayalam", interests: ["Cooking", "Yoga"], coins: 210 },
  { id: "u5", name: "Riya Das", city: "Kolkata", language: "Bengali", interests: ["Music", "Cinema"], coins: 390 },
];

type CallMode = "idle" | "searching" | "connected" | "calling";
type CallType = "audio" | "video";

export default function RandomCallScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addCoins } = useAuth();
  const [callType, setCallType] = useState<CallType>("audio");
  const [mode, setMode] = useState<CallMode>("idle");
  const [matched, setMatched] = useState<typeof ONLINE_USERS[0] | null>(null);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const pulseAnim = new Animated.Value(1);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (mode === "connected") {
      timer = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [mode]);

  useEffect(() => {
    if (mode === "searching") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
      const t = setTimeout(() => {
        const u = ONLINE_USERS[Math.floor(Math.random() * ONLINE_USERS.length)];
        setMatched(u);
        setMode("calling");
        setTimeout(() => setMode("connected"), 2000);
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [mode]);

  const startSearch = () => {
    if ((user?.coins ?? 0) < CALL_COSTS[callType]) return;
    setDuration(0);
    setMatched(null);
    setMode("searching");
  };

  const endCall = () => {
    if (mode === "connected") {
      const cost = Math.max(CALL_COSTS[callType], Math.floor(duration / 60) * CALL_COSTS[callType]);
      addCoins(-Math.min(cost, user?.coins ?? 0));
    }
    setMode("idle");
    setMatched(null);
    setDuration(0);
  };

  const skip = () => {
    setMode("searching");
    setMatched(null);
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.secondary + "30", colors.primary + "15", "transparent"]}
        style={[styles.header, { paddingTop: topPad + 10 }]}
      >
        <Pressable onPress={() => { endCall(); router.back(); }} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Random Calls</Text>
        <CoinBadge amount={user?.coins ?? 0} size="sm" />
      </LinearGradient>

      {mode === "idle" && (
        <View style={styles.idleContainer}>
          <LinearGradient
            colors={[colors.primary + "20", colors.secondary + "15"]}
            style={styles.onlineCard}
          >
            <Feather name="radio" size={20} color={colors.primary} />
            <Text style={[styles.onlineText, { color: colors.foreground }]}>
              <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold" }}>1,284</Text> people online now
            </Text>
          </LinearGradient>

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Choose call type</Text>
          <View style={styles.typeRow}>
            {(["audio", "video"] as CallType[]).map((t) => (
              <Pressable
                key={t}
                onPress={() => setCallType(t)}
                style={[
                  styles.typeBtn,
                  {
                    backgroundColor: callType === t ? (t === "audio" ? colors.secondary : colors.primary) : colors.card,
                    borderColor: callType === t ? "transparent" : colors.border,
                  },
                ]}
              >
                <Feather name={t === "audio" ? "mic" : "video"} size={28} color={callType === t ? "#fff" : colors.mutedForeground} />
                <Text style={[styles.typeName, { color: callType === t ? "#fff" : colors.foreground }]}>
                  {t === "audio" ? "Audio Call" : "Video Call"}
                </Text>
                <View style={[styles.costBadge, { backgroundColor: callType === t ? "rgba(255,255,255,0.2)" : colors.muted }]}>
                  <Feather name="star" size={10} color={callType === t ? "#fff" : colors.gold} />
                  <Text style={[styles.costText, { color: callType === t ? "#fff" : colors.mutedForeground }]}>
                    {CALL_COSTS[t]}/min
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Recently online</Text>
          <View style={styles.onlineList}>
            {ONLINE_USERS.slice(0, 3).map((u) => (
              <View key={u.id} style={[styles.onlineUser, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Avatar name={u.name} size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.onlineUserName, { color: colors.foreground }]}>{u.name}</Text>
                  <Text style={[styles.onlineUserInfo, { color: colors.mutedForeground }]}>{u.city} · {u.language}</Text>
                </View>
                <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
              </View>
            ))}
          </View>

          <Pressable onPress={startSearch} style={styles.startBtn}>
            <LinearGradient colors={[colors.secondary, colors.primary]} style={styles.startBtnGrad}>
              <Feather name={callType === "audio" ? "mic" : "video"} size={22} color="#fff" />
              <Text style={styles.startBtnText}>Start {callType === "audio" ? "Audio" : "Video"} Call</Text>
            </LinearGradient>
          </Pressable>

          <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
            Be respectful. Abuse leads to immediate ban. Women safety controls active.
          </Text>
        </View>
      )}

      {mode === "searching" && (
        <View style={styles.searchingContainer}>
          <Animated.View style={[styles.pulseRing, { borderColor: colors.primary + "40", transform: [{ scale: pulseAnim }] }]} />
          <Animated.View style={[styles.pulseRing2, { borderColor: colors.secondary + "25", transform: [{ scale: pulseAnim }] }]} />
          <View style={[styles.searchingAvatar, { backgroundColor: colors.card }]}>
            <Feather name={callType === "audio" ? "mic" : "video"} size={40} color={colors.primary} />
          </View>
          <Text style={[styles.searchingTitle, { color: colors.foreground }]}>Finding someone...</Text>
          <Text style={[styles.searchingSubtitle, { color: colors.mutedForeground }]}>Matching based on your interests</Text>
          <Pressable onPress={() => setMode("idle")} style={[styles.cancelBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="x" size={18} color={colors.destructive} />
            <Text style={[styles.cancelBtnText, { color: colors.destructive }]}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {(mode === "calling" || mode === "connected") && matched && (
        <View style={styles.callContainer}>
          {callType === "video" && (
            <LinearGradient
              colors={[colors.secondary + "60", colors.primary + "40"]}
              style={styles.videoPlaceholder}
            >
              <Feather name="video-off" size={48} color="rgba(255,255,255,0.4)" />
              <Text style={styles.videoPlaceholderText}>Camera preview</Text>
            </LinearGradient>
          )}

          <View style={[styles.callOverlay, callType === "audio" && { flex: 1, justifyContent: "center" }]}>
            <Avatar name={matched.name} size={96} />
            <Text style={[styles.calleeName, { color: colors.foreground }]}>{matched.name}</Text>
            <Text style={[styles.calleeInfo, { color: colors.mutedForeground }]}>{matched.city} · {matched.language}</Text>
            <View style={styles.interestTags}>
              {matched.interests.map((i) => (
                <View key={i} style={[styles.tag, { backgroundColor: colors.primary + "18" }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>{i}</Text>
                </View>
              ))}
            </View>
            {mode === "calling" && (
              <Text style={[styles.callingText, { color: colors.mutedForeground }]}>Connecting...</Text>
            )}
            {mode === "connected" && (
              <View style={styles.durationRow}>
                <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
                <Text style={[styles.durationText, { color: colors.success }]}>{fmt(duration)}</Text>
              </View>
            )}
          </View>

          <View style={styles.callControls}>
            {callType === "video" && (
              <Pressable
                onPress={() => setCameraOff((v) => !v)}
                style={[styles.controlBtn, { backgroundColor: cameraOff ? colors.destructive : colors.card }]}
              >
                <Feather name={cameraOff ? "video-off" : "video"} size={22} color={cameraOff ? "#fff" : colors.foreground} />
              </Pressable>
            )}
            <Pressable
              onPress={() => setMuted((v) => !v)}
              style={[styles.controlBtn, { backgroundColor: muted ? colors.destructive : colors.card }]}
            >
              <Feather name={muted ? "mic-off" : "mic"} size={22} color={muted ? "#fff" : colors.foreground} />
            </Pressable>
            <Pressable onPress={endCall} style={styles.endBtn}>
              <Feather name="phone-off" size={26} color="#fff" />
            </Pressable>
            <Pressable onPress={skip} style={[styles.controlBtn, { backgroundColor: colors.card }]}>
              <Feather name="skip-forward" size={22} color={colors.foreground} />
            </Pressable>
            <Pressable style={[styles.controlBtn, { backgroundColor: colors.card }]}>
              <Feather name="flag" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  idleContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  onlineCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, marginBottom: 24 },
  onlineText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  sectionLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 },
  typeRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  typeBtn: { flex: 1, alignItems: "center", padding: 20, borderRadius: 16, borderWidth: 1, gap: 8 },
  typeName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  costBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  costText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  onlineList: { gap: 10, marginBottom: 24 },
  onlineUser: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, borderWidth: 1 },
  onlineUserName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  onlineUserInfo: { fontSize: 12, fontFamily: "Inter_400Regular" },
  onlineDot: { width: 10, height: 10, borderRadius: 5 },
  startBtn: { borderRadius: 16, overflow: "hidden", marginBottom: 16 },
  startBtnGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16 },
  startBtnText: { color: "#fff", fontSize: 17, fontFamily: "Inter_700Bold" },
  disclaimer: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18 },
  searchingContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  pulseRing: { position: "absolute", width: 180, height: 180, borderRadius: 90, borderWidth: 2 },
  pulseRing2: { position: "absolute", width: 220, height: 220, borderRadius: 110, borderWidth: 2 },
  searchingAvatar: { width: 120, height: 120, borderRadius: 60, alignItems: "center", justifyContent: "center" },
  searchingTitle: { fontSize: 22, fontFamily: "Inter_700Bold", marginTop: 16 },
  searchingSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular" },
  cancelBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, borderWidth: 1, marginTop: 16 },
  cancelBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  callContainer: { flex: 1 },
  videoPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  videoPlaceholderText: { color: "rgba(255,255,255,0.5)", fontSize: 14, fontFamily: "Inter_400Regular" },
  callOverlay: { padding: 24, alignItems: "center", gap: 8 },
  calleeName: { fontSize: 24, fontFamily: "Inter_700Bold", marginTop: 8 },
  calleeInfo: { fontSize: 14, fontFamily: "Inter_400Regular" },
  interestTags: { flexDirection: "row", gap: 8, marginTop: 4 },
  tag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  tagText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  callingText: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 8 },
  durationRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  durationText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  callControls: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, paddingBottom: 48, paddingTop: 16 },
  controlBtn: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  endBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#FF3B30", alignItems: "center", justifyContent: "center" },
});
