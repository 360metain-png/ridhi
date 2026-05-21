import { Platform } from "react-native";
import Head from "expo-router/head";

/**
 * PrivateHead — drop this into any screen that contains personal data.
 * Tells ALL search engines and AI crawlers: do NOT index this page and
 * do NOT follow any links on it. Has zero effect on native (iOS/Android).
 */
export function PrivateHead() {
  if (Platform.OS !== "web") return null;
  return (
    <Head>
      <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
      <meta name="googlebot" content="noindex, nofollow" />
    </Head>
  );
}
