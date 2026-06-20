import React, { useState, useEffect, useCallback } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { useTrackScreen } from "@/hooks/useAnalytics";
import { Avatar } from "@/components/Avatar";
import { PrivateHead } from "@/components/PrivateHead";
import { apiFetch } from "@/utils/api";

interface FriendRequest {
  id: string;
  senderId?: string;
  receiverId?: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
    city?: string;
  };
  receiver?: {
    id: string;
    name: string;
    avatar?: string;
    city?: string;
  };
  friend?: {
    id: string;
    name: string;
    avatar?: string;
    city?: string;
    bio?: string;
  };
  status: string;
  createdAt: string;
}

type Tab = "received" | "sent" | "friends";

export default function FriendRequestsScreen() {
  useTrackScreen("friend_requests");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("received");
  const [loading, setLoading] = useState(false);
  const [received, setReceived] = useState<FriendRequest[]>([]);
  const [sent, setSent] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<FriendRequest[]>([]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 20;

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [pendingRes, sentRes, friendsRes] = await Promise.all([
        apiFetch<{ requests: FriendRequest[] }>("/api/friend-requests/pending"),
        apiFetch<{ requests: FriendRequest[] }>("/api/friend-requests/sent"),
        apiFetch<{ friends: FriendRequest[] }>("/api/friends"),
      ]);
      setReceived(pendingRes.requests ?? []);
      setSent(sentRes.requests ?? []);
      setFriends(friendsRes.friends ?? []);
    } catch (err) {
      // silent fallback
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleAccept = async (id: string) => {
    try {
      const data = await apiFetch<{ status: string; conversationId: string }>(
        `/api/friend-requests/${id}/accept`,
        { method: "POST" }
      );
      if (data.status === "accepted") {
        Alert.alert("Friend Request Accepted", "You are now friends! Start chatting.");
        fetchAll();
      }
    } catch {
      Alert.alert("Error", "Could not accept friend request");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await apiFetch(`/api/friend-requests/${id}/reject`, { method: "POST" });
      fetchAll();
    } catch {
      Alert.alert("Error", "Could not reject friend request");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await apiFetch(`/api/friend-requests/${id}/cancel`, { method: "POST" });
      fetchAll();
    } catch {
      Alert.alert("Error", "Could not cancel friend request");
    }
  };

  const handleRemoveFriend = (id: string, name: string) => {
    Alert.alert(
      "Remove Friend",
      `Remove ${name} from your friends list?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await apiFetch(`/api/friends/${id}/remove`, { method: "POST" });
              fetchAll();
            } catch {
              Alert.alert("Error", "Could not remove friend");
            }
          },
        },
      ]
    );
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "received", label: `Received ${received.length > 0 ? `(${received.length})` : ""}` },
    { key: "sent", label: "Sent" },
    { key: "friends", label: `Friends ${friends.length > 0 ? `(${friends.length})` : ""}` },
  ];

  const renderReceived = () => {
    if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;
    if (received.length === 0) {
      return (
        <View style={styles.empty}>
          <Feather name="user-plus" size={40} color={colors.muted} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No pending requests</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={received}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Avatar name={item.sender?.name ?? "User"} size={50} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.name, { color: colors.foreground }]}>{item.sender?.name}</Text>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>{item.sender?.city ?? "India"}</Text>
            </View>
            <View style={styles.actionRow}>
              <Pressable
                onPress={() => handleAccept(item.id)}
                style={[styles.actionBtn, { backgroundColor: colors.success }]}>
                <Text style={[styles.actionText, { color: "#fff" }]}>Accept</Text>
              </Pressable>
              <Pressable
                onPress={() => handleReject(item.id)}
                style={[styles.actionBtn, { backgroundColor: colors.muted }]}>
                <Text style={[styles.actionText, { color: colors.foreground }]}>Decline</Text>
              </Pressable>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: bottomPad }}
      />
    );
  };

  const renderSent = () => {
    if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;
    if (sent.length === 0) {
      return (
        <View style={styles.empty}>
          <Feather name="send" size={40} color={colors.muted} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No sent requests</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={sent}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Avatar name={item.receiver?.name ?? "User"} size={50} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.name, { color: colors.foreground }]}>{item.receiver?.name}</Text>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>Pending</Text>
            </View>
            <Pressable
              onPress={() => handleCancel(item.id)}
              style={[styles.actionBtn, { backgroundColor: colors.muted }]}>
              <Text style={[styles.actionText, { color: colors.foreground }]}>Cancel</Text>
            </Pressable>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: bottomPad }}
      />
    );
  };

  const renderFriends = () => {
    if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />;
    if (friends.length === 0) {
      return (
        <View style={styles.empty}>
          <Feather name="users" size={40} color={colors.muted} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No friends yet</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Add friends from Explore or Match to chat for free
          </Text>
        </View>
      );
    }
    return (
      <FlatList
        data={friends}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.row, { borderBottomColor: colors.border }]}
            onPress={() => router.push({ pathname: "/chat/[id]", params: { id: item.friend?.id ?? "unknown" } })}
          >
            <Avatar name={item.friend?.name ?? "User"} size={50} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.name, { color: colors.foreground }]}>{item.friend?.name}</Text>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>{item.friend?.city ?? "India"}</Text>
            </View>
            <View style={styles.actionRow}>
              <Pressable
                style={[styles.actionBtn, { backgroundColor: colors.primary + "15" }]}
                onPress={() => router.push({ pathname: "/chat/[id]", params: { id: item.friend?.id ?? "unknown" } })}>
                <Feather name="message-circle" size={16} color={colors.primary} />
              </Pressable>
              <Pressable
                style={[styles.actionBtn, { backgroundColor: colors.muted }]}
                onPress={() => handleRemoveFriend(item.friend?.id ?? "", item.friend?.name ?? "")}>
                <Feather name="user-x" size={16} color={colors.destructive} />
              </Pressable>
            </View>
          </Pressable>
        )}
        contentContainerStyle={{ paddingBottom: bottomPad }}
      />
    );
  };

  return (
    <>
      <PrivateHead />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.header,
            { paddingTop: topPad + 8, backgroundColor: colors.surface, borderBottomColor: colors.border },
          ]}
        >
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.title, { color: colors.foreground }]}>Friend Requests</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
          {tabs.map((t) => (
            <Pressable
              key={t.key}
              style={[styles.tab, activeTab === t.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab(t.key)}
            >
              <Text style={[styles.tabLabel, { color: activeTab === t.key ? colors.primary : colors.mutedForeground }]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === "received" && renderReceived()}
        {activeTab === "sent" && renderSent()}
        {activeTab === "friends" && renderFriends()}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  tabLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  meta: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  actionRow: { flexDirection: "row", gap: 8 },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  empty: {
    alignItems: "center",
    gap: 8,
    paddingTop: 80,
  },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  emptySub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
