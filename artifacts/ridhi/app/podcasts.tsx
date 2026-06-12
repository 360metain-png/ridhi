import React, { useState, useRef } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { SeoHead } from "@/components/SeoHead";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import {
  PODCAST_CATEGORIES,
  TRENDING_EPISODES,
  LIVE_NOW,
  FOLLOWING_CREATORS,
  PodcastEpisode,
  PodcastCategory,
  formatPlays,
  formatDuration,
} from "@/data/podcastData";
const COIN_IMAGE = require("../assets/images/ridhi_coin.png");

const { width } = Dimensions.get("window");
const CARD_W = width * 0.72;

function LiveBadge() {
  const pulse = useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.4, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={styles.liveBadgeRow}>
      <Animated.View style={[styles.liveDot, { transform: [{ scale: pulse }] }]} />
      <Text style={styles.liveBadgeText}>LIVE</Text>
    </View>
  );
}

function EpisodeCard({ ep, onPress, wide }: { ep: PodcastEpisode; onPress: () => void; wide?: boolean }) {
  const colors = useColors();
  const w = wide ? CARD_W : width - 32;
  return (
    <Pressable onPress={onPress} style={[styles.epCard, { width: w, backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={{ position: "relative" }}>
        <Image source={{ uri: ep.coverImage }} style={[styles.epCover, { width: w }]} />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.82)"]}
          style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
        />
        {ep.isLive && <LiveBadge />}
        {ep.isExclusive && (
          <View style={styles.exclusiveBadge}>
            <Image source={COIN_IMAGE} style={{ width: 10, height: 10 }} resizeMode="contain" />
            <Text style={styles.exclusiveText}>EXCLUSIVE</Text>
          </View>
        )}
        {ep.isVideo && !ep.isLive && (
          <View style={styles.videoBadge}>
            <Feather name="video" size={10} color="#fff" />
            <Text style={styles.videoBadgeText}>VIDEO</Text>
          </View>
        )}
        <View style={styles.epCardBottom}>
          <Text style={styles.epCardTitle} numberOfLines={2}>{ep.title}</Text>
          <View style={styles.epCardMeta}>
            <Text style={styles.epCardHost}>{ep.hostName}</Text>
            <Text style={styles.epCardDot}>·</Text>
            <Text style={styles.epCardDuration}>{formatDuration(ep.durationMin)}</Text>
          </View>
        </View>
        <View style={styles.epPlayBtn}>
          <Feather name="play" size={16} color="#fff" />
        </View>
      </View>
      <View style={[styles.epStats, { borderTopColor: colors.border }]}>
        <View style={styles.epStat}>
          <Feather name="headphones" size={12} color={colors.mutedForeground} />
          <Text style={[styles.epStatText, { color: colors.mutedForeground }]}>{formatPlays(ep.plays)}</Text>
        </View>
        <View style={styles.epStat}>
          <Feather name="heart" size={12} color={colors.mutedForeground} />
          <Text style={[styles.epStatText, { color: colors.mutedForeground }]}>{formatPlays(ep.likes)}</Text>
        </View>
        <View style={styles.epStat}>
          <Feather name="message-circle" size={12} color={colors.mutedForeground} />
          <Text style={[styles.epStatText, { color: colors.mutedForeground }]}>{formatPlays(ep.comments)}</Text>
        </View>
        {ep.hasAITranscript && (
          <View style={[styles.aiChip, { backgroundColor: colors.secondary + "22" }]}>
            <Text style={[styles.aiChipText, { color: colors.secondary }]}>AI Notes</Text>
          </View>
        )}
        <Text style={[styles.epCardTime, { color: colors.mutedForeground }]}>{ep.uploadedAgo}</Text>
      </View>
    </Pressable>
  );
}

export default function PodcastsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<PodcastCategory>("All");
  const scrollY = useRef(new Animated.Value(0)).current;

  const filtered = activeCategory === "All"
    ? TRENDING_EPISODES
    : TRENDING_EPISODES.filter((e) => e.category === activeCategory);

  const headerOpacity = scrollY.interpolate({ inputRange: [0, 80], outputRange: [0, 1], extrapolate: "clamp" });

  return (
    <>
      <SeoHead
        title="Ridhi Podcasts — AI Podcasts, Live Audio Shows & Creator Episodes | India"
        description="Discover podcasts on Ridhi — AI-generated shows, live audio episodes, creator podcasts, and trending audio content in 13 Indian languages."
      />
      <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Floating header on scroll */}
      <Animated.View style={[styles.floatingHeader, { opacity: headerOpacity, backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.floatingTitle, { color: colors.text }]}>Podcasts</Text>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero */}
        <LinearGradient
          colors={["#1A0533", "#0A0A0F"]}
          style={[styles.hero, { paddingTop: insets.top + 10 }]}
        >
          {/* Back button */}
          <Pressable onPress={() => router.back()} style={styles.heroBackBtn}>
            <Feather name="arrow-left" size={22} color="rgba(255,255,255,0.9)" />
          </Pressable>
          <View style={styles.heroContent}>
            <View style={styles.heroLeft}>
              <View style={styles.heroBadge}>
                <Feather name="mic" size={11} color="#E91E8C" />
                <Text style={styles.heroBadgeText}>Podcasts</Text>
              </View>
              <Text style={styles.heroTitle}>India's{"\n"}Top Voices</Text>
              <Text style={styles.heroSub}>Audio · Video · Live · AI Notes</Text>
            </View>
            <View style={{ gap: 10, alignItems: "center" }}>
              <Pressable onPress={() => router.push("/podcast-create")} style={styles.heroCreateBtn}>
                <LinearGradient colors={["#E91E8C", "#7B2FBE"]} style={styles.heroCreateGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Feather name="mic" size={22} color="#fff" />
                  <Text style={styles.heroCreateText}>Record</Text>
                </LinearGradient>
              </Pressable>
              <Pressable onPress={() => router.push("/my-podcast-channel" as any)}
                style={[styles.myChannelBtn, { backgroundColor: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.25)" }]}>
                <Feather name="user" size={12} color="#fff" />
                <Text style={styles.myChannelTxt}>My Channel</Text>
              </Pressable>
            </View>
          </View>
        </LinearGradient>

        {/* Live Now */}
        {LIVE_NOW.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.liveDotSmall} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Live Now</Text>
            </View>
            {LIVE_NOW.map((ep) => (
              <EpisodeCard key={ep.id} ep={ep} onPress={() => router.push("/podcast-room")} />
            ))}
          </View>
        )}

        {/* Following Creators */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="users" size={15} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Following</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}>
            {FOLLOWING_CREATORS.map((creator) => (
              <Pressable key={creator.id} onPress={() => router.push("/podcast-room")} style={{ alignItems: "center", gap: 6, width: 68 }}>
                <View style={{ position: "relative" }}>
                  {creator.isLive && (
                    <View style={styles.followingLiveRing} />
                  )}
                  <View style={[styles.followingAvatar, creator.isLive && { borderColor: "#E91E8C", borderWidth: 2.5 }]}>
                    <Text style={styles.followingAvatarText}>{creator.name.charAt(0)}</Text>
                  </View>
                  {creator.isLive && (
                    <View style={styles.followingLiveBadge}>
                      <Text style={styles.followingLiveBadgeText}>LIVE</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.followingName, { color: colors.text }]} numberOfLines={1}>
                  {creator.name.split(" ")[0]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {PODCAST_CATEGORIES.map((cat) => {
            const active = cat === activeCategory;
            return (
              <Pressable
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.catChipText, { color: active ? "#fff" : colors.mutedForeground }]}>{cat}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Trending Horizontal Scroll */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="trending-up" size={15} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Trending in India</Text>
          </View>
          <FlatList
            data={filtered}
            horizontal
            keyExtractor={(i) => i.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item }) => (
              <EpisodeCard ep={item} onPress={() => router.push("/podcast-room")} wide />
            )}
          />
        </View>

        {/* All Episodes vertical list */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="list" size={15} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>All Episodes</Text>
          </View>
          {filtered.map((ep) => (
            <View key={ep.id} style={{ paddingHorizontal: 16, marginBottom: 14 }}>
              <EpisodeCard ep={ep} onPress={() => router.push("/podcast-room")} />
            </View>
          ))}
        </View>

        {/* Start your own CTA */}
        <Pressable onPress={() => router.push("/podcast-create")} style={{ marginHorizontal: 16, marginTop: 4, marginBottom: 12 }}>
          <LinearGradient colors={["#E91E8C22", "#7B2FBE22"]} style={styles.startCta}>
            <LinearGradient colors={["#E91E8C", "#7B2FBE"]} style={styles.startCtaIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Feather name="mic" size={20} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={[styles.startCtaTitle, { color: colors.text }]}>Start Your Own Podcast</Text>
              <Text style={[styles.startCtaSub, { color: colors.mutedForeground }]}>Record, schedule, earn — all in one tap</Text>
            </View>
            <Feather name="arrow-right" size={18} color={colors.primary} />
          </LinearGradient>
        </Pressable>
      </Animated.ScrollView>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  floatingTitle: { fontSize: 17, fontFamily: "Inter_700Bold", flex: 1 },
  backBtn: { padding: 6, borderRadius: 20 },
  hero: { paddingHorizontal: 20, paddingBottom: 28 },
  heroBackBtn: { padding: 4, alignSelf: "flex-start", marginBottom: 6 },
  heroContent: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 12 },
  heroLeft: { flex: 1 },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 10 },
  heroBadgeText: { color: "#E91E8C", fontFamily: "Inter_600SemiBold", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 },
  heroTitle: { fontSize: 34, fontFamily: "Inter_700Bold", color: "#fff", lineHeight: 40, marginBottom: 8 },
  heroSub: { color: "rgba(255,255,255,0.55)", fontFamily: "Inter_400Regular", fontSize: 13 },
  heroCreateBtn: { marginLeft: 16 },
  heroCreateGrad: { width: 80, height: 80, borderRadius: 20, alignItems: "center", justifyContent: "center", gap: 6 },
  heroCreateText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 11 },
  liveBadgeRow: { position: "absolute", top: 10, left: 10, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,0,0,0.85)", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#fff" },
  liveBadgeText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 0.5 },
  liveDotSmall: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF3B30" },
  exclusiveBadge: { position: "absolute", top: 10, right: 10, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,184,0,0.9)", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  exclusiveText: { color: "#000", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 0.5 },
  videoBadge: { position: "absolute", top: 10, right: 10, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(123,47,190,0.85)", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  videoBadgeText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 0.5 },
  epCard: { borderRadius: 14, overflow: "hidden", borderWidth: StyleSheet.hairlineWidth },
  epCover: { height: 180, resizeMode: "cover" },
  epCardBottom: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 12 },
  epCardTitle: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14, lineHeight: 20, marginBottom: 4 },
  epCardMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  epCardHost: { color: "rgba(255,255,255,0.75)", fontFamily: "Inter_500Medium", fontSize: 12 },
  epCardDot: { color: "rgba(255,255,255,0.4)", fontSize: 12 },
  epCardDuration: { color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular", fontSize: 12 },
  epPlayBtn: { position: "absolute", top: 10, right: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center" },
  epStats: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth },
  epStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  epStatText: { fontFamily: "Inter_400Regular", fontSize: 12 },
  epCardTime: { fontFamily: "Inter_400Regular", fontSize: 11, marginLeft: "auto" },
  aiChip: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  aiChipText: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
  section: { marginTop: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 16, marginBottom: 14 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 17 },
  catRow: { paddingHorizontal: 16, paddingVertical: 4, gap: 8, marginTop: 20 },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  catChipText: { fontFamily: "Inter_500Medium", fontSize: 13 },
  startCta: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 16 },
  startCtaIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  startCtaTitle: { fontFamily: "Inter_700Bold", fontSize: 15, marginBottom: 2 },
  startCtaSub: { fontFamily: "Inter_400Regular", fontSize: 12 },
  // Following section
  followingAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "#7B2FBE40",
    alignItems: "center", justifyContent: "center",
    borderWidth: 0, borderColor: "transparent",
  },
  followingAvatarText: { color: "#C9A0F5", fontFamily: "Inter_700Bold", fontSize: 20 },
  followingLiveRing: {
    position: "absolute", top: -3, left: -3, right: -3, bottom: -3,
    borderRadius: 34, borderWidth: 2, borderColor: "#E91E8C",
  },
  followingLiveBadge: {
    position: "absolute", bottom: -4, left: "50%", transform: [{ translateX: -16 }],
    backgroundColor: "#E91E8C", borderRadius: 6,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  followingLiveBadgeText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 0.3 },
  followingName: { fontFamily: "Inter_500Medium", fontSize: 11, textAlign: "center" },
  myChannelBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  myChannelTxt: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 11 },
});
