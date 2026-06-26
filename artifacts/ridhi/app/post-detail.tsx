import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/Avatar";
import { PrivateHead } from "@/components/PrivateHead";
import { useTrackScreen } from "@/hooks/useAnalytics";
import { INITIAL_POSTS, REGIONAL_POSTS } from "@/data/mockData";
import { GradientButton } from "@/components/GradientButton";

const { width } = Dimensions.get("window");

export default function PostDetailScreen() {
  useTrackScreen("post_detail");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const allPosts = [...INITIAL_POSTS, ...REGIONAL_POSTS];
  const post = allPosts.find((p) => p.id === id) || allPosts[0];
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [liked, setLiked] = React.useState(post.isLiked);
  const [likes, setLikes] = React.useState(post.likes);
  const [saved, setSaved] = React.useState(false);

  const toggleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  const sharePost = async () => {
    const { Share } = await import("react-native");
    try {
      await Share.share({
        message: `Check out this post on Ridhi: "${post.content?.slice(0, 100) || "Post"}"`,
        title: "Ridhi Post",
      });
    } catch {
      // dismissed
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PrivateHead />
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 10, borderBottomColor: colors.border }]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Post</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {/* Author */}
        <Pressable
          onPress={() => router.push({ pathname: "/user-profile/[userId]", params: { userId: post.userId || post.id } })}
          style={[styles.authorRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
        >
          <Avatar name={post.userName} size={44} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.authorName, { color: colors.foreground }]}>{post.userName}</Text>
            <Text style={[styles.authorMeta, { color: colors.mutedForeground }]}>
              {post.userCity} · {post.timeAgo}
            </Text>
          </View>
          {post.isVerified && <Feather name="check-circle" size={16} color={colors.primary} />}
        </Pressable>

        {/* Content */}
        <View style={[styles.contentWrap, { backgroundColor: colors.card }]}>
          {post.content && (
            <Text style={[styles.contentText, { color: colors.foreground }]}>{post.content}</Text>
          )}
          {post.imageUri && (
            <Image source={{ uri: post.imageUri }} style={[styles.postImage, { width: width - 32 }]} resizeMode="cover" />
          )}
          {post.carouselImages && post.carouselImages.length > 0 && (
            <View style={styles.carouselWrap}>
              {post.carouselImages.map((img, idx) => (
                <Image key={idx} source={{ uri: img }} style={[styles.carouselImg, { width: width - 32 }]} resizeMode="cover" />
              ))}
            </View>
          )}
          {post.hashtags && (
            <View style={styles.tagsRow}>
              {post.hashtags.map((tag) => (
                <Text key={tag} style={[styles.tag, { color: colors.primary }]}>#{tag}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={[styles.actions, { borderBottomColor: colors.border }]}>
          <Pressable onPress={toggleLike} style={styles.actionBtn}>
            <Feather name={liked ? "heart" : "heart"} size={22} color={liked ? colors.destructive : colors.foreground} />
            <Text style={[styles.actionText, { color: colors.foreground }]}>{likes}</Text>
          </Pressable>
          <Pressable style={styles.actionBtn}>
            <Feather name="message-circle" size={22} color={colors.foreground} />
            <Text style={[styles.actionText, { color: colors.foreground }]}>{post.comments}</Text>
          </Pressable>
          <Pressable onPress={sharePost} style={styles.actionBtn}>
            <Feather name="share-2" size={22} color={colors.foreground} />
            <Text style={[styles.actionText, { color: colors.foreground }]}>{post.shares}</Text>
          </Pressable>
          <Pressable onPress={() => setSaved(!saved)} style={styles.actionBtn}>
            <Feather name={saved ? "bookmark" : "bookmark"} size={22} color={saved ? colors.primary : colors.foreground} />
          </Pressable>
        </View>

        {/* Comments mock */}
        <View style={[styles.section, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Comments</Text>
          <View style={styles.commentRow}>
            <Avatar name="Rohan" size={32} />
            <View style={[styles.commentBubble, { backgroundColor: colors.muted }]}>
              <Text style={[styles.commentName, { color: colors.foreground }]}>Rohan · <Text style={{ color: colors.mutedForeground }}>2h ago</Text></Text>
              <Text style={[styles.commentText, { color: colors.foreground }]}>This is amazing! 🔥</Text>
            </View>
          </View>
          <View style={styles.commentRow}>
            <Avatar name="Priya" size={32} />
            <View style={[styles.commentBubble, { backgroundColor: colors.muted }]}>
              <Text style={[styles.commentName, { color: colors.foreground }]}>Priya · <Text style={{ color: colors.mutedForeground }}>5h ago</Text></Text>
              <Text style={[styles.commentText, { color: colors.foreground }]}>Love this content!</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "flex-start" },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  authorName: { fontSize: 15, fontWeight: "700" },
  authorMeta: { fontSize: 13, marginTop: 2 },
  contentWrap: { padding: 16 },
  contentText: { fontSize: 15, lineHeight: 22, marginBottom: 12 },
  postImage: { width: "100%", height: 340, borderRadius: 12, marginTop: 8 },
  carouselWrap: { gap: 12 },
  carouselImg: { width: "100%", height: 340, borderRadius: 12 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  tag: { fontSize: 14, fontWeight: "600" },
  actions: {
    flexDirection: "row",
    padding: 16,
    gap: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionText: { fontSize: 14, fontWeight: "600" },
  section: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  commentRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  commentBubble: { flex: 1, borderRadius: 14, padding: 12 },
  commentName: { fontSize: 13, fontWeight: "600", marginBottom: 2 },
  commentText: { fontSize: 14, lineHeight: 20 },
});
