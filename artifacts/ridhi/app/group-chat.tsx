import React, { useState } from "react";
import {
  FlatList,
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
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/Avatar";
import { GradientButton } from "@/components/GradientButton";

const GROUP_CHATS = [
  {
    id: "g1", name: "Bollywood Fans Club", members: 284, lastMsg: "Aarav: New song is fire! 🔥",
    time: "2m", unread: 12, category: "Entertainment",
  },
  {
    id: "g2", name: "Delhi Foodies 🍛", members: 156, lastMsg: "Priya: Anyone tried the new place at CP?",
    time: "15m", unread: 3, category: "Food",
  },
  {
    id: "g3", name: "Startup Builders India", members: 412, lastMsg: "Rahul: Series A done! 🎉",
    time: "1h", unread: 0, category: "Business",
  },
  {
    id: "g4", name: "Cricket Fans 🏏", members: 891, lastMsg: "Dev: What a century by Kohli!",
    time: "3h", unread: 47, category: "Sports",
  },
  {
    id: "g5", name: "Tech Talk Bangalore", members: 203, lastMsg: "Kavya: New AI model dropped",
    time: "5h", unread: 0, category: "Technology",
  },
];

const GROUP_MESSAGES = [
  { id: "m1", user: "Ananya", text: "Hey everyone! How's the vibe today?", time: "10:02", own: false },
  { id: "m2", user: "Rahul", text: "All good! Anyone watching the match tonight?", time: "10:04", own: false },
  { id: "m3", user: "Me", text: "Definitely! Should be a good one 🏏", time: "10:05", own: true },
  { id: "m4", user: "Kavya", text: "Count me in! Setting up the watch party now", time: "10:06", own: false },
  { id: "m5", user: "Arjun", text: "🎉🏏", time: "10:06", own: false },
  { id: "m6", user: "Me", text: "Let's go! Dhoni era vibes 😂", time: "10:08", own: true },
  { id: "m7", user: "Ananya", text: "Haha yes! Those were the days", time: "10:09", own: false },
];

export default function GroupChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [view, setView] = useState<"list" | "chat">("list");
  const [activeGroup, setActiveGroup] = useState<typeof GROUP_CHATS[0] | null>(null);
  const [messages, setMessages] = useState(GROUP_MESSAGES);
  const [text, setText] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 20;

  const send = () => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: `m${Date.now()}`, user: "Me", text: text.trim(), time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }), own: true },
    ]);
    setText("");
  };

  if (view === "chat" && activeGroup) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[colors.secondary + "25", colors.primary + "10", "transparent"]}
          style={[styles.chatHeader, { paddingTop: topPad + 8 }]}
        >
          <Pressable onPress={() => setView("list")} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <Avatar name={activeGroup.name} size={36} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.chatGroupName, { color: colors.foreground }]}>{activeGroup.name}</Text>
            <Text style={[styles.chatGroupMeta, { color: colors.mutedForeground }]}>{activeGroup.members} members</Text>
          </View>
          <Pressable style={styles.headerAction}>
            <Feather name="phone" size={20} color={colors.primary} />
          </Pressable>
          <Pressable style={styles.headerAction}>
            <Feather name="more-vertical" size={20} color={colors.foreground} />
          </Pressable>
        </LinearGradient>

        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item }) => (
            <View style={[styles.msgRow, item.own && styles.msgRowOwn]}>
              {!item.own && <Avatar name={item.user} size={28} />}
              <View style={[
                styles.bubble,
                item.own
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
              ]}>
                {!item.own && (
                  <Text style={[styles.bubbleUser, { color: colors.primary }]}>{item.user}</Text>
                )}
                <Text style={[styles.bubbleText, { color: item.own ? "#fff" : colors.foreground }]}>
                  {item.text}
                </Text>
                <Text style={[styles.bubbleTime, { color: item.own ? "rgba(255,255,255,0.6)" : colors.mutedForeground }]}>
                  {item.time}
                </Text>
              </View>
            </View>
          )}
        />

        <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: bottomPad }]}>
          <Pressable style={styles.inputAction}>
            <Feather name="paperclip" size={20} color={colors.mutedForeground} />
          </Pressable>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            placeholder="Message..."
            placeholderTextColor={colors.mutedForeground}
            value={text}
            onChangeText={setText}
            multiline
          />
          <Pressable style={styles.inputAction}>
            <Feather name="mic" size={20} color={colors.mutedForeground} />
          </Pressable>
          <Pressable onPress={send} style={[styles.sendBtn, { backgroundColor: colors.primary }]}>
            <Feather name="send" size={16} color="#fff" />
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
        <Text style={[styles.title, { color: colors.foreground }]}>Group Chats</Text>
        <GradientButton label="New Group" onPress={() => { const { Alert } = require("react-native"); Alert.alert("Create Group Chat", "Start a new group chat with friends or your community.", [{ text: "Cancel", style: "cancel" }, { text: "Create Group", onPress: () => router.push("/communities") }]); }} small />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.discoverBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <LinearGradient colors={[colors.primary + "20", colors.secondary + "10"]} style={styles.discoverInner}>
            <Feather name="users" size={24} color={colors.primary} />
            <View>
              <Text style={[styles.discoverTitle, { color: colors.foreground }]}>Discover Communities</Text>
              <Text style={[styles.discoverSub, { color: colors.mutedForeground }]}>Find groups that match your interests</Text>
            </View>
          </LinearGradient>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Groups</Text>
        {GROUP_CHATS.map((group) => (
          <Pressable
            key={group.id}
            onPress={() => { setActiveGroup(group); setView("chat"); }}
            style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.groupAvatar, { backgroundColor: colors.primary + "20" }]}>
              <Feather name="users" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.groupTop}>
                <Text style={[styles.groupName, { color: colors.foreground }]}>{group.name}</Text>
                <Text style={[styles.groupTime, { color: colors.mutedForeground }]}>{group.time}</Text>
              </View>
              <View style={styles.groupBottom}>
                <Text style={[styles.groupLastMsg, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {group.lastMsg}
                </Text>
                {group.unread > 0 && (
                  <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.unreadText}>{group.unread > 99 ? "99+" : group.unread}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.groupMembers, { color: colors.mutedForeground }]}>
                {group.members} members · {group.category}
              </Text>
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
  discoverBanner: { margin: 16, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  discoverInner: { flexDirection: "row", alignItems: "center", gap: 16, padding: 16 },
  discoverTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  discoverSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", paddingHorizontal: 16, marginBottom: 8 },
  groupCard: { flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 16, marginBottom: 8, padding: 14, borderRadius: 14, borderWidth: 1 },
  groupAvatar: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  groupTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  groupName: { fontSize: 15, fontFamily: "Inter_600SemiBold", flex: 1 },
  groupTime: { fontSize: 12, fontFamily: "Inter_400Regular" },
  groupBottom: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  groupLastMsg: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  unreadBadge: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, alignItems: "center", justifyContent: "center" },
  unreadText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" },
  groupMembers: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 3 },
  chatHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, gap: 10 },
  chatGroupName: { fontSize: 15, fontFamily: "Inter_700Bold" },
  chatGroupMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  headerAction: { padding: 6 },
  msgRow: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
  msgRowOwn: { flexDirection: "row-reverse" },
  bubble: { maxWidth: "75%", padding: 10, borderRadius: 16, gap: 2 },
  bubbleUser: { fontSize: 11, fontFamily: "Inter_700Bold" },
  bubbleText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  bubbleTime: { fontSize: 10, fontFamily: "Inter_400Regular", alignSelf: "flex-end" },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 12, paddingTop: 10, borderTopWidth: 1 },
  inputAction: { padding: 8, paddingBottom: 10 },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14, fontFamily: "Inter_400Regular", maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 2 },
});
