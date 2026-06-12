import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
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
import { useTrackScreen } from "@/hooks/useAnalytics";

const { width } = Dimensions.get("window");

type Section = {
  num: string;
  title: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  color: string;
  content: React.ReactNode;
};

const SECTIONS: Section[] = [
  {
    num: "1",
    title: "Introduction",
    icon: "info",
    color: "#7B2FBE",
    content: (
      <>
        <PP>Ridhi is committed to protecting the privacy and security of its users. By accessing or using Ridhi services, you agree to the collection and use of information in accordance with this Privacy Policy.</PP>
        <PP>If you do not agree with this policy, please discontinue use of the platform.</PP>
      </>
    ),
  },
  {
    num: "2",
    title: "Company Information",
    icon: "briefcase",
    color: "#E91E8C",
    content: (
      <>
        <InfoRow label="Platform Name" value="Ridhi" />
        <InfoRow label="Company" value="Krilo Digitech Pvt Ltd" />
        <InfoRow label="Website" value="https://ridhi.app/" link />
        <InfoRow label="Support Email" value="hello@ridhi.app" link />
        <InfoRow label="Business Email" value="hello@ridhi.app" link />
      </>
    ),
  },
  {
    num: "3",
    title: "Information We Collect",
    icon: "database",
    color: "#00BCD4",
    content: (
      <>
        <SubSection label="A. Personal Information">
          {["Full name", "Username", "Mobile number", "Email address", "Date of birth", "Gender", "Profile photo", "Country, state, and city", "Government ID verification details (if applicable)"].map((i) => <Bullet key={i} text={i} />)}
        </SubSection>
        <SubSection label="B. Account & Profile Information">
          {["Bio and profile information", "Interests and preferences", "Followers/following details", "Uploaded content, photos, videos, and audio"].map((i) => <Bullet key={i} text={i} />)}
        </SubSection>
        <SubSection label="C. Device & Technical Information">
          {["IP address", "Device model", "Operating system", "Browser type", "App version", "Device identifiers", "Network and connection details", "Crash reports and diagnostics"].map((i) => <Bullet key={i} text={i} />)}
        </SubSection>
        <SubSection label="D. Usage Information">
          {["Content viewed and shared", "Likes, comments, follows, and interactions", "Audio/video call activity", "Messaging activity", "Coins, gifting, and transactions", "Time spent on the platform"].map((i) => <Bullet key={i} text={i} />)}
        </SubSection>
        <SubSection label="E. Location Information">
          <PP style={{ marginBottom: 0 }}>With your permission, Ridhi may collect precise or approximate location information to improve user experience, safety, recommendations, and regional content delivery. You can disable location access from your device settings.</PP>
        </SubSection>
      </>
    ),
  },
  {
    num: "4",
    title: "How We Use Your Information",
    icon: "settings",
    color: "#4CAF50",
    content: (
      <>
        {["Create and manage user accounts", "Provide social networking features", "Enable chat, audio calls, and video calls", "Improve platform performance", "Personalize recommendations and feeds", "Process virtual coin purchases and gifting", "Prevent fraud, abuse, and illegal activity", "Verify accounts and maintain safety", "Provide customer support", "Send important notifications and updates", "Comply with legal obligations"].map((i) => <Bullet key={i} text={i} />)}
      </>
    ),
  },
  {
    num: "5",
    title: "Virtual Coins & Payments",
    icon: "credit-card",
    color: "#FFB800",
    content: (
      <>
        {["All purchases are processed through authorized payment gateways.", "Virtual coins are non-transferable and non-refundable except where required by law.", "Transaction history may be stored for security, auditing, and legal compliance."].map((i) => <Bullet key={i} text={i} />)}
      </>
    ),
  },
  {
    num: "6",
    title: "User Content",
    icon: "image",
    color: "#FF6B35",
    content: (
      <>
        <PP>Users may upload content including photos, videos, audio recordings, comments, messages, and live streams.</PP>
        <PP>You retain ownership of your content; however, by uploading content on Ridhi, you grant Ridhi a limited, worldwide, non-exclusive license to host, display, distribute, and promote such content for platform operations and service improvement.</PP>
        <PP>Users are responsible for the content they upload.</PP>
      </>
    ),
  },
  {
    num: "7",
    title: "Sharing of Information",
    icon: "share-2",
    color: "#7B2FBE",
    content: (
      <>
        <PP>We do not sell personal data to third parties.</PP>
        <PP>We may share information with:</PP>
        {["Service providers and hosting partners", "Payment processors", "Analytics providers", "Law enforcement agencies when legally required", "Safety and fraud prevention partners"].map((i) => <Bullet key={i} text={i} />)}
        <PP>Information may also be shared during mergers, acquisitions, or business restructuring.</PP>
      </>
    ),
  },
  {
    num: "8",
    title: "Data Security",
    icon: "lock",
    color: "#22C55E",
    content: (
      <>
        <PP>Ridhi implements industry-standard security measures including:</PP>
        {["Encryption technologies", "Secure servers", "Access control systems", "Monitoring and fraud detection", "Security audits and updates"].map((i) => <Bullet key={i} text={i} />)}
        <PP>However, no internet-based service can guarantee 100% security.</PP>
      </>
    ),
  },
  {
    num: "9",
    title: "User Safety & Protection",
    icon: "shield",
    color: "#E91E8C",
    content: (
      <>
        <PP>Ridhi is committed to maintaining a safe digital environment. We may:</PP>
        {["Remove harmful or illegal content", "Suspend or terminate violating accounts", "Monitor suspicious activities", "Restrict abusive users", "Use automated moderation technologies"].map((i) => <Bullet key={i} text={i} />)}
      </>
    ),
  },
  {
    num: "10",
    title: "Children's Privacy",
    icon: "user-x",
    color: "#FF3B30",
    content: (
      <>
        <PP>Ridhi is not intended for children under 13 years of age (or the minimum legal age in your country).</PP>
        <PP>We do not knowingly collect personal information from children. If such information is identified, it will be removed promptly.</PP>
      </>
    ),
  },
  {
    num: "11",
    title: "Cookies & Tracking Technologies",
    icon: "activity",
    color: "#00BCD4",
    content: (
      <>
        <PP>Ridhi may use cookies and similar technologies to:</PP>
        {["Remember user preferences", "Improve functionality", "Analyze traffic and engagement", "Deliver relevant content and advertisements"].map((i) => <Bullet key={i} text={i} />)}
        <PP>Users may control cookies through browser settings.</PP>
      </>
    ),
  },
  {
    num: "12",
    title: "Third-Party Services",
    icon: "external-link",
    color: "#FFB800",
    content: (
      <>
        <PP>Ridhi may integrate third-party services including:</PP>
        {["Payment gateways", "Social login providers", "Analytics tools", "Cloud hosting services"].map((i) => <Bullet key={i} text={i} />)}
        <PP>These third parties may have their own privacy policies.</PP>
      </>
    ),
  },
  {
    num: "13",
    title: "Data Retention",
    icon: "archive",
    color: "#7B2FBE",
    content: (
      <>
        <PP>We retain user information:</PP>
        {["As long as accounts remain active", "As necessary for legal obligations", "For fraud prevention and dispute resolution", "For operational and security purposes"].map((i) => <Bullet key={i} text={i} />)}
        <PP>Deleted content may remain in backup systems for a limited period.</PP>
      </>
    ),
  },
  {
    num: "14",
    title: "Your Rights",
    icon: "check-circle",
    color: "#4CAF50",
    content: (
      <>
        <PP>Depending on your location and applicable laws, you may have rights to:</PP>
        {["Access your data", "Correct inaccurate information", "Delete your account", "Withdraw consent", "Restrict data processing", "Request a copy of your data"].map((i) => <Bullet key={i} text={i} />)}
        <PP>Requests can be submitted to: <LinkText href="mailto:hello@ridhi.app">hello@ridhi.app</LinkText></PP>
      </>
    ),
  },
  {
    num: "15",
    title: "Account Deletion",
    icon: "trash-2",
    color: "#FF3B30",
    content: (
      <>
        <PP>Users can request account deletion through the app settings or by contacting support.</PP>
        <PP>Upon deletion:</PP>
        {["Public profile information may be removed", "Messages and shared content may remain visible to others", "Certain records may be retained for legal and security reasons"].map((i) => <Bullet key={i} text={i} />)}
      </>
    ),
  },
  {
    num: "16",
    title: "International Data Transfers",
    icon: "globe",
    color: "#00BCD4",
    content: (
      <>
        <PP>Your information may be stored or processed in multiple countries where Ridhi or its partners operate servers and services.</PP>
        <PP>By using Ridhi, you consent to such transfers.</PP>
      </>
    ),
  },
  {
    num: "17",
    title: "Changes to This Policy",
    icon: "refresh-cw",
    color: "#FF6B35",
    content: (
      <>
        <PP>Ridhi may update this Privacy Policy periodically. Updated versions will be published on <LinkText href="https://ridhi.app/">ridhi.app</LinkText>.</PP>
        <PP>Continued use of the platform after updates constitutes acceptance of the revised policy.</PP>
      </>
    ),
  },
  {
    num: "18",
    title: "Contact Us",
    icon: "mail",
    color: "#E91E8C",
    content: (
      <>
        <ContactRow icon="mail" label="Support" value="hello@ridhi.app" href="mailto:hello@ridhi.app" />
        <ContactRow icon="briefcase" label="Business" value="hello@ridhi.app" href="mailto:hello@ridhi.app" />
        <ContactRow icon="globe" label="Website" value="ridhi.app" href="https://ridhi.app/" />
      </>
    ),
  },
];

function PP({ children, style }: { children: React.ReactNode; style?: object }) {
  const colors = useColors();
  return <Text style={[pp.body, { color: colors.mutedForeground }, style]}>{children}</Text>;
}

function LinkText({ children, href }: { children: React.ReactNode; href: string }) {
  const colors = useColors();
  return <Text style={{ color: colors.primary, fontFamily: "Inter_500Medium" }} onPress={() => Linking.openURL(href)}>{children}</Text>;
}

function Bullet({ text }: { text: string }) {
  const colors = useColors();
  return (
    <View style={pp.bulletRow}>
      <View style={[pp.dot, { backgroundColor: colors.primary }]} />
      <Text style={[pp.bulletText, { color: colors.mutedForeground }]}>{text}</Text>
    </View>
  );
}

function SubSection({ label, children }: { label: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={pp.subSection}>
      <Text style={[pp.subLabel, { color: colors.foreground }]}>{label}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value, link }: { label: string; value: string; link?: boolean }) {
  const colors = useColors();
  return (
    <View style={pp.infoRow}>
      <Text style={[pp.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text
        style={[pp.infoValue, { color: link ? colors.primary : colors.foreground }]}
        onPress={link ? () => Linking.openURL(value.includes("@") ? `mailto:${value}` : value) : undefined}
      >
        {value}
      </Text>
    </View>
  );
}

function ContactRow({ icon, label, value, href }: { icon: React.ComponentProps<typeof Feather>["name"]; label: string; value: string; href: string }) {
  const colors = useColors();
  return (
    <Pressable onPress={() => Linking.openURL(href)} style={[pp.contactBtn, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Feather name={icon} size={15} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={[pp.contactLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[pp.contactValue, { color: colors.foreground }]}>{value}</Text>
      </View>
      <Feather name="external-link" size={13} color={colors.mutedForeground} />
    </Pressable>
  );
}

export default function PrivacyPolicyScreen() {
  useTrackScreen("privacy_policy");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({ inputRange: [0, 80], outputRange: [0, 1], extrapolate: "clamp" });

  return (
    <>
      <SeoHead
        title="Privacy Policy — Ridhi App | Data Protection & User Privacy"
        description="Read Ridhi's Privacy Policy — how we collect, use, and protect your personal data. Learn about cookies, data rights, and security measures."
        robots="index, follow, noarchive"
      />
      <View style={[s.root, { backgroundColor: colors.background }]}>
      {/* Sticky header */}
      <Animated.View style={[s.stickyHeader, { paddingTop: topPad, backgroundColor: colors.surface + "F2", borderBottomColor: colors.border, opacity: headerOpacity }]}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[s.stickyTitle, { color: colors.foreground }]}>Privacy Policy</Text>
        <View style={{ width: 36 }} />
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* Hero */}
        <LinearGradient
          colors={["#1A0533", "#2D0A5E"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[s.hero, { paddingTop: topPad + 16 }]}
        >
          <Pressable onPress={() => router.back()} style={s.heroBack}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <View style={s.heroIconWrap}>
            <Feather name="shield" size={36} color="#E91E8C" />
          </View>
          <Text style={s.heroTitle}>Privacy Policy</Text>
          <Text style={s.heroSub}>Ridhi — Krilo Digitech Pvt. Ltd.</Text>
          <View style={s.heroBadgeRow}>
            <View style={s.heroBadge}>
              <Feather name="calendar" size={11} color="rgba(255,255,255,0.7)" />
              <Text style={s.heroBadgeText}>Effective: May 17, 2026</Text>
            </View>
            <View style={s.heroBadge}>
              <Feather name="list" size={11} color="rgba(255,255,255,0.7)" />
              <Text style={s.heroBadgeText}>18 Sections</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Intro banner */}
        <View style={[s.introBanner, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
          <Feather name="info" size={15} color={colors.primary} style={{ marginTop: 1, flexShrink: 0 }} />
          <Text style={[s.introText, { color: colors.mutedForeground }]}>
            Your privacy is important to us. This policy explains how Ridhi collects, uses, stores, protects, and shares your information when you use our app and services.
          </Text>
        </View>

        {/* Sections */}
        {SECTIONS.map((sec) => (
          <SectionCard key={sec.num} sec={sec} colors={colors} />
        ))}

        {/* Footer */}
        <View style={s.footer}>
          <View style={[s.footerDivider, { backgroundColor: colors.border }]} />
          <Text style={[s.footerText, { color: colors.mutedForeground }]}>© 2025 Krilo Digitech Pvt. Ltd.</Text>
          <Text style={[s.footerText, { color: colors.mutedForeground }]}>All rights reserved.</Text>
          <Pressable onPress={() => Linking.openURL("https://ridhi.app/")} style={{ marginTop: 6 }}>
            <Text style={[s.footerLink, { color: colors.primary }]}>ridhi.app</Text>
          </Pressable>
        </View>
      </Animated.ScrollView>
    </View>
    </>
  );
}

function SectionCard({ sec, colors }: { sec: Section; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={s.cardHeader}>
        <View style={[s.cardIconWrap, { backgroundColor: sec.color + "18" }]}>
          <Feather name={sec.icon} size={16} color={sec.color} />
        </View>
        <View style={[s.secNumBadge, { backgroundColor: sec.color + "18" }]}>
          <Text style={[s.secNum, { color: sec.color }]}>{sec.num}</Text>
        </View>
        <Text style={[s.cardTitle, { color: colors.foreground }]}>{sec.title}</Text>
      </View>
      <View style={[s.cardDivider, { backgroundColor: colors.border }]} />
      <View style={s.cardBody}>{sec.content}</View>
    </View>
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
  hero: { paddingHorizontal: 20, paddingBottom: 28, alignItems: "center", gap: 8 },
  heroBack: { alignSelf: "flex-start", padding: 6, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.12)", marginBottom: 8 },
  heroIconWrap: { width: 76, height: 76, borderRadius: 22, backgroundColor: "rgba(233,30,140,0.18)", alignItems: "center", justifyContent: "center" },
  heroTitle: { color: "#fff", fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginTop: 4 },
  heroSub: { color: "rgba(255,255,255,0.65)", fontSize: 13, fontFamily: "Inter_400Regular" },
  heroBadgeRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20 },
  heroBadgeText: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Inter_500Medium" },
  introBanner: { marginHorizontal: 16, marginTop: 14, borderRadius: 14, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  introText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  card: { marginHorizontal: 16, marginTop: 12, borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  cardIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  secNumBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  secNum: { fontSize: 11, fontFamily: "Inter_700Bold" },
  cardTitle: { flex: 1, fontSize: 14, fontFamily: "Inter_700Bold" },
  cardDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 14 },
  cardBody: { padding: 14, gap: 6 },
  footer: { alignItems: "center", paddingTop: 28, paddingBottom: 8, gap: 3 },
  footerDivider: { width: 60, height: 1, marginBottom: 14 },
  footerText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  footerLink: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});

const pp = StyleSheet.create({
  body: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 21, marginBottom: 4 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 9, marginBottom: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 7, flexShrink: 0 },
  bulletText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  subSection: { marginBottom: 10, gap: 4 },
  subLabel: { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 6 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 7, gap: 12 },
  infoLabel: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },
  infoValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", flex: 2, textAlign: "right" },
  contactBtn: { flexDirection: "row", alignItems: "center", gap: 12, padding: 13, borderRadius: 13, borderWidth: 1, marginBottom: 8 },
  contactLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  contactValue: { fontSize: 13, fontFamily: "Inter_500Medium" },
});
