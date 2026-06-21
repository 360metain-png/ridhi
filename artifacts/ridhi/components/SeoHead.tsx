import { Platform } from "react-native";
import Head from "expo-router/head";

const BASE_URL = "https://ridhi.app";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

/**
 * SeoHead — per-route head tags rendered during static export.
 * Only renders on web. Add to every public-facing page so each
 * route gets its own title, description, canonical URL, and social
 * metadata serialized into the exported HTML.
 */
export function SeoHead({
  title,
  description,
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  jsonLd,
}: {
  title: string;
  description: string;
  robots?: string;
  canonical?: string;
  ogImage?: string;
  jsonLd?: object | object[];
}) {
  if (Platform.OS !== "web") return null;

  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL;
  const schemas = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph — per-page overrides */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter — per-page overrides */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Per-page JSON-LD */}
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Head>
  );
}
