import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { View, ActivityIndicator, Platform } from "react-native";
import { useColors } from "@/hooks/useColors";
import { SeoHead } from "@/components/SeoHead";

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
