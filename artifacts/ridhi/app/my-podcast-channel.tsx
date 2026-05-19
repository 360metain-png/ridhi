import React, { useState } from "react";
import {
  View, Text, ScrollView, Pressable, StyleSheet, Image,
  FlatList, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { formatPlays, formatDuration } from "@/data/podcastData";
import { RidhiCoin } from "@/components/RidhiCoin";
import { CoinAmount } from "@/components/CoinAmount";

type Tab = "published" | "drafts" | "analytics";

interface MyEpisode {
  id: string;
  title: string;
  type: "Full Episode" | "Short Clip" | "Trailer";
  coverImage: string;
  durationMin: number;
  plays: number;
  likes: number;
  comments: number;
  earnings: number;
  publishedAgo: string;
  status: "published" | "draft" | "scheduled";
  scheduledFor?: string;
  isVideo?: boolean;
}

const MY_EPISODES: MyEpisode[] = [
  {
    id: "e1",
    title: "My Journey from Zero to 10K Followers on Ridhi",
    type: "Full Episode",
    coverImage: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400",
    durationMin: 28,
    plays: 4820,
    likes: 312,
    comments: 47,
    earnings: 1240,
    publishedAgo: "2 days ago",
    status: "published",
  },
  {
    id: "e2",
    title: "5 Tips to Go Viral in India — Quick Tips",
    type: "Short Clip",
    coverImage: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400",
    durationMin: 2,
    plays: 11300,
    likes: 890,
    comments: 104,
    earnings: 680,
    publishedAgo: "5 days ago",
    status: "published",
  },
  {
    id: "e3",
    title: "Why I Started Podcasting (Teaser)",
    type: "Trailer",
    coverImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400",
    durationMin: 1,
    plays: 2100,
    likes: 155,
    comments: 18,
    earnings: 0,
    publishedAgo: "1 week ago",
    status: "published",
  },
  {
    id: "e4",
    title: "Behind the Scenes of My Recording Setup",
    type: "Full Episode",
    coverImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400",
    durationMin: 22,
    plays: 0,
    likes: 0,
    comments: 0,
    earnings: 0,
    publishedAgo: "",
    status: "draft",
  },
  {
    id: "e5",
    title: "Interview with a Top Creator (Coming Soon)",
    type: "Full Episode",
    coverImage: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
    durationMin: 35,
    plays: 0,
    likes: 0,
    comments: 0,
    earnings: 0,
    publishedAgo: "",
    status: "scheduled",
    scheduledFor: "Fri 23 May, 8:00 PM",
  },
];

const TYPE_COLOR: Record<string, string> = {
  "Full Episode": "#7B2FBE",
  "Short Clip":   "#E91E8C",
  "Trailer":      "#FFB800",
};

const WEEKLY_PLAYS = [1200, 3400, 2800, 4820, 6100, 5500, 7200];
const WEEK_DAYS    = ["M", "T", "W", "T", "F", "S", "S"];
const MAX_PLAYS    = Math.max(...WEEKLY_PLAYS);

export default function MyPodcastChannelScreen() {
  const colors = useColors();
  const router  = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("published");

  const published = MY_EPISODES.filter(e => e.status === "published");
  const drafts    = MY_EPISODES.filter(e => e.status !== "published");
  const totalPlays    = published.reduce((s, e) => s + e.plays,    0);
  const totalEarnings = published.reduce((s, e) => s + e.earnings, 0);
  const totalLikes    = published.reduce((s, e) => s + e.likes,    0);

  const episodes = tab === "published" ? published : drafts;

  const handleDelete = (ep: MyEpisode) =>
    Alert.alert("Delete Episode", `Delete "${ep.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {} },
    ]);

  const handlePublish = (ep: MyEpisode) =>
    Alert.alert("Publish", `Publish "${ep.title}" now?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Publish", onPress: () => {} },
    ]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <LinearGradient colors={["#1A0533", "#7B2FBE"]} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>My Podcast Channel</Text>
        <Pressable onPress={() => router.push("/podcast-create")} style={styles.editBtn}>
          <Feather name="settings" size={18} color="#fff" />
        </Pressable>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* ── Channel Profile Card ── */}
        <View style={[styles.channelCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Channel art banner */}
          <LinearGradient
            colors={["#E91E8C", "#7B2FBE"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.channelBanner}
          >
            <Feather name="mic" size={32} color="rgba(255,255,255,0.3)" />
          </LinearGradient>

          {/* Avatar */}
          <View style={[styles.channelAvatarWrap, { borderColor: colors.background }]}>
            <LinearGradient colors={["#E91E8C", "#7B2FBE"]} style={styles.channelAvatar}>
              <Text style={styles.channelAvatarText}>
                {(user?.name ?? "U").charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.channelInfo}>
            <Text style={[styles.channelName, { color: colors.foreground }]}>
              {user?.name ?? "Your Name"}'s Podcast
            </Text>
            <Text style={[styles.channelBio, { color: colors.mutedForeground }]}>
              Stories, tips & conversations from India 🎙️
            </Text>

            {/* Stats row */}
            <View style={styles.channelStats}>
              {[
                { icon: "users",      label: "Subscribers", value: "1.2K"  },
                { icon: "headphones", label: "Total Plays",  value: formatPlays(totalPlays) },
                { icon: "mic",        label: "Episodes",     value: `${published.length}`   },
              ].map(({ icon, label, value }) => (
                <View key={label} style={styles.channelStat}>
                  <Feather name={icon as any} size={14} color="#E91E8C" />
                  <Text style={[styles.channelStatVal, { color: colors.foreground }]}>{value}</Text>
                  <Text style={[styles.channelStatLabel, { color: colors.mutedForeground }]}>{label}</Text>
                </View>
              ))}
            </View>

            {/* Earnings */}
            <View style={[styles.earningsRow, { backgroundColor: "#FFB80018", borderColor: "#FFB80040" }]}>
              <Feather name="credit-card" size={14} color="#FFB800" />
              <Text style={[styles.earningsLabel, { color: colors.foreground }]}>Total Earnings</Text>
              <CoinAmount amount={totalEarnings.toLocaleString("en-IN")} size={16} color="#FFB800" fontSize={13} />
              <Text style={[{ fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>≈₹{(totalEarnings * 0.8).toLocaleString("en-IN")}</Text>
              <Pressable onPress={() => router.push("/withdraw")}
                style={{ backgroundColor: "#FFB800", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginLeft: "auto" }}>
                <Text style={{ color: "#000", fontSize: 11, fontFamily: "Inter_700Bold" }}>Withdraw</Text>
              </Pressable>
            </View>

            {/* Action buttons */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <Pressable onPress={() => router.push("/podcast-create")} style={{ flex: 1 }}>
                <LinearGradient colors={["#E91E8C", "#7B2FBE"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.actionBtn}>
                  <Feather name="plus" size={15} color="#fff" />
                  <Text style={styles.actionBtnTxt}>New Episode</Text>
                </LinearGradient>
              </Pressable>
              <Pressable onPress={() => router.push("/podcast-room")}
                style={[styles.actionBtnOutline, { borderColor: "#E91E8C" }]}>
                <Feather name="radio" size={15} color="#E91E8C" />
                <Text style={[styles.actionBtnOutlineTxt, { color: "#E91E8C" }]}>Go Live</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── THUMBNAIL EXPLAINER ── */}
        <View style={[styles.thumbNote, { backgroundColor: "#7B2FBE12", borderColor: "#7B2FBE30" }]}>
          <Feather name="image" size={16} color="#7B2FBE" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.thumbNoteTitle, { color: colors.foreground }]}>How Thumbnails Work</Text>
            <Text style={[styles.thumbNoteSub, { color: colors.mutedForeground }]}>
              The <Text style={{ fontFamily: "Inter_600SemiBold", color: "#7B2FBE" }}>Cover Art</Text> you upload when creating an episode becomes its thumbnail card — shown in Trending, All Episodes, and your channel below. Square 1:1 images look best.
            </Text>
          </View>
        </View>

        {/* ── Tabs ── */}
        <View style={[styles.tabRow, { backgroundColor: colors.muted }]}>
          {([
            { key: "published" as Tab, label: "Published", count: published.length },
            { key: "drafts"    as Tab, label: "Drafts",    count: drafts.length    },
            { key: "analytics" as Tab, label: "Analytics", count: null             },
          ]).map(({ key, label, count }) => (
            <Pressable key={key} onPress={() => setTab(key)}
              style={[styles.tabBtn, tab === key && { backgroundColor: "#7B2FBE" }]}>
              <Text style={[styles.tabTxt, { color: tab === key ? "#fff" : colors.mutedForeground }]}>{label}</Text>
              {count !== null && (
                <View style={[styles.tabBadge, { backgroundColor: tab === key ? "rgba(255,255,255,0.3)" : colors.border }]}>
                  <Text style={[styles.tabBadgeTxt, { color: tab === key ? "#fff" : colors.mutedForeground }]}>{count}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* ── Published / Drafts list ── */}
        {tab !== "analytics" && (
          <View style={{ paddingHorizontal: 16, gap: 14, marginTop: 16 }}>
            {episodes.length === 0 && (
              <View style={{ alignItems: "center", paddingTop: 40, gap: 10 }}>
                <Text style={{ fontSize: 40 }}>🎙️</Text>
                <Text style={[{ fontSize: 16, fontFamily: "Inter_600SemiBold" }, { color: colors.foreground }]}>
                  {tab === "published" ? "No published episodes yet" : "No drafts"}
                </Text>
                <Pressable onPress={() => router.push("/podcast-create")}
                  style={{ backgroundColor: "#E91E8C", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}>
                  <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>Record Your First Episode</Text>
                </Pressable>
              </View>
            )}
            {episodes.map((ep) => (
              <View key={ep.id} style={[styles.epCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {/* Thumbnail — this is the cover art uploaded during episode creation */}
                <View style={styles.epThumbWrap}>
                  <Image source={{ uri: ep.coverImage }} style={styles.epThumb} />
                  <LinearGradient colors={["transparent", "rgba(0,0,0,0.6)"]} style={StyleSheet.absoluteFill} />
                  <View style={[styles.epTypePill, { backgroundColor: TYPE_COLOR[ep.type] + "CC" }]}>
                    <Text style={styles.epTypeTxt}>{ep.type}</Text>
                  </View>
                  <Text style={styles.epDuration}>{formatDuration(ep.durationMin)}</Text>
                  {ep.status === "scheduled" && (
                    <View style={styles.scheduledBadge}>
                      <Feather name="clock" size={9} color="#fff" />
                      <Text style={styles.scheduledTxt}>Scheduled</Text>
                    </View>
                  )}
                </View>

                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[styles.epTitle, { color: colors.foreground }]} numberOfLines={2}>{ep.title}</Text>

                  {ep.status === "published" && (
                    <>
                      <View style={styles.epStatsRow}>
                        {[
                          { icon: "headphones", val: formatPlays(ep.plays),    color: "#7B2FBE" },
                          { icon: "heart",      val: formatPlays(ep.likes),    color: "#E91E8C" },
                          { icon: "message-circle", val: String(ep.comments), color: "#2196F3" },
                        ].map(({ icon, val, color }) => (
                          <View key={icon} style={styles.epStat}>
                            <Feather name={icon as any} size={11} color={color} />
                            <Text style={[styles.epStatVal, { color: colors.mutedForeground }]}>{val}</Text>
                          </View>
                        ))}
                      </View>
                      {ep.earnings > 0 && (
                        <View style={[styles.epEarnings, { backgroundColor: "#FFB80015", flexDirection: "row", alignItems: "center", gap: 4 }]}>
                          <RidhiCoin size={12} />
                          <Text style={{ fontSize: 10, color: "#FFB800", fontFamily: "Inter_600SemiBold" }}>
                            {ep.earnings} earned
                          </Text>
                        </View>
                      )}
                      <Text style={[styles.epAgo, { color: colors.mutedForeground }]}>{ep.publishedAgo}</Text>
                    </>
                  )}

                  {ep.status === "draft" && (
                    <Text style={[{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      Draft — not published
                    </Text>
                  )}
                  {ep.status === "scheduled" && ep.scheduledFor && (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Feather name="clock" size={11} color="#FFB800" />
                      <Text style={{ fontSize: 11, color: "#FFB800", fontFamily: "Inter_500Medium" }}>{ep.scheduledFor}</Text>
                    </View>
                  )}

                  {/* Actions */}
                  <View style={styles.epActions}>
                    {ep.status !== "published" && (
                      <Pressable onPress={() => handlePublish(ep)}
                        style={[styles.epAction, { backgroundColor: "#E91E8C20" }]}>
                        <Feather name="upload" size={12} color="#E91E8C" />
                        <Text style={[styles.epActionTxt, { color: "#E91E8C" }]}>Publish</Text>
                      </Pressable>
                    )}
                    <Pressable onPress={() => router.push("/podcast-create")}
                      style={[styles.epAction, { backgroundColor: "#7B2FBE20" }]}>
                      <Feather name="edit-2" size={12} color="#7B2FBE" />
                      <Text style={[styles.epActionTxt, { color: "#7B2FBE" }]}>Edit</Text>
                    </Pressable>
                    <Pressable onPress={() => handleDelete(ep)}
                      style={[styles.epAction, { backgroundColor: "#FF3B3020" }]}>
                      <Feather name="trash-2" size={12} color="#FF3B30" />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── Analytics tab ── */}
        {tab === "analytics" && (
          <View style={{ padding: 16, gap: 16 }}>
            {/* Stats cards */}
            <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
              {[
                { label: "Total Plays",    value: formatPlays(totalPlays),  icon: "headphones", color: "#7B2FBE" },
                { label: "Total Likes",    value: formatPlays(totalLikes),  icon: "heart",      color: "#E91E8C" },
                { label: "Subscribers",    value: "1,247",                  icon: "users",      color: "#2196F3" },
                { label: "Coins Earned",   value: totalEarnings,            icon: "credit-card",color: "#FFB800", isCoin: true },
              ].map(({ label, value, icon, color, isCoin }: any) => (
                <View key={label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, width: "47%" }]}>
                  <View style={[styles.statCardIcon, { backgroundColor: color + "20" }]}>
                    <Feather name={icon as any} size={18} color={color} />
                  </View>
                  {isCoin ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <RidhiCoin size={16} />
                      <Text style={[styles.statCardVal, { color: colors.foreground }]}>{value}</Text>
                    </View>
                  ) : (
                    <Text style={[styles.statCardVal, { color: colors.foreground }]}>{value}</Text>
                  )}
                  <Text style={[styles.statCardLabel, { color: colors.mutedForeground }]}>{label}</Text>
                </View>
              ))}
            </View>

            {/* Weekly plays bar chart */}
            <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.chartTitle, { color: colors.foreground }]}>Plays This Week</Text>
              <View style={styles.barChart}>
                {WEEKLY_PLAYS.map((v, i) => (
                  <View key={i} style={styles.barCol}>
                    <Text style={[styles.barVal, { color: colors.mutedForeground }]}>{v >= 1000 ? `${(v/1000).toFixed(1)}K` : v}</Text>
                    <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
                      <LinearGradient
                        colors={["#E91E8C", "#7B2FBE"]}
                        style={[styles.barFill, { height: `${Math.round((v / MAX_PLAYS) * 100)}%` }]}
                      />
                    </View>
                    <Text style={[styles.barDay, { color: colors.mutedForeground }]}>{WEEK_DAYS[i]}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Top episode */}
            <View style={[styles.topEpCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.chartTitle, { color: colors.foreground }]}>🏆 Best Performing Episode</Text>
              {published.sort((a, b) => b.plays - a.plays).slice(0, 1).map(ep => (
                <View key={ep.id} style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
                  <Image source={{ uri: ep.coverImage }} style={styles.topEpThumb} />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[{ fontSize: 14, fontFamily: "Inter_600SemiBold" }, { color: colors.foreground }]} numberOfLines={2}>{ep.title}</Text>
                    <Text style={[{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {formatPlays(ep.plays)} plays · {formatPlays(ep.likes)} likes
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Subscriber growth tip */}
            <View style={[styles.tipCard, { backgroundColor: "#E91E8C12", borderColor: "#E91E8C30" }]}>
              <Feather name="trending-up" size={16} color="#E91E8C" />
              <View style={{ flex: 1 }}>
                <Text style={[{ fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 2 }, { color: colors.foreground }]}>
                  Grow Faster
                </Text>
                <Text style={[{ fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 }, { color: colors.mutedForeground }]}>
                  Upload Short Clips (≤3 min) consistently to grow subscribers. Short clips get 3× more shares on Ridhi.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── FAB — New Episode ── */}
      <Pressable onPress={() => router.push("/podcast-create")} style={styles.fab}>
        <LinearGradient colors={["#E91E8C", "#7B2FBE"]} style={styles.fabGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Feather name="plus" size={18} color="#fff" />
          <Text style={styles.fabTxt}>New Episode</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:      { flex: 1 },
  header:      { flexDirection: "row", alignItems: "center", paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, gap: 12 },
  backBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  headerTitle: { flex: 1, color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  editBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },

  channelCard:      { margin: 16, borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  channelBanner:    { height: 80, alignItems: "center", justifyContent: "center" },
  channelAvatarWrap:{ width: 74, height: 74, borderRadius: 37, borderWidth: 3, alignSelf: "center", marginTop: -37, overflow: "hidden" },
  channelAvatar:    { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  channelAvatarText:{ color: "#fff", fontSize: 28, fontFamily: "Inter_700Bold" },
  channelInfo:      { padding: 16, paddingTop: 8, alignItems: "center" },
  channelName:      { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "center" },
  channelBio:       { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 4 },

  channelStats:     { flexDirection: "row", gap: 24, marginTop: 14, marginBottom: 12 },
  channelStat:      { alignItems: "center", gap: 3 },
  channelStatVal:   { fontSize: 16, fontFamily: "Inter_700Bold" },
  channelStatLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },

  earningsRow:      { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, padding: 10, width: "100%" },
  earningsLabel:    { fontSize: 12, fontFamily: "Inter_500Medium", flex: 0 },
  earningsVal:      { fontSize: 14, fontFamily: "Inter_700Bold" },

  actionBtn:        { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, paddingVertical: 11 },
  actionBtnTxt:     { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  actionBtnOutline: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, paddingVertical: 11, borderWidth: 1.5 },
  actionBtnOutlineTxt: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  thumbNote:    { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, padding: 14, flexDirection: "row", gap: 10, alignItems: "flex-start" },
  thumbNoteTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  thumbNoteSub:   { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },

  tabRow:    { flexDirection: "row", marginHorizontal: 16, marginTop: 14, borderRadius: 14, padding: 4 },
  tabBtn:    { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 9, borderRadius: 11 },
  tabTxt:    { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  tabBadge:  { borderRadius: 20, paddingHorizontal: 7, paddingVertical: 1 },
  tabBadgeTxt: { fontSize: 10, fontFamily: "Inter_700Bold" },

  epCard:       { flexDirection: "row", gap: 12, borderRadius: 16, borderWidth: 1, padding: 12 },
  epThumbWrap:  { width: 100, height: 100, borderRadius: 12, overflow: "hidden", position: "relative" },
  epThumb:      { width: "100%", height: "100%", resizeMode: "cover" },
  epTypePill:   { position: "absolute", top: 6, left: 6, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  epTypeTxt:    { color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold" },
  epDuration:   { position: "absolute", bottom: 6, right: 6, color: "#fff", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  scheduledBadge: { position: "absolute", top: 6, right: 6, flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(255,184,0,0.85)", borderRadius: 8, paddingHorizontal: 5, paddingVertical: 2 },
  scheduledTxt:   { color: "#fff", fontSize: 8, fontFamily: "Inter_700Bold" },
  epTitle:      { fontSize: 13, fontFamily: "Inter_600SemiBold", lineHeight: 18 },
  epStatsRow:   { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  epStat:       { flexDirection: "row", alignItems: "center", gap: 3 },
  epStatVal:    { fontSize: 11, fontFamily: "Inter_400Regular" },
  epEarnings:   { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  epAgo:        { fontSize: 10, fontFamily: "Inter_400Regular" },
  epActions:    { flexDirection: "row", gap: 6, marginTop: 4 },
  epAction:     { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  epActionTxt:  { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  statCard:      { borderRadius: 16, borderWidth: 1, padding: 14, alignItems: "center", gap: 6 },
  statCardIcon:  { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  statCardVal:   { fontSize: 18, fontFamily: "Inter_700Bold" },
  statCardLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center" },

  chartCard:   { borderRadius: 16, borderWidth: 1, padding: 16 },
  chartTitle:  { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 14 },
  barChart:    { flexDirection: "row", alignItems: "flex-end", gap: 6, height: 120 },
  barCol:      { flex: 1, alignItems: "center", gap: 4 },
  barVal:      { fontSize: 8, fontFamily: "Inter_400Regular" },
  barTrack:    { flex: 1, width: "100%", borderRadius: 6, overflow: "hidden", justifyContent: "flex-end" },
  barFill:     { width: "100%", borderRadius: 6 },
  barDay:      { fontSize: 10, fontFamily: "Inter_600SemiBold" },

  topEpCard:  { borderRadius: 16, borderWidth: 1, padding: 16 },
  topEpThumb: { width: 60, height: 60, borderRadius: 10, resizeMode: "cover" },

  tipCard:    { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 14, borderWidth: 1, padding: 14 },

  fab:        { position: "absolute", bottom: 28, alignSelf: "center" },
  fabGrad:    { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 30 },
  fabTxt:     { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
});
