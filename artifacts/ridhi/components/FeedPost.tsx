import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "./Avatar";
import { WatermarkBadge } from "./WatermarkBadge";
import { useWatermark } from "@/hooks/useWatermark";
import { SubscriptionBadge, VipTier } from "./SubscriptionBadge";
import { ShareWithWatermark } from "./ShareWithWatermark";
import { DownloadService } from "./DownloadService";
import { useAuth } from "@/contexts/AuthContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Alert } from "react-native";

export interface PostReaction {
  emoji: string;
  count: number;
  selected?: boolean;
}

export interface Post {
  id: string;
  userId?: string;
  userName: string;
  userCity?: string;
  language?: string;
  userAvatar?: string;
  isVerified?: boolean;
  isOwn?: boolean;
  vipTier?: VipTier;
  privacy?: "public" | "followers" | "private";
  content?: string;
  imageUri?: string;
  // Carousel
  carouselImages?: string[];
  carouselIndex?: number;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  timeAgo: string;
  type?: string;
  hashtags?: string[];
  isBoosted?: boolean;
  boostViews?: number;
  // Repost
  repostCount?: number;
  isReposted?: boolean;
  repostedBy?: { userName: string; userId?: string; comment?: string };
  // Collaboration & sound
  duetWith?: { reelId: string; reelTitle: string; reelUser: string };
  stitchWith?: { reelId: string; reelTitle: string; reelUser: string; trim: string };
  soundId?: string;
  soundTitle?: string;
  soundArtist?: string;
  taggedProduct?: { id: string; name: string; price: number; image: string };
  // Emoji reactions
  reactions?: PostReaction[];
}

interface FeedPostProps {
  post: Post;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onProfile: (userId: string) => void;
  onMenuPress?: (id: string, isOwn: boolean) => void;
  onBoostPress?: (id: string) => void;
  onRepost?: (id: string) => void;
}

// ─── Privacy badge ─────────────────────────────────────────────────────────────
function PrivacyBadge({ privacy, colors }: { privacy?: string; colors: any }) {
  if (!privacy || privacy === "public") return null;
  const icon = privacy === "private" ? "lock" : "users";
  const label = privacy === "private" ? "Only me" : "Followers";
  return (
    <View style={[privBadgeStyles.wrap, { backgroundColor: colors.muted }]}>
      <Feather name={icon} size={9} color={colors.mutedForeground} />
      <Text style={[privBadgeStyles.text, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}
const privBadgeStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 4 },
  text: { fontSize: 9, fontFamily: "Inter_600SemiBold" },
});

// ─── HeartBurst ────────────────────────────────────────────────────────────────
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
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}>
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

// ─── Emoji Reaction Bar ──────────────────────────────────────────────────────
const DEFAULT_EMOJIS = ["❤️", "🔥", "😂", "😢", "🤯", "🙌"];

function EmojiReactionBar({ post, colors }: { post: Post; colors: any }) {
  const [reactions, setReactions] = useState<PostReaction[]>(
    post.reactions?.length ? post.reactions : DEFAULT_EMOJIS.map((e) => ({ emoji: e, count: 0, selected: false }))
  );
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const handleReact = (emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReactions((prev) => {
      if (selectedEmoji === emoji) {
        // Deselect: remove user's reaction
        setSelectedEmoji(null);
        return prev.map((r) =>
          r.emoji === emoji ? { ...r, count: Math.max(0, r.count - 1), selected: false } : r
        );
      }
      // Switch to new emoji: remove old, add new
      setSelectedEmoji(emoji);
      return prev.map((r) => {
        if (r.emoji === selectedEmoji) {
          return { ...r, count: Math.max(0, r.count - 1), selected: false };
        }
        if (r.emoji === emoji) {
          return { ...r, count: r.count + 1, selected: true };
        }
        return r;
      });
    });
  };

  return (
    <View>
      <View style={styles.reactionBar}>
        {reactions.map((r) => (
          <Pressable
            key={r.emoji}
            onPress={() => handleReact(r.emoji)}
            style={[
              styles.reactionChip,
              { backgroundColor: r.selected ? colors.primary + "25" : colors.muted },
              r.selected && { borderColor: colors.primary + "50", borderWidth: 1 },
            ]}
          >
            <Text style={styles.reactionEmoji}>{r.emoji}</Text>
            {r.count > 0 && (
              <Text style={[styles.reactionCount, { color: r.selected ? colors.primary : colors.mutedForeground }]}>
                {r.count >= 1000 ? `${(r.count / 1000).toFixed(1)}K` : r.count}
              </Text>
            )}
          </Pressable>
        ))}
        <Pressable onPress={() => setShowPicker(!showPicker)} style={[styles.reactionChip, { backgroundColor: colors.muted }]}>
          <Feather name="plus" size={14} color={colors.mutedForeground} />
        </Pressable>
      </View>
      {showPicker && (
        <View style={[styles.emojiPicker, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {["❤️", "🔥", "😂", "😢", "🤯", "🙌", "👏", "😍", "😡", "😲", "💀", "🙏"].map((emoji) => (
            <Pressable key={emoji} onPress={() => { handleReact(emoji); setShowPicker(false); }} style={styles.emojiPickerItem}>
              <Text style={styles.emojiPickerEmoji}>{emoji}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── FeedPost ──────────────────────────────────────────────────────────────────
export const FeedPost = React.memo(function FeedPost({
  post,
  onLike,
  onComment,
  onProfile,
  onMenuPress,
  onBoostPress,
  onRepost,
}: FeedPostProps) {
  const colors = useColors();
  const { saveWithWatermark, saving, saved } = useWatermark();
  const { trackShare, trackSave } = useAnalytics();
  const { user, savePost, unsavePost } = useAuth();
  const isSaved = user?.savedPosts?.includes(post.id) ?? false;
  const [showBurst, setShowBurst] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
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
    <Animated.View style={[styles.cardWrap, { opacity: cardOpacity, transform: [{ translateY: cardSlide }] }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <LinearGradient
          colors={post.isLiked ? ["rgba(233,30,140,0.05)", "transparent"] : ["transparent", "transparent"]}
          style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}
        />

        {/* ── Header ── */}
        <Pressable
          style={styles.header}
          onPress={() => onProfile(post.userId ?? "")}
          accessibilityRole="button"
          accessibilityLabel={`View ${post.userName}'s profile`}
        >
          <Avatar name={post.userName} uri={post.userAvatar} size={40} hasStory />
          <View style={styles.headerText}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: colors.foreground }]}>{post.userName}</Text>
              {post.isVerified && (
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.verifiedBadge}>
                  <Feather name="check" size={9} color="#fff" />
                </LinearGradient>
              )}
              {post.vipTier && post.vipTier !== "free" && (
                <SubscriptionBadge tier={post.vipTier} size="sm" />
              )}
              {post.isOwn && (
                <View style={[styles.ownBadge, { backgroundColor: colors.primary + "18" }]}>
                  <Text style={[styles.ownBadgeText, { color: colors.primary }]}>You</Text>
                </View>
              )}
              {post.isBoosted && (
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.boostBadge}>
                  <Feather name="trending-up" size={8} color="#fff" />
                  <Text style={styles.boostBadgeText}>Promoted</Text>
                </LinearGradient>
              )}
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                {post.userCity ? `${post.userCity} · ` : ""}{post.timeAgo}
              </Text>
              <PrivacyBadge privacy={post.privacy} colors={colors} />
            </View>
          </View>

          {/* ⋯ menu button */}
          <Pressable
            style={[styles.more, { backgroundColor: colors.muted }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onMenuPress?.(post.id, post.isOwn ?? false); }}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Feather name="more-horizontal" size={16} color={colors.mutedForeground} />
          </Pressable>
        </Pressable>

        {/* Repost badge */}
        {post.repostedBy && (
          <View style={[styles.repostBadge, { backgroundColor: colors.primary + "10" }]}>
            <Feather name="repeat" size={11} color={colors.primary} />
            <Text style={[styles.repostBadgeText, { color: colors.primary }]}>
              Reposted by {post.repostedBy.userName}
              {post.repostedBy.comment ? ` · "${post.repostedBy.comment}"` : ""}
            </Text>
          </View>
        )}

        {/* ── Content ── */}
        {post.content ? (
          <Text style={[styles.content, { color: colors.foreground }]}>{post.content}</Text>
        ) : null}

        {/* Collaboration badges */}
        {post.duetWith && (
          <View style={[styles.collabBadge, { backgroundColor: colors.primary + "12" }]}>
            <Text style={{ fontSize: 12 }}>🎙️</Text>
            <Text style={[styles.collabText, { color: colors.primary }]}>Duet with {post.duetWith.reelUser}</Text>
          </View>
        )}
        {post.stitchWith && (
          <View style={[styles.collabBadge, { backgroundColor: colors.secondary + "12" }]}>
            <Text style={{ fontSize: 12 }}>🪟</Text>
            <Text style={[styles.collabText, { color: colors.secondary }]}>Stitch with {post.stitchWith.reelUser}</Text>
          </View>
        )}
        {post.soundTitle && (
          <View style={[styles.collabBadge, { backgroundColor: colors.primary + "12" }]}>
            <Text style={{ fontSize: 12 }}>🎵</Text>
            <Text style={[styles.collabText, { color: colors.primary }]} numberOfLines={1}>{post.soundTitle} • {post.soundArtist}</Text>
          </View>
        )}

        {post.hashtags && post.hashtags.length > 0 && (
          <View style={styles.hashtagRow}>
            {post.hashtags.slice(0, 3).map((tag) => (
              <Text key={tag} style={[styles.hashtag, { color: colors.primary }]}>{tag}</Text>
            ))}
          </View>
        )}

        {/* Carousel or single image */}
        {post.carouselImages && post.carouselImages.length > 0 ? (
          <CarouselViewer images={post.carouselImages} colors={colors} />
        ) : post.imageUri ? (
          <View style={styles.imageWrap}>
            <Image source={{ uri: post.imageUri }} style={styles.image} resizeMode="cover" />
            <LinearGradient colors={["transparent", "rgba(0,0,0,0.4)"]} style={styles.imageOverlay} />
          </View>
        ) : null}

        {/* Tagged Product Card */}
        {post.taggedProduct?.id && (
          <Pressable
            style={[styles.productCard, { backgroundColor: colors.muted, borderColor: colors.border }]}
            onPress={() => {
              const pid = post.taggedProduct?.id;
              if (pid) router.push({ pathname: "/product-detail", params: { id: pid } });
            }}
          >
            <Image source={{ uri: post.taggedProduct.image }} style={styles.productThumb} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={1}>{post.taggedProduct.name}</Text>
              <Text style={[styles.productPrice, { color: colors.primary }]}>{post.taggedProduct.price} Coins</Text>
            </View>
            <View style={[styles.shopNowBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.shopNowText}>Shop Now</Text>
            </View>
          </Pressable>
        )}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* ── Emoji Reactions ── */}
        <EmojiReactionBar post={post} colors={colors} />

        {/* ── Actions ── */}
        <View style={styles.actions}>
          <Pressable
            style={styles.action}
            onPress={handleLike}
            accessibilityRole="button"
            accessibilityLabel={post.isLiked ? `Unlike, ${post.likes} likes` : `Like, ${post.likes} likes`}
            accessibilityState={{ selected: post.isLiked }}
          >
            <View style={{ position: "relative" }}>
              <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                {post.isLiked ? (
                  <LinearGradient colors={["#E91E8C", "#7B2FBE"]} style={styles.likeActive}>
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
            <Text style={[styles.actionCount, { color: post.isLiked ? colors.primary : colors.mutedForeground }]}>
              {post.likes >= 1000 ? `${(post.likes / 1000).toFixed(1)}K` : post.likes}
            </Text>
          </Pressable>

          <Pressable style={styles.action} onPress={() => onComment(post.id)} accessibilityRole="button">
            <View style={[styles.actionIcon, { backgroundColor: colors.muted }]}>
              <Feather name="message-circle" size={14} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.actionCount, { color: colors.mutedForeground }]}>{post.comments}</Text>
          </Pressable>

          <Pressable style={styles.action} onPress={() => { trackShare(post.id, "post"); setShowShare(true); }} accessibilityRole="button">
            <View style={[styles.actionIcon, { backgroundColor: colors.muted }]}>
              <Feather name="send" size={14} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.actionCount, { color: colors.mutedForeground }]}>{post.shares}</Text>
          </Pressable>

          <Pressable
            style={styles.action}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onRepost?.(post.id); }}
            accessibilityRole="button"
            accessibilityLabel={post.isReposted ? "Undo repost" : "Repost to followers"}
          >
            <View style={[styles.actionIcon, { backgroundColor: post.isReposted ? colors.primary + "20" : colors.muted }]}>
              <Feather name="repeat" size={14} color={post.isReposted ? colors.primary : colors.mutedForeground} />
            </View>
            <Text style={[styles.actionCount, { color: post.isReposted ? colors.primary : colors.mutedForeground }]}>
              {post.repostCount ?? 0}
            </Text>
          </Pressable>

          <View style={{ flex: 1 }} />

          <Pressable
            style={styles.action}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (isSaved) {
                unsavePost(post.id);
                Alert.alert("Removed", "Removed from collection");
              } else {
                savePost(post.id);
                trackSave(post.id, "post");
                Alert.alert("Saved", "Saved to collection");
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={isSaved ? "Remove from saved" : "Save post"}
          >
            <View style={[styles.actionIcon, { backgroundColor: isSaved ? colors.primary + "20" : colors.muted }]}>
              <Feather name="bookmark" size={14} color={isSaved ? colors.primary : colors.mutedForeground} />
            </View>
          </Pressable>

          <Pressable
            onPress={() => { trackSave(post.id, "post_download"); setShowDownload(true); }}
            accessibilityRole="button"
            accessibilityLabel="Download post"
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.muted }]}>
              <Feather name="download" size={14} color={colors.mutedForeground} />
            </View>
          </Pressable>
        </View>
      </View>

      {/* Share with Watermark */}
      <ShareWithWatermark
        visible={showShare}
        onClose={() => setShowShare(false)}
        data={{
          title: post.content ?? "Check this out on Ridhi!",
          message: `${post.content ?? "Awesome post"} by ${post.userName} from ${post.userCity ?? "India"} 🎨`,
          url: `https://ridhi.app/post/${post.id}`,
        }}
        type={post.type === "video" ? "video" : "post"}
      />

      {/* Paid download service */}
      <DownloadService
        visible={showDownload}
        onClose={() => setShowDownload(false)}
        contentId={post.id}
        contentType="post"
        contentTitle={post.content ?? "Post"}
        ownerName={post.userName}
        ownerId={post.userId ?? `user_${post.userName.replace(/\s+/g, "_").toLowerCase()}`}
      />
    </Animated.View>
  );
});

// ─── Carousel Viewer ───────────────────────────────────────────────────────────
function CarouselViewer({ images, colors }: { images: string[]; colors: any }) {
  const [index, setIndex] = useState(0);
  const flatListRef = useRef<ScrollView>(null);
  return (
    <View style={styles.carouselWrap}>
      <ScrollView
        ref={flatListRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          const w = e.nativeEvent.layoutMeasurement.width;
          setIndex(Math.round(x / w));
        }}
        scrollEventThrottle={16}
        style={styles.carouselScroll}
      >
        {images.map((uri, i) => (
          <Image key={i} source={{ uri }} style={[styles.carouselImage, { width: Dimensions.get("window").width - 24 }]} resizeMode="cover" />
        ))}
      </ScrollView>
      <View style={styles.carouselDots}>
        {images.map((_, i) => (
          <View key={i} style={[styles.carouselDot, { backgroundColor: i === index ? colors.primary : colors.mutedForeground }]} />
        ))}
      </View>
      <View style={[styles.carouselCount, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
        <Text style={styles.carouselCountText}>{index + 1}/{images.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap:      { paddingHorizontal: 12, paddingVertical: 5 },
  card:          { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  header:        { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10, gap: 10 },
  headerText:    { flex: 1 },
  nameRow:       { flexDirection: "row", alignItems: "center", gap: 5 },
  name:          { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  verifiedBadge: { width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  ownBadge:      { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  ownBadgeText:  { fontSize: 9, fontFamily: "Inter_700Bold" },
  meta:          { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  more:          { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  boostBadge:    { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6, marginLeft: 4 },
  boostBadgeText:{ fontSize: 8, fontFamily: "Inter_700Bold", color: "#fff" },
  content:       { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22, paddingHorizontal: 14, paddingBottom: 10, letterSpacing: 0.1 },
  hashtagRow:    { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingHorizontal: 14, paddingBottom: 10 },
  hashtag:       { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  imageWrap:     { position: "relative" },
  image:         { width: "100%", aspectRatio: 4 / 3 },
  imageOverlay:  { position: "absolute", bottom: 0, left: 0, right: 0, height: 60 },
  divider:       { height: StyleSheet.hairlineWidth, marginHorizontal: 14 },
  actions:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  action:        { flexDirection: "row", alignItems: "center", gap: 6 },
  actionIcon:    { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  likeActive:    { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  likeInactive:  { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  actionCount:   { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  repostBadge:   { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginHorizontal: 14, marginBottom: 6, alignSelf: "flex-start" },
  repostBadgeText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  collabBadge:   { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginHorizontal: 14, marginBottom: 8, alignSelf: "flex-start" },
  collabText:    { fontSize: 12, fontFamily: "Inter_500Medium" },
  // Carousel
  carouselWrap:  { position: "relative" },
  carouselScroll:{ width: "100%" },
  carouselImage: { width: "100%", aspectRatio: 4 / 3 },
  carouselDots:  { flexDirection: "row", gap: 6, position: "absolute", bottom: 12, left: 0, right: 0, justifyContent: "center" },
  carouselDot:   { width: 6, height: 6, borderRadius: 3 },
  carouselCount: { position: "absolute", top: 10, right: 14, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  carouselCountText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#fff" },
  // Product Card
  productCard: { flexDirection: "row", alignItems: "center", marginHorizontal: 14, marginTop: 4, marginBottom: 12, padding: 8, borderRadius: 12, borderWidth: 1, gap: 10 },
  productThumb: { width: 44, height: 44, borderRadius: 8 },
  productName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  productPrice: { fontSize: 12, fontFamily: "Inter_700Bold" },
  shopNowBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  shopNowText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" },
  // Emoji Reactions
  reactionBar: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 14, paddingTop: 10, paddingBottom: 4, gap: 8 },
  reactionChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 16 },
  reactionEmoji: { fontSize: 16 },
  reactionCount: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  emojiPicker: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 14, paddingVertical: 10, gap: 8, borderBottomWidth: 1 },
  emojiPickerItem: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)" },
  emojiPickerEmoji: { fontSize: 20 },
});
