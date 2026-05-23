import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

// ── JSON-LD: MobileApplication ─────────────────────────────────────────────
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
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.7",
    reviewCount: "14800",
    bestRating: "5",
    worstRating: "1",
  },
  author:    { "@type": "Organization", name: "Ridhi Technologies", url: "https://ridhi.app" },
  publisher: {
    "@type": "Organization",
    name: "Ridhi Technologies",
    logo: { "@type": "ImageObject", url: "https://ridhi.app/ridhi_logo.png", width: 512, height: 512 },
  },
  inLanguage: ["en-IN", "hi", "ta", "te", "bn", "mr", "gu", "kn", "pa", "ml", "or", "as", "ur"],
  countryOfOrigin: "IN",
  url: "https://ridhi.app",
  screenshot: [
    { "@type": "ImageObject", url: "https://ridhi.app/screenshots/live-stream.png",  caption: "Go Live & Build Your Audience" },
    { "@type": "ImageObject", url: "https://ridhi.app/screenshots/audio-rooms.png",  caption: "Join Interactive Audio Chat Rooms" },
    { "@type": "ImageObject", url: "https://ridhi.app/screenshots/chat.png",          caption: "Chat & Connect with People" },
    { "@type": "ImageObject", url: "https://ridhi.app/screenshots/gifts.png",         caption: "Send & Earn Virtual Gifts" },
    { "@type": "ImageObject", url: "https://ridhi.app/screenshots/dating.png",       caption: "Dating & Smart AI Matching" },
  ],
  featureList: [
    "Live Streaming with virtual gifts",
    "Audio & Voice Chat Rooms",
    "Instant Messaging & Group Chats",
    "Social Feed, Reels & Stories",
    "Dating & Smart AI Matching",
    "Communities by city and interest",
    "Games & PK Battles",
    "Coin Wallet & Creator Earnings",
    "AI Podcast Creation",
    "Business Ads Platform",
    "13 Indian Languages",
  ],
};

// ── JSON-LD: WebPage ───────────────────────────────────────────────────────
const WEBPAGE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Ridhi App – Live Streaming, Voice Chat Rooms & Job Platform",
  description:
    "Join Ridhi to live stream, chat in audio rooms, connect with people, send virtual gifts, and explore job opportunities—all in one powerful app.",
  url: "https://ridhi.app",
  inLanguage: "en-IN",
  mainEntity: { "@type": "SoftwareApplication", name: "Ridhi" },
  speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", "h2", ".tagline"] },
  about: [
    { "@type": "Thing", name: "Live Streaming App" },
    { "@type": "Thing", name: "Voice Chat Rooms" },
    { "@type": "Thing", name: "Job Search App India" },
    { "@type": "Thing", name: "Social Networking App" },
    { "@type": "Thing", name: "Virtual Gifts App" },
    { "@type": "Thing", name: "Audio Chat App India" },
  ],
};

// ── JSON-LD: Organization ─────────────────────────────────────────────────
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
    email: "hello@ridhi.app",
    availableLanguage: ["English", "Hindi", "Tamil", "Telugu", "Bengali", "Marathi", "Gujarati", "Kannada", "Punjabi"],
  },
  areaServed: "IN",
  description:
    "Ridhi Technologies builds India-first live streaming, social networking, and career discovery experiences for the next billion users.",
};

// ── JSON-LD: FAQPage ──────────────────────────────────────────────────────
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
      name: "What languages does Ridhi support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ridhi supports 13 Indian languages: Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Punjabi, Malayalam, Odia, Assamese, Urdu, and English.",
      },
    },
  ],
};

// ─── Inlined critical CSS — prevents FOUC, applied before JS executes ────────
const CRITICAL_CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;width:100%;overflow-x:hidden}
  html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
  body{background:#0A0A0F;color:#fff;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
  #root{height:100%;display:flex;flex-direction:column}
  :root{color-scheme:dark}
`.trim();

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en-IN" prefix="og: https://ogp.me/ns#">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* ── Primary SEO ─────────────────────────────────────────────── */}
        <title>Ridhi App – Live Streaming, Voice Chat Rooms &amp; Social | India</title>
        <meta
          name="description"
          content="Ridhi is India's #1 app for live streaming, voice chat rooms, and social networking. Go live, earn gifts, chat in 13 Indian languages. Free download."
        />
        <meta name="robots"       content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="theme-color"  content="#E91E8C" />
        <meta name="application-name" content="Ridhi" />
        <meta name="author"       content="Ridhi Technologies" />
        <meta name="copyright"    content="Ridhi Technologies" />
        <meta name="language"     content="en-IN" />
        <meta name="rating"       content="general" />
        <meta name="revisit-after" content="7 days" />

        {/* ── SEO Keywords ─────────────────────────────────────────────── */}
        <meta
          name="keywords"
          content="Ridhi app, live streaming app India, audio chat rooms, voice chat app, social networking app, job app India, earn online India, virtual gifts app, dating app India, best live streaming app India, voice chat rooms, earn money live streaming, online community app"
        />

        {/* ── Geo / Local SEO ────────────────────────────────────────── */}
        <meta name="geo.region"    content="IN" />
        <meta name="geo.country"   content="India" />
        <meta name="ICBM"          content="20.5937,78.9629" />
        <meta name="geo.placename" content="India" />

        {/* ── Canonical & hreflang ─────────────────────────────────── */}
        <link rel="canonical" href="https://ridhi.app" />
        <link rel="alternate" hrefLang="en-IN" href="https://ridhi.app" />
        <link rel="alternate" hrefLang="hi"    href="https://ridhi.app/hi" />
        <link rel="alternate" hrefLang="ta"    href="https://ridhi.app/ta" />
        <link rel="alternate" hrefLang="te"    href="https://ridhi.app/te" />
        <link rel="alternate" hrefLang="bn"    href="https://ridhi.app/bn" />
        <link rel="alternate" hrefLang="x-default" href="https://ridhi.app" />

        {/* ── Performance: DNS prefetch & preconnect ────────────────── */}
        <link rel="dns-prefetch"  href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch"  href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch"  href="https://ridhi.app" />
        <link rel="preconnect"    href="https://fonts.googleapis.com" />
        <link rel="preconnect"    href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* ── Performance: Preload Inter font (used throughout the app) ─ */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          media="print"
          // @ts-ignore — non-standard onload used for non-blocking font load
          onLoad="this.media='all'"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          />
        </noscript>

        {/* ── Open Graph ──────────────────────────────────────────────── */}
        <meta property="og:type"              content="website" />
        <meta property="og:site_name"         content="Ridhi" />
        <meta property="og:title"             content="Ridhi App – Live Streaming, Voice Chat Rooms & Social" />
        <meta property="og:description"       content="India's #1 app for live streaming, voice chat rooms, and social networking. Go live, earn gifts, chat in 13 Indian languages. Free download." />
        <meta property="og:image"             content="https://ridhi.app/ridhi_logo.png" />
        <meta property="og:image:width"       content="1200" />
        <meta property="og:image:height"      content="630" />
        <meta property="og:image:alt"         content="Ridhi live streaming and social app" />
        <meta property="og:url"               content="https://ridhi.app" />
        <meta property="og:locale"            content="en_IN" />
        <meta property="og:locale:alternate"  content="hi_IN" />
        <meta property="og:locale:alternate"  content="ta_IN" />
        <meta property="og:locale:alternate"  content="te_IN" />
        <meta property="og:locale:alternate"  content="bn_IN" />

        {/* ── Twitter / X Card ───────────────────────────────────────── */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:site"        content="@ridhiapp" />
        <meta name="twitter:creator"     content="@ridhiapp" />
        <meta name="twitter:title"       content="Ridhi App – Live Streaming, Voice Chat Rooms & Social | India" />
        <meta name="twitter:description" content="India's #1 app for live streaming, voice chat rooms, and social networking. Free download on Android & iOS." />
        <meta name="twitter:image"       content="https://ridhi.app/ridhi_logo.png" />
        <meta name="twitter:image:alt"   content="Ridhi App – Live Streaming, Voice Chat & Social" />

        {/* ── App Store Smart Banners ────────────────────────────────── */}
        <meta name="apple-itunes-app"  content="app-id=YOUR_APP_ID, app-argument=https://ridhi.app" />
        <meta name="google-play-app"   content="app-id=com.pt.ridhi" />

        {/* ── Mobile / PWA ───────────────────────────────────────────── */}
        <meta name="mobile-web-app-capable"              content="yes" />
        <meta name="apple-mobile-web-app-capable"        content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title"          content="Ridhi" />
        <meta name="msapplication-TileColor"             content="#E91E8C" />
        <meta name="msapplication-config"                content="/browserconfig.xml" />

        {/* ── Favicons ───────────────────────────────────────────────── */}
        <link rel="icon"             href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest"         href="/manifest.json" />

        {/* ── JSON-LD structured data ─────────────────────────────────── */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(APP_SCHEMA) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBPAGE_SCHEMA) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />

        {/* ── Expo Router ScrollView reset ───────────────────────────── */}
        <ScrollViewStyleReset />

        {/* ── Critical CSS — inlined to eliminate render-blocking ──────── */}
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />
      </head>
      <body>
        {children}
        <noscript>
          <div style={{ padding: "24px", textAlign: "center", fontFamily: "sans-serif", background: "#0A0A0F", color: "#fff" }}>
            <h1>Ridhi – India's #1 Social App</h1>
            <p>Download the Ridhi app to live stream, join voice chat rooms, and connect with people. Available free on Android &amp; iOS.</p>
            <p><a href="https://play.google.com/store/apps/details?id=com.pt.ridhi" style={{ color: "#E91E8C" }}>Download on Google Play</a></p>
          </div>
        </noscript>
      </body>
    </html>
  );
}
