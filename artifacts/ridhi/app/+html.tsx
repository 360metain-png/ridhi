import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

// ── JSON-LD: MobileApplication — AI Search & E-E-A-T signals ──────────────
const APP_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "Ridhi",
  alternateName: "Ridhi App – Live Streaming, Voice Chat Rooms & Job Platform",
  description:
    "Join Ridhi to live stream, chat in audio rooms, connect with people, send virtual gifts, and explore job opportunities — all in one powerful app.",
  applicationCategory: "SocialNetworkingApplication",
  applicationSubCategory: "EntertainmentApplication",
  operatingSystem: "Android, iOS",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.7",
    reviewCount: "14800",
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
      width: 512,
      height: 512,
    },
  },
  inLanguage: [
    "en-IN", "hi", "ta", "te", "bn", "mr", "gu", "kn",
    "pa", "ml", "or", "as", "ur",
  ],
  countryOfOrigin: "IN",
  url: "https://ridhi.app",
  screenshot: [
    {
      "@type": "ImageObject",
      url: "https://ridhi.app/screenshots/live-stream.png",
      caption: "Go Live & Build Your Audience",
    },
    {
      "@type": "ImageObject",
      url: "https://ridhi.app/screenshots/audio-rooms.png",
      caption: "Join Interactive Audio Chat Rooms",
    },
    {
      "@type": "ImageObject",
      url: "https://ridhi.app/screenshots/chat.png",
      caption: "Chat & Connect with People",
    },
    {
      "@type": "ImageObject",
      url: "https://ridhi.app/screenshots/gifts.png",
      caption: "Send & Earn Virtual Gifts",
    },
    {
      "@type": "ImageObject",
      url: "https://ridhi.app/screenshots/jobs.png",
      caption: "Find Jobs & Grow Your Career",
    },
  ],
  featureList: [
    "Live Streaming with virtual gifts",
    "Audio & Voice Chat Rooms",
    "Instant Messaging & Group Chats",
    "Social Feed, Reels & Stories",
    "Dating & Smart AI Matching",
    "Job Search & Recruiter Connect",
    "Communities by city and interest",
    "Games & PK Battles",
    "Coin Wallet & Creator Earnings",
    "AI Podcast Creation",
    "Business Ads Platform",
    "13 Indian Languages",
  ],
};

// ── JSON-LD: WebPage — H1/H2 structure for on-page SEO ────────────────────
const WEBPAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Ridhi App – Live Streaming, Voice Chat Rooms & Job Platform",
  description:
    "Join Ridhi to live stream, chat in audio rooms, connect with people, send virtual gifts, and explore job opportunities—all in one powerful app.",
  url: "https://ridhi.app",
  inLanguage: "en-IN",
  mainEntity: {
    "@type": "SoftwareApplication",
    name: "Ridhi",
  },
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", "h2", ".tagline"],
  },
  about: [
    { "@type": "Thing", name: "Live Streaming App" },
    { "@type": "Thing", name: "Voice Chat Rooms" },
    { "@type": "Thing", name: "Job Search App India" },
    { "@type": "Thing", name: "Social Networking App" },
    { "@type": "Thing", name: "Virtual Gifts App" },
    { "@type": "Thing", name: "Audio Chat App India" },
  ],
};

// ── JSON-LD: Organization — E-E-A-T trust signals ────────────────────────
const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Ridhi Technologies",
  url: "https://ridhi.app",
  logo: "https://ridhi.app/ridhi_logo.png",
  sameAs: [
    "https://instagram.com/ridhiapp",
    "https://twitter.com/ridhiapp",
    "https://facebook.com/ridhiapp",
    "https://youtube.com/@ridhiapp",
    "https://linkedin.com/company/ridhiapp",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@ridhi.app",
    availableLanguage: [
      "English", "Hindi", "Tamil", "Telugu", "Bengali",
      "Marathi", "Gujarati", "Kannada", "Punjabi",
    ],
  },
  areaServed: "IN",
  description:
    "Ridhi Technologies builds India-first live streaming, social networking, and career discovery experiences for the next billion users.",
};

// ── JSON-LD: FAQPage — Voice search & featured snippets ──────────────────
const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Ridhi app?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ridhi is an all-in-one Indian app for live streaming, voice chat rooms, social networking, virtual gifts, and job search. It supports 13 Indian languages.",
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
      name: "Can I find jobs on Ridhi?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Ridhi has a built-in job search feature where you can discover job opportunities and connect with recruiters directly from the app.",
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

        {/* ── Primary SEO — from document §4 ───────────────────────────── */}
        <title>Ridhi App – Live Streaming, Voice Chat Rooms &amp; Job Platform</title>
        <meta
          name="description"
          content="Join Ridhi to live stream, chat in audio rooms, connect with people, send virtual gifts, and explore job opportunities—all in one powerful app."
        />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="theme-color" content="#E91E8C" />
        <meta name="application-name" content="Ridhi" />
        <meta name="author" content="Ridhi Technologies" />
        <meta name="copyright" content="Ridhi Technologies" />
        <meta name="revisit-after" content="7 days" />
        <meta name="language" content="en-IN" />
        <meta name="rating" content="general" />

        {/* ── SEO Keywords — from document §4 ─────────────────────────── */}
        <meta
          name="keywords"
          content="Ridhi app, live streaming app, audio chat rooms, voice chat app, social networking app, job app India, earn online app, virtual gifts app, video streaming app, community platform, best live streaming app in India, voice chat rooms with strangers, social app with job opportunities, earn money through live streaming, online community and chat platform"
        />

        {/* ── Geo / Local SEO ────────────────────────────────────────── */}
        <meta name="geo.region" content="IN" />
        <meta name="geo.country" content="India" />
        <meta name="ICBM" content="20.5937,78.9629" />
        <meta name="geo.placename" content="India" />

        {/* ── Open Graph — Facebook / WhatsApp ───────────────────────── */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Ridhi" />
        <meta property="og:title" content="Ridhi App – Live Streaming, Voice Chat Rooms & Job Platform" />
        <meta
          property="og:description"
          content="Join Ridhi to live stream, chat in audio rooms, connect with people, send virtual gifts, and explore job opportunities—all in one powerful app."
        />
        <meta property="og:image" content="https://ridhi.app/ridhi_logo.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Ridhi live streaming app interface" />
        <meta property="og:url" content="https://ridhi.app" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:locale:alternate" content="hi_IN" />
        <meta property="og:locale:alternate" content="ta_IN" />
        <meta property="og:locale:alternate" content="te_IN" />
        <meta property="og:locale:alternate" content="bn_IN" />

        {/* ── Twitter / X Card ───────────────────────────────────────── */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ridhiapp" />
        <meta name="twitter:creator" content="@ridhiapp" />
        <meta name="twitter:title" content="Ridhi App – Live Streaming, Voice Chat Rooms & Job Platform" />
        <meta
          name="twitter:description"
          content="Join Ridhi to live stream, chat in audio rooms, connect with people, send virtual gifts, and explore job opportunities. Free download."
        />
        <meta name="twitter:image" content="https://ridhi.app/ridhi_logo.png" />
        <meta name="twitter:image:alt" content="Ridhi App – Live Streaming, Voice Chat & Jobs" />

        {/* ── App Store Smart Banners ────────────────────────────────── */}
        <meta name="apple-itunes-app" content="app-id=YOUR_APP_ID, app-argument=https://ridhi.app" />
        <meta name="google-play-app" content="app-id=app.replit.ridhi" />

        {/* ── Mobile / PWA ───────────────────────────────────────────── */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Ridhi" />
        <meta name="msapplication-TileColor" content="#E91E8C" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="canonical" href="https://ridhi.app" />

        {/* ── Image alt tag hints for crawlers (document §6) ────────── */}
        {/* These are declared as meta so crawlers can associate them */}
        <meta name="ridhi:img1" content="Ridhi live streaming app interface" />
        <meta name="ridhi:img2" content="Ridhi voice chat rooms feature" />
        <meta name="ridhi:img3" content="Ridhi job search platform mobile app" />
        <meta name="ridhi:img4" content="Ridhi social networking chat system" />
        <meta name="ridhi:img5" content="Ridhi virtual gifts feature UI" />
        <meta name="ridhi:img6" content="Ridhi video streaming platform" />

        {/* ── JSON-LD: MobileApplication ─────────────────────────────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(APP_SCHEMA) }}
        />

        {/* ── JSON-LD: WebPage with H1/H2 structure ─────────────────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBPAGE_SCHEMA) }}
        />

        {/* ── JSON-LD: Organization (E-E-A-T / Trust) ───────────────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
        />

        {/* ── JSON-LD: FAQPage (Voice search / featured snippets) ────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
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
