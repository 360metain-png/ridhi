import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { FeedPost, Post } from "@/components/FeedPost";
import { StoryRow } from "@/components/StoryRow";
import { CoinBadge } from "@/components/CoinBadge";
import { Avatar } from "@/components/Avatar";
import { INITIAL_POSTS, STORIES } from "@/data/mockData";

const AI_PICKS: Array<{ id: string; userName: string; reason: string; preview: string; tag: string }> = [
  { id: "ai1", userName: "Priya Sharma", reason: "Based on your interest in Dance", preview: "New Bollywood challenge taking India by storm 💃🔥", tag: "#RidhiDance" },
  { id: "ai2", userName: "Mumbai Foodies", reason: "You liked similar food posts", preview: "10 street food spots you MUST visit this monsoon 🍛", tag: "#MumbaiFoodGuide" },
  { id: "ai3", userName: "Tech With Rohan", reason: "Trending in your city", preview: "India's startup ecosystem is growing faster than ever 🚀", tag: "#StartupIndia" },
  { id: "ai4", userName: "Desi Fitness", reason: "Matches your fitness interest", preview: "5-minute morning yoga routine for busy Indians 🧘", tag: "#FitIndia" },
];

const LOGO = require("../../assets/images/ridhi_logo.png");

const FEED_TABS = ["For You", "Trending", "Community", "Following"] as const;
type FeedTab = typeof FEED_TABS[number];

const TRENDING_POSTS: Post[] = [
  {
    id: "t1",
    userName: "Priya Sharma",
    userAvatar: "",
    content: "🔥 This Bollywood dance challenge is going viral! Join the #RidhiDance movement sweeping India! 💃",
    likes: 12400,
    comments: 843,
    shares: 2100,
    isLiked: false,
    timeAgo: "2h",
    type: "text",
    hashtags: ["#RidhiDance", "#Trending", "#Bollywood"],
  },
  {
    id: "t2",
    userName: "Mumbai Foodies",
    userAvatar: "",
    content: "Top 10 street food spots in Mumbai that every foodie must visit! 🍛🥘",
    likes: 8900,
    comments: 412,
    shares: 1560,
    isLiked: true,
    timeAgo: "4h",
    type: "text",
    hashtags: ["#MumbaiFoodGuide", "#StreetFood"],
  },
];

const COMMUNITY_POSTS: Post[] = [
  {
    id: "c1",
    userName: "Tamil Nadu Creators",
    userAvatar: "",
    content: "நம்ம community-ல புதிய members-க்கு வரவேற்பு! 🎉 Share your first post and get 50 coins! #TamilCreators",
    likes: 3200,
    comments: 156,
    shares: 420,
    isLiked: false,
    timeAgo: "1h",
    type: "text",
    hashtags: ["#TamilCreators", "#NewMembers"],
  },
];

export default function FeedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FeedTab>("For You");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 66;

  const headerAnim = useRef(new Animated.Value(0)).current;
  const liveIndicator = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(liveIndicator, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(liveIndicator, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setRefreshing(false);
  };

  const getActivePosts = () => {
    switch (activeTab) {
      case "Trending": return TRENDING_POSTS;
      case "Community": return COMMUNITY_POSTS;
      case "Following": return INITIAL_POSTS.slice(0, 3);
      default: return posts;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary + "18", colors.secondary + "08", "transparent"]}
        style={[styles.headerGlow, { height: topPad + 120 }]}
        pointerEvents="none"
      />

      <Animated.View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            backgroundColor: colors.surface + "F0",
            borderBottomColor: colors.border,
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
          },
        ]}
      >
        <View style={styles.logoGroup}>
          <Image source={LOGO} style={styles.logoMini} resizeMode="contain" />
          <View>
            <Text style={[styles.appName, { color: colors.foreground }]}>Ridhi</Text>
            <View style={styles.onlineRow}>
              <Animated.View style={[styles.onlineDot, { backgroundColor: colors.success, opacity: liveIndicator }]} />
              <Text style={[styles.onlineText, { color: colors.mutedForeground }]}>2.4M online</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push("/explore")}
            style={[styles.headerBtn, { backgroundColor: colors.muted }]}
          >
            <Feather name="search" size={18} color={colors.foreground} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/notifications")}
            style={[styles.headerBtn, { backgroundColor: colors.muted }]}
          >
            <Feather name="bell" size={18} color={colors.foreground} />
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.notifBadge}
            />
          </Pressable>
          <Pressable onPress={() => router.push("/wallet")} style={styles.headerBtn}>
            <CoinBadge amount={user?.coins ?? 0} size="sm" />
          </Pressable>
        </View>
      </Animated.View>

      <View style={[styles.feedTabBar, { backgroundColor: colors.surface + "F0", borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.feedTabScroll}>
          {FEED_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.feedTab]}
              >
                {isActive ? (
                  <LinearGradient
                    colors={[colors.primary + "20", colors.secondary + "10"]}
                    style={styles.feedTabActive}
                  >
                    <Text style={[styles.feedTabText, { color: colors.primary }]}>{tab}</Text>
                    {tab === "Trending" && (
                      <View style={[styles.trendDot, { backgroundColor: colors.destructive }]} />
                    )}
                  </LinearGradient>
                ) : (
                  <View style={styles.feedTabInactive}>
                    <Text style={[styles.feedTabText, { color: colors.mutedForeground }]}>{tab}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={getActivePosts()}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <FeedPost
            post={item}
            onLike={handleLike}
            onComment={() => {}}
            onProfile={() => {}}
          />
        )}
        ListHeaderComponent={
          activeTab === "For You" ? (
            <>
              <StoryRow
                stories={STORIES}
                onAddStory={() => {}}
                onStory={() => {}}
                selfName={user?.name ?? "Me"}
              />
              <View style={styles.aiPicksSection}>
                <View style={styles.aiPicksHeader}>
                  <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={styles.aiPicksIcon}>
                    <Feather name="cpu" size={11} color="#fff" />
                  </LinearGradient>
                  <Text style={[styles.aiPicksTitle, { color: colors.foreground }]}>✨ AI Picks for You</Text>
                  <Pressable onPress={() => router.push("/ai-assistant")} style={[styles.aiPicksBtn, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.aiPicksBtnText, { color: colors.primary }]}>Tune</Text>
                  </Pressable>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.aiPicksScroll}>
                  {AI_PICKS.map((pick) => (
                    <Pressable key={pick.id} style={[styles.aiPickCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <LinearGradient colors={[colors.secondary + "18", colors.primary + "08"]} style={StyleSheet.absoluteFill} />
                      <View style={styles.aiPickCardTop}>
                        <Avatar name={pick.userName} size={28} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.aiPickCardName, { color: colors.foreground }]} numberOfLines={1}>{pick.userName}</Text>
                          <Text style={[styles.aiPickCardReason, { color: colors.primary }]} numberOfLines={1}>{pick.reason}</Text>
                        </View>
                      </View>
                      <Text style={[styles.aiPickCardPreview, { color: colors.foreground }]} numberOfLines={2}>{pick.preview}</Text>
                      <View style={[styles.aiPickCardTag, { backgroundColor: colors.primary + "18" }]}>
                        <Text style={[styles.aiPickCardTagText, { color: colors.primary }]}>{pick.tag}</Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </>
          ) : (
            <View style={[styles.tabBanner, { backgroundColor: activeTab === "Trending" ? colors.destructive + "12" : colors.secondary + "10" }]}>
              <LinearGradient
                colors={activeTab === "Trending" ? [colors.destructive + "20", "transparent"] : [colors.secondary + "20", "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Feather
                name={activeTab === "Trending" ? "trending-up" : "users"}
                size={15}
                color={activeTab === "Trending" ? colors.destructive : colors.secondary}
              />
              <Text style={[styles.tabBannerText, { color: activeTab === "Trending" ? colors.destructive : colors.secondary }]}>
                {activeTab === "Trending" ? "🔥 Trending across India right now" : "Latest from your communities"}
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: bottomPad + 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGlow: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    zIndex: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
    zIndex: 10,
  },
  logoGroup: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  logoMini: { width: 34, height: 34 },
  appName: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
  onlineText: { fontSize: 10, fontFamily: "Inter_400Regular" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerBtn: { padding: 8, borderRadius: 20, position: "relative" },
  notifBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#08080F",
  },
  feedTabBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  feedTabScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  feedTab: {},
  feedTabActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  feedTabInactive: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  feedTabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  trendDot: { width: 6, height: 6, borderRadius: 3 },
  tabBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  tabBannerText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  aiPicksSection: { paddingTop: 4, paddingBottom: 8 },
  aiPicksHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingBottom: 10 },
  aiPicksIcon: { width: 24, height: 24, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  aiPicksTitle: { fontSize: 14, fontFamily: "Inter_700Bold", flex: 1 },
  aiPicksBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  aiPicksBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  aiPicksScroll: { paddingHorizontal: 12, gap: 10, paddingRight: 16 },
  aiPickCard: {
    width: 200, borderRadius: 16, borderWidth: 1, padding: 12,
    gap: 8, overflow: "hidden",
  },
  aiPickCardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  aiPickCardName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  aiPickCardReason: { fontSize: 10, fontFamily: "Inter_400Regular" },
  aiPickCardPreview: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  aiPickCardTag: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  aiPickCardTagText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
