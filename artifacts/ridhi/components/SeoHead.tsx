import { Platform } from "react-native";
import Head from "expo-router/head";

/**
 * SeoHead — lightweight wrapper around expo-router/Head.
 * Only renders on web. Add to every public-facing page that
 * should be indexed by search engines.
 */
export function SeoHead({
  title,
  description,
  robots = "index, follow",
}: {
  title: string;
  description: string;
  robots?: string;
}) {
  if (Platform.OS !== "web") return null;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
    </Head>
  );
}
