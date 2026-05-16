import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "./Avatar";

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userCity: string;
  userAvatar?: string;
  isVerified?: boolean;
  content?: string;
  imageUri?: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  timeAgo: string;
}

interface FeedPostProps {
  post: Post;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onProfile: (userId: string) => void;
}

export function FeedPost({ post, onLike, onComment, onProfile }: FeedPostProps) {
  const colors = useColors();

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLike(post.id);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <Pressable style={styles.header} onPress={() => onProfile(post.userId)}>
        <Avatar name={post.userName} uri={post.userAvatar} size={40} hasStory />
        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.foreground }]}>{post.userName}</Text>
            {post.isVerified && (
              <Feather name="check-circle" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>{post.userCity} · {post.timeAgo}</Text>
        </View>
        <Pressable style={styles.more}>
          <Feather name="more-horizontal" size={20} color={colors.mutedForeground} />
        </Pressable>
      </Pressable>

      {post.content ? (
        <Text style={[styles.content, { color: colors.foreground }]}>{post.content}</Text>
      ) : null}

      {post.imageUri ? (
        <Image
          source={{ uri: post.imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : null}

      <View style={styles.actions}>
        <Pressable style={styles.action} onPress={handleLike}>
          <Feather
            name="heart"
            size={22}
            color={post.isLiked ? colors.primary : colors.mutedForeground}
            fill={post.isLiked ? colors.primary : "transparent"}
          />
          <Text style={[styles.actionCount, { color: post.isLiked ? colors.primary : colors.mutedForeground }]}>
            {post.likes}
          </Text>
        </Pressable>

        <Pressable style={styles.action} onPress={() => onComment(post.id)}>
          <Feather name="message-circle" size={22} color={colors.mutedForeground} />
          <Text style={[styles.actionCount, { color: colors.mutedForeground }]}>{post.comments}</Text>
        </Pressable>

        <Pressable style={styles.action}>
          <Feather name="send" size={22} color={colors.mutedForeground} />
          <Text style={[styles.actionCount, { color: colors.mutedForeground }]}>{post.shares}</Text>
        </Pressable>

        <Pressable style={[styles.action, { marginLeft: "auto" }]}>
          <Feather name="bookmark" size={22} color={colors.mutedForeground} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  headerText: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center" },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  meta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  more: { padding: 4 },
  content: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  image: { width: "100%", aspectRatio: 4 / 3 },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  actionCount: { fontSize: 13, fontFamily: "Inter_500Medium" },
});
