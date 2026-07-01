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
  Modal,
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

const { width } = Dimensions.get("window");

const CATEGORIES = ["All", "Music", "Food", "Sports", "Tech", "Art", "Social", "Dating"];

export default function EventsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // Filter events
  const filteredEvents = useMemo(() => {
    return MOCK_EVENTS.filter((event) => {
      const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) || 
                            event.location.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || event.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const trendingEvents = useMemo(() => filteredEvents.filter(e => e.isTrending), [filteredEvents]);
  const localEvents = useMemo(() => filteredEvents.filter(e => e.city === user?.city), [filteredEvents, user?.city]);
  const otherEvents = useMemo(() => filteredEvents.filter(e => !e.isTrending && e.city !== user?.city), [filteredEvents, user?.city]);

  const renderEventCard = (event: RidhiEvent) => (
    <Pressable
      key={event.id}
      style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/event-detail?id=${event.id}`)}
    >
      <Image source={{ uri: event.image }} style={styles.eventImage} />
      {event.isOnline && (
        <View style={[styles.onlineBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.onlineBadgeText}>Online</Text>
        </View>
      )}
      <View style={styles.eventInfo}>
        <Text style={[styles.eventTitle, { color: colors.foreground }]} numberOfLines={1}>{event.title}</Text>
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
          <Pressable style={[styles.rsvpMiniBtn, { backgroundColor: colors.primary + "15" }]} onPress={() => Alert.alert("RSVP", "You're now interested in this event")}>
            <Text style={[styles.rsvpMiniText, { color: colors.primary }]}>Interested</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PrivateHead />
      <LinearGradient colors={[colors.primary, colors.secondary]} style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Events & Meetups</Text>
          <Pressable onPress={() => setCreateModalVisible(true)} style={styles.createBtnHeader}>
            <Feather name="plus" size={20} color="#fff" />
          </Pressable>
          <Pressable onPress={() => router.push("/events-nearby")} style={styles.createBtnHeader}>
            <Feather name="map-pin" size={20} color="#fff" />
          </Pressable>
        </View>
        
        <View style={styles.searchBarWrap}>
          <View style={[styles.searchBar, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="search" size={18} color="#fff" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events, locations..."
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryTab,
                selectedCategory === cat && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
            >
              <Text style={[styles.categoryTabText, { color: selectedCategory === cat ? "#fff" : colors.mutedForeground }]}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Trending Section */}
        {trendingEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Trending Events</Text>
              <Feather name="trending-up" size={16} color={colors.primary} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
              {trendingEvents.map(renderEventCard)}
            </ScrollView>
          </View>
        )}

        {/* Near You Section */}
        {localEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Near {user?.city || "You"}</Text>
              <Feather name="map-pin" size={16} color={colors.primary} />
            </View>
            <View style={styles.gridWrap}>
              {localEvents.map(renderEventCard)}
            </View>
          </View>
        )}

        {/* Explore More Section */}
        {otherEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, marginLeft: 16, marginBottom: 12 }]}>Explore More</Text>
            <View style={styles.gridWrap}>
              {otherEvents.map(renderEventCard)}
            </View>
          </View>
        )}

        {filteredEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="calendar" size={48} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No events found matching your criteria.</Text>
          </View>
        )}
      </ScrollView>

      {/* Create Event Modal (Simplified placeholder) */}
      <Modal visible={createModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
           <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Create Event</Text>
                <Pressable onPress={() => setCreateModalVisible(false)}>
                  <Feather name="x" size={24} color={colors.foreground} />
                </Pressable>
              </View>
              <ScrollView style={{ padding: 20 }}>
                 <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Event Title</Text>
                 <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Enter title" placeholderTextColor={colors.muted} />
                 
                 <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Date & Time</Text>
                 <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="e.g. 25 Oct 2026, 06:00 PM" placeholderTextColor={colors.muted} />

                 <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Location</Text>
                 <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="Venue name, city" placeholderTextColor={colors.muted} />

                 <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Description</Text>
                 <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground, height: 80 }]} multiline placeholder="What's the event about?" placeholderTextColor={colors.muted} />

                 <GradientButton
                   label="Post Event"
                   onPress={() => {
                     Alert.alert(
                       "Host Event",
                       "Hosting an event costs 500 Ridhi Coins. Your event will be reviewed within 24 hours.",
                       [
                         { text: "Cancel", style: "cancel", onPress: () => setCreateModalVisible(false) },
                         { text: "Pay 500 Coins", onPress: () => setCreateModalVisible(false) },
                       ]
                     );
                   }}
                   style={{ marginTop: 20 }}
                 />
              </ScrollView>
           </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  createBtnHeader: { width: 40, height: 40, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20 },
  searchBarWrap: { marginTop: 4 },
  searchBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, height: 44, borderRadius: 12 },
  searchInput: { flex: 1, marginLeft: 8, color: "#fff", fontSize: 15 },
  categoriesScroll: { marginVertical: 16, maxHeight: 40 },
  categoryTab: { paddingHorizontal: 16, height: 34, borderRadius: 17, borderWidth: 1, borderColor: "#ccc", marginRight: 8, justifyContent: "center" },
  categoryTabText: { fontSize: 14, fontWeight: "500" },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "bold" },
  eventCard: { width: width * 0.7, borderRadius: 16, overflow: "hidden", borderWidth: 1, marginBottom: 8 },
  eventImage: { width: "100%", height: 140 },
  onlineBadge: { position: "absolute", top: 12, left: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  onlineBadgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  eventInfo: { padding: 12 },
  eventTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 6 },
  eventMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  eventMetaText: { fontSize: 12 },
  cardActions: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  attendeesRow: { flexDirection: "row", alignItems: "center" },
  attendeeCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center", backgroundColor: "#eee" },
  attendeeCount: { fontSize: 10, marginLeft: 4 },
  rsvpMiniBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  rsvpMiniText: { fontSize: 11, fontWeight: "600" },
  gridWrap: { paddingHorizontal: 16, gap: 12 },
  emptyState: { alignItems: "center", marginTop: 40, gap: 12 },
  emptyText: { fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, height: "80%" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderBottomColor: "#eee" },
  modalTitle: { fontSize: 20, fontWeight: "bold" },
  inputLabel: { fontSize: 14, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 15 },
});
