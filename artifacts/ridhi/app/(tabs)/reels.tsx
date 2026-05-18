import React, { useCallback, useRef, useState } from "react";
import {
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
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/Avatar";
import { WatermarkBadge } from "@/components/WatermarkBadge";
import { useWatermark } from "@/hooks/useWatermark";
import { SwipeUpHint } from "@/components/SwipeUpHint";

const REELS = [
  {
    id: "r1",
    userName: "Ananya Singh",
    userCity: "Delhi",
    caption: "Street food diaries — the paranthas were unreal! 🔥",
    likes: 12400,
    comments: 342,
    shares: 89,
    isLiked: false,
    gradient: ["#FF6B35", "#E91E8C"] as [string, string],
    emoji: "🍛",
  },
  {
    id: "r2",
    userName: "Rahul Mehta",
    userCity: "Mumbai",
    caption: "Sunrise at Marine Drive never disappoints. Peace ✨",
    likes: 8900,
    comments: 156,
    shares: 234,
    isLiked: true,
    gradient: ["#4A90E2", "#7B2FBE"] as [string, string],
    emoji: "🌅",
  },
  {
    id: "r3",
    userName: "Kavya Reddy",
    userCity: "Hyderabad",
    caption: "Garba night — best night of the year! Navratri vibes 💃",
    likes: 34500,
    comments: 892,
    shares: 1200,
    isLiked: false,
    gradient: ["#FFB800", "#E91E8C"] as [string, string],
    emoji: "💃",
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
  },
];

const ICON_HITSLOP = { top: 12, bottom: 12, left: 12, right: 12 };

function ReelItem({
  reel,
  isActive,
  screenHeight,
  screenWidth,
}: {
  reel: (typeof REELS)[0];
  isActive: boolean;
  screenHeight: number;
  screenWidth: number;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [liked, setLiked] = useState(reel.isLiked);
  const [likeCount, setLikeCount] = useState(reel.likes);
  const { saveWithWatermark, saving, saved } = useWatermark();

  const handleLike = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLiked((l) => !l);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  }, [liked]);

  const handleSave = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    saveWithWatermark();
  }, [saveWithWatermark]);

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
      <View style={styles.reelOverlay}>
        <View style={styles.reelCenter}>
          <Text style={styles.reelEmoji}>{reel.emoji}</Text>
          <Text style={styles.reelPlayHint}>Reel Preview</Text>
        </View>
      </View>

      <WatermarkBadge position="top-right" size="sm" opacity={0.5} />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.75)"]}
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
        </View>

        <View style={styles.reelActions}>
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
          <Pressable style={styles.reelAction} hitSlop={ICON_HITSLOP} accessibilityRole="button" accessibilityLabel="Comment">
            <Feather name="message-circle" size={28} color="#fff" />
            <Text style={styles.reelActionCount}>{fmt(reel.comments)}</Text>
          </Pressable>
          <Pressable style={styles.reelAction} hitSlop={ICON_HITSLOP} accessibilityRole="button" accessibilityLabel="Share">
            <Feather name="send" size={28} color="#fff" />
            <Text style={styles.reelActionCount}>{fmt(reel.shares)}</Text>
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
          <Pressable style={styles.reelAction} hitSlop={ICON_HITSLOP} accessibilityRole="button" accessibilityLabel="More options">
            <Feather name="more-vertical" size={28} color="#fff" />
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

export default function ReelsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

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
    <View style={styles.container}>
      <SwipeUpHint label="Swipe up for next reel" bottomOffset={100} delay={1000} />
      <View style={[styles.topBar, { top: topPad + 8 }]}>
        <Text style={styles.topTitle}>Reels</Text>
        <Pressable
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
    </View>
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
  reelCenter: { alignItems: "center", gap: 12 },
  reelEmoji: { fontSize: 80 },
  reelPlayHint: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
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
  reelAction: { alignItems: "center", gap: 4, minWidth: 44, minHeight: 44, justifyContent: "center" },
  reelActionCount: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
