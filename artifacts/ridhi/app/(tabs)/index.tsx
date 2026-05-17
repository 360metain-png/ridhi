import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { FeedPost, Post } from "@/components/FeedPost";
import { StoryRow } from "@/components/StoryRow";
import { CoinBadge } from "@/components/CoinBadge";
import { Avatar } from "@/components/Avatar";
import { INITIAL_POSTS, STORIES, REGIONAL_POSTS } from "@/data/mockData";

const AI_PICKS: Array<{ id: string; userName: string; reason: string; preview: string; tag: string }> = [
  { id: "ai1", userName: "Priya Sharma", reason: "Based on your interest in Dance", preview: "New Bollywood challenge taking India by storm 💃🔥", tag: "#RidhiDance" },
  { id: "ai2", userName: "Mumbai Foodies", reason: "You liked similar food posts", preview: "10 street food spots you MUST visit this monsoon 🍛", tag: "#MumbaiFoodGuide" },
  { id: "ai3", userName: "Tech With Rohan", reason: "Trending in your city", preview: "India's startup ecosystem is growing faster than ever 🚀", tag: "#StartupIndia" },
  { id: "ai4", userName: "Desi Fitness", reason: "Matches your fitness interest", preview: "5-minute morning yoga routine for busy Indians 🧘", tag: "#FitIndia" },
];

const LOGO = require("../../assets/images/ridhi_logo.png");

const FEED_TABS = ["For You", "Local", "Trending", "Community", "Following"] as const;
type FeedTab = typeof FEED_TABS[number];

const LOCAL_TRENDING_TAGS: Record<string, string[]> = {
  Mumbai:    ["#MumbaiRains", "#MarathiManus", "#MumbaiStreetFood", "#DabbawalaLife", "#AmchiMumbai"],
  Delhi:     ["#DilliHatke", "#DelhiFoods", "#DelhiDiaries", "#DilliWali", "#MetroLife"],
  Bangalore: ["#NammaBengaluru", "#TechCity", "#BengaluruRains", "#KannadaOoru", "#GardenCity"],
  Chennai:   ["#ChennaiLife", "#TamilCulture", "#MarinaDrive", "#BriyaniTime", "#NammaChennai"],
  Hyderabad: ["#HyderabadiDum", "#NizamCity", "#TeluguVibes", "#PearlCity", "#Cyberabad"],
  Kolkata:   ["#KolkataStreetFood", "#DurgaPuja", "#BengaliVibes", "#CityofJoy", "#EastIndia"],
  Pune:      ["#PuneVibes", "#MarathiPride", "#PuneMonsoon", "#PunekarsOnly", "#FilmCity"],
  Kochi:     ["#GodZone", "#MalayaliDiaries", "#BackwaterLife", "#KeralaTourism", "#KochiDiaries"],
  Ahmedabad: ["#AmdavadVibes", "#GujaratiFood", "#NavratriSpecial", "#KhichdiDay", "#AavoAmdavad"],
  Jaipur:    ["#PinkCity", "#RajasthanDiaries", "#JaipurFood", "#HeritageCraft", "#GharKiGali"],
};
const DEFAULT_TAGS = ["#RidhiIndia", "#DesiVibes", "#LocalTalent", "#IndianCreators", "#ShareYourStory"];

const TRENDING_POSTS: Post[] = [
  {
    id: "t1",
    userName: "Priya Sharma",
    userAvatar: "",
    content: "🔥 This Bollywood dance challenge is going viral! Join the #RidhiDance movement sweeping India! 💃",
    likes: 12400,
    comments: 843,
    shares: 2100,
    isLiked: false,
    timeAgo: "2h",
    type: "text",
    hashtags: ["#RidhiDance", "#Trending", "#Bollywood"],
  },
  {
    id: "t2",
    userName: "Mumbai Foodies",
    userAvatar: "",
    content: "Top 10 street food spots in Mumbai that every foodie must visit! 🍛🥘",
    likes: 8900,
    comments: 412,
    shares: 1560,
    isLiked: true,
    timeAgo: "4h",
    type: "text",
    hashtags: ["#MumbaiFoodGuide", "#StreetFood"],
  },
  {
    id: "t3",
    userName: "Desi Memes India",
    userAvatar: "",
    content: "When your mom asks why you're still on your phone at 2am 😂🤣 Every Indian can relate!",
    likes: 45200,
    comments: 3421,
    shares: 8900,
    isLiked: false,
    timeAgo: "6h",
    type: "text",
    hashtags: ["#DesiMemes", "#IndianMoms", "#Relatable"],
  },
];

const COMMUNITY_POSTS: Post[] = [
  {
    id: "c1",
    userName: "Tamil Nadu Creators",
    userAvatar: "",
    content: "நம்ம community-ல புதிய members-க்கு வரவேற்பு! 🎉 Share your first post and get 50 coins! #TamilCreators",
    likes: 3200,
    comments: 156,
    shares: 420,
    isLiked: false,
    timeAgo: "1h",
    type: "text",
    hashtags: ["#TamilCreators", "#NewMembers"],
  },
  {
    id: "c2",
    userName: "Bollywood Fans India",
    userAvatar: "",
    content: "Which is the best Bollywood movie of 2024? Drop your pick in the comments! 🎬🍿",
    likes: 7800,
    comments: 1243,
    shares: 890,
    isLiked: true,
    timeAgo: "3h",
    type: "text",
    hashtags: ["#Bollywood", "#MoviePoll", "#BollywoodFans"],
  },
  {
    id: "c3",
    userName: "Startup India Community",
    userAvatar: "",
    content: "Looking for co-founders? Drop your idea below and let's connect! 🚀 India is the next startup hub!",
    likes: 2100,
    comments: 445,
    shares: 320,
    isLiked: false,
    timeAgo: "5h",
    type: "text",
    hashtags: ["#StartupIndia", "#CoFounder", "#Entrepreneurship"],
  },
];

export default function FeedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { language: appLang } = useApp();
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FeedTab>("For You");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 66;

  const userCity = user?.city ?? "Mumbai";
  const userLang = user?.language ?? appLang.name;

  const localPosts = useMemo(() =>
    REGIONAL_POSTS.filter((p) =>
      p.userCity?.toLowerCase() === userCity.toLowerCase() ||
      p.language?.toLowerCase() === userLang.toLowerCase() ||
      p.language?.toLowerCase() === appLang.name.toLowerCase()
    ),
    [userCity, userLang, appLang.name]
  );

  const forYouPosts = useMemo(() => {
    const local = posts.filter((p) => p.userCity?.toLowerCase() === userCity.toLowerCase());
    const others = posts.filter((p) => p.userCity?.toLowerCase() !== userCity.toLowerCase());
    return [...local, ...others];
  }, [posts, userCity]);

  const nearYouPosts = useMemo(() => localPosts.slice(0, 5), [localPosts]);
  const trendingLocalPosts = useMemo(() =>
    [...localPosts].sort((a, b) => b.likes - a.likes).slice(0, 6),
    [localPosts]
  );
  const localTags = LOCAL_TRENDING_TAGS[userCity] ?? DEFAULT_TAGS;

  const headerAnim = useRef(new Animated.Value(0)).current;
  const liveIndicator = useRef(new Animated.Value(0.4)).current;
  const recsFadeAnim = useRef(new Animated.Value(0)).current;
  const recsShown = useRef(false);

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(liveIndicator, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(liveIndicator, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleFeedScroll = (e: { nativeEvent: { contentOffset: { y: number } } }) => {
    if (!recsShown.current && e.nativeEvent.contentOffset.y > 160) {
      recsShown.current = true;
      Animated.timing(recsFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setRefreshing(false);
  };

  const getActivePosts = (): Post[] => {
    switch (activeTab) {
      case "Local":     return localPosts;
      case "Trending":  return TRENDING_POSTS;
      case "Community": return COMMUNITY_POSTS;
      case "Following": return INITIAL_POSTS.slice(0, 3);
      default:          return forYouPosts;
    }
  };

  const renderListHeader = () => {
    if (activeTab === "For You") {
      return (
        <>
          <StoryRow
            stories={STORIES}
            onAddStory={() => {}}
            onStory={() => {}}
            selfName={user?.name ?? "Me"}
          />

          {nearYouPosts.length > 0 && (
            <Animated.View style={[styles.nearYouSection, { opacity: recsFadeAnim, transform: [{ translateY: recsFadeAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: colors.secondary + "22" }]}>
                  <Feather name="map-pin" size={11} color={colors.secondary} />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Near You in {userCity}
                </Text>
                <View style={[styles.cityPill, { backgroundColor: colors.secondary + "18", borderColor: colors.secondary + "40" }]}>
                  <Text style={[styles.cityPillText, { color: colors.secondary }]}>{userLang}</Text>
                </View>
                <Pressable style={[styles.seeAllBtn, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.seeAllText, { color: colors.primary }]}>See all</Text>
                </Pressable>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.nearYouScroll}
              >
                {nearYouPosts.map((post) => (
                  <Pressable
                    key={post.id}
                    style={[styles.nearYouCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <LinearGradient
                      colors={[colors.secondary + "14", colors.primary + "06"]}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.nearYouCardTop}>
                      <Avatar name={post.userName} size={30} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.nearYouCardName, { color: colors.foreground }]} numberOfLines={1}>
                          {post.userName}
                        </Text>
                        <View style={styles.nearYouCityRow}>
                          <Feather name="map-pin" size={9} color={colors.secondary} />
                          <Text style={[styles.nearYouCityText, { color: colors.secondary }]}>
                            {post.userCity}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text style={[styles.nearYouCardContent, { color: colors.foreground }]} numberOfLines={3}>
                      {post.content}
                    </Text>
                    <View style={styles.nearYouCardFooter}>
                      <Feather name="heart" size={11} color={colors.mutedForeground} />
                      <Text style={[styles.nearYouCardStat, { color: colors.mutedForeground }]}>
                        {post.likes >= 1000 ? `${(post.likes / 1000).toFixed(1)}k` : post.likes}
                      </Text>
                      <Text style={[styles.nearYouCardTime, { color: colors.mutedForeground }]}>
                        · {post.timeAgo}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          <Animated.View style={[styles.aiPicksSection, { opacity: recsFadeAnim, transform: [{ translateY: recsFadeAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}>
            <View style={styles.aiPicksHeader}>
              <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={styles.aiPicksIcon}>
                <Feather name="cpu" size={11} color="#fff" />
              </LinearGradient>
              <Text style={[styles.aiPicksTitle, { color: colors.foreground }]}>✨ AI Picks for You</Text>
              <Pressable onPress={() => router.push("/ai-assistant")} style={[styles.aiPicksBtn, { backgroundColor: colors.muted }]}>
                <Text style={[styles.aiPicksBtnText, { color: colors.primary }]}>Tune</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.aiPicksScroll}>
              {AI_PICKS.map((pick) => (
                <Pressable key={pick.id} style={[styles.aiPickCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <LinearGradient colors={[colors.secondary + "18", colors.primary + "08"]} style={StyleSheet.absoluteFill} />
                  <View style={styles.aiPickCardTop}>
                    <Avatar name={pick.userName} size={28} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.aiPickCardName, { color: colors.foreground }]} numberOfLines={1}>{pick.userName}</Text>
                      <Text style={[styles.aiPickCardReason, { color: colors.primary }]} numberOfLines={1}>{pick.reason}</Text>
                    </View>
                  </View>
                  <Text style={[styles.aiPickCardPreview, { color: colors.foreground }]} numberOfLines={2}>{pick.preview}</Text>
                  <View style={[styles.aiPickCardTag, { backgroundColor: colors.primary + "18" }]}>
                    <Text style={[styles.aiPickCardTagText, { color: colors.primary }]}>{pick.tag}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        </>
      );
    }

    if (activeTab === "Local") {
      return (
        <View style={styles.localBannerWrap}>
          {/* City hero card */}
          <LinearGradient
            colors={[colors.secondary, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.localBanner}
          >
            <View style={styles.localBannerLeft}>
              <View style={styles.localBannerIconWrap}>
                <Feather name="map-pin" size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.localBannerCity}>{userCity}</Text>
                <Text style={styles.localBannerLang}>
                  {appLang.nativeName}  ·  {appLang.name}
                </Text>
              </View>
            </View>
            <View style={{ alignItems: "flex-end", gap: 6 }}>
              <View style={[styles.localBannerBadge, { backgroundColor: "rgba(255,255,255,0.22)" }]}>
                <Text style={styles.localBannerBadgeText}>🔥 Trending</Text>
              </View>
              <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Inter_500Medium" }}>
                {localPosts.length} local posts
              </Text>
            </View>
          </LinearGradient>

          {/* Trending hashtag chips */}
          <View style={styles.trendTagsHeader}>
            <Feather name="hash" size={13} color={colors.primary} />
            <Text style={[styles.trendTagsTitle, { color: colors.foreground }]}>Trending in {userCity}</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendTagsScroll}
          >
            {localTags.map((tag, i) => (
              <Pressable
                key={tag}
                onPress={() => router.push("/explore")}
                style={[
                  styles.trendTag,
                  {
                    backgroundColor: i === 0 ? colors.primary : colors.card,
                    borderColor: i === 0 ? colors.primary : colors.border,
                  },
                ]}
              >
                {i === 0 && (
                  <Text style={{ fontSize: 10 }}>🔥</Text>
                )}
                <Text style={[styles.trendTagText, { color: i === 0 ? "#fff" : colors.foreground }]}>
                  {tag}
                </Text>
                {i === 0 && (
                  <View style={[styles.trendTagHot, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
                    <Text style={{ color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold" }}>HOT</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>

          {/* Top trending local posts horizontal preview */}
          {trendingLocalPosts.length > 0 && (
            <View style={{ gap: 8 }}>
              <View style={styles.trendTopHeader}>
                <LinearGradient colors={[colors.destructive + "28", colors.primary + "18"]} style={styles.trendTopIcon}>
                  <Feather name="trending-up" size={12} color={colors.destructive} />
                </LinearGradient>
                <Text style={[styles.trendTopTitle, { color: colors.foreground }]}>
                  Top Posts in {userCity}
                </Text>
                <Pressable onPress={() => {}} style={[styles.seeAllBtn, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.seeAllText, { color: colors.primary }]}>See all</Text>
                </Pressable>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trendTopScroll}
              >
                {trendingLocalPosts.map((post, idx) => (
                  <Pressable
                    key={post.id}
                    style={[styles.trendTopCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  >
                    <LinearGradient
                      colors={idx === 0
                        ? [colors.destructive + "18", colors.primary + "08"]
                        : [colors.secondary + "10", "transparent"]}
                      style={StyleSheet.absoluteFill}
                    />
                    {/* Rank badge */}
                    <View style={[
                      styles.trendRankBadge,
                      { backgroundColor: idx === 0 ? colors.destructive : idx === 1 ? colors.primary : colors.secondary }
                    ]}>
                      <Text style={styles.trendRankText}>#{idx + 1}</Text>
                    </View>

                    <View style={styles.trendTopCardTop}>
                      <Avatar name={post.userName} size={26} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.trendTopCardName, { color: colors.foreground }]} numberOfLines={1}>
                          {post.userName}
                        </Text>
                        {post.userCity && (
                          <View style={styles.nearYouCityRow}>
                            <Feather name="map-pin" size={8} color={colors.secondary} />
                            <Text style={[styles.nearYouCityText, { color: colors.secondary }]}>{post.userCity}</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <Text style={[styles.trendTopCardContent, { color: colors.foreground }]} numberOfLines={3}>
                      {post.content}
                    </Text>

                    {post.hashtags && post.hashtags.length > 0 && (
                      <Text style={[styles.trendTopCardHashtag, { color: colors.primary }]} numberOfLines={1}>
                        {post.hashtags[0]}
                      </Text>
                    )}

                    <View style={styles.trendTopCardFooter}>
                      <View style={styles.trendTopCardStat}>
                        <Feather name="heart" size={11} color={colors.destructive} />
                        <Text style={[styles.trendTopCardStatText, { color: colors.mutedForeground }]}>
                          {post.likes >= 1000 ? `${(post.likes / 1000).toFixed(1)}k` : post.likes}
                        </Text>
                      </View>
                      <View style={styles.trendTopCardStat}>
                        <Feather name="message-circle" size={11} color={colors.mutedForeground} />
                        <Text style={[styles.trendTopCardStatText, { color: colors.mutedForeground }]}>
                          {post.comments}
                        </Text>
                      </View>
                      <Text style={[styles.trendTopCardTime, { color: colors.mutedForeground }]}>
                        {post.timeAgo}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Divider with label */}
          <View style={styles.allPostsDivider}>
            <View style={[styles.allPostsDividerLine, { backgroundColor: colors.border }]} />
            <View style={[styles.allPostsDividerLabel, { backgroundColor: colors.muted }]}>
              <Feather name="list" size={11} color={colors.mutedForeground} />
              <Text style={[styles.allPostsDividerText, { color: colors.mutedForeground }]}>All local posts</Text>
            </View>
            <View style={[styles.allPostsDividerLine, { backgroundColor: colors.border }]} />
          </View>
        </View>
      );
    }

    return (
      <View style={[
        styles.tabBanner,
        { backgroundColor: activeTab === "Trending" ? colors.destructive + "12" : colors.secondary + "10" },
      ]}>
        <LinearGradient
          colors={activeTab === "Trending"
            ? [colors.destructive + "20", "transparent"]
            : [colors.secondary + "20", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <Feather
          name={activeTab === "Trending" ? "trending-up" : "users"}
          size={15}
          color={activeTab === "Trending" ? colors.destructive : colors.secondary}
        />
        <Text style={[styles.tabBannerText, { color: activeTab === "Trending" ? colors.destructive : colors.secondary }]}>
          {activeTab === "Trending" ? "🔥 Trending across India right now" : "Latest from your communities"}
        </Text>
      </View>
    );
  };

  const renderEmptyLocal = () => (
    <View style={styles.emptyLocal}>
      <LinearGradient
        colors={[colors.secondary + "18", colors.primary + "08"]}
        style={styles.emptyLocalIcon}
      >
        <Feather name="map-pin" size={32} color={colors.secondary} />
      </LinearGradient>
      <Text style={[styles.emptyLocalTitle, { color: colors.foreground }]}>
        No posts from {userCity} yet
      </Text>
      <Text style={[styles.emptyLocalSub, { color: colors.mutedForeground }]}>
        Be the first creator from your region!{"\n"}Post in {userLang} to grow your local audience.
      </Text>
      <Pressable
        onPress={() => router.push("/create-post")}
        style={[styles.emptyLocalBtn, { backgroundColor: colors.primary }]}
      >
        <Feather name="plus" size={14} color="#fff" />
        <Text style={styles.emptyLocalBtnText}>Create Regional Post</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary + "18", colors.secondary + "08", "transparent"]}
        style={[styles.headerGlow, { height: topPad + 120 }]}
        pointerEvents="none"
      />

      <Animated.View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            backgroundColor: colors.surface + "F0",
            borderBottomColor: colors.border,
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
          },
        ]}
      >
        <View style={styles.logoGroup}>
          <Image source={LOGO} style={styles.logoMini} resizeMode="contain" />
          <View>
            <Text style={[styles.appName, { color: colors.foreground }]}>Ridhi</Text>
            <View style={styles.onlineRow}>
              <Animated.View style={[styles.onlineDot, { backgroundColor: colors.success, opacity: liveIndicator }]} />
              <Text style={[styles.onlineText, { color: colors.mutedForeground }]}>2.4M online</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push("/explore")}
            style={[styles.headerBtn, { backgroundColor: colors.muted }]}
          >
            <Feather name="search" size={18} color={colors.foreground} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/notifications")}
            style={[styles.headerBtn, { backgroundColor: colors.muted }]}
          >
            <Feather name="bell" size={18} color={colors.foreground} />
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.notifBadge} />
          </Pressable>
          <Pressable onPress={() => router.push("/wallet")} style={styles.headerBtn}>
            <CoinBadge amount={user?.coins ?? 0} size="sm" />
          </Pressable>
        </View>
      </Animated.View>

      <View style={[styles.feedTabBar, { backgroundColor: colors.surface + "F0", borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.feedTabScroll}>
          {FEED_TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Pressable key={tab} onPress={() => setActiveTab(tab)} style={styles.feedTab}>
                {isActive ? (
                  <LinearGradient
                    colors={tab === "Local"
                      ? [colors.secondary + "28", colors.primary + "14"]
                      : [colors.primary + "20", colors.secondary + "10"]}
                    style={styles.feedTabActive}
                  >
                    {tab === "Local" && (
                      <Feather name="map-pin" size={11} color={colors.secondary} />
                    )}
                    <Text style={[styles.feedTabText, { color: tab === "Local" ? colors.secondary : colors.primary }]}>
                      {tab}
                    </Text>
                    {tab === "Trending" && (
                      <View style={[styles.trendDot, { backgroundColor: colors.destructive }]} />
                    )}
                  </LinearGradient>
                ) : (
                  <View style={styles.feedTabInactive}>
                    {tab === "Local" && (
                      <Feather name="map-pin" size={11} color={colors.mutedForeground} />
                    )}
                    <Text style={[styles.feedTabText, { color: colors.mutedForeground }]}>{tab}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
        {activeTab === "Local" && (
          <View style={[styles.localTabSubBar, { borderTopColor: colors.border }]}>
            <Feather name="map-pin" size={10} color={colors.secondary} />
            <Text style={[styles.localTabSubText, { color: colors.secondary }]}>
              {userCity}  ·  {appLang.nativeName}
            </Text>
            <View style={[styles.localTabDot, { backgroundColor: colors.secondary }]} />
            <Text style={[styles.localTabSubText, { color: colors.mutedForeground }]}>
              {localPosts.length} local posts
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={getActivePosts()}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <FeedPost
            post={item}
            onLike={handleLike}
            onComment={() => {}}
            onProfile={() => {}}
          />
        )}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={activeTab === "Local" ? renderEmptyLocal : null}
        onScroll={handleFeedScroll}
        scrollEventThrottle={32}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: bottomPad + 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGlow: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    zIndex: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
    zIndex: 10,
  },
  logoGroup: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  logoMini: { width: 34, height: 34 },
  appName: { fontSize: 20, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
  onlineText: { fontSize: 10, fontFamily: "Inter_400Regular" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerBtn: { padding: 8, borderRadius: 20, position: "relative" },
  notifBadge: {
    position: "absolute",
    top: 6, right: 6,
    width: 7, height: 7,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#08080F",
  },
  feedTabBar: { borderBottomWidth: StyleSheet.hairlineWidth },
  feedTabScroll: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  feedTab: {},
  feedTabActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  feedTabInactive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  feedTabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  trendDot: { width: 6, height: 6, borderRadius: 3 },
  localTabSubBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  localTabSubText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  localTabDot: { width: 3, height: 3, borderRadius: 2 },

  // Near You section
  nearYouSection: { paddingTop: 4, paddingBottom: 4 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 4,
  },
  sectionIcon: {
    width: 24, height: 24, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  sectionTitle: { fontSize: 14, fontFamily: "Inter_700Bold", flex: 1 },
  cityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  cityPillText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  seeAllBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  seeAllText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  nearYouScroll: { paddingHorizontal: 12, gap: 10, paddingRight: 16 },
  nearYouCard: {
    width: 175,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 8,
    overflow: "hidden",
  },
  nearYouCardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  nearYouCardName: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  nearYouCityRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  nearYouCityText: { fontSize: 10, fontFamily: "Inter_500Medium" },
  nearYouCardContent: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  nearYouCardFooter: { flexDirection: "row", alignItems: "center", gap: 4 },
  nearYouCardStat: { fontSize: 11, fontFamily: "Inter_500Medium" },
  nearYouCardTime: { fontSize: 10, fontFamily: "Inter_400Regular" },

  // AI Picks
  aiPicksSection: { paddingTop: 4, paddingBottom: 8 },
  aiPicksHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingBottom: 10 },
  aiPicksIcon: { width: 24, height: 24, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  aiPicksTitle: { fontSize: 14, fontFamily: "Inter_700Bold", flex: 1 },
  aiPicksBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  aiPicksBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  aiPicksScroll: { paddingHorizontal: 12, gap: 10, paddingRight: 16 },
  aiPickCard: { width: 200, borderRadius: 16, borderWidth: 1, padding: 12, gap: 8, overflow: "hidden" },
  aiPickCardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  aiPickCardName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  aiPickCardReason: { fontSize: 10, fontFamily: "Inter_400Regular" },
  aiPickCardPreview: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  aiPickCardTag: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  aiPickCardTagText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  // Local banner
  localBannerWrap: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 4, gap: 6 },
  localBanner: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  localBannerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  localBannerIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  localBannerCity: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  localBannerLang: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  localBannerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  localBannerBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  localSubBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  localSubBannerText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },

  // Generic tab banner
  tabBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  tabBannerText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  // Empty local state
  emptyLocal: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 40,
    gap: 12,
  },
  emptyLocalIcon: {
    width: 72, height: 72, borderRadius: 24,
    alignItems: "center", justifyContent: "center",
  },
  emptyLocalTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginTop: 4,
  },
  emptyLocalSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyLocalBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 24,
    marginTop: 8,
  },
  emptyLocalBtnText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },

  // Trending hashtag chips
  trendTagsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
    paddingTop: 12,
    paddingBottom: 6,
  },
  trendTagsTitle: { fontSize: 13, fontFamily: "Inter_700Bold" },
  trendTagsScroll: { gap: 8, paddingBottom: 4 },
  trendTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  trendTagText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  trendTagHot: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },

  // Top trending local posts
  trendTopHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
    paddingTop: 14,
  },
  trendTopIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  trendTopTitle: { fontSize: 13, fontFamily: "Inter_700Bold", flex: 1 },
  trendTopScroll: { gap: 10, paddingBottom: 4, paddingTop: 4 },
  trendTopCard: {
    width: 190,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 8,
    overflow: "hidden",
    position: "relative",
  },
  trendRankBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trendRankText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  trendTopCardTop: { flexDirection: "row", alignItems: "center", gap: 8, paddingRight: 28 },
  trendTopCardName: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  trendTopCardContent: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  trendTopCardHashtag: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  trendTopCardFooter: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  trendTopCardStat: { flexDirection: "row", alignItems: "center", gap: 3 },
  trendTopCardStatText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  trendTopCardTime: { fontSize: 10, fontFamily: "Inter_400Regular", marginLeft: "auto" },

  // All posts divider
  allPostsDivider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 16,
    paddingBottom: 4,
  },
  allPostsDividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  allPostsDividerLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  allPostsDividerText: { fontSize: 11, fontFamily: "Inter_500Medium" },
});
