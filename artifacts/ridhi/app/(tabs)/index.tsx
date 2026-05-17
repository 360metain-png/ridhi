import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { FeedPost, Post } from "@/components/FeedPost";
import { StoryRow } from "@/components/StoryRow";
import { CoinBadge } from "@/components/CoinBadge";
import { INITIAL_POSTS, STORIES } from "@/data/mockData";

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
    content: "Top 10 street food spots in Mumbai that every foodie must visit! 🍛🥘 Thread below 👇",
    likes: 8900,
    comments: 412,
    shares: 1560,
    isLiked: true,
    timeAgo: "4h",
    type: "text",
    hashtags: ["#MumbaiFoodGuide", "#StreetFood"],
  },
  {
    id: "t3",
    userName: "TechIndia",
    userAvatar: "",
    content: "India just surpassed 1 billion smartphone users! 🇮🇳📱 The digital revolution is here. What does this mean for us?",
    likes: 6300,
    comments: 289,
    shares: 870,
    isLiked: false,
    timeAgo: "6h",
    type: "text",
    hashtags: ["#DigitalIndia", "#TechNews"],
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
  {
    id: "c2",
    userName: "Bangalore Tech Hub",
    userAvatar: "",
    content: "Weekend hackathon results are in! 🏆 Congratulations to all 48 participants who built amazing projects. Full recap 🧵",
    likes: 2800,
    comments: 94,
    shares: 310,
    isLiked: true,
    timeAgo: "3h",
    type: "text",
    hashtags: ["#Hackathon", "#BangaloreTech"],
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
  const bottomPad = Platform.OS === "web" ? 84 : 60;

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
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Image source={LOGO} style={styles.logoMini} resizeMode="contain" />
        <Text style={[styles.appName, { color: colors.foreground }]}>Ridhi</Text>

        <View style={styles.headerActions}>
          <Pressable onPress={() => router.push("/explore")} style={styles.headerBtn}>
            <Feather name="search" size={22} color={colors.foreground} />
          </Pressable>
          <Pressable onPress={() => router.push("/communities")} style={styles.headerBtn}>
            <Feather name="users" size={22} color={colors.foreground} />
          </Pressable>
          <Pressable onPress={() => router.push("/notifications")} style={styles.headerBtn}>
            <Feather name="bell" size={22} color={colors.foreground} />
            <View style={[styles.notifDot, { backgroundColor: colors.primary }]} />
          </Pressable>
          <Pressable onPress={() => router.push("/wallet")} style={styles.headerBtn}>
            <CoinBadge amount={user?.coins ?? 0} size="sm" />
          </Pressable>
        </View>
      </View>

      <View style={[styles.feedTabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.feedTabScroll}>
          {FEED_TABS.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.feedTab,
                activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
              ]}
            >
              <Text
                style={[
                  styles.feedTabText,
                  { color: activeTab === tab ? colors.primary : colors.mutedForeground },
                ]}
              >
                {tab}
              </Text>
              {tab === "Trending" && (
                <View style={[styles.trendDot, { backgroundColor: colors.destructive }]} />
              )}
            </Pressable>
          ))}
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
            <StoryRow
              stories={STORIES}
              onAddStory={() => {}}
              onStory={() => {}}
              selfName={user?.name ?? "Me"}
            />
          ) : activeTab === "Trending" ? (
            <View style={[styles.trendingBanner, { backgroundColor: colors.destructive + "12" }]}>
              <Feather name="trending-up" size={16} color={colors.destructive} />
              <Text style={[styles.trendingBannerText, { color: colors.destructive }]}>
                Trending across India right now 🔥
              </Text>
            </View>
          ) : activeTab === "Community" ? (
            <View style={[styles.trendingBanner, { backgroundColor: colors.secondary + "12" }]}>
              <Feather name="users" size={16} color={colors.secondary} />
              <Text style={[styles.trendingBannerText, { color: colors.secondary }]}>
                Latest from your communities
              </Text>
            </View>
          ) : null
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  logoMini: { width: 34, height: 34 },
  appName: { fontSize: 20, fontFamily: "Inter_700Bold", flex: 1 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerBtn: { padding: 6, position: "relative" },
  notifDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  feedTabBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  feedTabScroll: {
    paddingHorizontal: 8,
  },
  feedTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  feedTabText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  trendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: -6,
  },
  trendingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    margin: 12,
    borderRadius: 12,
  },
  trendingBannerText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
