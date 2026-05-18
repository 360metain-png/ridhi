import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* ── Primary SEO ── */}
        <title>Ridhi — India&apos;s #1 Social &amp; Dating App</title>
        <meta
          name="description"
          content="Ridhi is India's #1 social networking and dating app. Connect with millions of Indians, share moments in your language, and find love — all in one place."
        />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#E91E8C" />
        <meta name="application-name" content="Ridhi" />
        <meta
          name="keywords"
          content="Ridhi, India dating app, Indian social network, meet Indians, shaadi, dost, hindi app, regional dating"
        />

        {/* ── Open Graph (Facebook / WhatsApp) ── */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Ridhi" />
        <meta property="og:title" content="Ridhi — India's #1 Social & Dating App" />
        <meta
          property="og:description"
          content="Connect with millions of Indians. Share reels, chat in your language, and find love on Ridhi."
        />
        <meta property="og:image" content="/ridhi_logo.png" />
        <meta property="og:locale" content="en_IN" />

        {/* ── Twitter Card ── */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ridhi — India's #1 Social & Dating App" />
        <meta
          name="twitter:description"
          content="Connect with millions of Indians. Share reels, chat in your language, and find love on Ridhi."
        />
        <meta name="twitter:image" content="/ridhi_logo.png" />

        {/* ── Mobile / PWA ── */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Ridhi" />
        <link rel="icon" href="/favicon.ico" />

        {/*
          Expo Router web: resets ScrollView default styles so the web app
          behaves like a native app rather than a scrolling webpage.
        */}
        <ScrollViewStyleReset />

        {/* Prevent FOUC by ensuring dark bg matches app bg */}
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
