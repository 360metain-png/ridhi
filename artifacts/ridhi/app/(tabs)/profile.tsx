import React, { useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
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

type SheetType = "posts" | "followers" | "following" | null;

// Mock people for followers / following lists
const MOCK_FOLLOWERS = [
  { id: "f1",  name: "Ananya Singh",   city: "Delhi",     mutual: true,  followed: false },
  { id: "f2",  name: "Rahul Mehta",    city: "Mumbai",    mutual: false, followed: false },
  { id: "f3",  name: "Kavya Reddy",    city: "Hyderabad", mutual: true,  followed: true  },
  { id: "f4",  name: "Arjun Kumar",    city: "Bangalore", mutual: false, followed: false },
  { id: "f5",  name: "Meera Patel",    city: "Ahmedabad", mutual: true,  followed: true  },
  { id: "f6",  name: "Dev Trivedi",    city: "Pune",      mutual: false, followed: false },
  { id: "f7",  name: "Priyanka Nair",  city: "Kochi",     mutual: true,  followed: true  },
  { id: "f8",  name: "Siddharth Jha",  city: "Patna",     mutual: false, followed: false },
];

const MOCK_FOLLOWING = [
  { id: "g1",  name: "Kavya Reddy",    city: "Hyderabad", following: true  },
  { id: "g2",  name: "Meera Patel",    city: "Ahmedabad", following: true  },
  { id: "g3",  name: "Priyanka Nair",  city: "Kochi",     following: true  },
  { id: "g4",  name: "Divya Sharma",   city: "Chennai",   following: true  },
  { id: "g5",  name: "Rohan Verma",    city: "Jaipur",    following: true  },
  { id: "g6",  name: "Nikita Gupta",   city: "Lucknow",   following: true  },
];

const MOCK_POSTS = [
  { id: "p1",  likes: 284, comments: 42 },
  { id: "p2",  likes: 512, comments: 89 },
  { id: "p3",  likes: 167, comments: 95 },
  { id: "p4",  likes: 98,  comments: 23 },
  { id: "p5",  likes: 743, comments: 156 },
  { id: "p6",  likes: 431, comments: 67 },
  { id: "p7",  likes: 628, comments: 112 },
  { id: "p8",  likes: 215, comments: 38 },
  { id: "p9",  likes: 389, comments: 74 },
];

const POST_COLORS = [
  ["#7B2FBE", "#E91E8C"],
  ["#0F4C81", "#1976D2"],
  ["#B5451B", "#FF6F00"],
  ["#1B5E20", "#388E3C"],
  ["#4A148C", "#880E4F"],
  ["#E65100", "#F9A825"],
  ["#006064", "#00838F"],
  ["#880E4F", "#C2185B"],
  ["#1A237E", "#3949AB"],
];

const GRID_IMAGES = [
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300",
  "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=300",
  "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=300",
  "https://images.unsplash.com/photo-1604537529428-15bcbeecfe4d?w=300",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300",
];

export default function ProfileScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 60;
  const imageSize = (width - 4) / 3;

  const [sheet, setSheet] = useState<SheetType>(null);
  const [followStates, setFollowStates] = useState<Record<string, boolean>>(
    () => Object.fromEntries([...MOCK_FOLLOWERS, ...MOCK_FOLLOWING].map((p) => [p.id, ("followed" in p ? p.followed : p.following)]))
  );

  const toggleFollow = (id: string) =>
    setFollowStates((prev) => ({ ...prev, [id]: !prev[id] }));

  if (!user) return null;

  // ── bottom-sheet modal ────────────────────────────────────────────────────
  const sheetTitle =
    sheet === "posts"     ? `Posts (${user.posts})`          :
    sheet === "followers" ? `Followers (${user.followers})`  :
    sheet === "following" ? `Following (${user.following})`  : "";

  const renderSheet = () => {
    if (sheet === "posts") {
      return (
        <View style={styles.sheetPostGrid}>
          {MOCK_POSTS.map((p, i) => (
            <Pressable key={p.id} style={[styles.sheetPostCell, { width: (width - 8) / 3 }]}>
              <LinearGradient
                colors={POST_COLORS[i % POST_COLORS.length] as [string, string]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.sheetPostOverlay}>
                <Feather name="heart" size={13} color="rgba(255,255,255,0.9)" />
                <Text style={styles.sheetPostStat}>{p.likes}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      );
    }

    const people = sheet === "followers" ? MOCK_FOLLOWERS : MOCK_FOLLOWING;
    return (
      <View style={{ paddingHorizontal: 16, gap: 2 }}>
        {people.map((person) => {
          const isFollowing = followStates[person.id];
          const isMutual    = "mutual" in person && person.mutual;
          return (
            <View key={person.id} style={[styles.personRow, { borderBottomColor: colors.border }]}>
              <Avatar name={person.name} size={46} />
              <View style={{ flex: 1 }}>
                <View style={styles.personNameRow}>
                  <Text style={[styles.personName, { color: colors.foreground }]}>{person.name}</Text>
                  {isMutual && (
                    <View style={[styles.mutualBadge, { backgroundColor: colors.primary + "18" }]}>
                      <Text style={[styles.mutualText, { color: colors.primary }]}>Mutual</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.personCity, { color: colors.mutedForeground }]}>
                  <Feather name="map-pin" size={11} /> {person.city}
                </Text>
              </View>
              <Pressable
                onPress={() => toggleFollow(person.id)}
                style={[
                  styles.followBtn,
                  isFollowing
                    ? { backgroundColor: colors.muted, borderColor: colors.border }
                    : { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                <Text style={[styles.followBtnText, { color: isFollowing ? colors.mutedForeground : "#fff" }]}>
                  {isFollowing ? "Following" : "Follow"}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <>
    {/* ── Stats bottom sheet ────────────────────────────────────────────── */}
    <Modal
      visible={sheet !== null}
      transparent
      animationType="slide"
      onRequestClose={() => setSheet(null)}
    >
      <TouchableWithoutFeedback onPress={() => setSheet(null)}>
        <View style={styles.sheetOverlay} />
      </TouchableWithoutFeedback>
      <View style={[styles.sheetContainer, { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 }]}>
        {/* drag handle */}
        <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
        {/* header */}
        <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sheetTitle, { color: colors.foreground }]}>{sheetTitle}</Text>
          <Pressable onPress={() => setSheet(null)} style={[styles.sheetClose, { backgroundColor: colors.muted }]}>
            <Feather name="x" size={16} color={colors.foreground} />
          </Pressable>
        </View>
        {/* content */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
          {renderSheet()}
        </ScrollView>
      </View>
    </Modal>

    {/* ── Main profile scroll ───────────────────────────────────────────── */}
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
          {([
            { label: "Posts",     value: user.posts,     key: "posts"     },
            { label: "Followers", value: user.followers, key: "followers" },
            { label: "Following", value: user.following, key: "following" },
          ] as { label: string; value: number; key: SheetType }[]).map((stat, i) => (
            <Pressable
              key={stat.label}
              onPress={() => setSheet(stat.key)}
              style={[styles.stat, i < 2 && { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: colors.border }]}
            >
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {stat.value.toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
              <Feather name="chevron-down" size={11} color={colors.primary} style={{ marginTop: 1 }} />
            </Pressable>
          ))}
        </View>

        <Pressable onPress={() => router.push("/wallet")} style={styles.walletRow}>
          <CoinBadge amount={user.coins} size="md" />
          <Text style={[styles.walletLabel, { color: colors.mutedForeground }]}>My Wallet</Text>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </Pressable>

        <View style={styles.profileBtns}>
          <GradientButton label="Edit Profile" onPress={() => router.push("/auth/profile-setup" as any)} small style={{ flex: 1 }} />
          <GradientButton label="Boost Profile" onPress={() => router.push("/subscription")} small outline style={{ flex: 1 }} />
        </View>
      </LinearGradient>

      {/* Earn Money section */}
      <View style={styles.earnSection}>
        <Text style={[styles.earnTitle, { color: colors.foreground }]}>Earn on Ridhi</Text>
        <View style={styles.earnCards}>
          {/* Host card */}
          <Pressable
            onPress={() => router.push("/host-profile" as any)}
            style={[styles.earnCard, { backgroundColor: colors.card, borderColor: user.isHost ? "#FFB800" : colors.border }]}
          >
            <LinearGradient colors={["#7B2FBE22", "#FFB80018"]} style={styles.earnCardGrad}>
              <View style={[styles.earnCardIcon, { backgroundColor: "#FFB80022" }]}>
                <Feather name="star" size={22} color="#FFB800" />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.earnCardTitle, { color: colors.foreground }]}>Host Profile</Text>
                <Text style={[styles.earnCardSub, { color: colors.mutedForeground }]}>
                  {user.isHost ? "Earn from Lives & Calls" : "Up to ₹7L+/month"}
                </Text>
              </View>
              {user.isHost ? (
                <View style={styles.registeredBadge}>
                  <Feather name="check-circle" size={12} color="#22C55E" />
                  <Text style={styles.registeredText}>Active</Text>
                </View>
              ) : (
                <View style={styles.applyBadge}>
                  <Text style={styles.applyText}>Apply</Text>
                </View>
              )}
            </LinearGradient>
          </Pressable>

          {/* Agent card */}
          <Pressable
            onPress={() => router.push("/agent-dashboard" as any)}
            style={[styles.earnCard, { backgroundColor: colors.card, borderColor: user.isAgent ? "#00BCD4" : colors.border }]}
          >
            <LinearGradient colors={["#00BCD422", "#7B2FBE18"]} style={styles.earnCardGrad}>
              <View style={[styles.earnCardIcon, { backgroundColor: "#00BCD422" }]}>
                <Feather name="briefcase" size={22} color="#00BCD4" />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.earnCardTitle, { color: colors.foreground }]}>Agent Dashboard</Text>
                <Text style={[styles.earnCardSub, { color: colors.mutedForeground }]}>
                  {user.isAgent ? "Manage Hosts & Earn Commission" : "2–10% host commission"}
                </Text>
              </View>
              {user.isAgent ? (
                <View style={[styles.registeredBadge, { backgroundColor: "#00BCD420" }]}>
                  <Feather name="check-circle" size={12} color="#00BCD4" />
                  <Text style={[styles.registeredText, { color: "#00BCD4" }]}>Active</Text>
                </View>
              ) : (
                <View style={[styles.applyBadge, { backgroundColor: "#00BCD420" }]}>
                  <Text style={[styles.applyText, { color: "#00BCD4" }]}>Apply</Text>
                </View>
              )}
            </LinearGradient>
          </Pressable>
        </View>
      </View>

      <View style={styles.quickLinks}>
        {[
          { icon: "shield", label: "E-KYC Verification", route: "/kyc", color: "#22C55E" },

          { icon: "users", label: "Communities", route: "/communities", color: "#7B2FBE" },
          { icon: "zap", label: "Gaming Arena", route: "/games", color: "#4CAF50" },
          { icon: "award", label: "Tournaments", route: "/tournaments", color: "#FFB800" },
          { icon: "zap", label: "Creator Studio", route: "/creator-dashboard", color: "#E91E8C" },
          { icon: "video", label: "Go Live", route: "/live-stream", color: "#FF3B30" },
          { icon: "crosshair", label: "PK Battles", route: "/pk-battle", color: "#7B2FBE" },
          { icon: "phone", label: "Random Call", route: "/random-call", color: "#34C759" },
          { icon: "award", label: "Leaderboard", route: "/leaderboard", color: "#FF6B35" },
          { icon: "gift", label: "Referral & Rewards", route: "/referral", color: "#FF6B35" },
          { icon: "headphones", label: "Audio Rooms", route: "/audio-room", color: "#4A90E2" },
          { icon: "globe", label: "Explore", route: "/explore", color: "#5AC8FA" },
          { icon: "award", label: "VIP & Plans", route: "/subscription", color: "#E91E8C" },
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
    </>
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
  earnSection: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  earnTitle: { fontSize: 16, fontFamily: "Inter_700Bold", paddingHorizontal: 2 },
  earnCards: { gap: 10 },
  earnCard: { borderRadius: 18, borderWidth: 1.5, overflow: "hidden" },
  earnCardGrad: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  earnCardIcon: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  earnCardTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  earnCardSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  registeredBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, backgroundColor: "#22C55E20" },
  registeredText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#22C55E" },
  applyBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: "#FFB80020" },
  applyText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#FFB800" },
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

  // ── bottom sheet ──────────────────────────────────────────────────────────
  sheetOverlay:    { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  sheetContainer:  { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "78%", minHeight: 320 },
  sheetHandle:     { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 10, marginBottom: 4 },
  sheetHeader:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  sheetTitle:      { fontSize: 17, fontFamily: "Inter_700Bold" },
  sheetClose:      { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },

  // posts grid inside sheet
  sheetPostGrid:   { flexDirection: "row", flexWrap: "wrap", gap: 4, padding: 4, paddingTop: 12 },
  sheetPostCell:   { height: 110, borderRadius: 8, overflow: "hidden", alignItems: "center", justifyContent: "flex-end" },
  sheetPostOverlay:{ flexDirection: "row", alignItems: "center", gap: 4, padding: 8, width: "100%" },
  sheetPostStat:   { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },

  // people rows
  personRow:       { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  personNameRow:   { flexDirection: "row", alignItems: "center", gap: 6 },
  personName:      { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  personCity:      { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  mutualBadge:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  mutualText:      { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  followBtn:       { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  followBtnText:   { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
