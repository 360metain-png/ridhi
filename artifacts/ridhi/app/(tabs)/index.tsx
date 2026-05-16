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

export default function FeedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [refreshing, setRefreshing] = useState(false);

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

      <FlatList
        data={posts}
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
          <StoryRow
            stories={STORIES}
            onAddStory={() => {}}
            onStory={() => {}}
            selfName={user?.name ?? "Me"}
          />
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
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  logoMini: {
    width: 34,
    height: 34,
  },
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
});
