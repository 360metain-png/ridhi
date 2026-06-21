import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Dimensions,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { PrivateHead } from "@/components/PrivateHead";
import { MOCK_CHANNELS, BroadcastChannel } from "@/data/mockData";
import { GradientButton } from "@/components/GradientButton";

const CATEGORIES = ["All", "General", "Creator", "Dating", "Community"];

export default function BroadcastScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [joinedChannels, setJoinedChannels] = useState<string[]>([]);

  const toggleJoin = (id: string) => {
    setJoinedChannels(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const filteredChannels = useMemo(() => {
    if (selectedCategory === "All") return MOCK_CHANNELS;
    return MOCK_CHANNELS.filter(c => c.category === selectedCategory);
  }, [selectedCategory]);

  const renderChannelItem = (channel: BroadcastChannel) => {
    const isJoined = joinedChannels.includes(channel.id);
    
    return (
      <Pressable
        key={channel.id}
        style={[styles.channelCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push(`/channel-detail?id=${channel.id}`)}
      >
        <View style={[styles.avatarContainer, { backgroundColor: colors.primary + "20" }]}>
          <Text style={{ fontSize: 24 }}>📢</Text>
        </View>
        
        <View style={styles.channelInfo}>
          <View style={styles.titleRow}>
            <Text style={[styles.channelName, { color: colors.foreground }]} numberOfLines={1}>{channel.name}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: colors.muted }]}>
              <Text style={[styles.categoryText, { color: colors.mutedForeground }]}>{channel.category}</Text>
            </View>
          </View>
          
          <Text style={[styles.creatorName, { color: colors.mutedForeground }]}>by {channel.creatorName}</Text>
          <Text style={[styles.statsText, { color: colors.mutedForeground }]}>
            {channel.subscribers.toLocaleString()} subscribers
          </Text>
          
          {channel.lastMessage && (
            <Text style={[styles.lastMessage, { color: colors.mutedForeground }]} numberOfLines={1}>
              {channel.lastMessage}
            </Text>
          )}
        </View>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            toggleJoin(channel.id);
          }}
          style={[
            styles.joinBtn,
            isJoined ? { backgroundColor: colors.muted } : { backgroundColor: colors.primary }
          ]}
        >
          <Text style={[styles.joinBtnText, { color: isJoined ? colors.mutedForeground : "#fff" }]}>
            {isJoined ? "Joined" : "Join"}
          </Text>
        </Pressable>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PrivateHead />
      <LinearGradient colors={[colors.primary, colors.secondary]} style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Broadcast Channels</Text>
          <Pressable onPress={() => setCreateModalVisible(true)} style={styles.createBtnHeader}>
            <Feather name="plus" size={20} color="#fff" />
          </Pressable>
        </View>
        <Text style={styles.headerSub}>Discover and join your favorite creators' channels</Text>
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

        <View style={styles.channelList}>
          {filteredChannels.map(renderChannelItem)}
        </View>

        {filteredChannels.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="rss" size={48} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No channels found.</Text>
          </View>
        )}
      </ScrollView>

      {/* Create Channel Modal */}
      <Modal visible={createModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
           <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Create Channel</Text>
                <Pressable onPress={() => setCreateModalVisible(false)}>
                  <Feather name="x" size={24} color={colors.foreground} />
                </Pressable>
              </View>
              <ScrollView style={{ padding: 20 }}>
                 <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Channel Name</Text>
                 <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground }]} placeholder="e.g. My Updates" placeholderTextColor={colors.muted} />
                 
                 <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Description</Text>
                 <TextInput style={[styles.input, { borderColor: colors.border, color: colors.foreground, height: 80 }]} multiline placeholder="What's this channel about?" placeholderTextColor={colors.muted} />

                 <View style={[styles.infoBox, { backgroundColor: colors.primary + "10" }]}>
                    <Feather name="info" size={16} color={colors.primary} />
                    <Text style={[styles.infoText, { color: colors.primary }]}>Only you can send messages. Subscribers can react.</Text>
                 </View>

                 <GradientButton label="Create Channel" onPress={() => setCreateModalVisible(false)} style={{ marginTop: 20 }} />
              </ScrollView>
           </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginLeft: 4 },
  createBtnHeader: { width: 40, height: 40, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20 },
  categoriesScroll: { marginVertical: 20, maxHeight: 40 },
  categoryTab: { paddingHorizontal: 16, height: 34, borderRadius: 17, borderWidth: 1, borderColor: "#ccc", marginRight: 8, justifyContent: "center" },
  categoryTabText: { fontSize: 14, fontWeight: "500" },
  channelList: { paddingHorizontal: 16, gap: 12 },
  channelCard: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 16, borderWidth: 1 },
  avatarContainer: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  channelInfo: { flex: 1, marginLeft: 12, marginRight: 8 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  channelName: { fontSize: 16, fontWeight: "bold" },
  categoryBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  categoryText: { fontSize: 10, fontWeight: "bold" },
  creatorName: { fontSize: 12, marginBottom: 2 },
  statsText: { fontSize: 12, fontWeight: "500", marginBottom: 4 },
  lastMessage: { fontSize: 13, fontStyle: "italic" },
  joinBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  joinBtnText: { fontSize: 14, fontWeight: "bold" },
  emptyState: { alignItems: "center", marginTop: 40, gap: 12 },
  emptyText: { fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, height: "60%" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, borderBottomWidth: 1, borderBottomColor: "#eee" },
  modalTitle: { fontSize: 20, fontWeight: "bold" },
  inputLabel: { fontSize: 14, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 15 },
  infoBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12 },
  infoText: { fontSize: 12, flex: 1 },
});
