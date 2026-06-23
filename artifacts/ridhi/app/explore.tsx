import React, { useState } from "react";
import {
  Alert,
  Dimensions,
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
import { SeoHead } from "@/components/SeoHead";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { useTrackScreen, useAnalytics } from "@/hooks/useAnalytics";
import { Avatar } from "@/components/Avatar";
import { apiFetch } from "@/utils/api";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;

const LIVE_HOSTS = [
  { id: "l1", name: "Kavya Reddy", city: "Hyderabad", viewers: "1.2K", level: "L5", levelColor: "#FFD700", gradient: ["#E91E8C", "#FF6B35"] as [string, string] },
  { id: "l2", name: "Priya Sharma", city: "Mumbai", viewers: "840", level: "L4", levelColor: "#C0C0C0", gradient: ["#FF6B35", "#FFB800"] as [string, string] },
  { id: "l3", name: "Rahul D.", city: "Delhi", viewers: "612", level: "L3", levelColor: "#CD7F32", gradient: ["#4A90E2", "#7B2FBE"] as [string, string] },
  { id: "l4", name: "Meera K.", city: "Ahmedabad", viewers: "490", level: "L2", levelColor: "#CD7F32", gradient: ["#34C759", "#4A90E2"] as [string, string] },
  { id: "l5", name: "Arjun R.", city: "Bangalore", viewers: "1.5K", level: "L5", levelColor: "#FFD700", gradient: ["#7B2FBE", "#E91E8C"] as [string, string] },
];

const NEARBY_USERS = [
  { id: "n1", name: "Rohit Verma", city: "Mumbai", content: "Mumbai ki barish mein chai aur pakode — life complete hai yaar!", likes: 421, timeAgo: "30m ago" },
  { id: "n2", name: "Sneha Joshi", city: "Mumbai", content: "Vada Pav for ₹15 near Dadar station — best breakfast in the world.", likes: 892, timeAgo: "1h ago" },
  { id: "n3", name: "Manish Gupta", city: "Mumbai", content: "Marine Drive pe evening walk — Mumbai magic at its peak.", likes: 1204, timeAgo: "2h ago" },
  { id: "n4", name: "Neha Kulkarni", city: "Mumbai", content: "Ganpati bappa preparations in full swing!", likes: 2341, timeAgo: "3h ago" },
];

const TRENDING_HASHTAGS = [
  { tag: "#IndependenceDay", posts: "1.2M" },
  { tag: "#ChaiTime", posts: "840K" },
  { tag: "#DesiVibes", posts: "2.1M" },
  { tag: "#StreetFood", posts: "654K" },
  { tag: "#Bollywood", posts: "5.6M" },
  { tag: "#YogaDay", posts: "920K" },
  { tag: "#MonsoonMagic", posts: "431K" },
  { tag: "#CricketIndia", posts: "3.8M" },
  { tag: "#RidhiVibes", posts: "312K" },
  { tag: "#DesiContent", posts: "789K" },
];

const INITIAL_USERS = [
  { id: "su1", name: "Priya Kapoor", city: "Mumbai", followers: "128K", isVerified: true, isFollowing: false },
  { id: "su2", name: "Raj Nair", city: "Kochi", followers: "54K", isVerified: false, isFollowing: false },
  { id: "su3", name: "Anjali Singh", city: "Delhi", followers: "210K", isVerified: true, isFollowing: true },
  { id: "su4", name: "Vikram Rao", city: "Bangalore", followers: "87K", isVerified: true, isFollowing: false },
  { id: "su5", name: "Sneha Patel", city: "Ahmedabad", followers: "42K", isVerified: false, isFollowing: false },
  { id: "su6", name: "Arjun Kumar", city: "Hyderabad", followers: "95K", isVerified: true, isFollowing: false },
];

const TRENDING_POSTS = [
  { id: "tp1", gradient: ["#FF6B35", "#E91E8C"] as [string, string], emoji: "🌅", tall: true },
  { id: "tp2", gradient: ["#4A90E2", "#7B2FBE"] as [string, string], emoji: "🎵", tall: false },
  { id: "tp3", gradient: ["#34C759", "#4A90E2"] as [string, string], emoji: "💪", tall: false },
  { id: "tp4", gradient: ["#FFB800", "#FF6B35"] as [string, string], emoji: "🍛", tall: true },
  { id: "tp5", gradient: ["#E91E8C", "#7B2FBE"] as [string, string], emoji: "💃", tall: false },
  { id: "tp6", gradient: ["#7B2FBE", "#4A90E2"] as [string, string], emoji: "📸", tall: false },
];

export default function ExploreScreen() {
  useTrackScreen("explore");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"trending" | "people" | "hashtags">("trending");
  const [users, setUsers] = useState(INITIAL_USERS);
  const { user } = useAuth();
  const { trackFollow, trackSearch, trackHashtag } = useAnalytics();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const tabs = ["trending", "people", "hashtags"] as const;

  const q = query.toLowerCase().trim();

  const filteredPosts = q
    ? TRENDING_POSTS.filter((p) => p.emoji.includes(q) || p.id.includes(q))
    : TRENDING_POSTS;

  const filteredUsers = q
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.city.toLowerCase().includes(q)
      )
    : users;

  const filteredHashtags = q
    ? TRENDING_HASHTAGS.filter((h) => h.tag.toLowerCase().includes(q))
    : TRENDING_HASHTAGS;

  const toggleFollow = (id: string) => {
    const target = users.find((u) => u.id === id);
    const isFollowing = target?.isFollowing ?? false;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, isFollowing: !u.isFollowing } : u
      )
    );
    if (!isFollowing) {
      trackFollow(id);
    }
  };

  const sendFriendRequest = async (id: string) => {
    if (!user) {
      Alert.alert("Login Required", "Please log in to send friend requests.");
      return;
    }
    try {
      await apiFetch("/api/friend-requests/send", {
        method: "POST",
        body: JSON.stringify({ receiverId: id }),
      });
      Alert.alert("Friend Request Sent", "They'll be notified!");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Could not send friend request");
    }
  };

  return (
    <>
      <SeoHead
        title="Explore Ridhi — Trending Hashtags, Top Creators & Viral Reels | India"
        description="Discover what's trending on Ridhi — top hashtags, viral posts, popular creators, and live streams. Explore content in 13 Indian languages. Join the conversation!"
        canonical="/explore"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Explore Ridhi — Trending Hashtags, Top Creators & Viral Reels",
          url: "https://ridhi.app/explore",
          inLanguage: "en-IN",
          description: "Discover what's trending on Ridhi — top hashtags, viral posts, popular creators, and live streams in 13 Indian languages.",
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 10, backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search people, posts, hashtags..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => { if (query.trim()) trackSearch(query.trim()); }}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
        {tabs.map((t) => (
          <Pressable key={t} style={styles.tab} onPress={() => setActiveTab(t)}>
            <Text
              style={[
                styles.tabText,
                { color: activeTab === t ? colors.primary : colors.mutedForeground },
              ]}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
            {activeTab === t && (
              <View style={[styles.tabUnderline, { backgroundColor: colors.primary }]} />
            )}
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 84 : insets.bottom + 20 }}>
        {activeTab === "trending" && (
          <View>
            {/* ── Discovery chips ──────────────────────────────────────────── */}
            <View style={styles.discoveryStrip}>
              {/* Live chips */}
              <View style={styles.discoveryRow}>
                <View style={styles.discoveryLabel}>
                  <View style={styles.liveDot} />
                  <Text style={[styles.discoveryTitle, { color: colors.foreground }]}>Live</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.discoveryChips}>
                  {LIVE_HOSTS.map((host) => (
                    <Pressable key={host.id} style={[styles.liveChip, { borderColor: colors.border }]}>
                      <LinearGradient colors={host.gradient} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
                      <View style={styles.liveChipDot} />
                      <Text style={styles.liveChipName}>{host.name}</Text>
                      <Text style={styles.liveChipCount}>{host.viewers}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Nearby chips */}
              <View style={styles.discoveryRow}>
                <View style={styles.discoveryLabel}>
                  <Feather name="map-pin" size={12} color={colors.secondary} />
                  <Text style={[styles.discoveryTitle, { color: colors.foreground }]}>Near You</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.discoveryChips}>
                  {NEARBY_USERS.map((u) => (
                    <Pressable key={u.id} style={[styles.nearbyChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Avatar name={u.name} size={22} />
                      <Text style={[styles.nearbyChipName, { color: colors.foreground }]} numberOfLines={1}>{u.name}</Text>
                      <Text style={[styles.nearbyChipMeta, { color: colors.mutedForeground }]}>{u.likes >= 1000 ? `${(u.likes / 1000).toFixed(1)}k` : u.likes} ♥</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Trending Now</Text>
            {filteredPosts.length === 0 ? (
              <View style={styles.emptyResult}>
                <Feather name="search" size={32} color={colors.muted} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No posts match "{query}"</Text>
              </View>
            ) : (
              <View style={styles.postGrid}>
                {filteredPosts.map((post) => (
                  <Pressable
                    key={post.id}
                    onPress={() => router.push("/(tabs)" as any)}
                    style={[
                      styles.gridCard,
                      { width: CARD_W, height: post.tall ? CARD_W * 1.5 : CARD_W },
                    ]}
                    accessibilityLabel={`Trending post ${post.emoji}`}
                  >
                    <LinearGradient colors={post.gradient} style={StyleSheet.absoluteFill} />
                    <Text style={styles.gridEmoji}>{post.emoji}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === "people" && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Suggested for You</Text>
            {filteredUsers.length === 0 ? (
              <View style={styles.emptyResult}>
                <Feather name="users" size={32} color={colors.muted} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No people match "{query}"</Text>
              </View>
            ) : (
              filteredUsers.map((u) => (
                <View key={u.id} style={[styles.personRow, { borderBottomColor: colors.border }]}>
                  <Pressable onPress={() => router.push({ pathname: "/user-profile/[userId]", params: { userId: u.id } })}>
                    <Avatar name={u.name} size={48} />
                  </Pressable>
                  <Pressable style={{ flex: 1 }} onPress={() => router.push({ pathname: "/user-profile/[userId]", params: { userId: u.id } })}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.personName, { color: colors.foreground }]}>{u.name}</Text>
                      {u.isVerified && <Feather name="check-circle" size={14} color={colors.primary} />}
                    </View>
                    <Text style={[styles.personMeta, { color: colors.mutedForeground }]}>
                      {u.city} · {u.followers} followers
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => toggleFollow(u.id)}
                    style={[
                      styles.followBtn,
                      u.isFollowing
                        ? { backgroundColor: colors.muted, borderColor: colors.border }
                        : { borderColor: colors.primary },
                    ]}
                    accessibilityLabel={u.isFollowing ? `Unfollow ${u.name}` : `Follow ${u.name}`}
                  >
                    <Text
                      style={[
                        styles.followText,
                        { color: u.isFollowing ? colors.mutedForeground : colors.primary },
                      ]}
                    >
                      {u.isFollowing ? "Following" : "Follow"}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => sendFriendRequest(u.id)}
                    style={[styles.friendBtn, { backgroundColor: colors.success + "15", borderColor: colors.success + "40" }]}
                    accessibilityLabel={`Add ${u.name} as friend`}
                  >
                    <Feather name="user-plus" size={16} color={colors.success} />
                  </Pressable>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "hashtags" && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Trending Hashtags</Text>
            {filteredHashtags.length === 0 ? (
              <View style={styles.emptyResult}>
                <Feather name="hash" size={32} color={colors.muted} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No hashtags match "{query}"</Text>
              </View>
            ) : (
              filteredHashtags.map((h, i) => (
                <Pressable
                  key={h.tag}
                  onPress={() => setQuery(h.tag.replace("#", ""))}
                  style={[styles.hashtagRow, { borderBottomColor: colors.border }]}
                  accessibilityLabel={`${h.tag} with ${h.posts} posts`}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    style={styles.hashtagRank}
                  >
                    <Text style={styles.hashtagRankText}>{i + 1}</Text>
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.hashtagTag, { color: colors.foreground }]}>{h.tag}</Text>
                    <Text style={[styles.hashtagPosts, { color: colors.mutedForeground }]}>
                      {h.posts} posts
                    </Text>
                  </View>
                  <Feather name="trending-up" size={16} color={colors.success} />
                </Pressable>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
    </>
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
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12, position: "relative" },
  tabText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  tabUnderline: { position: "absolute", bottom: 0, left: "20%", right: "20%", height: 2, borderRadius: 1 },

  // Discovery chips
  discoveryStrip: { paddingTop: 12, paddingBottom: 8, gap: 10 },
  discoveryRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  discoveryLabel: { flexDirection: "row", alignItems: "center", gap: 6, paddingLeft: 16, minWidth: 70 },
  discoveryTitle: { fontSize: 13, fontFamily: "Inter_700Bold" },
  discoveryChips: { paddingHorizontal: 4, gap: 8, paddingRight: 16 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF3B30" },
  liveChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  liveChipDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#FF3B30" },
  liveChipName: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  liveChipCount: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Inter_400Regular" },
  nearbyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  nearbyChipName: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  nearbyChipMeta: { fontSize: 11, fontFamily: "Inter_400Regular" },

  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", paddingHorizontal: 16, paddingVertical: 16 },
  postGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4, paddingHorizontal: 16 },
  gridCard: {
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  gridEmoji: { fontSize: 36 },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  personName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  personMeta: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  followBtn: { borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  friendBtn: { borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, marginLeft: 8 },
  followText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  hashtagRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  hashtagRank: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  hashtagRankText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  hashtagTag: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  hashtagPosts: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  emptyResult: { alignItems: "center", gap: 10, paddingTop: 48, paddingHorizontal: 32 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
});
