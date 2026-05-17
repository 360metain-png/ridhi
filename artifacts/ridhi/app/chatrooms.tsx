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
import { CHATROOMS, ROOM_CATEGORIES, type Chatroom } from "@/data/chatrooms";

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function RoomCard({ room, onPress }: { room: Chatroom; onPress: () => void }) {
  const colors = useColors();
  return (
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

export default function ChatroomsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [rooms, setRooms] = useState(CHATROOMS);

  const filtered = rooms.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "All" || r.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const joined = filtered.filter((r) => r.isJoined);
  const discover = filtered.filter((r) => !r.isJoined);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          onPress={() => {}}
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
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: (Platform.OS === "web" ? 84 : 80) + 16 }}
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
});
