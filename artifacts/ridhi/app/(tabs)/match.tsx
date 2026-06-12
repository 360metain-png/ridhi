import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
const COIN_IMAGE = require("../../assets/images/ridhi_coin.png");
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useTrackScreen, useAnalytics } from "@/hooks/useAnalytics";
import { MATCH_PROFILES } from "@/data/mockData";
import { SubscriptionBadge } from "@/components/SubscriptionBadge";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 32;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;

type Profile = typeof MATCH_PROFILES[0];

const GENDER_OPTIONS = ["Everyone", "Women", "Men", "Non-binary"];

function defaultShowMe(userGender?: string): string {
  if (userGender === "male") return "Women";
  if (userGender === "female") return "Men";
  return "Everyone";
}

function profileMatchesGender(profile: Profile, showMe: string): boolean {
  if (showMe === "Everyone") return true;
  if (showMe === "Women") return profile.gender === "female";
  if (showMe === "Men") return profile.gender === "male";
  return true;
}
const LANGUAGE_OPTIONS = [
  "All Languages", "Hindi", "Bengali", "Telugu", "Marathi", "Tamil",
  "Gujarati", "Kannada", "Malayalam", "Punjabi", "Odia", "English",
];
const INTEREST_OPTIONS = [
  "Music", "Dance", "Food", "Travel", "Movies", "Cricket", "Fitness",
  "Art", "Gaming", "Books", "Photography", "Comedy", "Fashion", "Tech",
];
const DISTANCE_OPTIONS = ["5 km", "10 km", "25 km", "50 km", "100 km", "Anywhere"];

interface DiscoverFilters {
  gender: string;
  language: string;
  distance: string;
  ageMin: number;
  ageMax: number;
  verifiedOnly: boolean;
  withPhotoOnly: boolean;
  interests: string[];
  onlineOnly: boolean;
  showNewProfiles: boolean;
}

const DEFAULT_FILTERS: DiscoverFilters = {
  gender: "Everyone",
  language: "All Languages",
  distance: "25 km",
  ageMin: 18,
  ageMax: 35,
  verifiedOnly: false,
  withPhotoOnly: true,
  interests: [],
  onlineOnly: false,
  showNewProfiles: false,
};

function Toggle({ value, onChange, color }: { value: boolean; onChange: (v: boolean) => void; color: string }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const toggle = () => {
    const next = !value;
    Animated.spring(anim, { toValue: next ? 1 : 0, useNativeDriver: false, speed: 30 }).start();
    onChange(next);
  };
  const bg = anim.interpolate({ inputRange: [0, 1], outputRange: ["#ccc", color] });
  const tx = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 22] });
  return (
    <Pressable onPress={toggle}>
      <Animated.View style={[styles.toggleTrack, { backgroundColor: bg }]}>
        <Animated.View style={[styles.toggleThumb, { transform: [{ translateX: tx }] }]} />
      </Animated.View>
    </Pressable>
  );
}

function AgeSlider({
  min, max, onMin, onMax,
}: { min: number; max: number; onMin: (v: number) => void; onMax: (v: number) => void }) {
  const colors = useColors();
  const AGE_MIN = 18; const AGE_MAX = 60;
  const steps = AGE_MAX - AGE_MIN;
  const leftPct = (min - AGE_MIN) / steps;
  const rightPct = (max - AGE_MIN) / steps;
  const trackRef = useRef<View>(null);
  const [trackW, setTrackW] = useState(260);
  return (
    <View>
      <View style={styles.ageRow}>
        <Text style={[styles.ageVal, { color: colors.primary }]}>{min}</Text>
        <Text style={[styles.ageDash, { color: colors.mutedForeground }]}> – </Text>
        <Text style={[styles.ageVal, { color: colors.primary }]}>{max}</Text>
        <Text style={[styles.ageUnit, { color: colors.mutedForeground }]}> yrs</Text>
      </View>
      <View
        ref={trackRef}
        onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}
        style={[styles.sliderTrack, { backgroundColor: colors.border }]}
      >
        <View
          style={[styles.sliderFill, {
            backgroundColor: colors.primary,
            left: leftPct * trackW,
            right: (1 - rightPct) * trackW,
          }]}
        />
        {/* min thumb */}
        <Pressable
          style={[styles.sliderThumb, { left: leftPct * trackW - 10, backgroundColor: colors.primary }]}
          onStartShouldSetResponder={() => true}
          onResponderMove={(e) => {
            const raw = e.nativeEvent.locationX + leftPct * trackW;
            const pct = Math.min(Math.max(raw / trackW, 0), rightPct - 0.1);
            onMin(Math.round(AGE_MIN + pct * steps));
          }}
        />
        {/* max thumb */}
        <Pressable
          style={[styles.sliderThumb, { left: rightPct * trackW - 10, backgroundColor: colors.primary }]}
          onStartShouldSetResponder={() => true}
          onResponderMove={(e) => {
            const raw = e.nativeEvent.locationX + rightPct * trackW;
            const pct = Math.min(Math.max(raw / trackW, leftPct + 0.1), 1);
            onMax(Math.round(AGE_MIN + pct * steps));
          }}
        />
      </View>
    </View>
  );
}

export default function MatchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addCoins } = useAuth();
  const { trackMatch } = useAnalytics();
  useTrackScreen("match");
  const userLanguage = user?.language ?? "Hindi";

  // Smart gender default: male users see women, female users see men
  const smartShowMe = defaultShowMe(user?.gender);
  const initialFilters: DiscoverFilters = { ...DEFAULT_FILTERS, gender: smartShowMe };

  const buildPool = (showMe: string, language: string): Profile[] => {
    const byGender = MATCH_PROFILES.filter((p) => profileMatchesGender(p, showMe));
    const byLang = byGender.filter((p) => p.language === language);
    return byLang.length > 0 ? byLang : byGender;
  };

  const [profiles, setProfiles] = useState<Profile[]>(() => buildPool(smartShowMe, userLanguage));
  const [matched, setMatched] = useState<Profile | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<DiscoverFilters>(initialFilters);
  const [draft, setDraft] = useState<DiscoverFilters>(initialFilters);

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
  const bottomInset = Platform.OS === "web" ? 24 : insets.bottom;

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
    // Track swipe
    const currentProfile = profiles[0];
    if (currentProfile) {
      trackMatch(dir, currentProfile.id);
    }
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

  const openFilters = () => {
    setDraft({ ...filters });
    setShowFilters(true);
  };

  const applyFilters = () => {
    const applied = { ...draft };
    setFilters(applied);
    // Rebuild the profile pool with the new gender + language filters
    setProfiles(buildPool(applied.gender, applied.language === "All Languages" ? userLanguage : applied.language));
    setShowFilters(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const resetFilters = () => setDraft({ ...initialFilters });

  const toggleInterest = (tag: string) => {
    setDraft((prev) => ({
      ...prev,
      interests: prev.interests.includes(tag)
        ? prev.interests.filter((i) => i !== tag)
        : [...prev.interests, tag],
    }));
  };

  const activeFilterCount = [
    filters.gender !== "Everyone",
    filters.language !== "All Languages",
    filters.distance !== "25 km",
    filters.ageMin !== 18 || filters.ageMax !== 35,
    filters.verifiedOnly,
    filters.withPhotoOnly === true,
    filters.interests.length > 0,
    filters.onlineOnly,
    filters.showNewProfiles,
  ].filter(Boolean).length;

  const current = profiles[0];
  const next = profiles[1];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Discover</Text>
          <View style={styles.langFilterRow}>
            <View style={[styles.langFilterBadge, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40" }]}>
              <Text style={styles.langFilterEmoji}>🗣️</Text>
              <Text style={[styles.langFilterText, { color: colors.primary }]}>
                {filters.language === "All Languages" ? userLanguage + " speakers" : filters.language}
                {filters.gender !== "Everyone" ? ` · ${filters.gender}` : ""}
                {" · "}
                {filters.distance}
              </Text>
            </View>
          </View>
        </View>
        <Pressable
          onPress={openFilters}
          style={[styles.filterBtn, { backgroundColor: activeFilterCount > 0 ? colors.primary + "18" : colors.muted, borderColor: activeFilterCount > 0 ? colors.primary + "60" : "transparent", borderWidth: 1 }]}
        >
          <Feather name="sliders" size={18} color={activeFilterCount > 0 ? colors.primary : colors.foreground} />
          {activeFilterCount > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* ── CARD AREA ──────────────────────────────────────────────────────── */}
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
                  {current.vipTier && (
                    <SubscriptionBadge tier={current.vipTier} size="sm" style={{ marginBottom: 6, alignSelf: "flex-start" }} />
                  )}
                  <View style={styles.cardMetaRow}>
                    <Feather name="map-pin" size={13} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.cardMeta}>{current.distance} · {current.city}</Text>
                    <View style={styles.cardLangBadge}>
                      <Text style={styles.cardLangText}>🗣️ {current.language}</Text>
                    </View>
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

      {/* ── SWIPE BUTTONS ──────────────────────────────────────────────────── */}
      {profiles.length > 0 && (
        <View style={[styles.buttons, { paddingBottom: bottomPad + 20 }]}>
          <Pressable
            onPress={() => swipe("left")}
            style={[styles.swipeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Feather name="x" size={28} color="#FF3B30" />
          </Pressable>
          <Pressable
            onPress={() => {
              const SUPER_LIKE_COST = 5;
              if ((user?.coins ?? 0) < SUPER_LIKE_COST) {
                Alert.alert(
                  "Not enough coins",
                  `Super Like costs ${SUPER_LIKE_COST} coins. Recharge your wallet!`,
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Recharge", onPress: () => router.push("/wallet") },
                  ]
                );
                return;
              }
              addCoins(-SUPER_LIKE_COST);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              swipe("right");
            }}
            style={[styles.swipeBtn, styles.superBtn, { backgroundColor: colors.gold + "20", borderColor: colors.gold }]}
          >
            <Image source={COIN_IMAGE} style={{ width: 22, height: 22 }} resizeMode="contain" />
            <Text style={[styles.superCost, { color: colors.gold }]}>5</Text>
          </Pressable>
          <Pressable
            onPress={() => swipe("right")}
            style={[styles.swipeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Feather name="heart" size={28} color={colors.primary} />
          </Pressable>
        </View>
      )}

      {/* ── MATCH OVERLAY ──────────────────────────────────────────────────── */}
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

      {/* ── FILTER MODAL ───────────────────────────────────────────────────── */}
      <Modal visible={showFilters} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowFilters(false)}>
        <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
          {/* Modal header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: Platform.OS === "ios" ? 16 : 24 }]}>
            <Pressable onPress={() => setShowFilters(false)} style={styles.modalClose}>
              <Feather name="x" size={22} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Discover Settings</Text>
            <Pressable onPress={resetFilters}>
              <Text style={[styles.modalReset, { color: colors.primary }]}>Reset</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={[styles.modalContent, { paddingBottom: bottomInset + 100 }]} showsVerticalScrollIndicator={false}>

            {/* ── Show me ── */}
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>SHOW ME</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {GENDER_OPTIONS.map((g, i) => (
                <Pressable
                  key={g}
                  onPress={() => setDraft((d) => ({ ...d, gender: g }))}
                  style={[
                    styles.optionRow,
                    i < GENDER_OPTIONS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                  ]}
                >
                  <Text style={[styles.optionLabel, { color: colors.foreground }]}>{g}</Text>
                  {draft.gender === g && <Feather name="check" size={18} color={colors.primary} />}
                </Pressable>
              ))}
            </View>

            {/* ── Age range ── */}
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>AGE RANGE</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, paddingHorizontal: 20, paddingVertical: 18 }]}>
              <AgeSlider
                min={draft.ageMin}
                max={draft.ageMax}
                onMin={(v) => setDraft((d) => ({ ...d, ageMin: v }))}
                onMax={(v) => setDraft((d) => ({ ...d, ageMax: v }))}
              />
            </View>

            {/* ── Distance ── */}
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>MAXIMUM DISTANCE</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.chipRow}>
                {DISTANCE_OPTIONS.map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => setDraft((prev) => ({ ...prev, distance: d }))}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: draft.distance === d ? colors.primary : colors.muted,
                        borderColor: draft.distance === d ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: draft.distance === d ? "#fff" : colors.foreground }]}>{d}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* ── Language ── */}
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>LANGUAGE</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {LANGUAGE_OPTIONS.map((lang, i) => (
                <Pressable
                  key={lang}
                  onPress={() => setDraft((d) => ({ ...d, language: lang }))}
                  style={[
                    styles.optionRow,
                    i < LANGUAGE_OPTIONS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                  ]}
                >
                  <Text style={[styles.optionLabel, { color: colors.foreground }]}>{lang}</Text>
                  {draft.language === lang && <Feather name="check" size={18} color={colors.primary} />}
                </Pressable>
              ))}
            </View>

            {/* ── Interests ── */}
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>COMMON INTERESTS</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionNote, { color: colors.mutedForeground }]}>Show profiles matching your selected interests</Text>
              <View style={styles.chipRow}>
                {INTEREST_OPTIONS.map((tag) => {
                  const on = draft.interests.includes(tag);
                  return (
                    <Pressable
                      key={tag}
                      onPress={() => toggleInterest(tag)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: on ? colors.secondary + "20" : colors.muted,
                          borderColor: on ? colors.secondary : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.chipText, { color: on ? colors.secondary : colors.foreground }]}>{tag}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* ── Toggles ── */}
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>FILTERS</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {[
                { key: "verifiedOnly",    label: "Verified profiles only",  icon: "check-circle", desc: "Show only Ridhi-verified users" },
                { key: "withPhotoOnly",   label: "With photo only",          icon: "image",        desc: "Skip profiles without a profile photo" },
                { key: "onlineOnly",      label: "Online now",               icon: "radio",        desc: "Show only users currently active" },
                { key: "showNewProfiles", label: "New to Ridhi",             icon: "star",         desc: "Prioritise recently joined users" },
              ].map(({ key, label, icon, desc }, i, arr) => (
                <View
                  key={key}
                  style={[
                    styles.toggleRow,
                    i < arr.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                  ]}
                >
                  <View style={[styles.toggleIcon, { backgroundColor: colors.primary + "15" }]}>
                    <Feather name={icon as any} size={16} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.toggleLabel, { color: colors.foreground }]}>{label}</Text>
                    <Text style={[styles.toggleDesc, { color: colors.mutedForeground }]}>{desc}</Text>
                  </View>
                  <Toggle
                    value={(draft as any)[key]}
                    onChange={(v) => setDraft((d) => ({ ...d, [key]: v }))}
                    color={colors.primary}
                  />
                </View>
              ))}
            </View>

          </ScrollView>

          {/* Apply button */}
          <View style={[styles.applyWrap, { borderTopColor: colors.border, paddingBottom: bottomInset + 12, backgroundColor: colors.background }]}>
            <Pressable onPress={applyFilters} style={styles.applyBtn}>
              <LinearGradient colors={[colors.secondary, colors.primary]} style={styles.applyBtnInner}>
                <Feather name="check" size={18} color="#fff" />
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  langFilterRow: { flexDirection: "row", marginTop: 4 },
  langFilterBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  langFilterEmoji: { fontSize: 13 },
  langFilterText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: { color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold" },
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
  cardMetaRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  cardMeta: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "Inter_400Regular" },
  cardLangBadge: {
    backgroundColor: "rgba(233,30,140,0.3)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(233,30,140,0.5)",
  },
  cardLangText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
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
  superBtn: { width: 52, height: 52, borderRadius: 26, flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 },
  superCost: { fontSize: 9, fontFamily: "Inter_700Bold" },
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

  // ── Modal ──
  modalRoot: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalClose: { padding: 4 },
  modalTitle: { flex: 1, textAlign: "center", fontSize: 16, fontFamily: "Inter_700Bold" },
  modalReset: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  modalContent: { paddingHorizontal: 16, paddingTop: 20, gap: 6 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 6,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionNote: { fontSize: 12, fontFamily: "Inter_400Regular", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  optionLabel: { fontSize: 15, fontFamily: "Inter_400Regular" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  toggleIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  toggleLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  toggleDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  toggleTrack: { width: 44, height: 24, borderRadius: 12, justifyContent: "center" },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  ageRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 14 },
  ageVal: { fontSize: 22, fontFamily: "Inter_700Bold" },
  ageDash: { fontSize: 18 },
  ageUnit: { fontSize: 14, fontFamily: "Inter_400Regular" },
  sliderTrack: { height: 4, borderRadius: 2, position: "relative", marginTop: 8, marginBottom: 14 },
  sliderFill: { position: "absolute", height: 4, borderRadius: 2, top: 0 },
  sliderThumb: { position: "absolute", width: 20, height: 20, borderRadius: 10, top: -8 },
  applyWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  applyBtn: { borderRadius: 50, overflow: "hidden" },
  applyBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  applyBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
});
