import React, { useState, useMemo } from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { PrivateHead } from "@/components/PrivateHead";
import { MOCK_EVENTS, RidhiEvent } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { GradientButton } from "@/components/GradientButton";
import { CoinBadge } from "@/components/CoinBadge";

const { width } = Dimensions.get("window");

const CATEGORIES = ["All", "Music", "Food", "Sports", "Tech", "Art", "Social", "Dating"];

export default function EventsNearbyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"nearby" | "trending" | "my">("nearby");

  const nearbyEvents = useMemo(() => {
    return MOCK_EVENTS.filter((e) => {
      const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
                            e.location.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || e.category === selectedCategory;
      const isNearby = e.city === user?.city;
      return matchesSearch && matchesCategory && isNearby;
    });
  }, [search, selectedCategory, user?.city]);

  const trendingEvents = useMemo(() => {
    return MOCK_EVENTS.filter((e) => {
      const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || e.category === selectedCategory;
      return matchesSearch && matchesCategory && e.isTrending;
    });
  }, [search, selectedCategory]);

  const renderEventCard = (event: RidhiEvent, featured = false) => (
    <Pressable
      key={event.id}
      style={[featured ? styles.featuredCard : styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/event-detail?id=${event.id}`)}
    >
      <Image source={{ uri: event.image }} style={featured ? styles.featuredImage : styles.eventImage} />
      {event.isOnline && (
        <View style={[styles.onlineBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.onlineBadgeText}>Online</Text>
        </View>
      )}
      <View style={featured ? styles.featuredInfo : styles.eventInfo}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <View style={[styles.categoryPill, { backgroundColor: colors.primary + "20" }]}>
            <Text style={[styles.categoryText, { color: colors.primary }]}>{event.category}</Text>
          </View>
          {event.isTrending && (
            <View style={[styles.trendingPill, { backgroundColor: colors.secondary + "20" }]}>
              <Feather name="trending-up" size={10} color={colors.secondary} />
              <Text style={[styles.trendingText, { color: colors.secondary }]}>Trending</Text>
            </View>
          )}
        </View>
        <Text style={[styles.eventTitle, { color: colors.foreground }]} numberOfLines={featured ? 2 : 1}>{event.title}</Text>
        <View style={styles.eventMeta}>
          <Feather name="calendar" size={12} color={colors.primary} />
          <Text style={[styles.eventMetaText, { color: colors.mutedForeground }]}>{event.date}</Text>
        </View>
        <View style={styles.eventMeta}>
          <Feather name="map-pin" size={12} color={colors.primary} />
          <Text style={[styles.eventMetaText, { color: colors.mutedForeground }]} numberOfLines={1}>{event.location}</Text>
        </View>
        <View style={styles.cardActions}>
          <View style={styles.attendeesRow}>
             {event.attendees.slice(0, 3).map((a, i) => (
               <View key={a.id} style={[styles.attendeeCircle, { marginLeft: i === 0 ? 0 : -8, borderColor: colors.card }]}>
                 <Text style={{ fontSize: 8 }}>👤</Text>
               </View>
             ))}
             {event.attendees.length > 3 && (
               <Text style={[styles.attendeeCount, { color: colors.mutedForeground }]}>+{event.attendees.length - 3}</Text>
             )}
          </View>
          <Pressable
            style={[styles.rsvpMiniBtn, { backgroundColor: colors.primary + "15" }]}
            onPress={() => Alert.alert("RSVP", "You're now interested in this event")}
          >
            <Text style={[styles.rsvpMiniText, { color: colors.primary }]}>Interested</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PrivateHead />
      <LinearGradient colors={[colors.primary, colors.secondary]} style={[styles.header, { paddingTop: topPad + 10 }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Nearby Events</Text>
          <CoinBadge amount={user?.coins ?? 0} size="sm" />
        </View>

        <View style={styles.searchBarWrap}>
          <View style={[styles.searchBar, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="search" size={16} color="rgba(255,255,255,0.8)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search nearby events..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>
      </LinearGradient>

      {/* Tab switcher */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {(["nearby", "trending", "my"] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setViewMode(tab)}
            style={[styles.tab, viewMode === tab && { borderBottomWidth: 2, borderBottomColor: colors.primary }]}
          >
            <Text style={[styles.tabText, { color: viewMode === tab ? colors.primary : colors.mutedForeground }]}>
              {tab === "nearby" ? "Nearby" : tab === "trending" ? "Trending" : "My Events"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Category pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[styles.categoryChip, { backgroundColor: selectedCategory === cat ? colors.primary : colors.muted, borderColor: selectedCategory === cat ? colors.primary : colors.border }]}
          >
            <Text style={[styles.categoryChipText, { color: selectedCategory === cat ? "#fff" : colors.mutedForeground }]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {viewMode === "nearby" && (
          <>
            {nearbyEvents.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="map-pin" size={48} color={colors.mutedForeground} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No nearby events</Text>
                <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Events happening in {user?.city ?? "your city"} will appear here</Text>
              </View>
            ) : (
              <>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>📍 Nearby in {user?.city}
                </Text>
                {nearbyEvents.slice(0, 2).map((e) => renderEventCard(e, true))}
                {nearbyEvents.slice(2).map((e) => renderEventCard(e))}
              </>
            )}
          </>
        )}

        {viewMode === "trending" && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>🔥 Trending Events</Text>
            {trendingEvents.map((e) => renderEventCard(e, true))}
          </>
        )}

        {viewMode === "my" && (
          <View style={styles.emptyState}>
            <Feather name="calendar" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No events yet</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Host an event for 500 coins to see it here</Text>
            <GradientButton label="Host Event" onPress={() => router.push("/events")} small style={{ marginTop: 16 }} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  searchBarWrap: { marginTop: 4 },
  searchBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, height: 44, borderRadius: 12 },
  searchInput: { flex: 1, marginLeft: 8, color: "#fff", fontSize: 15 },
  tabBar: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12 },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  categoryScroll: { paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  categoryChipText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  emptyState: { alignItems: "center", paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 16 },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 6, textAlign: "center" },
  featuredCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  featuredImage: { width: "100%", height: 180 },
  eventCard: { flexDirection: "row", marginHorizontal: 16, marginBottom: 10, borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  eventImage: { width: 100, height: 100 },
  onlineBadge: { position: "absolute", top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  onlineBadgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  featuredInfo: { padding: 14 },
  eventInfo: { flex: 1, padding: 12, justifyContent: "center" },
  eventTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  eventMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  eventMetaText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  cardActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  attendeesRow: { flexDirection: "row", alignItems: "center" },
  attendeeCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#f0f0f0", alignItems: "center", justifyContent: "center", borderWidth: 2 },
  attendeeCount: { fontSize: 11, fontFamily: "Inter_500Medium", marginLeft: 6 },
  rsvpMiniBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  rsvpMiniText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  categoryPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  categoryText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  trendingPill: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  trendingText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
});
