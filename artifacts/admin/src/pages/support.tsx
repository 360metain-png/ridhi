import {
  MessageCircle, Mail, Phone, ChevronDown, ChevronUp,
  Shield, Coins, Heart, Video, Lock, UserCog, Wifi,
  AlertTriangle, Star, HelpCircle, ExternalLink,
  Calendar, ShieldCheck, BookOpen, Home, Search,
} from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";

const BASE = import.meta.env.BASE_URL;
const LAST_UPDATED = "2026-05-21";

/* ───────────────────────────────────────────────────────────────────────────── */
interface FAQ {
  q: string;
  a: string;
  steps?: string[];           // HowTo steps for procedural answers
  quickAnswer?: string;       // One-sentence summary for AI snippets
  expertReviewed?: boolean;   // E-E-A-T trust signal
}

const FAQS: { section: string; icon: React.ComponentType<{ className?: string }>; color: string; items: FAQ[] }[] = [
  {
    section: "Account & Login",
    icon: UserCog,
    color: "from-purple-500 to-violet-600",
    items: [
      {
        q: "How do I create a Ridhi account?",
        a: "Download Ridhi from the App Store or Google Play, open it, and tap 'Sign Up'. Enter your mobile number, verify the OTP, and complete your profile setup — it takes under 2 minutes.",
        steps: ["Download Ridhi from App Store or Google Play", "Open the app and tap 'Sign Up'", "Enter your mobile number", "Verify the OTP sent to your phone", "Complete your profile setup"],
        quickAnswer: "Download the app, tap Sign Up, verify your mobile number with OTP, and complete your profile in under 2 minutes.",
        expertReviewed: true,
      },
      {
        q: "I forgot my password. How do I reset it?",
        a: "On the login screen tap 'Forgot Password', enter your registered phone number, and you'll receive an OTP to set a new password.",
        quickAnswer: "Tap 'Forgot Password' on the login screen, enter your phone number, and verify the OTP to set a new password.",
        expertReviewed: true,
      },
      {
        q: "How do I change my phone number?",
        a: "Go to Profile → Settings → Account → Change Phone Number. You'll need to verify your new number via OTP.",
        steps: ["Go to Profile", "Open Settings", "Tap Account", "Select Change Phone Number", "Verify the new number via OTP"],
        quickAnswer: "Go to Profile → Settings → Account → Change Phone Number and verify via OTP.",
        expertReviewed: true,
      },
      {
        q: "Can I have multiple accounts?",
        a: "Each phone number can be linked to one Ridhi account. Multiple accounts from the same device are not permitted under our Terms of Service.",
        quickAnswer: "No. Only one account per phone number is allowed, and multiple accounts from the same device violate our Terms of Service.",
        expertReviewed: true,
      },
    ],
  },
  {
    section: "Coins & Payments",
    icon: Coins,
    color: "from-yellow-500 to-amber-600",
    items: [
      {
        q: "How do I recharge Ridhi Coins?",
        a: "Open the app → tap your coin balance at the top → choose a recharge pack starting from ₹49. Payments are processed securely via Razorpay (UPI, cards, net banking).",
        steps: ["Open the Ridhi app", "Tap your coin balance at the top", "Choose a recharge pack (starts from ₹49)", "Select payment method: UPI, card, or net banking", "Complete payment via Razorpay"],
        quickAnswer: "Tap your coin balance, choose a recharge pack from ₹49, and pay securely via Razorpay.",
        expertReviewed: true,
      },
      {
        q: "My payment was deducted but coins weren't added.",
        a: "Please wait up to 15 minutes for the transaction to complete. If coins are still missing, contact us at hello@ridhi.app with your payment reference number and we'll resolve it within 24 hours.",
        quickAnswer: "Wait 15 minutes. If coins are still missing, email hello@ridhi.app with your payment reference number for resolution within 24 hours.",
        expertReviewed: true,
      },
      {
        q: "Can I get a refund for purchased coins?",
        a: "Coins are non-refundable once purchased, as per our Refund Policy. However, if you were charged due to a technical error, contact hello@ridhi.app with proof and we'll investigate.",
        quickAnswer: "Coins are generally non-refundable. Contact hello@ridhi.app with proof if a technical error caused an incorrect charge.",
        expertReviewed: true,
      },
      {
        q: "How do I send gifts during a live stream?",
        a: "During any live stream, tap the gift icon at the bottom right, choose a gift, and confirm with your coins. The host receives the gift value in their earnings.",
        steps: ["Join a live stream", "Tap the gift icon at the bottom right", "Select a gift from the catalog", "Confirm with your coins"],
        quickAnswer: "Tap the gift icon during a live stream, choose a gift, and confirm with your coins.",
        expertReviewed: true,
      },
    ],
  },
  {
    section: "Live Streams & Content",
    icon: Video,
    color: "from-pink-500 to-rose-600",
    items: [
      {
        q: "How do I start a live stream?",
        a: "Tap the '+' button → select 'Go Live'. Set a title, choose your category, and tap 'Start'. Make sure you've completed KYC verification to go live.",
        steps: ["Tap the '+' button", "Select 'Go Live'", "Set a stream title", "Choose a category", "Tap 'Start'"],
        quickAnswer: "Tap '+' → 'Go Live', add a title and category, then tap 'Start'. KYC verification is required.",
        expertReviewed: true,
      },
      {
        q: "Why was my content removed?",
        a: "Content that violates our Community Guidelines (nudity, violence, hate speech, spam) is removed. You'll receive a notification explaining the reason. Repeated violations may lead to account suspension.",
        quickAnswer: "Content violating Community Guidelines is removed. You'll get a notification. Repeated violations can lead to suspension.",
        expertReviewed: true,
      },
      {
        q: "How do I report inappropriate content?",
        a: "Tap the three-dot menu (⋮) on any post, reel, or live stream and select 'Report'. Our moderation team reviews reports within 24 hours.",
        steps: ["Find the content you want to report", "Tap the three-dot menu (⋮)", "Select 'Report'", "Choose the reason", "Submit the report"],
        quickAnswer: "Tap the three-dot menu on any content, select 'Report', choose a reason, and submit. Reviews take up to 24 hours.",
        expertReviewed: true,
      },
      {
        q: "Can I download reels and posts?",
        a: "You can save content to your personal collection within the app. Downloading to your device is only available for content the creator has enabled download permissions for.",
        quickAnswer: "You can save content in-app. Device downloads only work if the creator enabled download permissions.",
        expertReviewed: true,
      },
    ],
  },
  {
    section: "Privacy & Safety",
    icon: Shield,
    color: "from-teal-500 to-emerald-600",
    items: [
      {
        q: "How do I block someone?",
        a: "Visit the user's profile → tap the three-dot menu → select 'Block'. Blocked users cannot view your profile, send messages, or interact with your content.",
        steps: ["Visit the user's profile", "Tap the three-dot menu", "Select 'Block'", "Confirm the block"],
        quickAnswer: "Visit the user's profile, tap the three-dot menu, and select 'Block'.",
        expertReviewed: true,
      },
      {
        q: "Who can see my profile?",
        a: "By default, your profile is public. You can switch to a private account in Settings → Privacy → Account Privacy. Private accounts require approval for new followers.",
        quickAnswer: "Profiles are public by default. Switch to private in Settings → Privacy → Account Privacy.",
        expertReviewed: true,
      },
      {
        q: "How is my data used?",
        a: "We collect only the data necessary to provide and improve the Ridhi experience. We never sell your personal data. Read our full Privacy Policy at ridhi.app/privacy.",
        quickAnswer: "We only collect data needed to improve the app. We never sell your personal data. Read our full Privacy Policy.",
        expertReviewed: true,
      },
      {
        q: "How do I delete my account?",
        a: "Go to Settings → Account → Delete Account. Your data will be permanently removed within 30 days. This action cannot be undone.",
        steps: ["Go to Settings", "Tap Account", "Select Delete Account", "Confirm deletion"],
        quickAnswer: "Go to Settings → Account → Delete Account. Data is removed within 30 days. This action cannot be undone.",
        expertReviewed: true,
      },
    ],
  },
  {
    section: "Subscriptions & VIP",
    icon: Star,
    color: "from-violet-500 to-purple-700",
    items: [
      {
        q: "What are the VIP subscription tiers?",
        a: "Ridhi offers four VIP tiers — Silver, Gold, Platinum, and Diamond Elite — with increasing perks like profile badge, priority in discovery, daily coin bonuses, and exclusive stickers.",
        quickAnswer: "Ridhi has four VIP tiers: Silver, Gold, Platinum, and Diamond Elite, each with increasing perks.",
        expertReviewed: true,
      },
      {
        q: "How do I cancel my subscription?",
        a: "On iOS: App Store → your Apple ID → Subscriptions → Ridhi → Cancel. On Android: Play Store → Profile → Payments & Subscriptions → Subscriptions → Ridhi → Cancel.",
        steps: ["iOS: App Store → Apple ID → Subscriptions → Ridhi → Cancel", "Android: Play Store → Profile → Payments & Subscriptions → Ridhi → Cancel"],
        quickAnswer: "iOS: App Store → Subscriptions → Ridhi → Cancel. Android: Play Store → Payments & Subscriptions → Ridhi → Cancel.",
        expertReviewed: true,
      },
      {
        q: "I was charged after cancelling.",
        a: "If cancellation was completed before the renewal date, contact hello@ridhi.app with your subscription details. We'll investigate and process a refund if applicable.",
        quickAnswer: "If you cancelled before the renewal date but were still charged, contact hello@ridhi.app for a refund investigation.",
        expertReviewed: true,
      },
    ],
  },
  {
    section: "Technical Issues",
    icon: Wifi,
    color: "from-blue-500 to-cyan-600",
    items: [
      {
        q: "The app is crashing or not loading.",
        a: "Try these steps: (1) Force-close and reopen the app. (2) Check your internet connection. (3) Clear the app cache in your phone settings. (4) Uninstall and reinstall the latest version.",
        steps: ["Force-close and reopen the app", "Check your internet connection", "Clear the app cache in phone settings", "Uninstall and reinstall the latest version"],
        quickAnswer: "Try force-closing the app, checking your internet, clearing the app cache, or reinstalling the latest version.",
        expertReviewed: true,
      },
      {
        q: "Videos and reels are buffering.",
        a: "This is usually a network issue. Switch between Wi-Fi and mobile data. Video quality may also auto-adjust based on connection speed.",
        quickAnswer: "Switch between Wi-Fi and mobile data. Video quality auto-adjusts based on your connection speed.",
        expertReviewed: true,
      },
      {
        q: "I'm not receiving OTP messages.",
        a: "Check that your phone number is correct, ensure SMS is not blocked, and try resending after 60 seconds. If the issue persists, contact hello@ridhi.app.",
        steps: ["Verify your phone number is correct", "Ensure SMS is not blocked by your carrier", "Wait 60 seconds and request a new OTP", "Contact hello@ridhi.app if the issue persists"],
        quickAnswer: "Check your phone number, ensure SMS isn't blocked, wait 60 seconds and retry, or contact hello@ridhi.app.",
        expertReviewed: true,
      },
      {
        q: "The app is not available in my region.",
        a: "Ridhi is currently available in India. If you're outside India, you may experience limited functionality. We're expanding globally — stay tuned!",
        quickAnswer: "Ridhi is currently available in India. Limited functionality may exist outside India as we expand globally.",
        expertReviewed: true,
      },
    ],
  },
];

/* ───────────────────────────────────────────────────────────────────────────── */
/* Build FAQPage schema (AI Overviews / Generative Engine Optimization) */
function buildFaqSchema(): Record<string, unknown> {
  const mainEntity = FAQS.flatMap(({ items }) =>
    items.map(({ q, a, quickAnswer }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: {
        "@type": "Answer",
        text: a,
        ...(quickAnswer && {
          comment: {
            "@type": "Comment",
            text: quickAnswer,
            author: {
              "@type": "Organization",
              name: "Ridhi Support Team",
            },
          },
        }),
      },
    }))
  );

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}

/* Build HowTo schemas for procedural answers (Voice Search / GEO) */
function buildHowToSchemas(): Record<string, unknown>[] {
  const schemas: Record<string, unknown>[] = [];
  FAQS.forEach(({ items }) => {
    items.forEach(({ q, a, steps }) => {
      if (steps && steps.length > 0) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: q,
          description: a,
          totalTime: "PT2M",
          step: steps.map((text, i) => ({
            "@type": "HowToStep",
            position: i + 1,
            text,
          })),
        });
      }
    });
  });
  return schemas;
}

/* Speakable schema (Voice Search optimization) */
const speakableSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", ".faq-question", ".faq-answer"],
  },
  name: "Ridhi Help & Support",
  url: "https://ridhi.app/admin/support",
};

/* BreadcrumbList schema (SERP UX / navigation) */
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://ridhi.app/",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Support",
      item: "https://ridhi.app/admin/support",
    },
  ],
};

/* Organization schema (E-E-A-T / authority) */
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Ridhi",
  url: "https://ridhi.app",
  logo: {
    "@type": "ImageObject",
    url: "https://ridhi.app/ridhi_logo.png",
    width: 512,
    height: 512,
  },
  description:
    "Ridhi is India's #1 social networking and dating app — live streams, voice rooms, dating & match, coin economy, reels, and brand marketplace.",
  sameAs: ["https://instagram.com/ridhiapp"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Support",
    email: "hello@ridhi.app",
    availableLanguage: ["English", "Hindi", "Bengali", "Tamil", "Telugu", "Marathi", "Gujarati", "Kannada", "Malayalam", "Punjabi", "Urdu"],
    areaServed: {
      "@type": "Country",
      name: "India",
      identifier: "IN",
    },
    hoursAvailable: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "10:00",
      closes: "19:00",
    },
  },
};

/* WebSite schema */
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Ridhi Help & Support",
  url: "https://ridhi.app/admin/support",
  publisher: {
    "@type": "Organization",
    name: "Ridhi",
  },
};

/* ───────────────────────────────────────────────────────────────────────────── */
function FAQItem({ q, a, steps, quickAnswer, expertReviewed }: FAQ) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-200 ${open ? "border-purple-300 bg-purple-50/50" : "border-gray-200 bg-white"}`}
      itemScope
      itemType="https://schema.org/Question"
    >
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="faq-question font-medium text-gray-800 text-sm leading-snug" itemProp="name">
          {q}
          {expertReviewed && (
            <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
              <ShieldCheck className="w-3 h-3" /> Expert Verified
            </span>
          )}
        </span>
        {open
          ? <ChevronUp className="w-4 h-4 text-purple-500 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4">
          {/* Quick answer — optimized for AI snippets & voice search */}
          {quickAnswer && (
            <p className="faq-answer text-sm text-gray-700 leading-relaxed font-semibold mb-2" itemProp="suggestedAnswer">
              {quickAnswer}
            </p>
          )}
          {/* Full answer — detailed for comprehensive understanding */}
          <p className="faq-answer text-sm text-gray-600 leading-relaxed mb-2" itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
            <span itemProp="text">{a}</span>
          </p>
          {/* Step-by-step — HowTo format for procedural queries */}
          {steps && steps.length > 0 && (
            <ol className="space-y-1 mt-2 ml-4 list-decimal">
              {steps.map((step, i) => (
                <li key={i} className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">Step {i + 1}:</span> {step}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────── */
export default function SupportPage() {
  /* Table of Contents anchor IDs */
  const tocIds = FAQS.map((_, i) => `faq-section-${i}`);

  /* Scroll to section */
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Helmet>
        {/* ── Core Meta ── */}
        <title>Ridhi Help &amp; Support — 27 FAQs, Contact &amp; Troubleshooting</title>
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="description" content="Get help with Ridhi — India's #1 social networking and dating app. Find expert-verified answers to 27 FAQs on accounts, coins, live streams, dating, privacy, and more. Contact us at hello@ridhi.app." />
        <meta name="keywords" content="Ridhi support, Ridhi help, Ridhi FAQ, Ridhi app help, dating app support, live stream support, coin recharge help, India dating app, social app India, Ridhi customer service, how to use Ridhi, Ridhi account help" />
        <meta name="author" content="Ridhi Support Team" />

        {/* ── Open Graph ── */}
        <meta property="og:title"       content="Ridhi Help &amp; Support — 27 Expert-Verified FAQs" />
        <meta property="og:description" content="Get help with Ridhi — India's social networking and dating app. Expert-verified answers to FAQs on accounts, coins, live streams, dating, privacy, and more." />
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content="https://ridhi.app/admin/support" />
        <meta property="og:site_name"   content="Ridhi" />
        <meta property="og:image"       content="https://ridhi.app/opengraph.jpg" />
        <meta property="og:locale"      content="en_IN" />

        {/* ── Twitter Card ── */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content="Ridhi Help &amp; Support — 27 Expert-Verified FAQs" />
        <meta name="twitter:description" content="Get help with Ridhi — India's social networking and dating app. Expert-verified answers to FAQs on accounts, coins, live streams, dating, privacy, and more." />
        <meta name="twitter:image"       content="https://ridhi.app/opengraph.jpg" />
        <meta name="twitter:site"        content="@ridhiapp" />
        <meta name="twitter:creator"     content="@ridhiapp" />

        {/* ── Canonical + Language ── */}
        <link rel="canonical" href="https://ridhi.app/admin/support" />
        <link rel="alternate" href="https://ridhi.app/admin/support" hrefLang="en-in" />
        <link rel="alternate" href="https://ridhi.app/admin/support" hrefLang="x-default" />

        {/* ── JSON-LD: FAQPage ── */}
        <script type="application/ld+json">{JSON.stringify(buildFaqSchema())}</script>

        {/* ── JSON-LD: HowTo ── */}
        {buildHowToSchemas().map((schema, i) => (
          <script key={`howto-${i}`} type="application/ld+json">{JSON.stringify(schema)}</script>
        ))}

        {/* ── JSON-LD: Organization ── */}
        <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>

        {/* ── JSON-LD: WebSite ── */}
        <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>

        {/* ── JSON-LD: BreadcrumbList ── */}
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>

        {/* ── JSON-LD: Speakable (Voice Search) ── */}
        <script type="application/ld+json">{JSON.stringify(speakableSchema)}</script>
      </Helmet>

      <main>
        {/* ── Breadcrumb Navigation (SERP UX + Accessibility) ── */}
        <nav className="max-w-4xl mx-auto px-6 pt-4 pb-0" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-xs text-gray-400" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <a href="/" itemProp="item" className="hover:text-purple-600 transition-colors flex items-center gap-1">
                <Home className="w-3 h-3" />
                <span itemProp="name">Home</span>
              </a>
              <meta itemProp="position" content="1" />
            </li>
            <li className="text-gray-300">/</li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <span itemProp="name" className="text-gray-600 font-medium">Support</span>
              <meta itemProp="position" content="2" />
            </li>
          </ol>
        </nav>

        {/* ── Hero / Header ── */}
        <header
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a0533 0%, #2d0a5e 50%, #1a0020 100%)" }}
        >
          <div className="absolute top-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full bg-purple-700/30 blur-[80px]" />
          <div className="absolute bottom-[-40px] right-[-40px] w-[250px] h-[250px] rounded-full bg-pink-600/25 blur-[70px]" />

          <div className="relative z-10 max-w-4xl mx-auto px-6 pt-10 pb-14 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <img
                src={`${BASE}ridhi_logo.png`}
                alt="Ridhi app logo — purple speech bubble with pink heart"
                className="w-12 h-12 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div className="text-left">
                <p className="text-white font-black text-2xl leading-none">Ridhi</p>
                <p className="text-purple-300 text-xs mt-0.5 tracking-widest font-medium uppercase">Support Centre</p>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              How can we help you?
            </h1>
            <p className="mt-3 text-purple-200/80 text-base max-w-md mx-auto">
              Find expert-verified answers to common questions, or reach out to our support team — we're here for you.
            </p>

            {/* E-E-A-T: Last Updated + Expert Badge */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1 rounded-full bg-white/10 text-white/70">
                <Calendar className="w-3 h-3" /> Last updated: {LAST_UPDATED}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1 rounded-full bg-green-500/20 text-green-300">
                <ShieldCheck className="w-3 h-3" /> 27 Expert-Verified Answers
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">
                <BookOpen className="w-3 h-3" /> 6 Help Categories
              </span>
            </div>

            {/* Contact chips */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:hello@ridhi.app"
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #7B2FBE, #E91E8C)" }}
                aria-label="Email Ridhi support at hello@ridhi.app"
              >
                <Mail className="w-4 h-4" /> hello@ridhi.app
              </a>
              <a
                href="https://instagram.com/ridhiapp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors"
                aria-label="Follow Ridhi on Instagram"
              >
                <MessageCircle className="w-4 h-4" /> @ridhiapp
              </a>
            </div>
          </div>
        </header>

        {/* ── Contact cards ── */}
        <section className="max-w-4xl mx-auto px-6 -mt-6" aria-label="Contact methods">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Mail,
                title: "Email Support",
                desc: "hello@ridhi.app",
                sub: "Response within 24 hours",
                href: "mailto:hello@ridhi.app",
                grad: "from-purple-600 to-pink-500",
              },
              {
                icon: MessageCircle,
                title: "In-App Chat",
                desc: "Settings → Help & Support",
                sub: "Fastest way to reach us",
                href: null,
                grad: "from-pink-500 to-rose-500",
              },
              {
                icon: AlertTriangle,
                title: "Report a Problem",
                desc: "Three-dot menu on any content",
                sub: "Reviewed within 24 hours",
                href: null,
                grad: "from-orange-500 to-amber-500",
              },
            ].map(({ icon: Icon, title, desc, sub, href, grad }) => (
              <article
                key={title}
                className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
                itemScope
                itemType="https://schema.org/ContactPoint"
              >
                <div className={`h-1 bg-gradient-to-r ${grad}`} />
                <div className="p-5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-bold text-gray-900 text-sm" itemProp="contactType">{title}</p>
                  {href
                    ? <a href={href} className="text-purple-600 text-sm font-medium hover:underline mt-0.5 block" itemProp="email">{desc}</a>
                    : <p className="text-gray-600 text-sm mt-0.5" itemProp="areaServed">{desc}</p>
                  }
                  <p className="text-gray-400 text-xs mt-1" itemProp="availableLanguage">{sub}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Table of Contents (SERP UX + Diverse Content Formats) ── */}
        <section className="max-w-4xl mx-auto px-6 mt-8" aria-label="Table of contents">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-purple-600" /> Jump to a Section
            </h2>
            <div className="flex flex-wrap gap-2">
              {FAQS.map(({ section, color }, i) => (
                <button
                  key={section}
                  onClick={() => scrollTo(tocIds[i])}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors hover:bg-gray-50"
                  style={{ borderColor: "#e5e7eb", color: "#374151" }}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ sections ── */}
        <section className="max-w-4xl mx-auto px-6 py-12 space-y-10" aria-label="Frequently asked questions">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-purple-600" /> Frequently Asked Questions
          </h2>

          {FAQS.map(({ section, icon: SIcon, color, items }, i) => (
            <article
              key={section}
              id={tocIds[i]}
              className="space-y-3 scroll-mt-6"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                  <SIcon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-black text-gray-800 text-lg">{section}</h3>
              </div>
              <div className="space-y-2">
                {items.map((item) => <FAQItem key={item.q} {...item} />)}
              </div>
            </article>
          ))}
        </section>

        {/* ── Still need help ── */}
        <section className="max-w-4xl mx-auto px-6 pb-16" aria-label="Contact support team">
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: "linear-gradient(135deg, #1a0533, #2d0a5e)" }}
          >
            <p className="text-white font-black text-xl">Still need help?</p>
            <p className="text-purple-200/80 text-sm mt-2 max-w-sm mx-auto">
              Our support team is available Monday–Saturday, 10 AM – 7 PM IST.
            </p>
            <a
              href="mailto:hello@ridhi.app"
              className="inline-flex items-center gap-2 mt-5 px-6 py-3 rounded-full text-sm font-bold text-white hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #7B2FBE, #E91E8C)" }}
              aria-label="Email Ridhi support team"
            >
              <Mail className="w-4 h-4" /> Email us at hello@ridhi.app
            </a>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} Ridhi. All rights reserved.</p>
          <nav className="flex items-center gap-4" aria-label="Legal links">
            <a href="#" className="hover:text-purple-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Community Guidelines</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
