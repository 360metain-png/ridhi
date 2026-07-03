import React, { useRef, useState } from "react";
import {
  Animated,
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
import { useColors } from "@/hooks/useColors"
import { useTrackScreen } from "@/hooks/useAnalytics";
;

type Colors = ReturnType<typeof useColors>;

// ── FAQ data ─────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "How do I create a Ridhi account?",
    a: "You can create an account using:\n\n• Mobile Number (OTP Verification)\n• Email Address\n• Social Login (if available)\n\nAfter registration, complete your profile to access all platform features.",
  },
  {
    q: "I did not receive the OTP. What should I do?",
    a: "Please try the following:\n\n• Check your mobile network connection\n• Wait 30–60 seconds and request OTP again\n• Ensure your number is entered correctly\n\nIf the issue continues, contact: hello@ridhi.app",
  },
  {
    q: "How can I reset my password?",
    a: "Go to Login Page → Forgot Password → Enter your registered mobile number or email → Verify OTP or reset link → Create a new password.",
  },
  {
    q: "How do Audio & Video Calls work?",
    a: "Ridhi offers coin-based calling for all users.\n\n• New users get a one-time 3-minute FREE audio call trial (lifetime, not daily)\n• After the trial, audio calls cost 10 coins/min\n• Video calls ALWAYS require coins at 25 coins/min — never free\n• VIP subscribers get discounted call rates (20–60% off)\n• All coin deductions are server-verified in real-time\n\nRecharge coins in your Wallet to continue calling after your trial.",
  },
  {
    q: "What are Ridhi Coins?",
    a: "Ridhi Coins are virtual digital credits used for:\n\n• Gifts\n• Premium Features\n• Audio & Video Calls\n• Creator Support\n• Games & Interactive Features\n\nCoins are non-transferable and may not be refundable except where required by applicable law.",
  },
  {
    q: "How do I report abusive users or inappropriate content?",
    a: "You can:\n\n• Use the \"Report\" button inside the app\n• Block the user directly\n• Contact support at hello@ridhi.app\n\nOur moderation team reviews all reports to maintain community safety.",
  },
  {
    q: "How do I delete my Ridhi account?",
    a: "Go to Settings → Account → Delete Account\n\nOr contact: hello@ridhi.app\n\nNote: Account deletion may be permanent. Certain records may be retained for legal or security purposes.",
  },
  {
    q: "Why was my account suspended?",
    a: "Accounts may be suspended for:\n\n• Violating community guidelines\n• Fake activity or impersonation\n• Harassment or abusive behavior\n• Spam or illegal activities\n• Multiple policy violations\n\nTo appeal: hello@ridhi.app",
  },
  {
    q: "Is my personal information secure?",
    a: "Ridhi uses reasonable security measures to protect user information. For detailed information, please review the Privacy Policy available in Settings or at ridhi.app.",
  },
  {
    q: "How can creators or performers earn on Ridhi?",
    a: "Eligible creators may earn through:\n\n• Virtual Gifts & Coins\n• Live Sessions\n• Creator Programs\n• Performance Rewards\n• Referral Campaigns\n\nCreator monetization policies may vary by region and eligibility.",
  },
];

const TECH_ISSUES = [
  {
    icon: "alert-octagon" as const,
    color: "#FF3B30",
    title: "App Crashing",
    steps: ["Update the app to the latest version", "Clear app cache", "Restart your device", "Reinstall the application"],
  },
  {
    icon: "wifi" as const,
    color: "#FFB800",
    title: "Slow Performance",
    steps: ["Check internet connection strength", "Switch between Wi-Fi and Mobile Data", "Update to the latest app version"],
  },
  {
    icon: "log-in" as const,
    color: "#00BCD4",
    title: "Login Issues",
    steps: ["Verify OTP is entered correctly", "Reset your password via Forgot Password", "Ensure your account is active and not suspended"],
  },
];

const SAFETY_TIPS = [
  { icon: "lock" as const, color: "#22C55E", tip: "Never share your passwords or OTPs with anyone" },
  { icon: "credit-card" as const, color: "#FF3B30", tip: "Avoid sharing financial information on the platform" },
  { icon: "flag" as const, color: "#FFB800", tip: "Report suspicious users or content immediately" },
  { icon: "slash" as const, color: "#7B2FBE", tip: "Do not engage in illegal or harmful activities" },
  { icon: "settings" as const, color: "#E91E8C", tip: "Use your privacy settings responsibly" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function ContactBtn({ icon, label, value, href }: { icon: React.ComponentProps<typeof Feather>["name"]; label: string; value: string; href: string }) {
  const colors = useColors();
  return (
    <Pressable onPress={() => Linking.openURL(href)} style={[s.contactBtn, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={[s.contactIconWrap, { backgroundColor: colors.primary + "18" }]}>
        <Feather name={icon} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.contactLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[s.contactValue, { color: colors.foreground }]}>{value}</Text>
      </View>
      <Feather name="external-link" size={13} color={colors.mutedForeground} />
    </Pressable>
  );
}

function FaqItem({ item, colors }: { item: typeof FAQS[0]; colors: Colors }) {
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    Animated.spring(anim, { toValue: open ? 0 : 1, useNativeDriver: true, tension: 80, friction: 10 }).start();
    setOpen(!open);
  };

  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });

  return (
    <View style={[s.faqItem, { backgroundColor: colors.card, borderColor: open ? colors.primary + "50" : colors.border }]}>
      <Pressable onPress={toggle} style={s.faqHeader}>
        <Text style={[s.faqQ, { color: colors.foreground, flex: 1 }]}>{item.q}</Text>
        <Animated.View style={{ transform: [{ rotate }], flexShrink: 0 }}>
          <Feather name="chevron-down" size={18} color={colors.mutedForeground} />
        </Animated.View>
      </Pressable>
      {open && (
        <View style={[s.faqAnswer, { borderTopColor: colors.border }]}>
          <Text style={[s.faqA, { color: colors.mutedForeground }]}>{item.a}</Text>
        </View>
      )}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function HelpSupportScreen() {
  useTrackScreen("help_support");
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({ inputRange: [0, 80], outputRange: [0, 1], extrapolate: "clamp" });

  return (
    <>
      <SeoHead
        title="Help & Support — Ridhi App | FAQs, Contact & Troubleshooting"
        description="Get help with Ridhi — browse FAQs, contact support, report issues, and find solutions for live streaming, voice chat, payments, and account problems."
        canonical="/help-support"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Help & Support — Ridhi App",
            url: "https://ridhi.app/help-support",
            inLanguage: "en-IN",
            description: "Get help with Ridhi — FAQs, contact support, and troubleshooting guides.",
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a.replace(/\n/g, " ").replace(/•\s*/g, "").trim() },
            })),
          },
        ]}
      />
      <View style={[s.root, { backgroundColor: colors.background }]}>
      {/* Sticky header */}
      <Animated.View style={[s.stickyHeader, { paddingTop: topPad, backgroundColor: colors.surface + "F2", borderBottomColor: colors.border, opacity: headerOpacity }]}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[s.stickyTitle, { color: colors.foreground }]}>Help & Support</Text>
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
          colors={["#006064", "#00838F"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[s.hero, { paddingTop: topPad + 16 }]}
        >
          <Pressable onPress={() => router.back()} style={s.heroBack}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <View style={s.heroIconWrap}>
            <Feather name="headphones" size={36} color="#fff" />
          </View>
          <Text style={s.heroTitle}>Help & Support</Text>
          <Text style={s.heroSub}>
            We're here to ensure your experience{"\n"}on Ridhi is safe, smooth, and enjoyable.
          </Text>
          {/* Availability chip */}
          <View style={s.availChip}>
            <View style={s.availDot} />
            <Text style={s.availText}>Mon – Sat · 10:00 AM – 7:00 PM IST</Text>
          </View>
        </LinearGradient>

        {/* Quick contact */}
        <View style={s.sectionWrap}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Contact Support</Text>
          <ContactBtn icon="mail" label="Customer Support" value="hello@ridhi.app" href="mailto:hello@ridhi.app" />
          <ContactBtn icon="briefcase" label="Business Inquiries" value="hello@ridhi.app" href="mailto:hello@ridhi.app" />
          <ContactBtn icon="globe" label="Website" value="ridhi.app" href="https://ridhi.app/" />
        </View>

        {/* FAQs */}
        <View style={s.sectionWrap}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Frequently Asked Questions</Text>
          <Text style={[s.sectionSub, { color: colors.mutedForeground }]}>Tap a question to expand the answer</Text>
          {FAQS.map((item, i) => (
            <FaqItem key={i} item={item} colors={colors} />
          ))}
        </View>

        {/* Safety tips */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.cardHeaderRow}>
            <View style={[s.cardIconWrap, { backgroundColor: "#22C55E18" }]}>
              <Feather name="shield" size={16} color="#22C55E" />
            </View>
            <Text style={[s.cardTitle, { color: colors.foreground }]}>Safety Tips</Text>
          </View>
          <View style={[s.cardDivider, { backgroundColor: colors.border }]} />
          <View style={s.cardBody}>
            {SAFETY_TIPS.map((t, i) => (
              <View key={i} style={s.tipRow}>
                <View style={[s.tipIcon, { backgroundColor: t.color + "1A" }]}>
                  <Feather name={t.icon} size={14} color={t.color} />
                </View>
                <Text style={[s.tipText, { color: colors.mutedForeground }]}>{t.tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Technical support */}
        <View style={s.sectionWrap}>
          <Text style={[s.sectionTitle, { color: colors.foreground }]}>Technical Support</Text>
          {TECH_ISSUES.map((issue) => (
            <View key={issue.title} style={[s.techCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={s.techHeader}>
                <View style={[s.techIcon, { backgroundColor: issue.color + "1A" }]}>
                  <Feather name={issue.icon} size={16} color={issue.color} />
                </View>
                <Text style={[s.techTitle, { color: colors.foreground }]}>{issue.title}</Text>
              </View>
              {issue.steps.map((step, i) => (
                <View key={i} style={s.stepRow}>
                  <View style={[s.stepNum, { backgroundColor: issue.color + "1A" }]}>
                    <Text style={[s.stepNumText, { color: issue.color }]}>{i + 1}</Text>
                  </View>
                  <Text style={[s.stepText, { color: colors.mutedForeground }]}>{step}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Community support */}
        <LinearGradient colors={["#7B2FBE18", "#E91E8C12"]} style={[s.commCard, { borderColor: colors.border }]}>
          <Feather name="users" size={22} color="#7B2FBE" />
          <Text style={[s.commTitle, { color: colors.foreground }]}>Community Support</Text>
          <Text style={[s.commBody, { color: colors.mutedForeground }]}>
            Ridhi encourages positive interactions and respectful communication. Users are expected to follow Community Guidelines, Safety Standards, Platform Policies, and Applicable Laws.
          </Text>
        </LinearGradient>

        {/* Legal quick links */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.cardHeaderRow}>
            <View style={[s.cardIconWrap, { backgroundColor: "#7B2FBE18" }]}>
              <Feather name="book-open" size={16} color="#7B2FBE" />
            </View>
            <Text style={[s.cardTitle, { color: colors.foreground }]}>Legal Information</Text>
          </View>
          <View style={[s.cardDivider, { backgroundColor: colors.border }]} />
          <View style={s.cardBody}>
            <Text style={[s.legalBody, { color: colors.mutedForeground }]}>By using Ridhi, you agree to our:</Text>
            {[
              { label: "Terms & Conditions", route: "/terms" },
              { label: "Privacy Policy", route: "/privacy-policy" },
              { label: "Community Guidelines", route: "/community-guidelines" },
            ].map((item) => (
              <Pressable
                key={item.label}
                onPress={() => item.route ? router.push(item.route as any) : Linking.openURL("https://ridhi.app/")}
                style={[s.legalLink, { borderColor: colors.border }]}
              >
                <Feather name="chevron-right" size={14} color={colors.primary} />
                <Text style={[s.legalLinkText, { color: colors.primary }]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Company info */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.cardHeaderRow}>
            <View style={[s.cardIconWrap, { backgroundColor: "#E91E8C18" }]}>
              <Feather name="briefcase" size={16} color="#E91E8C" />
            </View>
            <Text style={[s.cardTitle, { color: colors.foreground }]}>Company Information</Text>
          </View>
          <View style={[s.cardDivider, { backgroundColor: colors.border }]} />
          <View style={s.cardBody}>
            {[
              { label: "Platform", value: "Ridhi" },
              { label: "Company", value: "Krilo Digitech Pvt Ltd" },
              { label: "Founder", value: "Jadaprolu Hareesh" },
            ].map((row) => (
              <View key={row.label} style={[s.infoRow, { borderBottomColor: colors.border }]}>
                <Text style={[s.infoLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                <Text style={[s.infoValue, { color: colors.foreground }]}>{row.value}</Text>
              </View>
            ))}
            <Pressable onPress={() => Linking.openURL("https://www.krilo.in")} style={[s.infoRow, { borderBottomColor: "transparent" }]}>
              <Text style={[s.infoLabel, { color: colors.mutedForeground }]}>Website</Text>
              <Text style={[s.infoValue, { color: colors.primary }]}>www.krilo.in</Text>
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <View style={[s.footerLine, { backgroundColor: colors.border }]} />
          <Text style={[s.footerText, { color: colors.mutedForeground }]}>© 2026 Krilo Digitech Pvt. Ltd.</Text>
          <Text style={[s.footerText, { color: colors.mutedForeground }]}>All rights reserved.</Text>
        </View>
      </Animated.ScrollView>
    </View>
    </>
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
  hero: { paddingHorizontal: 20, paddingBottom: 28, alignItems: "center", gap: 10 },
  heroBack: { alignSelf: "flex-start", padding: 6, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", marginBottom: 8 },
  heroIconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  heroTitle: { color: "#fff", fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginTop: 4 },
  heroSub: { color: "rgba(255,255,255,0.82)", fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  availChip: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, marginTop: 4 },
  availDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4ADE80" },
  availText: { color: "rgba(255,255,255,0.9)", fontSize: 12, fontFamily: "Inter_500Medium" },
  sectionWrap: { paddingHorizontal: 16, marginTop: 20, gap: 10 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 2 },
  sectionSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 4, marginTop: -4 },
  contactBtn: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  contactIconWrap: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  contactLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  contactValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  faqItem: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  faqHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  faqQ: { fontSize: 13, fontFamily: "Inter_600SemiBold", lineHeight: 20 },
  faqAnswer: { borderTopWidth: StyleSheet.hairlineWidth, padding: 14, paddingTop: 12 },
  faqA: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 21 },
  card: { marginHorizontal: 16, marginTop: 16, borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  cardIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  cardDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 14 },
  cardBody: { padding: 14, gap: 8 },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  tipIcon: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  tipText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20, paddingTop: 4 },
  techCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  techHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  techIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  techTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  stepNum: { width: 22, height: 22, borderRadius: 7, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  stepNumText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  stepText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  commCard: { marginHorizontal: 16, marginTop: 16, borderRadius: 18, borderWidth: 1, padding: 20, alignItems: "center", gap: 8 },
  commTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  commBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 21, textAlign: "center" },
  legalBody: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 4 },
  legalLink: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  legalLinkText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  infoLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  infoValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  footer: { alignItems: "center", paddingTop: 24, paddingBottom: 4, gap: 3 },
  footerLine: { width: 50, height: 1, marginBottom: 12 },
  footerText: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
