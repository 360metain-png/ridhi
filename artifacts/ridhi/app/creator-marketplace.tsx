import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Avatar } from "@/components/Avatar";
import { CoinBadge } from "@/components/CoinBadge";

const { width } = Dimensions.get("window");

// ── Categories ─────────────────────────────────────────────────────────────
type Category = "All" | "Reels" | "Lifestyle" | "Fashion" | "Tech" | "Food" | "Travel" | "Beauty" | "Gaming";
const CATEGORIES: Category[] = ["All", "Reels", "Lifestyle", "Fashion", "Tech", "Food", "Travel", "Beauty", "Gaming"];

// ── Brand deals ────────────────────────────────────────────────────────────
const DEALS = [
  {
    id: "d1",
    brand: "boAt Lifestyle",
    logo: "🎧",
    logoColor: "#E91E8C",
    category: "Tech",
    type: "UGC Video",
    budget: "₹8,000 – ₹25,000",
    budgetMin: 8000,
    deadline: "3 days left",
    desc: "Create a 30–60s Reel unboxing or reviewing our latest earbuds. Authentic, fun energy only.",
    tags: ["earbuds", "unboxing", "lifestyle"],
    minFollowers: "5K",
    platforms: ["Instagram", "Ridhi"],
    slots: 12,
    slotsLeft: 4,
    hot: true,
    featured: true,
  },
  {
    id: "d2",
    brand: "Nykaa",
    logo: "💄",
    logoColor: "#FF6B9D",
    category: "Beauty",
    type: "Sponsored Reel",
    budget: "₹5,000 – ₹18,000",
    budgetMin: 5000,
    deadline: "5 days left",
    desc: "GRWM content featuring our new lipstick range. Show your real morning routine.",
    tags: ["beauty", "GRWM", "makeup"],
    minFollowers: "3K",
    platforms: ["Ridhi", "Instagram"],
    slots: 20,
    slotsLeft: 9,
    hot: false,
    featured: true,
  },
  {
    id: "d3",
    brand: "Zomato",
    logo: "🍕",
    logoColor: "#E23744",
    category: "Food",
    type: "Story + Reel",
    budget: "₹3,000 – ₹12,000",
    budgetMin: 3000,
    deadline: "7 days left",
    desc: "Share your honest Zomato order experience. Must include food reaction + rating reveal.",
    tags: ["food", "delivery", "review"],
    minFollowers: "2K",
    platforms: ["Ridhi"],
    slots: 30,
    slotsLeft: 18,
    hot: false,
    featured: false,
  },
  {
    id: "d4",
    brand: "Mamaearth",
    logo: "🌿",
    logoColor: "#4CAF50",
    category: "Lifestyle",
    type: "UGC Photo + Video",
    budget: "₹6,000 – ₹20,000",
    budgetMin: 6000,
    deadline: "2 days left",
    desc: "Skincare routine reel using our Vitamin C serum. Show real skin, real results.",
    tags: ["skincare", "routine", "clean beauty"],
    minFollowers: "5K",
    platforms: ["Ridhi", "YouTube Shorts"],
    slots: 15,
    slotsLeft: 3,
    hot: true,
    featured: false,
  },
  {
    id: "d5",
    brand: "Bewakoof",
    logo: "👕",
    logoColor: "#7B2FBE",
    category: "Fashion",
    type: "Outfit Reel",
    budget: "₹4,000 – ₹15,000",
    budgetMin: 4000,
    deadline: "6 days left",
    desc: "Style 3 outfits from our new drop. Show your vibe, be yourself. No overly polished content.",
    tags: ["fashion", "ootd", "streetwear"],
    minFollowers: "3K",
    platforms: ["Ridhi", "Instagram"],
    slots: 25,
    slotsLeft: 11,
    hot: false,
    featured: false,
  },
  {
    id: "d6",
    brand: "MakeMyTrip",
    logo: "✈️",
    logoColor: "#0066CC",
    category: "Travel",
    type: "Travel Vlog",
    budget: "₹10,000 – ₹40,000",
    budgetMin: 10000,
    deadline: "10 days left",
    desc: "Plan and share a weekend trip booked via our app. Focus on the ease of booking + experience.",
    tags: ["travel", "vlog", "weekend"],
    minFollowers: "10K",
    platforms: ["YouTube Shorts", "Ridhi"],
    slots: 8,
    slotsLeft: 5,
    hot: true,
    featured: true,
  },
  {
    id: "d7",
    brand: "Campus Sutra",
    logo: "🎓",
    logoColor: "#FF6B35",
    category: "Fashion",
    type: "UGC Photo",
    budget: "₹2,500 – ₹8,000",
    budgetMin: 2500,
    deadline: "8 days left",
    desc: "Campus OOTD featuring our hoodies or printed tees. College vibes, real people.",
    tags: ["campus", "ootd", "college"],
    minFollowers: "1K",
    platforms: ["Ridhi"],
    slots: 40,
    slotsLeft: 22,
    hot: false,
    featured: false,
  },
  {
    id: "d8",
    brand: "Ludo King",
    logo: "🎲",
    logoColor: "#FFB800",
    category: "Gaming",
    type: "Gameplay Reel",
    budget: "₹3,500 – ₹10,000",
    budgetMin: 3500,
    deadline: "4 days left",
    desc: "React reel to a dramatic Ludo moment. Must be genuine — biggest drama wins extra bonus.",
    tags: ["gaming", "ludo", "reaction"],
    minFollowers: "2K",
    platforms: ["Ridhi", "Instagram"],
    slots: 20,
    slotsLeft: 7,
    hot: true,
    featured: false,
  },
];

// ── Top creators ───────────────────────────────────────────────────────────
const TOP_CREATORS = [
  { id: "c1", name: "Priya Sharma",  niche: "Beauty & Lifestyle", deals: 14, earned: "₹2.4L", followers: "48K" },
  { id: "c2", name: "Arjun Kapoor",  niche: "Tech & Gadgets",     deals: 9,  earned: "₹1.8L", followers: "32K" },
  { id: "c3", name: "Kavya Reddy",   niche: "Fashion & OOTD",     deals: 22, earned: "₹3.1L", followers: "91K" },
  { id: "c4", name: "Dev Trivedi",   niche: "Food & Travel",      deals: 7,  earned: "₹96K",  followers: "21K" },
];

// ── My active pitches ──────────────────────────────────────────────────────
const MY_PITCHES = [
  { id: "p1", brand: "boAt Lifestyle", logo: "🎧", status: "Under Review",  statusColor: "#FFB800", submittedDays: 1 },
  { id: "p2", brand: "Mamaearth",      logo: "🌿", status: "Shortlisted",   statusColor: "#22C55E", submittedDays: 3 },
];

type TabType = "discover" | "my-pitches" | "leaderboard";

export default function CreatorMarketplaceScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const topPad  = Platform.OS === "web" ? 67 : insets.top;

  const [tab,      setTab]      = useState<TabType>("discover");
  const [category, setCategory] = useState<Category>("All");
  const [pitched,  setPitched]  = useState<Record<string, boolean>>({});

  const filtered = DEALS.filter((d) => category === "All" || d.category === category);
  const featured = filtered.filter((d) => d.featured);
  const rest     = filtered.filter((d) => !d.featured);

  const TABS: { key: TabType; label: string }[] = [
    { key: "discover",    label: "Discover" },
    { key: "my-pitches",  label: "My Pitches" },
    { key: "leaderboard", label: "Top Creators" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <LinearGradient
        colors={["#0A0020", "#1C0040", colors.background]}
        style={[styles.header, { paddingTop: topPad + 8 }]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.headerTitle}>Creator Marketplace</Text>
            <Text style={styles.headerSub}>Get paid by top Indian brands 🎯</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          {[
            { label: "Active Deals", value: `${DEALS.length}` },
            { label: "Brands",       value: "200+" },
            { label: "Avg Payout",   value: "₹12K" },
          ].map((s, i) => (
            <View
              key={s.label}
              style={[styles.statBox, i < 2 && { borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.12)" }]}
            >
              <Text style={styles.statVal}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <View style={[styles.tabRow, { borderBottomColor: "rgba(255,255,255,0.12)" }]}>
          {TABS.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            >
              <Text style={[styles.tabLabel, { color: tab === t.key ? "#fff" : "rgba(255,255,255,0.45)" }]}>
                {t.label}
              </Text>
              {tab === t.key && <View style={styles.tabUnderline} />}
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: (Platform.OS === "web" ? 84 : insets.bottom) + 32 }}>

        {/* ── DISCOVER TAB ──────────────────────────────────────────────── */}
        {tab === "discover" && (
          <View>
            {/* Category filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[
                    styles.catBtn,
                    { borderColor: category === c ? "#E91E8C" : colors.border },
                    category === c && { backgroundColor: "#E91E8C18" },
                  ]}
                >
                  <Text style={[styles.catBtnText, { color: category === c ? "#E91E8C" : colors.mutedForeground }]}>{c}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Featured deals — horizontal scroll */}
            {featured.length > 0 && (
              <View style={{ marginTop: 4 }}>
                <View style={styles.sectionRow}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Featured</Text>
                  <View style={[styles.hotBadge, { backgroundColor: "#E91E8C20" }]}>
                    <Text style={[styles.hotBadgeText, { color: "#E91E8C" }]}>HIGH PAY</Text>
                  </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
                  {featured.map((deal) => (
                    <Pressable
                      key={deal.id}
                      style={[styles.featuredCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                      <LinearGradient
                        colors={[deal.logoColor + "22", deal.logoColor + "08"]}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      />
                      {/* Brand + Hot */}
                      <View style={styles.featuredTop}>
                        <View style={[styles.logoCircle, { backgroundColor: deal.logoColor + "25" }]}>
                          <Text style={styles.logoEmoji}>{deal.logo}</Text>
                        </View>
                        {deal.hot && (
                          <View style={styles.hotTag}>
                            <Text style={styles.hotTagText}>🔥 Hot</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.featuredBrand, { color: colors.foreground }]}>{deal.brand}</Text>
                      <Text style={[styles.featuredType, { color: colors.mutedForeground }]}>{deal.type}</Text>
                      <Text style={[styles.featuredBudget, { color: deal.logoColor }]}>{deal.budget}</Text>
                      <View style={styles.featuredMeta}>
                        <Feather name="clock" size={11} color={colors.mutedForeground} />
                        <Text style={[styles.featuredMetaText, { color: colors.mutedForeground }]}>{deal.deadline}</Text>
                        <Text style={[styles.featuredMetaDot, { color: colors.mutedForeground }]}>·</Text>
                        <Text style={[styles.featuredMetaText, { color: colors.mutedForeground }]}>{deal.slotsLeft} slots left</Text>
                      </View>
                      <Pressable
                        onPress={() => setPitched((p) => ({ ...p, [deal.id]: true }))}
                        style={[styles.pitchBtn, { backgroundColor: pitched[deal.id] ? colors.muted : deal.logoColor }]}
                      >
                        <Text style={[styles.pitchBtnText, { color: pitched[deal.id] ? colors.mutedForeground : "#fff" }]}>
                          {pitched[deal.id] ? "Pitched ✓" : "Pitch Now"}
                        </Text>
                      </Pressable>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* All deals list */}
            <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 12 }]}>
                {category === "All" ? "All Deals" : category} · {filtered.length} available
              </Text>
              {filtered.map((deal) => (
                <View
                  key={deal.id}
                  style={[styles.dealCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  {/* Left accent */}
                  <View style={[styles.dealAccent, { backgroundColor: deal.logoColor }]} />

                  <View style={styles.dealInner}>
                    {/* Top row */}
                    <View style={styles.dealTopRow}>
                      <View style={[styles.dealLogo, { backgroundColor: deal.logoColor + "22" }]}>
                        <Text style={{ fontSize: 22 }}>{deal.logo}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.dealBrandRow}>
                          <Text style={[styles.dealBrand, { color: colors.foreground }]}>{deal.brand}</Text>
                          {deal.hot && <Text style={styles.dealHotEmoji}>🔥</Text>}
                        </View>
                        <Text style={[styles.dealType, { color: colors.mutedForeground }]}>{deal.type} · {deal.category}</Text>
                      </View>
                      <Text style={[styles.dealBudget, { color: deal.logoColor }]}>{deal.budget.split(" – ")[0]}+</Text>
                    </View>

                    {/* Description */}
                    <Text style={[styles.dealDesc, { color: colors.foreground }]} numberOfLines={2}>{deal.desc}</Text>

                    {/* Tags */}
                    <View style={styles.tagRow}>
                      {deal.tags.map((t) => (
                        <View key={t} style={[styles.tag, { backgroundColor: deal.logoColor + "15", borderColor: deal.logoColor + "30" }]}>
                          <Text style={[styles.tagText, { color: deal.logoColor }]}>#{t}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Bottom meta */}
                    <View style={styles.dealBottom}>
                      <View style={styles.dealMetaGroup}>
                        <View style={styles.dealMetaItem}>
                          <Feather name="users" size={11} color={colors.mutedForeground} />
                          <Text style={[styles.dealMetaText, { color: colors.mutedForeground }]}>{deal.minFollowers}+ followers</Text>
                        </View>
                        <View style={styles.dealMetaItem}>
                          <Feather name="clock" size={11} color={colors.mutedForeground} />
                          <Text style={[styles.dealMetaText, { color: colors.mutedForeground }]}>{deal.deadline}</Text>
                        </View>
                        {/* Slots bar */}
                        <View style={styles.dealMetaItem}>
                          <Feather name="zap" size={11} color={deal.slotsLeft <= 5 ? "#FF5252" : colors.mutedForeground} />
                          <Text style={[styles.dealMetaText, { color: deal.slotsLeft <= 5 ? "#FF5252" : colors.mutedForeground }]}>
                            {deal.slotsLeft}/{deal.slots} slots
                          </Text>
                        </View>
                      </View>
                      <Pressable
                        onPress={() => setPitched((p) => ({ ...p, [deal.id]: true }))}
                        style={[
                          styles.dealPitchBtn,
                          { backgroundColor: pitched[deal.id] ? colors.muted : deal.logoColor + "20", borderColor: pitched[deal.id] ? colors.border : deal.logoColor },
                        ]}
                      >
                        <Text style={[styles.dealPitchText, { color: pitched[deal.id] ? colors.mutedForeground : deal.logoColor }]}>
                          {pitched[deal.id] ? "Pitched ✓" : "Pitch"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Become a brand CTA */}
            <Pressable style={[styles.brandCta, { borderColor: "#7B2FBE40", backgroundColor: "#7B2FBE0D", marginHorizontal: 16, marginTop: 20 }]}>
              <LinearGradient colors={["#7B2FBE", "#E91E8C"]} style={styles.brandCtaIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Feather name="briefcase" size={18} color="#fff" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={[styles.brandCtaTitle, { color: colors.foreground }]}>Are you a Brand?</Text>
                <Text style={[styles.brandCtaSub, { color: colors.mutedForeground }]}>List a deal and reach 500K+ Gen Z creators on Ridhi</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </Pressable>
          </View>
        )}

        {/* ── MY PITCHES TAB ────────────────────────────────────────────── */}
        {tab === "my-pitches" && (
          <View style={{ padding: 16, paddingTop: 20 }}>
            {/* Earnings summary */}
            <LinearGradient
              colors={["#7B2FBE", "#E91E8C"]}
              style={styles.earningCard}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <Text style={styles.earningLabel}>Total Earned</Text>
              <Text style={styles.earningAmount}>₹0</Text>
              <Text style={styles.earningNote}>Complete your first deal to start earning 💰</Text>
            </LinearGradient>

            {/* Active pitches */}
            <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 20, marginBottom: 12 }]}>Active Pitches</Text>

            {MY_PITCHES.map((p) => (
              <View key={p.id} style={[styles.pitchCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.pitchCardLogo, { backgroundColor: colors.muted }]}>
                  <Text style={{ fontSize: 24 }}>{p.logo}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.pitchCardBrand, { color: colors.foreground }]}>{p.brand}</Text>
                  <Text style={[styles.pitchCardDays, { color: colors.mutedForeground }]}>Submitted {p.submittedDays}d ago</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: p.statusColor + "20", borderColor: p.statusColor + "40" }]}>
                  <Text style={[styles.statusText, { color: p.statusColor }]}>{p.status}</Text>
                </View>
              </View>
            ))}

            {/* Pitched deals */}
            {Object.keys(pitched).length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 20, marginBottom: 12 }]}>Just Pitched</Text>
                {Object.keys(pitched).map((dealId) => {
                  const deal = DEALS.find((d) => d.id === dealId);
                  if (!deal) return null;
                  return (
                    <View key={dealId} style={[styles.pitchCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <View style={[styles.pitchCardLogo, { backgroundColor: colors.muted }]}>
                        <Text style={{ fontSize: 24 }}>{deal.logo}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.pitchCardBrand, { color: colors.foreground }]}>{deal.brand}</Text>
                        <Text style={[styles.pitchCardDays, { color: colors.mutedForeground }]}>{deal.type}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: "#FFB80020", borderColor: "#FFB80040" }]}>
                        <Text style={[styles.statusText, { color: "#FFB800" }]}>Sent</Text>
                      </View>
                    </View>
                  );
                })}
              </>
            )}

            {MY_PITCHES.length === 0 && Object.keys(pitched).length === 0 && (
              <View style={[styles.emptyBox, { borderColor: colors.border }]}>
                <Text style={{ fontSize: 36 }}>📬</Text>
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No pitches yet</Text>
                <Text style={[styles.emptySubtext, { color: colors.mutedForeground }]}>Find a deal on the Discover tab and hit Pitch to get started</Text>
              </View>
            )}

            {/* Tips */}
            <View style={[styles.tipsCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 24 }]}>
              <Text style={[styles.tipsTitle, { color: colors.foreground }]}>Tips to get selected 💡</Text>
              {[
                "Keep your profile complete with a bio and 3+ posts",
                "Match the brand's vibe — check their tags before pitching",
                "Respond to brand messages within 24 hours",
                "Smaller following with high engagement beats big & silent",
              ].map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <View style={[styles.tipDot, { backgroundColor: "#E91E8C" }]} />
                  <Text style={[styles.tipText, { color: colors.mutedForeground }]}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── LEADERBOARD TAB ───────────────────────────────────────────── */}
        {tab === "leaderboard" && (
          <View style={{ padding: 16, paddingTop: 20 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 4 }]}>Top Earners This Month</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground, marginBottom: 16 }]}>
              Creators who closed the most brand deals on Ridhi
            </Text>

            {TOP_CREATORS.map((c, idx) => (
              <View key={c.id} style={[styles.leaderRow, { backgroundColor: colors.card, borderColor: idx === 0 ? "#FFB80040" : colors.border }]}>
                {idx === 0 && (
                  <LinearGradient colors={["#FFB80015", "transparent"]} style={StyleSheet.absoluteFill} />
                )}
                <View style={[styles.rankBadge, {
                  backgroundColor: idx === 0 ? "#FFB800" : idx === 1 ? "#C0C0C0" : idx === 2 ? "#CD7F32" : colors.muted,
                }]}>
                  <Text style={[styles.rankNum, { color: idx < 3 ? "#000" : colors.mutedForeground }]}>{idx + 1}</Text>
                </View>
                <Avatar name={c.name} size={46} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.leaderName, { color: colors.foreground }]}>{c.name}</Text>
                  <Text style={[styles.leaderNiche, { color: colors.mutedForeground }]}>{c.niche} · {c.followers}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 3 }}>
                  <Text style={[styles.leaderEarned, { color: "#22C55E" }]}>{c.earned}</Text>
                  <Text style={[styles.leaderDeals, { color: colors.mutedForeground }]}>{c.deals} deals</Text>
                </View>
              </View>
            ))}

            {/* How it works */}
            <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 28, marginBottom: 16 }]}>How it works</Text>
            {[
              { icon: "search",    step: "1", title: "Browse Deals",        desc: "Explore brand campaigns that match your niche and following size." },
              { icon: "send",      step: "2", title: "Pitch in 1 Tap",      desc: "Hit Pitch and the brand gets notified instantly. No long forms." },
              { icon: "check",     step: "3", title: "Get Shortlisted",     desc: "Brand reviews your profile and picks the best fit creators." },
              { icon: "film",      step: "4", title: "Create & Post",       desc: "Make the content, post it, and share the link with the brand." },
              { icon: "dollar-sign", step: "5", title: "Get Paid", desc: "Payment lands in your Ridhi wallet within 7 days of approval." },
            ].map((h, i) => (
              <View key={h.step} style={styles.howRow}>
                <LinearGradient
                  colors={["#7B2FBE", "#E91E8C"]}
                  style={styles.howIcon}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  <Feather name={h.icon as any} size={16} color="#fff" />
                </LinearGradient>
                {i < 4 && <View style={[styles.howLine, { backgroundColor: colors.border }]} />}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.howTitle, { color: colors.foreground }]}>{h.title}</Text>
                  <Text style={[styles.howDesc, { color: colors.mutedForeground }]}>{h.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // header
  header: { paddingHorizontal: 20, paddingBottom: 0 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.1)" },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.55)", marginTop: 2 },

  statsStrip: { flexDirection: "row", marginBottom: 16 },
  statBox: { flex: 1, alignItems: "center", paddingVertical: 8 },
  statVal: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.5)", marginTop: 2 },

  tabRow: { flexDirection: "row", borderBottomWidth: 1, marginBottom: 0 },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 12, position: "relative" },
  tabBtnActive: {},
  tabLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  tabUnderline: { position: "absolute", bottom: 0, left: "20%", right: "20%", height: 2, backgroundColor: "#E91E8C", borderRadius: 2 },

  // category
  catScroll: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  catBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  catBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  sectionRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  sectionSub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  hotBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  hotBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },

  // featured cards
  featuredScroll: { paddingHorizontal: 16, gap: 12, paddingBottom: 4 },
  featuredCard: { width: width * 0.55, borderRadius: 18, borderWidth: 1, padding: 16, gap: 6, overflow: "hidden" },
  featuredTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  logoCircle: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  logoEmoji: { fontSize: 24 },
  hotTag: { backgroundColor: "#FF572215", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  hotTagText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#FF5722" },
  featuredBrand: { fontSize: 15, fontFamily: "Inter_700Bold" },
  featuredType: { fontSize: 12, fontFamily: "Inter_400Regular" },
  featuredBudget: { fontSize: 15, fontFamily: "Inter_700Bold" },
  featuredMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  featuredMetaText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  featuredMetaDot: { fontSize: 12 },
  pitchBtn: { borderRadius: 10, paddingVertical: 9, alignItems: "center", marginTop: 2 },
  pitchBtnText: { fontSize: 13, fontFamily: "Inter_700Bold" },

  // deal list cards
  dealCard: { borderRadius: 16, borderWidth: 1, marginBottom: 12, overflow: "hidden", flexDirection: "row" },
  dealAccent: { width: 4 },
  dealInner: { flex: 1, padding: 14, gap: 8 },
  dealTopRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dealLogo: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  dealBrandRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  dealBrand: { fontSize: 14, fontFamily: "Inter_700Bold" },
  dealHotEmoji: { fontSize: 14 },
  dealType: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  dealBudget: { fontSize: 14, fontFamily: "Inter_700Bold", flexShrink: 0 },
  dealDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  tagText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  dealBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dealMetaGroup: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dealMetaItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  dealMetaText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  dealPitchBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 10, borderWidth: 1.5 },
  dealPitchText: { fontSize: 13, fontFamily: "Inter_700Bold" },

  // brand CTA
  brandCta: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 16, borderWidth: 1 },
  brandCtaIcon: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  brandCtaTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  brandCtaSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },

  // pitches tab
  earningCard: { borderRadius: 20, padding: 24, alignItems: "center", gap: 4 },
  earningLabel: { fontSize: 13, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.7)" },
  earningAmount: { fontSize: 38, fontFamily: "Inter_700Bold", color: "#fff" },
  earningNote: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)", marginTop: 4 },
  pitchCard: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10, overflow: "hidden" },
  pitchCardLogo: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  pitchCardBrand: { fontSize: 14, fontFamily: "Inter_700Bold" },
  pitchCardDays: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  statusText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  emptyBox: { borderRadius: 16, borderWidth: 1, borderStyle: "dashed", padding: 32, alignItems: "center", gap: 8, marginTop: 8 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  emptySubtext: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
  tipsCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  tipsTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  tipDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6, flexShrink: 0 },
  tipText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },

  // leaderboard
  leaderRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 10, overflow: "hidden" },
  rankBadge: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  rankNum: { fontSize: 13, fontFamily: "Inter_700Bold" },
  leaderName: { fontSize: 14, fontFamily: "Inter_700Bold" },
  leaderNiche: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  leaderEarned: { fontSize: 14, fontFamily: "Inter_700Bold" },
  leaderDeals: { fontSize: 11, fontFamily: "Inter_400Regular" },
  howRow: { flexDirection: "row", alignItems: "flex-start", gap: 14, marginBottom: 16, position: "relative" },
  howIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  howLine: { position: "absolute", left: 19, top: 44, width: 2, height: 32 },
  howTitle: { fontSize: 14, fontFamily: "Inter_700Bold", paddingTop: 4 },
  howDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19, marginTop: 2 },
});
