import {
  MessageCircle, Mail, Phone, ChevronDown, ChevronUp,
  Shield, Coins, Heart, Video, Lock, UserCog, Wifi,
  AlertTriangle, Star, HelpCircle, ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";

const BASE = import.meta.env.BASE_URL;

interface FAQ { q: string; a: string }

const FAQS: { section: string; icon: React.ComponentType<{ className?: string }>; color: string; items: FAQ[] }[] = [
  {
    section: "Account & Login",
    icon: UserCog,
    color: "from-purple-500 to-violet-600",
    items: [
      { q: "How do I create a Ridhi account?", a: "Download Ridhi from the App Store or Google Play, open it, and tap 'Sign Up'. Enter your mobile number, verify the OTP, and complete your profile setup — it takes under 2 minutes." },
      { q: "I forgot my password. How do I reset it?", a: "On the login screen tap 'Forgot Password', enter your registered phone number, and you'll receive an OTP to set a new password." },
      { q: "How do I change my phone number?", a: "Go to Profile → Settings → Account → Change Phone Number. You'll need to verify your new number via OTP." },
      { q: "Can I have multiple accounts?", a: "Each phone number can be linked to one Ridhi account. Multiple accounts from the same device are not permitted under our Terms of Service." },
    ],
  },
  {
    section: "Coins & Payments",
    icon: Coins,
    color: "from-yellow-500 to-amber-600",
    items: [
      { q: "How do I recharge Ridhi Coins?", a: "Open the app → tap your coin balance at the top → choose a recharge pack starting from ₹49. Payments are processed securely via Razorpay (UPI, cards, net banking)." },
      { q: "My payment was deducted but coins weren't added.", a: "Please wait up to 15 minutes for the transaction to complete. If coins are still missing, contact us at hello@ridhi.app with your payment reference number and we'll resolve it within 24 hours." },
      { q: "Can I get a refund for purchased coins?", a: "Coins are non-refundable once purchased, as per our Refund Policy. However, if you were charged due to a technical error, contact hello@ridhi.app with proof and we'll investigate." },
      { q: "How do I send gifts during a live stream?", a: "During any live stream, tap the gift icon at the bottom right, choose a gift, and confirm with your coins. The host receives the gift value in their earnings." },
    ],
  },
  {
    section: "Live Streams & Content",
    icon: Video,
    color: "from-pink-500 to-rose-600",
    items: [
      { q: "How do I start a live stream?", a: "Tap the '+' button → select 'Go Live'. Set a title, choose your category, and tap 'Start'. Make sure you've completed KYC verification to go live." },
      { q: "Why was my content removed?", a: "Content that violates our Community Guidelines (nudity, violence, hate speech, spam) is removed. You'll receive a notification explaining the reason. Repeated violations may lead to account suspension." },
      { q: "How do I report inappropriate content?", a: "Tap the three-dot menu (⋮) on any post, reel, or live stream and select 'Report'. Our moderation team reviews reports within 24 hours." },
      { q: "Can I download reels and posts?", a: "You can save content to your personal collection within the app. Downloading to your device is only available for content the creator has enabled download permissions for." },
    ],
  },
  {
    section: "Privacy & Safety",
    icon: Shield,
    color: "from-teal-500 to-emerald-600",
    items: [
      { q: "How do I block someone?", a: "Visit the user's profile → tap the three-dot menu → select 'Block'. Blocked users cannot view your profile, send messages, or interact with your content." },
      { q: "Who can see my profile?", a: "By default, your profile is public. You can switch to a private account in Settings → Privacy → Account Privacy. Private accounts require approval for new followers." },
      { q: "How is my data used?", a: "We collect only the data necessary to provide and improve the Ridhi experience. We never sell your personal data. Read our full Privacy Policy at ridhi.app/privacy." },
      { q: "How do I delete my account?", a: "Go to Settings → Account → Delete Account. Your data will be permanently removed within 30 days. This action cannot be undone." },
    ],
  },
  {
    section: "Subscriptions & VIP",
    icon: Star,
    color: "from-violet-500 to-purple-700",
    items: [
      { q: "What are the VIP subscription tiers?", a: "Ridhi offers four VIP tiers — Silver, Gold, Platinum, and Diamond Elite — with increasing perks like profile badge, priority in discovery, daily coin bonuses, and exclusive stickers." },
      { q: "How do I cancel my subscription?", a: "On iOS: App Store → your Apple ID → Subscriptions → Ridhi → Cancel. On Android: Play Store → Profile → Payments & Subscriptions → Subscriptions → Ridhi → Cancel." },
      { q: "I was charged after cancelling.", a: "If cancellation was completed before the renewal date, contact hello@ridhi.app with your subscription details. We'll investigate and process a refund if applicable." },
    ],
  },
  {
    section: "Technical Issues",
    icon: Wifi,
    color: "from-blue-500 to-cyan-600",
    items: [
      { q: "The app is crashing or not loading.", a: "Try these steps: (1) Force-close and reopen the app. (2) Check your internet connection. (3) Clear the app cache in your phone settings. (4) Uninstall and reinstall the latest version." },
      { q: "Videos and reels are buffering.", a: "This is usually a network issue. Switch between Wi-Fi and mobile data. Video quality may also auto-adjust based on connection speed." },
      { q: "I'm not receiving OTP messages.", a: "Check that your phone number is correct, ensure SMS is not blocked, and try resending after 60 seconds. If the issue persists, contact hello@ridhi.app." },
      { q: "The app is not available in my region.", a: "Ridhi is currently available in India. If you're outside India, you may experience limited functionality. We're expanding globally — stay tuned!" },
    ],
  },
];

function FAQItem({ q, a }: FAQ) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-200 ${open ? "border-purple-300 bg-purple-50/50" : "border-gray-200 bg-white"}`}
    >
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-medium text-gray-800 text-sm leading-snug">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-purple-500 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Helmet>
        <title>Ridhi Help & Support — FAQs, Contact & Troubleshooting</title>
        <meta name="robots" content="index, follow" />
        <meta name="description" content="Get help with Ridhi — India's social networking and dating app. Find answers to FAQs on accounts, coins, live streams, dating, privacy, and more. Contact us at hello@ridhi.app." />
        <meta property="og:title"       content="Ridhi Help & Support" />
        <meta property="og:description" content="Answers to common questions about Ridhi — accounts, coins, live streams, dating, privacy, and more." />
        <meta property="og:type"        content="website" />
        <meta name="twitter:card"       content="summary" />
        <meta name="twitter:title"      content="Ridhi Help & Support" />
        <meta name="twitter:description" content="Answers to common questions about Ridhi — accounts, coins, live streams, dating, privacy, and more." />
        <link rel="canonical" href="https://ridhi.app/admin/support" />
      </Helmet>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a0533 0%, #2d0a5e 50%, #1a0020 100%)" }}
      >
        <div className="absolute top-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full bg-purple-700/30 blur-[80px]" />
        <div className="absolute bottom-[-40px] right-[-40px] w-[250px] h-[250px] rounded-full bg-pink-600/25 blur-[70px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-14 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img
              src={`${BASE}ridhi_logo.png`}
              alt="Ridhi"
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
            Find answers to common questions, or reach out to our support team — we're here for you.
          </p>

          {/* Contact chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:hello@ridhi.app"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #7B2FBE, #E91E8C)" }}
            >
              <Mail className="w-4 h-4" /> hello@ridhi.app
            </a>
            <a
              href="https://instagram.com/ridhiapp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> @ridhiapp
            </a>
          </div>
        </div>
      </div>

      {/* ── Contact cards ──────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 -mt-6">
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
            <div
              key={title}
              className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
            >
              <div className={`h-1 bg-gradient-to-r ${grad}`} />
              <div className="p-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-bold text-gray-900 text-sm">{title}</p>
                {href
                  ? <a href={href} className="text-purple-600 text-sm font-medium hover:underline mt-0.5 block">{desc}</a>
                  : <p className="text-gray-600 text-sm mt-0.5">{desc}</p>
                }
                <p className="text-gray-400 text-xs mt-1">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ sections ───────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-purple-600" /> Frequently Asked Questions
        </h2>

        {FAQS.map(({ section, icon: SIcon, color, items }) => (
          <div key={section} className="space-y-3">
            <div className="flex items-center gap-2.5 mb-4">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                <SIcon className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-black text-gray-800 text-lg">{section}</h3>
            </div>
            <div className="space-y-2">
              {items.map((item) => <FAQItem key={item.q} {...item} />)}
            </div>
          </div>
        ))}
      </div>

      {/* ── Still need help ────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
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
          >
            <Mail className="w-4 h-4" /> Email us at hello@ridhi.app
          </a>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Ridhi. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-purple-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Community Guidelines</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
