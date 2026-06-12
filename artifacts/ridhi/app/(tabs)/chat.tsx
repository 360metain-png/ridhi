import React, { useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { ChatItem } from "@/components/ChatItem";
import { CHATS } from "@/data/mockData";
import { useTrackScreen, useAnalytics } from "@/hooks/useAnalytics";

interface Conversation {
  id: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  otherUser: {
    id: string;
    name: string;
    avatar: string | null;
    city: string | null;
  } | null;
}

type Tab = "direct" | "groups";

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { trackChat, trackDmOpen } = useAnalytics();
  useTrackScreen("chat");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("direct");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchConversations();
  }, [user]);

  async function fetchConversations() {
    try {
      setLoading(true);
      const res = await fetch("/api/chat", {
        headers: { "x-user-id": user!.id },
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch {
      // fallback to mock
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 60;

  const chatList = conversations.map((conv) => ({
    id: conv.id,
    userId: conv.otherUser?.id ?? "unknown",
    userName: conv.otherUser?.name ?? "Unknown",
    userAvatar: conv.otherUser?.avatar ?? undefined,
    lastMessage: conv.lastMessage ?? "",
    timeAgo: conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
    unread: 0,
    isOnline: false,
  }));

  const filtered = chatList.filter((c) =>
    c.userName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 8, backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Messages</Text>
        <Pressable
          onPress={() => router.push("/chatrooms")}
          style={[styles.composeBtn, { backgroundColor: colors.muted }]}
        >
          <Feather name="edit-2" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
        {([["direct", "Direct"], ["groups", "Groups"]] as [Tab, string][]).map(([t, label]) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tabBtn, tab === t && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          >
            <Text style={[styles.tabLabel, { color: tab === t ? colors.primary : colors.mutedForeground }]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === "groups" ? (
        <Pressable
          onPress={() => router.push("/chatrooms")}
          style={[styles.groupsShortcut, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={[styles.groupsIcon, { backgroundColor: colors.secondary + "20" }]}>
            <Feather name="users" size={22} color={colors.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.groupsTitle, { color: colors.foreground }]}>Open Chatrooms</Text>
            <Text style={[styles.groupsSub, { color: colors.mutedForeground }]}>Bollywood, Cricket, Gaming & more</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </Pressable>
      ) : (
        <>
          <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder="Search messages..."
              placeholderTextColor={colors.mutedForeground}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <Feather name="x" size={16} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(c) => c.id}
            renderItem={({ item }) => (
              <ChatItem
                chat={item}
                onPress={() => router.push({ pathname: "/chat/[id]", params: { id: item.id } })}
              />
            )}
            ItemSeparatorComponent={() => (
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
            )}
            contentContainerStyle={{ paddingBottom: bottomPad + 16 }}
            removeClippedSubviews={Platform.OS !== "web"}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={12}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.empty}>
                <Feather name="message-circle" size={40} color={colors.muted} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No messages found</Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 24, fontFamily: "Inter_700Bold" },
  composeBtn: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tabRow: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 12 },
  tabLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  groupsShortcut: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  groupsIcon: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  groupsTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  groupsSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 78 },
  empty: { alignItems: "center", gap: 8, paddingTop: 60 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
