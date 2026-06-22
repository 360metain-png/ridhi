import { Link, Stack } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { SeoHead } from "@/components/SeoHead";
import { useTrackScreen } from "@/hooks/useAnalytics";

export default function NotFoundScreen() {
  useTrackScreen("not_found");
  const colors = useColors();

  return (
    <>
      {Platform.OS === "web" && (
        <SeoHead
          title="Page Not Found — Ridhi App"
          description="The page you are looking for doesn't exist. Explore Ridhi — India's first social universal app by Krilo Digitech Pvt Ltd."
          robots="noindex, follow"
        />
      )}
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          This screen doesn&apos;t exist.
        </Text>

        <Link href="/" style={styles.link}>
          <Text style={[styles.linkText, { color: colors.primary }]}>
            Go to home screen!
          </Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
  },
});
