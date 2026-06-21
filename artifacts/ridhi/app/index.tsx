import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { View, ActivityIndicator, Platform } from "react-native";
import { useColors } from "@/hooks/useColors";
import { SeoHead } from "@/components/SeoHead";

const HOME_WEBPAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Ridhi App – Live Streaming, Voice Chat Rooms & Social Dating",
  description:
    "Join Ridhi to live stream, chat in audio rooms, connect with people, send virtual gifts, and find your match—all in one powerful app.",
  url: "https://ridhi.app",
  inLanguage: "en-IN",
  mainEntity: { "@type": "SoftwareApplication", name: "Ridhi" },
  speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", "h2", ".tagline"] },
  about: [
    { "@type": "Thing", name: "Live Streaming App" },
    { "@type": "Thing", name: "Voice Chat Rooms" },
    { "@type": "Thing", name: "Dating App India" },
    { "@type": "Thing", name: "Social Networking App" },
    { "@type": "Thing", name: "Virtual Gifts App" },
    { "@type": "Thing", name: "Audio Chat App India" },
  ],
};

const HOME_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Ridhi app?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ridhi is an all-in-one Indian app for live streaming, voice chat rooms, social networking, virtual gifts, and dating. It supports 13 Indian languages.",
      },
    },
    {
      "@type": "Question",
      name: "How do I earn money on Ridhi?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can earn on Ridhi by going live and receiving virtual gifts from viewers, creating content to earn coins, and withdrawing your earnings to UPI or bank account.",
      },
    },
    {
      "@type": "Question",
      name: "Is Ridhi available for free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Ridhi is free to download and use on Android and iOS. Sign up in 30 seconds with your phone number.",
      },
    },
    {
      "@type": "Question",
      name: "What languages does Ridhi support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ridhi supports 13 Indian languages: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Punjabi, Malayalam, Odia, Assamese, Urdu, and English.",
      },
    },
  ],
};

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const colors = useColors();

  if (isLoading) {
    return (
      <>
        {Platform.OS === "web" && (
          <SeoHead
            title="Ridhi App – India's #1 Social, Live Streaming & Dating Platform"
            description="Join millions of Indians on Ridhi. Live stream, join audio chat rooms, share reels & stories, find your match, and earn virtual gifts. Free on Android & iOS."
            canonical="/"
            jsonLd={[HOME_WEBPAGE_SCHEMA, HOME_FAQ_SCHEMA]}
          />
        )}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth/onboarding" />;
}
