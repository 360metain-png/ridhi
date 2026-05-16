import React, { useState } from "react";
import {
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
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/Avatar";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;

const TRENDING_HASHTAGS = [
  { tag: "#IndependenceDay", posts: "1.2M" },
  { tag: "#ChaiTime", posts: "840K" },
  { tag: "#DesiVibes", posts: "2.1M" },
  { tag: "#StreetFood", posts: "654K" },
  { tag: "#Bollywood", posts: "5.6M" },
  { tag: "#YogaDay", posts: "920K" },
  { tag: "#MonsoonMagic", posts: "431K" },
  { tag: "#CricketIndia", posts: "3.8M" },
];

const SUGGESTED_USERS = [
  { id: "su1", name: "Priya Kapoor", city: "Mumbai", followers: "128K", isVerified: true },
  { id: "su2", name: "Raj Nair", city: "Kochi", followers: "54K", isVerified: false },
  { id: "su3", name: "Anjali Singh", city: "Delhi", followers: "210K", isVerified: true },
  { id: "su4", name: "Vikram Rao", city: "Bangalore", followers: "87K", isVerified: true },
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
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"trending" | "people" | "hashtags">("trending");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const tabs = ["trending", "people", "hashtags"] as const;

  return (
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
            autoFocus
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 84 : 20 }}>
        {activeTab === "trending" && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Trending Now</Text>
            <View style={styles.postGrid}>
              {TRENDING_POSTS.map((post, i) => (
                <Pressable
                  key={post.id}
                  style={[
                    styles.gridCard,
                    { width: CARD_W, height: post.tall ? CARD_W * 1.5 : CARD_W },
                  ]}
                >
                  <LinearGradient colors={post.gradient} style={StyleSheet.absoluteFill} />
                  <Text style={styles.gridEmoji}>{post.emoji}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {activeTab === "people" && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Suggested for You</Text>
            {SUGGESTED_USERS.map((u) => (
              <View key={u.id} style={[styles.personRow, { borderBottomColor: colors.border }]}>
                <Avatar name={u.name} size={48} />
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.personName, { color: colors.foreground }]}>{u.name}</Text>
                    {u.isVerified && <Feather name="check-circle" size={14} color={colors.primary} />}
                  </View>
                  <Text style={[styles.personMeta, { color: colors.mutedForeground }]}>
                    {u.city} · {u.followers} followers
                  </Text>
                </View>
                <Pressable style={[styles.followBtn, { borderColor: colors.primary }]}>
                  <Text style={[styles.followText, { color: colors.primary }]}>Follow</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {activeTab === "hashtags" && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Trending Hashtags</Text>
            {TRENDING_HASHTAGS.map((h, i) => (
              <Pressable
                key={h.tag}
                style={[styles.hashtagRow, { borderBottomColor: colors.border }]}
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
            ))}
          </View>
        )}
      </ScrollView>
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
});
