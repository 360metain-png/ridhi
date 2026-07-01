import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "./Avatar";
import { SubscriptionBadge, VipTier } from "./SubscriptionBadge";

export interface ChatPreview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  timeAgo: string;
  unread: number;
  isOnline: boolean;
  lastSeen?: string;
  isLocked?: boolean;
  vipTier?: VipTier;
}

interface ChatItemProps {
  chat: ChatPreview;
  onPress: (id: string) => void;
  onProfile?: (userId: string) => void;
}

export function ChatItem({ chat, onPress, onProfile }: ChatItemProps) {
  const colors = useColors();

  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && { backgroundColor: colors.muted }]}
      onPress={() => onPress(chat.id)}
    >
      <View style={styles.avatarWrap}>
        <Pressable onPress={() => onProfile?.(chat.userId)}>
          <Avatar name={chat.userName} uri={chat.userAvatar} size={50} />
        </Pressable>
        {chat.isOnline && (
          <View style={[styles.onlineDot, { backgroundColor: colors.success, borderColor: colors.surface }]} />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {chat.userName}
          </Text>
          {chat.vipTier && chat.vipTier !== "free" && (
            <SubscriptionBadge tier={chat.vipTier} size="sm" style={{ marginRight: "auto", marginLeft: 4 }} />
          )}
          <Text style={[styles.time, { color: colors.mutedForeground }]}>{chat.timeAgo}</Text>
        </View>
        <View style={styles.row}>
          <Text
            style={[
              styles.preview,
              { color: chat.unread > 0 ? colors.foreground : colors.mutedForeground },
              chat.unread > 0 && { fontFamily: "Inter_500Medium" },
            ]}
            numberOfLines={1}
          >
            {chat.isLocked ? "🔒 Unlock to read message" : chat.lastMessage}
          </Text>
          {chat.unread > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{chat.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  avatarWrap: { position: "relative" },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  content: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold", flex: 1 },
  time: { fontSize: 12, fontFamily: "Inter_400Regular" },
  preview: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" },
});
