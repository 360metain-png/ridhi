import React, { useState, useEffect } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { Avatar } from "@/components/Avatar";
import { PrivateHead } from "@/components/PrivateHead";
import { useTrackScreen, useAnalytics } from "@/hooks/useAnalytics";
import { apiFetch } from "@/utils/api";
import { MOCK_USERS } from "@/data/mockData";
import { GradientButton } from "@/components/GradientButton";
import { SubscriptionBadge } from "@/components/SubscriptionBadge";

const { width } = Dimensions.get("window");

// Extended user profile for viewing others
export interface PublicUserProfile {
  id: string;
  name: string;
  avatar?: string;
  city?: string;
  bio?: string;
  age?: number;
  gender?: string;
  isVerified?: boolean;
  plan?: string;
  interests?: string[];
  followers?: number;
  following?: number;
  posts?: number;
  isPublic?: boolean; // privacy setting
  isFriend?: boolean;
  friendRequestSent?: boolean;
  friendRequestReceived?: boolean;
  zodiacSign?: string;
  birthday?: string;
}

function getUserProfile(userId: string): PublicUserProfile | null {
  const found = MOCK_USERS.find((u) => u.id === userId);
  if (found) return found;
  // Fallback: generate from known user IDs in mock data
  const knownUsers: Record<string, PublicUserProfile> = {
    u1: { id: "u1", name: "Ananya Singh", avatar: "https://api.dicebear.com/7.x/avataaars/png?seed=ananya&size=200", city: "Delhi", age: 23, gender: "female", isVerified: true, plan: "diamond", bio: "Delhi girl with a love for street food, fashion, and late-night chai ☕", interests: ["Food", "Fashion", "Travel", "Music"], followers: 12400, following: 890, posts: 342, isPublic: true, isFriend: false },
    u2: { id: "u2", name: "Rahul Mehta", avatar: "https://api.dicebear.com/7.x/avataaars/png?seed=rahul&size=200", city: "Mumbai", age: 26, gender: "male", isVerified: false, plan: "free", bio: "Mumbai local. Marine Drive runs & filter coffee 🌊", interests: ["Fitness", "Photography", "Movies"], followers: 3400, following: 520, posts: 128, isPublic: true, isFriend: false },
    u3: { id: "u3", name: "Kavya Reddy", avatar: "https://api.dicebear.com/7.x/avataaars/png?seed=kavya&size=200", city: "Hyderabad", age: 24, gender: "female", isVerified: true, plan: "platinum", bio: "Hyderabadi biryani enthusiast. Techie by day, dancer by night 💃", interests: ["Dance", "Technology", "Food", "Books"], followers: 8900, following: 430, posts: 256, isPublic: false, isFriend: false },
    u4: { id: "u4", name: "Arjun Kumar", avatar: "https://api.dicebear.com/7.x/avataaars/png?seed=arjun&size=200", city: "Bangalore", age: 25, gender: "male", isVerified: true, plan: "gold", bio: "Bangalore tech bro who loves trekking and filter kaapi ☕", interests: ["Fitness", "Technology", "Travel", "Gaming"], followers: 5600, following: 320, posts: 189, isPublic: true, isFriend: true },
    u5: { id: "u5", name: "Meera Patel", avatar: "https://api.dicebear.com/7.x/avataaars/png?seed=meera&size=200", city: "Ahmedabad", age: 22, gender: "female", isVerified: false, plan: "free", bio: "Garba queen from Ahmedabad. Navratri is my season 🪔", interests: ["Dance", "Music", "Fashion"], followers: 2100, following: 180, posts: 98, isPublic: true, isFriend: false },
    u6: { id: "u6", name: "Dev Trivedi", avatar: "https://api.dicebear.com/7.x/avataaars/png?seed=dev&size=200", city: "Pune", age: 27, gender: "male", isVerified: true, plan: "silver", bio: "Pune-based storyteller. Poetry, startups, and long drives 🚗", interests: ["Writing", "Technology", "Travel", "Food"], followers: 6700, following: 410, posts: 234, isPublic: false, isFriend: false, friendRequestSent: true },
  };
  return knownUsers[userId] || null;
}

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { profilePublic } = useApp();
  const { trackFollow, trackUnfollow, trackBlock } = useAnalytics();
  useTrackScreen("user_profile");

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [friendStatus, setFriendStatus] = useState<"none" | "sent" | "received" | "friends">("none");
  const [showMenu, setShowMenu] = useState(false);
  const [showPosts, setShowPosts] = useState(false);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Try backend first
        const res = await apiFetch(`/api/users/${userId}`) as Response;
        if (res.ok) {
          const data = await res.json() as PublicUserProfile;
          setProfile(data);
          setIsFollowing(data.isFriend || false);
          setFriendStatus(
            data.isFriend ? "friends" :
            data.friendRequestSent ? "sent" :
            data.friendRequestReceived ? "received" : "none"
          );
        } else {
          throw new Error("Backend fetch failed");
        }
      } catch {
        // Fallback to mock data
        const mock = getUserProfile(userId);
        if (mock) {
          setProfile(mock);
          setIsFollowing(mock.isFriend || false);
          setFriendStatus(
            mock.isFriend ? "friends" :
            mock.friendRequestSent ? "sent" :
            mock.friendRequestReceived ? "received" : "none"
          );
        }
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);

  const handleFollow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFollowing((v) => !v);
    if (!isFollowing) trackFollow(userId);
    else trackUnfollow(userId);
  };

  const handleFriendRequest = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please log in to connect with others.");
      return;
    }
    if (friendStatus === "sent") {
      Alert.alert("Cancel Request?", "Do you want to cancel this friend request?", [
        { text: "No", style: "cancel" },
        { text: "Cancel Request", style: "destructive", onPress: () => setFriendStatus("none") },
      ]);
      return;
    }
    if (friendStatus === "received") {
      Alert.alert("Accept Request?", `${profile?.name} sent you a friend request.`, [
        { text: "Decline", style: "destructive", onPress: () => setFriendStatus("none") },
        { text: "Accept", onPress: () => setFriendStatus("friends") },
      ]);
      return;
    }
    if (friendStatus === "friends") {
      Alert.alert("Remove Friend?", `Remove ${profile?.name} from your friends?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => setFriendStatus("none") },
      ]);
      return;
    }
    try {
      await apiFetch("/api/friend-requests/send", {
        method: "POST",
        body: JSON.stringify({ receiverId: userId }),
      });
      setFriendStatus("sent");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Fallback: mock send
      setFriendStatus("sent");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleMessage = () => {
    if (!user) {
      Alert.alert("Login Required", "Please log in to send messages.");
      return;
    }
    router.push({ pathname: "/chat/[id]", params: { id: userId } });
  };

  const handleBlock = () => {
    Alert.alert("Block User?", `Block ${profile?.name}? They won't be able to see your profile or contact you.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Block", style: "destructive", onPress: () => { trackBlock(userId); setShowMenu(false); } },
    ]);
  };

  const handleReport = () => {
    Alert.alert("Report User", "Thank you for helping keep Ridhi safe. Our team will review this report.", [
      { text: "OK", onPress: () => setShowMenu(false) },
    ]);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 20;

  // Determine what to show based on privacy
  const canViewFull = isOwnProfile || (profile?.isPublic ?? true) || isFollowing || friendStatus === "friends";

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad, alignItems: "center", justifyContent: "center" }]}>
        <PrivateHead />
        <View style={[styles.loadingRing, { borderColor: colors.primary }]} />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading profile…</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <PrivateHead />
        <View style={[styles.header, { paddingTop: topPad + 8 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </Pressable>
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16 }}>
          <Feather name="user-x" size={48} color={colors.muted} />
          <Text style={[styles.ghostTitle, { color: colors.foreground }]}>User not found</Text>
          <Text style={[styles.ghostSub, { color: colors.mutedForeground }]}>This profile may have been deleted or doesn't exist.</Text>
        </View>
      </View>
    );
  }

  const displayName = profile.name;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PrivateHead />

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          {displayName}
        </Text>
        <Pressable onPress={() => setShowMenu(true)} style={styles.menuBtn}>
          <Feather name="more-vertical" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 24 }}>
        {/* Hero */}
        <LinearGradient
          colors={[colors.primary + "18", colors.secondary + "10", "transparent"]}
          style={styles.hero}
        >
          <View style={styles.avatarBlock}>
            <Avatar name={profile.name} uri={profile.avatar} size={100} hasStory />
            <Text style={[styles.name, { color: colors.foreground }]}>{displayName}</Text>
            {profile.isVerified && (
              <View style={styles.verifiedBadge}>
                <Feather name="check-circle" size={14} color="#4A90E2" />
                <Text style={[styles.verifiedText, { color: "#4A90E2" }]}>Verified</Text>
              </View>
            )}
            {profile.plan && profile.plan !== "free" && (
              <SubscriptionBadge tier={profile.plan as any} size="sm" style={{ marginTop: 4 }} />
            )}
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={12} color={colors.mutedForeground} />
              <Text style={[styles.location, { color: colors.mutedForeground }]}>
                {profile.city || "India"}
                {profile.age ? ` · ${profile.age}` : ""}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={[styles.statsRow, { borderColor: colors.border }]}>
            {[
              { label: "Posts", value: profile.posts ?? 0 },
              { label: "Followers", value: profile.followers ?? 0 },
              { label: "Following", value: profile.following ?? 0 },
            ].map((stat, i) => (
              <Pressable
                key={stat.label}
                onPress={() => stat.label === "Posts" && canViewFull ? setShowPosts(true) : null}
                style={[styles.stat, i < 2 && { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: colors.border }]}
              >
                <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value.toLocaleString()}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <View style={styles.actionRow}>
              <GradientButton
                label={isFollowing ? "Following" : "Follow"}
                onPress={handleFollow}
                small
                outline={isFollowing}
                style={{ flex: 1 }}
              />
              <GradientButton
                label={
                  friendStatus === "friends" ? "Friends" :
                  friendStatus === "sent" ? "Request Sent" :
                  friendStatus === "received" ? "Accept Request" :
                  "Add Friend"
                }
                onPress={handleFriendRequest}
                small
                outline={friendStatus === "friends" || friendStatus === "sent"}
                style={{ flex: 1 }}
              />
              <GradientButton
                label="Message"
                onPress={handleMessage}
                small
                outline
                style={{ flex: 1 }}
              />
            </View>
          )}
        </LinearGradient>

        {/* Private profile warning */}
        {!canViewFull && (
          <View style={[styles.privateBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="lock" size={24} color={colors.primary} />
            <Text style={[styles.privateTitle, { color: colors.foreground }]}>Private Profile</Text>
            <Text style={[styles.privateSub, { color: colors.mutedForeground }]}>
              {profile.name} has set their profile to private. Follow or add them as a friend to see their full profile.
            </Text>
            {!isFollowing && (
              <GradientButton
                label="Send Friend Request"
                onPress={handleFriendRequest}
                small
                style={{ marginTop: 12, alignSelf: "center" }}
              />
            )}
          </View>
        )}

        {/* Full profile content (only if public or friend) */}
        {canViewFull && (
          <>
            {/* Bio */}
            {profile.bio && (
              <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>BIO</Text>
                <Text style={[styles.bioText, { color: colors.foreground }]}>{profile.bio}</Text>
              </View>
            )}

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
              <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>INTERESTS</Text>
                <View style={styles.interestTags}>
                  {profile.interests.map((interest) => (
                    <View key={interest} style={[styles.interestTag, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "35" }]}>
                      <Text style={[styles.interestText, { color: colors.primary }]}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Posts Grid Preview */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.gridHeader}>
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>POSTS</Text>
                <Pressable onPress={() => setShowPosts(true)}>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
                </Pressable>
              </View>
              <View style={styles.grid}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <Pressable key={i} style={[styles.gridItem, { width: (width - 56) / 3, height: (width - 56) / 3 }]}>
                    <LinearGradient
                      colors={[i % 2 === 0 ? colors.primary : colors.secondary, i % 3 === 0 ? colors.secondary : colors.primary]}
                      style={[StyleSheet.absoluteFill, { borderRadius: 8, opacity: 0.3 }]}
                    />
                    <Feather name="image" size={22} color={colors.mutedForeground} />
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Menu Modal */}
      <Modal visible={showMenu} transparent animationType="slide" onRequestClose={() => setShowMenu(false)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setShowMenu(false)} />
        <View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Options</Text>
          <Pressable onPress={handleReport} style={styles.sheetRow}>
            <Feather name="flag" size={18} color={colors.destructive} />
            <Text style={[styles.sheetRowText, { color: colors.destructive }]}>Report User</Text>
          </Pressable>
          <Pressable onPress={handleBlock} style={styles.sheetRow}>
            <Feather name="slash" size={18} color={colors.destructive} />
            <Text style={[styles.sheetRowText, { color: colors.destructive }]}>Block User</Text>
          </Pressable>
          <Pressable onPress={() => { setShowMenu(false); Alert.alert("Share Profile", "Coming soon!"); }} style={styles.sheetRow}>
            <Feather name="share-2" size={18} color={colors.foreground} />
            <Text style={[styles.sheetRowText, { color: colors.foreground }]}>Share Profile</Text>
          </Pressable>
          <Pressable onPress={() => setShowMenu(false)} style={[styles.sheetRow, { borderBottomWidth: 0 }]}>
            <Feather name="x" size={18} color={colors.mutedForeground} />
            <Text style={[styles.sheetRowText, { color: colors.mutedForeground }]}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>

      {/* Posts Sheet */}
      <Modal visible={showPosts} transparent animationType="slide" onRequestClose={() => setShowPosts(false)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setShowPosts(false)} />
        <View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
          <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Posts ({profile.posts ?? 0})</Text>
            <Pressable onPress={() => setShowPosts(false)} style={[styles.sheetClose, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={16} color={colors.foreground} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
            <View style={styles.grid}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Pressable key={i} style={[styles.gridItem, { width: (width - 56) / 3, height: (width - 56) / 3 }]}>
                  <LinearGradient
                    colors={[i % 2 === 0 ? colors.primary : colors.secondary, i % 3 === 0 ? colors.secondary : colors.primary]}
                    style={[StyleSheet.absoluteFill, { borderRadius: 8, opacity: 0.3 }]}
                  />
                  <Feather name="image" size={22} color={colors.mutedForeground} />
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  menuBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "flex-end" },
  headerTitle: { flex: 1, fontSize: 17, fontFamily: "Inter_600SemiBold", textAlign: "center", marginHorizontal: 8 },

  hero: { paddingHorizontal: 20, paddingBottom: 20 },
  avatarBlock: { alignItems: "center", gap: 6, paddingTop: 16 },
  name: { fontSize: 22, fontFamily: "Inter_700Bold" },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  verifiedText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  location: { fontSize: 13, fontFamily: "Inter_400Regular" },

  statsRow: { flexDirection: "row", marginTop: 18, marginHorizontal: -20, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
  stat: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 10 },
  statValue: { fontSize: 19, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },

  actionRow: { flexDirection: "row", gap: 8, marginTop: 14, alignItems: "center" },

  section: { marginHorizontal: 16, marginTop: 12, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 10 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8 },
  bioText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  interestTags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  interestTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  interestText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  gridHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  seeAll: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  gridItem: { borderRadius: 8, alignItems: "center", justifyContent: "center", overflow: "hidden" },

  privateBanner: { marginHorizontal: 16, marginTop: 16, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 24, alignItems: "center", gap: 8 },
  privateTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  privateSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },

  sheetOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 12 },
  sheetTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 12 },
  sheetRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5E5" },
  sheetRowText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  sheetClose: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },

  loadingRing: { width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderTopColor: "transparent", marginBottom: 12 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  ghostTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  ghostSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 32 },
});
