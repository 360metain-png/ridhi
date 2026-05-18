import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

// JSON-LD structured data — helps AI search, generative engines, and E-E-A-T signals
const APP_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "Ridhi",
  alternateName: "Ridhi – India Social & Dating App",
  description:
    "India's #1 social networking and dating app. Connect with millions of Indians, share reels, chat in 13 Indian languages, and find love.",
  applicationCategory: "SocialNetworkingApplication",
  applicationSubCategory: "DatingApplication",
  operatingSystem: "Android, iOS",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.7",
    reviewCount: "12400",
    bestRating: "5",
    worstRating: "1",
  },
  author: {
    "@type": "Organization",
    name: "Ridhi Technologies",
    url: "https://ridhi.app",
  },
  publisher: {
    "@type": "Organization",
    name: "Ridhi Technologies",
    logo: {
      "@type": "ImageObject",
      url: "https://ridhi.app/ridhi_logo.png",
    },
  },
  inLanguage: [
    "en-IN", "hi", "ta", "te", "bn", "mr", "gu", "kn",
    "pa", "ml", "or", "as", "ur",
  ],
  countryOfOrigin: "IN",
  url: "https://ridhi.app",
  installUrl: "https://ridhi.app",
  screenshot: "https://ridhi.app/screenshot.png",
  featureList: [
    "Social Feed & Reels",
    "Dating & Matching",
    "Chat in 13 Indian Languages",
    "Live Streaming",
    "Audio Rooms",
    "Communities",
    "Creator Earnings",
    "Coin Wallet",
    "Business Ads Platform",
  ],
};

const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Ridhi",
  url: "https://ridhi.app",
  logo: "https://ridhi.app/ridhi_logo.png",
  sameAs: [
    "https://instagram.com/ridhiapp",
    "https://twitter.com/ridhiapp",
    "https://facebook.com/ridhiapp",
    "https://youtube.com/@ridhiapp",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@ridhi.app",
    availableLanguage: ["English", "Hindi", "Tamil", "Telugu", "Bengali"],
  },
  areaServed: "IN",
  description:
    "Ridhi Technologies builds India-first social and dating experiences for the next billion users.",
};

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en-IN">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* ── Primary SEO ──────────────────────────────────────────── */}
        <title>Ridhi — India&apos;s #1 Social &amp; Dating App</title>
        <meta
          name="description"
          content="India's #1 social networking and dating app. Meet Indians, share reels, and find love in 13 languages — Hindi, Tamil, Telugu, Bengali & more. Download free."
        />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="theme-color" content="#E91E8C" />
        <meta name="application-name" content="Ridhi" />
        <meta name="author" content="Ridhi Technologies" />
        <meta name="copyright" content="Ridhi Technologies" />
        <meta name="rating" content="general" />
        <meta name="revisit-after" content="7 days" />
        <meta name="language" content="en-IN" />
        <meta
          name="keywords"
          content="Ridhi app, India dating app, Indian social network, meet Indians online, hindi dating app, shaadi app, desi dating, india chat app, regional language social, find love India, Indian match, dost milao, bharat social app"
        />

        {/* ── Geo / Local SEO ─────────────────────────────────────── */}
        <meta name="geo.region" content="IN" />
        <meta name="geo.country" content="India" />
        <meta name="ICBM" content="20.5937,78.9629" />

        {/* ── Open Graph — Facebook / WhatsApp ────────────────────── */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Ridhi" />
        <meta property="og:title" content="Ridhi — India's #1 Social & Dating App" />
        <meta
          property="og:description"
          content="Meet Indians, share reels & find love in 13 languages. India's fastest-growing social & dating app. Free to download."
        />
        <meta property="og:image" content="https://ridhi.app/ridhi_logo.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Ridhi — India's #1 Social & Dating App" />
        <meta property="og:url" content="https://ridhi.app" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:locale:alternate" content="hi_IN" />
        <meta property="og:locale:alternate" content="ta_IN" />
        <meta property="og:locale:alternate" content="te_IN" />

        {/* ── Twitter / X Card ────────────────────────────────────── */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ridhiapp" />
        <meta name="twitter:creator" content="@ridhiapp" />
        <meta name="twitter:title" content="Ridhi — India's #1 Social & Dating App" />
        <meta
          name="twitter:description"
          content="Meet Indians, share reels & find love in 13 languages. Download Ridhi free."
        />
        <meta name="twitter:image" content="https://ridhi.app/ridhi_logo.png" />
        <meta name="twitter:image:alt" content="Ridhi App Logo" />

        {/* ── App Store Deep Links ────────────────────────────────── */}
        <meta name="apple-itunes-app" content="app-id=YOUR_APP_ID, app-argument=https://ridhi.app" />
        <meta name="google-play-app" content="app-id=app.replit.ridhi" />

        {/* ── Mobile / PWA ────────────────────────────────────────── */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Ridhi" />
        <meta name="msapplication-TileColor" content="#E91E8C" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="canonical" href="https://ridhi.app" />

        {/* ── JSON-LD: MobileApplication (AI Search / E-E-A-T) ───── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(APP_SCHEMA) }}
        />

        {/* ── JSON-LD: Organization (E-E-A-T / Trust signals) ─────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
        />

        {/*
          Expo Router web: resets ScrollView default styles so the web app
          behaves like a native app rather than a scrolling webpage.
        */}
        <ScrollViewStyleReset />

        {/* Prevent FOUC — dark bg matches app background colour */}
        <style
          dangerouslySetInnerHTML={{
            __html: `html,body,#root{background:#0A0A0F;height:100%}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
