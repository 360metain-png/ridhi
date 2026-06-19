import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
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
import { useTrackScreen, useAnalytics } from "@/hooks/useAnalytics";

const VOICE_REELS = [
  {
    id: "v1",
    userName: "Rohan Joshi",
    userCity: "Mumbai",
    caption: "Why every Indian family has a WhatsApp group called 'Family' 😂",
    likes: 18200,
    comments: 1204,
    shares: 340,
    isLiked: false,
    duration: 42,
    gradient: ["#7B2FBE", "#E91E8C"] as [string, string],
    waveform: [0.2, 0.5, 0.8, 0.4, 0.9, 0.3, 0.7, 0.5, 0.8, 0.2, 0.6, 0.9, 0.4, 0.7, 0.3, 0.8, 0.5, 0.6, 0.9, 0.4, 0.7, 0.2, 0.8, 0.5, 0.6, 0.9, 0.3, 0.7, 0.5, 0.8],
    category: "Comedy",
    plays: 218400,
  },
  {
    id: "v2",
    userName: "Priya Kapoor",
    userCity: "Delhi",
    caption: "Startup India: how to raise your first crore 🚀",
    likes: 9400,
    comments: 534,
    shares: 210,
    isLiked: true,
    duration: 18,
    gradient: ["#4A90E2", "#00BCD4"] as [string, string],
    waveform: [0.3, 0.6, 0.4, 0.8, 0.5, 0.7, 0.3, 0.9, 0.4, 0.6, 0.8, 0.3, 0.7, 0.5, 0.9, 0.4, 0.6, 0.8, 0.3, 0.7, 0.5, 0.9, 0.4, 0.6, 0.8, 0.3, 0.7, 0.5, 0.9, 0.4],
    category: "Business",
    plays: 154000,
  },
  {
    id: "v3",
    userName: "Amit Verma",
    userCity: "Bangalore",
    caption: "Cricket World Cup predictions that actually make sense 🏏",
    likes: 25600,
    comments: 892,
    shares: 560,
    isLiked: false,
    duration: 36,
    gradient: ["#34C759", "#1976D2"] as [string, string],
    waveform: [0.5, 0.3, 0.8, 0.6, 0.4, 0.9, 0.5, 0.7, 0.3, 0.8, 0.6, 0.4, 0.9, 0.5, 0.7, 0.3, 0.8, 0.6, 0.4, 0.9, 0.5, 0.7, 0.3, 0.8, 0.6, 0.4, 0.9, 0.5, 0.7, 0.3],
    category: "Cricket",
    plays: 312000,
  },
  {
    id: "v4",
    userName: "Sneha Rao",
    userCity: "Hyderabad",
    caption: "Telugu poetry that hits different ✨📚",
    likes: 7800,
    comments: 312,
    shares: 145,
    isLiked: false,
    duration: 24,
    gradient: ["#FF6B35", "#FFB800"] as [string, string],
    waveform: [0.2, 0.4, 0.6, 0.8, 0.5, 0.3, 0.7, 0.9, 0.4, 0.6, 0.8, 0.3, 0.5, 0.7, 0.9, 0.4, 0.6, 0.8, 0.3, 0.5, 0.7, 0.9, 0.4, 0.6, 0.8, 0.3, 0.5, 0.7, 0.9, 0.4],
    category: "Poetry",
    plays: 98000,
  },
  {
    id: "v5",
    userName: "Kavya Reddy",
    userCity: "Chennai",
    caption: "Morning motivation for hustlers 🌅♥️",
    likes: 42100,
    comments: 1560,
    shares: 890,
    isLiked: true,
    duration: 15,
    gradient: ["#E91E8C", "#FF6B35"] as [string, string],
    waveform: [0.8, 0.5, 0.9, 0.4, 0.7, 0.3, 0.8, 0.6, 0.9, 0.4, 0.7, 0.5, 0.9, 0.3, 0.8, 0.6, 0.9, 0.4, 0.7, 0.5, 0.9, 0.3, 0.8, 0.6, 0.9, 0.4, 0.7, 0.5, 0.9, 0.3],
    category: "Motivation",
    plays: 456000,
  },
  {
    id: "v6",
    userName: "Neha Sharma",
    userCity: "Jaipur",
    caption: "Unsolved mysteries of Rajasthan's forts 🏛️",
    likes: 32000,
    comments: 1200,
    shares: 560,
    isLiked: false,
    duration: 28,
    gradient: ["#FF6B35", "#FFB800"] as [string, string],
    waveform: [0.4, 0.7, 0.3, 0.8, 0.6, 0.4, 0.9, 0.5, 0.7, 0.3, 0.8, 0.6, 0.4, 0.9, 0.5, 0.7, 0.3, 0.8, 0.6, 0.4, 0.9, 0.5, 0.7, 0.3, 0.8, 0.6, 0.4, 0.9, 0.5, 0.7],
    category: "Stories",
    plays: 289000,
  },
  {
    id: "v7",
    userName: "Ravi Kumar",
    userCity: "Patna",
    caption: "Why Bihar is India's most underrated state 🏔️",
    likes: 45000,
    comments: 1800,
    shares: 1200,
    isLiked: true,
    duration: 22,
    gradient: ["#34C759", "#1976D2"] as [string, string],
    waveform: [0.5, 0.3, 0.7, 0.9, 0.4, 0.6, 0.8, 0.3, 0.7, 0.5, 0.9, 0.4, 0.6, 0.8, 0.3, 0.7, 0.5, 0.9, 0.4, 0.6, 0.8, 0.3, 0.7, 0.5, 0.9, 0.4, 0.6, 0.8, 0.3, 0.7],
    category: "Travel",
    plays: 367000,
  },
  {
    id: "v8",
    userName: "Shalini Gupta",
    userCity: "Kolkata",
    caption: "Durga Puja: the story behind the festival 🌈",
    likes: 29000,
    comments: 950,
    shares: 780,
    isLiked: false,
    duration: 35,
    gradient: ["#E91E8C", "#7B2FBE"] as [string, string],
    waveform: [0.6, 0.4, 0.8, 0.5, 0.7, 0.3, 0.9, 0.6, 0.4, 0.8, 0.5, 0.7, 0.3, 0.9, 0.6, 0.4, 0.8, 0.5, 0.7, 0.3, 0.9, 0.6, 0.4, 0.8, 0.5, 0.7, 0.3, 0.9, 0.6, 0.4],
    category: "Culture",
    plays: 198000,
  },
  {
    id: "v9",
    userName: "Aditya Menon",
    userCity: "Kochi",
    caption: "Malayalam movie recommendations that'll blow your mind 🎬",
    likes: 38000,
    comments: 1400,
    shares: 950,
    isLiked: true,
    duration: 19,
    gradient: ["#00BCD4", "#4A90E2"] as [string, string],
    waveform: [0.3, 0.6, 0.4, 0.8, 0.5, 0.7, 0.3, 0.9, 0.4, 0.6, 0.8, 0.3, 0.7, 0.5, 0.9, 0.4, 0.6, 0.8, 0.3, 0.7, 0.5, 0.9, 0.4, 0.6, 0.8, 0.3, 0.7, 0.5, 0.9, 0.4],
    category: "Cinema",
    plays: 245000,
  },
  {
    id: "v10",
    userName: "Maya Iyer",
    userCity: "Chennai",
    caption: "Tamil Nadu's hidden beach towns you must visit 🏖️",
    likes: 52000,
    comments: 2100,
    shares: 1800,
    isLiked: false,
    duration: 26,
    gradient: ["#FF6B35", "#E91E8C"] as [string, string],
    waveform: [0.7, 0.3, 0.8, 0.6, 0.4, 0.9, 0.5, 0.7, 0.3, 0.8, 0.6, 0.4, 0.9, 0.5, 0.7, 0.3, 0.8, 0.6, 0.4, 0.9, 0.5, 0.7, 0.3, 0.8, 0.6, 0.4, 0.9, 0.5, 0.7, 0.3],
    category: "Travel",
    plays: 412000,
  },
  {
    id: "v11",
    userName: "Farhan Ali",
    userCity: "Hyderabad",
    caption: "Why Hyderabadi Biryani is the king of all biryanis 🍜",
    likes: 61000,
    comments: 2400,
    shares: 2100,
    isLiked: true,
    duration: 14,
    gradient: ["#FFB800", "#FF6B35"] as [string, string],
    waveform: [0.4, 0.8, 0.5, 0.7, 0.3, 0.9, 0.6, 0.4, 0.8, 0.5, 0.7, 0.3, 0.9, 0.6, 0.4, 0.8, 0.5, 0.7, 0.3, 0.9, 0.6, 0.4, 0.8, 0.5, 0.7, 0.3, 0.9, 0.6, 0.4, 0.8],
    category: "Food",
    plays: 534000,
  },
  {
    id: "v12",
    userName: "Isha Malhotra",
    userCity: "Chandigarh",
    caption: "The real story of Punjabi hospitality 🌮",
    likes: 27000,
    comments: 890,
    shares: 650,
    isLiked: false,
    duration: 31,
    gradient: ["#7B2FBE", "#4A90E2"] as [string, string],
    waveform: [0.5, 0.7, 0.3, 0.8, 0.6, 0.4, 0.9, 0.5, 0.7, 0.3, 0.8, 0.6, 0.4, 0.9, 0.5, 0.7, 0.3, 0.8, 0.6, 0.4, 0.9, 0.5, 0.7, 0.3, 0.8, 0.6, 0.4, 0.9, 0.5, 0.7],
    category: "Culture",
    plays: 178000,
  },
  {
    id: "v13",
    userName: "Vikram Nair",
    userCity: "Bangalore",
    caption: "How to crack your first tech interview — a startup CTO's advice 💻",
    likes: 34000,
    comments: 1200,
    shares: 890,
    isLiked: true,
    duration: 24,
    gradient: ["#34C759", "#00BCD4"] as [string, string],
    waveform: [0.3, 0.6, 0.4, 0.8, 0.5, 0.7, 0.3, 0.9, 0.4, 0.6, 0.8, 0.3, 0.7, 0.5, 0.9, 0.4, 0.6, 0.8, 0.3, 0.7, 0.5, 0.9, 0.4, 0.6, 0.8, 0.3, 0.7, 0.5, 0.9, 0.4],
    category: "Tech",
    plays: 298000,
  },
  {
    id: "v14",
    userName: "Aisha Khan",
    userCity: "Lucknow",
    caption: "Chikankari: the art that put Lucknow on the world map 🧵",
    likes: 41000,
    comments: 1500,
    shares: 1200,
    isLiked: false,
    duration: 18,
    gradient: ["#E91E8C", "#FF6B35"] as [string, string],
    waveform: [0.6, 0.4, 0.8, 0.5, 0.7, 0.3, 0.9, 0.6, 0.4, 0.8, 0.5, 0.7, 0.3, 0.9, 0.6, 0.4, 0.8, 0.5, 0.7, 0.3, 0.9, 0.6, 0.4, 0.8, 0.5, 0.7, 0.3, 0.9, 0.6, 0.4],
    category: "Art",
    plays: 287000,
  },
  {
    id: "v15",
    userName: "Rajesh Bansal",
    userCity: "Delhi",
    caption: "Delhi's street food scene: a local's guide 🌮",
    likes: 58000,
    comments: 2300,
    shares: 1900,
    isLiked: true,
    duration: 20,
    gradient: ["#FF6B35", "#FFB800"] as [string, string],
    waveform: [0.4, 0.7, 0.3, 0.8, 0.6, 0.4, 0.9, 0.5, 0.7, 0.3, 0.8, 0.6, 0.4, 0.9, 0.5, 0.7, 0.3, 0.8, 0.6, 0.4, 0.9, 0.5, 0.7, 0.3, 0.8, 0.6, 0.4, 0.9, 0.5, 0.7],
    category: "Food",
    plays: 456000,
  },
];

const ICON_HITSLOP = { top: 12, bottom: 12, left: 12, right: 12 };

function Waveform({
  bars,
  active,
  color,
  progress,
}: {
  bars: number[];
  active: boolean;
  color: string;
  progress: number;
}) {
  const animValues = useRef(bars.map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    if (active) {
      const anims = animValues.map((val, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 60),
            Animated.timing(val, {
              toValue: bars[i],
              duration: 400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(val, {
              toValue: 0.3,
              duration: 400,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        )
      );
      anims.forEach((a) => a.start());
      return () => anims.forEach((a) => a.stop());
    } else {
      animValues.forEach((val) => val.setValue(0.3));
    }
  }, [active, bars]);

  const totalBars = bars.length;
  const litCount = Math.floor(progress * totalBars);

  return (
    <View style={styles.waveformRow}>
      {animValues.map((val, i) => (
        <Animated.View
          key={i}
          style={[
            styles.waveformBar,
            {
              backgroundColor: i < litCount ? color : `${color}40`,
              opacity: active ? val : 0.4,
              transform: [{ scaleY: active ? val.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) : 0.3 }],
            },
          ]}
        />
      ))}
    </View>
  );
}

function VoiceReelItem({
  reel,
  isActive,
  screenHeight,
  screenWidth,
  isFirst,
}: {
  reel: (typeof VOICE_REELS)[0];
  isActive: boolean;
  screenHeight: number;
  screenWidth: number;
  isFirst: boolean;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [liked, setLiked] = useState(reel.isLiked);
  const [likeCount, setLikeCount] = useState(reel.likes);
  const [playing, setPlaying] = useState(isActive);
  const [progress, setProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      setPlaying(true);
      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: reel.duration * 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    } else {
      setPlaying(false);
      progressAnim.setValue(0);
    }
  }, [isActive, reel.duration]);

  useEffect(() => {
    const listener = progressAnim.addListener(({ value }) => setProgress(value));
    return () => progressAnim.removeListener(listener);
  }, [progressAnim]);

  const { trackLike, trackUnlike, trackShare } = useAnalytics();

  const handleLike = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLiked((l) => !l);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    if (liked) {
      trackUnlike(reel.id, "voice_reel");
    } else {
      trackLike(reel.id, "voice_reel");
    }
  }, [liked, reel.id, trackLike, trackUnlike]);

  const handleShare = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    trackShare(reel.id, "voice_reel");
  }, [reel.id, trackShare]);

  const fmt = useCallback(
    (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)),
    []
  );

  const bottomPad = Platform.OS === "web" ? 84 : Math.max(insets.bottom, 16) + 44;

  return (
    <View style={{ width: screenWidth, height: screenHeight, overflow: "hidden" }}>
      <LinearGradient
        colors={reel.gradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Audio visualizer center */}
      <View style={styles.reelCenter}>
        <View style={styles.audioIconWrap}>
          <Feather name={playing ? "pause" : "play"} size={32} color="#fff" />
        </View>
        <Waveform
          bars={reel.waveform}
          active={playing}
          color="#fff"
          progress={progress}
        />
        <Text style={styles.durationText}>
          {Math.floor(progress * reel.duration)}s / {reel.duration}s
        </Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{reel.category}</Text>
        </View>
      </View>

      {/* Bottom overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.78)"]}
        style={[styles.reelBottom, { paddingBottom: bottomPad }]}
      >
        <View style={styles.reelInfo}>
          <View style={styles.reelUserRow}>
            <Avatar name={reel.userName} size={36} />
            <View style={{ flex: 1 }}>
              <Text style={styles.reelUserName} numberOfLines={1}>
                {reel.userName}
              </Text>
              <Text style={styles.reelCity}>{reel.userCity}</Text>
            </View>
            <Pressable style={styles.followBtn} hitSlop={ICON_HITSLOP}>
              <Text style={styles.followText}>Follow</Text>
            </Pressable>
          </View>
          <Text style={styles.reelCaption} numberOfLines={2}>
            {reel.caption}
          </Text>
          <View style={styles.playsRow}>
            <Feather name="headphones" size={12} color="rgba(255,255,255,0.7)" />
            <Text style={styles.playsText}>{fmt(reel.plays)} plays</Text>
          </View>
        </View>

        <View style={styles.reelActions}>
          <Pressable style={styles.reelAction} onPress={handleLike} hitSlop={ICON_HITSLOP}>
            <Feather name="heart" size={28} color={liked ? colors.primary : "#fff"} />
            <Text style={[styles.reelActionCount, liked && { color: colors.primary }]}>
              {fmt(likeCount)}
            </Text>
          </Pressable>
          <Pressable style={styles.reelAction} hitSlop={ICON_HITSLOP}>
            <Feather name="message-circle" size={28} color="#fff" />
            <Text style={styles.reelActionCount}>{fmt(reel.comments)}</Text>
          </Pressable>
          <Pressable style={styles.reelAction} onPress={handleShare} hitSlop={ICON_HITSLOP}>
            <Feather name="send" size={28} color="#fff" />
            <Text style={styles.reelActionCount}>{fmt(reel.shares)}</Text>
          </Pressable>
          <Pressable style={styles.reelAction} hitSlop={ICON_HITSLOP}>
            <Feather name="mic" size={28} color="#fff" />
            <Text style={styles.reelActionCount}>Reply</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

export default function VoiceReelsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  useTrackScreen("voice_reels");

  const onViewRef = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const idx = viewableItems[0].index ?? 0;
        setActiveIndex(idx);
      }
    }
  ).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, paddingHorizontal: 16 }]}>
        <Pressable onPress={() => router.push("/podcasts")} style={styles.headerBtn}>
          <Feather name="radio" size={20} color="#fff" />
          <Text style={styles.headerBtnText}>Podcasts</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Voice Reels</Text>
        <Pressable onPress={() => router.push("/create-post?type=audio")} style={styles.headerBtn}>
          <Feather name="mic" size={20} color="#fff" />
          <Text style={styles.headerBtnText}>Record</Text>
        </Pressable>
      </View>

      <FlatList
        data={VOICE_REELS}
        keyExtractor={(r) => r.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={screenHeight}
        decelerationRate="fast"
        onViewableItemsChanged={onViewRef}
        viewabilityConfig={viewConfigRef}
        renderItem={({ item, index }) => (
          <VoiceReelItem
            reel={item}
            isActive={index === activeIndex}
            screenHeight={screenHeight}
            screenWidth={screenWidth}
            isFirst={index === 0}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  headerBtnText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  reelCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  audioIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  waveformRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    height: 40,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
    height: 40,
  },
  durationText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.7)",
  },
  categoryBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  categoryText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
    letterSpacing: 0.5,
  },
  reelBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 80,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  reelInfo: { flex: 1, marginBottom: 8 },
  reelUserRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  reelUserName: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  reelCity: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.7)",
  },
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  followText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  reelCaption: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    lineHeight: 20,
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  playsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  playsText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
  },
  reelActions: {
    alignItems: "center",
    gap: 16,
    marginBottom: 8,
  },
  reelAction: {
    alignItems: "center",
    gap: 4,
  },
  reelActionCount: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
