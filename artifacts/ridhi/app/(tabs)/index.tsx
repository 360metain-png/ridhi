import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SeoHead } from "@/components/SeoHead";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { useTrackScreen, useAnalytics } from "@/hooks/useAnalytics";
import { apiFetch } from "@/utils/api";
import { FeedPost, Post } from "@/components/FeedPost";
import { StoryRow } from "@/components/StoryRow";
import { CoinBadge } from "@/components/CoinBadge";
import { RidhiCoin } from "@/components/RidhiCoin";
import { Avatar } from "@/components/Avatar";
import { INITIAL_POSTS, STORIES, REGIONAL_POSTS, POPUP_ADS, PRODUCTS, type BannerAdConfig } from "@/data/mockData";
import { BannerAd } from "@/components/BannerAd";
import { PopupAd } from "@/components/PopupAd";
import { PromoBanner } from "@/components/PromoBanner";
import { SwipeUpHint } from "@/components/SwipeUpHint";


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

const LIVE_HOSTS = [
  { id: "lh1", name: "Kavya Reddy",   city: "Hyderabad", viewers: "1.2K", level: "L5", levelColor: "#FFD700", gradient: ["#7B2FBE", "#E91E8C"] },
  { id: "lh2", name: "Priya Sharma",  city: "Mumbai",    viewers: "840",  level: "L4", levelColor: "#C0C0C0", gradient: ["#E91E8C", "#FF6B35"] },
  { id: "lh3", name: "Rahul D.",      city: "Delhi",     viewers: "612",  level: "L3", levelColor: "#cd7f32", gradient: ["#1976D2", "#7B2FBE"] },
  { id: "lh4", name: "Meera P.",      city: "Ahmedabad", viewers: "490",  level: "L4", levelColor: "#C0C0C0", gradient: ["#388E3C", "#00BCD4"] },
  { id: "lh5", name: "Dev Trivedi",   city: "Pune",      viewers: "380",  level: "L2", levelColor: "#cd7f32", gradient: ["#FF6F00", "#E91E8C"] },
  { id: "lh6", name: "Ananya Singh",  city: "Delhi",     viewers: "294",  level: "L3", levelColor: "#cd7f32", gradient: ["#880E4F", "#C2185B"] },
  { id: "lh7", name: "Siddharth J.",  city: "Chennai",   viewers: "218",  level: "L2", levelColor: "#cd7f32", gradient: ["#006064", "#1976D2"] },
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

type FeedItem =
  | { kind: "post"; post: Post }
  | { kind: "ad"; ad: BannerAdConfig; adKey: string };

function mapApiAdToBannerConfig(apiAd: any): BannerAdConfig {
  return {
    id: apiAd.id,
    title: apiAd.headline,
    headline: apiAd.headline,
    body: apiAd.body || "",
    ctaText: apiAd.cta || "Learn More",
    ctaRoute: "/wallet",
    gradient: ["#7B2FBE", "#E91E8C"],
    textColor: "white",
    clientName: "Ridhi Brand",
    clientTier: "Premium",
    position: "feed",
    startDate: apiAd.startsAt || new Date().toISOString(),
    endDate: apiAd.endsAt || new Date().toISOString(),
    active: true,
    impressions: apiAd.impressions || 0,
    clicks: apiAd.clicks || 0,
  };
}

export default function FeedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, deductCoins } = useAuth();
  const { language: appLang } = useApp();
  const { trackLike, trackUnlike, trackComment, trackShare, trackSave } = useAnalytics();
  useTrackScreen("home");
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FeedTab>("For You");
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState<Record<string, Array<{ id: string; name: string; text: string; timeAgo: string }>>>({});
  const [hiddenCommentIds, setHiddenCommentIds] = useState<Record<string, Set<string>>>({});
  const [storyViewId, setStoryViewId] = useState<string | null>(null);

  // ── Feed Ads (API) ────────────────────────────────────────────────────────
  const [feedAds, setFeedAds] = useState<BannerAdConfig[]>([]);
  const [feedAdsLoading, setFeedAdsLoading] = useState(false);
  const loadFeedAds = useCallback(async () => {
    if (!user?.id) return;
    setFeedAdsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("format", "feed");
      params.set("limit", "5");
      params.set("city", user?.city || "All India");
      if (user?.age) params.set("age", String(user.age));
      if (user?.gender) params.set("gender", user.gender);
      const data = await apiFetch<{ ads: any[] }>(`/api/ads/feed?${params.toString()}`);
      if (data?.ads) {
        const mapped = data.ads.map(mapApiAdToBannerConfig);
        setFeedAds(mapped);
      }
    } catch {
      // silently fail — keep empty or previous ads
    } finally {
      setFeedAdsLoading(false);
    }
  }, [user?.id, user?.city, user?.age, user?.gender]);

  useEffect(() => {
    loadFeedAds();
  }, [loadFeedAds]);

  // ── Special Client Ads ────────────────────────────────────────────────────
  const activePopup = POPUP_ADS.find((a) => a.active) ?? null;
  const activeBanners = feedAds.length > 0 ? feedAds : [];
  const [popupDismissed, setPopupDismissed] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  useEffect(() => {
    if (!activePopup) return;
    const t = setTimeout(() => setShowPopup(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // ── Post menu / edit / delete / report state ─────────────────────────────
  const [postMenu, setPostMenu] = useState<{ id: string; isOwn: boolean; content?: string; privacy?: string } | null>(null);
  const [editTarget, setEditTarget] = useState<{ id: string; text: string } | null>(null);
  const [editText, setEditText] = useState("");
  const [privacyTarget, setPrivacyTarget] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<{ id: string; target: "post" | "user" } | null>(null);
  const [reportDone, setReportDone] = useState(false);
  const [boostTarget, setBoostTarget] = useState<string | null>(null);
  const [boostTier, setBoostTier] = useState(1);
  const [boostSuccess, setBoostSuccess] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const storyProgress = useRef(new Animated.Value(0)).current;

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

  const feedData = useMemo((): FeedItem[] => {
    let raw: Post[];
    switch (activeTab) {
      case "Local":     raw = localPosts; break;
      case "Trending":  raw = TRENDING_POSTS; break;
      case "Community": raw = COMMUNITY_POSTS; break;
      case "Following": raw = INITIAL_POSTS.slice(0, 3); break;
      default:          raw = forYouPosts;
    }
    const result: FeedItem[] = [];
    raw.forEach((post, i) => {
      const enriched = { ...post, isOwn: post.isOwn || post.userName === user?.name };
      result.push({ kind: "post", post: enriched });
      if (activeBanners.length > 0 && (i + 1) % 5 === 0) {
        result.push({
          kind: "ad",
          ad: activeBanners[Math.floor(i / 5) % activeBanners.length],
          adKey: `ad-${i}`,
        });
      }
    });
    return result;
  }, [activeTab, localPosts, forYouPosts, activeBanners, user?.name]);

  const nearYouPosts = useMemo(() => localPosts.slice(0, 5), [localPosts]);
  const trendingLocalPosts = useMemo(() =>
    [...localPosts].sort((a, b) => b.likes - a.likes).slice(0, 6),
    [localPosts]
  );
  const localTags = LOCAL_TRENDING_TAGS[userCity] ?? DEFAULT_TAGS;

  const headerAnim    = useRef(new Animated.Value(0)).current;
  const liveIndicator = useRef(new Animated.Value(0.4)).current;
  const recsFadeAnim  = useRef(new Animated.Value(0)).current;
  const recsShown     = useRef(false);

  // ── Page entry: tab bar + feed slide up from below ──────────────────────────
  const feedEntryY       = useRef(new Animated.Value(72)).current;
  const feedEntryOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    // Feed content swipes up from below — staggered after header
    Animated.sequence([
      Animated.delay(120),
      Animated.parallel([
        Animated.spring(feedEntryY, {
          toValue: 0,
          tension: 60,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(feedEntryOpacity, {
          toValue: 1,
          duration: 340,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(liveIndicator, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(liveIndicator, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
    // Fade in recommendations immediately after a short mount delay
    setTimeout(() => {
      if (!recsShown.current) {
        recsShown.current = true;
        Animated.timing(recsFadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      }
    }, 400);
  }, []);

  const postsRef = useRef<Post[]>(posts);
  postsRef.current = posts;
  const emptyFn = useCallback(() => {}, []);

  const handleFeedScroll = useCallback((e: { nativeEvent: { contentOffset: { y: number } } }) => {
    if (!recsShown.current && e.nativeEvent.contentOffset.y > 160) {
      recsShown.current = true;
      Animated.timing(recsFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [recsFadeAnim]);

  const handleLike = useCallback(async (id: string) => {
    const post = postsRef.current.find((p) => p.id === id);
    const isLiked = post?.isLiked ?? false;
    // Track event
    if (isLiked) {
      trackUnlike(id, "post");
    } else {
      trackLike(id, "post");
    }
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
    // API call
    if (user?.id) {
      try {
        await apiFetch(`/api/posts/${id}/like`, { method: "POST" });
      } catch {
        // Revert on failure
        setPosts((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes + 1 : p.likes - 1 }
              : p
          )
        );
      }
    }
  }, [user?.id, trackLike, trackUnlike]);

  const handleOpenComments = useCallback((postId: string) => {
    setCommentPostId(postId);
    setCommentText("");
  }, []);

  const handleLongPressComment = useCallback((postId: string, commentId: string, commentName: string) => {
    Alert.alert(
      "Comment Options",
      `Comment by ${commentName}`,
      [
        {
          text: "Delete Comment",
          style: "destructive",
          onPress: () => {
            setLocalComments((prev) => ({
              ...prev,
              [postId]: (prev[postId] ?? []).filter((c) => c.id !== commentId),
            }));
            setHiddenCommentIds((prev) => {
              const cur = prev[postId] ? new Set(prev[postId]) : new Set<string>();
              cur.add(commentId);
              return { ...prev, [postId]: cur };
            });
          },
        },
        {
          text: "Hide Comment",
          onPress: () => {
            setHiddenCommentIds((prev) => {
              const cur = prev[postId] ? new Set(prev[postId]) : new Set<string>();
              cur.add(commentId);
              return { ...prev, [postId]: cur };
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

  // ── Post menu handlers ────────────────────────────────────────────────────
  const handleMenuPress = useCallback((id: string, isOwn: boolean) => {
    const found = postsRef.current.find((p) => p.id === id);
    setPostMenu({ id, isOwn, content: found?.content, privacy: found?.privacy });
  }, []);

  const handleOpenEdit = () => {
    if (!postMenu) return;
    setEditText(postMenu.content ?? "");
    setEditTarget({ id: postMenu.id, text: postMenu.content ?? "" });
    setPostMenu(null);
  };

  const handleSaveEdit = () => {
    if (!editTarget) return;
    setPosts((prev) => prev.map((p) => p.id === editTarget.id ? { ...p, content: editText } : p));
    setEditTarget(null);
  };

  const handleDelete = () => {
    if (!postMenu) return;
    const id = postMenu.id;
    setPostMenu(null);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleChangePrivacy = (newPrivacy: "public" | "followers" | "private") => {
    if (!privacyTarget) return;
    setPosts((prev) => prev.map((p) => p.id === privacyTarget ? { ...p, privacy: newPrivacy } : p));
    setPrivacyTarget(null);
  };

  const handleOpenReport = (target: "post" | "user") => {
    if (!postMenu) return;
    setReportTarget({ id: postMenu.id, target });
    setPostMenu(null);
  };

  const handleSubmitReport = (reason: string) => {
    setReportTarget(null);
    setReportDone(true);
    setTimeout(() => setReportDone(false), 2500);
  };

  const handleRepost = useCallback((id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isReposted: !p.isReposted, repostCount: (p.repostCount ?? 0) + (p.isReposted ? -1 : 1) }
          : p
      )
    );
    const post = postsRef.current.find((p) => p.id === id);
    const nowReposted = !post?.isReposted;
    if (nowReposted) {
      // Show toast-like alert
      // In real app, this would persist to server and show in followers' Following feed
    }
  }, []);

  const handleNotInterested = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    Alert.alert("Not Interested", "We'll show you fewer posts like this. You can always change this in Settings > Content Preferences.");
  }, []);

  const handleReplyWithVideo = useCallback((postId: string, commentId: string) => {
    router.push({
      pathname: "/create-post",
      params: { type: "reel", replyTo: postId, replyComment: commentId },
    });
  }, []);

  const handleBoost = async () => {
    if (!boostTarget) return;
    const tiers = [
      { label: "Lite", views: 500,  coins: 20,  price: "₹16" },
      { label: "Plus", views: 2000, coins: 50,  price: "₹40" },
      { label: "Max",  views: 5000, coins: 100, price: "₹80" },
    ];
    const selected = tiers[boostTier - 1];
    const ok = await deductCoins(selected.coins);
    if (!ok) {
      setBoostTarget(null);
      return;
    }
    setPosts((prev) =>
      prev.map((p) =>
        p.id === boostTarget
          ? { ...p, isBoosted: true, boostViews: (p.boostViews ?? 0) + selected.views, likes: p.likes + Math.floor(selected.views * 0.08) }
          : p
      )
    );
    setBoostTarget(null);
    setBoostSuccess(true);
    setTimeout(() => setBoostSuccess(false), 3000);
  };

  const handleSendComment = () => {
    if (!commentText.trim() || !commentPostId) return;
    const newComment = {
      id: Date.now().toString(),
      name: user?.name ?? "You",
      text: commentText.trim(),
      timeAgo: "just now",
    };
    setLocalComments((prev) => ({
      ...prev,
      [commentPostId]: [...(prev[commentPostId] ?? []), newComment],
    }));
    setPosts((prev) =>
      prev.map((p) => p.id === commentPostId ? { ...p, comments: p.comments + 1 } : p)
    );
    trackComment(commentPostId, "post");
    setCommentText("");
  };

  const handleOpenStory = (storyId: string) => {
    storyProgress.setValue(0);
    setStoryViewId(storyId);
    Animated.timing(storyProgress, { toValue: 1, duration: 4000, useNativeDriver: false }).start(({ finished }) => {
      if (finished) {
        const idx = STORIES.findIndex((s) => s.id === storyId);
        const next = STORIES[idx + 1];
        if (next) {
          handleOpenStory(next.id);
        } else {
          setStoryViewId(null);
        }
      }
    });
  };

  const handleCloseStory = () => {
    storyProgress.stopAnimation();
    setStoryViewId(null);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeedAds();
    try {
      const trending = activeTab === "Trending";
      const data = await apiFetch<{ posts: any[] }>(`/api/feed?trending=${trending}&limit=20`);
      if (data) {
        const apiPosts = data.posts ?? [];
        const mapped: Post[] = apiPosts.map((p: any) => ({
          id: p.id,
          userId: p.userId,
          userName: p.userName ?? "User",
          userCity: p.userCity ?? p.city ?? "",
          language: p.language ?? "",
          isVerified: false,
          vipTier: "free" as const,
          content: p.content ?? "",
          imageUri: p.images?.[0] ?? undefined,
          likes: p.likesCount ?? 0,
          comments: p.commentsCount ?? 0,
          shares: p.sharesCount ?? 0,
          isLiked: p.isLiked ?? false,
          timeAgo: p.timeAgo ?? "Just now",
        }));
        setPosts(mapped);
      }
    } catch {
      // keep existing posts on error
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, user?.id, loadFeedAds]);

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
            onAddStory={() => router.push({ pathname: "/create-post", params: { type: "story" } } as any)}
            onStory={handleOpenStory}
            selfName={user?.name ?? "Me"}
          />

          {/* ── Ridhi Shop Strip ───────────────────────────────────────── */}
          <View style={[styles.shopStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.shopStripHeader}>
              <View style={styles.shopStripLeft}>
                <LinearGradient
                  colors={["#FF6B35", "#E91E8C"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.shopStripIcon}
                >
                  <Feather name="shopping-bag" size={14} color="#fff" />
                </LinearGradient>
                <Text style={[styles.shopStripTitle, { color: colors.foreground }]}>Ridhi Shop</Text>
                <View style={styles.shopStripBadge}>
                  <Text style={styles.shopStripBadgeText}>NEW</Text>
                </View>
              </View>
              <Pressable onPress={() => router.push("/shop" as any)} style={styles.shopSeeAll}>
                <Text style={[styles.shopSeeAllText, { color: colors.primary }]}>See All</Text>
                <Feather name="chevron-right" size={14} color={colors.primary} />
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.shopProductsRow}
            >
              {PRODUCTS.slice(0, 6).map((product) => (
                <Pressable
                  key={product.id}
                  style={[styles.shopProductCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => router.push({ pathname: "/product-detail", params: { id: product.id } } as any)}
                >
                  <Image
                    source={{ uri: product.image }}
                    style={[styles.shopProductImg, { backgroundColor: colors.muted }]}
                    resizeMode="cover"
                  />
                  <Text style={[styles.shopProductName, { color: colors.foreground }]} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <View style={styles.shopProductBottom}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                      <Text style={[styles.shopProductPrice, { color: colors.primary }]}>
                        {product.price}
                      </Text>
                      <RidhiCoin size={14} />
                    </View>
                    <View style={styles.shopProductRating}>
                      <Feather name="star" size={9} color="#FFD700" />
                      <Text style={[styles.shopProductRatingText, { color: colors.mutedForeground }]}>
                        {product.rating}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
              {/* Browse all CTA card */}
              <Pressable
                style={[styles.shopBrowseCard, { borderColor: colors.primary + "40" }]}
                onPress={() => router.push("/shop" as any)}
              >
                <LinearGradient
                  colors={[colors.primary + "22", colors.secondary + "22"]}
                  style={styles.shopBrowseInner}
                >
                  <Feather name="shopping-cart" size={22} color={colors.primary} />
                  <Text style={[styles.shopBrowseText, { color: colors.primary }]}>Browse{"\n"}All</Text>
                </LinearGradient>
              </Pressable>
            </ScrollView>
          </View>

          <PromoBanner />
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
                <Pressable onPress={() => router.push("/explore" as any)} style={[styles.seeAllBtn, { backgroundColor: colors.muted }]}>
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
    <>
      <SeoHead
        title="Ridhi Feed — Live Streaming, Reels, Stories & Social Posts | India"
        description="Your Ridhi home feed — live streams, viral reels, stories, trending posts, and community updates from creators across India. Join the conversation in 13 languages."
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SwipeUpHint label="Scroll to explore" bottomOffset={130} delay={1400} />
      <LinearGradient
        colors={[colors.primary + "18", colors.secondary + "08", "transparent"]}
        style={[styles.headerGlow, { height: topPad + 120, pointerEvents: "none" }]}
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
            onPress={() => setShowCreateMenu(true)}
            style={[styles.headerBtn, { backgroundColor: colors.primary + "20" }]}
          >
            <Feather name="plus" size={18} color={colors.primary} />
          </Pressable>
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

      <Animated.View style={{ opacity: feedEntryOpacity, transform: [{ translateY: feedEntryY }] }}>
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
        data={feedData}
        keyExtractor={(item) => item.kind === "post" ? item.post.id : item.adKey}
        renderItem={({ item }) => {
          if (item.kind === "ad") {
            return (
              <BannerAd
                ad={item.ad}
                onImpression={async () => {
                  try {
                    await apiFetch(`/api/ads/${item.ad.id}/impression`, { method: "POST" });
                  } catch {
                    // impression tracking non-critical
                  }
                }}
                onClick={async () => {
                  try {
                    await apiFetch(`/api/ads/${item.ad.id}/click`, { method: "POST" });
                  } catch {
                    // click tracking non-critical
                  }
                }}
              />
            );
          }
          return (
            <FeedPost
              post={item.post}
              onLike={handleLike}
              onComment={handleOpenComments}
              onProfile={(userId) => router.push({ pathname: "/user-profile/[userId]", params: { userId: userId || item.post.userId || item.post.id } })}
              onMenuPress={handleMenuPress}
              onRepost={handleRepost}
            />
          );
        }}
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
        removeClippedSubviews={Platform.OS !== "web"}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={5}
        updateCellsBatchingPeriod={50}
      />
      </Animated.View>

      {/* ── Special Client Popup Ad ── */}
      {showPopup && !popupDismissed && activePopup && (
        <PopupAd
          ad={activePopup}
          onDismiss={() => { setPopupDismissed(true); setShowPopup(false); }}
        />
      )}

      {/* ── Comment Sheet ── */}
      <Modal
        visible={commentPostId !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setCommentPostId(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setCommentPostId(null)} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.commentSheet}>
          <View style={[styles.commentSheetInner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.commentHandle, { backgroundColor: colors.border }]} />
            <View style={[styles.commentHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.commentTitle, { color: colors.foreground }]}>Comments</Text>
              <Pressable onPress={() => setCommentPostId(null)} accessibilityRole="button" accessibilityLabel="Close comments">
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <ScrollView style={styles.commentList} contentContainerStyle={{ gap: 16, paddingBottom: 8 }}>
              {[
                { id: "d1", name: "Ananya Singh", text: "This is so beautiful! 😍", timeAgo: "2m" },
                { id: "d2", name: "Rahul Mehta", text: "Totally agree with this! ❤️", timeAgo: "5m" },
                { id: "d3", name: "Kavya Reddy", text: "Wow, amazing post! Keep it up 🔥", timeAgo: "12m" },
                { id: "d4", name: "Arjun Kumar", text: "भाई, क्या बात है! 👏", timeAgo: "18m" },
              ].concat(localComments[commentPostId ?? ""] ?? [])
               .filter((c) => !hiddenCommentIds[commentPostId ?? ""]?.has(c.id))
               .map((c) => (
                <Pressable
                  key={c.id}
                  onLongPress={() => handleLongPressComment(commentPostId ?? "", c.id, c.name)}
                  delayLongPress={400}
                  style={styles.commentItem}
                >
                  <Avatar name={c.name} size={32} />
                  <View style={styles.commentBubble}>
                    <View style={[styles.commentBubbleInner, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.commentName, { color: colors.foreground }]}>{c.name}</Text>
                      <Text style={[styles.commentText, { color: colors.foreground }]}>{c.text}</Text>
                    </View>
                    <View style={styles.commentActions}>
                      <Text style={[styles.commentTime, { color: colors.mutedForeground }]}>{c.timeAgo}</Text>
                      <Pressable onPress={() => handleReplyWithVideo(commentPostId ?? "", c.id)} style={[styles.replyVideoBtn, { backgroundColor: colors.primary + "18" }]}>
                        <Feather name="video" size={11} color={colors.primary} />
                        <Text style={[styles.replyVideoText, { color: colors.primary }]}>Reply with Video</Text>
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
            <View style={[styles.commentInputRow, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
              <Avatar name={user?.name ?? "Me"} size={32} />
              <TextInput
                style={[styles.commentInput, { backgroundColor: colors.input, color: colors.foreground }]}
                placeholder="Add a comment…"
                placeholderTextColor={colors.mutedForeground}
                value={commentText}
                onChangeText={setCommentText}
                returnKeyType="send"
                onSubmitEditing={handleSendComment}
                accessibilityLabel="Comment input"
              />
              <Pressable
                onPress={handleSendComment}
                disabled={!commentText.trim()}
                accessibilityRole="button"
                accessibilityLabel="Send comment"
                style={[styles.sendBtn, { backgroundColor: commentText.trim() ? colors.primary : colors.muted }]}
              >
                <Feather name="send" size={14} color="#fff" />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Story Viewer ── */}
      <Modal
        visible={storyViewId !== null}
        transparent
        animationType="fade"
        onRequestClose={handleCloseStory}
      >
        {storyViewId !== null && (() => {
          const story = STORIES.find((s) => s.id === storyViewId);
          const idx = STORIES.findIndex((s) => s.id === storyViewId);
          if (!story) return null;
          const GRAD_PAIRS: [string, string][] = [
            ["#E91E8C", "#7B2FBE"], ["#FF6B35", "#E91E8C"], ["#7B2FBE", "#4A90E2"],
            ["#00BCD4", "#7B2FBE"], ["#FF6B35", "#FFB800"], ["#E91E8C", "#FF6B35"],
          ];
          const [c1, c2] = GRAD_PAIRS[idx % GRAD_PAIRS.length];
          return (
            <View style={styles.storyViewer}>
              <LinearGradient colors={["#000", "#0A0A18", "#000"]} style={StyleSheet.absoluteFill} />
              <LinearGradient colors={[c1 + "40", "transparent", c2 + "30"]} style={StyleSheet.absoluteFill} />
              <View style={[styles.storyProgressBar, { paddingTop: insets.top + 8 }]}>
                {STORIES.map((s, i) => (
                  <View key={s.id} style={[styles.storyProgressTrack, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
                    {i < idx && <View style={[styles.storyProgressFill, { backgroundColor: "#fff", width: "100%" }]} />}
                    {i === idx && (
                      <Animated.View style={[styles.storyProgressFill, { backgroundColor: "#fff", width: storyProgress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) as any }]} />
                    )}
                  </View>
                ))}
              </View>
              <View style={styles.storyUserRow}>
                <Avatar name={story.userName} size={38} />
                <View>
                  <Text style={styles.storyUserName}>{story.userName}</Text>
                  <Text style={styles.storyTimeAgo}>Just now</Text>
                </View>
                <Pressable onPress={handleCloseStory} style={{ marginLeft: "auto" }} accessibilityRole="button" accessibilityLabel="Close story">
                  <Feather name="x" size={24} color="#fff" />
                </Pressable>
              </View>
              <View style={styles.storyContent}>
                <LinearGradient colors={[c1 + "30", c2 + "20"]} style={styles.storyContentCard}>
                  <Feather name="image" size={48} color="#ffffff60" />
                  <Text style={styles.storyContentText}>{story.userName}'s Story</Text>
                  <Text style={styles.storyContentSub}>Tap right to advance • Tap left to go back</Text>
                </LinearGradient>
              </View>
              <Pressable
                style={styles.storyTapLeft}
                onPress={() => {
                  const prev = STORIES[idx - 1];
                  if (prev) handleOpenStory(prev.id); else handleCloseStory();
                }}
              />
              <Pressable style={styles.storyTapRight} onPress={() => {
                const next = STORIES[idx + 1];
                if (next) handleOpenStory(next.id); else handleCloseStory();
              }} />
            </View>
          );
        })()}
      </Modal>

      {/* ── Post Menu Bottom Sheet ─────────────────────────────────────────── */}
      <Modal visible={postMenu !== null} transparent animationType="slide" onRequestClose={() => setPostMenu(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPostMenu(null)} />
        <View style={[styles.menuSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.commentHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.menuSheetTitle, { color: colors.foreground }]}>
            {postMenu?.isOwn ? "Your Post" : "Post Options"}
          </Text>

          {postMenu?.isOwn ? (
            <>
              <Pressable style={[styles.menuItem, { borderBottomColor: colors.border }]}
                onPress={handleOpenEdit}>
                <View style={[styles.menuItemIcon, { backgroundColor: colors.secondary + "18" }]}>
                  <Feather name="edit-2" size={16} color={colors.secondary} />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={[styles.menuItemLabel, { color: colors.foreground }]}>Edit Post</Text>
                  <Text style={[styles.menuItemDesc, { color: colors.mutedForeground }]}>Change the text of your post</Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </Pressable>

              <Pressable style={[styles.menuItem, { borderBottomColor: colors.border }]}
                onPress={() => { const id = postMenu.id; setPostMenu(null); setPrivacyTarget(id); }}>
                <View style={[styles.menuItemIcon, { backgroundColor: colors.primary + "18" }]}>
                  <Feather name={postMenu?.privacy === "private" ? "lock" : postMenu?.privacy === "followers" ? "users" : "globe"} size={16} color={colors.primary} />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={[styles.menuItemLabel, { color: colors.foreground }]}>Audience</Text>
                  <Text style={[styles.menuItemDesc, { color: colors.mutedForeground }]}>
                    Currently: {postMenu?.privacy === "private" ? "Only me" : postMenu?.privacy === "followers" ? "Followers" : "Public"}
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </Pressable>

              <Pressable style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={handleDelete}>
                <View style={[styles.menuItemIcon, { backgroundColor: "#FF3B3020" }]}>
                  <Feather name="trash-2" size={16} color="#FF3B30" />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={[styles.menuItemLabel, { color: "#FF3B30" }]}>Delete Post</Text>
                  <Text style={[styles.menuItemDesc, { color: colors.mutedForeground }]}>Permanently remove this post</Text>
                </View>
              </Pressable>

              <Pressable style={[styles.menuItem, { borderBottomColor: colors.border }]}
                onPress={() => { const id = postMenu.id; setPostMenu(null); setBoostTarget(id); setBoostTier(1); }}>
                <View style={[styles.menuItemIcon, { backgroundColor: colors.primary + "18" }]}>
                  <Feather name="trending-up" size={16} color={colors.primary} />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={[styles.menuItemLabel, { color: colors.foreground }]}>Boost Post</Text>
                  <Text style={[styles.menuItemDesc, { color: colors.mutedForeground }]}>Get more views, likes & followers</Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </Pressable>
            </>
          ) : (
            <>
              <Pressable style={[styles.menuItem, { borderBottomColor: colors.border }]}
                onPress={() => { if (postMenu) { handleRepost(postMenu.id); setPostMenu(null); } }}>
                <View style={[styles.menuItemIcon, { backgroundColor: colors.primary + "18" }]}>
                  <Feather name="repeat" size={16} color={colors.primary} />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={[styles.menuItemLabel, { color: colors.foreground }]}>Repost to Followers</Text>
                  <Text style={[styles.menuItemDesc, { color: colors.mutedForeground }]}>Share this post on your followers' feed</Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </Pressable>

              {(["post", "user"] as const).map((target) => {
                const cfg = {
                  post: { icon: "flag" as const,   label: "Report Post", desc: "Content is inappropriate or harmful", color: "#FF9500" },
                  user: { icon: "user-x" as const, label: "Report User", desc: "Fake account, harassment or spam",    color: "#FF3B30" },
                };
                const { icon, label, desc, color } = cfg[target];
                return (
                  <Pressable key={target} style={[styles.menuItem, { borderBottomColor: colors.border }]}
                    onPress={() => handleOpenReport(target)}>
                    <View style={[styles.menuItemIcon, { backgroundColor: color + "18" }]}>
                      <Feather name={icon} size={16} color={color} />
                    </View>
                    <View style={styles.menuItemText}>
                      <Text style={[styles.menuItemLabel, { color: colors.foreground }]}>{label}</Text>
                      <Text style={[styles.menuItemDesc, { color: colors.mutedForeground }]}>{desc}</Text>
                    </View>
                    <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                  </Pressable>
                );
              })}
              <Pressable style={[styles.menuItem, { borderBottomColor: colors.border }]}
                onPress={() => setPostMenu(null)}>
                <View style={[styles.menuItemIcon, { backgroundColor: colors.muted }]}>
                  <Feather name="slash" size={16} color={colors.mutedForeground} />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={[styles.menuItemLabel, { color: colors.foreground }]}>Block User</Text>
                  <Text style={[styles.menuItemDesc, { color: colors.mutedForeground }]}>Stop seeing posts from this person</Text>
                </View>
              </Pressable>

              <Pressable style={[styles.menuItem, { borderBottomColor: colors.border }]}
                onPress={() => { if (postMenu) { handleNotInterested(postMenu.id); setPostMenu(null); } }}>
                <View style={[styles.menuItemIcon, { backgroundColor: "#FF9500" + "18" }]}>
                  <Feather name="eye-off" size={16} color="#FF9500" />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={[styles.menuItemLabel, { color: colors.foreground }]}>Not Interested</Text>
                  <Text style={[styles.menuItemDesc, { color: colors.mutedForeground }]}>Show fewer posts like this</Text>
                </View>
              </Pressable>
            </>
          )}

          <Pressable style={[styles.menuCancel, { backgroundColor: colors.muted }]} onPress={() => setPostMenu(null)}>
            <Text style={[styles.menuCancelText, { color: colors.foreground }]}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>

      {/* ── Edit Post Modal ────────────────────────────────────────────────── */}
      <Modal visible={editTarget !== null} transparent animationType="slide" onRequestClose={() => setEditTarget(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setEditTarget(null)} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.commentSheet}>
          <View style={[styles.commentSheetInner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.commentHandle, { backgroundColor: colors.border }]} />
            <View style={[styles.commentHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.commentTitle, { color: colors.foreground }]}>Edit Post</Text>
              <Pressable onPress={() => setEditTarget(null)}>
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <View style={{ padding: 16, gap: 12 }}>
              <TextInput
                style={[styles.editInput, { backgroundColor: colors.input, color: colors.foreground, borderColor: colors.border }]}
                value={editText}
                onChangeText={setEditText}
                multiline
                autoFocus
                maxLength={500}
                placeholder="What's on your mind?"
                placeholderTextColor={colors.mutedForeground}
              />
              <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{editText.length}/500</Text>
              <Pressable
                onPress={handleSaveEdit}
                disabled={!editText.trim()}
                style={[styles.saveEditBtn, { backgroundColor: editText.trim() ? colors.primary : colors.muted }]}
              >
                <Feather name="check" size={16} color="#fff" />
                <Text style={styles.saveEditBtnText}>Save Changes</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Privacy Picker Modal ───────────────────────────────────────────── */}
      <Modal visible={privacyTarget !== null} transparent animationType="slide" onRequestClose={() => setPrivacyTarget(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPrivacyTarget(null)} />
        <View style={[styles.menuSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.commentHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.menuSheetTitle, { color: colors.foreground }]}>Who can see this post?</Text>
          {([
            { value: "public",    icon: "globe",  label: "Public",      desc: "Anyone on Ridhi can see this" },
            { value: "followers", icon: "users",  label: "Followers",   desc: "Only your followers can see this" },
            { value: "private",   icon: "lock",   label: "Only me",     desc: "Only you can see this" },
          ] as const).map((opt) => {
            const current = posts.find(p => p.id === privacyTarget)?.privacy ?? "public";
            const isActive = current === opt.value;
            return (
              <Pressable key={opt.value} style={[styles.menuItem, { borderBottomColor: colors.border }]}
                onPress={() => handleChangePrivacy(opt.value)}>
                <View style={[styles.menuItemIcon, { backgroundColor: isActive ? colors.primary + "18" : colors.muted }]}>
                  <Feather name={opt.icon} size={16} color={isActive ? colors.primary : colors.mutedForeground} />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={[styles.menuItemLabel, { color: isActive ? colors.primary : colors.foreground }]}>{opt.label}</Text>
                  <Text style={[styles.menuItemDesc, { color: colors.mutedForeground }]}>{opt.desc}</Text>
                </View>
                {isActive && <Feather name="check-circle" size={16} color={colors.primary} />}
              </Pressable>
            );
          })}
          <Pressable style={[styles.menuCancel, { backgroundColor: colors.muted }]} onPress={() => setPrivacyTarget(null)}>
            <Text style={[styles.menuCancelText, { color: colors.foreground }]}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>

      {/* ── Report Modal ───────────────────────────────────────────────────── */}
      <Modal visible={reportTarget !== null} transparent animationType="slide" onRequestClose={() => setReportTarget(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setReportTarget(null)} />
        <View style={[styles.menuSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.commentHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.menuSheetTitle, { color: colors.foreground }]}>
            Report {reportTarget?.target === "post" ? "Post" : reportTarget?.target === "user" ? "User" : "Host"}
          </Text>
          <Text style={[styles.menuSheetSub, { color: colors.mutedForeground }]}>
            Select a reason — your report is confidential
          </Text>
          {[
            "Spam or misleading",
            "Inappropriate content",
            "Harassment or bullying",
            "Fake account",
            "Violence or dangerous acts",
            "Hate speech",
            "Other",
          ].map((reason) => (
            <Pressable key={reason} style={[styles.reportReasonBtn, { borderColor: colors.border }]}
              onPress={() => handleSubmitReport(reason)}>
              <Text style={[styles.reportReasonText, { color: colors.foreground }]}>{reason}</Text>
              <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
            </Pressable>
          ))}
          <Pressable style={[styles.menuCancel, { backgroundColor: colors.muted }]} onPress={() => setReportTarget(null)}>
            <Text style={[styles.menuCancelText, { color: colors.foreground }]}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>

      {/* ── Report Success Toast ───────────────────────────────────────────── */}
      {reportDone && (
        <View style={[styles.toast, { backgroundColor: "#1C1C2E", pointerEvents: "none" }]}>
          <Feather name="check-circle" size={16} color="#34C759" />
          <Text style={styles.toastText}>Report submitted. Thank you! 🙏</Text>
        </View>
      )}

      {/* ── Boost Post Sheet ───────────────────────────────────────────────── */}
      <Modal visible={boostTarget !== null} transparent animationType="slide" onRequestClose={() => setBoostTarget(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setBoostTarget(null)} />
        <View style={[styles.menuSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.commentHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.menuSheetTitle, { color: colors.foreground }]}>Boost Your Post</Text>
          <Text style={[styles.menuSheetSub, { color: colors.mutedForeground }]}>
            Get more views, likes & followers
          </Text>

          <View style={{ paddingHorizontal: 16, gap: 8, paddingBottom: 12 }}>
            {[
              { label: "Lite", views: 500,  coins: 20,  price: "₹16", desc: "~500 views" },
              { label: "Plus", views: 2000, coins: 50,  price: "₹40", desc: "~2,000 views" },
              { label: "Max",  views: 5000, coins: 100, price: "₹80", desc: "~5,000 views" },
            ].map((t, i) => {
              const isActive = boostTier === i + 1;
              return (
                <Pressable key={t.label} onPress={() => setBoostTier(i + 1)}
                  style={[styles.boostTierCard, {
                    borderColor: isActive ? colors.primary : colors.border,
                    backgroundColor: isActive ? colors.primary + "10" : colors.card,
                  }]}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                    <View style={[styles.boostTierIcon, { backgroundColor: isActive ? colors.primary : colors.muted }]}>
                      <Feather name="trending-up" size={16} color={isActive ? "#fff" : colors.mutedForeground} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.boostTierLabel, { color: colors.foreground }]}>{t.label} Boost</Text>
                      <Text style={[styles.boostTierDesc, { color: colors.mutedForeground }]}>{t.desc} · {t.price}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <CoinBadge amount={t.coins} size="sm" />
                    {isActive && <Feather name="check-circle" size={18} color={colors.primary} />}
                  </View>
                </Pressable>
              );
            })}

            <View style={[styles.boostBalanceRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.boostBalanceLabel, { color: colors.mutedForeground }]}>Your Balance</Text>
              <CoinBadge amount={user?.coins ?? 0} size="md" />
            </View>

            <Pressable
              onPress={handleBoost}
              style={[styles.boostPayBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="trending-up" size={16} color="#fff" />
              <Text style={styles.boostPayBtnText}>Boost Now</Text>
            </Pressable>

            <Pressable style={[styles.menuCancel, { backgroundColor: colors.muted }]} onPress={() => setBoostTarget(null)}>
              <Text style={[styles.menuCancelText, { color: colors.foreground }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* ── Create Content Menu (Instagram-style) ─────────────────────────── */}
      <Modal
        visible={showCreateMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateMenu(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowCreateMenu(false)} />
        <View style={[styles.createMenuSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.commentHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.createMenuTitle, { color: colors.foreground }]}>Create</Text>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 4, paddingBottom: insets.bottom + 20 }}>
            {[
              { id: "reel", icon: "film", label: "Reel", desc: "Share a short video", color: "#E91E8C" },
              { id: "story", icon: "circle", label: "Story", desc: "Photo/video that disappears in 24h", color: "#7B2FBE" },
              { id: "photo", icon: "image", label: "Post", desc: "Share a photo on your feed", color: "#4A90E2" },
              { id: "carousel", icon: "copy", label: "Carousel", desc: "Share multiple photos", color: "#34C759" },
              { id: "video", icon: "video", label: "Video", desc: "Long video up to 5 minutes", color: "#FF3B30" },
              { id: "text", icon: "type", label: "Status", desc: "Share a text-only update", color: "#FF9500" },
              { id: "audio", icon: "mic", label: "Audio", desc: "Voice note or podcast clip", color: "#8E8E93" },
              { id: "live-stream", icon: "radio", label: "Go Live", desc: "Start a live broadcast", color: "#FF3B30" },
              { id: "poll", icon: "bar-chart-2", label: "Poll", desc: "Ask followers a question", color: "#5856D6" },
            ].map((item) => (
              <Pressable
                key={item.id}
                style={styles.createMenuItem}
                onPress={() => {
                  setShowCreateMenu(false);
                  if (item.id === "live-stream") {
                    router.push("/live-stream");
                  } else {
                    router.push({ pathname: "/create-post", params: { type: item.id } });
                  }
                }}
              >
                <View style={[styles.createMenuIcon, { backgroundColor: item.color + "18" }]}>
                  <Feather name={item.icon as any} size={22} color={item.color} />
                </View>
                <View style={styles.createMenuText}>
                  <Text style={[styles.createMenuLabel, { color: colors.foreground }]}>{item.label}</Text>
                  <Text style={[styles.createMenuDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* ── Boost Success Toast ────────────────────────────────────────────── */}
      {boostSuccess && (
        <View style={[styles.toast, { backgroundColor: "#1C1C2E", pointerEvents: "none" }]}>
          <Feather name="trending-up" size={16} color="#34C759" />
          <Text style={styles.toastText}>Post boosted! More views incoming ↗️</Text>
        </View>
      )}
    </View>
    </>
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

  // ── Shop Strip ────────────────────────────────────────────────────────────
  shopStrip: { marginHorizontal: 12, marginTop: 10, marginBottom: 4, borderRadius: 16, borderWidth: 1, paddingTop: 12, paddingBottom: 10 },
  shopStripHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, marginBottom: 10 },
  shopStripLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  shopStripIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  shopStripTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  shopStripBadge: { backgroundColor: "#FF6B35", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  shopStripBadgeText: { color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  shopSeeAll: { flexDirection: "row", alignItems: "center", gap: 2 },
  shopSeeAllText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  shopProductsRow: { paddingHorizontal: 12, gap: 10, paddingRight: 16 },
  shopProductCard: { width: 120, borderRadius: 12, borderWidth: 1, overflow: "hidden", paddingBottom: 10 },
  shopProductImg: { width: 120, height: 110, borderRadius: 10 },
  shopProductName: { fontSize: 12, fontFamily: "Inter_500Medium", paddingHorizontal: 8, paddingTop: 6, lineHeight: 16 },
  shopProductBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8, paddingTop: 4 },
  shopProductPrice: { fontSize: 12, fontFamily: "Inter_700Bold" },
  shopProductRating: { flexDirection: "row", alignItems: "center", gap: 2 },
  shopProductRatingText: { fontSize: 10, fontFamily: "Inter_400Regular" },
  shopBrowseCard: { width: 80, borderRadius: 12, borderWidth: 1.5, overflow: "hidden" },
  shopBrowseInner: { flex: 1, alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 14 },
  shopBrowseText: { fontSize: 12, fontFamily: "Inter_700Bold", textAlign: "center", lineHeight: 16 },

  // Near You section
  // ── Live Hosts section ───────────────────────────────────────────────────
  liveSection: { paddingTop: 4, paddingBottom: 4 },
  liveSectionHeader: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingBottom: 10 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveDotSmall: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#FF3B30" },
  liveSectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", flex: 1 },
  liveCount: { fontSize: 12, fontFamily: "Inter_400Regular" },
  liveScroll: { paddingHorizontal: 12, gap: 10, paddingRight: 16 },
  liveCard: { width: 110, height: 156, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden", justifyContent: "space-between", padding: 8 },
  liveViewerBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(0,0,0,0.45)", alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 },
  liveViewerText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff" },
  liveLevelBadge: { alignSelf: "flex-end", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  liveLevelText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff" },
  liveCardBottom: { gap: 1 },
  liveHostName: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },
  liveHostCity: { fontSize: 10, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },

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

  // Comment Sheet
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  commentSheet: { justifyContent: "flex-end" },
  commentSheetInner: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    maxHeight: 520,
  },
  commentHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 10, marginBottom: 4 },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  commentTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  commentList: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  commentItem: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  commentBubble: { flex: 1, gap: 3 },
  commentBubbleInner: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, gap: 2 },
  commentName: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  commentText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  commentTime: { fontSize: 11, fontFamily: "Inter_400Regular", marginLeft: 4 },
  commentActions: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
  replyVideoBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  replyVideoText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  commentInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },

  // Story Viewer
  storyViewer: { flex: 1, backgroundColor: "#000" },
  storyProgressBar: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 12,
    paddingBottom: 10,
    zIndex: 10,
  },
  storyProgressTrack: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    overflow: "hidden",
  },
  storyProgressFill: { height: "100%", borderRadius: 1 },
  storyUserRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 10,
  },
  storyUserName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  storyTimeAgo: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },
  storyContent: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  storyContentCard: {
    width: "100%",
    aspectRatio: 0.75,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    maxHeight: 420,
  },
  storyContentText: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", textAlign: "center" },
  storyContentSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.55)", textAlign: "center" },
  storyTapLeft: { position: "absolute", left: 0, top: 0, bottom: 0, width: "40%" },
  storyTapRight: { position: "absolute", right: 0, top: 0, bottom: 0, width: "60%" },

  // ── Post Menu Sheet ──────────────────────────────────────────────────────
  menuSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingBottom: 32,
    overflow: "hidden",
  },
  menuSheetTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  menuSheetSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 14,
  },
  menuItemIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemText: { flex: 1 },
  menuItemLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  menuItemDesc:  { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  menuCancel: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  menuCancelText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },

  // ── Edit Post ────────────────────────────────────────────────────────────
  editInput: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    minHeight: 120,
    textAlignVertical: "top",
  },
  charCount: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "right" },
  saveEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
  },
  saveEditBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },

  // ── Report reasons ───────────────────────────────────────────────────────
  reportReasonBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  reportReasonText: { fontSize: 14, fontFamily: "Inter_400Regular" },

  // ── Toast ────────────────────────────────────────────────────────────────
  toast: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  toastText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },

  // ── Boost Post ───────────────────────────────────────────────────
  boostTierCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
  },
  boostTierIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  boostTierLabel: { fontSize: 15, fontFamily: "Inter_700Bold" },
  boostTierDesc:  { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  boostBalanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    marginTop: 4,
  },
  boostBalanceLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  boostPayBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  boostPayBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },

  // ── Create Menu Sheet (Instagram-style) ────────────────────────────
  createMenuSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    maxHeight: "70%",
  },
  createMenuTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginBottom: 12,
  },
  createMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  createMenuIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  createMenuText: { flex: 1 },
  createMenuLabel: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  createMenuDesc: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
});
