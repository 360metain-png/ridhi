import React, { useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useColors } from "@/hooks/useColors";
import { PrivateHead } from "@/components/PrivateHead";
import { useAuth } from "@/contexts/AuthContext";
import { getZodiacFromBirthday, ZODIAC_LIST } from "@/utils/zodiac";
import { Avatar, AvatarPicker } from "@/components/Avatar";
import { CoinBadge } from "@/components/CoinBadge";
const COIN_IMAGE = require("../../assets/images/ridhi_coin.png");
import { GradientButton } from "@/components/GradientButton";
import { SubscriptionBadge, VipTier } from "@/components/SubscriptionBadge";
import { useTrackScreen, useAnalytics } from "@/hooks/useAnalytics";
import { INITIAL_POSTS } from "@/data/mockData";

const { width } = Dimensions.get("window");

type SheetType = "posts" | "followers" | "following" | null;

const MOCK_FOLLOWERS = [
  { id: "f1", name: "Ananya Singh",  city: "Delhi",     mutual: true,  followed: false },
  { id: "f2", name: "Rahul Mehta",   city: "Mumbai",    mutual: false, followed: false },
  { id: "f3", name: "Kavya Reddy",   city: "Hyderabad", mutual: true,  followed: true  },
  { id: "f4", name: "Arjun Kumar",   city: "Bangalore", mutual: false, followed: false },
  { id: "f5", name: "Meera Patel",   city: "Ahmedabad", mutual: true,  followed: true  },
  { id: "f6", name: "Dev Trivedi",   city: "Pune",      mutual: false, followed: false },
  { id: "f7", name: "Priyanka Nair", city: "Kochi",     mutual: true,  followed: true  },
  { id: "f8", name: "Siddharth Jha", city: "Patna",     mutual: false, followed: false },
];

const MOCK_FOLLOWING = [
  { id: "g1", name: "Kavya Reddy",  city: "Hyderabad", following: true },
  { id: "g2", name: "Meera Patel",  city: "Ahmedabad", following: true },
  { id: "g3", name: "Priyanka Nair",city: "Kochi",     following: true },
  { id: "g4", name: "Divya Sharma", city: "Chennai",   following: true },
  { id: "g5", name: "Rohan Verma",  city: "Jaipur",    following: true },
  { id: "g6", name: "Nikita Gupta", city: "Lucknow",   following: true },
];

const MOCK_POSTS = [
  { id: "p1", likes: 284, comments: 42  },
  { id: "p2", likes: 512, comments: 89  },
  { id: "p3", likes: 167, comments: 95  },
  { id: "p4", likes: 98,  comments: 23  },
  { id: "p5", likes: 743, comments: 156 },
  { id: "p6", likes: 431, comments: 67  },
  { id: "p7", likes: 628, comments: 112 },
  { id: "p8", likes: 215, comments: 38  },
  { id: "p9", likes: 389, comments: 74  },
];

const POST_COLORS = [
  ["#7B2FBE","#E91E8C"], ["#0F4C81","#1976D2"], ["#B5451B","#FF6F00"],
  ["#1B5E20","#388E3C"], ["#4A148C","#880E4F"], ["#E65100","#F9A825"],
  ["#006064","#00838F"], ["#880E4F","#C2185B"], ["#1A237E","#3949AB"],
];

// ── User content for profile tabs ──────────────────────────────────────────
const USER_POSTS = INITIAL_POSTS.filter(p => p.userId === "me" || p.isOwn);

const USER_VIDEOS = [
  { id: "v1", thumbnail: "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=400", title: "Monsoon vlog", views: "1.2K", duration: "02:34" },
  { id: "v2", thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400", title: "Goa trip", views: "3.4K", duration: "04:12" },
  { id: "v3", thumbnail: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400", title: "Morning run", views: "892", duration: "01:45" },
  { id: "v4", thumbnail: "https://images.unsplash.com/photo-1604537529428-15bcbeecfe4d?w=400", title: "Garba night", views: "5.1K", duration: "03:22" },
  { id: "v5", thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", title: "Rain walk", views: "678", duration: "01:12" },
  { id: "v6", thumbnail: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400", title: "Vada Pav hunt", views: "2.1K", duration: "02:08" },
];

const USER_REELS = [
  { id: "ur1", thumbnail: "https://images.unsplash.com/photo-1604537529428-15bcbeecfe4d?w=400", likes: 45200, caption: "Bollywood night at Juhu!" },
  { id: "ur2", thumbnail: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400", likes: 23100, caption: "OOTD — traditional edition" },
  { id: "ur3", thumbnail: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400", likes: 18700, caption: "Dance reel challenge" },
  { id: "ur4", thumbnail: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400", likes: 12400, caption: "Festival glow up" },
  { id: "ur5", thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", likes: 8900, caption: "Monsoon vibes" },
  { id: "ur6", thumbnail: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400", likes: 3400, caption: "Street food reel" },
];

const USER_DASHBOARD = [
  { label: "Total Views", value: "24.8K", icon: "eye", color: "#7B2FBE" },
  { label: "Avg Reach", value: "8.4K", icon: "radio", color: "#E91E8C" },
  { label: "Engagement", value: "4.8%", icon: "heart", color: "#FF3B6F" },
  { label: "New Followers", value: "342", icon: "user-plus", color: "#34C759" },
];

const USER_DASHBOARD_CONTENT = [
  { id: "c1", title: "Mumbai street food vlog", views: "8.2K", likes: 412, type: "video" },
  { id: "c2", title: "Sunrise at Marine Drive", views: "5.1K", likes: 287, type: "image" },
  { id: "c3", title: "Morning run challenge", views: "3.4K", likes: 198, type: "reel" },
  { id: "c4", title: "Monsoon mood", views: "2.8K", likes: 156, type: "image" },
];

type ProfileTab = "posts" | "videos" | "reels" | "dashboard";

// ── Menu sections (grouped like iOS Settings) ──────────────────────────────
const MENU_SECTIONS = [
  {
    title: "Content",
    items: [
      { icon: "calendar",    label: "Events & Meetups",route: "/events",              color: "#FF9500" },
      { icon: "rss",         label: "Broadcasts",      route: "/broadcast",           color: "#5856D6" },
      { icon: "bookmark",    label: "Saved Posts",  route: "/saved-posts",         color: "#FF9500" },
      { icon: "globe",       label: "Explore",      route: "/explore",             color: "#5AC8FA" },
      { icon: "users",       label: "Communities",  route: "/communities",         color: "#7B2FBE" },
      { icon: "mic",         label: "Podcasts",     route: "/podcasts",            color: "#E91E8C" },
      { icon: "radio",       label: "My Channel",   route: "/my-podcast-channel",  color: "#7B2FBE" },
      { icon: "headphones",  label: "Audio Rooms",  route: "/audio-room",          color: "#4A90E2" },
    ],
  },
  {
    title: "Create & Live",
    items: [
      { icon: "video",       label: "Go Live",         route: "/live-stream",      color: "#FF3B30" },
      { icon: "zap",         label: "Creator Tools",   route: "/creator-tools",     color: "#E91E8C" },
      { icon: "bar-chart-2",  label: "Creator Dashboard", route: "/creator-dashboard", color: "#4A90E2" },
      { icon: "crosshair",   label: "PK Battles",      route: "/pk-battle",        color: "#7B2FBE" },
      { icon: "phone",       label: "Random Call",     route: "/random-call",      color: "#34C759" },
    ],
  },
  {
    title: "Earn & Rewards",
    items: [
      { icon: "gift",        label: "Gift Shop",         route: "/coin-store",     color: "#E91E8C" },
      { icon: "inbox",       label: "My Gifts",          route: "/my-gifts",       color: "#7B2FBE" },
      { icon: "target",      label: "Earn Coins",        route: "/missions",       color: "#FFB800" },
      { icon: "gift",        label: "Referral & Rewards",route: "/referral",       color: "#FF6B35" },
    ],
  },
  {
    title: "Business Tools",
    items: [
      { icon: "volume-2",    label: "Ads Manager",       route: "/ads-manager",    color: "#7B2FBE" },
      { icon: "briefcase",   label: "Brand Register",    route: "/brand-register", color: "#E91E8C" },
    ],
  },
  {
    title: "Creator Marketplace",
    items: [
      { icon: "target",      label: "Brand Deals",        route: "/creator-marketplace", color: "#E91E8C" },
      { icon: "trending-up", label: "Top Creators",       route: "/leaderboard",          color: "#7B2FBE" },
    ],
  },
  {
    title: "Vibe & Stars",
    items: [
      { icon: "star",        label: "Vibe & Stars",  route: "/vibe-stars",        color: "#9C27B0" },
      { icon: "award",       label: "Leaderboard",   route: "/leaderboard",       color: "#FF6B35" },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: "award",       label: "VIP & Plans",       route: "/subscription",  color: "#E91E8C" },
      { icon: "shield",      label: "E-KYC Verification",route: "/kyc",           color: "#22C55E" },
    ],
  },
];

export default function ProfileScreen() {
  useTrackScreen("profile");
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { user, isLoading: authLoading, logout, updateProfile } = useAuth();

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 60;
  const imageSize = (width - 4) / 3;

  const [sheet, setSheet] = useState<SheetType>(null);
  const [followStates, setFollowStates] = useState<Record<string, boolean>>(
    () => Object.fromEntries([...MOCK_FOLLOWERS, ...MOCK_FOLLOWING].map((p) => [p.id, ("followed" in p ? p.followed : p.following)]))
  );

  const [editOpen,     setEditOpen]     = useState(false);
  const [editNickname, setEditNickname] = useState("");
  const [editBio,      setEditBio]      = useState("");
  const [editAvatar,   setEditAvatar]   = useState<string | undefined>(undefined);
  const [avatarSheet,  setAvatarSheet]  = useState(false);
  const [showAvatarGrid, setShowAvatarGrid] = useState(false);
  const [activeTab,    setActiveTab]    = useState<ProfileTab>("posts");

  const { trackFollow, trackUnfollow } = useAnalytics();

  const toggleFollow = (id: string) => {
    const isFollowing = followStates[id];
    setFollowStates((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!isFollowing) trackFollow(id);
    else trackUnfollow(id);
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center", paddingTop: topPad }]}>
        {authLoading ? (
          <View style={{ alignItems: "center", gap: 16 }}>
            <View style={[styles.loadingRing, { borderColor: colors.primary }]} />
            <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading your profile…</Text>
          </View>
        ) : (
          <View style={{ alignItems: "center", gap: 20, paddingHorizontal: 32 }}>
            <View style={[styles.ghostIconWrap, { backgroundColor: colors.primary + "18" }]}>
              <Feather name="user" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.ghostTitle, { color: colors.foreground }]}>Not logged in</Text>
            <Text style={[styles.ghostSub, { color: colors.mutedForeground, textAlign: "center" }]}>
              Sign in to view your profile, manage your earnings, and access all features.
            </Text>
            <Pressable onPress={() => router.push("/auth/login")} style={[styles.ghostBtn, { backgroundColor: colors.primary }]}>
              <Text style={styles.ghostBtnText}>Sign In</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  const displayName = user.nickname || user.name;

  const openEditModal = () => {
    setEditNickname(user.nickname || "");
    setEditBio(user.bio || "");
    setEditAvatar(user.avatar);
    setEditOpen(true);
  };

  const saveProfile = async () => {
    await updateProfile({ nickname: editNickname.trim() || user.name, bio: editBio, avatar: editAvatar });
    setEditOpen(false);
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const pickPhoto = async () => {
    if (Platform.OS === "web") {
      fileInputRef.current?.click();
      return;
    }
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") { Alert.alert("Permission needed", "Allow photo access to change your profile picture."); return; }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      const uri = result.assets[0].uri;
      if (!uri) return;
      setEditAvatar(uri);
      setAvatarSheet(false);
      updateProfile({ avatar: uri });
    } catch (err) {
      Alert.alert("Photo Error", "Could not select a photo. Please try again.");
    }
  };

  const handleWebFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setEditAvatar(dataUrl);
        setAvatarSheet(false);
        updateProfile({ avatar: dataUrl });
      }
    };
    reader.readAsDataURL(file);
    // Reset so the same file can be picked again
    (e.target as HTMLInputElement).value = "";
  };

  const useAutoAvatar = () => {
    setEditAvatar(undefined);
    setAvatarSheet(false);
    setShowAvatarGrid(false);
    updateProfile({ avatar: undefined });
  };
  const selectAvatarFromGrid = (uri: string) => {
    setEditAvatar(uri);
    setShowAvatarGrid(false);
    setAvatarSheet(false);
    updateProfile({ avatar: uri });
  };

  const sheetTitle =
    sheet === "posts"     ? `Posts (${user.posts})`         :
    sheet === "followers" ? `Followers (${user.followers})` :
    sheet === "following" ? `Following (${user.following})` : "";

  const renderSheet = () => {
    if (sheet === "posts") {
      return (
        <View style={styles.sheetPostGrid}>
          {MOCK_POSTS.map((p, i) => (
            <Pressable key={p.id} style={[styles.sheetPostCell, { width: (width - 8) / 3 }]} onPress={() => Alert.alert("Post", `View post with ${p.likes} likes`)}>
              <LinearGradient colors={POST_COLORS[i % POST_COLORS.length] as [string, string]} style={StyleSheet.absoluteFill} />
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
                style={[styles.followBtn, isFollowing
                  ? { backgroundColor: colors.muted, borderColor: colors.border }
                  : { backgroundColor: colors.primary, borderColor: colors.primary }]}
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
    {Platform.OS === "web" && React.createElement("input", {
      type: "file",
      accept: "image/*",
      ref: fileInputRef as any,
      style: { display: "none" },
      onChange: handleWebFileChange as any,
    })}
    <PrivateHead />
    {/* ── Edit Profile Modal ─────────────────────────────────────────────── */}
    <Modal visible={editOpen} transparent animationType="slide" onRequestClose={() => setEditOpen(false)}>
      <TouchableWithoutFeedback onPress={() => setEditOpen(false)}>
        <View style={styles.sheetOverlay} />
      </TouchableWithoutFeedback>
      <View style={[styles.editSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 20 }]}>
        <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
        <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Edit Profile</Text>
          <Pressable onPress={() => setEditOpen(false)} style={[styles.sheetClose, { backgroundColor: colors.muted }]}>
            <Feather name="x" size={16} color={colors.foreground} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }} showsVerticalScrollIndicator={false}>
          <View style={styles.editAvatarRow}>
            <Pressable onPress={() => setAvatarSheet(true)} style={styles.editAvatarBtn}>
              {editAvatar ? (
                <Image source={{ uri: editAvatar }} style={styles.editAvatarImg} />
              ) : (
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.editAvatarImg}>
                  <Text style={styles.editAvatarInitial}>{(editNickname || user.name).charAt(0).toUpperCase()}</Text>
                </LinearGradient>
              )}
              <View style={[styles.editAvatarCamera, { backgroundColor: colors.primary }]}>
                <Feather name="camera" size={14} color="#fff" />
              </View>
            </Pressable>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.editAvatarLabel, { color: colors.foreground }]}>Profile Photo</Text>
              <Text style={[styles.editAvatarSub, { color: colors.mutedForeground }]}>
                {editAvatar ? "Custom photo set" : "Auto-avatar (gradient initials)"}
              </Text>
              <Pressable onPress={() => setAvatarSheet(true)}>
                <Text style={[styles.editAvatarChange, { color: colors.primary }]}>Change photo →</Text>
              </Pressable>
            </View>
          </View>
          <View style={{ gap: 6 }}>
            <View style={styles.editFieldLabel}>
              <Feather name="at-sign" size={13} color={colors.primary} />
              <Text style={[styles.editFieldLabelText, { color: colors.primary }]}>Display Name / Nickname</Text>
            </View>
            <TextInput
              style={[styles.editInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder={user.name} placeholderTextColor={colors.mutedForeground}
              value={editNickname} onChangeText={setEditNickname} maxLength={30}
            />
            <Text style={[styles.editFieldHint, { color: colors.mutedForeground }]}>Shown on posts, chat and matches</Text>
          </View>
          <View style={[styles.editPrivacyNote, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="lock" size={14} color={colors.mutedForeground} />
            <Text style={[styles.editPrivacyText, { color: colors.mutedForeground }]}>
              Your real name ({user.name}) is private and never shown publicly.
            </Text>
          </View>
          <View style={{ gap: 6 }}>
            <Text style={[styles.editFieldLabelText, { color: colors.foreground }]}>Bio</Text>
            <TextInput
              style={[styles.editInput, styles.editBioInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="Tell people a little about yourself…" placeholderTextColor={colors.mutedForeground}
              value={editBio} onChangeText={setEditBio} multiline maxLength={150}
            />
            <Text style={[styles.editFieldHint, { color: colors.mutedForeground, textAlign: "right" }]}>{editBio.length}/150</Text>
          </View>
          <GradientButton label="Save Changes" onPress={saveProfile} style={{ marginTop: 4 }} />
        </ScrollView>
      </View>
    </Modal>

    {/* ── Avatar picker sheet ───────────────────────────────────────────── */}
    <Modal visible={avatarSheet} transparent animationType="slide" onRequestClose={() => setAvatarSheet(false)}>
      <TouchableWithoutFeedback onPress={() => setAvatarSheet(false)}>
        <View style={styles.sheetOverlay} />
      </TouchableWithoutFeedback>
      <View style={[styles.avatarPickerSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 20 }]}>
        <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
        <Text style={[styles.avatarPickerTitle, { color: colors.foreground }]}>Change Profile Photo</Text>
        <Pressable onPress={pickPhoto} style={[styles.avatarPickerOption, { borderBottomColor: colors.border }]}>
          <View style={[styles.avatarPickerIcon, { backgroundColor: colors.primary + "18" }]}>
            <Feather name="image" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.avatarPickerOptionTitle, { color: colors.foreground }]}>Upload from Gallery</Text>
            <Text style={[styles.avatarPickerOptionSub, { color: colors.mutedForeground }]}>Choose a photo from your device</Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </Pressable>
        <Pressable onPress={() => setShowAvatarGrid((v) => !v)} style={[styles.avatarPickerOption, { borderBottomColor: colors.border }]}>
          <View style={[styles.avatarPickerIcon, { backgroundColor: colors.secondary + "18" }]}>
            <Text style={{ fontSize: 22 }}>🤖</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.avatarPickerOptionTitle, { color: colors.foreground }]}>Choose 3D Avatar</Text>
            <Text style={[styles.avatarPickerOptionSub, { color: colors.mutedForeground }]}>
              {user.gender === "female" ? "Feminine" : user.gender === "male" ? "Masculine" : "Neutral"} avatars
            </Text>
          </View>
          <Feather name={showAvatarGrid ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
        </Pressable>
        {showAvatarGrid && (
          <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
            <AvatarPicker gender={user.gender} selected={editAvatar} onSelect={selectAvatarFromGrid} />
          </View>
        )}
        <Pressable onPress={useAutoAvatar} style={styles.avatarPickerOption}>
          <View style={[styles.avatarPickerIcon, { backgroundColor: colors.muted }]}>
            <Feather name="refresh-cw" size={20} color={colors.mutedForeground} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.avatarPickerOptionTitle, { color: colors.foreground }]}>Reset to Default</Text>
            <Text style={[styles.avatarPickerOptionSub, { color: colors.mutedForeground }]}>Auto-generate from name & gender</Text>
          </View>
          {!editAvatar && <Feather name="check-circle" size={18} color={colors.primary} />}
        </Pressable>
      </View>
    </Modal>

    {/* ── Stats bottom sheet ─────────────────────────────────────────────── */}
    <Modal visible={sheet !== null} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
      <TouchableWithoutFeedback onPress={() => setSheet(null)}>
        <View style={styles.sheetOverlay} />
      </TouchableWithoutFeedback>
      <View style={[styles.sheetContainer, { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 }]}>
        <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
        <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sheetTitle, { color: colors.foreground }]}>{sheetTitle}</Text>
          <Pressable onPress={() => setSheet(null)} style={[styles.sheetClose, { backgroundColor: colors.muted }]}>
            <Feather name="x" size={16} color={colors.foreground} />
          </Pressable>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
          {renderSheet()}
        </ScrollView>
      </View>
    </Modal>

    {/* ── Main scroll ───────────────────────────────────────────────────── */}
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: bottomPad + 24 }}
    >

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <LinearGradient
        colors={[colors.primary + "28", colors.secondary + "18", "transparent"]}
        style={[styles.hero, { paddingTop: topPad + 12 }]}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={[styles.screenLabel, { color: colors.foreground }]}>Profile</Text>
          <Pressable onPress={() => router.push("/settings")} style={[styles.settingsIcon, { backgroundColor: colors.muted }]}>
            <Feather name="settings" size={18} color={colors.foreground} />
          </Pressable>
        </View>

        {/* Avatar + name */}
        <View style={styles.avatarBlock}>
          <Pressable onPress={() => { setEditAvatar(user.avatar); setAvatarSheet(true); }} style={styles.avatarWrap}>
            <Avatar name={user.name} uri={user.avatar} size={90} hasStory />
            <View style={[styles.avatarEditBadge, { backgroundColor: colors.primary }]}>
              <Feather name="camera" size={12} color="#fff" />
            </View>
          </Pressable>

          <Text style={[styles.name, { color: colors.foreground }]}>{displayName}</Text>

          {user.plan && user.plan !== "free" && (
            <SubscriptionBadge tier={user.plan as VipTier} size="sm" style={{ marginTop: 4 }} />
          )}

          <View style={styles.locationRow}>
            <Feather name="map-pin" size={12} color={colors.mutedForeground} />
            <Text style={[styles.location, { color: colors.mutedForeground }]}>{user.city}</Text>
          </View>

          {(() => {
            const zodiac = user.zodiacSign
              ? ZODIAC_LIST.find((z) => z.id === user.zodiacSign)
              : user.birthday
              ? getZodiacFromBirthday(user.birthday)
              : null;
            return zodiac ? (
              <View style={styles.zodiacRow}>
                <Text style={styles.zodiacEmoji}>{zodiac.emoji}</Text>
                <Text style={[styles.zodiacLabel, { color: colors.mutedForeground }]}>{zodiac.name}</Text>
                <Text style={[styles.zodiacDates, { color: colors.mutedForeground }]}>· {zodiac.dates}</Text>
              </View>
            ) : null;
          })()}

          {user.bio ? (
            <Text style={[styles.bio, { color: colors.mutedForeground }]}>{user.bio}</Text>
          ) : null}

        </View>

        {/* Stats */}
        <View style={[styles.statsRow, { borderColor: colors.border }]}>
          {([
            { label: "Posts",     value: user.posts,     key: "posts"     },
            { label: "Followers", value: user.followers, key: "followers" },
            { label: "Following", value: user.following, key: "following" },
            { label: "Super Likes", value: 12,           key: null        },
          ] as { label: string; value: number; key: SheetType }[]).map((stat, i) => (
            <Pressable
              key={stat.label}
              onPress={() => stat.key && setSheet(stat.key)}
              style={[styles.stat, i < 3 && { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: colors.border }]}
            >
              <Text style={[styles.statValue, { color: stat.label === "Super Likes" ? colors.gold : colors.foreground }]}>{stat.value.toLocaleString()}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <GradientButton label="Edit Profile" onPress={openEditModal} small style={{ flex: 1 }} />
          <GradientButton label="Boost" onPress={() => router.push("/subscription")} small outline style={{ flex: 1 }} />
          <Pressable onPress={() => router.push("/wallet")} style={[styles.walletBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <CoinBadge amount={user.coins} size="sm" />
          </Pressable>
        </View>

        {/* Highlights Row */}
        {user.storyHighlights && user.storyHighlights.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.highlightsContainer}
          >
            {user.storyHighlights.map((highlight) => (
              <Pressable
                key={highlight.id}
                style={styles.highlightItem}
                onPress={() => router.push({ pathname: "/highlight-viewer", params: { highlightId: highlight.id } })}
              >
                <View style={[styles.highlightThumb, { borderColor: colors.border }]}>
                  <LinearGradient
                    colors={["#E91E8C", "#7B2FBE"]}
                    style={styles.highlightThumbGradient}
                  >
                    <Feather name="play" size={16} color="#fff" />
                  </LinearGradient>
                </View>
                <Text style={[styles.highlightTitleText, { color: colors.foreground }]} numberOfLines={1}>
                  {highlight.title}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </LinearGradient>

      {/* ── EARN ON RIDHI ─────────────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>EARN ON RIDHI</Text>
        <View style={styles.earnRow}>
          {/* Host — active if registered, or show "Apply" if not */}
          {user.isHost ? (
            <Pressable
              onPress={() => router.push("/host-profile" as any)}
              style={[styles.earnCard, { backgroundColor: colors.card, borderColor: "#FFB800" }]}
            >
              <View style={[styles.earnIcon, { backgroundColor: "#FFB80020" }]}>
                <Image source={COIN_IMAGE} style={{ width: 20, height: 20 }} resizeMode="contain" />
              </View>
              <Text style={[styles.earnCardTitle, { color: colors.foreground }]}>Host</Text>
              <Text style={[styles.earnCardSub, { color: colors.mutedForeground }]}>Active</Text>
              <View style={styles.activeDot} />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.push("/kyc" as any)}
              style={[styles.earnCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.earnIcon, { backgroundColor: "#FFB80020" }]}>
                <Image source={COIN_IMAGE} style={{ width: 20, height: 20 }} resizeMode="contain" />
              </View>
              <Text style={[styles.earnCardTitle, { color: colors.foreground }]}>Host</Text>
              <Text style={[styles.earnCardSub, { color: colors.mutedForeground }]}>Apply</Text>
              <View style={[styles.applyBadge, { backgroundColor: "#FFB800" }]}>
                <Text style={{ color: "#fff", fontSize: 8, fontFamily: "Inter_600SemiBold" }}>NEW</Text>
              </View>
            </Pressable>
          )}

          {/* Agent — active if registered, or show "Apply" if not */}
          {user.isAgent ? (
            <Pressable
              onPress={() => router.push("/agent-dashboard" as any)}
              style={[styles.earnCard, { backgroundColor: colors.card, borderColor: "#00BCD4" }]}
            >
              <View style={[styles.earnIcon, { backgroundColor: "#00BCD420" }]}>
                <Feather name="briefcase" size={20} color="#00BCD4" />
              </View>
              <Text style={[styles.earnCardTitle, { color: colors.foreground }]}>Agent</Text>
              <Text style={[styles.earnCardSub, { color: colors.mutedForeground }]}>Active</Text>
              <View style={[styles.activeDot, { backgroundColor: "#00BCD4" }]} />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.push("/kyc" as any)}
              style={[styles.earnCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.earnIcon, { backgroundColor: "#00BCD420" }]}>
                <Feather name="briefcase" size={20} color="#00BCD4" />
              </View>
              <Text style={[styles.earnCardTitle, { color: colors.foreground }]}>Agent</Text>
              <Text style={[styles.earnCardSub, { color: colors.mutedForeground }]}>Apply</Text>
              <View style={[styles.applyBadge, { backgroundColor: "#00BCD4" }]}>
                <Text style={{ color: "#fff", fontSize: 8, fontFamily: "Inter_600SemiBold" }}>NEW</Text>
              </View>
            </Pressable>
          )}

          {/* Creator — always visible */}
          <Pressable
            onPress={() => router.push("/creator-tools" as any)}
            style={[styles.earnCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.earnIcon, { backgroundColor: "#E91E8C20" }]}>
              <Feather name="zap" size={20} color="#E91E8C" />
            </View>
            <Text style={[styles.earnCardTitle, { color: colors.foreground }]}>Creator</Text>
            <Text style={[styles.earnCardSub, { color: colors.mutedForeground }]}>Tools</Text>
          </Pressable>
        </View>
      </View>

      {/* ── MY HOST STATUS ────────────────────────────────────────────────── */}
      {user.isHost && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>MY HOST STATUS</Text>
          <View style={[styles.levelCard, { backgroundColor: colors.card, borderColor: "#FFB800" }]}>
            <View style={styles.levelHeader}>
              <LinearGradient colors={["#FFB800", "#FF8C00"]} style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>L3</Text>
              </LinearGradient>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.levelName, { color: colors.foreground }]}>Silver Host</Text>
                <Text style={[styles.levelSub, { color: colors.mutedForeground }]}>4,284 fans · Mumbai</Text>
              </View>
              <View style={[styles.nextLevelPill, { borderColor: "#FFD700" + "60", backgroundColor: "#FFD70012" }]}>
                <Text style={[styles.nextLevelText, { color: "#FFB800" }]}>→ L4 Gold</Text>
              </View>
            </View>
            {[
              { label: "Coins Received",  current: 240000, target: 500000, pct: 48, color: "#E91E8C" },
              { label: "Stream Hours",    current: 124,    target: 200,    pct: 62, color: "#7B2FBE" },
              { label: "PK Wins",         current: 8,      target: 10,     pct: 80, color: "#FFB800" },
            ].map((bar) => (
              <View key={bar.label} style={styles.progressRow}>
                <View style={styles.progressLabelRow}>
                  <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>{bar.label}</Text>
                  <Text style={[styles.progressLabel, { color: colors.foreground }]}>{bar.pct}%</Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
                  <View style={[styles.progressFill, { width: `${bar.pct}%` as any, backgroundColor: bar.color }]} />
                </View>
              </View>
            ))}
            <Text style={[styles.levelTip, { color: colors.mutedForeground }]}>
              💡 Stream 76 more hours + 2 PK wins to reach L4 Gold
            </Text>
          </View>
        </View>
      )}

      {user.isAgent && !user.isHost && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>MY AGENT STATUS</Text>
          <View style={[styles.levelCard, { backgroundColor: colors.card, borderColor: "#00BCD4" }]}>
            <View style={styles.levelHeader}>
              <LinearGradient colors={["#00BCD4", "#0097A7"]} style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>A2</Text>
              </LinearGradient>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.levelName, { color: colors.foreground }]}>Senior Agent</Text>
                <Text style={[styles.levelSub, { color: colors.mutedForeground }]}>5% commission · 54 hosts</Text>
              </View>
              <View style={[styles.nextLevelPill, { borderColor: "#00BCD460", backgroundColor: "#00BCD412" }]}>
                <Text style={[styles.nextLevelText, { color: "#00BCD4" }]}>→ A3</Text>
              </View>
            </View>
            {[
              { label: "Hosts Managed",  current: 54,  target: 100, pct: 54, color: "#00BCD4" },
              { label: "Active Rate",    current: 79,  target: 80,  pct: 99, color: "#7B2FBE" },
            ].map((bar) => (
              <View key={bar.label} style={styles.progressRow}>
                <View style={styles.progressLabelRow}>
                  <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>{bar.label}</Text>
                  <Text style={[styles.progressLabel, { color: colors.foreground }]}>{bar.pct}%</Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
                  <View style={[styles.progressFill, { width: `${bar.pct}%` as any, backgroundColor: bar.color }]} />
                </View>
              </View>
            ))}
            <Text style={[styles.levelTip, { color: colors.mutedForeground }]}>
              🎯 Recruit 46 more hosts to reach A3 — unlock 7% commission
            </Text>
          </View>
        </View>
      )}

      {/* ── MENU SECTIONS ─────────────────────────────────────────────────── */}
      {MENU_SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{section.title.toUpperCase()}</Text>
          <View style={[styles.menuGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {section.items.map((item, idx) => (
              <Pressable
                key={item.label}
                onPress={() => router.push(item.route as any)}
                style={[
                  styles.menuRow,
                  idx < section.items.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color + "18" }]}>
                  <Feather name={item.icon as any} size={17} color={item.color} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
                <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      {/* ── INTERESTS ────────────────────────────────────────────────────── */}
      {user.interests.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>INTERESTS</Text>
          <View style={styles.interestTags}>
            {user.interests.map((interest) => (
              <View key={interest} style={[styles.interestTag, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "35" }]}>
                <Text style={[styles.interestText, { color: colors.primary }]}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── TABBED CONTENT ─────────────────────────────────────────────────── */}
      <View style={styles.section}>
        {/* Tab bar */}
        <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
          {([
            { key: "posts" as ProfileTab, icon: "grid" },
            { key: "videos" as ProfileTab, icon: "play" },
            { key: "reels" as ProfileTab, icon: "film" },
            { key: "dashboard" as ProfileTab, icon: "bar-chart-2" },
          ]).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={styles.tabBtn}
              >
                <Feather
                  name={tab.icon as any}
                  size={20}
                  color={isActive ? colors.primary : colors.mutedForeground}
                />
                {isActive && (
                  <View style={[styles.tabIndicator, { backgroundColor: colors.primary }]} />
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Tab content */}
        {activeTab === "posts" && (
          <View style={styles.tabContent}>
            {USER_POSTS.length === 0 ? (
              <View style={styles.emptyTab}>
                <Feather name="camera" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyTabText, { color: colors.mutedForeground }]}>No posts yet</Text>
              </View>
            ) : (
              <View style={styles.grid}>
                {USER_POSTS.map((post, i) => (
                  <Pressable
                    key={post.id}
                    style={[styles.gridItem, { width: imageSize, height: imageSize }]}
                  >
                    {post.imageUri ? (
                      <Image source={{ uri: post.imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    ) : post.carouselImages && post.carouselImages.length > 0 ? (
                      <Image source={{ uri: post.carouselImages[0] }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    ) : (
                      <LinearGradient
                        colors={POST_COLORS[i % POST_COLORS.length] as [string, string]}
                        style={[StyleSheet.absoluteFill, { borderRadius: 2 }]}
                      />
                    )}
                    <View style={styles.gridOverlay}>
                      <Feather name="heart" size={14} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.gridOverlayText}>{post.likes}</Text>
                    </View>
                    {post.carouselImages && post.carouselImages.length > 1 && (
                      <View style={[styles.multiIcon, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
                        <Feather name="layers" size={12} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === "videos" && (
          <View style={styles.tabContent}>
            {USER_VIDEOS.length === 0 ? (
              <View style={styles.emptyTab}>
                <Feather name="video" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyTabText, { color: colors.mutedForeground }]}>No videos yet</Text>
              </View>
            ) : (
              <View style={styles.grid}>
                {USER_VIDEOS.map((video) => (
                  <Pressable
                    key={video.id}
                    style={[styles.gridItem, { width: imageSize, height: imageSize }]}>
                    <Image source={{ uri: video.thumbnail }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    <View style={[styles.videoOverlay, { backgroundColor: "rgba(0,0,0,0.35)" }]}>
                      <Feather name="play-circle" size={24} color="#fff" />
                    </View>
                    <View style={[styles.durationBadge, { backgroundColor: "rgba(0,0,0,0.65)" }]}>
                      <Text style={styles.durationText}>{video.duration}</Text>
                    </View>
                    <View style={styles.gridOverlay}>
                      <Feather name="eye" size={14} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.gridOverlayText}>{video.views}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === "reels" && (
          <View style={styles.tabContent}>
            {USER_REELS.length === 0 ? (
              <View style={styles.emptyTab}>
                <Feather name="film" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyTabText, { color: colors.mutedForeground }]}>No reels yet</Text>
              </View>
            ) : (
              <View style={styles.grid}>
                {USER_REELS.map((reel) => (
                  <Pressable
                    key={reel.id}
                    style={[styles.gridItem, { width: imageSize, height: imageSize }]}>
                    <Image source={{ uri: reel.thumbnail }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    <View style={[styles.videoOverlay, { backgroundColor: "rgba(0,0,0,0.35)" }]}>
                      <Feather name="play-circle" size={24} color="#fff" />
                    </View>
                    <View style={styles.gridOverlay}>
                      <Feather name="heart" size={14} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.gridOverlayText}>{reel.likes}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === "dashboard" && (
          <View style={styles.tabContent}>
            <View style={styles.dashboardStats}>
              {USER_DASHBOARD.map((stat) => (
                <View key={stat.label} style={[styles.dashboardCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.dashboardIcon, { backgroundColor: stat.color + "18" }]}>
                    <Feather name={stat.icon as any} size={18} color={stat.color} />
                  </View>
                  <Text style={[styles.dashboardValue, { color: colors.foreground }]}>{stat.value}</Text>
                  <Text style={[styles.dashboardLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 16, marginBottom: 8 }]}>TOP CONTENT</Text>
            {USER_DASHBOARD_CONTENT.map((item, i) => (
              <Pressable
                key={item.id}
                style={[styles.contentRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.contentRank, { backgroundColor: colors.primary }]}>
                  <Text style={styles.contentRankText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.contentTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Text style={[styles.contentMeta, { color: colors.mutedForeground }]}>
                      <Feather name="eye" size={10} /> {item.views}
                    </Text>
                    <Text style={[styles.contentMeta, { color: colors.mutedForeground }]}>
                      <Feather name="heart" size={10} /> {item.likes}
                    </Text>
                    <Text style={[styles.contentMeta, { color: colors.primary }]}>
                      {item.type === "video" ? "Video" : item.type === "reel" ? "Reel" : "Post"}
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* ── ACCOUNT / SCHEDULED / LOGOUT ─────────────────────────────────── */}
      <View style={[styles.section, { marginTop: 4 }]}>
        <View style={[styles.menuGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable
            onPress={() => router.push("/scheduled-content")}
            style={[styles.menuRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.primary + "18" }]}>
              <Feather name="calendar" size={17} color={colors.primary} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.foreground }]}>Scheduled Content</Text>
            <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/report-history")}
            style={[styles.menuRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.destructive + "18" }]}>
              <Feather name="flag" size={17} color={colors.destructive} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.foreground }]}>My Reports</Text>
            <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/settings")}
            style={[styles.menuRow, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.muted }]}>
              <Feather name="settings" size={17} color={colors.foreground} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.foreground }]}>Settings & Privacy</Text>
            <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
          </Pressable>
          <Pressable onPress={logout} style={styles.menuRow}>
            <View style={[styles.menuIcon, { backgroundColor: colors.destructive + "18" }]}>
              <Feather name="log-out" size={17} color={colors.destructive} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.destructive }]}>Sign Out</Text>
          </Pressable>
        </View>
      </View>

    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: { paddingHorizontal: 20, paddingBottom: 20 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  screenLabel: { fontSize: 22, fontFamily: "Inter_700Bold" },
  settingsIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },

  avatarBlock: { alignItems: "center", gap: 6 },
  avatarWrap:  { position: "relative" },
  avatarEditBadge: { position: "absolute", bottom: 2, right: 2, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#000" },
  name: { fontSize: 22, fontFamily: "Inter_700Bold" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  location: { fontSize: 13, fontFamily: "Inter_400Regular" },
  zodiacRow:  { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  zodiacEmoji: { fontSize: 14 },
  zodiacLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  zodiacDates: { fontSize: 12, fontFamily: "Inter_400Regular" },
  bio: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19, paddingHorizontal: 16 },

  statsRow: { flexDirection: "row", marginTop: 18, marginHorizontal: -20, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
  stat: { flex: 1, alignItems: "center", gap: 2, paddingVertical: 10 },
  statValue: { fontSize: 19, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },

  actionRow: { flexDirection: "row", gap: 8, marginTop: 14, alignItems: "center" },
  walletBtn: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, justifyContent: "center" },

  // Highlights
  highlightsContainer: { paddingHorizontal: 16, paddingVertical: 12, gap: 16 },
  highlightItem: { alignItems: "center", width: 64 },
  highlightThumb: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, padding: 2, marginBottom: 4 },
  highlightThumbGradient: { flex: 1, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  highlightTitleText: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },

  // ── Section wrapper ───────────────────────────────────────────────────────
  section: { paddingHorizontal: 16, paddingTop: 22 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginBottom: 8 },

  // ── Tab bar ─────────────────────────────────────────────────────────────
  tabBar: { flexDirection: "row", justifyContent: "space-around", borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 12 },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 12, position: "relative" },
  tabIndicator: { position: "absolute", bottom: 0, left: "15%", right: "15%", height: 2, borderRadius: 1 },
  tabContent: { paddingTop: 4 },
  emptyTab: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyTabText: { fontSize: 14, fontFamily: "Inter_500Medium" },

  // ── Grid overlay ────────────────────────────────────────────────────────
  gridOverlay: { position: "absolute", bottom: 4, left: 4, flexDirection: "row", alignItems: "center", gap: 4 },
  gridOverlayText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.9)" },
  multiIcon: { position: "absolute", top: 4, right: 4, borderRadius: 4, padding: 2 },
  videoOverlay: { position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" },
  durationBadge: { position: "absolute", bottom: 4, right: 4, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  durationText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#fff" },

  // ── Dashboard tab ─────────────────────────────────────────────────────────
  dashboardStats: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  dashboardCard: { flex: 1, minWidth: 140, borderRadius: 12, borderWidth: 1, padding: 14, alignItems: "center", gap: 6 },
  dashboardIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  dashboardValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  dashboardLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  contentRow: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, padding: 10, marginBottom: 6 },
  contentRank: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  contentRankText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff" },
  contentTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  contentMeta: { fontSize: 11, fontFamily: "Inter_500Medium" },

  // ── Level / Creator Status card ───────────────────────────────────────────
  levelCard: { borderRadius: 18, borderWidth: 1.5, padding: 16, gap: 12 },
  levelHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  levelBadge: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  levelBadgeText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  levelName: { fontSize: 15, fontFamily: "Inter_700Bold" },
  levelSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  nextLevelPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1 },
  nextLevelText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  progressRow: { gap: 4 },
  progressLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  progressTrack: { height: 7, borderRadius: 6, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 6 },
  levelTip: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },

  // ── Earn cards ────────────────────────────────────────────────────────────
  earnRow: { flexDirection: "row", gap: 10 },
  earnCard: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 14, alignItems: "center", gap: 6, position: "relative", overflow: "hidden" },
  earnIcon: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  earnCardTitle: { fontSize: 13, fontFamily: "Inter_700Bold" },
  earnCardSub: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },
  activeDot: { position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: "#22C55E" },
  applyBadge: { position: "absolute", top: 8, right: 8, borderRadius: 6, paddingHorizontal: 4, paddingVertical: 2 },

  // ── Menu groups ───────────────────────────────────────────────────────────
  menuGroup: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 13 },
  menuIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  menuLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },

  // ── Interests ─────────────────────────────────────────────────────────────
  interestTags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  interestTag: { paddingHorizontal: 13, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  interestText: { fontSize: 13, fontFamily: "Inter_500Medium" },

  // ── Posts grid ────────────────────────────────────────────────────────────
  gridHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 2, marginHorizontal: -16 },
  gridItem: { alignItems: "center", justifyContent: "center" },

  // ── Edit profile sheet ────────────────────────────────────────────────────
  editSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "90%" },
  editAvatarRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  editAvatarBtn: { position: "relative" },
  editAvatarImg: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  editAvatarInitial: { color: "#fff", fontSize: 30, fontFamily: "Inter_700Bold" },
  editAvatarCamera: { position: "absolute", bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#000" },
  editAvatarLabel: { fontSize: 15, fontFamily: "Inter_700Bold" },
  editAvatarSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  editAvatarChange: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginTop: 2 },
  editFieldLabel: { flexDirection: "row", alignItems: "center", gap: 5 },
  editFieldLabelText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  editFieldHint: { fontSize: 11, fontFamily: "Inter_400Regular" },
  editInput: { fontSize: 15, fontFamily: "Inter_400Regular", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1 },
  editBioInput: { minHeight: 80, textAlignVertical: "top" },
  editPrivacyNote: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  editPrivacyText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },

  // ── Avatar picker sheet ───────────────────────────────────────────────────
  avatarPickerSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  avatarPickerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", textAlign: "center", paddingVertical: 16 },
  avatarPickerOption: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  avatarPickerIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarPickerOptionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  avatarPickerOptionSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },

  // ── Empty / loading state ───────────────────────────────────────────────
  loadingRing: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, borderTopColor: "transparent", borderStyle: "solid" },
  loadingText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  ghostIconWrap: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  ghostTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  ghostSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  ghostBtn: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
  ghostBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  // ── Bottom sheet ──────────────────────────────────────────────────────────
  sheetOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  sheetContainer: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "78%", minHeight: 320 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 10, marginBottom: 4 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  sheetTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  sheetClose: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  sheetPostGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4, padding: 4, paddingTop: 12 },
  sheetPostCell: { height: 110, borderRadius: 8, overflow: "hidden", alignItems: "center", justifyContent: "flex-end" },
  sheetPostOverlay: { flexDirection: "row", alignItems: "center", gap: 4, padding: 8, width: "100%" },
  sheetPostStat: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },
  personRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  personNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  personName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  personCity: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  mutualBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  mutualText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  followBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  followBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  
});
