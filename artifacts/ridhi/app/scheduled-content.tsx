import React, { useState, useCallback, useEffect } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "@/hooks/useColors"
import { useTrackScreen } from "@/hooks/useAnalytics";
;
import { PrivateHead } from "@/components/PrivateHead";
import {
  ScheduledContent,
  ScheduledContentType,
  ScheduledStatus,
  timeUntilScheduled,
  formatScheduledDate,
  CONTENT_TYPE_ICONS,
  CONTENT_TYPE_LABELS,
  CONTENT_TYPE_COLORS,
  SCHEDULED_CONTENT_MOCK,
} from "@/data/scheduledContent";

const FILTER_TABS: { id: "all" | ScheduledStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Upcoming" },
  { id: "published", label: "Published" },
  { id: "failed", label: "Failed" },
  { id: "cancelled", label: "Cancelled" },
];

const STATUS_COLORS: Record<ScheduledStatus, string> = {
  pending: "#FFB800",
  published: "#34C759",
  failed: "#FF3B30",
  cancelled: "#9E9E9E",
};

const STATUS_LABELS: Record<ScheduledStatus, string> = {
  pending: "Scheduled",
  published: "Posted",
  failed: "Failed",
  cancelled: "Cancelled",
};

export default function ScheduledContentScreen() {
  useTrackScreen("scheduled_content");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"all" | ScheduledStatus>("all");
  const [items, setItems] = useState<ScheduledContent[]>(SCHEDULED_CONTENT_MOCK);

  // Load from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem("ridhi_scheduled").then((raw) => {
      if (raw) {
        const stored = JSON.parse(raw) as ScheduledContent[];
        setItems((prev) => [...stored, ...prev.filter((p) => !stored.find((s) => s.id === p.id))]);
      }
    });
  }, []);

  const filtered = items.filter((i) => (activeTab === "all" ? true : i.status === activeTab));

  const cancelItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "cancelled" as ScheduledStatus } : i))
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const renderItem = ({ item }: { item: ScheduledContent }) => {
    const isExpired = item.status === "published" || item.status === "failed" || item.status === "cancelled";
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Header row */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <View style={[styles.typeBadge, { backgroundColor: CONTENT_TYPE_COLORS[item.type] + "18" }]}>
            <Feather name={CONTENT_TYPE_ICONS[item.type] as any} size={14} color={CONTENT_TYPE_COLORS[item.type]} />
            <Text style={[styles.typeLabel, { color: CONTENT_TYPE_COLORS[item.type] }]}>
              {CONTENT_TYPE_LABELS[item.type]}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + "15" }]}>
            <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
            <Text style={[styles.statusLabel, { color: STATUS_COLORS[item.status] }]}>
              {STATUS_LABELS[item.status]}
            </Text>
          </View>
        </View>

        {/* Content */}
        <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={1}>
          {item.title || item.content}
        </Text>
        {item.content && item.title && (
          <Text style={[styles.itemDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
            {item.content}
          </Text>
        )}

        {/* Meta row */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 }}>
          <Feather name="clock" size={12} color={colors.mutedForeground} />
          <Text style={[styles.timeText, { color: colors.mutedForeground }]}>
            {isExpired ? formatScheduledDate(item.scheduledAt) : `In ${timeUntilScheduled(item)}`}
          </Text>
        </View>

        {/* Hashtags */}
        {item.hashtags.length > 0 && (
          <View style={styles.hashtagRow}>
            {item.hashtags.slice(0, 3).map((tag) => (
              <Text key={tag} style={[styles.hashtagText, { color: colors.primary }]}>{tag}</Text>
            ))}
            {item.hashtags.length > 3 && (
              <Text style={[styles.hashtagText, { color: colors.mutedForeground }]}>+{item.hashtags.length - 3}</Text>
            )}
          </View>
        )}

        {/* Actions */}
        {item.status === "pending" && (
          <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
            <Pressable
              style={styles.actionBtn}
              onPress={() => router.push({ pathname: "/create-post", params: { editScheduled: item.id } })}
            >
              <Feather name="edit-2" size={14} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={() => cancelItem(item.id)}>
              <Feather name="x-circle" size={14} color={colors.destructive} />
              <Text style={[styles.actionText, { color: colors.destructive }]}>Cancel</Text>
            </Pressable>
          </View>
        )}
        {(item.status === "cancelled" || item.status === "failed") && (
          <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
            <Pressable style={styles.actionBtn} onPress={() => deleteItem(item.id)}>
              <Feather name="trash-2" size={14} color={colors.destructive} />
              <Text style={[styles.actionText, { color: colors.destructive }]}>Delete</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PrivateHead />

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {FILTER_TABS.map((tab) => {
          const active = activeTab === tab.id;
          const count = tab.id === "all" ? items.length : items.filter((i) => i.status === tab.id).length;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tabChip, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}
            >
              <Text style={[styles.tabText, { color: active ? "#fff" : colors.foreground }]}>{tab.label}</Text>
              <View style={[styles.countBadge, { backgroundColor: active ? "rgba(255,255,255,0.25)" : colors.muted }]}>
                <Text style={{ fontSize: 11, fontFamily: "Inter_700Bold", color: active ? "#fff" : colors.mutedForeground }}>
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: Platform.OS === "web" ? 84 : insets.bottom + 32, gap: 12 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
            <Feather name="calendar" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No scheduled content</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Schedule posts, reels, and live streams to go live later.
            </Text>
            <Pressable
              style={[styles.scheduleBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/create-post")}
            >
              <Feather name="plus" size={16} color="#fff" />
              <Text style={styles.scheduleBtnText}>Schedule New</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  tabChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  countBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  typeLabel: { fontSize: 11, fontFamily: "Inter_700Bold" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  itemTitle: { fontSize: 15, fontFamily: "Inter_700Bold", lineHeight: 22 },
  itemDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18, marginTop: 2 },
  timeText: { fontSize: 12, fontFamily: "Inter_500Medium" },

  hashtagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  hashtagText: { fontSize: 12, fontFamily: "Inter_500Medium" },

  actionsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4 },
  actionText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 40 },
  scheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  scheduleBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
});
