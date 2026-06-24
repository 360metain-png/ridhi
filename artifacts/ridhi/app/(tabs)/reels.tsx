import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewToken,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/Avatar";
import { WatermarkBadge } from "@/components/WatermarkBadge";
import { useWatermark } from "@/hooks/useWatermark";
import { SwipeUpHint } from "@/components/SwipeUpHint";
import { VideoFilter, VIDEO_FILTERS, type FilterDef } from "@/components/VideoFilter";
import { ShareWithWatermark } from "@/components/ShareWithWatermark";
import { ReelOptionsMenu } from "@/components/ReelOptionsMenu";
import { DownloadService } from "@/components/DownloadService";
import { useTrackScreen, useAnalytics } from "@/hooks/useAnalytics";

const REELS = [
  {
    id: "r1",
    userId: "u1",
    userName: "Ananya Singh",
    userCity: "Delhi",
    caption: "Street food diaries — the paranthas were unreal! 🔥",
    likes: 12400,
    comments: 342,
    shares: 89,
    isLiked: false,
    gradient: ["#FF6B35", "#E91E8C"] as [string, string],
    emoji: "🍛",
    allowDuet: true,
  },
  {
    id: "r2",
    userId: "u2",
    userName: "Rahul Mehta",
    userCity: "Mumbai",
    caption: "Sunrise at Marine Drive never disappoints. Peace ✨",
    likes: 8900,
    comments: 156,
    shares: 234,
    isLiked: true,
    gradient: ["#4A90E2", "#7B2FBE"] as [string, string],
    emoji: "🌅",
    allowDuet: true,
  },
  {
    id: "r3",
    userId: "u3",
    userName: "Kavya Reddy",
    userCity: "Hyderabad",
    caption: "Garba night — best night of the year! Navratri vibes 💃",
    likes: 34500,
    comments: 892,
    shares: 1200,
    isLiked: false,
    gradient: ["#FFB800", "#E91E8C"] as [string, string],
    emoji: "💃",
    allowDuet: false,
  },
  {
    id: "r4",
    userName: "Arjun Kumar",
    userCity: "Bangalore",
    caption: "Morning runs > everything. 10km done. IYKYK 🏃",
    likes: 5600,
    comments: 78,
    shares: 45,
    isLiked: false,
    gradient: ["#34C759", "#4A90E2"] as [string, string],
    emoji: "🏃",
    allowDuet: true,
  },
  {
    id: "r5",
    userName: "Meera Patel",
    userCity: "Ahmedabad",
    caption: "My dadi's special kadhi recipe — passing it on! 👵",
    likes: 21000,
    comments: 534,
    shares: 678,
    isLiked: true,
    gradient: ["#FF6B35", "#FFB800"] as [string, string],
    emoji: "👵",
    allowDuet: true,
  },
  {
    id: "r6",
    userName: "Priya Sharma",
    userCity: "Mumbai",
    caption: "Bollywood night at Juhu! 🎬 #MumbaiNights",
    likes: 45200,
    comments: 1200,
    shares: 3400,
    isLiked: false,
    gradient: ["#E91E8C", "#FF6B35"] as [string, string],
    emoji: "🎬",
    allowDuet: true,
  },
  {
    id: "r7",
    userId: "u6",
    userName: "Dev Patel",
    userCity: "Ahmedabad",
    caption: "Navratri colors, Garba energy, pure bliss! 🎉",
    likes: 67000,
    comments: 2100,
    shares: 5600,
    isLiked: true,
    gradient: ["#7B2FBE", "#4A90E2"] as [string, string],
    emoji: "🎉",
    allowDuet: true,
  },
  {
    id: "r8",
    userName: "Sneha Rao",
    userCity: "Chennai",
    caption: "Kolam art in front of my home — every morning ritual 🌸",
    likes: 34000,
    comments: 890,
    shares: 2300,
    isLiked: false,
    gradient: ["#FF6B35", "#FFB800"] as [string, string],
    emoji: "🌸",
    allowDuet: true,
  },
  {
    id: "r9",
    userName: "Vikram Iyer",
    userCity: "Kochi",
    caption: "Backwaters at sunset — God's Own Country is magic 🌴",
    likes: 89000,
    comments: 3200,
    shares: 7800,
    isLiked: true,
    gradient: ["#34C759", "#00BCD4"] as [string, string],
    emoji: "🌴",
    allowDuet: true,
  },
  {
    id: "r10",
    userName: "Pooja Verma",
    userCity: "Jaipur",
    caption: "Pink City at golden hour — why I love Jaipur 🌇",
    likes: 78000,
    comments: 2400,
    shares: 5200,
    isLiked: false,
    gradient: ["#E91E8C", "#FF6B35"] as [string, string],
    emoji: "🌇",
    allowDuet: true,
  },
  {
    id: "r11",
    userName: "Aryan Singh",
    userCity: "Lucknow",
    caption: "Chikan kari shopping in Hazratganj — the real deal 🧵",
    likes: 23000,
    comments: 670,
    shares: 1800,
    isLiked: true,
    gradient: ["#FF6B35", "#FFB800"] as [string, string],
    emoji: "🧵",
    allowDuet: true,
  },
  {
    id: "r12",
    userName: "Neha Gupta",
    userCity: "Pune",
    caption: "Monsoon evening chai and pakode in the hills 🌧️",
    likes: 45000,
    comments: 1200,
    shares: 2900,
    isLiked: false,
    gradient: ["#4A90E2", "#34C759"] as [string, string],
    emoji: "🌧️",
    allowDuet: true,
  },
  {
    id: "r13",
    userName: "Karan Malhotra",
    userCity: "Chandigarh",
    caption: "Sukhna Lake at 6 AM — Punjabi mornings hit different 🌅",
    likes: 32000,
    comments: 850,
    shares: 1500,
    isLiked: true,
    gradient: ["#00BCD4", "#4A90E2"] as [string, string],
    emoji: "🌅",
    allowDuet: true,
  },
  {
    id: "r14",
    userName: "Anjali Das",
    userCity: "Kolkata",
    caption: "Durga Puja prep at Kumartuli — art in motion 🎨",
    likes: 56000,
    comments: 1800,
    shares: 4200,
    isLiked: false,
    gradient: ["#FF6B35", "#E91E8C"] as [string, string],
    emoji: "🎨",
    allowDuet: true,
  },
  {
    id: "r15",
    userName: "Rohit Nair",
    userCity: "Bangalore",
    caption: "Tech Park to Nandi Hills — weekend escape 🏔️",
    likes: 41000,
    comments: 980,
    shares: 2100,
    isLiked: true,
    gradient: ["#34C759", "#FFB800"] as [string, string],
    emoji: "🏔️",
    allowDuet: true,
  },
  {
    id: "r16",
    userName: "Fatima Khan",
    userCity: "Hyderabad",
    caption: "Biryani at Cafe Bahar — the best in the city! 🍗",
    likes: 89000,
    comments: 3200,
    shares: 8500,
    isLiked: false,
    gradient: ["#FF6B35", "#E91E8C"] as [string, string],
    emoji: "🍗",
    allowDuet: true,
  },
  {
    id: "r17",
    userName: "Rajesh Khanna",
    userCity: "Delhi",
    caption: "Old Delhi food walk — 10 places, one belly. 🥘",
    likes: 67000,
    comments: 2100,
    shares: 5600,
    isLiked: true,
    gradient: ["#FFB800", "#FF6B35"] as [string, string],
    emoji: "🥘",
    allowDuet: true,
  },
  {
    id: "r18",
    userName: "Lakshmi Iyer",
    userCity: "Chennai",
    caption: "Carnatic music morning — nothing heals like this 🎵",
    likes: 54000,
    comments: 1500,
    shares: 3400,
    isLiked: false,
    gradient: ["#7B2FBE", "#E91E8C"] as [string, string],
    emoji: "🎵",
    allowDuet: true,
  },
  {
    id: "r19",
    userName: "Kabir Sharma",
    userCity: "Mumbai",
    caption: "Street photography in Dharavi — raw talent everywhere 📸",
    likes: 92000,
    comments: 4100,
    shares: 9800,
    isLiked: true,
    gradient: ["#4A90E2", "#00BCD4"] as [string, string],
    emoji: "📸",
    allowDuet: true,
  },
  {
    id: "r20",
    userName: "Divya Menon",
    userCity: "Kochi",
    caption: "Kerala houseboat stay — woke up to this view 🌴",
    likes: 76000,
    comments: 2800,
    shares: 6400,
    isLiked: false,
    gradient: ["#34C759", "#00BCD4"] as [string, string],
    emoji: "🌴",
    allowDuet: true,
  },
  {
    id: "r21",
    userName: "Harsh Vardhan",
    userCity: "Jaipur",
    caption: "Royal Rajputana wedding — 3 days of pure magic 💍",
    likes: 123000,
    comments: 5600,
    shares: 15000,
    isLiked: true,
    gradient: ["#E91E8C", "#FF6B35"] as [string, string],
    emoji: "💍",
    allowDuet: true,
  },
  {
    id: "r22",
    userName: "Simran Kaur",
    userCity: "Chandigarh",
    caption: "Punjabi gym motivation — legs day! 🏋️",
    likes: 34000,
    comments: 980,
    shares: 2400,
    isLiked: false,
    gradient: ["#FF6B35", "#FFB800"] as [string, string],
    emoji: "🏋️",
    allowDuet: true,
  },
  {
    id: "r23",
    userName: "Aditya Roy",
    userCity: "Mumbai",
    caption: "Bollywood dance class — mastering the hook step 💃",
    likes: 56000,
    comments: 1800,
    shares: 4200,
    isLiked: true,
    gradient: ["#7B2FBE", "#E91E8C"] as [string, string],
    emoji: "💃",
    allowDuet: true,
  },
  {
    id: "r24",
    userName: "Shalini Bhatt",
    userCity: "Ahmedabad",
    caption: "Dandiya night outfit — chaniya choli vibes ✨",
    likes: 48000,
    comments: 1400,
    shares: 3200,
    isLiked: false,
    gradient: ["#FFB800", "#FF6B35"] as [string, string],
    emoji: "✨",
    allowDuet: true,
  },
  {
    id: "r25",
    userName: "Manish Tiwari",
    userCity: "Lucknow",
    caption: "Tunday Kebabi — 100 years of taste in one bite 🥩",
    likes: 72000,
    comments: 2600,
    shares: 5800,
    isLiked: true,
    gradient: ["#FF6B35", "#E91E8C"] as [string, string],
    emoji: "🥩",
    allowDuet: true,
  },
  {
    id: "r26",
    userName: "Riya Sen",
    userCity: "Kolkata",
    caption: "Sundarbans boat safari — spotted a tiger! 🐅",
    likes: 98000,
    comments: 3900,
    shares: 11000,
    isLiked: false,
    gradient: ["#34C759", "#4A90E2"] as [string, string],
    emoji: "🐅",
    allowDuet: true,
  },
  {
    id: "r27",
    userName: "Nikhil Bansal",
    userCity: "Delhi",
    caption: "Stand-up comedy open mic — my first 5 minutes 🎤",
    likes: 45000,
    comments: 1200,
    shares: 2900,
    isLiked: true,
    gradient: ["#E91E8C", "#7B2FBE"] as [string, string],
    emoji: "🎤",
    allowDuet: true,
  },
  {
    id: "r28",
    userName: "Tanya Mishra",
    userCity: "Pune",
    caption: "Mahabaleshwar strawberry picking — sweetest day 🍓",
    likes: 62000,
    comments: 2100,
    shares: 4700,
    isLiked: false,
    gradient: ["#FF6B35", "#FFB800"] as [string, string],
    emoji: "🍓",
    allowDuet: true,
  },
  {
    id: "r29",
    userName: "Aravind Rao",
    userCity: "Hyderabad",
    caption: "Charminar at midnight — no crowd, all beauty 🕌",
    likes: 85000,
    comments: 3100,
    shares: 8200,
    isLiked: true,
    gradient: ["#00BCD4", "#4A90E2"] as [string, string],
    emoji: "🕌",
    allowDuet: true,
  },
  {
    id: "r30",
    userName: "Mehak Gupta",
    userCity: "Chandigarh",
    caption: "Rock Garden — Nek Chand's masterpiece in stone 🗿",
    likes: 58000,
    comments: 1700,
    shares: 3800,
    isLiked: false,
    gradient: ["#7B2FBE", "#4A90E2"] as [string, string],
    emoji: "🗿",
    allowDuet: true,
  },
];

const ICON_HITSLOP = { top: 12, bottom: 12, left: 12, right: 12 };

// ── Animated chevrons shown when the first reel is visible ───────────────────
function SwipeChevrons({ visible }: { visible: boolean }) {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;
  const wrapOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      Animated.timing(wrapOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      return;
    }

    // Fade in container
    Animated.timing(wrapOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    // Staggered cascading chevrons — each shifts up and fades out, looping
    const makeChevronLoop = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(val, {
              toValue: 1,
              duration: 700,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(val, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

    const l1 = makeChevronLoop(anim1, 0);
    const l2 = makeChevronLoop(anim2, 220);
    const l3 = makeChevronLoop(anim3, 440);
    l1.start(); l2.start(); l3.start();
    return () => { l1.stop(); l2.stop(); l3.stop(); };
  }, [visible]);

  const chevronStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 1, 0.6, 0] }),
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -22] }) }],
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.chevronsWrap, { opacity: wrapOpacity }]}>
      <Animated.View style={chevronStyle(anim1)}>
        <Feather name="chevron-up" size={22} color="rgba(255,255,255,0.55)" />
      </Animated.View>
      <Animated.View style={chevronStyle(anim2)}>
        <Feather name="chevron-up" size={22} color="rgba(255,255,255,0.75)" />
      </Animated.View>
      <Animated.View style={chevronStyle(anim3)}>
        <Feather name="chevron-up" size={22} color="rgba(255,255,255,0.95)" />
      </Animated.View>
      <Text style={styles.chevronLabel}>Swipe up</Text>
    </Animated.View>
  );
}

// ── Individual reel item ──────────────────────────────────────────────────────
function ReelItem({
  reel,
  isActive,
  screenHeight,
  screenWidth,
  isFirst,
  onComment,
}: {
  reel: (typeof REELS)[0];
  isActive: boolean;
  screenHeight: number;
  screenWidth: number;
  isFirst: boolean;
  onComment: () => void;
}) {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const [liked, setLiked]           = useState(reel.isLiked);
  const [likeCount, setLikeCount]   = useState(reel.likes);
  const [currentFilter, setFilter] = useState<string>("none");
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(reel.shares);
  const [showAllFilters, setShowAllFilters] = useState(false);
  const { saveWithWatermark, saving, saved } = useWatermark();
  const [showDownload, setShowDownload] = useState(false);

  // ── Emoji reactions ────────────────────────────────────────────────────
  const [reactions, setReactions] = useState<{ emoji: string; count: number; selected: boolean }[]>([
    { emoji: "❤️", count: 0, selected: false },
    { emoji: "🔥", count: 0, selected: false },
    { emoji: "😂", count: 0, selected: false },
    { emoji: "😢", count: 0, selected: false },
  ]);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiReact = (emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReactions((prev) => {
      if (selectedEmoji === emoji) {
        setSelectedEmoji(null);
        return prev.map((r) => (r.emoji === emoji ? { ...r, count: Math.max(0, r.count - 1), selected: false } : r));
      }
      setSelectedEmoji(emoji);
      return prev.map((r) => {
        if (r.emoji === selectedEmoji) return { ...r, count: Math.max(0, r.count - 1), selected: false };
        if (r.emoji === emoji) return { ...r, count: r.count + 1, selected: true };
        return r;
      });
    });
  };

  // ── Content entry animations ─────────────────────────────────────────────
  const infoY       = useRef(new Animated.Value(36)).current;
  const infoOpacity = useRef(new Animated.Value(0)).current;
  const actX        = useRef(new Animated.Value(28)).current;
  const actOpacity  = useRef(new Animated.Value(0)).current;
  const emojiScale  = useRef(new Animated.Value(isFirst ? 0.7 : 0.85)).current;
  const emojiOpacity = useRef(new Animated.Value(isFirst ? 0 : 1)).current;

  useEffect(() => {
    if (isActive) {
      // Stagger: emoji pops, then info slides up, then actions slide in
      Animated.sequence([
        Animated.delay(isFirst ? 180 : 60),
        Animated.parallel([
          Animated.spring(emojiScale, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
          Animated.timing(emojiOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
        ]),
      ]).start();

      Animated.sequence([
        Animated.delay(isFirst ? 320 : 120),
        Animated.parallel([
          Animated.spring(infoY, { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }),
          Animated.timing(infoOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
        ]),
      ]).start();

      Animated.sequence([
        Animated.delay(isFirst ? 440 : 180),
        Animated.parallel([
          Animated.spring(actX, { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }),
          Animated.timing(actOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
        ]),
      ]).start();
    } else {
      // Reset for re-entry when scrolling back
      infoY.setValue(36);
      infoOpacity.setValue(0);
      actX.setValue(28);
      actOpacity.setValue(0);
      emojiScale.setValue(0.85);
      emojiOpacity.setValue(1);
    }
  }, [isActive]);

  const { trackLike, trackUnlike, trackShare, trackSave } = useAnalytics();

  const handleLike = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLiked((l) => !l);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    if (liked) {
      trackUnlike(reel.id, "reel");
    } else {
      trackLike(reel.id, "reel");
    }
  }, [liked, reel.id, trackLike, trackUnlike]);

  const handleShare = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    trackShare(reel.id, "reel");
    setShowShare(true);
  }, [reel.id, trackShare]);

  const handleSave = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    trackSave(reel.id, "reel");
    setShowDownload(true);
  }, [reel.id, trackSave]);

  const handleRepost = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReposted((prev) => {
      const next = !prev;
      setRepostCount((c) => Math.max(0, c + (next ? 1 : -1)));
      return next;
    });
  }, []);

  const fmt = useCallback(
    (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)),
    []
  );

  const bottomPad = Platform.OS === "web" ? 84 : Math.max(insets.bottom, 16) + 44;

  return (
    <View style={{ width: screenWidth, height: screenHeight, overflow: "hidden" }}>
      <VideoFilter filterId={currentFilter} style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={reel.gradient}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

      {/* Centre content — large play area */}
      <View style={styles.reelOverlay}>
        <View style={styles.reelCenter}>
          <View style={styles.reelRing}>
            <Animated.Text style={[styles.reelEmoji, { opacity: emojiOpacity, transform: [{ scale: emojiScale }] }]}>
              {reel.emoji}
            </Animated.Text>
          </View>
          <Text style={styles.reelPlayHint}>Reel Preview</Text>
          <View style={styles.reelPlayBtn}>
            <Feather name="play-circle" size={40} color="rgba(255,255,255,0.5)" />
          </View>
        </View>
      </View>

      <WatermarkBadge position="top-right" size="sm" opacity={0.5} />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.78)"]}
        style={[styles.reelBottom, { paddingBottom: bottomPad }]}
      >
        {/* Info slides up from below */}
        <Animated.View
          style={[
            styles.reelInfo,
            { opacity: infoOpacity, transform: [{ translateY: infoY }] },
          ]}
        >
          <View style={styles.reelUserRow}>
            <Pressable onPress={() => router.push({ pathname: "/user-profile/[userId]", params: { userId: reel.userId || reel.id } })} accessibilityRole="button" accessibilityLabel={`View ${reel.userName}'s profile`}>
              <Avatar name={reel.userName} size={36} />
            </Pressable>
            <Pressable style={{ flex: 1 }} onPress={() => router.push({ pathname: "/user-profile/[userId]", params: { userId: reel.userId || reel.id } })} accessibilityRole="button" accessibilityLabel={`View ${reel.userName}'s profile`}>
              <Text style={styles.reelUserName} numberOfLines={1}>
                {reel.userName}
              </Text>
              <Text style={styles.reelCity}>{reel.userCity}</Text>
            </Pressable>
            <Pressable
              style={styles.followBtn}
              hitSlop={ICON_HITSLOP}
              accessibilityRole="button"
              accessibilityLabel={`Follow ${reel.userName}`}
            >
              <Text style={styles.followText}>Follow</Text>
            </Pressable>
          </View>
          <Text style={styles.reelCaption} numberOfLines={2}>
            {reel.caption}
          </Text>

          {/* Emoji reactions — horizontal row below caption */}
          <View style={styles.reelEmojiRow}>
            {reactions.map((r) => (
              <Pressable
                key={r.emoji}
                onPress={() => handleEmojiReact(r.emoji)}
                style={[
                  styles.reelEmojiChip,
                  r.selected && { backgroundColor: "rgba(233,30,140,0.35)", borderColor: "rgba(233,30,140,0.5)", borderWidth: 1 },
                ]}
              >
                <Text style={{ fontSize: 14 }}>{r.emoji}</Text>
                {r.count > 0 && (
                  <Text style={styles.reelEmojiCount}>{r.count >= 1000 ? `${(r.count / 1000).toFixed(1)}K` : r.count}</Text>
                )}
              </Pressable>
            ))}
            <Pressable onPress={() => setShowEmojiPicker(!showEmojiPicker)} style={styles.reelEmojiChip}>
              <Feather name="plus" size={12} color="#fff" />
            </Pressable>
          </View>
          {showEmojiPicker && (
            <View style={styles.reelEmojiPicker}>
              {["❤️", "🔥", "😂", "😢", "🤯", "🙌", "👏", "😍", "😡", "😲", "💀", "🙏"].map((emoji) => (
                <Pressable
                  key={emoji}
                  onPress={() => { handleEmojiReact(emoji); setShowEmojiPicker(false); }}
                  style={styles.reelEmojiPickerChip}
                >
                  <Text style={{ fontSize: 16 }}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Actions slide in from the right */}
        <Animated.View
          style={[
            styles.reelActions,
            { opacity: actOpacity, transform: [{ translateX: actX }] },
          ]}
        >
          <Pressable
            style={styles.reelAction}
            onPress={handleLike}
            hitSlop={ICON_HITSLOP}
            accessibilityRole="button"
            accessibilityLabel={liked ? "Unlike" : "Like"}
          >
            <Feather
              name="heart"
              size={28}
              color={liked ? colors.primary : "#fff"}
            />
            <Text style={[styles.reelActionCount, liked && { color: colors.primary }]}>
              {fmt(likeCount)}
            </Text>
          </Pressable>
          <Pressable style={styles.reelAction} onPress={onComment} hitSlop={ICON_HITSLOP} accessibilityRole="button" accessibilityLabel="Comment">
            <Feather name="message-circle" size={28} color="#fff" />
            <Text style={styles.reelActionCount}>{fmt(reel.comments)}</Text>
          </Pressable>
          <Pressable style={styles.reelAction} onPress={handleShare} hitSlop={ICON_HITSLOP} accessibilityRole="button" accessibilityLabel="Share">
            <Feather name="send" size={28} color="#fff" />
            <Text style={styles.reelActionCount}>{fmt(reel.shares)}</Text>
          </Pressable>
          <Pressable
            style={styles.reelAction}
            onPress={handleRepost}
            hitSlop={ICON_HITSLOP}
            accessibilityRole="button"
            accessibilityLabel={reposted ? "Undo repost" : "Repost"}
          >
            <Feather
              name="repeat"
              size={28}
              color={reposted ? colors.primary : "#fff"}
            />
            <Text style={[styles.reelActionCount, reposted && { color: colors.primary }]}>
              {fmt(repostCount)}
            </Text>
          </Pressable>
          <Pressable
            style={styles.reelAction}
            onPress={handleSave}
            disabled={saving}
            hitSlop={ICON_HITSLOP}
            accessibilityRole="button"
            accessibilityLabel={saved ? "Saved" : "Save reel"}
          >
            <Feather
              name={saved ? "check-circle" : "download"}
              size={28}
              color={saved ? "#34C759" : "#fff"}
            />
            <Text style={[styles.reelActionCount, saved && { color: "#34C759" }]}>
              {saving ? "…" : saved ? "Saved" : "Save"}
            </Text>
          </Pressable>
          <Pressable
            style={styles.reelAction}
            onPress={() => {
              if (reel.allowDuet === false) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert("Duet Disabled", "The creator has disabled duets on this reel.");
                return;
              }
              router.push({ pathname: "/duet-record", params: { reelId: reel.id, reelTitle: reel.caption, reelUser: reel.userName } });
            }}
            hitSlop={ICON_HITSLOP}
            accessibilityRole="button"
            accessibilityLabel={reel.allowDuet === false ? "Duet disabled by creator" : "Duet with this reel"}
          >
            <Text style={{ fontSize: 22, opacity: reel.allowDuet === false ? 0.4 : 1 }}>🎙️</Text>
            <Text style={[styles.reelActionCount, reel.allowDuet === false && { opacity: 0.4 }]}>
              {reel.allowDuet === false ? "Duet Off" : "Duet"}
            </Text>
          </Pressable>
          <Pressable
            style={styles.reelAction}
            onPress={() => router.push({ pathname: "/stitch-record", params: { reelId: reel.id, reelTitle: reel.caption, reelUser: reel.userName } })}
            hitSlop={ICON_HITSLOP}
            accessibilityRole="button"
            accessibilityLabel="Stitch this reel"
          >
            <Text style={{ fontSize: 22 }}>🪟</Text>
            <Text style={styles.reelActionCount}>Stitch</Text>
          </Pressable>
          <Pressable
            style={styles.reelAction}
            onPress={() => { setShowFilterBar((s) => !s); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            hitSlop={ICON_HITSLOP}
            accessibilityRole="button"
            accessibilityLabel="Apply filter"
          >
            <Text style={{ fontSize: 22 }}>🎨</Text>
            <Text style={styles.reelActionCount}>Filter</Text>
          </Pressable>
          <Pressable
            style={styles.reelAction}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowMoreOptions(true); }}
            hitSlop={ICON_HITSLOP}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Feather name="more-vertical" size={28} color="#fff" />
          </Pressable>
        </Animated.View>
      </LinearGradient>

      {/* Filter bar — collapsed to 4 popular, expand with "More" */}
      {showFilterBar && (
        <View style={[styles.filterBar, { bottom: bottomPad + 160 }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBarInner}>
            {(showAllFilters ? VIDEO_FILTERS : VIDEO_FILTERS.slice(0, 4)).map((f) => {
              const active = currentFilter === f.id;
              return (
                <Pressable
                  key={f.id}
                  onPress={() => { setFilter(f.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  style={[
                    styles.filterChip,
                    active && { backgroundColor: "rgba(255,255,255,0.28)", borderColor: "#fff" },
                  ]}
                >
                  <Text style={styles.filterEmoji}>{f.emoji}</Text>
                  <Text style={[styles.filterLabel, active && { color: "#fff", fontWeight: "700" }]}>{f.name}</Text>
                </Pressable>
              );
            })}
            <Pressable
              style={styles.filterChip}
              onPress={() => { setShowAllFilters((s) => !s); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            >
              <Text style={styles.filterEmoji}>{showAllFilters ? "◀" : "▶"}</Text>
              <Text style={styles.filterLabel}>{showAllFilters ? "Less" : "More"}</Text>
            </Pressable>
          </ScrollView>
        </View>
      )}

      {/* Stacked swipe-up chevrons — only on first reel */}
      {isFirst && isActive && <SwipeChevrons visible={isActive} />}
      </VideoFilter>

      {/* Share modal */}
      <ShareWithWatermark
        visible={showShare}
        onClose={() => setShowShare(false)}
        data={{
          title: reel.caption,
          message: `Watch this reel by ${reel.userName} from ${reel.userCity} on Ridhi!`,
          url: `https://ridhi.app/reel/${reel.id}`,
        }}
        type="reel"
      />

      {/* More options menu */}
      <ReelOptionsMenu
        visible={showMoreOptions}
        onClose={() => setShowMoreOptions(false)}
        reel={reel}
        onToggleDuet={(enabled) => {
          // In real app, this would call an API to update the reel's duet permission
          // For now, we show a confirmation toast
          Alert.alert(
            enabled ? "Duet Enabled" : "Duet Disabled",
            enabled ? "Others can now duet on this reel." : "Others can no longer duet on this reel."
          );
        }}
      />

      {/* Paid download service */}
      <DownloadService
        visible={showDownload}
        onClose={() => setShowDownload(false)}
        contentId={reel.id}
        contentType="reel"
        contentTitle={reel.caption}
        ownerName={reel.userName}
        ownerId={`user_${reel.userName.replace(/\s+/g, "_").toLowerCase()}`}
      />
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function ReelsScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [commentReel, setCommentReel] = useState<(typeof REELS)[0] | null>(null);
  const [commentText, setCommentText] = useState("");
  const [sentComments, setSentComments] = useState<Record<string, Array<{ id: string; name: string; text: string; timeAgo: string }>>>({});
  const [hiddenReelComments, setHiddenReelComments] = useState<Record<string, Set<string>>>({});
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleLongPressReelComment = useCallback((reelId: string, commentId: string, commentName: string) => {
    Alert.alert(
      "Comment Options",
      `Comment by ${commentName}`,
      [
        {
          text: "Delete Comment",
          style: "destructive",
          onPress: () => {
            setSentComments((prev) => ({
              ...prev,
              [reelId]: (prev[reelId] ?? []).filter((c) => c.id !== commentId),
            }));
            setHiddenReelComments((prev) => {
              const cur = prev[reelId] ? new Set(prev[reelId]) : new Set<string>();
              cur.add(commentId);
              return { ...prev, [reelId]: cur };
            });
          },
        },
        {
          text: "Hide Comment",
          onPress: () => {
            setHiddenReelComments((prev) => {
              const cur = prev[reelId] ? new Set(prev[reelId]) : new Set<string>();
              cur.add(commentId);
              return { ...prev, [reelId]: cur };
            });
          },
        },
        {
          text: "Report",
          onPress: () => Alert.alert("Reported", "This comment has been reported for review. Thank you."),
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  }, []);
  useTrackScreen("reels");

  // ── Screen entry — entire screen slides up from below ─────────────────────
  const screenEntryY       = useRef(new Animated.Value(screenHeight * 0.18)).current;
  const screenEntryOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(screenEntryY, {
        toValue: 0,
        tension: 55,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(screenEntryOpacity, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onViewRef = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) setActiveIndex(viewableItems[0].index ?? 0);
    }
  );

  const renderItem = useCallback(
    ({ item, index }: { item: (typeof REELS)[0]; index: number }) => (
      <ReelItem
        reel={item}
        isActive={index === activeIndex}
        screenHeight={screenHeight}
        screenWidth={screenWidth}
        isFirst={index === 0}
        onComment={() => setCommentReel(item)}
      />
    ),
    [activeIndex, screenHeight, screenWidth]
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: screenHeight,
      offset: screenHeight * index,
      index,
    }),
    [screenHeight]
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: screenEntryOpacity,
          transform: [{ translateY: screenEntryY }],
        },
      ]}
    >
      <SwipeUpHint label="Swipe up for next reel" bottomOffset={100} delay={1000} />
      <View style={[styles.topBar, { top: topPad + 8 }]}>
        <Text style={styles.topTitle}>Reels</Text>
        <Pressable
          onPress={() => router.push("/create-post?type=reel")}
          hitSlop={ICON_HITSLOP}
          accessibilityRole="button"
          accessibilityLabel="Open camera"
        >
          <Feather name="camera" size={24} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={REELS}
        keyExtractor={(r) => r.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 80 }}
        renderItem={renderItem}
        removeClippedSubviews={Platform.OS !== "web"}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
      />

      {/* ── Comment Modal ── */}
      <Modal
        visible={commentReel !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setCommentReel(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setCommentReel(null)} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.commentSheet}>
          <View style={styles.commentSheetInner}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentTitle}>Comments</Text>
              <Pressable onPress={() => setCommentReel(null)}>
                <Feather name="x" size={20} color="rgba(255,255,255,0.6)" />
              </Pressable>
            </View>
            <ScrollView style={styles.commentList} contentContainerStyle={{ gap: 16, paddingBottom: 8 }}>
              {[
                { id: "d1", name: "Ananya Singh", text: "This is so cool! 🔥", timeAgo: "2m" },
                { id: "d2", name: "Rahul Mehta", text: "Love this reel! ❤️", timeAgo: "5m" },
                { id: "d3", name: "Kavya Reddy", text: "Amazing content! 👏", timeAgo: "12m" },
              ].concat(sentComments[commentReel?.id ?? ""] ?? [])
               .filter((c) => !hiddenReelComments[commentReel?.id ?? ""]?.has(c.id))
               .map((c) => (
                <Pressable
                  key={c.id}
                  onLongPress={() => handleLongPressReelComment(commentReel?.id ?? "", c.id, c.name)}
                  delayLongPress={400}
                  style={styles.commentItem}
                >
                  <Avatar name={c.name} size={32} />
                  <View style={styles.commentBubble}>
                    <View style={styles.commentBubbleInner}>
                      <Text style={styles.commentName}>{c.name}</Text>
                      <Text style={styles.commentText}>{c.text}</Text>
                    </View>
                    <Text style={styles.commentTime}>{c.timeAgo}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment…"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={commentText}
                onChangeText={setCommentText}
                returnKeyType="send"
                onSubmitEditing={() => {
                  if (!commentText.trim() || !commentReel) return;
                  setSentComments((prev) => ({
                    ...prev,
                    [commentReel.id]: [...(prev[commentReel.id] ?? []), { id: Date.now().toString(), name: "You", text: commentText.trim(), timeAgo: "just now" }],
                  }));
                  setCommentText("");
                }}
              />
              <Pressable
                onPress={() => {
                  if (!commentText.trim() || !commentReel) return;
                  setSentComments((prev) => ({
                    ...prev,
                    [commentReel.id]: [...(prev[commentReel.id] ?? []), { id: Date.now().toString(), name: "You", text: commentText.trim(), timeAgo: "just now" }],
                  }));
                  setCommentText("");
                }}
                disabled={!commentText.trim()}
                style={[styles.sendBtn, { backgroundColor: commentText.trim() ? "#E91E8C" : "rgba(255,255,255,0.2)" }]}
              >
                <Feather name="send" size={14} color="#fff" />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  topBar: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  topTitle: { color: "#fff", fontSize: 20, fontFamily: "Inter_700Bold" },

  reelOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  reelCenter: { alignItems: "center", gap: 14 },
  reelRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  reelEmoji: { fontSize: 72 },
  reelPlayHint: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  reelPlayBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },

  reelBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 80,
    gap: 12,
  },
  reelInfo: { flex: 1, gap: 10 },
  reelUserRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  reelUserName: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  reelCity: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  followBtn: {
    borderWidth: 1.5,
    borderColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 64,
    alignItems: "center",
  },
  followText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  reelCaption: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  reelActions: { gap: 22, alignItems: "center" },
  reelAction: {
    alignItems: "center",
    gap: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
  },
  reelActionCount: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  reelEmojiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginTop: 6,
  },
  reelEmojiChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 0,
    borderColor: "transparent",
  },
  reelEmojiCount: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  reelEmojiPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "flex-start",
    marginTop: 6,
    marginBottom: 2,
  },
  reelEmojiPickerChip: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  // Stacked swipe chevrons
  chevronsWrap: {
    position: "absolute",
    bottom: 170,
    alignSelf: "center",
    alignItems: "center",
    gap: 0,
    zIndex: 20,
  },
  chevronLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    marginTop: 4,
    textTransform: "uppercase",
  },

  // Filter bar
  filterBar: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 25,
    paddingVertical: 8,
  },
  filterBarInner: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  filterChip: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    minWidth: 56,
    gap: 2,
  },
  filterEmoji: { fontSize: 20 },
  filterLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },

  // Comment modal
  modalBackdrop: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)" },
  commentSheet: { position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 50, justifyContent: "flex-end" },
  commentSheetInner: {
    backgroundColor: "#1A1A2E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    maxHeight: "70%",
    paddingBottom: 20,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  commentTitle: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  commentList: { paddingHorizontal: 16, paddingTop: 12, maxHeight: 400 },
  commentItem: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  commentBubble: { flex: 1, gap: 4 },
  commentBubbleInner: { backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, gap: 2 },
  commentName: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  commentText: { color: "#fff", fontSize: 13, fontFamily: "Inter_400Regular" },
  commentTime: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "Inter_500Medium" },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  commentInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
