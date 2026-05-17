import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/Avatar";
import { NOTIFICATIONS } from "@/data/mockData";

const NOTIF_ICONS: Record<string, { icon: string; color: string }> = {
  like: { icon: "heart", color: "#E91E8C" },
  match: { icon: "heart", color: "#7B2FBE" },
  comment: { icon: "message-circle", color: "#4A90E2" },
  coin: { icon: "star", color: "#FFB800" },
  follow: { icon: "user-plus", color: "#34C759" },
};

function getNavTarget(type: string): string {
  switch (type) {
    case "like":
    case "comment": return "/(tabs)";
    case "match": return "/(tabs)/match";
    case "coin": return "/wallet";
    case "follow": return "/(tabs)/profile";
    default: return "/(tabs)";
  }
}

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [notifications, setNotifications] = useState(
    NOTIFICATIONS.map((n) => ({ ...n }))
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleTap = (id: string, type: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    router.push(getNavTarget(type) as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 8, backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <Pressable
          onPress={markAllRead}
          style={[styles.readAllBtn, { opacity: unreadCount > 0 ? 1 : 0.4 }]}
          disabled={unreadCount === 0}
          accessibilityLabel="Mark all notifications as read"
        >
          <Text style={[styles.readAllText, { color: colors.primary }]}>Mark all read</Text>
        </Pressable>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => {
          const iconMeta = NOTIF_ICONS[item.type] ?? { icon: "bell", color: colors.primary };
          return (
            <Pressable
              onPress={() => handleTap(item.id, item.type)}
              style={({ pressed }) => [
                styles.notifItem,
                !item.read && { backgroundColor: colors.primary + "08" },
                pressed && { opacity: 0.75 },
              ]}
              accessibilityLabel={`${item.actor} ${item.content}`}
              accessibilityRole="button"
            >
              <View style={styles.notifAvatarWrap}>
                <Avatar name={item.actor} size={44} />
                <View style={[styles.notifIconBadge, { backgroundColor: iconMeta.color }]}>
                  <Feather name={iconMeta.icon as any} size={10} color="#fff" />
                </View>
              </View>
              <View style={styles.notifContent}>
                <Text style={[styles.notifText, { color: colors.foreground }]}>
                  <Text style={{ fontFamily: "Inter_600SemiBold" }}>{item.actor}</Text>{" "}
                  {item.content}
                </Text>
                <View style={styles.notifMeta}>
                  <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>{item.timeAgo}</Text>
                  <Text style={[styles.notifAction, { color: colors.primary }]}>
                    {item.type === "follow" ? "View Profile →" :
                     item.type === "match" ? "See Match →" :
                     item.type === "coin" ? "Open Wallet →" :
                     item.type === "comment" ? "View Post →" : "View →"}
                  </Text>
                </View>
              </View>
              {!item.read && (
                <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
              )}
            </Pressable>
          );
        }}
        ItemSeparatorComponent={() => (
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
        )}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 84 : 20 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="bell-off" size={40} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>All caught up!</Text>
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
    gap: 8,
  },
  backBtn: { padding: 4 },
  titleWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  unreadBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  unreadBadgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" },
  readAllBtn: { padding: 4 },
  readAllText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  notifItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  notifAvatarWrap: { position: "relative" },
  notifIconBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  notifContent: { flex: 1, gap: 4 },
  notifText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  notifMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  notifTime: { fontSize: 12, fontFamily: "Inter_400Regular" },
  notifAction: { fontSize: 11, fontFamily: "Inter_500Medium" },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  separator: { height: StyleSheet.hairlineWidth },
  empty: { alignItems: "center", gap: 8, paddingTop: 80 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
