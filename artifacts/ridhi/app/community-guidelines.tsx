import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { router } from "expo-router";
import { PrivateHead } from "@/components/PrivateHead";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const INTRO = [
  "Ridhi is committed to creating a safe, respectful, and inclusive digital environment for all Indian users. These Community Guidelines are aligned with the Information Technology Act, 2000 (as amended), the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and the Digital Personal Data Protection Act, 2023.",
  "By using Ridhi, you agree to abide by these guidelines. Violation may result in content removal, account suspension, permanent ban, and reporting to appropriate authorities under Indian law.",
];

interface Section {
  id: string;
  num: string;
  title: string;
  icon: string;
  color: string;
  content: string[];
}

const SECTIONS: Section[] = [
  {
    id: "s1",
    num: "1",
    title: "Legal Framework & Compliance",
    icon: "shield",
    color: "#4A90E2",
    content: [
      "Ridhi operates as a social intermediary under the Information Technology Act, 2000 and the IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.",
      "We comply with all applicable laws of India including the Indian Penal Code (IPC), 1860; the Protection of Children from Sexual Offences (POCSO) Act, 2012; and the Digital Personal Data Protection (DPDP) Act, 2023.",
      "Users must not engage in any activity that violates Indian law, including but not limited to: Section 66A (punishment for sending offensive messages), Section 67 (publishing obscene material), Section 67A (publishing sexually explicit material), and Section 69A (power to block public access).",
      "Content that threatens the unity, integrity, defence, security, or sovereignty of India, or public order, or incites violence, is strictly prohibited and will be reported to the Ministry of Electronics and Information Technology (MeitY) as required.",
    ],
  },
  {
    id: "s2",
    num: "2",
    title: "Prohibited Content & Activities",
    icon: "alert-triangle",
    color: "#FF3B30",
    content: [
      "SEXUAL CONTENT: Pornography, nudity, sexually explicit material, or content that sexualizes minors (strictly prohibited under POCSO Act and Section 67/67A of IT Act).",
      "HATE SPEECH: Content promoting hatred, discrimination, or violence against individuals or groups based on religion, caste, race, ethnicity, gender, disability, or sexual orientation.",
      "HARASSMENT & BULLYING: Repeated unwanted contact, stalking, doxxing (sharing private information), or coordinated harassment campaigns.",
      "VIOLENCE & THREATS: Content depicting or promoting violence, terrorism, self-harm, or credible threats against individuals or public safety.",
      "MISINFORMATION: Deliberately false or misleading information, especially related to elections, public health, or national security.",
      "IMPERSONATION: Creating fake accounts or misrepresenting identity to deceive others, including fake government or official accounts.",
      "SPAM & SCAMS: Phishing, financial fraud, pyramid schemes, and unsolicited bulk messaging.",
      "DRUGS & ILLEGAL GOODS: Promotion or sale of illegal drugs, weapons, or counterfeit products.",
      "CHILD SAFETY: Any content that endangers minors, including grooming, child sexual abuse material (CSAM), or child exploitation. Immediately reported to National Cyber Crime Reporting Portal (cybercrime.gov.in).",
    ],
  },
  {
    id: "s3",
    num: "3",
    title: "User Conduct & Safety",
    icon: "users",
    color: "#7B2FBE",
    content: [
      "Treat all users with respect. No abusive language, slurs, or threats in any language (including all 13 Indian languages supported on the platform).",
      "Obtain consent before sharing someone else's photos, videos, or personal information.",
      "Do not record, screenshot, or distribute private calls, chats, or live streams without explicit consent.",
      "Users must be 18 years or older to use dating/matching features. Misrepresentation of age is a violation.",
      "Reporting false information to authorities or filing fraudulent complaints is prohibited.",
      "Users are responsible for all activity on their account. Do not share login credentials.",
    ],
  },
  {
    id: "s4",
    num: "4",
    title: "Content Moderation & Enforcement",
    icon: "eye",
    color: "#E91E8C",
    content: [
      "Ridhi uses a combination of AI-based automated detection and human review for content moderation.",
      "First violation: Content removed + warning notification.",
      "Second violation: 7-day account suspension.",
      "Third violation: 30-day account suspension.",
      "Severe violations (CSAM, terrorism, threats to public safety): Immediate permanent ban and mandatory reporting to law enforcement.",
      "Users may appeal moderation decisions through the in-app Help & Support section within 30 days.",
      "All moderation actions are logged and auditable for compliance with intermediary obligations.",
    ],
  },
  {
    id: "s5",
    num: "5",
    title: "Grievance Redressal Mechanism",
    icon: "message-circle",
    color: "#00BCD4",
    content: [
      "Grievance Officer: As per Rule 3(2) of the IT Rules, 2021, Ridhi has appointed a Grievance Officer to address user complaints.",
      "Name: Grievance Officer, Ridhi",
      "Email: grievance@ridhi.app",
      "Address: Krilo Digitech Pvt Ltd, [Company Address], India",
      "Response time: We acknowledge receipt within 24 hours and resolve within 15 days as per the IT Rules.",
      "For serious complaints (CSAM, threats, impersonation), users may also report directly to: National Cyber Crime Reporting Portal (cybercrime.gov.in) or call 1930 (Cyber Crime Helpline).",
      "Users can file complaints through the in-app Report feature or by emailing grievance@ridhi.app with specific details.",
    ],
  },
  {
    id: "s6",
    num: "6",
    title: "Data Protection & Privacy",
    icon: "lock",
    color: "#34C759",
    content: [
      "Ridhi processes personal data in accordance with the Digital Personal Data Protection (DPDP) Act, 2023.",
      "Users have the right to: access their data, request correction, request deletion, and withdraw consent.",
      "Data is stored on servers within India. Cross-border data transfers comply with DPDP Act requirements.",
      "We do not sell user data to third parties. Data sharing is limited to service providers and legal obligations.",
      "For complete privacy details, see our Privacy Policy.",
    ],
  },
  {
    id: "s7",
    num: "7",
    title: "Creator & Host Responsibilities",
    icon: "mic",
    color: "#FFB800",
    content: [
      "Creators and hosts must ensure all content complies with these guidelines and Indian law.",
      "Live streams are monitored for safety. Content that violates guidelines during a live stream will result in immediate stream termination.",
      "Hosts engaging with minors must ensure age-appropriate content and parental consent where applicable.",
      "Commercial content (ads, brand deals) must be clearly disclosed as per ASCI (Advertising Standards Council of India) guidelines.",
      "Creators are responsible for comments on their content. Failure to moderate comments may result in content restrictions.",
    ],
  },
  {
    id: "s8",
    num: "8",
    title: "Regional Language & Cultural Sensitivity",
    icon: "globe",
    color: "#FF6B35",
    content: [
      "Ridhi supports 13 Indian languages. All guidelines apply equally across all languages.",
      "Content that mocks, denigrates, or promotes stereotypes about any Indian language, culture, or region is prohibited.",
      "Respect religious sentiments. Content that disrespects places of worship, religious figures, or practices is not allowed.",
      "Political content must not violate the Model Code of Conduct during election periods.",
      "Users are encouraged to report content that violates cultural sensitivity in any language.",
    ],
  },
  {
    id: "s9",
    num: "9",
    title: "Platform Safety Features",
    icon: "check-circle",
    color: "#2196F3",
    content: [
      "Block & Report: Users can block and report any other user for harassment, inappropriate content, or policy violations.",
      "Screenshot Detection: Private chats notify users when a screenshot is taken (where supported by device).",
      "Disappearing Messages: Users can enable disappearing messages in chats for enhanced privacy.",
      "Screen Recording Prevention: Live streams and private calls are protected from screen recording on supported devices.",
      "AI Moderation: Automated systems detect harmful content in real-time across all languages.",
      "Emergency SOS: Users can access emergency contacts and helpline numbers from the Safety section.",
    ],
  },
  {
    id: "s10",
    num: "10",
    title: "Updates & Effective Date",
    icon: "calendar",
    color: "#9B59B6",
    content: [
      "These guidelines are effective as of January 1, 2026.",
      "Ridhi reserves the right to update these guidelines to comply with changes in Indian law or platform needs.",
      "Users will be notified of significant changes through in-app notifications and email.",
      "Continued use of the platform after updates constitutes acceptance of the revised guidelines.",
      "For questions about these guidelines, contact: hello@ridhi.app or use the Help & Support section.",
    ],
  },
];

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>\u2022</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function SectionCard({ section, isOpen, onToggle }: { section: Section; isOpen: boolean; onToggle: () => void }) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Pressable onPress={onToggle} style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.iconCircle, { backgroundColor: section.color + "18" }]}>
            <Feather name={section.icon as any} size={16} color={section.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              {section.num}. {section.title}
            </Text>
          </View>
        </View>
        <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
      </Pressable>
      {isOpen && (
        <View style={[styles.cardBody, { borderColor: colors.border }]}>
          {section.content.map((line, i) => (
            <Bullet key={i} text={line} />
          ))}
        </View>
      )}
    </View>
  );
}

export default function CommunityGuidelines() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["s1"]));

  const toggleSection = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PrivateHead />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 16,
        }}
      >
        {/* Header */}
        <View style={styles.headerBlock}>
          <View style={[styles.iconCircle, { backgroundColor: "#7B2FBE18" }]}>
            <Feather name="shield" size={24} color="#7B2FBE" />
          </View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Community Guidelines
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
            Aligned with Indian Government Laws
          </Text>
        </View>

        {/* Intro */}
        <View style={[styles.introCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {INTRO.map((text, i) => (
            <Text key={i} style={[styles.introText, { color: colors.foreground }]}>
              {text}
            </Text>
          ))}
        </View>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            isOpen={openSections.has(section.id)}
            onToggle={() => toggleSection(section.id)}
          />
        ))}

        {/* Footer note */}
        <View style={[styles.footerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            For complaints, contact our Grievance Officer at{" "}
            <Text style={{ color: colors.primary }}>grievance@ridhi.app</Text>{" "}
            or call the Cyber Crime Helpline{" "}
            <Text style={{ color: colors.primary }}>1930</Text>.
          </Text>
          <Text style={[styles.footerText, { color: colors.mutedForeground, marginTop: 8 }]}>
            Effective: January 1, 2026 | Version 1.0
          </Text>
        </View>
      </ScrollView>

      {/* Back button */}
      <View style={[styles.backBtnWrap, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.card + "CC" }]}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtnWrap: {
    position: "absolute",
    top: 0,
    left: 16,
    zIndex: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBlock: {
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  introCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  introText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  cardBody: {
    borderTopWidth: 1,
    padding: 12,
    paddingTop: 8,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  bulletDot: {
    fontSize: 12,
    color: "#7B2FBE",
    marginTop: 2,
  },
  bulletText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    flex: 1,
    color: "#333",
  },
  footerCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginTop: 8,
    marginBottom: 24,
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    textAlign: "center",
  },
});
