import { Link, Stack } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { SeoHead } from "@/components/SeoHead";

export default function NotFoundScreen() {
  const colors = useColors();

  return (
    <>
      {Platform.OS === "web" && (
        <SeoHead
          title="Page Not Found — Ridhi App"
          description="The page you are looking for doesn't exist. Explore Ridhi — India's #1 social networking and live streaming app."
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
