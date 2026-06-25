import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Pressable,
  Share,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { MOCK_EVENTS } from "@/data/mockData";
import { GradientButton } from "@/components/GradientButton";

const { width } = Dimensions.get("window");

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  
  const event = MOCK_EVENTS.find(e => e.id === id);
  const [rsvpStatus, setRsvpStatus] = useState<"none" | "going" | "interested" | "not_going">("none");

  if (!event) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.foreground }}>Event not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this event: ${event.title} at ${event.location} on ${event.date}. Join me on Ridhi!`,
      });
    } catch (error) {
      Alert.alert("Error sharing event");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: event.image }} style={styles.headerImage} />
          <LinearGradient colors={["rgba(0,0,0,0.6)", "transparent"]} style={[styles.topOverlay, { paddingTop: insets.top }]}>
            <Pressable onPress={() => router.back()} style={styles.iconBtn}>
              <Feather name="arrow-left" size={24} color="#fff" />
            </Pressable>
            <Pressable onPress={handleShare} style={styles.iconBtn}>
              <Feather name="share-2" size={24} color="#fff" />
            </Pressable>
          </LinearGradient>
          {event.isOnline && (
            <View style={[styles.onlineTag, { backgroundColor: colors.primary }]}>
              <Text style={styles.onlineTagText}>Online Event</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.categoryBadge}>
            <Text style={[styles.categoryText, { color: colors.primary }]}>{event.category}</Text>
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>{event.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={[styles.metaIcon, { backgroundColor: colors.primary + "15" }]}>
              <Feather name="calendar" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.metaTitle, { color: colors.foreground }]}>{event.date}</Text>
              <Text style={[styles.metaSub, { color: colors.mutedForeground }]}>{event.time}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.metaIcon, { backgroundColor: colors.primary + "15" }]}>
              <Feather name="map-pin" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.metaTitle, { color: colors.foreground }]}>{event.location}</Text>
              <Text style={[styles.metaSub, { color: colors.mutedForeground }]}>{event.city}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About Event</Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>{event.description}</Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.attendeesHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Attendees ({event.attendees.length})</Text>
            <Pressable onPress={() => Alert.alert("Attendees", `View all ${event.attendees.length} attendees`)}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.attendeesList}>
            {event.attendees.map((a) => (
              <View key={a.id} style={styles.attendeeItem}>
                <View style={[styles.attendeeAvatar, { backgroundColor: colors.muted }]}>
                  <Text style={{ fontSize: 18 }}>👤</Text>
                </View>
                <Text style={[styles.attendeeName, { color: colors.foreground }]} numberOfLines={1}>{a.name}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Map Placeholder */}
          {!event.isOnline && (
            <View style={styles.mapContainer}>
              <View style={[styles.mapPlaceholder, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                 <Feather name="map" size={32} color={colors.mutedForeground} />
                 <Text style={[styles.mapText, { color: colors.mutedForeground }]}>Map Location Placeholder</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* RSVP Actions */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.rsvpOptions}>
           <Pressable 
             onPress={() => setRsvpStatus("going")}
             style={[styles.rsvpBtn, rsvpStatus === "going" && { backgroundColor: colors.primary }]}
           >
             <Text style={[styles.rsvpBtnText, { color: rsvpStatus === "going" ? "#fff" : colors.mutedForeground }]}>Going</Text>
           </Pressable>
           <Pressable 
             onPress={() => setRsvpStatus("interested")}
             style={[styles.rsvpBtn, rsvpStatus === "interested" && { backgroundColor: colors.primary }]}
           >
             <Text style={[styles.rsvpBtnText, { color: rsvpStatus === "interested" ? "#fff" : colors.mutedForeground }]}>Interested</Text>
           </Pressable>
           <Pressable 
             onPress={() => setRsvpStatus("not_going")}
             style={[styles.rsvpBtn, rsvpStatus === "not_going" && { backgroundColor: colors.primary }]}
           >
             <Text style={[styles.rsvpBtnText, { color: rsvpStatus === "not_going" ? "#fff" : colors.mutedForeground }]}>No</Text>
           </Pressable>
        </View>
        <GradientButton 
          label={rsvpStatus === "none" ? "RSVP Now" : "Update RSVP"} 
          onPress={() => Alert.alert("RSVP Recorded", "Your response has been saved!")} 
          style={{ flex: 1, marginLeft: 12 }} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageContainer: { width: "100%", height: 280, position: "relative" },
  headerImage: { width: "100%", height: "100%" },
  topOverlay: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.3)", alignItems: "center", justifyContent: "center" },
  onlineTag: { position: "absolute", bottom: 16, left: 16, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  onlineTagText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  content: { padding: 20 },
  categoryBadge: { marginBottom: 8 },
  categoryText: { fontSize: 13, fontWeight: "bold", textTransform: "uppercase" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  metaRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
  metaIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  metaTitle: { fontSize: 16, fontWeight: "600" },
  metaSub: { fontSize: 13 },
  divider: { height: 1, marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  description: { fontSize: 15, lineHeight: 22 },
  attendeesHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  seeAll: { fontSize: 14, fontWeight: "600" },
  attendeesList: { gap: 16 },
  attendeeItem: { alignItems: "center", width: 60 },
  attendeeAvatar: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  attendeeName: { fontSize: 11, textAlign: "center" },
  mapContainer: { marginTop: 20, borderRadius: 16, overflow: "hidden" },
  mapPlaceholder: { width: "100%", height: 150, borderWidth: 1, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 8 },
  mapText: { fontSize: 12 },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.05)" },
  rsvpOptions: { flexDirection: "row", gap: 6 },
  rsvpBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "rgba(0,0,0,0.1)" },
  rsvpBtnText: { fontSize: 13, fontWeight: "600" },
});
