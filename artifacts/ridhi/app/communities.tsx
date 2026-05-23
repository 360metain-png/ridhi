import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { SeoHead } from "@/components/SeoHead";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { CATEGORIES, COMMUNITIES, Community } from "@/data/communities";

const EMOJIS = ["🎵", "🎮", "💪", "🍛", "🌍", "📸", "💃", "🏏", "🎨", "📚", "🚀", "🌸"];
const COMMUNITY_CATEGORIES = ["Social", "Gaming", "Fitness", "Food", "Travel", "Fashion", "Music", "Tech"];

const { width } = Dimensions.get("window");

function CommunityCard({ community, onJoin }: { community: Community; onJoin: (id: string) => void }) {
  const colors = useColors();
  const fmtMembers = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);

  return (
    <Pressable
      onPress={() => router.push("/chatrooms" as any)}
      style={({ pressed }) => [styles.card, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 }]}
      accessibilityLabel={`Open ${community.name} community`}
      accessibilityRole="button"
    >
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
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newEmoji, setNewEmoji] = useState("🎵");
  const [newCategory, setNewCategory] = useState("Social");
  const [creating, setCreating] = useState(false);

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

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    await new Promise((r) => setTimeout(r, 900));
    const newCommunity: Community = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim() || "A new community on Ridhi",
      emoji: newEmoji,
      gradient: ["#E91E8C", "#7B2FBE"] as [string, string],
      members: 1,
      category: newCategory.toLowerCase(),
      isPrivate: false,
      isJoined: true,
      language: "English",
    };
    setCommunities((prev) => [newCommunity, ...prev]);
    setCreating(false);
    setShowCreate(false);
    setNewName("");
    setNewDesc("");
    setNewEmoji("🎵");
    setNewCategory("Social");
    Alert.alert("Community Created! 🎉", `"${newCommunity.name}" is now live. Share it with friends to grow your community.`, [{ text: "OK" }]);
  };

  return (
    <>
      <SeoHead
        title="Ridhi Communities — Join Interest Groups, Local Circles & Fan Clubs | India"
        description="Join 50+ communities on Ridhi — local city groups, language circles, hobby clubs, and fan communities. Connect with like-minded people across India."
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowCreate(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.surface }]} onPress={() => {}}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Create Community</Text>

            <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Choose an emoji</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiRow}>
              {EMOJIS.map((e) => (
                <Pressable
                  key={e}
                  onPress={() => setNewEmoji(e)}
                  style={[styles.emojiBtn, newEmoji === e && { backgroundColor: colors.primary + "20", borderColor: colors.primary }]}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Community Name *</Text>
            <TextInput
              style={[styles.modalInput, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
              placeholder="e.g. Mumbai Chai Lovers"
              placeholderTextColor={colors.mutedForeground}
              value={newName}
              onChangeText={setNewName}
              maxLength={40}
            />

            <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Description</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
              placeholder="What is this community about?"
              placeholderTextColor={colors.mutedForeground}
              value={newDesc}
              onChangeText={setNewDesc}
              multiline
              maxLength={120}
            />

            <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catSelectRow}>
              {COMMUNITY_CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setNewCategory(cat)}
                  style={[
                    styles.catSelectPill,
                    newCategory === cat
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: colors.muted, borderColor: colors.border, borderWidth: 1 },
                  ]}
                >
                  <Text style={[styles.catSelectText, { color: newCategory === cat ? "#fff" : colors.foreground }]}>{cat}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable
              onPress={handleCreate}
              disabled={!newName.trim() || creating}
              style={[styles.createSubmitBtn, { backgroundColor: !newName.trim() ? colors.muted : colors.primary }]}
            >
              <Text style={[styles.createSubmitText, { color: !newName.trim() ? colors.mutedForeground : "#fff" }]}>
                {creating ? "Creating..." : "Create Community"}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

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
        <Pressable
          onPress={() => setShowCreate(true)}
          style={[styles.createBtn, { backgroundColor: colors.primary }]}
          accessibilityLabel="Create a new community"
        >
          <Feather name="plus" size={18} color="#fff" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 84 : insets.bottom + 20 }}>
        {joined.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My Communities</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.myRow}>
              {joined.map((c) => (
                <Pressable
                  key={c.id}
                  style={styles.myCard}
                  onPress={() => router.push("/chatrooms" as any)}
                  accessibilityLabel={`Open ${c.name}`}
                >
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
    </>
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
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    gap: 12,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 4 },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 4 },
  modalLabel: { fontSize: 12, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.6 },
  modalInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  modalTextArea: { minHeight: 72, textAlignVertical: "top" },
  emojiRow: { gap: 8, paddingVertical: 4 },
  emojiBtn: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "transparent" },
  emojiText: { fontSize: 22 },
  catSelectRow: { gap: 8, paddingVertical: 4 },
  catSelectPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  catSelectText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  createSubmitBtn: { borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  createSubmitText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
