import React, { useRef } from "react";
import {
  Animated,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { FloatingEmojiBg } from "@/components/FloatingEmojiBg";

type Colors = ReturnType<typeof useColors>;

// ── Shared mini-components ───────────────────────────────────────────────────

function PP({ children, style }: { children: React.ReactNode; style?: object }) {
  const colors = useColors();
  return <Text style={[tc.body, { color: colors.mutedForeground }, style]}>{children}</Text>;
}

function Bullet({ text }: { text: string }) {
  const colors = useColors();
  return (
    <View style={tc.bulletRow}>
      <View style={[tc.dot, { backgroundColor: colors.primary }]} />
      <Text style={[tc.bulletText, { color: colors.mutedForeground }]}>{text}</Text>
    </View>
  );
}

function SubSection({ label, children }: { label: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={tc.sub}>
      <Text style={[tc.subLabel, { color: colors.foreground }]}>{label}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value, link }: { label: string; value: string; link?: boolean }) {
  const colors = useColors();
  return (
    <View style={tc.infoRow}>
      <Text style={[tc.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text
        style={[tc.infoValue, { color: link ? colors.primary : colors.foreground }]}
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
    <Pressable onPress={() => Linking.openURL(href)} style={[tc.contactBtn, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Feather name={icon} size={15} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={[tc.contactLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[tc.contactValue, { color: colors.foreground }]}>{value}</Text>
      </View>
      <Feather name="external-link" size={13} color={colors.mutedForeground} />
    </Pressable>
  );
}

// ── Section definitions ──────────────────────────────────────────────────────

type SectionDef = {
  num: string;
  title: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  color: string;
  body: () => React.ReactNode;
};

const SECTIONS: SectionDef[] = [
  {
    num: "1", title: "Introduction", icon: "info", color: "#7B2FBE",
    body: () => (
      <>
        <PP>Welcome to Ridhi. These Terms & Conditions ("Terms") govern your access to and use of the Ridhi mobile application, website, products, features, content, and services operated by Krilo Digitech Pvt Ltd.</PP>
        <PP>By accessing or using Ridhi, you agree to comply with and be legally bound by these Terms. If you do not agree, you must discontinue use of the platform immediately.</PP>
        <PP>Ridhi is a social networking and community engagement platform that enables users to connect through messaging, audio calls, video calls, virtual gifting, entertainment, communities, creator interactions, and social features.</PP>
      </>
    ),
  },
  {
    num: "2", title: "Eligibility", icon: "user-check", color: "#E91E8C",
    body: () => (
      <>
        <PP>To use Ridhi, you must:</PP>
        {["Be at least 18 years old or the minimum legal age in your jurisdiction.", "Have the legal capacity to enter into a binding agreement.", "Not be prohibited from using online social networking services under applicable laws.", "Provide accurate and complete registration information."].map(t => <Bullet key={t} text={t} />)}
        <PP>Users under 18 are strictly prohibited from using audio/video matching, virtual gifting, or monetization features.</PP>
      </>
    ),
  },
  {
    num: "3", title: "User Account Registration", icon: "user-plus", color: "#00BCD4",
    body: () => (
      <>
        <PP>When creating an account on Ridhi:</PP>
        {["You must provide accurate, current, and complete information.", "You are responsible for maintaining the confidentiality of your account credentials.", "You are fully responsible for all activities under your account.", "You must immediately notify us of unauthorized access or security breaches.", "We reserve the right to suspend or terminate accounts that provide false information."].map(t => <Bullet key={t} text={t} />)}
        <SubSection label="You may register using:">
          {["Mobile Number", "Email Address", "Social Login Integrations", "OTP-Based Verification"].map(t => <Bullet key={t} text={t} />)}
        </SubSection>
      </>
    ),
  },
  {
    num: "4", title: "User Conduct & Responsibilities", icon: "alert-triangle", color: "#FF3B30",
    body: () => (
      <>
        <PP>Users agree not to:</PP>
        {["Post illegal, harmful, abusive, hateful, threatening, or misleading content.", "Upload sexually explicit, pornographic, or exploitative material.", "Harass, bully, stalk, or intimidate other users.", "Impersonate another person, celebrity, company, or entity.", "Share fake news, scams, or fraudulent information.", "Use automated bots, scripts, or unauthorized software.", "Attempt to hack, disrupt, or manipulate platform systems.", "Violate intellectual property or privacy rights.", "Promote violence, terrorism, or criminal activity.", "Share another person's private information without consent."].map(t => <Bullet key={t} text={t} />)}
        <SubSection label="Violations may result in:">
          {["Content removal", "Temporary suspension", "Permanent account ban", "Legal action", "Reporting to law enforcement authorities"].map(t => <Bullet key={t} text={t} />)}
        </SubSection>
      </>
    ),
  },
  {
    num: "5", title: "Community Guidelines", icon: "heart", color: "#E91E8C",
    body: () => (
      <>
        <PP>Ridhi promotes a respectful and inclusive community. Users must:</PP>
        {["Respect all cultures, genders, and communities.", "Maintain polite communication during chats and calls.", "Avoid abusive or discriminatory language.", "Follow platform safety and moderation standards.", "Respect consent and personal boundaries."].map(t => <Bullet key={t} text={t} />)}
        <PP>The Company reserves the right to review, moderate, remove, restrict, or disable any content or account that violates community standards.</PP>
      </>
    ),
  },
  {
    num: "6", title: "Audio & Video Calling Services", icon: "phone-call", color: "#00BCD4",
    body: () => (
      <>
        <PP>Ridhi may provide One-to-One Audio & Video Calls, Random Matching Calls, Creator/Performer Interactions, and Coin-Based Communication Features.</PP>
        <PP>By using calling services:</PP>
        {["Users consent to real-time interactions with other users.", "Users are solely responsible for their behavior during calls.", "Recording, distributing, or misusing calls without consent is prohibited.", "The platform may monitor interactions for safety and moderation purposes.", "Calls may require virtual coins or paid access."].map(t => <Bullet key={t} text={t} />)}
        <PP>Ridhi does not guarantee compatibility, uninterrupted service, or successful matching.</PP>
      </>
    ),
  },
  {
    num: "7", title: "Virtual Coins & Digital Purchases", icon: "credit-card", color: "#FFB800",
    body: () => (
      <>
        <PP>Ridhi may offer virtual coins, gifts, subscriptions, badges, and premium digital services.</PP>
        {["Virtual coins have no real-world monetary value.", "Coins are non-transferable and non-refundable unless required by law.", "Users cannot exchange coins for cash.", "Prices may vary based on region, taxes, or payment provider.", "Fraudulent transactions may lead to account suspension.", "We reserve the right to modify pricing and coin structures at any time."].map(t => <Bullet key={t} text={t} />)}
        <PP>Users are responsible for all purchases made through their accounts.</PP>
      </>
    ),
  },
  {
    num: "8", title: "Refund & Cancellation Policy", icon: "refresh-cw", color: "#FF6B35",
    body: () => (
      <>
        <PP>Unless otherwise required under applicable law:</PP>
        {["All digital purchases are final.", "Coin purchases, virtual gifts, subscriptions, and premium features are non-refundable.", "Refund requests may only be considered in cases of duplicate transactions or technical failures verified by the Company."].map(t => <Bullet key={t} text={t} />)}
        <PP>For billing concerns, contact: <Text style={{ color: "#E91E8C" }} onPress={() => Linking.openURL("mailto:support@ridhi.app")}>support@ridhi.app</Text></PP>
      </>
    ),
  },
  {
    num: "9", title: "Creator & Performer Policies", icon: "star", color: "#FFB800",
    body: () => (
      <>
        <PP>Creators, performers, influencers, and hosts using Ridhi must:</PP>
        {["Follow all platform rules and local laws.", "Avoid misleading promotions or fraudulent activities.", "Not engage in explicit adult content.", "Maintain respectful interactions with users.", "Ensure authenticity of profile and content."].map(t => <Bullet key={t} text={t} />)}
        <SubSection label="The Company reserves the right to:">
          {["Suspend creator monetization", "Remove creator content", "Withhold payouts for policy violations", "Terminate creator partnerships"].map(t => <Bullet key={t} text={t} />)}
        </SubSection>
      </>
    ),
  },
  {
    num: "10", title: "User Content Rights", icon: "image", color: "#4CAF50",
    body: () => (
      <>
        <PP>Users retain ownership of content they create and upload.</PP>
        <PP>By posting content on Ridhi, you grant the Company a worldwide, non-exclusive, royalty-free license to:</PP>
        {["Host", "Store", "Display", "Distribute", "Reproduce", "Modify", "Promote", "Use content for platform operations and marketing"].map(t => <Bullet key={t} text={t} />)}
        <PP>This license remains active while the content is available on the platform. Users confirm that they own or have permission to use uploaded content and that it does not violate any law or third-party rights.</PP>
      </>
    ),
  },
  {
    num: "11", title: "Intellectual Property", icon: "award", color: "#7B2FBE",
    body: () => (
      <>
        <PP>All Ridhi branding, logos, designs, software, graphics, text, features, trademarks, and technology are owned by Krilo Digitech Pvt Ltd or its licensors.</PP>
        <PP>Users may not:</PP>
        {["Copy platform code or design", "Reverse engineer the application", "Reproduce branding assets", "Use Ridhi trademarks without permission", "Create unauthorized derivative products"].map(t => <Bullet key={t} text={t} />)}
        <PP>Unauthorized use may result in legal action.</PP>
      </>
    ),
  },
  {
    num: "12", title: "Privacy & Data Protection", icon: "shield", color: "#22C55E",
    body: () => (
      <>
        <PP>Your use of Ridhi is also governed by our Privacy Policy. By using the platform, you consent to:</PP>
        {["Collection of user information", "Processing of account data", "Use of cookies and analytics", "Safety monitoring systems", "Fraud prevention measures"].map(t => <Bullet key={t} text={t} />)}
        <PP>The Company implements reasonable security practices but cannot guarantee absolute protection from cyber threats or unauthorized access.</PP>
      </>
    ),
  },
  {
    num: "13", title: "Safety & Reporting", icon: "flag", color: "#FF3B30",
    body: () => (
      <>
        <PP>Users can report: harassment, fake profiles, abuse, fraud, inappropriate content, and safety concerns.</PP>
        <PP>The Company may investigate reports, restrict accounts, remove content, and cooperate with legal authorities.</PP>
        <PP>Emergency situations should always be reported to local law enforcement agencies.</PP>
      </>
    ),
  },
  {
    num: "14", title: "Third-Party Services", icon: "external-link", color: "#00BCD4",
    body: () => (
      <>
        <PP>Ridhi may contain third-party advertisements, payment gateways, social integrations, external links, and analytics tools.</PP>
        <PP>We are not responsible for third-party services, external websites, payment provider issues, third-party content accuracy, or external privacy practices.</PP>
        <PP>Users access third-party services at their own risk.</PP>
      </>
    ),
  },
  {
    num: "15", title: "Advertisements & Promotions", icon: "tv", color: "#FF6B35",
    body: () => (
      <>
        <PP>Ridhi may display sponsored content, promotional campaigns, brand advertisements, and affiliate promotions.</PP>
        <PP>Users interacting with advertisers do so independently. The Company is not responsible for disputes between users and advertisers.</PP>
      </>
    ),
  },
  {
    num: "16", title: "Account Suspension & Termination", icon: "slash", color: "#E91E8C",
    body: () => (
      <>
        <PP>We reserve the right to suspend or terminate accounts without prior notice if users violate these Terms, engage in harmful activities, commit fraud or abuse, upload prohibited content, violate applicable laws, or threaten platform safety.</PP>
        <PP>The Company may also remove content, restrict features, disable monetization, or block device access.</PP>
        <PP>Users may request account deletion by contacting support.</PP>
      </>
    ),
  },
  {
    num: "17", title: "Disclaimer of Warranties", icon: "alert-circle", color: "#FFB800",
    body: () => (
      <>
        <PP>Ridhi services are provided on an "AS IS" and "AS AVAILABLE" basis. We do not guarantee:</PP>
        {["Uninterrupted availability", "Error-free services", "Complete security", "Compatibility across all devices", "Accuracy of user-generated content", "Continuous operation without downtime"].map(t => <Bullet key={t} text={t} />)}
        <PP>Use of the platform is at the user's own risk.</PP>
      </>
    ),
  },
  {
    num: "18", title: "Limitation of Liability", icon: "minimize", color: "#7B2FBE",
    body: () => (
      <>
        <PP>To the maximum extent permitted by law, Krilo Digitech Pvt Ltd shall not be liable for:</PP>
        {["Indirect damages", "Loss of profits", "Data loss", "Reputation damage", "User disputes", "Service interruptions", "Unauthorized account access", "Third-party actions"].map(t => <Bullet key={t} text={t} />)}
        <PP>Our total liability shall not exceed the amount paid by the user, if any, during the previous 12 months.</PP>
      </>
    ),
  },
  {
    num: "19", title: "Indemnification", icon: "umbrella", color: "#4CAF50",
    body: () => (
      <>
        <PP>Users agree to indemnify and hold harmless Krilo Digitech Pvt Ltd, its directors, employees, partners, and affiliates from any claims, damages, losses, liabilities, or legal expenses arising from:</PP>
        {["Violation of these Terms", "Misuse of the platform", "User-generated content", "Violation of laws or third-party rights"].map(t => <Bullet key={t} text={t} />)}
      </>
    ),
  },
  {
    num: "20", title: "Compliance With Laws", icon: "book-open", color: "#00BCD4",
    body: () => (
      <>
        <PP>Users agree to comply with all applicable local, national, and international laws while using Ridhi.</PP>
        <PP>Users are solely responsible for ensuring their activities are lawful in their jurisdiction.</PP>
      </>
    ),
  },
  {
    num: "21", title: "Governing Law & Jurisdiction", icon: "map-pin", color: "#E91E8C",
    body: () => (
      <>
        <PP>These Terms shall be governed by and interpreted under the laws of India.</PP>
        <PP>Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of courts located in Chennai, Tamil Nadu, India.</PP>
      </>
    ),
  },
  {
    num: "22", title: "Changes to Terms", icon: "edit-3", color: "#FFB800",
    body: () => (
      <>
        <PP>We may update or modify these Terms at any time. Updated versions will be posted on <Text style={{ color: "#E91E8C" }} onPress={() => Linking.openURL("https://ridhi.app/")}>ridhi.app</Text>.</PP>
        <PP>Continued use of Ridhi after updates constitutes acceptance of revised Terms.</PP>
      </>
    ),
  },
  {
    num: "23", title: "Contact Information", icon: "mail", color: "#7B2FBE",
    body: () => (
      <>
        <ContactRow icon="globe" label="Website" value="ridhi.app" href="https://ridhi.app/" />
        <ContactRow icon="mail" label="Support" value="support@ridhi.app" href="mailto:support@ridhi.app" />
        <ContactRow icon="briefcase" label="Business" value="hey@ridhi.app" href="mailto:hey@ridhi.app" />
      </>
    ),
  },
  {
    num: "24", title: "Acceptance of Terms", icon: "check-circle", color: "#22C55E",
    body: () => (
      <>
        <PP>By accessing or using Ridhi, you confirm that:</PP>
        {["You have read these Terms & Conditions.", "You understand your rights and obligations.", "You agree to comply with all platform rules and applicable laws.", "You consent to the platform's policies and moderation systems."].map(t => <Bullet key={t} text={t} />)}
        <PP>If you do not agree with these Terms, please discontinue use of Ridhi immediately.</PP>
      </>
    ),
  },
];

// ── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ sec, colors }: { sec: SectionDef; colors: Colors }) {
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
      <View style={s.cardBody}>{sec.body()}</View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function TermsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({ inputRange: [0, 80], outputRange: [0, 1], extrapolate: "clamp" });

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <FloatingEmojiBg preset="settings" />
      {/* Sticky header */}
      <Animated.View style={[s.stickyHeader, { paddingTop: topPad, backgroundColor: colors.surface + "F2", borderBottomColor: colors.border, opacity: headerOpacity }]}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[s.stickyTitle, { color: colors.foreground }]}>Terms & Conditions</Text>
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
          colors={["#0A1628", "#1A0533"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[s.hero, { paddingTop: topPad + 16 }]}
        >
          <Pressable onPress={() => router.back()} style={s.heroBack}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <View style={s.heroIconWrap}>
            <Feather name="file-text" size={36} color="#7B2FBE" />
          </View>
          <Text style={s.heroTitle}>Terms & Conditions</Text>
          <Text style={s.heroSub}>Ridhi — Krilo Digitech Pvt. Ltd.</Text>
          <View style={s.heroBadgeRow}>
            <View style={s.heroBadge}>
              <Feather name="calendar" size={11} color="rgba(255,255,255,0.7)" />
              <Text style={s.heroBadgeText}>Effective: May 17, 2026</Text>
            </View>
            <View style={s.heroBadge}>
              <Feather name="list" size={11} color="rgba(255,255,255,0.7)" />
              <Text style={s.heroBadgeText}>24 Sections</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Company info strip */}
        <View style={[s.infoStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <InfoRow label="Company" value="Krilo Digitech Pvt Ltd" />
          <View style={[s.rowDivider, { backgroundColor: colors.border }]} />
          <InfoRow label="Website" value="https://ridhi.app/" link />
          <View style={[s.rowDivider, { backgroundColor: colors.border }]} />
          <InfoRow label="Support" value="support@ridhi.app" link />
          <View style={[s.rowDivider, { backgroundColor: colors.border }]} />
          <InfoRow label="Business" value="hey@ridhi.app" link />
        </View>

        {/* Notice banner */}
        <View style={[s.noticeBanner, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
          <Feather name="alert-circle" size={15} color={colors.primary} style={{ flexShrink: 0, marginTop: 1 }} />
          <Text style={[s.noticeText, { color: colors.mutedForeground }]}>
            By accessing or using Ridhi, you agree to comply with and be legally bound by these Terms. Please read them carefully.
          </Text>
        </View>

        {/* All 24 sections */}
        {SECTIONS.map((sec) => (
          <SectionCard key={sec.num} sec={sec} colors={colors} />
        ))}

        {/* Footer */}
        <View style={[s.footerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <LinearGradient colors={["#7B2FBE22", "#E91E8C18"]} style={s.footerGrad}>
            <Feather name="check-circle" size={24} color="#22C55E" />
            <Text style={[s.footerHeading, { color: colors.foreground }]}>Agreement Acknowledged</Text>
            <Text style={[s.footerBody, { color: colors.mutedForeground }]}>
              By using Ridhi, you confirm you have read, understood, and agreed to these Terms & Conditions.
            </Text>
            <Text style={[s.footerCopy, { color: colors.mutedForeground }]}>
              © 2026 Krilo Digitech Pvt. Ltd. · All Rights Reserved.
            </Text>
          </LinearGradient>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

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
  heroBack: { alignSelf: "flex-start", padding: 6, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)", marginBottom: 8 },
  heroIconWrap: { width: 76, height: 76, borderRadius: 22, backgroundColor: "rgba(123,47,190,0.2)", alignItems: "center", justifyContent: "center" },
  heroTitle: { color: "#fff", fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginTop: 4 },
  heroSub: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "Inter_400Regular" },
  heroBadgeRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20 },
  heroBadgeText: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Inter_500Medium" },
  infoStrip: { marginHorizontal: 16, marginTop: 14, borderRadius: 16, borderWidth: 1, padding: 14, gap: 2 },
  rowDivider: { height: StyleSheet.hairlineWidth, marginVertical: 6 },
  noticeBanner: { marginHorizontal: 16, marginTop: 10, borderRadius: 14, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  noticeText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  card: { marginHorizontal: 16, marginTop: 10, borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  cardIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  secNumBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  secNum: { fontSize: 11, fontFamily: "Inter_700Bold" },
  cardTitle: { flex: 1, fontSize: 14, fontFamily: "Inter_700Bold" },
  cardDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 14 },
  cardBody: { padding: 14, gap: 4 },
  footerCard: { marginHorizontal: 16, marginTop: 16, borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  footerGrad: { padding: 24, alignItems: "center", gap: 10 },
  footerHeading: { fontSize: 16, fontFamily: "Inter_700Bold", marginTop: 4 },
  footerBody: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  footerCopy: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 6 },
});

const tc = StyleSheet.create({
  body: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 21, marginBottom: 4 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 9, marginBottom: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 7, flexShrink: 0 },
  bulletText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  sub: { marginTop: 8, marginBottom: 4, gap: 4 },
  subLabel: { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 4 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 5, gap: 12 },
  infoLabel: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },
  infoValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", flex: 2, textAlign: "right" },
  contactBtn: { flexDirection: "row", alignItems: "center", gap: 12, padding: 13, borderRadius: 13, borderWidth: 1, marginBottom: 8 },
  contactLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  contactValue: { fontSize: 13, fontFamily: "Inter_500Medium" },
});
