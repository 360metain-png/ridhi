import React, { useState, useRef, useCallback } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

// ── Indian music library data ───────────────────────────────────────────────────────
const MUSIC_CATEGORIES = [
  { id: "trending", label: "🔥 Trending", color: "#FF6B35" },
  { id: "bollywood", label: "🎬 Bollywood", color: "#E91E8C" },
  { id: "tollywood", label: "🌟 Tollywood", color: "#7B2FBE" },
  { id: "kollywood", label: "🎭 Kollywood", color: "#4A90E2" },
  { id: "punjabi", label: "🥁 Punjabi", color: "#FFB800" },
  { id: "bhojpuri", label: "🎤 Bhojpuri", color: "#34C759" },
  { id: "folk", label: "🪕 Folk", color: "#FF6B35" },
  { id: "devotional", label: "🙏 Devotional", color: "#8E44AD" },
  { id: "indie", label: "🎸 Indie", color: "#FF4757" },
  { id: "classical", label: "🎵 Classical", color: "#2C3E50" },
] as const;

const SOUNDS = [
  { id: "s1", title: "Chammak Challo", artist: "Akon & Vishal-Shekhar", duration: "3:45", plays: 1240000, category: "bollywood", thumbnail: "🎬" },
  { id: "s2", title: "Kala Chashma", artist: "Amar Arshi & Badshah", duration: "3:12", plays: 2100000, category: "bollywood", thumbnail: "🎬" },
  { id: "s3", title: "Aashiqui 2 Mashup", artist: "Mithoon & Jeet", duration: "4:30", plays: 890000, category: "bollywood", thumbnail: "🎬" },
  { id: "s4", title: "Butta Bomma", artist: "Armaan Malik", duration: "3:28", plays: 1500000, category: "tollywood", thumbnail: "🌟" },
  { id: "s5", title: "Ramuloo Ramulaa", artist: "Anurag Kulkarni", duration: "3:55", plays: 980000, category: "tollywood", thumbnail: "🌟" },
  { id: "s6", title: "Rowdy Baby", artist: "Dhanush & Dhee", duration: "4:05", plays: 2300000, category: "kollywood", thumbnail: "🎭" },
  { id: "s7", title: "Vaathi Coming", artist: "Anirudh Ravichander", duration: "3:42", plays: 1100000, category: "kollywood", thumbnail: "🎭" },
  { id: "s8", title: "Lamberghini", artist: "The Doorbeen", duration: "3:15", plays: 1800000, category: "punjabi", thumbnail: "🥁" },
  { id: "s9", title: "Daru Badnaam", artist: "Kamal Kahlon & Param Singh", duration: "3:22", plays: 950000, category: "punjabi", thumbnail: "🥁" },
  { id: "s10", title: "Lollipop Lagelu", artist: "Pawan Singh", duration: "3:50", plays: 760000, category: "bhojpuri", thumbnail: "🎤" },
  { id: "s11", title: "Rajasthani Folk Beat", artist: "Traditional", duration: "2:45", plays: 340000, category: "folk", thumbnail: "🪕" },
  { id: "s12", title: "Mundian To Bach Ke", artist: "Panjabi MC", duration: "3:58", plays: 650000, category: "punjabi", thumbnail: "🥁" },
  { id: "s13", title: "Hanuman Chalisa", artist: "Gulshan Kumar", duration: "9:42", plays: 420000, category: "devotional", thumbnail: "🙏" },
  { id: "s14", title: "Prateek Kuhad - Cold/Mess", artist: "Prateek Kuhad", duration: "4:15", plays: 520000, category: "indie", thumbnail: "🎸" },
  { id: "s15", title: "Raag Yaman", artist: "Pt. Ravi Shankar", duration: "12:30", plays: 180000, category: "classical", thumbnail: "🎵" },
  { id: "s16", title: "Srivalli", artist: "Javed Ali", duration: "3:38", plays: 1900000, category: "tollywood", thumbnail: "🌟" },
  { id: "s17", title: "Naatu Naatu", artist: "Rahul Sipligunj", duration: "3:35", plays: 3400000, category: "tollywood", thumbnail: "🌟" },
  { id: "s18", title: "Kesariya", artist: "Arijit Singh", duration: "4:28", plays: 2800000, category: "bollywood", thumbnail: "🎬" },
  { id: "s19", title: "Apna Bana Le", artist: "Arijit Singh", duration: "4:20", plays: 1500000, category: "bollywood", thumbnail: "🎬" },
  { id: "s20", title: "Munjhe", artist: "Bhojpuri Beats", duration: "3:15", plays: 280000, category: "bhojpuri", thumbnail: "🎤" },
] as const;

function fmtCount(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export default function MusicLibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const topPad = insets.top + 8;

  const filtered = SOUNDS.filter((s) => {
    const matchesCategory = activeCategory === "trending" || s.category === activeCategory;
    const matchesSearch =
      searchQuery.length === 0 ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => (activeCategory === "trending" ? b.plays - a.plays : 0));

  const toggleFav = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const useSound = (sound: (typeof SOUNDS)[number]) => {
    router.push({
      pathname: "/create-post",
      params: {
        soundId: sound.id,
        soundTitle: sound.title,
        soundArtist: sound.artist,
        type: "reel",
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={[colors.primary + "15", colors.background]} style={{ paddingTop: topPad }}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: 16 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>
            <Text style={{ color: colors.primary }}>🎵</Text> Music Library
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search */}
        <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]} placeholder="Search songs, artists..."
            placeholderTextColor={colors.mutedForeground} value={searchQuery} onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {/* Category pills */}
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 12 }}
        >
          {MUSIC_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setActiveCategory(cat.id)}
              style={[styles.catPill, {
                backgroundColor: activeCategory === cat.id ? colors.primary : colors.card,
                borderColor: activeCategory === cat.id ? colors.primary : colors.border,
              }]}
            >
              <Text style={{ fontSize: 14, color: activeCategory === cat.id ? "#fff" : colors.foreground, fontFamily: "Inter_600SemiBold" }}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Track list */}
      <FlatList
        data={filtered}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        renderItem={({ item, index }) => {
          const isPlaying = playingId === item.id;
          const isFav = favorites.includes(item.id);
          return (
            <Pressable
              style={[styles.trackRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {/* Thumbnail */}
              <View style={[styles.trackThumb, { backgroundColor: colors.primary + "15" }]}>
                <Text style={{ fontSize: 24 }}>{item.thumbnail}</Text>
              </View>

              {/* Info */}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.trackTitle, { color: colors.foreground }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.trackArtist, { color: colors.mutedForeground }]} numberOfLines={1}>{item.artist}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }}>
                  <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
                    {item.duration}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
                    • {fmtCount(item.plays)} uses
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Pressable onPress={() => toggleFav(item.id)} style={{ padding: 6 }}>
                  <Feather name="heart" size={20} color={isFav ? colors.primary : colors.mutedForeground} />
                </Pressable>
                <Pressable onPress={() => setPlayingId(isPlaying ? null : item.id)} style={[styles.playBtn, { backgroundColor: colors.primary }]}>
                  <Feather name={isPlaying ? "pause" : "play"} size={16} color="#fff" style={{ marginLeft: isPlaying ? 0 : 2 }} />
                </Pressable>
                <Pressable
                  onPress={() => useSound(item)}
                  style={[styles.useBtn, { backgroundColor: colors.secondary + "20" }]}
                >
                  <Text style={{ fontSize: 12, color: colors.secondary, fontFamily: "Inter_600SemiBold" }}>Use</Text>
                </Pressable>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 40 }}>🎵</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No sounds found</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Try a different search or category</Text>
          </View>
        }
      />

      {/* Floating "My Sounds" FAB */}
      <Pressable
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 16 }]}
        onPress={() => router.push("/create-post?type=reel")}
      >
        <Feather name="mic" size={22} color="#fff" />
        <Text style={{ fontSize: 13, color: "#fff", fontFamily: "Inter_600SemiBold", marginLeft: 6 }}>Record</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  searchWrap: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  catPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  trackRow: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  trackThumb: { width: 48, height: 48, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  trackTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  trackArtist: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  playBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  useBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  fab: { position: "absolute", right: 16, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginTop: 12 },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4 },
});
