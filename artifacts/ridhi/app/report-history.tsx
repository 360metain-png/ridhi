import React, { useState, useEffect, useCallback } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "@/hooks/useColors";
import { PrivateHead } from "@/components/PrivateHead";
import { useAuth } from "@/contexts/AuthContext";
import {
  ReportTicket,
  ReportStatus,
  STATUS_COLORS,
  STATUS_LABELS,
  STORAGE_KEY,
} from "@/data/reportTickets";

const FILTER_TABS: { id: "all" | ReportStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "reviewing", label: "Review" },
  { id: "resolved", label: "Resolved" },
  { id: "rejected", label: "Rejected" },
];

const TYPE_ICONS: Record<string, string> = {
  post: "image",
  reel: "film",
  story: "clock",
  live: "video",
  user: "user",
  comment: "message-circle",
  chat: "message-square",
  "audio-room": "mic",
  community: "users",
};

export default function ReportHistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | ReportStatus>("all");
  const [reports, setReports] = useState<ReportTicket[]>([]);
  const [selected, setSelected] = useState<ReportTicket | null>(null);

  const loadReports = useCallback(async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as ReportTicket[]) : [];
    setReports(all.filter((r) => r.reporterId === (user?.id ?? "me")));
  }, [user?.id]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const filtered = reports.filter((r) => (activeTab === "all" ? true : r.status === activeTab));

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <PrivateHead />
      <View style={[styles.topBar, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 4 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>My Reports</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {FILTER_TABS.map((t) => {
          const active = activeTab === t.id;
          return (
            <Pressable
              key={t.id}
              style={[styles.tab, { backgroundColor: active ? colors.primary : colors.muted }]}
              onPress={() => setActiveTab(t.id)}
            >
              <Text style={[styles.tabText, { color: active ? "#fff" : colors.foreground }]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>🛡️</Text>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No reports found</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            {activeTab === "all"
              ? "You haven't reported any content yet."
              : `No ${STATUS_LABELS[activeTab].toLowerCase()} reports.`}
          </Text>
          <Pressable onPress={() => router.back()} style={[styles.backLink, { backgroundColor: colors.primary }]}>
            <Text style={styles.backLinkText}>Back to Profile</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setSelected(item)}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.typeBadge, { backgroundColor: colors.primary + "18" }]}>
                  <Feather
                    name={TYPE_ICONS[item.targetType] as any}
                    size={12}
                    color={colors.primary}
                  />
                  <Text style={[styles.typeLabel, { color: colors.primary }]}>
                    {item.targetType}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + "15" }]}>
                  <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
                  <Text style={[styles.statusLabel, { color: STATUS_COLORS[item.status] }]}>
                    {STATUS_LABELS[item.status]}
                  </Text>
                </View>
              </View>
              <Text style={[styles.targetTitle, { color: colors.foreground }]}>
                {item.targetTitle || item.targetUser || "Unknown content"}
              </Text>
              <Text style={[styles.reason, { color: colors.mutedForeground }]}>
                Reason: {item.reason}
              </Text>
              <Text style={[styles.date, { color: colors.mutedForeground }]}>
                Reported {formatDate(item.createdAt)}
              </Text>
              {item.resolutionNote && (
                <View style={[styles.resolution, { backgroundColor: colors.muted }]}>
                  <Feather name="check-circle" size={12} color={colors.success} />
                  <Text style={[styles.resolutionText, { color: colors.foreground }]}>{item.resolutionNote}</Text>
                </View>
              )}
            </Pressable>
          )}
        />
      )}

      {/* Detail modal */}
      {selected && (
        <View style={[styles.detailOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <View style={[styles.detailSheet, { backgroundColor: colors.card }]}>
            <View style={styles.detailHeader}>
              <Text style={[styles.detailTitle, { color: colors.foreground }]}>Report Details</Text>
              <Pressable onPress={() => setSelected(null)}>
                <Feather name="x" size={22} color={colors.foreground} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.detailBody}>
              <View style={[styles.detailBadge, { backgroundColor: STATUS_COLORS[selected.status] + "15" }]}>
                <View style={[styles.detailDot, { backgroundColor: STATUS_COLORS[selected.status] }]} />
                <Text style={[styles.detailStatus, { color: STATUS_COLORS[selected.status] }]}>
                  {STATUS_LABELS[selected.status]}
                </Text>
              </View>
              <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Content</Text>
              <Text style={[styles.detailValue, { color: colors.foreground }]}>
                {selected.targetTitle || selected.targetUser || "Unknown"}
              </Text>
              <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Type</Text>
              <Text style={[styles.detailValue, { color: colors.foreground }]}>{selected.targetType}</Text>
              <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Reason</Text>
              <Text style={[styles.detailValue, { color: colors.foreground }]}>{selected.reason}</Text>
              {selected.description && (
                <>
                  <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Your Note</Text>
                  <Text style={[styles.detailValue, { color: colors.foreground }]}>{selected.description}</Text>
                </>
              )}
              {selected.resolutionNote && (
                <>
                  <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Resolution</Text>
                  <Text style={[styles.detailValue, { color: colors.foreground }]}>{selected.resolutionNote}</Text>
                </>
              )}
              {selected.adminAction && (
                <>
                  <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Action Taken</Text>
                  <Text style={[styles.detailValue, { color: colors.foreground }]}>{selected.adminAction}</Text>
                </>
              )}
              <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Reported On</Text>
              <Text style={[styles.detailValue, { color: colors.foreground }]}>{formatDate(selected.createdAt)}</Text>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },

  tabs: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  backLink: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, marginTop: 8 },
  backLinkText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },

  card: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 6 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 },
  typeBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  typeLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  targetTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  reason: { fontSize: 12, fontFamily: "Inter_400Regular" },
  date: { fontSize: 11, fontFamily: "Inter_400Regular" },
  resolution: { flexDirection: "row", alignItems: "center", gap: 6, padding: 8, borderRadius: 10, marginTop: 4 },
  resolutionText: { fontSize: 12, fontFamily: "Inter_500Medium" },

  detailOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "flex-end", zIndex: 50 },
  detailSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "75%" },
  detailHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  detailTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  detailBody: { gap: 12 },
  detailBadge: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 12, alignSelf: "flex-start", marginBottom: 8 },
  detailDot: { width: 8, height: 8, borderRadius: 4 },
  detailStatus: { fontSize: 13, fontFamily: "Inter_700Bold" },
  detailLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginTop: 10, marginBottom: 2 },
  detailValue: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
