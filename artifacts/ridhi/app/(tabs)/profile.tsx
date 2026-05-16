import React from "react";
import {
  Dimensions,
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
import { Avatar } from "@/components/Avatar";
import { CoinBadge } from "@/components/CoinBadge";
import { GradientButton } from "@/components/GradientButton";

const { width } = Dimensions.get("window");

const GRID_IMAGES = [
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300",
  "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=300",
  "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=300",
  "https://images.unsplash.com/photo-1604537529428-15bcbeecfe4d?w=300",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300",
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 60;
  const imageSize = (width - 4) / 3;

  if (!user) return null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: bottomPad + 20 }}
    >
      <LinearGradient
        colors={[colors.primary + "25", colors.secondary + "15", "transparent"]}
        style={[styles.headerBg, { paddingTop: topPad + 12 }]}
      >
        <View style={styles.headerRow}>
          <View style={{ width: 40 }} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
          <View style={styles.headerActions}>
            <Pressable onPress={() => router.push("/settings")} style={styles.headerBtn}>
              <Feather name="settings" size={22} color={colors.foreground} />
            </Pressable>
          </View>
        </View>

        <View style={styles.profileCore}>
          <Avatar name={user.name} size={88} hasStory />
          <Text style={[styles.name, { color: colors.foreground }]}>{user.name}</Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={14} color={colors.mutedForeground} />
            <Text style={[styles.location, { color: colors.mutedForeground }]}>{user.city}</Text>
          </View>
          {user.bio ? (
            <Text style={[styles.bio, { color: colors.foreground }]}>{user.bio}</Text>
          ) : null}
        </View>

        <View style={styles.statsRow}>
          {[
            { label: "Posts", value: user.posts },
            { label: "Followers", value: user.followers },
            { label: "Following", value: user.following },
          ].map((stat) => (
            <Pressable key={stat.label} style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {stat.value.toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable onPress={() => router.push("/wallet")} style={styles.walletRow}>
          <CoinBadge amount={user.coins} size="md" />
          <Text style={[styles.walletLabel, { color: colors.mutedForeground }]}>My Wallet</Text>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </Pressable>

        <View style={styles.profileBtns}>
          <GradientButton label="Edit Profile" onPress={() => {}} small style={{ flex: 1 }} />
          <GradientButton label="Boost Profile" onPress={() => {}} small outline style={{ flex: 1 }} />
        </View>
      </LinearGradient>

      <View style={styles.quickLinks}>
        {[
          { icon: "users", label: "Communities", route: "/communities", color: "#7B2FBE" },
          { icon: "zap", label: "Creator Studio", route: "/creator-dashboard", color: "#E91E8C" },
          { icon: "bar-chart-2", label: "Analytics", route: "/creator-dashboard", color: "#4A90E2" },
          { icon: "globe", label: "Explore", route: "/explore", color: "#34C759" },
        ].map((item) => (
          <Pressable
            key={item.label}
            onPress={() => router.push(item.route as any)}
            style={[styles.quickLink, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.quickLinkIcon, { backgroundColor: item.color + "20" }]}>
              <Feather name={item.icon as any} size={20} color={item.color} />
            </View>
            <Text style={[styles.quickLinkLabel, { color: colors.foreground }]}>{item.label}</Text>
            <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </View>

      <View style={styles.interestSection}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Interests</Text>
        <View style={styles.interestTags}>
          {user.interests.map((interest) => (
            <View key={interest} style={[styles.interestTag, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40" }]}>
              <Text style={[styles.interestText, { color: colors.primary }]}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.gridSection}>
        <View style={styles.gridHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Posts</Text>
          <Pressable>
            <Feather name="grid" size={20} color={colors.primary} />
          </Pressable>
        </View>
        <View style={styles.grid}>
          {GRID_IMAGES.map((uri, i) => (
            <Pressable
              key={i}
              style={[styles.gridItem, { width: imageSize, height: imageSize }]}
            >
              <LinearGradient
                colors={[colors.primary + "40", colors.secondary + "60"]}
                style={[StyleSheet.absoluteFill, { borderRadius: 2 }]}
              />
              <Feather name="image" size={24} color="rgba(255,255,255,0.5)" />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.logoutSection, { borderTopColor: colors.border }]}>
        <Pressable
          onPress={() => router.push("/settings")}
          style={[styles.settingsBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
        >
          <Feather name="settings" size={18} color={colors.foreground} />
          <Text style={[styles.settingsBtnText, { color: colors.foreground }]}>Settings & Privacy</Text>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </Pressable>
        <Pressable
          onPress={logout}
          style={[styles.logoutBtn, { backgroundColor: colors.destructive + "12", borderColor: colors.destructive + "30" }]}
        >
          <Feather name="log-out" size={18} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBg: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  headerActions: { flexDirection: "row", gap: 8 },
  headerBtn: { padding: 4 },
  profileCore: { alignItems: "center", gap: 8 },
  name: { fontSize: 24, fontFamily: "Inter_700Bold" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  location: { fontSize: 14, fontFamily: "Inter_400Regular" },
  bio: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20, paddingHorizontal: 20 },
  statsRow: { flexDirection: "row", marginTop: 16, marginHorizontal: -20 },
  stat: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 8 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  walletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  walletLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  profileBtns: { flexDirection: "row", gap: 10, marginTop: 4 },
  interestSection: { paddingHorizontal: 20, paddingTop: 20, gap: 12 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  interestTags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  interestTag: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  interestText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  gridSection: { paddingHorizontal: 0, paddingTop: 20, gap: 12 },
  gridHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 2 },
  gridItem: { alignItems: "center", justifyContent: "center", backgroundColor: "#ccc" },
  quickLinks: { paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  quickLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickLinkIcon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  quickLinkLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  logoutSection: { paddingHorizontal: 20, paddingTop: 24, borderTopWidth: StyleSheet.hairlineWidth, marginTop: 16, gap: 10 },
  settingsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  settingsBtnText: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  logoutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
