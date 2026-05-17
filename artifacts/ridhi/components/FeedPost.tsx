import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "./Avatar";

export interface Post {
  id: string;
  userId?: string;
  userName: string;
  userCity?: string;
  userAvatar?: string;
  isVerified?: boolean;
  content?: string;
  imageUri?: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  timeAgo: string;
  type?: string;
  hashtags?: string[];
}

interface FeedPostProps {
  post: Post;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onProfile: (userId: string) => void;
}

function HeartBurst({ visible }: { visible: boolean }) {
  const particles = Array.from({ length: 6 });
  const anims = useRef(particles.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (visible) {
      Animated.stagger(
        30,
        anims.map((a) =>
          Animated.sequence([
            Animated.timing(a, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(a, { toValue: 0, duration: 200, useNativeDriver: true }),
          ])
        )
      ).start();
    }
  }, [visible]);

  const angles = [0, 60, 120, 180, 240, 300];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {angles.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 18;
        const y = Math.sin(rad) * 18;
        return (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: 5,
              height: 5,
              borderRadius: 3,
              backgroundColor: "#E91E8C",
              opacity: anims[i],
              transform: [
                { translateX: anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, x] }) },
                { translateY: anims[i].interpolate({ inputRange: [0, 1], outputRange: [0, y] }) },
                { scale: anims[i].interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1.5, 0] }) },
              ],
            }}
          />
        );
      })}
    </View>
  );
}

export function FeedPost({ post, onLike, onComment, onProfile }: FeedPostProps) {
  const colors = useColors();
  const [showBurst, setShowBurst] = useState(false);
  const likeScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(cardSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!post.isLiked) {
      setShowBurst(true);
      Animated.sequence([
        Animated.spring(likeScale, { toValue: 1.5, useNativeDriver: true, speed: 60 }),
        Animated.spring(likeScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
      ]).start(() => setShowBurst(false));
    }
    onLike(post.id);
  };

  return (
    <Animated.View
      style={[
        styles.cardWrap,
        { opacity: cardOpacity, transform: [{ translateY: cardSlide }] },
      ]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <LinearGradient
          colors={post.isLiked
            ? ["rgba(233,30,140,0.05)", "transparent"]
            : ["transparent", "transparent"]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <Pressable style={styles.header} onPress={() => onProfile(post.userId ?? "")}>
          <Avatar name={post.userName} uri={post.userAvatar} size={40} hasStory />
          <View style={styles.headerText}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: colors.foreground }]}>{post.userName}</Text>
              {post.isVerified && (
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  style={styles.verifiedBadge}
                >
                  <Feather name="check" size={9} color="#fff" />
                </LinearGradient>
              )}
            </View>
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              {post.userCity ? `${post.userCity} · ` : ""}{post.timeAgo}
            </Text>
          </View>
          <Pressable style={[styles.more, { backgroundColor: colors.muted }]}>
            <Feather name="more-horizontal" size={16} color={colors.mutedForeground} />
          </Pressable>
        </Pressable>

        {post.content ? (
          <Text style={[styles.content, { color: colors.foreground }]}>
            {post.content}
          </Text>
        ) : null}

        {post.hashtags && post.hashtags.length > 0 && (
          <View style={styles.hashtagRow}>
            {post.hashtags.slice(0, 3).map((tag) => (
              <Text key={tag} style={[styles.hashtag, { color: colors.primary }]}>{tag}</Text>
            ))}
          </View>
        )}

        {post.imageUri ? (
          <View style={styles.imageWrap}>
            <Image
              source={{ uri: post.imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.4)"]}
              style={styles.imageOverlay}
            />
          </View>
        ) : null}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.actions}>
          <Pressable style={styles.action} onPress={handleLike}>
            <View style={{ position: "relative" }}>
              <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                {post.isLiked ? (
                  <LinearGradient
                    colors={["#E91E8C", "#7B2FBE"]}
                    style={styles.likeActive}
                  >
                    <Feather name="heart" size={14} color="#fff" />
                  </LinearGradient>
                ) : (
                  <View style={[styles.likeInactive, { backgroundColor: colors.muted }]}>
                    <Feather name="heart" size={14} color={colors.mutedForeground} />
                  </View>
                )}
              </Animated.View>
              <HeartBurst visible={showBurst} />
            </View>
            <Text style={[
              styles.actionCount,
              { color: post.isLiked ? colors.primary : colors.mutedForeground },
            ]}>
              {post.likes >= 1000 ? `${(post.likes / 1000).toFixed(1)}K` : post.likes}
            </Text>
          </Pressable>

          <Pressable style={styles.action} onPress={() => onComment(post.id)}>
            <View style={[styles.actionIcon, { backgroundColor: colors.muted }]}>
              <Feather name="message-circle" size={14} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.actionCount, { color: colors.mutedForeground }]}>
              {post.comments}
            </Text>
          </Pressable>

          <Pressable style={styles.action}>
            <View style={[styles.actionIcon, { backgroundColor: colors.muted }]}>
              <Feather name="send" size={14} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.actionCount, { color: colors.mutedForeground }]}>
              {post.shares}
            </Text>
          </Pressable>

          <View style={{ flex: 1 }} />

          <Pressable>
            <View style={[styles.actionIcon, { backgroundColor: colors.muted }]}>
              <Feather name="bookmark" size={14} color={colors.mutedForeground} />
            </View>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 10,
  },
  headerText: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  more: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    paddingHorizontal: 14,
    paddingBottom: 10,
    letterSpacing: 0.1,
  },
  hashtagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  hashtag: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  imageWrap: { position: "relative" },
  image: { width: "100%", aspectRatio: 4 / 3 },
  imageOverlay: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: 60,
  },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 14 },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  likeActive: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  likeInactive: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCount: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
