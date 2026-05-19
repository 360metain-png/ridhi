import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { CoinBadge } from "@/components/CoinBadge";
import { Avatar } from "@/components/Avatar";

const LOGO = require("../../assets/images/ridhi_logo.png");

const FEED_TABS = ["For You", "Local", "Trending", "Community", "Following"] as const;
type FeedTab = typeof FEED_TABS[number];

export default function FeedScreen() {
  const colors    = useColors();
  const insets    = useSafeAreaInsets();
  const { user }  = useAuth();
  const [activeTab, setActiveTab] = useState<FeedTab>("For You");

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 66;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.push("/profile" as any)}>
            <Avatar name={user?.name ?? "Me"} uri={user?.avatar} size={34} />
          </Pressable>
        </View>

        <View style={styles.headerCenter}>
          <Text style={[styles.logoText, { color: colors.primary }]}>Ridhi</Text>
        </View>

        <View style={styles.headerRight}>
          <CoinBadge amount={user?.coins ?? 0} />
          <Pressable
            style={[styles.iconBtn, { backgroundColor: colors.muted }]}
            onPress={() => router.push("/notifications")}
          >
            <Feather name="bell" size={18} color={colors.foreground} />
          </Pressable>
        </View>
      </View>

      {/* ── Feed Tabs ── */}
      <View style={[styles.tabBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {FEED_TABS.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            >
              <Text style={[
                styles.tabText,
                { color: activeTab === tab ? colors.primary : colors.mutedForeground },
                activeTab === tab && { fontFamily: "Inter_700Bold" },
              ]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* ── Empty State ── */}
      <View style={[styles.emptyWrap, { paddingBottom: bottomPad }]}>
        <LinearGradient
          colors={[colors.primary + "18", colors.secondary + "10"]}
          style={styles.emptyIconWrap}
        >
          <Feather name="layout" size={36} color={colors.primary} />
        </LinearGradient>

        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Feed coming soon</Text>
        <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
          Real posts from your network will appear here.{"\n"}Start by creating your first post!
        </Text>

        <Pressable
          onPress={() => router.push("/create-post")}
          style={styles.createBtnWrap}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.createBtn}
          >
            <Feather name="plus" size={18} color="#fff" />
            <Text style={styles.createBtnText}>Create Post</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={() => router.push("/explore")}
          style={[styles.exploreBtn, { borderColor: colors.border }]}
        >
          <Feather name="compass" size={16} color={colors.primary} />
          <Text style={[styles.exploreBtnText, { color: colors.primary }]}>Explore Content</Text>
        </Pressable>
      </View>

      {/* ── Create FAB ── */}
      <Pressable
        style={[styles.fab, { bottom: bottomPad + 16 }]}
        onPress={() => router.push("/create-post")}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGrad}
        >
          <Feather name="plus" size={24} color="#fff" />
        </LinearGradient>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // header
  header:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  headerLeft:   { flex: 1 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerRight:  { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  logoText:     { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  iconBtn:      { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },

  // tabs
  tabBar:    { borderBottomWidth: StyleSheet.hairlineWidth },
  tabScroll: { paddingHorizontal: 12 },
  tab:       { paddingHorizontal: 14, paddingVertical: 12, marginRight: 4 },
  tabText:   { fontSize: 14, fontFamily: "Inter_500Medium" },

  // empty state
  emptyWrap:     { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 14 },
  emptyIconWrap: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center" },
  emptyTitle:    { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.5, textAlign: "center" },
  emptySub:      { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },

  createBtnWrap: { width: "100%", marginTop: 8 },
  createBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 15, borderRadius: 16 },
  createBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },

  exploreBtn:     { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16, borderWidth: 1.5 },
  exploreBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  // FAB
  fab:     { position: "absolute", right: 20 },
  fabGrad: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
});
