import React, { useState, useRef } from "react";
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/Avatar";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

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

const ITEM_HEIGHT = SCREEN_HEIGHT;

function ReelItem({ reel, isActive }: { reel: typeof REELS[0]; isActive: boolean }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [liked, setLiked] = useState(reel.isLiked);
  const [likeCount, setLikeCount] = useState(reel.likes);

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLiked((l) => !l);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
  const bottomPad = Platform.OS === "web" ? 84 : 60;

  return (
    <View style={[styles.reel, { height: ITEM_HEIGHT }]}>
      <LinearGradient
        colors={reel.gradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.reelOverlay}>
        <View style={[styles.reelCenter]}>
          <Text style={styles.reelEmoji}>{reel.emoji}</Text>
          <Text style={styles.reelPlayHint}>Reel Preview</Text>
        </View>
      </View>

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={[styles.reelBottom, { paddingBottom: bottomPad + 20 }]}
      >
        <View style={styles.reelInfo}>
          <View style={styles.reelUserRow}>
            <Avatar name={reel.userName} size={36} />
            <View>
              <Text style={styles.reelUserName}>{reel.userName}</Text>
              <Text style={styles.reelCity}>{reel.userCity}</Text>
            </View>
            <Pressable style={styles.followBtn}>
              <Text style={styles.followText}>Follow</Text>
            </Pressable>
          </View>
          <Text style={styles.reelCaption} numberOfLines={2}>{reel.caption}</Text>
        </View>

        <View style={styles.reelActions}>
          <Pressable style={styles.reelAction} onPress={handleLike}>
            <Feather name="heart" size={28} color={liked ? colors.primary : "#fff"} />
            <Text style={styles.reelActionCount}>{fmt(likeCount)}</Text>
          </Pressable>
          <Pressable style={styles.reelAction}>
            <Feather name="message-circle" size={28} color="#fff" />
            <Text style={styles.reelActionCount}>{fmt(reel.comments)}</Text>
          </Pressable>
          <Pressable style={styles.reelAction}>
            <Feather name="send" size={28} color="#fff" />
            <Text style={styles.reelActionCount}>{fmt(reel.shares)}</Text>
          </Pressable>
          <Pressable style={styles.reelAction}>
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
  const [activeIndex, setActiveIndex] = useState(0);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const onViewRef = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) setActiveIndex(viewableItems[0].index ?? 0);
  });

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { top: topPad + 8 }]}>
        <Text style={styles.topTitle}>Reels</Text>
        <Pressable>
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
        getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 80 }}
        renderItem={({ item, index }) => (
          <ReelItem reel={item} isActive={index === activeIndex} />
        )}
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
  reel: { width: SCREEN_WIDTH, overflow: "hidden" },
  reelOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  reelCenter: { alignItems: "center", gap: 12 },
  reelEmoji: { fontSize: 80 },
  reelPlayHint: { color: "rgba(255,255,255,0.6)", fontSize: 14, fontFamily: "Inter_500Medium" },
  reelBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 60,
    gap: 12,
  },
  reelInfo: { flex: 1, gap: 8 },
  reelUserRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  reelUserName: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  reelCity: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Inter_400Regular" },
  followBtn: {
    borderWidth: 1.5,
    borderColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 4,
  },
  followText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  reelCaption: { color: "#fff", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  reelActions: { gap: 20, alignItems: "center" },
  reelAction: { alignItems: "center", gap: 4 },
  reelActionCount: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
