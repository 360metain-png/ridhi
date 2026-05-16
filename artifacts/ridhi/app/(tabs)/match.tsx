import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { MATCH_PROFILES } from "@/data/mockData";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 32;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;

type Profile = typeof MATCH_PROFILES[0];

export default function MatchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [profiles, setProfiles] = useState<Profile[]>(MATCH_PROFILES);
  const [matched, setMatched] = useState<Profile | null>(null);
  const position = useRef(new Animated.ValueXY()).current;
  const rotateAnim = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-8deg", "0deg", "8deg"],
    extrapolate: "clamp",
  });
  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const nopeOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 60;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gs) => position.setValue({ x: gs.dx, y: gs.dy }),
    onPanResponderRelease: (_, gs) => {
      if (gs.dx > SWIPE_THRESHOLD) {
        swipe("right");
      } else if (gs.dx < -SWIPE_THRESHOLD) {
        swipe("left");
      } else {
        Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      }
    },
  });

  const swipe = (dir: "left" | "right") => {
    const toX = dir === "right" ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.timing(position, {
      toValue: { x: toX, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      if (dir === "right" && profiles.length > 0 && Math.random() > 0.4) {
        setMatched(profiles[0]);
      }
      setProfiles((prev) => prev.slice(1));
    });
  };

  const current = profiles[0];
  const next = profiles[1];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Discover</Text>
        <Pressable style={[styles.filterBtn, { backgroundColor: colors.muted }]}>
          <Feather name="sliders" size={18} color={colors.primary} />
        </Pressable>
      </View>

      <View style={[styles.cardArea, { paddingBottom: bottomPad + 16 }]}>
        {profiles.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="heart" size={48} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>All caught up!</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Check back later for new profiles
            </Text>
          </View>
        ) : (
          <>
            {next && (
              <View style={[styles.card, styles.cardBack, { width: CARD_WIDTH }]}>
                <Image source={{ uri: next.imageUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.75)"]} style={styles.cardGrad} />
              </View>
            )}

            {current && (
              <Animated.View
                style={[
                  styles.card,
                  {
                    width: CARD_WIDTH,
                    transform: [
                      { translateX: position.x },
                      { translateY: position.y },
                      { rotate: rotateAnim },
                    ],
                  },
                ]}
                {...panResponder.panHandlers}
              >
                <Image source={{ uri: current.imageUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.cardGrad} />

                <Animated.View style={[styles.likeStamp, { opacity: likeOpacity }]}>
                  <Text style={styles.likeStampText}>LIKE</Text>
                </Animated.View>
                <Animated.View style={[styles.nopeStamp, { opacity: nopeOpacity }]}>
                  <Text style={styles.nopeStampText}>PASS</Text>
                </Animated.View>

                <View style={styles.cardInfo}>
                  <View style={styles.cardNameRow}>
                    <Text style={styles.cardName}>
                      {current.name}, {current.age}
                    </Text>
                    <View style={[styles.matchBadge, { backgroundColor: colors.primary }]}>
                      <Feather name="zap" size={12} color="#fff" />
                      <Text style={styles.matchPct}>{current.matchPercent}%</Text>
                    </View>
                  </View>
                  <View style={styles.cardMetaRow}>
                    <Feather name="map-pin" size={13} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.cardMeta}>{current.distance} · {current.city}</Text>
                  </View>
                  <Text style={styles.cardBio} numberOfLines={2}>{current.bio}</Text>
                  <View style={styles.cardTags}>
                    {current.interests.slice(0, 3).map((tag) => (
                      <View key={tag} style={styles.cardTag}>
                        <Text style={styles.cardTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Animated.View>
            )}
          </>
        )}
      </View>

      {profiles.length > 0 && (
        <View style={[styles.buttons, { paddingBottom: bottomPad + 20 }]}>
          <Pressable
            onPress={() => swipe("left")}
            style={[styles.swipeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Feather name="x" size={28} color="#FF3B30" />
          </Pressable>
          <Pressable
            onPress={() => {}}
            style={[styles.swipeBtn, styles.superBtn, { backgroundColor: colors.gold + "20", borderColor: colors.gold }]}
          >
            <Feather name="star" size={22} color={colors.gold} />
          </Pressable>
          <Pressable
            onPress={() => swipe("right")}
            style={[styles.swipeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Feather name="heart" size={28} color={colors.primary} />
          </Pressable>
        </View>
      )}

      {matched && (
        <View style={styles.matchOverlay}>
          <LinearGradient
            colors={[colors.primary + "EE", colors.secondary + "EE"]}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.matchWow}>It's a Match!</Text>
          <Text style={styles.matchSub}>You and {matched.name} liked each other</Text>
          <View style={styles.matchBtns}>
            <Pressable
              style={[styles.matchBtn, { backgroundColor: "#fff" }]}
              onPress={() => setMatched(null)}
            >
              <Text style={[styles.matchBtnText, { color: colors.primary }]}>Keep Swiping</Text>
            </Pressable>
            <Pressable
              style={[styles.matchBtn, { backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 1.5, borderColor: "#fff" }]}
              onPress={() => setMatched(null)}
            >
              <Text style={[styles.matchBtnText, { color: "#fff" }]}>Send Message</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  filterBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardArea: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    height: SCREEN_HEIGHT * 0.55,
    borderRadius: 24,
    overflow: "hidden",
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  cardBack: { transform: [{ scale: 0.95 }, { translateY: 12 }] },
  cardGrad: { position: "absolute", bottom: 0, left: 0, right: 0, height: "60%" },
  likeStamp: {
    position: "absolute",
    top: 40,
    left: 20,
    borderWidth: 3,
    borderColor: "#34C759",
    borderRadius: 8,
    padding: 6,
    transform: [{ rotate: "-20deg" }],
  },
  likeStampText: { color: "#34C759", fontSize: 24, fontFamily: "Inter_700Bold" },
  nopeStamp: {
    position: "absolute",
    top: 40,
    right: 20,
    borderWidth: 3,
    borderColor: "#FF3B30",
    borderRadius: 8,
    padding: 6,
    transform: [{ rotate: "20deg" }],
  },
  nopeStampText: { color: "#FF3B30", fontSize: 24, fontFamily: "Inter_700Bold" },
  cardInfo: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, gap: 6 },
  cardNameRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardName: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold" },
  matchBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  matchPct: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  cardMetaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardMeta: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "Inter_400Regular" },
  cardBio: { color: "rgba(255,255,255,0.9)", fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  cardTags: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  cardTag: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  cardTagText: { color: "#fff", fontSize: 12, fontFamily: "Inter_500Medium" },
  buttons: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 20, paddingHorizontal: 24 },
  swipeBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  superBtn: { width: 52, height: 52, borderRadius: 26 },
  emptyState: { alignItems: "center", gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center" },
  matchOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    zIndex: 100,
  },
  matchWow: { color: "#fff", fontSize: 44, fontFamily: "Inter_700Bold" },
  matchSub: { color: "rgba(255,255,255,0.85)", fontSize: 17, fontFamily: "Inter_400Regular" },
  matchBtns: { gap: 12, width: "80%", marginTop: 16 },
  matchBtn: {
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: "center",
  },
  matchBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
