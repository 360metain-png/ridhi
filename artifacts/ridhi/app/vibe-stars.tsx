import React, { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/Avatar";

const { width } = Dimensions.get("window");

// ── Zodiac data ────────────────────────────────────────────────────────────
const ZODIAC_SIGNS = [
  { id: "aries",       name: "Aries",       emoji: "♈", dates: "Mar 21 – Apr 19", element: "Fire",  color: "#FF5252" },
  { id: "taurus",      name: "Taurus",      emoji: "♉", dates: "Apr 20 – May 20", element: "Earth", color: "#66BB6A" },
  { id: "gemini",      name: "Gemini",      emoji: "♊", dates: "May 21 – Jun 20", element: "Air",   color: "#FFCA28" },
  { id: "cancer",      name: "Cancer",      emoji: "♋", dates: "Jun 21 – Jul 22", element: "Water", color: "#42A5F5" },
  { id: "leo",         name: "Leo",         emoji: "♌", dates: "Jul 23 – Aug 22", element: "Fire",  color: "#FFA726" },
  { id: "virgo",       name: "Virgo",       emoji: "♍", dates: "Aug 23 – Sep 22", element: "Earth", color: "#26A69A" },
  { id: "libra",       name: "Libra",       emoji: "♎", dates: "Sep 23 – Oct 22", element: "Air",   color: "#EC407A" },
  { id: "scorpio",     name: "Scorpio",     emoji: "♏", dates: "Oct 23 – Nov 21", element: "Water", color: "#AB47BC" },
  { id: "sagittarius", name: "Sagittarius", emoji: "♐", dates: "Nov 22 – Dec 21", element: "Fire",  color: "#7E57C2" },
  { id: "capricorn",   name: "Capricorn",   emoji: "♑", dates: "Dec 22 – Jan 19", element: "Earth", color: "#78909C" },
  { id: "aquarius",    name: "Aquarius",    emoji: "♒", dates: "Jan 20 – Feb 18", element: "Air",   color: "#29B6F6" },
  { id: "pisces",      name: "Pisces",      emoji: "♓", dates: "Feb 19 – Mar 20", element: "Water", color: "#26C6DA" },
];

// ── Curated extras (energy, lucky, best match, rating) ────────────────────
const HOROSCOPE_META: Record<string, { energy: string; lucky: string; rating: number }> = {
  aries:       { energy: "High",      lucky: "Red",       rating: 4 },
  taurus:      { energy: "Steady",    lucky: "Green",     rating: 4 },
  gemini:      { energy: "Buzzing",   lucky: "Yellow",    rating: 5 },
  cancer:      { energy: "Calm",      lucky: "Silver",    rating: 3 },
  leo:         { energy: "Radiant",   lucky: "Gold",      rating: 5 },
  virgo:       { energy: "Focused",   lucky: "Navy",      rating: 4 },
  libra:       { energy: "Harmonious",lucky: "Pink",      rating: 4 },
  scorpio:     { energy: "Magnetic",  lucky: "Maroon",    rating: 4 },
  sagittarius: { energy: "Free",      lucky: "Purple",    rating: 5 },
  capricorn:   { energy: "Grounded",  lucky: "Brown",     rating: 3 },
  aquarius:    { energy: "Electric",  lucky: "Blue",      rating: 5 },
  pisces:      { energy: "Dreamy",    lucky: "Turquoise", rating: 4 },
};

// ── Fallback text if API is unreachable ───────────────────────────────────
const FALLBACK: Record<string, string> = {
  aries:       "Bold moves pay off today. Trust your instincts — a new opportunity is closer than you think. In love, a surprising gesture will warm your heart.",
  taurus:      "Patience brings rewards. Financial clarity arrives by midday. In relationships, your grounded nature is exactly what someone special needs right now.",
  gemini:      "Your curiosity leads to a brilliant breakthrough. Conversations spark ideas. Romance is lively — someone is captivated by your quick wit today.",
  cancer:      "Emotions run deep but beautifully. Express what you feel — honesty opens doors today. At work, your intuition guides you better than data alone.",
  leo:         "You radiate confidence and others are drawn to your light. A leadership opportunity arises — own it. Love is warm and full of admiration.",
  virgo:       "Precision and care set you apart today. A detail you notice changes everything. In love, small acts of kindness speak louder than grand gestures.",
  libra:       "Harmony is your gift — you help people find common ground effortlessly. A long-standing matter finally balances out in your favour.",
  scorpio:     "Depth and intensity are your superpowers. A hidden truth surfaces — handle it with wisdom. Passion runs high in relationships today.",
  sagittarius: "Adventure calls! An unexpected invitation opens a new horizon. Stay optimistic — the universe is setting up something exciting for you.",
  capricorn:   "Steady effort is compounding quietly. Trust the process. Someone at work recognises your dedication. Love deepens through shared goals.",
  aquarius:    "Your originality turns heads today. An unconventional idea earns unexpected applause. Connections feel electric — embrace the unusual.",
  pisces:      "Dreams feel close to reality. Creative energy flows freely — channel it. In love, a meaningful conversation deepens an existing bond.",
};

// ── Vibe / mood data ───────────────────────────────────────────────────────
const VIBES = [
  { id: "happy",     emoji: "😄", label: "Happy",        color: "#FFD700", grad: ["#FFD700","#FF8C00"] as [string,string], users: 2841 },
  { id: "romantic",  emoji: "💕", label: "Romantic",     color: "#FF69B4", grad: ["#FF69B4","#E91E8C"] as [string,string], users: 1924 },
  { id: "chill",     emoji: "😎", label: "Chill",        color: "#00BCD4", grad: ["#00BCD4","#0097A7"] as [string,string], users: 3102 },
  { id: "anxious",   emoji: "😟", label: "Need Support", color: "#7B2FBE", grad: ["#7B2FBE","#512DA8"] as [string,string], users: 842  },
  { id: "motivated", emoji: "🔥", label: "Motivated",    color: "#FF5722", grad: ["#FF5722","#E64A19"] as [string,string], users: 1567 },
  { id: "bored",     emoji: "😑", label: "Bored",        color: "#78909C", grad: ["#78909C","#546E7A"] as [string,string], users: 2209 },
  { id: "excited",   emoji: "🎉", label: "Excited",      color: "#9C27B0", grad: ["#9C27B0","#673AB7"] as [string,string], users: 1388 },
  { id: "grateful",  emoji: "🙏", label: "Grateful",     color: "#4CAF50", grad: ["#4CAF50","#388E3C"] as [string,string], users: 976  },
];

const VIBING_PEOPLE = [
  { id: "u1", name: "Priya S",  city: "Delhi",     vibe: "romantic",  sign: "Leo"      },
  { id: "u2", name: "Arjun M",  city: "Mumbai",    vibe: "chill",     sign: "Scorpio"  },
  { id: "u3", name: "Kavya R",  city: "Bangalore", vibe: "happy",     sign: "Gemini"   },
  { id: "u4", name: "Rohan V",  city: "Jaipur",    vibe: "motivated", sign: "Aries"    },
  { id: "u5", name: "Sneha P",  city: "Pune",      vibe: "happy",     sign: "Libra"    },
  { id: "u6", name: "Dev T",    city: "Hyderabad", vibe: "excited",   sign: "Aquarius" },
];

const COMPAT_PAIRS: Record<string, { best: string[]; challenging: string[] }> = {
  aries:       { best: ["Leo","Sagittarius","Gemini"],   challenging: ["Cancer","Capricorn"]     },
  taurus:      { best: ["Virgo","Capricorn","Cancer"],   challenging: ["Leo","Aquarius"]         },
  gemini:      { best: ["Libra","Aquarius","Aries"],     challenging: ["Virgo","Pisces"]         },
  cancer:      { best: ["Scorpio","Pisces","Taurus"],    challenging: ["Aries","Libra"]          },
  leo:         { best: ["Aries","Sagittarius","Libra"],  challenging: ["Taurus","Scorpio"]       },
  virgo:       { best: ["Taurus","Capricorn","Cancer"],  challenging: ["Gemini","Sagittarius"]   },
  libra:       { best: ["Gemini","Aquarius","Leo"],      challenging: ["Cancer","Capricorn"]     },
  scorpio:     { best: ["Cancer","Pisces","Virgo"],      challenging: ["Leo","Aquarius"]         },
  sagittarius: { best: ["Aries","Leo","Aquarius"],       challenging: ["Virgo","Pisces"]         },
  capricorn:   { best: ["Taurus","Virgo","Scorpio"],     challenging: ["Aries","Libra"]          },
  aquarius:    { best: ["Gemini","Libra","Sagittarius"], challenging: ["Taurus","Scorpio"]       },
  pisces:      { best: ["Cancer","Scorpio","Capricorn"], challenging: ["Gemini","Sagittarius"]   },
};

// ── AsyncStorage cache key (one per calendar day) ─────────────────────────
function todayCacheKey() {
  const d = new Date();
  return `ridhi_horoscopes_${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`;
}

type TabType = "horoscope" | "vibe" | "compat";

export default function VibeStarsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { user } = useAuth();

  const mySign = user?.zodiacSign ?? "leo";

  const [tab, setTab]           = useState<TabType>("horoscope");
  const [selectedSign, setSelectedSign] = useState(mySign);
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [compatA, setCompatA]   = useState(mySign);
  const [compatB, setCompatB]   = useState("scorpio");

  // ── Live horoscope state ─────────────────────────────────────────────────
  const [liveData,    setLiveData]    = useState<Record<string, string>>({});
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLive,      setIsLive]      = useState(false);

  const fetchHoroscopes = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setFetchError(false);
    const cacheKey = todayCacheKey();

    try {
      // Check cache first (skip if force-refreshing)
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as { data: Record<string, string>; date: string };
          setLiveData(parsed.data);
          setLastUpdated(parsed.date);
          setIsLive(true);
          setLoading(false);
          return;
        }
      }

      // Fetch all 12 signs in parallel
      const results = await Promise.allSettled(
        ZODIAC_SIGNS.map(async (z) => {
          const res = await fetch(
            `https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily?sign=${z.name}&day=TODAY`,
            { signal: AbortSignal.timeout(8000) }
          );
          if (!res.ok) throw new Error("non-200");
          const json = await res.json() as { success: boolean; data: { horoscope_data: string; date: string } };
          if (!json.success) throw new Error("api-error");
          return { id: z.id, text: json.data.horoscope_data, date: json.data.date };
        })
      );

      const dataMap: Record<string, string> = {};
      let dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long" });
      let anySuccess = false;

      results.forEach((r) => {
        if (r.status === "fulfilled") {
          dataMap[r.value.id] = r.value.text;
          dateStr = r.value.date;
          anySuccess = true;
        }
      });

      if (anySuccess) {
        await AsyncStorage.setItem(cacheKey, JSON.stringify({ data: dataMap, date: dateStr }));
        setLiveData(dataMap);
        setLastUpdated(dateStr);
        setIsLive(true);
      } else {
        setFetchError(true);
        setIsLive(false);
      }
    } catch {
      setFetchError(true);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHoroscopes(); }, [fetchHoroscopes]);

  // helpers
  const sign       = ZODIAC_SIGNS.find((z) => z.id === selectedSign)!;
  const meta       = HOROSCOPE_META[selectedSign];
  const compat     = COMPAT_PAIRS[selectedSign];
  const compatCalc = COMPAT_PAIRS[compatA];
  const signBName  = ZODIAC_SIGNS.find((z) => z.id === compatB)?.name ?? "";
  const score      = compatCalc?.best.includes(signBName) ? 92 : compatCalc?.challenging.includes(signBName) ? 48 : 70;

  const horoscopeText = liveData[selectedSign] || FALLBACK[selectedSign];

  const filteredPeople = selectedVibe
    ? VIBING_PEOPLE.filter((p) => p.vibe === selectedVibe)
    : VIBING_PEOPLE;

  const TABS: { key: TabType; label: string; icon: string }[] = [
    { key: "horoscope", label: "Horoscope", icon: "⭐" },
    { key: "vibe",      label: "Vibe",      icon: "✨" },
    { key: "compat",    label: "Match",     icon: "💫" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient colors={["#0D0620","#1A0A3C", colors.background]} style={[styles.header, { paddingTop: topPad + 8 }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.headerTitle}>Vibe & Stars ✨</Text>
            <Text style={styles.headerSub}>Daily horoscope · Mood matching</Text>
          </View>
          {/* Refresh button */}
          <Pressable
            onPress={() => fetchHoroscopes(true)}
            style={styles.refreshBtn}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator size={16} color="rgba(255,255,255,0.7)" />
              : <Feather name="refresh-cw" size={16} color="rgba(255,255,255,0.7)" />
            }
          </Pressable>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {TABS.map((t) => (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            >
              <Text style={styles.tabEmoji}>{t.icon}</Text>
              <Text style={[styles.tabLabel, { color: tab === t.key ? "#fff" : "rgba(255,255,255,0.5)" }]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: (Platform.OS === "web" ? 84 : insets.bottom) + 32 }}>

        {/* ── HOROSCOPE TAB ──────────────────────────────────────────────── */}
        {tab === "horoscope" && (
          <View style={{ paddingTop: 16 }}>

            {/* Live / offline badge */}
            <View style={styles.liveBadgeRow}>
              {isLive ? (
                <View style={[styles.liveBadge, { backgroundColor: "#22C55E18", borderColor: "#22C55E40" }]}>
                  <View style={styles.liveDot} />
                  <Text style={[styles.liveBadgeText, { color: "#22C55E" }]}>
                    Live · {lastUpdated}
                  </Text>
                </View>
              ) : fetchError ? (
                <View style={[styles.liveBadge, { backgroundColor: "#FF575718", borderColor: "#FF575740" }]}>
                  <Feather name="wifi-off" size={11} color="#FF5757" />
                  <Text style={[styles.liveBadgeText, { color: "#FF5757" }]}>Offline — showing saved readings</Text>
                  <Pressable onPress={() => fetchHoroscopes(true)}>
                    <Text style={[styles.retryText, { color: "#FF5757" }]}>Retry</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={[styles.liveBadge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  <ActivityIndicator size={11} color={colors.mutedForeground} />
                  <Text style={[styles.liveBadgeText, { color: colors.mutedForeground }]}>Fetching today's readings…</Text>
                </View>
              )}
            </View>

            {/* Sign picker */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.signScroll}>
              {ZODIAC_SIGNS.map((z) => (
                <Pressable
                  key={z.id}
                  onPress={() => setSelectedSign(z.id)}
                  style={[
                    styles.signPill,
                    { borderColor: selectedSign === z.id ? z.color : colors.border },
                    selectedSign === z.id && { backgroundColor: z.color + "22" },
                  ]}
                >
                  <Text style={styles.signPillEmoji}>{z.emoji}</Text>
                  <Text style={[styles.signPillName, { color: selectedSign === z.id ? z.color : colors.mutedForeground }]}>{z.name}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Today's card */}
            <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
              <LinearGradient
                colors={[sign.color + "30", sign.color + "10", "transparent"]}
                style={[styles.horoCard, { borderColor: sign.color + "40", backgroundColor: colors.card }]}
              >
                {/* Sign header */}
                <View style={styles.horoCardTop}>
                  <View style={[styles.signBigEmoji, { backgroundColor: sign.color + "20", borderColor: sign.color + "40" }]}>
                    <Text style={styles.signBigEmojiText}>{sign.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.horoSignName, { color: colors.foreground }]}>{sign.name}</Text>
                    <Text style={[styles.horoSignDates, { color: colors.mutedForeground }]}>{sign.dates} · {sign.element}</Text>
                    <View style={styles.starsRow}>
                      {[1,2,3,4,5].map((s) => (
                        <Text key={s} style={{ fontSize: 14, opacity: s <= meta.rating ? 1 : 0.25 }}>⭐</Text>
                      ))}
                      <Text style={[styles.horoRatingText, { color: colors.mutedForeground }]}>Today</Text>
                    </View>
                  </View>
                </View>

                {/* Today's Reading — live text */}
                <View style={[styles.horoSection, { borderColor: colors.border }]}>
                  <View style={styles.horoSectionIcon}>
                    <Text style={{ fontSize: 16 }}>🔮</Text>
                    <Text style={[styles.horoSectionTitle, { color: sign.color }]}>Today's Reading</Text>
                    {isLive && (
                      <View style={[styles.liveTag, { backgroundColor: "#22C55E20" }]}>
                        <View style={styles.liveTagDot} />
                        <Text style={[styles.liveTagText, { color: "#22C55E" }]}>LIVE</Text>
                      </View>
                    )}
                  </View>

                  {loading && !horoscopeText ? (
                    <View style={styles.skeletonBlock}>
                      <View style={[styles.skeletonLine, { width: "100%", backgroundColor: colors.muted }]} />
                      <View style={[styles.skeletonLine, { width: "90%",  backgroundColor: colors.muted }]} />
                      <View style={[styles.skeletonLine, { width: "75%",  backgroundColor: colors.muted }]} />
                    </View>
                  ) : (
                    <Text style={[styles.horoText, { color: colors.foreground }]}>{horoscopeText}</Text>
                  )}
                </View>

                {/* Energy + Lucky + Best match row */}
                <View style={styles.horoMetaRow}>
                  <View style={[styles.horoMeta, { backgroundColor: sign.color + "18", borderColor: sign.color + "35" }]}>
                    <Text style={{ fontSize: 14 }}>⚡</Text>
                    <Text style={[styles.horoMetaLabel, { color: colors.mutedForeground }]}>Energy</Text>
                    <Text style={[styles.horoMetaVal, { color: sign.color }]}>{meta.energy}</Text>
                  </View>
                  <View style={[styles.horoMeta, { backgroundColor: sign.color + "18", borderColor: sign.color + "35" }]}>
                    <Text style={{ fontSize: 14 }}>🍀</Text>
                    <Text style={[styles.horoMetaLabel, { color: colors.mutedForeground }]}>Lucky</Text>
                    <Text style={[styles.horoMetaVal, { color: sign.color }]}>{meta.lucky}</Text>
                  </View>
                  <View style={[styles.horoMeta, { backgroundColor: sign.color + "18", borderColor: sign.color + "35" }]}>
                    <Text style={{ fontSize: 14 }}>❤️</Text>
                    <Text style={[styles.horoMetaLabel, { color: colors.mutedForeground }]}>Best match</Text>
                    <Text style={[styles.horoMetaVal, { color: sign.color }]}>{compat?.best[0]}</Text>
                  </View>
                </View>

                {/* Share nudge */}
                <Pressable style={[styles.shareRow, { borderColor: sign.color + "30", backgroundColor: sign.color + "10" }]}>
                  <Feather name="share-2" size={14} color={sign.color} />
                  <Text style={[styles.shareText, { color: sign.color }]}>Share my horoscope</Text>
                </Pressable>
              </LinearGradient>

              {/* People with same sign nearby */}
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 22 }]}>
                {sign.name.toUpperCase()} PEOPLE NEAR YOU
              </Text>
              <View style={[styles.nearbyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {VIBING_PEOPLE.slice(0,4).map((person, idx) => (
                  <Pressable
                    key={person.id}
                    onPress={() => router.push("/match" as any)}
                    style={[styles.nearbyRow, idx < 3 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
                  >
                    <Avatar name={person.name} size={40} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.nearbyName, { color: colors.foreground }]}>{person.name}</Text>
                      <Text style={[styles.nearbyCity, { color: colors.mutedForeground }]}>{person.city}</Text>
                    </View>
                    <View style={[styles.nearbySign, { backgroundColor: sign.color + "20" }]}>
                      <Text style={{ fontSize: 12 }}>{sign.emoji}</Text>
                    </View>
                    <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ── VIBE TAB ──────────────────────────────────────────────────── */}
        {tab === "vibe" && (
          <View style={{ padding: 16, paddingTop: 20 }}>
            <Text style={[styles.vibeHeading, { color: colors.foreground }]}>How are you feeling today?</Text>
            <Text style={[styles.vibeSub, { color: colors.mutedForeground }]}>Connect with people sharing the same vibe right now</Text>

            <View style={styles.vibeGrid}>
              {VIBES.map((v) => (
                <Pressable
                  key={v.id}
                  onPress={() => setSelectedVibe(selectedVibe === v.id ? null : v.id)}
                  style={[
                    styles.vibeCard,
                    { borderColor: selectedVibe === v.id ? v.color : colors.border },
                    { backgroundColor: selectedVibe === v.id ? v.color + "18" : colors.card },
                  ]}
                >
                  {selectedVibe === v.id && (
                    <LinearGradient colors={v.grad} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <View style={StyleSheet.absoluteFill} />
                    </LinearGradient>
                  )}
                  <Text style={styles.vibeEmoji}>{v.emoji}</Text>
                  <Text style={[styles.vibeLabel, { color: selectedVibe === v.id ? "#fff" : colors.foreground }]}>{v.label}</Text>
                  <Text style={[styles.vibeCount, { color: selectedVibe === v.id ? "rgba(255,255,255,0.75)" : colors.mutedForeground }]}>
                    {v.users.toLocaleString()} vibing
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 24, marginBottom: 8 }]}>
              {selectedVibe ? `PEOPLE FEELING ${VIBES.find(v=>v.id===selectedVibe)?.label.toUpperCase()}` : "VIBING RIGHT NOW"}
            </Text>
            <View style={[styles.nearbyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {filteredPeople.slice(0, 5).map((person, idx) => {
                const vibe = VIBES.find((v) => v.id === person.vibe)!;
                return (
                  <Pressable
                    key={person.id}
                    onPress={() => router.push("/match" as any)}
                    style={[styles.nearbyRow, idx < filteredPeople.slice(0,5).length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
                  >
                    <Avatar name={person.name} size={42} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.nearbyName, { color: colors.foreground }]}>{person.name}</Text>
                      <Text style={[styles.nearbyCity, { color: colors.mutedForeground }]}>{person.city} · {person.sign}</Text>
                    </View>
                    <View style={[styles.vibePill, { backgroundColor: vibe.color + "22", borderColor: vibe.color + "44" }]}>
                      <Text style={{ fontSize: 13 }}>{vibe.emoji}</Text>
                      <Text style={[styles.vibePillText, { color: vibe.color }]}>{vibe.label}</Text>
                    </View>
                    <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
                  </Pressable>
                );
              })}
            </View>

            {filteredPeople.length === 0 && (
              <View style={[styles.emptyBox, { borderColor: colors.border }]}>
                <Text style={{ fontSize: 32 }}>🌐</Text>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No one vibing this way right now — be the first!</Text>
              </View>
            )}
          </View>
        )}

        {/* ── COMPAT TAB ────────────────────────────────────────────────── */}
        {tab === "compat" && (
          <View style={{ padding: 16, paddingTop: 20 }}>
            <Text style={[styles.vibeHeading, { color: colors.foreground }]}>Zodiac Compatibility</Text>
            <Text style={[styles.vibeSub, { color: colors.mutedForeground }]}>See how well two signs match in love & life</Text>

            <View style={styles.compatPair}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginBottom: 8 }]}>YOUR SIGN</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {ZODIAC_SIGNS.map((z) => (
                  <Pressable
                    key={z.id}
                    onPress={() => setCompatA(z.id)}
                    style={[
                      styles.compatSignBtn,
                      { borderColor: compatA === z.id ? z.color : colors.border },
                      compatA === z.id && { backgroundColor: z.color + "22" },
                    ]}
                  >
                    <Text style={{ fontSize: 18 }}>{z.emoji}</Text>
                    <Text style={[styles.compatSignName, { color: compatA === z.id ? z.color : colors.mutedForeground }]}>{z.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginBottom: 8 }]}>THEIR SIGN</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {ZODIAC_SIGNS.map((z) => (
                  <Pressable
                    key={z.id}
                    onPress={() => setCompatB(z.id)}
                    style={[
                      styles.compatSignBtn,
                      { borderColor: compatB === z.id ? z.color : colors.border },
                      compatB === z.id && { backgroundColor: z.color + "22" },
                    ]}
                  >
                    <Text style={{ fontSize: 18 }}>{z.emoji}</Text>
                    <Text style={[styles.compatSignName, { color: compatB === z.id ? z.color : colors.mutedForeground }]}>{z.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {compatA !== compatB && (
              <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 20 }]}>
                <View style={styles.scoreTop}>
                  <View style={{ alignItems: "center" }}>
                    <Text style={styles.scoreEmoji}>{ZODIAC_SIGNS.find(z=>z.id===compatA)?.emoji}</Text>
                    <Text style={[styles.scoreName, { color: colors.foreground }]}>{ZODIAC_SIGNS.find(z=>z.id===compatA)?.name}</Text>
                  </View>
                  <View style={[styles.scoreCircle, { borderColor: score >= 80 ? "#22C55E" : score >= 60 ? "#FFB800" : "#FF5252" }]}>
                    <Text style={[styles.scoreNumber, { color: score >= 80 ? "#22C55E" : score >= 60 ? "#FFB800" : "#FF5252" }]}>{score}%</Text>
                    <Text style={[styles.scoreHeart, { color: colors.mutedForeground }]}>match</Text>
                  </View>
                  <View style={{ alignItems: "center" }}>
                    <Text style={styles.scoreEmoji}>{ZODIAC_SIGNS.find(z=>z.id===compatB)?.emoji}</Text>
                    <Text style={[styles.scoreName, { color: colors.foreground }]}>{signBName}</Text>
                  </View>
                </View>

                <View style={[styles.scoreDivider, { backgroundColor: colors.border }]} />

                <Text style={[styles.scoreDesc, { color: colors.foreground }]}>
                  {score >= 80
                    ? `${ZODIAC_SIGNS.find(z=>z.id===compatA)?.name} and ${signBName} are a cosmic dream team. Deep understanding, strong attraction, and natural harmony make this one of the best pairings in the zodiac.`
                    : score >= 60
                    ? `${ZODIAC_SIGNS.find(z=>z.id===compatA)?.name} and ${signBName} have solid potential. With effort and communication, this pair can build something lasting and meaningful.`
                    : `${ZODIAC_SIGNS.find(z=>z.id===compatA)?.name} and ${signBName} may clash at first, but opposites can attract! Growth comes from learning each other's differences.`}
                </Text>

                {[
                  { label: "Love",          score: score,                     icon: "💕" },
                  { label: "Trust",         score: Math.min(100, score + 5),  icon: "🤝" },
                  { label: "Communication", score: Math.max(30, score - 8),   icon: "💬" },
                  { label: "Shared Values", score: Math.min(100, score + 10), icon: "🌱" },
                ].map((cat) => (
                  <View key={cat.label} style={styles.catRow}>
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                    <Text style={[styles.catLabel, { color: colors.mutedForeground }]}>{cat.label}</Text>
                    <View style={[styles.catBar, { backgroundColor: colors.muted }]}>
                      <View style={[styles.catFill, {
                        width: `${cat.score}%` as any,
                        backgroundColor: cat.score >= 80 ? "#22C55E" : cat.score >= 60 ? "#FFB800" : "#FF5252",
                      }]} />
                    </View>
                    <Text style={[styles.catScore, { color: colors.mutedForeground }]}>{cat.score}%</Text>
                  </View>
                ))}

                <Pressable onPress={() => router.push("/match" as any)} style={[styles.findMatchBtn, { backgroundColor: "#E91E8C" }]}>
                  <Text style={styles.findMatchText}>Find {signBName} Matches 💕</Text>
                </Pressable>
              </View>
            )}

            {compatA === compatB && (
              <View style={[styles.sameSignCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 20 }]}>
                <Text style={{ fontSize: 40 }}>{ZODIAC_SIGNS.find(z=>z.id===compatA)?.emoji}</Text>
                <Text style={[styles.sameSignText, { color: colors.foreground }]}>Same sign energy!</Text>
                <Text style={[styles.sameSignSub, { color: colors.mutedForeground }]}>
                  Two {ZODIAC_SIGNS.find(z=>z.id===compatA)?.name}s together — you understand each other perfectly, but may amplify each other's intensity!
                </Text>
              </View>
            )}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: { paddingHorizontal: 20, paddingBottom: 0 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.1)" },
  refreshBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.1)" },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff", textAlign: "center" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.55)", textAlign: "center", marginTop: 2 },

  tabRow: { flexDirection: "row", gap: 8, paddingBottom: 16 },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)" },
  tabBtnActive: { backgroundColor: "rgba(255,255,255,0.18)" },
  tabEmoji: { fontSize: 14 },
  tabLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  // live badge
  liveBadgeRow: { paddingHorizontal: 16, marginBottom: 10 },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, alignSelf: "flex-start" },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#22C55E" },
  liveBadgeText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  retryText: { fontSize: 12, fontFamily: "Inter_700Bold", marginLeft: 4, textDecorationLine: "underline" },

  // sign picker
  signScroll: { paddingHorizontal: 16, gap: 8, paddingBottom: 8 },
  signPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  signPillEmoji: { fontSize: 15 },
  signPillName: { fontSize: 12, fontFamily: "Inter_600SemiBold" },

  // horoscope card
  horoCard: { borderRadius: 20, borderWidth: 1, padding: 18, gap: 14 },
  horoCardTop: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  signBigEmoji: { width: 64, height: 64, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 1.5, flexShrink: 0 },
  signBigEmojiText: { fontSize: 32 },
  horoSignName: { fontSize: 22, fontFamily: "Inter_700Bold" },
  horoSignDates: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  starsRow: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 6 },
  horoRatingText: { fontSize: 11, fontFamily: "Inter_400Regular", marginLeft: 4 },
  horoSection: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12, gap: 8 },
  horoSectionIcon: { flexDirection: "row", alignItems: "center", gap: 6 },
  horoSectionTitle: { fontSize: 13, fontFamily: "Inter_700Bold", flex: 1 },
  liveTag: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  liveTagDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#22C55E" },
  liveTagText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  horoText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  skeletonBlock: { gap: 8, paddingVertical: 4 },
  skeletonLine: { height: 13, borderRadius: 6, opacity: 0.4 },
  horoMetaRow: { flexDirection: "row", gap: 8, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12 },
  horoMeta: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 10, alignItems: "center", gap: 3 },
  horoMetaLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  horoMetaVal: { fontSize: 12, fontFamily: "Inter_700Bold" },
  shareRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderRadius: 12, paddingVertical: 10 },
  shareText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  // shared
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, marginBottom: 6 },
  nearbyCard: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  nearbyRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  nearbyName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  nearbyCity: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  nearbySign: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },

  // vibe
  vibeHeading: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 4 },
  vibeSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 16, lineHeight: 19 },
  vibeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  vibeCard: { width: (width - 52) / 2, borderRadius: 16, borderWidth: 1.5, padding: 14, gap: 4, overflow: "hidden" },
  vibeEmoji: { fontSize: 28 },
  vibeLabel: { fontSize: 14, fontFamily: "Inter_700Bold" },
  vibeCount: { fontSize: 11, fontFamily: "Inter_400Regular" },
  vibePill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  vibePillText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  emptyBox: { borderRadius: 16, borderWidth: 1, borderStyle: "dashed", padding: 24, alignItems: "center", gap: 8, marginTop: 8 },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },

  // compat
  compatPair: { gap: 8 },
  compatSignBtn: { alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, minWidth: 62 },
  compatSignName: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  scoreCard: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 14 },
  scoreTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  scoreEmoji: { fontSize: 36 },
  scoreName: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginTop: 4 },
  scoreCircle: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  scoreNumber: { fontSize: 24, fontFamily: "Inter_700Bold" },
  scoreHeart: { fontSize: 11, fontFamily: "Inter_400Regular" },
  scoreDivider: { height: 1 },
  scoreDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  catRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  catIcon: { fontSize: 15, width: 22, textAlign: "center" },
  catLabel: { fontSize: 12, fontFamily: "Inter_400Regular", width: 110 },
  catBar: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  catFill: { height: 6, borderRadius: 3 },
  catScore: { fontSize: 11, fontFamily: "Inter_600SemiBold", width: 34, textAlign: "right" },
  findMatchBtn: { borderRadius: 12, paddingVertical: 13, alignItems: "center", marginTop: 4 },
  findMatchText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  sameSignCard: { borderRadius: 20, borderWidth: 1, padding: 24, alignItems: "center", gap: 10 },
  sameSignText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  sameSignSub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
});
