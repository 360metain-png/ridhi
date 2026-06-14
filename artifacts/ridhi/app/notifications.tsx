import React, { useState } from "react";
import {
  Clipboard,
  FlatList,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors"
import { useTrackScreen } from "@/hooks/useAnalytics";

import { PrivateHead } from "@/components/PrivateHead";
import { Avatar } from "@/components/Avatar";
import { NOTIFICATIONS, MARKETING_NOTIFICATIONS, type MarketingNotification } from "@/data/mockData";

type TabKey = "all" | "social" | "promos";

const CHANNEL_ICON: Record<string, string> = {
  push: "bell",
  sms: "smartphone",
  whatsapp: "message-circle",
  email: "mail",
  inapp: "zap",
};

const CHANNEL_COLOR: Record<string, string> = {
  push: "#7B2FBE",
  sms: "#4A90E2",
  whatsapp: "#25D366",
  email: "#FF9500",
  inapp: "#E91E8C",
};

const TYPE_LABEL: Record<string, string> = {
  offer: "Offer",
  discount: "Discount",
  news: "News",
  promo: "Promotion",
};

const SOCIAL_ICONS: Record<string, { icon: string; color: string }> = {
  like:    { icon: "heart",        color: "#E91E8C" },
  match:   { icon: "heart",        color: "#7B2FBE" },
  comment: { icon: "message-circle", color: "#4A90E2" },
  coin:    { icon: "star",          color: "#FFB800" },
  follow:  { icon: "user-plus",     color: "#34C759" },
  campaign_live:     { icon: "volume-2", color: "#22C55E" },
  campaign_rejected: { icon: "alert-circle", color: "#EF4444" },
  campaign_completed:{ icon: "check-circle", color: "#3B82F6" },
  pitch_received:    { icon: "send",       color: "#7B2FBE" },
  pitch_shortlisted: { icon: "check-circle", color: "#22C55E" },
  pitch_rejected:    { icon: "x-circle",   color: "#EF4444" },
  deal_new:          { icon: "briefcase",  color: "#E91E8C" },
  deal_expiring:     { icon: "clock",      color: "#FF9500" },
  connect_unlocked:  { icon: "unlock",     color: "#22C55E" },
};

function getNavTarget(type: string): string {
  switch (type) {
    case "like":
    case "comment": return "/(tabs)";
    case "match":   return "/(tabs)/match";
    case "coin":    return "/wallet";
    case "follow":  return "/(tabs)/profile";
    case "campaign_live":
    case "campaign_rejected":
    case "campaign_completed": return "/ads-manager";
    case "pitch_received":
    case "pitch_shortlisted":
    case "pitch_rejected":
    case "connect_unlocked":  return "/creator-marketplace";
    case "deal_new":
    case "deal_expiring":     return "/creator-marketplace";
    default:        return "/(tabs)";
  }
}

function SocialNotifCard({
  item,
  colors,
  onTap,
}: {
  item: typeof NOTIFICATIONS[0];
  colors: ReturnType<typeof useColors>;
  onTap: () => void;
}) {
  const iconMeta = SOCIAL_ICONS[item.type] ?? { icon: "bell", color: colors.primary };
  return (
    <Pressable
      onPress={onTap}
      style={({ pressed }) => [
        styles.socialItem,
        !item.read && { backgroundColor: colors.primary + "0A" },
        pressed && { opacity: 0.75 },
        { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
      ]}
      accessibilityLabel={`${item.actor} ${item.content}`}
      accessibilityRole="button"
    >
      <View style={styles.avatarWrap}>
        <Avatar name={item.actor} size={44} />
        <View style={[styles.iconBadge, { backgroundColor: iconMeta.color }]}>
          <Feather name={iconMeta.icon as any} size={10} color="#fff" />
        </View>
      </View>
      <View style={styles.socialContent}>
        <Text style={[styles.socialText, { color: colors.foreground }]}>
          <Text style={{ fontFamily: "Inter_600SemiBold" }}>{item.actor}</Text>{" "}{item.content}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.timeText, { color: colors.mutedForeground }]}>{item.timeAgo}</Text>
          <Text style={[styles.actionText, { color: colors.primary }]}>
            {item.type === "follow"           ? "View Profile →" :
             item.type === "match"            ? "See Match →" :
             item.type === "coin"             ? "Open Wallet →" :
             item.type === "comment"          ? "View Post →" :
             item.type.startsWith("campaign") ? "Ads Manager →" :
             item.type.startsWith("pitch")    ? "My Pitches →" :
             item.type.startsWith("deal")     ? "Marketplace →" :
             item.type === "connect_unlocked" ? "Creator Hub →" : "View →"}
          </Text>
        </View>
      </View>
      {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
    </Pressable>
  );
}

function PromoCard({
  item,
  colors,
  onTap,
  onMarkRead,
}: {
  item: MarketingNotification;
  colors: ReturnType<typeof useColors>;
  onTap: () => void;
  onMarkRead: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!item.code) return;
    Clipboard.setString(item.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const channelColor = CHANNEL_COLOR[item.channel] ?? colors.primary;

  return (
    <Pressable
      onPress={() => { onMarkRead(); onTap(); }}
      style={({ pressed }) => [
        styles.promoCard,
        { backgroundColor: colors.surface, borderColor: item.read ? colors.border : colors.primary + "40" },
        pressed && { opacity: 0.92 },
      ]}
    >
      <LinearGradient
        colors={item.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.promoBanner}
      >
        <View style={styles.promoBannerContent}>
          <Text style={styles.promoEmoji}>{item.icon}</Text>
          <View style={styles.promoBannerText}>
            <View style={styles.tagRow}>
              {item.tag && (
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{item.tag}</Text>
                </View>
              )}
              <View style={[styles.channelBadge, { backgroundColor: "#ffffff20" }]}>
                <Feather name={CHANNEL_ICON[item.channel] as any} size={10} color="#fff" />
                <Text style={styles.channelText}>{item.channel.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.promoTitle} numberOfLines={1}>{item.title}</Text>
          </View>
          {!item.read && <View style={styles.unreadDotPromo} />}
        </View>
      </LinearGradient>

      <View style={styles.promoBody}>
        <Text style={[styles.promoBodyText, { color: colors.foreground }]}>{item.body}</Text>

        <View style={styles.promoMeta}>
          <Text style={[styles.promoTime, { color: colors.mutedForeground }]}>{item.timeAgo}</Text>
          {item.expiresIn && (
            <View style={[styles.expiryBadge, { backgroundColor: "#FF3B3015", borderColor: "#FF3B3030" }]}>
              <Feather name="clock" size={10} color="#FF3B30" />
              <Text style={[styles.expiryText, { color: "#FF3B30" }]}>{item.expiresIn}</Text>
            </View>
          )}
        </View>

        {item.code && (
          <Pressable onPress={handleCopy} style={[styles.codeRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.codeLeft}>
              <Feather name="tag" size={12} color={colors.primary} />
              <Text style={[styles.codeLabel, { color: colors.mutedForeground }]}>Promo Code</Text>
              <Text style={[styles.codeValue, { color: colors.primary }]}>{item.code}</Text>
            </View>
            <View style={[styles.copyBtn, { backgroundColor: copied ? "#34C759" : colors.primary }]}>
              <Feather name={copied ? "check" : "copy"} size={11} color="#fff" />
              <Text style={styles.copyText}>{copied ? "Copied!" : "Copy"}</Text>
            </View>
          </Pressable>
        )}

        <TouchableOpacity
          onPress={() => { onMarkRead(); onTap(); }}
          style={[styles.ctaBtn]}
          activeOpacity={0.82}
        >
          <LinearGradient
            colors={item.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>{item.cta}</Text>
            <Feather name="arrow-right" size={14} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  useTrackScreen("notifications");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [tab, setTab] = useState<TabKey>("all");
  const [socialNotifs, setSocialNotifs] = useState(NOTIFICATIONS.map((n) => ({ ...n })));
  const [promoNotifs,  setPromoNotifs]  = useState(MARKETING_NOTIFICATIONS.map((n) => ({ ...n })));

  const socialUnread = socialNotifs.filter((n) => !n.read).length;
  const promoUnread  = promoNotifs.filter((n) => !n.read).length;
  const totalUnread  = socialUnread + promoUnread;

  const markAllRead = () => {
    setSocialNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setPromoNotifs((prev)  => prev.map((n) => ({ ...n, read: true })));
  };

  const markSocialRead = (id: string) =>
    setSocialNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markPromoRead = (id: string) =>
    setPromoNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const TABS: { key: TabKey; label: string; count?: number }[] = [
    { key: "all",    label: "All",         count: totalUnread  > 0 ? totalUnread  : undefined },
    { key: "social", label: "Social",      count: socialUnread > 0 ? socialUnread : undefined },
    { key: "promos", label: "Offers & Promos", count: promoUnread  > 0 ? promoUnread  : undefined },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PrivateHead />
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </Pressable>
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text>
          {totalUnread > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadBadgeText}>{totalUnread}</Text>
            </View>
          )}
        </View>
        <Pressable
          onPress={markAllRead}
          style={[styles.readAllBtn, { opacity: totalUnread > 0 ? 1 : 0.4 }]}
          disabled={totalUnread === 0}
          accessibilityLabel="Mark all notifications as read"
        >
          <Text style={[styles.readAllText, { color: colors.primary }]}>Mark all read</Text>
        </Pressable>
      </View>

      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {TABS.map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[styles.tab, tab === t.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          >
            <Text style={[styles.tabLabel, { color: tab === t.key ? colors.primary : colors.mutedForeground }]}>
              {t.label}
            </Text>
            {t.count !== undefined && (
              <View style={[styles.tabBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.tabBadgeText}>{t.count}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {(tab === "all" || tab === "social") && (tab === "social" ? (
        <FlatList
          data={socialNotifs}
          keyExtractor={(n) => n.id}
          renderItem={({ item }) => (
            <SocialNotifCard
              item={item}
              colors={colors}
              onTap={() => { markSocialRead(item.id); router.push(getNavTarget(item.type) as any); }}
            />
          )}
          contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 84 : insets.bottom + 24 }}
          removeClippedSubviews={Platform.OS !== "web"}
          maxToRenderPerBatch={8}
          windowSize={8}
          initialNumToRender={10}
          ListEmptyComponent={<EmptyState colors={colors} />}
        />
      ) : null)}

      {tab === "promos" && (
        <FlatList
          data={promoNotifs}
          keyExtractor={(n) => n.id}
          renderItem={({ item }) => (
            <PromoCard
              item={item}
              colors={colors}
              onTap={() => router.push(item.ctaRoute as any)}
              onMarkRead={() => markPromoRead(item.id)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, gap: 16, paddingBottom: Platform.OS === "web" ? 84 : insets.bottom + 24 }}
          removeClippedSubviews={Platform.OS !== "web"}
          maxToRenderPerBatch={8}
          windowSize={8}
          initialNumToRender={10}
          ListEmptyComponent={<EmptyState colors={colors} />}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}

      {tab === "all" && (
        <ScrollView
          contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 84 : insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          {promoUnread > 0 && (
            <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
              <LinearGradient colors={["#7B2FBE", "#E91E8C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sectionDot} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Offers & Promotions</Text>
              <Pressable onPress={() => setTab("promos")}>
                <Text style={[styles.sectionSeeAll, { color: colors.primary }]}>See all →</Text>
              </Pressable>
            </View>
          )}

          {promoNotifs.filter((n) => !n.read).map((item) => (
            <View key={item.id} style={{ paddingHorizontal: 16, marginBottom: 12 }}>
              <PromoCard
                item={item}
                colors={colors}
                onTap={() => router.push(item.ctaRoute as any)}
                onMarkRead={() => markPromoRead(item.id)}
              />
            </View>
          ))}

          {socialNotifs.length > 0 && (
            <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
              <View style={[styles.sectionDot, { backgroundColor: "#4A90E2" }]} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Social Activity</Text>
            </View>
          )}

          {socialNotifs.map((item) => (
            <SocialNotifCard
              key={item.id}
              item={item}
              colors={colors}
              onTap={() => { markSocialRead(item.id); router.push(getNavTarget(item.type) as any); }}
            />
          ))}

          {promoNotifs.filter((n) => n.read).length > 0 && (
            <>
              <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
                <View style={[styles.sectionDot, { backgroundColor: colors.muted }]} />
                <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Older Promotions</Text>
                <Pressable onPress={() => setTab("promos")}>
                  <Text style={[styles.sectionSeeAll, { color: colors.primary }]}>See all →</Text>
                </Pressable>
              </View>
              {promoNotifs.filter((n) => n.read).map((item) => (
                <View key={item.id} style={{ paddingHorizontal: 16, marginBottom: 12 }}>
                  <PromoCard
                    item={item}
                    colors={colors}
                    onTap={() => router.push(item.ctaRoute as any)}
                    onMarkRead={() => markPromoRead(item.id)}
                  />
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function EmptyState({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.empty}>
      <Feather name="bell-off" size={40} color={colors.muted} />
      <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>All caught up!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  backBtn: { padding: 4 },
  titleWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  unreadBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, minWidth: 20, alignItems: "center" },
  unreadBadgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" },
  readAllBtn: { padding: 4 },
  readAllText: { fontSize: 13, fontFamily: "Inter_500Medium" },

  tabBar: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  tabBadge: { paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 8, minWidth: 18, alignItems: "center" },
  tabBadgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 4,
  },
  sectionDot: { width: 6, height: 6, borderRadius: 3 },
  sectionTitle: { flex: 1, fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.4, textTransform: "uppercase" },
  sectionSeeAll: { fontSize: 12, fontFamily: "Inter_500Medium" },

  socialItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  avatarWrap: { position: "relative" },
  iconBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  socialContent: { flex: 1, gap: 4 },
  socialText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  timeText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  actionText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },

  promoCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  promoBanner: { paddingHorizontal: 16, paddingVertical: 14 },
  promoBannerContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  promoEmoji: { fontSize: 32 },
  promoBannerText: { flex: 1, gap: 6 },
  tagRow: { flexDirection: "row", gap: 6 },
  tagBadge: {
    backgroundColor: "#ffffff30",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  tagText: { color: "#fff", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  channelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  channelText: { color: "#fff", fontSize: 9, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  promoTitle: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  unreadDotPromo: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    marginTop: 2,
  },

  promoBody: { padding: 14, gap: 12 },
  promoBodyText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  promoMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  promoTime: { fontSize: 12, fontFamily: "Inter_400Regular" },
  expiryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  expiryText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  codeLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  codeLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  codeValue: { fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  copyText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },

  ctaBtn: { borderRadius: 12, overflow: "hidden" },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 24,
  },
  ctaText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },

  empty: { alignItems: "center", gap: 8, paddingTop: 80 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
