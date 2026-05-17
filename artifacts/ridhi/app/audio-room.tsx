import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
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
import { GradientButton } from "@/components/GradientButton";

const AUDIO_ROOMS = [
  {
    id: "ar1", title: "Bollywood Hits Discussion", host: "Priya Sharma", language: "Hindi",
    listeners: 1284, speakers: 6, topic: "Best songs of 2025 so far", joined: false,
    tags: ["Music", "Bollywood"],
  },
  {
    id: "ar2", title: "Tech Talk India", host: "Dev Kumar", language: "English",
    listeners: 842, speakers: 4, topic: "AI startups disrupting India", joined: false,
    tags: ["Technology", "Startups"],
  },
  {
    id: "ar3", title: "Telugu Cinema Club", host: "Kavya Reddy", language: "Telugu",
    listeners: 632, speakers: 5, topic: "Tollywood blockbusters review", joined: true,
    tags: ["Cinema", "Telugu"],
  },
  {
    id: "ar4", title: "Startup Founders Network", host: "Rahul Verma", language: "English",
    listeners: 421, speakers: 3, topic: "Fundraising in 2025 India", joined: false,
    tags: ["Business", "Finance"],
  },
  {
    id: "ar5", title: "Malayalam Kadha Kootam", host: "Meera Pillai", language: "Malayalam",
    listeners: 318, speakers: 4, topic: "Short stories by listeners", joined: false,
    tags: ["Stories", "Creative"],
  },
];

const SPEAKERS = [
  { id: "s1", name: "Priya S", speaking: true, muted: false, isHost: true },
  { id: "s2", name: "Rahul M", speaking: false, muted: false, isHost: false },
  { id: "s3", name: "Kavya R", speaking: true, muted: false, isHost: false },
  { id: "s4", name: "Arjun K", speaking: false, muted: true, isHost: false },
  { id: "s5", name: "Meera P", speaking: false, muted: false, isHost: false },
  { id: "s6", name: "Dev T", speaking: false, muted: true, isHost: false },
];

export default function AudioRoomScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeRoom, setActiveRoom] = useState<typeof AUDIO_ROOMS[0] | null>(null);
  const [muted, setMuted] = useState(true);
  const [raised, setRaised] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (activeRoom) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[colors.secondary + "30", colors.primary + "15", "transparent"]}
          style={[styles.roomHeader, { paddingTop: topPad + 10 }]}
        >
          <View style={styles.roomHeaderTop}>
            <Pressable onPress={() => setActiveRoom(null)} style={styles.leaveBtn}>
              <Feather name="arrow-left" size={20} color={colors.foreground} />
              <Text style={[styles.leaveBtnText, { color: colors.foreground }]}>Leave</Text>
            </Pressable>
            <View style={[styles.liveIndicator, { backgroundColor: colors.destructive + "20" }]}>
              <View style={[styles.liveDot, { backgroundColor: colors.destructive }]} />
              <Text style={[styles.liveText, { color: colors.destructive }]}>LIVE</Text>
            </View>
            <Pressable style={styles.shareBtn}>
              <Feather name="share-2" size={20} color={colors.foreground} />
            </Pressable>
          </View>
          <Text style={[styles.roomTitle, { color: colors.foreground }]}>{activeRoom.title}</Text>
          <Text style={[styles.roomTopic, { color: colors.mutedForeground }]}>{activeRoom.topic}</Text>
          <View style={styles.roomStats}>
            <Feather name="mic" size={13} color={colors.mutedForeground} />
            <Text style={[styles.roomStatText, { color: colors.mutedForeground }]}>{activeRoom.speakers} speakers</Text>
            <Feather name="headphones" size={13} color={colors.mutedForeground} style={{ marginLeft: 12 }} />
            <Text style={[styles.roomStatText, { color: colors.mutedForeground }]}>{activeRoom.listeners.toLocaleString()} listening</Text>
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          <Text style={[styles.speakersLabel, { color: colors.mutedForeground }]}>ON STAGE</Text>
          <View style={styles.speakersGrid}>
            {SPEAKERS.map((sp) => (
              <View key={sp.id} style={styles.speakerItem}>
                <View style={[
                  styles.speakerAvatar,
                  sp.speaking && { borderColor: colors.primary, borderWidth: 3 },
                  { backgroundColor: colors.card },
                ]}>
                  <Avatar name={sp.name} size={52} />
                  {sp.muted && (
                    <View style={[styles.mutedBadge, { backgroundColor: colors.destructive }]}>
                      <Feather name="mic-off" size={10} color="#fff" />
                    </View>
                  )}
                  {sp.isHost && (
                    <View style={[styles.hostBadge, { backgroundColor: colors.gold }]}>
                      <Feather name="star" size={10} color="#fff" />
                    </View>
                  )}
                </View>
                <Text style={[styles.speakerName, { color: colors.foreground }]} numberOfLines={1}>
                  {sp.name}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.speakersLabel, { color: colors.mutedForeground }]}>AUDIENCE</Text>
          <View style={styles.audienceGrid}>
            {Array.from({ length: 12 }).map((_, i) => (
              <View key={i} style={styles.audienceItem}>
                <Avatar name={`User ${i + 1}`} size={36} />
              </View>
            ))}
            <View style={[styles.audienceMore, { backgroundColor: colors.muted }]}>
              <Text style={[styles.audienceMoreText, { color: colors.mutedForeground }]}>
                +{activeRoom.listeners - 12}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.roomControls, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <Pressable
            onPress={() => setRaised((v) => !v)}
            style={[styles.handBtn, { backgroundColor: raised ? colors.gold + "20" : colors.muted, borderColor: raised ? colors.gold : colors.border }]}
          >
            <Text style={{ fontSize: 20 }}>✋</Text>
            <Text style={[styles.handBtnText, { color: raised ? colors.gold : colors.mutedForeground }]}>
              {raised ? "Lower" : "Raise"}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMuted((v) => !v)}
            style={[styles.micBtn, { backgroundColor: muted ? colors.card : colors.primary }]}
          >
            <Feather name={muted ? "mic-off" : "mic"} size={26} color={muted ? colors.mutedForeground : "#fff"} />
          </Pressable>
          <Pressable
            style={[styles.leaveRoomBtn, { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "30" }]}
            onPress={() => setActiveRoom(null)}
          >
            <Feather name="phone-off" size={20} color={colors.destructive} />
            <Text style={[styles.leaveRoomText, { color: colors.destructive }]}>Leave</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.secondary + "25", colors.primary + "15", "transparent"]}
        style={[styles.header, { paddingTop: topPad + 10 }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Audio Rooms</Text>
        <GradientButton label="Create" onPress={() => { const { Alert } = require("react-native"); Alert.alert("Create Audio Room", "Start a live audio room for your community.", [{ text: "Cancel", style: "cancel" }, { text: "Create Room 🎤", onPress: () => Alert.alert("Room Created! 🎤", "Your audio room is now live. Others can join from the Audio Rooms list.", [{ text: "OK" }]) }]); }} small />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <LinearGradient
          colors={[colors.secondary + "20", colors.primary + "10"]}
          style={styles.banner}
        >
          <Feather name="headphones" size={32} color={colors.secondary} />
          <View>
            <Text style={[styles.bannerTitle, { color: colors.foreground }]}>Live Audio Rooms</Text>
            <Text style={[styles.bannerSub, { color: colors.mutedForeground }]}>Join conversations in your language</Text>
          </View>
        </LinearGradient>

        {AUDIO_ROOMS.map((room) => (
          <Pressable
            key={room.id}
            onPress={() => setActiveRoom(room)}
            style={[styles.roomCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.roomCardTop}>
              <Text style={[styles.roomCardTitle, { color: colors.foreground }]}>{room.title}</Text>
              <View style={[styles.langBadge, { backgroundColor: colors.secondary + "18" }]}>
                <Text style={[styles.langText, { color: colors.secondary }]}>{room.language}</Text>
              </View>
            </View>
            <Text style={[styles.roomCardTopic, { color: colors.mutedForeground }]}>{room.topic}</Text>
            <View style={styles.roomCardTags}>
              {room.tags.map((tag) => (
                <View key={tag} style={[styles.tag, { backgroundColor: colors.primary + "12" }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
                </View>
              ))}
            </View>
            <View style={styles.roomCardMeta}>
              <Avatar name={room.host} size={24} />
              <Text style={[styles.hostName, { color: colors.mutedForeground }]}>{room.host}</Text>
              <View style={{ flex: 1 }} />
              <Feather name="mic" size={12} color={colors.mutedForeground} />
              <Text style={[styles.metaCount, { color: colors.mutedForeground }]}>{room.speakers}</Text>
              <Feather name="headphones" size={12} color={colors.mutedForeground} style={{ marginLeft: 8 }} />
              <Text style={[styles.metaCount, { color: colors.mutedForeground }]}>{room.listeners.toLocaleString()}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  banner: { margin: 16, flexDirection: "row", alignItems: "center", gap: 16, padding: 18, borderRadius: 16 },
  bannerTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  bannerSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  roomCard: { marginHorizontal: 16, marginBottom: 10, borderRadius: 16, borderWidth: 1, padding: 16, gap: 8 },
  roomCardTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  roomCardTitle: { fontSize: 15, fontFamily: "Inter_700Bold", flex: 1, marginRight: 8 },
  langBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  langText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  roomCardTopic: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  roomCardTags: { flexDirection: "row", gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  tagText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  roomCardMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  hostName: { fontSize: 12, fontFamily: "Inter_400Regular" },
  metaCount: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  roomHeader: { paddingHorizontal: 20, paddingBottom: 20, gap: 8 },
  roomHeaderTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  leaveBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  leaveBtnText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  liveIndicator: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  shareBtn: { padding: 4 },
  roomTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  roomTopic: { fontSize: 14, fontFamily: "Inter_400Regular" },
  roomStats: { flexDirection: "row", alignItems: "center", gap: 4 },
  roomStatText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  speakersLabel: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1, paddingHorizontal: 20, marginTop: 20, marginBottom: 12 },
  speakersGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20, gap: 16 },
  speakerItem: { alignItems: "center", gap: 6, width: 70 },
  speakerAvatar: { borderRadius: 30, position: "relative", borderWidth: 0 },
  mutedBadge: { position: "absolute", bottom: 0, right: 0, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  hostBadge: { position: "absolute", top: 0, right: 0, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  speakerName: { fontSize: 12, fontFamily: "Inter_500Medium", textAlign: "center" },
  divider: { height: 1, marginHorizontal: 20, marginTop: 20 },
  audienceGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20, gap: 10 },
  audienceItem: {},
  audienceMore: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  audienceMoreText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  roomControls: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, padding: 20, borderTopWidth: 1, position: "absolute", bottom: 0, left: 0, right: 0 },
  handBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  handBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  micBtn: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  leaveRoomBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  leaveRoomText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
