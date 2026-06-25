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
import { useTrackScreen } from "@/hooks/useAnalytics";
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
  useTrackScreen("report_history");
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
    <View style={{ flex: 1, backgroundColor: "#0D0D1A" }}>
      <PrivateHead />
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 4 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.title}>My Reports</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs + Content row */}
      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* Vertical tab bar */}
        <View style={styles.tabBar}>
          {FILTER_TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <Pressable
                key={t.id}
                style={[
                  styles.vTab,
                  active && { backgroundColor: "#E91E8C" },
                ]}
                onPress={() => setActiveTab(t.id)}
              >
                <Text style={[styles.vTabText, active && { color: "#fff" }]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Content area */}
        <View style={{ flex: 1 }}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>🛡️</Text>
              <Text style={styles.emptyTitle}>No reports found</Text>
              <Text style={styles.emptySub}>
                {activeTab === "all"
                  ? "You haven't reported any content yet."
                  : `No ${STATUS_LABELS[activeTab].toLowerCase()} reports.`}
              </Text>
              <Pressable onPress={() => router.back()} style={styles.backLink}>
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
                  style={[styles.card, { backgroundColor: "#1A1A2E", borderColor: "#2A2A3E" }]}
                  onPress={() => setSelected(item)}
                >
                  <View style={styles.cardHeader}>
                    <View style={[styles.typeBadge, { backgroundColor: "#E91E8C" + "18" }]}>
                      <Feather name={TYPE_ICONS[item.targetType] as any} size={12} color="#E91E8C" />
                      <Text style={[styles.typeLabel, { color: "#E91E8C" }]}>{item.targetType}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + "15" }]}>
                      <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
                      <Text style={[styles.statusLabel, { color: STATUS_COLORS[item.status] }]}>
                        {STATUS_LABELS[item.status]}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.targetTitle, { color: "#fff" }]}>
                    {item.targetTitle || item.targetUser || "Unknown content"}
                  </Text>
                  <Text style={[styles.reason, { color: "#888" }]}>
                    Reason: {item.reason}
                  </Text>
                  <Text style={[styles.date, { color: "#888" }]}>
                    Reported {formatDate(item.createdAt)}
                  </Text>
                  {item.resolutionNote && (
                    <View style={[styles.resolution, { backgroundColor: "#1A1A2E" }]}>
                      <Feather name="check-circle" size={12} color="#34C759" />
                      <Text style={[styles.resolutionText, { color: "#fff" }]}>{item.resolutionNote}</Text>
                    </View>
                  )}
                </Pressable>
              )}
            />
          )}
        </View>
      </View>

      {/* Detail modal */}
      {selected && (
        <View style={[styles.detailOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <View style={[styles.detailSheet, { backgroundColor: "#1A1A2E" }]}>
            <View style={styles.detailHeader}>
              <Text style={[styles.detailTitle, { color: "#fff" }]}>Report Details</Text>
              <Pressable onPress={() => setSelected(null)}>
                <Feather name="x" size={22} color="#fff" />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.detailBody}>
              <View style={[styles.detailBadge, { backgroundColor: STATUS_COLORS[selected.status] + "15" }]}>
                <View style={[styles.detailDot, { backgroundColor: STATUS_COLORS[selected.status] }]} />
                <Text style={[styles.detailStatus, { color: STATUS_COLORS[selected.status] }]}>
                  {STATUS_LABELS[selected.status]}
                </Text>
              </View>
              <Text style={[styles.detailLabel, { color: "#888" }]}>Content</Text>
              <Text style={[styles.detailValue, { color: "#fff" }]}>
                {selected.targetTitle || selected.targetUser || "Unknown"}
              </Text>
              <Text style={[styles.detailLabel, { color: "#888" }]}>Type</Text>
              <Text style={[styles.detailValue, { color: "#fff" }]}>{selected.targetType}</Text>
              <Text style={[styles.detailLabel, { color: "#888" }]}>Reason</Text>
              <Text style={[styles.detailValue, { color: "#fff" }]}>{selected.reason}</Text>
              {selected.description && (
                <>
                  <Text style={[styles.detailLabel, { color: "#888" }]}>Your Note</Text>
                  <Text style={[styles.detailValue, { color: "#fff" }]}>{selected.description}</Text>
                </>
              )}
              {selected.resolutionNote && (
                <>
                  <Text style={[styles.detailLabel, { color: "#888" }]}>Resolution</Text>
                  <Text style={[styles.detailValue, { color: "#fff" }]}>{selected.resolutionNote}</Text>
                </>
              )}
              {selected.adminAction && (
                <>
                  <Text style={[styles.detailLabel, { color: "#888" }]}>Action Taken</Text>
                  <Text style={[styles.detailValue, { color: "#fff" }]}>{selected.adminAction}</Text>
                </>
              )}
              <Text style={[styles.detailLabel, { color: "#888" }]}>Reported On</Text>
              <Text style={[styles.detailValue, { color: "#fff" }]}>{formatDate(selected.createdAt)}</Text>
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
  title: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },

  tabBar: {
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 8,
  },
  vTab: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#1A1A2E",
    minHeight: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  vTabText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
    textAlign: "center",
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#888", textAlign: "center" },
  backLink: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
    backgroundColor: "#E91E8C",
  },
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
