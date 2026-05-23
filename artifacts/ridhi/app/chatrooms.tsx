import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
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
import { CHATROOMS, ROOM_CATEGORIES, type Chatroom } from "@/data/chatrooms";
import { SeoHead } from "@/components/SeoHead";

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function RoomCard({ room, onPress }: { room: Chatroom; onPress: () => void }) {
  const colors = useColors();
  return (
    <>
      <SeoHead
        title="Chatrooms — Join Audio, Video & Text Chat Rooms | Ridhi"
        description="Discover live chatrooms on Ridhi. Join audio rooms, video hangouts, and text communities across India. Talk, share, and connect in your language."
      />
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}
      accessibilityLabel={`${room.name} chatroom`}
      accessibilityRole="button"
    >
      <LinearGradient
        colors={[room.gradientStart + "22", room.gradientEnd + "10"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.cardTop}>
        <View style={[styles.emojiWrap, { backgroundColor: room.gradientStart + "25" }]}>
          <Text style={styles.emoji}>{room.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={[styles.roomName, { color: colors.foreground }]} numberOfLines={1}>
              {room.name}
            </Text>
            {room.isVerified && (
              <Feather name="check-circle" size={13} color={room.gradientStart} />
            )}
            {room.isJoined && (
              <View style={[styles.joinedBadge, { backgroundColor: room.gradientStart + "22" }]}>
                <Text style={[styles.joinedText, { color: room.gradientStart }]}>Joined</Text>
              </View>
            )}
          </View>
          <Text style={[styles.roomDesc, { color: colors.mutedForeground }]} numberOfLines={1}>
            {room.description}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <Text style={[styles.lastMsg, { color: colors.mutedForeground }]} numberOfLines={1}>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium" }}>
          {room.lastMessageUser}:{" "}
        </Text>
        {room.lastMessage}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.statPill}>
          <View style={[styles.onlineDot, { backgroundColor: "#34C759" }]} />
          <Text style={[styles.statText, { color: colors.mutedForeground }]}>
            {formatCount(room.onlineCount)} online
          </Text>
        </View>
        <View style={styles.statPill}>
          <Feather name="users" size={11} color={colors.mutedForeground} />
          <Text style={[styles.statText, { color: colors.mutedForeground }]}>
            {formatCount(room.memberCount)}
          </Text>
        </View>
        <View style={styles.statPill}>
          <Feather name="globe" size={11} color={colors.mutedForeground} />
          <Text style={[styles.statText, { color: colors.mutedForeground }]}>{room.language}</Text>
        </View>
        <Text style={[styles.timeText, { color: colors.mutedForeground }]}>
          {room.lastMessageTime}
        </Text>
      </View>
    </Pressable>
  );
}

const ROOM_EMOJIS = ["💬", "🎵", "🎮", "🍛", "💪", "📸", "🌍", "🏏", "🌸", "🚀", "💃", "🎨"];

export default function ChatroomsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [rooms, setRooms] = useState(CHATROOMS);
  const [showCreate, setShowCreate] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");
  const [newRoomEmoji, setNewRoomEmoji] = useState("💬");
  const [creating, setCreating] = useState(false);

  const filtered = rooms.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "All" || r.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const joined = filtered.filter((r) => r.isJoined);
  const discover = filtered.filter((r) => !r.isJoined);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    setCreating(true);
    await new Promise((r) => setTimeout(r, 800));
    const newRoom: Chatroom = {
      id: `room-${Date.now()}`,
      name: newRoomName.trim(),
      description: newRoomDesc.trim() || "A new chatroom on Ridhi",
      emoji: newRoomEmoji,
      gradientStart: "#E91E8C",
      gradientEnd: "#7B2FBE",
      onlineCount: 1,
      category: "Social",
      isJoined: true,
      isVerified: false,
      isPinned: false,
      language: "English",
      memberCount: 1,
      lastMessage: "Chatroom created",
      lastMessageTime: "now",
      lastMessageUser: "You",
    };
    setRooms((prev) => [newRoom, ...prev]);
    setCreating(false);
    setShowCreate(false);
    setNewRoomName("");
    setNewRoomDesc("");
    setNewRoomEmoji("💬");
    Alert.alert("Chatroom Created! 🎉", `"${newRoom.name}" is live. Invite friends to join.`, [{ text: "Open Room", onPress: () => router.push(`/chatroom/${newRoom.id}` as any) }, { text: "OK" }]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowCreate(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.surface }]} onPress={() => {}}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Create Chatroom</Text>

            <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Room Emoji</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiRow}>
              {ROOM_EMOJIS.map((e) => (
                <Pressable
                  key={e}
                  onPress={() => setNewRoomEmoji(e)}
                  style={[styles.emojiBtn, { borderColor: colors.border, backgroundColor: colors.muted },
                    newRoomEmoji === e && { backgroundColor: colors.primary + "20", borderColor: colors.primary }]}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Room Name *</Text>
            <TextInput
              style={[styles.modalInput, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
              placeholder="e.g. Bollywood Fans India"
              placeholderTextColor={colors.mutedForeground}
              value={newRoomName}
              onChangeText={setNewRoomName}
              maxLength={40}
            />

            <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Description</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
              placeholder="What is this room about?"
              placeholderTextColor={colors.mutedForeground}
              value={newRoomDesc}
              onChangeText={setNewRoomDesc}
              multiline
              maxLength={100}
            />

            <Pressable
              onPress={handleCreateRoom}
              disabled={!newRoomName.trim() || creating}
              style={[styles.createSubmitBtn, { backgroundColor: !newRoomName.trim() ? colors.muted : colors.primary }]}
            >
              <Text style={[styles.createSubmitText, { color: !newRoomName.trim() ? colors.mutedForeground : "#fff" }]}>
                {creating ? "Creating..." : "Create Room"}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <View
        style={[
          styles.header,
          { paddingTop: topPad + 8, backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Chatrooms</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {formatCount(CHATROOMS.reduce((s, r) => s + r.onlineCount, 0))} people chatting now
          </Text>
        </View>
        <Pressable
          style={[styles.createBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowCreate(true)}
          accessibilityLabel="Create chatroom"
        >
          <Feather name="plus" size={18} color="#fff" />
        </Pressable>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search chatrooms..."
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catScroll}
      >
        {ROOM_CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[
              styles.catChip,
              {
                backgroundColor:
                  activeCategory === cat ? colors.primary : colors.muted,
                borderColor:
                  activeCategory === cat ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.catText,
                { color: activeCategory === cat ? "#fff" : colors.mutedForeground },
              ]}
            >
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={[
          ...(joined.length > 0 ? [{ type: "header", label: `My Rooms (${joined.length})`, id: "h1" }] : []),
          ...joined.map((r) => ({ type: "room", ...r })),
          ...(discover.length > 0 ? [{ type: "header", label: "Discover", id: "h2" }] : []),
          ...discover.map((r) => ({ type: "room", ...r })),
        ] as any[]}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: (Platform.OS === "web" ? 84 : insets.bottom) + 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (item.type === "header") {
            return (
              <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>
                {item.label}
              </Text>
            );
          }
          return (
            <RoomCard
              room={item as Chatroom}
              onPress={() =>
                router.push({ pathname: "/chatroom/[id]", params: { id: item.id } })
              }
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="message-square" size={40} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No chatrooms found
            </Text>
          </View>
        }
      />
    </View>
  </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  createBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  catScroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  catText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  sectionHeader: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
    marginTop: 4,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    overflow: "hidden",
  },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  emojiWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 24 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5, flexWrap: "wrap" },
  roomName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  joinedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  joinedText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  roomDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth },
  lastMsg: { fontSize: 13, fontFamily: "Inter_400Regular" },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  statPill: { flexDirection: "row", alignItems: "center", gap: 4 },
  onlineDot: { width: 7, height: 7, borderRadius: 4 },
  statText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  timeText: { fontSize: 11, fontFamily: "Inter_400Regular", marginLeft: "auto" },
  empty: { alignItems: "center", gap: 8, paddingTop: 60 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    gap: 12,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 4 },
  modalLabel: { fontSize: 12, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.6 },
  modalInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  modalTextArea: { minHeight: 72, textAlignVertical: "top" },
  emojiRow: { gap: 8, paddingVertical: 4 },
  emojiBtn: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1.5 },
  emojiText: { fontSize: 22 },
  createSubmitBtn: { borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  createSubmitText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
