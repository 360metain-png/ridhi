import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SeoHead } from "@/components/SeoHead";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");
const LOGO = require("@/assets/images/ridhi_logo.png");

const FEATURES = [
  {
    icon: "users" as const,
    color: "#7B2FBE",
    title: "Social Networking",
    desc: "Create profiles, follow creators & communities, share photos, videos and updates, discover trending content.",
  },
  {
    icon: "message-circle" as const,
    color: "#E91E8C",
    title: "Chat & Messaging",
    desc: "Private messaging, group chats, emoji & media sharing — real-time communication at its best.",
  },
  {
    icon: "phone-call" as const,
    color: "#00BCD4",
    title: "Audio & Video Calling",
    desc: "HD video & audio calls, random connect options, secure and private communication system.",
  },
  {
    icon: "star" as const,
    color: "#FFB800",
    title: "Creator & Talent Platform",
    desc: "Creator profiles, fan engagement, virtual gifts, digital coins, leaderboards and performer rankings.",
  },
  {
    icon: "zap" as const,
    color: "#4CAF50",
    title: "Entertainment & Gaming",
    desc: "Interactive challenges, in-app games, community contests, live interaction features.",
  },
  {
    icon: "globe" as const,
    color: "#FF6B35",
    title: "Multi-Language Support",
    desc: "Supports 13 Indian & international languages so every region can comfortably engage.",
  },
  {
    icon: "shield" as const,
    color: "#22C55E",
    title: "Safety & Privacy",
    desc: "Privacy controls, content moderation, reporting tools, secure data handling. Zero tolerance for harassment or harmful content.",
  },
];

const WHY_US = [
  { emoji: "✨", text: "Modern and user-friendly experience" },
  { emoji: "🤝", text: "Community-driven social platform" },
  { emoji: "🔒", text: "Safe and secure environment" },
  { emoji: "🎉", text: "Entertainment and social interaction in one app" },
  { emoji: "🌟", text: "Opportunities for creators and performers" },
  { emoji: "🇮🇳", text: "Built for Indian and global audiences" },
];

export default function AboutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({ inputRange: [0, 80], outputRange: [0, 1], extrapolate: "clamp" });

  return (
    <>
      <SeoHead
        title="About Ridhi — India's #1 Live Streaming, Voice Chat & Social App"
        description="Learn about Ridhi — India's all-in-one app for live streaming, voice chat rooms, social networking, jobs, and creator earnings. Built for the next billion users."
      />
      <View style={[s.root, { backgroundColor: colors.background }]}>
      {/* Sticky mini-header */}
      <Animated.View style={[s.stickyHeader, { paddingTop: topPad, backgroundColor: colors.surface + "F2", borderBottomColor: colors.border, opacity: headerOpacity }]}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[s.stickyTitle, { color: colors.foreground }]}>About Ridhi</Text>
        <View style={{ width: 36 }} />
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* Hero */}
        <LinearGradient colors={["#7B2FBE", "#E91E8C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.hero, { paddingTop: topPad + 16 }]}>
          <Pressable onPress={() => router.back()} style={s.heroBack}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <View style={s.logoWrap}>
            <Image source={LOGO} style={s.logo} resizeMode="contain" />
          </View>
          <Text style={s.heroName}>Ridhi</Text>
          <Text style={s.heroTagline}>India's #1 Social & Creator Platform</Text>
          <View style={s.heroBadgeRow}>
            <View style={s.heroBadge}><Text style={s.heroBadgeText}>v1.0.0</Text></View>
            <View style={s.heroBadge}><Text style={s.heroBadgeText}>Krilo Digitech Pvt. Ltd.</Text></View>
          </View>
        </LinearGradient>

        {/* Welcome */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.cardTitle, { color: colors.foreground }]}>Welcome to Ridhi</Text>
          <Text style={[s.cardBody, { color: colors.mutedForeground }]}>
            Ridhi is a next-generation social networking and community platform designed to connect people through conversations, entertainment, friendships, talent, and digital communities.{"\n\n"}
            Developed & Built by <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Krilo Digitech Pvt. Ltd.</Text> and funded by <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Jadaprolu Hareesh</Text>, Ridhi creates a safe and engaging space where users can communicate, share experiences, discover new people, and express themselves freely.
          </Text>
        </View>

        {/* Mission & Vision */}
        <View style={s.mvRow}>
          <LinearGradient colors={["#7B2FBE22", "#7B2FBE08"]} style={[s.mvCard, { borderColor: "#7B2FBE40" }]}>
            <View style={[s.mvIcon, { backgroundColor: "#7B2FBE22" }]}>
              <Feather name="target" size={20} color="#7B2FBE" />
            </View>
            <Text style={[s.mvTitle, { color: colors.foreground }]}>Our Mission</Text>
            <Text style={[s.mvBody, { color: colors.mutedForeground }]}>
              "To build a community-first digital platform where every voice matters, every culture connects, and every user belongs."
            </Text>
          </LinearGradient>
          <LinearGradient colors={["#E91E8C22", "#E91E8C08"]} style={[s.mvCard, { borderColor: "#E91E8C40" }]}>
            <View style={[s.mvIcon, { backgroundColor: "#E91E8C22" }]}>
              <Feather name="eye" size={20} color="#E91E8C" />
            </View>
            <Text style={[s.mvTitle, { color: colors.foreground }]}>Our Vision</Text>
            <Text style={[s.mvBody, { color: colors.mutedForeground }]}>
              To become one of the most trusted and innovative social networking platforms globally — creating an inclusive ecosystem for communication, entertainment, and digital engagement.
            </Text>
          </LinearGradient>
        </View>

        {/* Key Features */}
        <View style={s.sectionWrap}>
          <Text style={[s.sectionLabel, { color: colors.foreground }]}>Key Features</Text>
          {FEATURES.map((f) => (
            <View key={f.title} style={[s.featureRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[s.featureIcon, { backgroundColor: f.color + "1A" }]}>
                <Feather name={f.icon} size={18} color={f.color} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[s.featureTitle, { color: colors.foreground }]}>{f.title}</Text>
                <Text style={[s.featureDesc, { color: colors.mutedForeground }]}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Why Choose Ridhi */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.cardTitle, { color: colors.foreground }]}>Why Choose Ridhi?</Text>
          {WHY_US.map((w) => (
            <View key={w.text} style={s.whyRow}>
              <Text style={s.whyEmoji}>{w.emoji}</Text>
              <Text style={[s.whyText, { color: colors.foreground }]}>{w.text}</Text>
            </View>
          ))}
        </View>

        {/* Our Community */}
        <LinearGradient colors={["#7B2FBE18", "#E91E8C14"]} style={[s.communityCard, { borderColor: colors.border }]}>
          <Feather name="heart" size={28} color="#E91E8C" style={{ marginBottom: 10 }} />
          <Text style={[s.communityTitle, { color: colors.foreground }]}>Our Community</Text>
          <Text style={[s.communityBody, { color: colors.mutedForeground }]}>
            Ridhi is more than just an app — it is a growing digital community where friendships begin, talents grow, and people stay connected.{"\n\n"}We believe technology should bring people together and create positive social experiences for everyone.
          </Text>
        </LinearGradient>

        {/* Contact */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.cardTitle, { color: colors.foreground }]}>Contact Us</Text>
          <Text style={[s.cardBody, { color: colors.mutedForeground, marginBottom: 14 }]}>
            For support, partnerships, business inquiries, or feedback:
          </Text>
          <Pressable onPress={() => Linking.openURL("mailto:hello@ridhi.app")} style={[s.contactBtn, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Feather name="mail" size={16} color={colors.primary} />
            <Text style={[s.contactBtnText, { color: colors.foreground }]}>hello@ridhi.app</Text>
            <Feather name="external-link" size={13} color={colors.mutedForeground} />
          </Pressable>
          <Pressable onPress={() => Linking.openURL("https://ridhi.app/")} style={[s.contactBtn, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Feather name="globe" size={16} color={colors.primary} />
            <Text style={[s.contactBtnText, { color: colors.foreground }]}>ridhi.app</Text>
            <Feather name="external-link" size={13} color={colors.mutedForeground} />
          </Pressable>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Image source={LOGO} style={s.footerLogo} resizeMode="contain" />
          <Text style={[s.footerText, { color: colors.mutedForeground }]}>© 2025 Krilo Digitech Pvt. Ltd.</Text>
          <Text style={[s.footerText, { color: colors.mutedForeground }]}>All rights reserved.</Text>
          <Text style={[s.footerVersion, { color: colors.mutedForeground + "88" }]}>Ridhi v1.0.0</Text>
        </View>
      </Animated.ScrollView>
    </View>
    </>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  stickyHeader: {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  stickyTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  hero: { paddingHorizontal: 20, paddingBottom: 32, alignItems: "center", gap: 8 },
  heroBack: { alignSelf: "flex-start", padding: 6, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", marginBottom: 8 },
  logoWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  logo: { width: 60, height: 60 },
  heroName: { color: "#fff", fontSize: 32, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  heroTagline: { color: "rgba(255,255,255,0.82)", fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  heroBadgeRow: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 4 },
  heroBadge: { backgroundColor: "rgba(255,255,255,0.18)", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  heroBadgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  card: { marginHorizontal: 16, marginTop: 14, borderRadius: 18, borderWidth: 1, padding: 18, gap: 10 },
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  cardBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 21 },
  mvRow: { flexDirection: "row", marginHorizontal: 16, marginTop: 14, gap: 10 },
  mvCard: { flex: 1, borderRadius: 18, borderWidth: 1, padding: 16, gap: 10 },
  mvIcon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  mvTitle: { fontSize: 13, fontFamily: "Inter_700Bold" },
  mvBody: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, fontStyle: "italic" },
  sectionWrap: { marginHorizontal: 16, marginTop: 14, gap: 8 },
  sectionLabel: { fontSize: 16, fontFamily: "Inter_700Bold", paddingHorizontal: 2, marginBottom: 4 },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  featureIcon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  featureTitle: { fontSize: 13, fontFamily: "Inter_700Bold" },
  featureDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  whyRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  whyEmoji: { fontSize: 16, marginTop: 1 },
  whyText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  communityCard: { marginHorizontal: 16, marginTop: 14, borderRadius: 18, borderWidth: 1, padding: 22, alignItems: "center" },
  communityTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 6 },
  communityBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 21, textAlign: "center" },
  contactBtn: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 13, borderWidth: 1 },
  contactBtnText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  footer: { alignItems: "center", paddingTop: 28, paddingBottom: 8, gap: 4 },
  footerLogo: { width: 40, height: 40, marginBottom: 6 },
  footerText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  footerVersion: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 4 },
});
