import React from "react";
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

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

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
        <Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text>
        <Pressable style={[styles.readAllBtn]}>
          <Text style={[styles.readAllText, { color: colors.primary }]}>Mark all read</Text>
        </Pressable>
      </View>

      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => {
          const iconMeta = NOTIF_ICONS[item.type] ?? { icon: "bell", color: colors.primary };
          return (
            <Pressable
              style={[
                styles.notifItem,
                !item.read && { backgroundColor: colors.primary + "08" },
              ]}
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
                <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>{item.timeAgo}</Text>
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
  title: { fontSize: 20, fontFamily: "Inter_700Bold", flex: 1 },
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
  notifContent: { flex: 1 },
  notifText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  notifTime: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 3 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  separator: { height: StyleSheet.hairlineWidth },
});
