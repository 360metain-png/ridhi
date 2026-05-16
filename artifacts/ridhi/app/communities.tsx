import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
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
import { CATEGORIES, COMMUNITIES, Community } from "@/data/communities";

const { width } = Dimensions.get("window");

function CommunityCard({ community, onJoin }: { community: Community; onJoin: (id: string) => void }) {
  const colors = useColors();
  const fmtMembers = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);

  return (
    <Pressable style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <LinearGradient colors={community.gradient} style={styles.cardBanner}>
        <Text style={styles.cardEmoji}>{community.emoji}</Text>
        {community.isPrivate && (
          <View style={styles.privateBadge}>
            <Feather name="lock" size={10} color="#fff" />
            <Text style={styles.privateText}>Private</Text>
          </View>
        )}
      </LinearGradient>
      <View style={styles.cardBody}>
        <Text style={[styles.cardName, { color: colors.foreground }]} numberOfLines={1}>
          {community.name}
        </Text>
        <Text style={[styles.cardDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
          {community.description}
        </Text>
        <View style={styles.cardFooter}>
          <View style={styles.cardMeta}>
            <Feather name="users" size={12} color={colors.mutedForeground} />
            <Text style={[styles.cardMetaText, { color: colors.mutedForeground }]}>
              {fmtMembers(community.members)} members
            </Text>
          </View>
          <Pressable
            onPress={() => onJoin(community.id)}
            style={[
              styles.joinBtn,
              community.isJoined
                ? { backgroundColor: colors.muted }
                : { backgroundColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.joinText,
                { color: community.isJoined ? colors.foreground : "#fff" },
              ]}
            >
              {community.isJoined ? "Joined" : "Join"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export default function CommunitiesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState("all");
  const [communities, setCommunities] = useState(COMMUNITIES);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = activeCategory === "all"
    ? communities
    : communities.filter((c) => c.category === activeCategory);

  const joined = communities.filter((c) => c.isJoined);

  const handleJoin = (id: string) => {
    setCommunities((prev) =>
      prev.map((c) => c.id === id ? { ...c, isJoined: !c.isJoined } : c)
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 10,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Communities</Text>
        <Pressable style={[styles.createBtn, { backgroundColor: colors.primary }]}>
          <Feather name="plus" size={18} color="#fff" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 84 : 20 }}>
        {joined.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My Communities</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.myRow}>
              {joined.map((c) => (
                <Pressable key={c.id} style={styles.myCard}>
                  <LinearGradient colors={c.gradient} style={styles.myCardBg}>
                    <Text style={styles.myCardEmoji}>{c.emoji}</Text>
                  </LinearGradient>
                  <Text style={[styles.myCardName, { color: colors.foreground }]} numberOfLines={1}>
                    {c.name.split(" ")[0]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Browse Communities</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                style={[
                  styles.catPill,
                  activeCategory === cat.id
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: colors.muted, borderColor: colors.border, borderWidth: 1 },
                ]}
              >
                <Text
                  style={[
                    styles.catText,
                    { color: activeCategory === cat.id ? "#fff" : colors.foreground },
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.grid}>
          {filtered.map((c) => (
            <CommunityCard key={c.id} community={c} onJoin={handleJoin} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const CARD_WIDTH = (width - 48) / 2;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", flex: 1 },
  createBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  section: { paddingTop: 20 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", paddingHorizontal: 16, marginBottom: 12 },
  myRow: { paddingHorizontal: 16, gap: 14 },
  myCard: { alignItems: "center", gap: 6, width: 68 },
  myCardBg: { width: 60, height: 60, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  myCardEmoji: { fontSize: 26 },
  myCardName: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  catRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  catPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  catText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 16, paddingTop: 16 },
  card: {
    width: CARD_WIDTH,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardBanner: { height: 80, alignItems: "flex-end", justifyContent: "flex-start", padding: 8 },
  cardEmoji: { fontSize: 32, position: "absolute", bottom: 8, left: 12 },
  privateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  privateText: { color: "#fff", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  cardBody: { padding: 12, gap: 6 },
  cardName: { fontSize: 13, fontFamily: "Inter_700Bold" },
  cardDesc: { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 16 },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 3 },
  cardMetaText: { fontSize: 10, fontFamily: "Inter_400Regular" },
  joinBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  joinText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
