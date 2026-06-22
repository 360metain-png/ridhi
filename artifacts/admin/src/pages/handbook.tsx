import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadCSV } from "@/lib/utils";
import {
  BookOpen, Smartphone, Shield, ChevronDown, ChevronRight,
  Star, Briefcase, Radio, Video, MessageSquare, IndianRupee,
  LayoutDashboard, ShieldAlert, Phone, BarChart3, Megaphone,
  Cpu, ScanFace, ShieldCheck, Activity, Zap, CheckCircle,
  Info, LogIn, UserPlus, Edit, Code, Link,
  FileText, HelpCircle, Award, Sparkles, TrendingUp,
  Crown, Gift, Users, ToggleRight, Globe, Settings, ShoppingBag,
  Key, Webhook, AlertTriangle, Lock, CreditCard,
  UsersRound, ClipboardList, Percent, DollarSign, Download, Wallet} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Step { text: string }
interface Section {
  id: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  title: string;
  subtitle: string;
  steps?: Step[];
  features?: string[];
  note?: string;
}

// ── Accordion section ──────────────────────────────────────────────────────────

function HandbookSection({ section }: { section: Section }) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;
  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${open ? "shadow-sm" : ""}`}>
      <button
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className={`p-2 rounded-lg ${section.bg} flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${section.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{section.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{section.subtitle}</p>
        </div>
        {open
          ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t bg-muted/10">
          {section.steps && section.steps.length > 0 && (
            <div className="pt-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Step-by-Step</p>
              {section.steps.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className={`mt-0.5 w-5 h-5 rounded-full ${section.bg} ${section.color} text-xs font-bold flex items-center justify-center flex-shrink-0`}>{i + 1}</span>
                  <p className="text-sm text-foreground leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          )}
          {section.features && section.features.length > 0 && (
            <div className="pt-3 space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Features & Details</p>
              {section.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${section.color}`} />
                  <p className="text-sm text-foreground leading-relaxed">{f}</p>
                </div>
              ))}
            </div>
          )}
          {section.note && (
            <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
              <Info className="w-3.5 h-3.5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-800">{section.note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── HOST GUIDE DATA ────────────────────────────────────────────────────────────

const HOST_SECTIONS: Section[] = [
  {
    id: "h-registration",
    icon: UserPlus,
    color: "text-pink-600",
    bg: "bg-pink-50",
    title: "Becoming a Host — Registration",
    subtitle: "Apply to become a live Host on Ridhi via the mobile app",
    steps: [
      { text: "Open the Ridhi app and complete your regular user profile if you haven't already (name, age, gender, city, interests)." },
      { text: "Tap Profile → Earn on Ridhi → Host card → Apply Now." },
      { text: "Fill the Host Registration form: Display Name, Language(s) you stream in, Content Type (Entertainment / Music / Talk / Gaming / Education / Dance), Bio, City." },
      { text: "Upload a clear, well-lit profile photo — this is shown on the Live discovery page." },
      { text: "Read and accept the Host Guidelines by tapping the checkbox." },
      { text: "Tap Submit Registration. An animated confirmation screen appears — your application is sent to the Admin team." },
      { text: "Admin reviews your application within 24–48 hours. You receive an in-app notification when approved or rejected." },
      { text: "Once approved, the Host card on your Profile shows Active ✓ and a Go Live button appears on your dashboard." },
    ],
    features: [
      "You must be 18+ to register as a Host",
      "Your display name, content type, and bio appear on the Live discovery page for viewers",
      "Rejected applications can be resubmitted after addressing the rejection reason",
      "After approval you are assigned a Host ID (e.g. HOST-4821) used for all support queries",
    ],
    note: "Host registration is completely free. Ridhi does not charge any fee to become a Host.",
  },
  {
    id: "h-dashboard",
    icon: LayoutDashboard,
    color: "text-purple-600",
    bg: "bg-purple-50",
    title: "Host Dashboard",
    subtitle: "Your earnings, level progress, stream stats, and KYC — all in one place",
    features: [
      "Access via Profile → Host Dashboard (appears after approval)",
      "Header: shows your current level badge (e.g. L5 💎 Diamond), Host ID, and level colour",
      "Progress card: three bars showing Coins Earned, Stream Hours, and PK Wins — all tracking toward your next level",
      "Tabs: Overview · Earnings · Stream History",
      "Overview tab: quick stat cards for Total Earnings (₹), This Month (₹), Pending Payout (₹), Coin Balance, Gifts Today",
      "Earnings tab: full breakdown — Gifts income, Download Earnings, Creator Bonus, Tips income, with a 7-day earnings chart",
      "Stream History tab: every past live session with date, duration, viewer count, gifts received, and coins earned",
      "KYC Status card: shows Verified ✓ / Pending ⏳ / Rejected ✗ with the KYC submission date",
      "Agent Info card: name, level, and contact details of your assigned agent (if any)",
      "Quick Actions row: Go Live · Request Payout · KYC Status · Creator Stats · Coin Wallet · Handbook",
    ],
    note: "The Host Dashboard is only visible after your host application is approved. Before that, the Profile → Earn on Ridhi screen shows the registration form.",
  },
  {
    id: "h-golive",
    icon: Radio,
    color: "text-red-600",
    bg: "bg-red-50",
    title: "Going Live — Streaming",
    subtitle: "Start a live stream and receive virtual gifts from viewers in real time",
    steps: [
      { text: "Tap Go Live from your Host Dashboard or the + Create button → Live Stream." },
      { text: "Set your stream title (e.g. 'Evening Chill Session 🎵') and select your stream category." },
      { text: "Preview your camera — check lighting and audio. Toggle front/back camera as needed." },
      { text: "Tap Start Live. A 3-second countdown begins, then you are live to all viewers." },
      { text: "Viewers see your stream on the Live discovery page and can join, send gifts, and comment." },
      { text: "Gift animations play on screen in real time when viewers send you virtual gifts." },
      { text: "To end the stream, tap the X icon → confirm End Stream. Your session stats are saved immediately." },
    ],
    features: [
      "Maximum stream duration: 4 hours per session",
      "Viewer count shown live in the top corner",
      "Comments appear in a scrolling chat panel — you can pin or hide comments",
      "Block a viewer: tap their name in chat → Block (they cannot re-enter your stream)",
      "PK Battle: tap the PK icon to challenge another live host — viewers vote by sending gifts to their preferred host",
      "Pause feature: tap Pause to freeze your camera temporarily without ending the session",
      "Minimum 2 viewers required to keep a stream active (for 10 minutes); otherwise the stream auto-ends",
      "Stream quality adapts to your internet speed automatically",
    ],
    note: "Streaming while driving or in a moving vehicle is a community guideline violation and will result in immediate stream termination by the Admin team.",
  },
  {
    id: "h-gifts",
    icon: Gift,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "Virtual Gifts & Coin Earnings",
    subtitle: "How viewers send gifts and how you earn from them",
    features: [
      "Viewers send virtual gifts to you during live streams using their Ridhi Coins",
      "Each gift has a coin value set by the Super Admin — examples:",
      "  → Rose 🌹 = 10 coins · Heart 💓 = 50 coins · Ring 💍 = 500 coins · Sports Car 🚗 = 5,000 coins · Castle 🏰 = 50,000 coins",
      "Gift animations appear on screen for both you and your viewers — larger gifts have longer, more dramatic animations",
      "100% of gift coin values are credited to your Host Coin Balance",
      "Your Host Coin Balance converts to INR: 1 coin = ₹1.00 (rate set by Super Admin)",
      "Gift earnings accumulate in your coin wallet and are shown on the Host Dashboard",
      "Premium gifts and limited-edition gifts are added by the Super Admin for festivals and events",
      "Viewers can also send Tips (a text message + coin value) to show support",
    ],
    note: "Gift income is based on coins received during live sessions. Coins are NOT transferable between users. The conversion rate (₹/coin) is set by the Super Admin and may be updated.",
  },
  {
    id: "h-levels",
    icon: TrendingUp,
    color: "text-violet-600",
    bg: "bg-violet-50",
    title: "Host Levels — L1 to L7",
    subtitle: "Earn coins, stream hours, and PK wins to climb from Bronze to Crown",
    features: [
      "L1 · Bronze — Starting level. All new approved hosts begin here",
      "  → Threshold: 50,000 coins earned · 20 stream hours · 0 PK wins",
      "L2 · Silver — Threshold: 200,000 coins · 60 hours · 2 PK wins",
      "L3 · Gold — Threshold: 500,000 coins · 150 hours · 5 PK wins",
      "L4 · Platinum — Threshold: 1,000,000 coins · 300 hours · 10 PK wins",
      "L5 · Diamond — Threshold: 2,000,000 coins · 600 hours · 20 PK wins",
      "L6 · Elite — Threshold: 3,500,000 coins · 1,000 hours · 35 PK wins",
      "L7 · Royal Crown — Threshold: 5,000,000 coins · 1,500 hours · 50 PK wins",
      "Higher levels unlock: better earnings-share rate, featured placement in Live discovery, exclusive profile frames, priority in search results",
      "Auto-Promotion: system checks your stats daily at midnight. When you cross a threshold you receive a push notification — Admin reviews and approves the promotion",
      "Auto-Demotion: 30 days without streaming = level frozen. 60 days without any stream = demoted by 1 level",
      "Level progress bars are shown on your Host Dashboard for all three metrics (coins, hours, PK wins)",
    ],
    note: "Manual level promotion requests can be submitted through your Agent. The final approval is from the Admin or Super Admin team.",
  },
  {
    id: "h-downloads",
    icon: Download,
    color: "text-teal-600",
    bg: "bg-teal-50",
    title: "Paid Downloads — New Revenue Stream",
    subtitle: "Users pay coins to download your content. You earn 60% of every download.",
    features: [
      "Download pricing: Reel = 5 coins · Post (photo/video) = 10 coins · Story = 3 coins · Live Recording = 20 coins · Audio Room = 8 coins",
      "Revenue split: 60% to you (the creator), 40% to Ridhi platform",
      "Example: a user downloads your post for 10 coins → you earn 6 coins, Ridhi keeps 4 coins",
      "Download earnings are tracked in your Creator Dashboard → Download Earnings tab",
      "Download count appears on each post/reel/story — shows how many users have downloaded it",
      "All downloads are watermarked with the user's username to prevent unauthorized redistribution",
      "Download transactions appear in your wallet history: +6 coins credited when a user downloads",
    ],
    note: "Downloads are a new monetisation feature. The more high-quality content you create, the more download revenue you earn. Reels and live recordings tend to generate the most downloads.",
  },
  {
    id: "h-pk",
    icon: Zap,
    color: "text-orange-600",
    bg: "bg-orange-50",
    title: "PK Battles",
    subtitle: "Challenge another live host — viewers pick a winner by sending gifts",
    steps: [
      { text: "While you are live, tap the PK icon on your stream screen." },
      { text: "Search for another host who is currently live, or accept a PK challenge sent to you." },
      { text: "Both hosts go into split-screen PK mode — viewers can see both streams side by side." },
      { text: "A timer (default 3 minutes) counts down. Viewers send gifts to the host they want to win." },
      { text: "The host whose viewers sent the most coin-value in gifts wins the PK round." },
      { text: "Win animation plays for the winner. A loss effect plays for the other host." },
      { text: "Both hosts return to their individual full-screen streams." },
    ],
    features: [
      "PK wins count toward your Host Level progression (L1–L7 each require a minimum number of PK wins)",
      "You can challenge any host who is currently live and accepts PK challenges",
      "Disable PK challenges: tap the Settings icon on your stream → turn off 'Allow PK Challenges'",
      "PK rounds can be 1 min, 3 min, or 5 min — both hosts must agree to the duration before starting",
      "Gift coins sent during PK go directly to that host's coin balance (same as regular gifts)",
      "PK win history is visible in your Host Dashboard → Stream History",
    ],
  },
  {
    id: "h-kyc",
    icon: ScanFace,
    color: "text-sky-600",
    bg: "bg-sky-50",
    title: "E-KYC Verification",
    subtitle: "Complete KYC before your first payout withdrawal",
    steps: [
      { text: "Tap KYC Status on your Host Dashboard (or Profile → Settings → KYC Verification)." },
      { text: "Select your document type: Aadhaar Card, PAN Card, or Passport." },
      { text: "Upload clear photos of the front and back of your document." },
      { text: "Confirm that the details match your Ridhi profile name and date of birth." },
      { text: "Tap Submit. Your submission is reviewed by the Admin team within 24 hours." },
      { text: "You receive an in-app notification when your KYC is Approved or Rejected." },
      { text: "If rejected, the reason is shown (e.g., 'Image blurry', 'Name mismatch') — re-upload a clearer document." },
    ],
    features: [
      "KYC is mandatory before your first payout withdrawal — you can earn coins without KYC but cannot withdraw",
      "Once KYC is approved, a blue Verified badge ✓ appears on your profile",
      "Aadhaar and PAN are the fastest-processed documents (usually within a few hours during business days)",
      "Your documents are stored securely and are never shared with other users",
      "Support hours for KYC: Monday–Saturday, 10 AM–7 PM IST",
    ],
    note: "KYC verification is a one-time process. You do not need to re-submit unless your account is flagged for a re-verification review.",
  },
  {
    id: "h-payouts",
    icon: IndianRupee,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    title: "Earnings & Payouts",
    subtitle: "Withdraw your coin earnings to your bank account or UPI",
    steps: [
      { text: "Ensure your KYC is verified before requesting a payout." },
      { text: "Tap Request Payout on your Host Dashboard or go to Profile → Wallet → Withdraw." },
      { text: "Enter the amount you wish to withdraw (minimum ₹500)." },
      { text: "Select your payout method: Bank Transfer (NEFT/IMPS) or UPI ID." },
      { text: "Enter your bank account number + IFSC code, or your UPI ID." },
      { text: "Review the payout summary and tap Confirm Withdrawal." },
      { text: "The Super Admin processes and approves the payout. You receive confirmation in-app when funds are transferred." },
    ],
    features: [
      "Minimum withdrawal: ₹500 per request",
      "Payout processing time: 7 working days from approval",
      "Coin-to-INR conversion: 1 coin = ₹1.00 (rate set by Super Admin)",
      "Payout methods: Bank Account (NEFT/IMPS) or UPI ID",
      "Withdrawal history: visible in Host Dashboard → Earnings tab",
      "TDS (Tax Deducted at Source) may apply as per Indian tax regulations on payouts above ₹10,000",
      "If a payout is rejected, the reason is shown in-app and the amount returns to your pending balance",
      "Payouts are approved by the Super Admin — Admin team cannot approve financial transactions",
    ],
    note: "Make sure your bank account or UPI ID matches the name on your KYC document. Mismatched details will cause payout rejection.",
  },
  {
    id: "h-agent",
    icon: Briefcase,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Your Agent",
    subtitle: "Your agent recruits and mentors you — they earn commission on your income",
    features: [
      "An Agent is a person who recruited you to Ridhi as a Host",
      "Your Agent's name, level, and contact details are shown on your Host Dashboard → Agent Info card",
      "Your agent earns a commission percentage (2–10% depending on their level) on your total gift earnings",
      "This commission does NOT come from your earnings — it is a separate payment from the platform to the agent",
      "Your agent can help you with: Host promotion requests, KYC issues, payout follow-ups, stream strategy",
      "If you were not recruited by an agent, the Agent Info card shows 'Unassigned' — the Admin team may assign you one",
      "You cannot change your assigned agent yourself — contact hello@ridhi.app if there is a dispute",
      "If your agent leaves or is removed: your host account is automatically transferred to direct Admin oversight. You will NOT lose your earnings or level. The Admin team will assign a new agent or manage you directly.",
    ],
    note: "Your Agent's commission does not reduce your earnings. You always receive 100% of the gift coin value — the agent's commission is paid separately by Ridhi. Hosts are never left without management.",
  },
  {
    id: "h-creator",
    icon: BarChart3,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    title: "Creator Dashboard & Content",
    subtitle: "Post content, track analytics, and grow your audience as a Host-Creator",
    features: [
      "Hosts also have full access to the Creator Dashboard: Profile → Creator Dashboard",
      "Creator Dashboard shows: total views, likes, shares, comments on all your posts, reels, and live sessions",
      "Top Content: ranked list of your best-performing posts by engagement",
      "Views chart: 7-day bar chart showing daily views",
      "Content types you can post: Text Posts, Photos, Videos, Reels (30-sec vertical), Stories (24 hrs), Polls",
      "Reels get extra algorithmic boost for Hosts — appear in the main Reels tab and Explore",
      "Saved Posts: bookmark any post into collections — free users get 5, Silver 20, Gold 50, Platinum 100, Diamond unlimited + smart folders",
      "Story Highlights: save your best stories permanently to your profile — free users get 0, Silver 2, Gold 5, Platinum 10, Diamond unlimited",
      "Broadcast Channels: create one-to-many broadcast channels for fans — send announcements, polls, and exclusive content. Diamond Elite hosts can monetise channels with paid entry",
      "Ridhi Shop: sell creator merchandise (mugs, hoodies, stickers) and digital gifts directly to your followers. Diamond Elite gets 15% discount on all shop purchases. Users can add products to cart and checkout with bulk purchases using coins. Cart supports quantity adjustments, remove items, and buy-all.",
      "Events & Meetups: create virtual or in-person events for your followers — dating meetups, fan gatherings, community events. Platinum+ can create events; Diamond can monetise with ticket sales",
      "Creator subscription tiers: Creator Starter (₹199/mo) → Creator Pro (₹499/mo) → Creator Elite (₹999/mo)",
      "Creator plans reduce Ridhi's platform fee: Starter 20%, Pro 13%, Elite 8% (default is 30%)",
      "Creator Elite: dedicated creator manager, unlimited monetisation, fan club features",
      "Fan Club: set a monthly subscription fee for your exclusive content — tiers: Supporter 49 coins (₹49/mo), Super Fan 149 coins (₹149/mo), VIP Fan 499 coins (₹499/mo)",
    ],
  },
  {
    id: "h-ads",
    icon: Megaphone,
    color: "text-violet-600",
    bg: "bg-violet-50",
    title: "Ridhi Ads — Brand Advertising",
    subtitle: "Create targeted ad campaigns that reach users in the Home Feed, Stories, Reels, and Explore",
    features: [
      "Ad Campaigns: brands register (₹1,000 one-time fee) and create targeted campaigns via Profile → Ads Manager",
      "Campaign formats: Feed (inline every 5th post), Story (full-screen), Reel (vertical video), Banner (top/bottom), Explore (discover page)",
      "Targeting: city, age range, gender, and interests. Supports 'All India' broad reach",
      "Budget: daily budget (min ₹100/day) × duration days = total budget. Pay via Ridhi Coins or direct payment (Razorpay UPI/Card/Net Banking)",
      "Campaign lifecycle: Pending → Active (after review) → Paused / Completed / Rejected",
      "Campaign review: submitted campaigns are reviewed within 24 hours. Approved campaigns go live automatically",
      "Analytics: real-time impressions, clicks, CTR, CPM, spend tracking per campaign",
      "Revenue model: brands pay per campaign. Ridhi charges platform fee; creators can earn from ad placements",
      "Buy Creator option: brands can sponsor specific creators for native content placements",
      "GST invoicing: tax invoices auto-generated for direct payment campaigns (GSTIN: 33AAMCK0376J1ZD)",
      "Performance reports: downloadable PDF/TXT reports for completed campaigns with full metrics breakdown",
    ],
    note: "Ad campaigns are subject to Ridhi's content policy. Prohibited content (gambling, tobacco, alcohol, political) will be rejected. Brand registration must be renewed every 30 days by running at least one campaign.",
  },
  {
    id: "h-shop",
    icon: ShoppingBag,
    color: "text-teal-600",
    bg: "bg-teal-50",
    title: "Ridhi Shop & Cart",
    subtitle: "In-app marketplace where users buy products with coins. Cart supports bulk checkout.",
    features: [
      "Users browse products in Fashion, Beauty, Electronics, Home categories — priced in Ridhi Coins",
      "Add to Cart: tap the cart icon on any product detail page to add it. Cart icon turns orange when product is in cart",
      "Cart screen: view all items with quantity adjust (+/-), remove items, clear all, or Buy All with one tap",
      "Buy with Coins: individual purchase from product detail page. Insufficient balance triggers redirect to Coin Wallet or Missions",
      "Wishlist: heart icon on product detail to save items for later (separate from cart)",
      "Cart persistence: stored in AsyncStorage so items survive app restarts",
      "Revenue model: 100% of shop purchases go to Ridhi platform. Creator merchandise sold through shop earns 70% to creator, 30% to platform",
      "Diamond Elite VIP members get 15% discount on all shop purchases (automatically applied at checkout)",
      "Product categories: Fashion (silk kurtas, sneakers, sunglasses), Beauty (makeup, skincare), Electronics (headphones, accessories), Home (decor, kitchen)",
      "Shop analytics: Super Admin tracks total shop revenue, top selling products, and cart abandonment rates in Feature Analytics tab",
    ],
    note: "The Shop Cart is a new feature. Cart badge on the shop header shows live item count. All purchases are final (no refunds on coin purchases).",
  },
  {
    id: "h-tiktok-tools",
    icon: Video,
    color: "text-pink-600",
    bg: "bg-pink-50",
    title: "TikTok-Style Content Tools (New)",
    subtitle: "New features for Indian creators: TTS, Auto-Captions, Carousel, Video Replies, Streaks, and more",
    features: [
      "Text-to-Speech (TTS): convert your post text to spoken audio in 13 Indian languages — Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu, and English",
      "TTS voice selector: choose from Voice A, Voice B, or Voice C per language — each with a unique tone and accent",
      "Auto-Captions: automatically generate subtitles for videos and reels in the language you select — fully editable before publishing",
      "Photo Carousel: upload 2–10 photos in a single post with horizontal swipe, dot indicators, and a 'Cover' badge on the first image",
      "Video Replies to Comments: reply to any comment on your post with a short video — opens the create-post screen with pre-filled context",
      "Not Interested / Hide Posts: users can tap 'Not Interested' on any post to hide it and train their personal recommendation algorithm",
      "Repost to Followers: repost any public post to your own followers with a single tap — repost count shown on the original post",
      "Streaks: daily posting streak counter — post at least once every day to maintain your streak. Miss one day and streak resets. 🔥 badge on profile shows current streak count",
      "Streaks are tracked server-side and update in real time on the profile — visible to all followers",
      "All these tools are available in the Create Post screen (+ button) and are accessible to all users, not just Hosts",
      "Regional language support is core: all tools default to the user's selected language from Settings (13 Indian languages)",
    ],
    note: "These TikTok-inspired features are designed for Indian users and regional content creators. The TTS engine supports Indian-accented voices for each language. Auto-Captions are generated locally on-device for privacy. Streaks update at midnight IST.",
  },
  {
    id: "h-support",
    icon: HelpCircle,
    color: "text-slate-600",
    bg: "bg-slate-100",
    title: "Support & Help",
    subtitle: "Get help with hosting, payouts, KYC, and account issues",
    features: [
      "In-app: tap Host Dashboard → Handbook quick action for instant reference",
      "Email: hello@ridhi.app — for payout issues, KYC disputes, account suspension appeals",
      "Support hours: Monday–Saturday, 10:00 AM – 7:00 PM IST",
      "Contact your Agent first for host-level issues (stream strategy, level promotion, KYC follow-up)",
      "Appeal a host suspension: email hello@ridhi.app with your Host ID and reason",
      "Payout not received: email hello@ridhi.app with your transaction reference number",
      "Stream was force-ended incorrectly: email hello@ridhi.app with date/time and stream details",
    ],
  },
];

// ── AGENT GUIDE DATA ───────────────────────────────────────────────────────────

const AGENT_SECTIONS: Section[] = [
  {
    id: "ag-registration",
    icon: UserPlus,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    title: "Becoming an Agent — Registration",
    subtitle: "Apply to become a Ridhi Agent and build your host roster",
    steps: [
      { text: "Open the Ridhi app and go to Profile → Earn on Ridhi → Agent card → Apply Now." },
      { text: "Fill the Agent Registration form: Agency Name (or your name if solo), Full Name, WhatsApp Number, City, Gender, Experience in talent/social media management." },
      { text: "Describe your host recruitment plan briefly (how many hosts you expect to recruit and from which region)." },
      { text: "Read and accept the Agent Agreement by tapping the checkbox." },
      { text: "Tap Submit Registration. An animated confirmation screen confirms your submission." },
      { text: "The Admin team reviews your application within 24–48 hours." },
      { text: "Once approved you receive an in-app notification. The Agent Dashboard becomes accessible from your Profile." },
    ],
    features: [
      "Requirements: 18+ years old, strong network in entertainment or social media, ability to recruit and mentor hosts, E-KYC verified identity",
      "Registration is free — Ridhi charges no fee to become an Agent",
      "After approval you receive a unique Agent Code (share it with hosts so they join under you)",
      "Rejected applications can be resubmitted once you have addressed the reason for rejection",
    ],
    note: "Fraudulent host recruitment (fake profiles, invalid accounts) results in immediate Agent removal and forfeiture of all pending commissions.",
  },
  {
    id: "ag-dashboard",
    icon: LayoutDashboard,
    color: "text-purple-600",
    bg: "bg-purple-50",
    title: "Agent Dashboard",
    subtitle: "Your level, host roster, commissions, and weekly stats — all in the app",
    features: [
      "Access via Profile → Agent Dashboard (visible only after approval)",
      "Header: your agent name, current level badge (e.g. A3 ⚡ Pro Agent), commission rate, and Agent ID",
      "Stats row: Active Hosts, Total Hosts in roster, This Month's Volume (₹), Commission Earned (₹)",
      "Progress bar: shows your progress toward the next agent level threshold",
      "Tabs: Overview · My Hosts · Levels",
      "Overview tab: weekly bar chart of managed volume, commission breakdown, quick action buttons",
      "My Hosts tab: list of all your hosts with name, city, level, total earnings, status (Active / Inactive), and number of live sessions",
      "Tap any host card to see their detailed stats: stream hours, gifts received, coin balance, KYC status",
      "Levels tab: full A1–A5 level table with thresholds for hosts managed, coin volume, and bonus rate",
      "Quick Actions: Recruit Host (share your Agent Code) · Request Payout · View Commission · Share Agent Code",
    ],
  },
  {
    id: "ag-levels",
    icon: TrendingUp,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "Agent Levels — A1 to A5",
    subtitle: "Grow your host roster and volume to climb from Starter to Master Agent",
    features: [
      "A1 · Starter Agent — Starting level. All new approved agents begin here",
      "  → Commission: 2% · Required: 5 active hosts · ₹50K monthly volume",
      "A2 · Senior Agent — Commission: 4% · Required: 20 active hosts · ₹2L monthly volume",
      "A3 · Super Agent — Commission: 6% · Required: 60 active hosts · ₹5L monthly volume",
      "A4 · Elite Agent — Commission: 8% · Required: 150 active hosts · ₹10L monthly volume",
      "A5 · Master Agent — Commission: 10% · Required: 250 active hosts · ₹25L monthly volume",
      "Auto-Promotion: system checks thresholds daily at midnight. When you qualify, a push notification is sent and Admin/SA approves the promotion",
      "Auto-Demotion trigger 1: active host rate drops below 40% for 2 consecutive months → demoted by 1 level",
      "Auto-Demotion trigger 2: no new host recruited in 90 days → level frozen (no demotion, but no income growth)",
      "Higher level = higher commission % on the same host earnings — worth recruiting actively",
    ],
    note: "Commission rate applies to all hosts in your roster. If you have 50 active hosts at A3, you earn 5% of every rupee they collectively make from gifts.",
  },
  {
    id: "ag-commission",
    icon: Percent,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    title: "Commission Structure & Earnings",
    subtitle: "How your commission is calculated and when you get paid",
    features: [
      "Commission is calculated on the total INR value of gift coins earned by all your hosts each month",
      "Example at A3 (6%): if your 60 hosts collectively earn ₹2,00,000 in a month → your commission = ₹12,000",
      "Commission is credited to your Ridhi wallet at the end of each month",
      "Minimum payout: ₹500 per withdrawal request",
      "Payout method: Bank Transfer (NEFT/IMPS) or UPI ID",
      "Processing time: 7 working days after Super Admin approval",
      "KYC (Aadhaar/PAN) is mandatory before your first commission withdrawal",
      "Commission earnings and withdrawal history are visible in Agent Dashboard → Commission tab",
      "The Super Admin can set a custom commission rate for exceptional agents — visible in your Dashboard header",
    ],
    note: "Commissions are paid to you by Ridhi — they are NOT deducted from your hosts' earnings. Your hosts always receive 100% of their gift coin income.",
  },
  {
    id: "ag-recruit",
    icon: UsersRound,
    color: "text-pink-600",
    bg: "bg-pink-50",
    title: "Recruiting Hosts",
    subtitle: "How to invite hosts to join Ridhi under your Agency",
    steps: [
      { text: "From your Agent Dashboard, tap Recruit Host or Share Agent Code." },
      { text: "Copy your unique Agent Referral Code or share the invite link directly via WhatsApp, Instagram, Telegram, or any platform." },
      { text: "When a new user opens the app via your link or enters your Agent Code during registration, they are linked to your roster." },
      { text: "They still need to apply as a Host and be approved by Admin before they count as an active host in your roster." },
      { text: "Once their host application is approved, they appear in your My Hosts list and their earnings start contributing to your commission." },
    ],
    features: [
      "There is no cap on the number of hosts you can recruit",
      "Target cities and niches that have high streaming engagement (entertainment, music, education)",
      "Hosts you recruit benefit from your guidance on streaming strategy, gift culture, and level promotion",
      "Share your Agent Code widely on social platforms, Telegram groups, and local creator communities",
      "Each approved host under you generates passive commission income — the more active hosts, the higher your income",
    ],
    note: "Only hosts who are approved and have streamed at least once in a month are counted as 'active hosts' for level calculation purposes.",
  },
  {
    id: "ag-manage",
    icon: ClipboardList,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Managing Your Host Roster",
    subtitle: "Monitor performance and keep your hosts active and growing",
    features: [
      "My Hosts tab: view every host's name, city, level (L1–L7), total earnings, call count, and active/inactive status",
      "Inactive hosts: appear in a separate 'Inactive' filter — reach out to re-engage them before demotion triggers",
      "Active Host Rate: shown in your Dashboard header — must stay above 40% to avoid level demotion",
      "Support your hosts with: stream scheduling advice, gift strategy, PK battle tips, KYC guidance",
      "Track each host's progress toward their next level — help them hit their stream hours and PK win targets",
      "Contact host: tap their card → Contact to open a chat or see their registered WhatsApp number (if shared)",
      "If a host is struggling, escalate to the Admin team via hello@ridhi.app — mention the Host ID",
      "Hosts who leave the platform or are banned are automatically removed from your active roster count",
    ],
  },
  {
    id: "ag-kyc",
    icon: ScanFace,
    color: "text-sky-600",
    bg: "bg-sky-50",
    title: "E-KYC Verification (Agent)",
    subtitle: "Complete KYC before your first commission withdrawal",
    steps: [
      { text: "Tap Profile → Settings → KYC Verification (or tap the KYC button on your Agent Dashboard)." },
      { text: "Select document type: Aadhaar Card, PAN Card, or Passport." },
      { text: "Upload clear, well-lit photos of both front and back of your document." },
      { text: "Confirm name and date of birth match your Ridhi profile." },
      { text: "Tap Submit — Admin reviews within 24 hours (Monday–Saturday)." },
      { text: "Receive an in-app notification when approved or rejected with the rejection reason." },
    ],
    features: [
      "KYC is mandatory before withdrawing any commission earnings",
      "Commission accumulates in your wallet while KYC is pending — you just cannot withdraw yet",
      "Approved KYC shows a blue Verified ✓ badge on your Agent profile",
      "KYC is a one-time process unless the Admin team requests a re-verification",
    ],
  },
  {
    id: "ag-promotion",
    icon: Award,
    color: "text-violet-600",
    bg: "bg-violet-50",
    title: "Promotion & Demotion Rules",
    subtitle: "How and when your Agent level changes automatically",
    features: [
      "Promotion check: the system runs daily at midnight and compares your active host count and monthly volume against each A-level threshold",
      "When you cross a threshold: in-app notification sent → Admin or Super Admin approves the promotion → your badge updates immediately",
      "Manual promotion request: if you believe you qualify but the system hasn't picked it up, tap Request Promotion in the Levels tab",
      "Demotion Rule 1: active host rate < 40% for 2 consecutive months → automated 1-level demotion",
      "Demotion Rule 2: 90 days with zero new host recruited → level frozen (no demotion, growth locked)",
      "Level frozen = you retain your current badge but cannot be promoted until you recruit again",
      "To avoid demotion: keep at least 40% of your roster streaming at least once per month",
      "Appeal a demotion: contact hello@ridhi.app with your Agent ID and a short explanation",
    ],
    note: "Demotion resets your commission rate to the lower level immediately. Rebuilding your roster to the previous threshold will re-qualify you for promotion.",
  },
  {
    id: "ag-support",
    icon: HelpCircle,
    color: "text-slate-600",
    bg: "bg-slate-100",
    title: "Agent Support",
    subtitle: "How to get help with commissions, roster issues, and account queries",
    features: [
      "Email: hello@ridhi.app — for commission disputes, host roster issues, payout status, KYC queries",
      "Include your Agent ID in all support emails for faster resolution",
      "Support hours: Monday–Saturday, 10:00 AM – 7:00 PM IST",
      "Commission not credited: email with the month/year reference and your Agent ID",
      "Host wrongly removed from roster: email with the Host's ID and the issue details",
      "Level promotion appeal: email with Agent ID, your current stats screenshot, and the level you are claiming",
      "Payout not received within 7 working days: email with transaction reference from the app",
    ],
  },
];

// ── ADMIN GUIDE DATA ───────────────────────────────────────────────────────────

const ADMIN_SECTIONS: Section[] = [
  {
    id: "a-login",
    icon: LogIn,
    color: "text-purple-600",
    bg: "bg-purple-50",
    title: "Admin Login",
    subtitle: "Access the Ridhi Admin Dashboard — web panel only (ridhi.app/admins)",
    steps: [
      { text: "Open the Admin Dashboard URL (ridhi.app/admins)." },
      { text: "On the Portal Selection screen you will see two cards: Super Admin and Admin. Click the Admin card." },
      { text: "Enter your email address and password on the Admin login screen. Click Login." },
      { text: "You land on the Dashboard overview with live KPIs and your role badge — Admin — shown in the header." },
    ],
    features: [
      "Only two roles access the web panel: Super Admin (full control) and Admin (operations support)",
      "Hosts, Agents, and regular Users do NOT use the web admin panel — they exclusively use the Ridhi Android/iOS mobile app",
      "Admin credentials are issued by the Super Admin via Admin Management → Invite Admin",
      "Sessions expire after 24 hours of inactivity — you will be redirected to the login page",
      "Admin can see their daily work summary in My Report (sidebar bottom section)",
    ],
    note: "If your login fails or you forget your password, contact the Super Admin who issued your credentials. Do not share your admin login with anyone.",
  },
  {
    id: "a-access",
    icon: Lock,
    color: "text-red-600",
    bg: "bg-red-50",
    title: "What Admin Can & Cannot Access",
    subtitle: "Your role is scoped to operations — all general user data and finance is Super Admin only",
    features: [
      "✅ ADMIN CAN ACCESS: Dashboard, Analytics, Hosts, Agents, Levels & Promotion, E-KYC Verification, Calls, Recordings, AI Hub, Marketing, My Report, Handbook",
      "❌ ADMIN CANNOT ACCESS: General Users list and profiles (Super Admin only)",
      "❌ ADMIN CANNOT ACCESS: Coins, Payouts, Revenue, Subscriptions (Super Admin only — all financial pages)",
      "❌ ADMIN CANNOT ACCESS: Content Moderation, Communities, Creative Assets (Super Admin only)",
      "❌ ADMIN CANNOT ACCESS: Promotions & Ads, Live Streams, Business Ads, Special Ads, Commercial Banners (Super Admin only)",
      "❌ ADMIN CANNOT ACCESS: Creator Deals, Platform Settings, Admin Management (Super Admin only)",
      "If you navigate to a restricted page, you will see an Access Denied screen",
      "Your role and all the pages you can access are decided by the Super Admin — contact them if you need expanded access",
    ],
    note: "Admin access scope is intentionally limited to protect user privacy and financial integrity. The Super Admin holds full responsibility for all data and financial decisions.",
  },
  {
    id: "a-dashboard",
    icon: LayoutDashboard,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Dashboard",
    subtitle: "Platform overview — KPIs, charts, and live activity relevant to your role",
    features: [
      "KPI cards visible to Admin: Total Users (count only), Daily Active Users, New Registrations Today, KYC Submissions Pending",
      "User growth chart: 7-day and 30-day registration trend",
      "Content activity chart: posts, reels, stories published per day",
      "Top cities by user activity",
      "System status indicator in the header: All Systems OK / Warning / Critical",
      "Quick action links to: Pending KYC, Active Calls (Super Admin also sees: Pending Host Applications, Pending Agent Applications)",
      "Notification bell: shows alerts for items requiring your attention",
    ],
    note: "Revenue, financial KPIs, and coin purchase stats are visible to Super Admin only — these do not appear on the Admin dashboard view.",
  },
  {
    id: "a-hosts",
    icon: Star,
    color: "text-pink-600",
    bg: "bg-pink-50",
    title: "Host Management",
    subtitle: "Review applications, manage active hosts, monitor KYC and levels",
    features: [
      "Pending Applications (Super Admin only) — host applications are reviewed exclusively by Super Admin. SA selects the dedicated Agent to assign the host to; the Admin is auto-derived from that agent's chain. The approval dialog shows the full chain: SA → Admin → Agent → Host before confirming.",
      "Admins and Agents do NOT see or approve pending host applications — the queue is visible to Super Admin only",
      "Cross-role eligibility block — if a pending host applicant is already registered as an active Agent, their card is highlighted red with an 'Ineligible — Already an Agent' badge and the Approve & Assign button is permanently disabled. The approval dialog also surfaces a hard error banner preventing approval. Only Reject is available for such applicants.",
      "Host Nomination (Admin) — Admins can nominate a host candidate on behalf of one of their agents using the 'Nominate a Host Candidate' action card at the top of the Hosts page. The Admin selects the nominating Agent, enters the candidate's details and rationale, and submits. The nomination appears in the SA pending queue with a blue 'Nominated by [Agent Name]' badge. Super Admin reviews and approves using the standard approval flow — Admins cannot self-approve nominations.",
      "All Hosts table: shows name, current level (L1–L7), city, total coins earned, active sessions, KYC status, and assigned agent",
      "Filter by: Level, City, KYC Status, Active/Inactive/Suspended",
      "Host Detail page: full application info, stream history, earnings overview, KYC documents, agent info",
      "Promote / Demote level: manually approve a promotion that the auto-system flagged, or initiate a demotion review",
      "Suspend a host: select suspension duration (1 day / 7 days / 30 days) — the host is notified in-app immediately",
      "Ban a host permanently from the Actions menu — requires documented reason",
      "Send a warning notification to a host from their profile",
      "Export host list or earnings report as CSV for offline review",
    ],
    note: "Hosts use the mobile app exclusively. All their streaming tools, earnings, and Host Dashboard are in the Ridhi Android/iOS app — not the admin panel.",
  },
  {
    id: "a-agents",
    icon: Briefcase,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Agent Management",
    subtitle: "Review agent applications, monitor roster performance, manage levels",
    features: [
      "Pending Applications (Super Admin only) — agent applications are reviewed exclusively by Super Admin. SA selects the starting level (A1–A5) and the dedicated Admin the agent will report to. The approval dialog previews the chain: SA → Admin → Agent before confirming.",
      "Admins do NOT see or approve pending agent applications — the queue is visible to Super Admin only",
      "Cross-role eligibility block — if a pending agent applicant is already registered as an active Host, their card is highlighted red with an 'Ineligible — Already a Host' badge and the Approve & Assign button is permanently disabled. The approval dialog also surfaces a hard error banner preventing approval. Only Reject is available for such applicants.",
      "Agent Nomination (Admin) — Admins can nominate an agent candidate directly from the Agents page using the 'Nominate an Agent Candidate' action card. The Admin enters the candidate's name, city, phone, and rationale and submits. The nomination is added to the SA pending queue with a blue 'Admin Nomination' badge. Super Admin reviews and approves — Admins cannot self-approve nominations.",
      "All Agents table: name, level (A1–A5), city, active hosts managed, active host rate %, commission tier, total earnings",
      "Filter by: Level, City, Active/Inactive, Host Count",
      "Agent Detail page: full registration info, managed host list, per-host performance, commission breakdown, level progress",
      "Promotion Queue: agents who have auto-qualified for a level-up — review and approve in one click (or request more info)",
      "Demotion Risk tab: agents whose active host rate is dropping below 40% — send a warning notification before automated demotion triggers",
      "Reassign hosts: if an agent is suspended or removed, reassign their hosts to another agent from the detail page",
      "Agent commission rates are fixed by level (A1=2% through A5=10%) — only the Super Admin can set a custom rate",
    ],
    note: "Agents use the mobile app exclusively. Their recruiting tools, commission tracking, and host roster management are all in the Ridhi app.",
  },
  {
    id: "a-levels",
    icon: TrendingUp,
    color: "text-violet-600",
    bg: "bg-violet-50",
    title: "Levels & Promotion",
    subtitle: "Host (L1–L7) and Agent (A1–A5) level tracking and promotion/demotion review",
    features: [
      "Host Levels tab: all hosts with their coins earned, stream hours, PK wins, and progress bars toward next level",
      "Agent Levels tab: all agents with active host count, monthly coin volume, and progress toward next level",
      "Promotion Queue tab: hosts and agents who have auto-qualified — one-click Approve or Reject with reason",
      "Demotion Risk tab: hosts inactive for 20+ days (warning zone) and agents with falling active host rates",
      "P&D Policy tab: full documented promotion and demotion thresholds for L1–L7 and A1–A5",
      "Send warning notification directly from the Demotion Risk tab",
      "Manual promotion request: submit an override request to the Super Admin from a host or agent's detail page",
    ],
    note: "Policy thresholds (coins, hours, host count required per level) are set by the Super Admin and visible in the P&D Policy tab. Admin cannot change these values.",
  },
  {
    id: "a-kyc",
    icon: ScanFace,
    color: "text-sky-600",
    bg: "bg-sky-50",
    title: "E-KYC Verification",
    subtitle: "Review and verify host and agent identity documents (Aadhaar / PAN / Passport)",
    features: [
      "Pending KYC queue: all hosts and agents who have submitted identity documents for review",
      "Each submission shows: user/host name, Host or Agent ID, document type, front and back images, submission date",
      "Approve: marks the person as KYC Verified — a blue Verified ✓ badge appears on their in-app profile",
      "Reject: select rejection reason (Blurry Image / Name Mismatch / Expired Document / Incomplete Submission) — person is notified to resubmit",
      "AI pre-screens documents for clarity and ID type detection — flagged ones appear first in the queue",
      "KYC is mandatory for all hosts and agents before their first payout withdrawal",
      "Filter by: Aadhaar / PAN / Passport, Pending / Approved / Rejected",
      "KYC badge in the sidebar shows the live pending count — review regularly to keep the queue current",
    ],
  },
  {
    id: "a-calls",
    icon: Phone,
    color: "text-violet-600",
    bg: "bg-violet-50",
    title: "Audio & Video Calls Monitoring",
    subtitle: "Monitor call activity, durations, and coin usage across the platform",
    features: [
      "Live Calls panel: all currently active calls with caller, receiver, type (Audio/Video/Random), and duration",
      "Call Log table: full history — caller, receiver, call type, duration, coins deducted, timestamp",
      "Filter by: Audio / Video / Random Caller / Direct",
      "Stats cards: total calls today, average call duration, total coins consumed, call success rate %",
      "Flag a specific call for review if reported by a user",
      "Monitor per-user call frequency to detect abuse patterns (mass random calls, harassment)",
      "Recordings page: call recordings flagged by users — review and take action (Dismiss / Warn / Suspend)",
      "Server-side billing enforcement: coinRate (audio=10, video=25) is resolved server-side from call type. Client cannot override. Upfront coins deducted at match start; remaining balance settled on call end via atomic SQL conditional update.",
    ],
  },
  {
    id: "a-analytics",
    icon: Activity,
    color: "text-purple-600",
    bg: "bg-purple-50",
    title: "Analytics",
    subtitle: "Platform-wide insights into user growth, engagement, and creator performance",
    features: [
      "User Growth: new registrations over time, DAU, WAU, MAU with custom date range selector",
      "Retention cohorts: Day 1, Day 7, Day 30 retention rates",
      "Engagement metrics: avg. session duration, posts per user, reels watched per day, live session duration",
      "Match & Dating: daily swipe volume, match rate, chat-from-match conversion",
      "Geographic distribution: active users by state and city heat map",
      "Content analytics: most-shared posts, top trending hashtags, most-watched reels",
      "Host & Agent analytics: top earners by coin volume, top agents by managed volume",
      "Revenue analytics (Super Admin only) are not shown on the Admin analytics view",
    ],
  },
  {
    id: "a-wallet",
    icon: Wallet,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "Wallet & Plan Management",
    subtitle: "Server-authoritative coin wallet and VIP plan activation — all mutations enforced by backend",
    features: [
      "Coin Wallet API: GET /api/wallet returns authenticated user's coin balance and active plan",
      "Coin Deduct API: POST /api/wallet/coins/deduct — server-side balance check, 402 if insufficient, atomic update",
      "Coin Add / Plan Subscribe: REMOVED as public endpoints. Coins and plans are now auto-credited by the server after verified payment (via /api/payments/verify or /api/payments/callback)",
      "Plan Cancel API: POST /api/plan/cancel — reverts user to free tier",
      "Download validation: POST /api/downloads validates coin balance server-side using canonical prices; 402 if insufficient. Client no longer sends price or ownerId.",
      "Payment callback hardening: GET /api/payments/callback verifies provider status before marking orders verified; auto-fulfills coins/plan from order metadata; rejects unknown orders",
      "Order ownership binding: POST /payments/verify and GET /payments/status/:orderId reject cross-user order access (403) — prevents probing other users' orders",
      "Gift/spend flow hardening: all coin spend paths (gift store, live stream gifts, random calls, brand registration, boosts) await deductCoins confirmation before updating UI. If server rejects, the action is cancelled",
      "Checkout redirect hardening: GET /payments/checkout requires authentication and binds to the server-created order. Redirect URL for PhonePe/Instamojo/Cashfree is taken from the server-stored order, never from client query params. Prevents phishing via open redirect.",
      "All wallet mutations are logged with userId, amount, reason, and new balance for audit",
      "Dual-coin tracking: free coins (from missions, ads, referrals) vs paid coins (from recharges). Free coins expire after 30 days. Paid coins never expire.",
      "Free-coin budget safeguard: platform-wide daily limit of 50,000 free coins. Auto-pause free coin earning when budget is exceeded to prevent coin economy collapse.",
      "Spend order: free coins deducted first on every spend, then paid coins. Prevents paid coin subsidy leakage.",
      "Coin Economy tab (Super Admin only): real-time health dashboard showing free vs paid coin flow, daily budget usage, free-to-paid ratio alerts, and circulation breakdown",
    ],
    note: "Client-side coin balance is purely for UI display. The server is the single source of truth. Coin minting and plan unlocking are no longer public API endpoints — they are only triggered internally after verified payment. Any client attempt to bypass server validation will fail. Gift send actions are gated on server deduction confirmation. The dual-coin system ensures paid revenue coins are protected and free coin issuance is budget-controlled.",
  },
  {
    id: "a-ai-hub",
    icon: Cpu,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    title: "AI Hub",
    subtitle: "Configure AI moderation, recommendation engine, and language models",
    features: [
      "AI Moderation settings: adjust sensitivity thresholds for auto-flagging (Nudity, Hate Speech, Spam, Violence, CSAM)",
      "Recommendation engine: tune weights for the For You feed and Explore algorithm",
      "Regional language support: view translation accuracy metrics for all 13 Indian languages",
      "Chatbot: manage in-app AI assistant prompt templates",
      "Usage stats: API call volume, tokens consumed, daily cost, moderation accuracy rate",
      "A/B test new AI configurations in a test cohort before rolling out platform-wide",
      "AI Hub badge shows active system alerts and running experiments",
    ],
  },
  {
    id: "a-tiktok-tools",
    icon: Video,
    color: "text-pink-600",
    bg: "bg-pink-50",
    title: "TikTok-Style Content Tools — Moderation",
    subtitle: "Moderate new content features: TTS, Auto-Captions, Carousel, Video Replies, Streaks",
    features: [
      "TTS abuse detection: flag posts that use TTS for spam, repeated identical audio, or unauthorized commercial content",
      "Auto-Captions review: if captions contain banned words or misinformation, flag for manual review before removing the post",
      "Carousel posts: moderation works the same as single-image posts — all carousel images are scanned by AI for nudity, violence, and hate symbols",
      "Video Replies to Comments: these are treated as regular video posts for moderation. Check the original comment thread for harassment context",
      "Repost monitoring: track repost chains to detect spam accounts or bot networks that mass-repost content. Repost count is visible on the post detail",
      "Streaks fraud detection: detect users artificially inflating streaks (e.g., automated posting tools) — reset streak and warn or suspend",
      "Not Interested signals: aggregate Not Interested data to identify low-quality content creators or trending harmful content themes",
      "Regional language moderation: TTS and captions are generated in 13 Indian languages — the AI moderation model covers Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu, and English",
      "Analytics dashboard: view TTS usage by language, carousel engagement rate, video reply adoption rate, and streak participation rate",
      "Admin actions on flagged content: Warn User, Remove Post, Suspend User, or Ban User — all actions are logged for audit",
    ],
    note: "These features are new (TikTok-inspired for Indian users). Moderation policies are the same as other content: no nudity, hate speech, spam, violence, or misinformation. The AI moderation system auto-scans all generated TTS audio captions and user-submitted carousel images.",
  },
  {
    id: "a-marketing",
    icon: Megaphone,
    color: "text-rose-600",
    bg: "bg-rose-50",
    title: "Marketing",
    subtitle: "Push notification campaigns, referral program stats, and broadcast messaging",
    features: [
      "Push Notifications: create and schedule broadcast messages to all or segmented users (by city, interest, or role)",
      "Referral Program: view referral stats, top referrers, and configure the referral coin bonus amount",
      "Promotional Banners: upload and schedule in-app banner images for the Home Feed",
      "Campaign analytics: impressions, click-through rates, conversions, and reach per campaign",
      "Geo-targeting: when creating a campaign, Admins can target All Locations, a specific City (e.g. Mumbai, Delhi), or a Radius around a city (5 km – 100 km slider). The campaign table shows the target location in a dedicated column.",
      "Ad pages (Business Ads, Special Ads, Commercial Banners) are Super Admin only — Admin cannot access these",
      "Promo & Offer Codes are Super Admin only — Admin cannot create discount codes",
    ],
    note: "Promotions & Ads, Business Ads, Special Client Ads, and Commercial Banners are restricted to the Super Admin role. Admin's marketing scope is limited to push campaigns and referral configuration.",
  },
  {
    id: "a-myreport",
    icon: FileText,
    color: "text-slate-600",
    bg: "bg-slate-100",
    title: "My Work Report",
    subtitle: "Your daily activity log and performance summary as an Admin",
    features: [
      "Shows all actions you took today with timestamps: KYC approvals, host approvals, agent approvals, content reviews",
      "Weekly summary: total items reviewed, avg. response time, pending items in your queue",
      "Use this to self-audit your workload and ensure nothing is left pending",
      "All actions in the admin panel are logged permanently for security and audit purposes — visible to the Super Admin",
    ],
  },
];

// ── SUPER ADMIN GUIDE DATA ─────────────────────────────────────────────────────

const SA_SECTIONS: Section[] = [
  {
    id: "sa-login",
    icon: LogIn,
    color: "text-rose-600",
    bg: "bg-rose-50",
    title: "Super Admin Login",
    subtitle: "Full platform access — all sections and all financial operations",
    steps: [
      { text: "Open the Admin Dashboard URL (ridhi.app/admins)." },
      { text: "On the Portal Selection screen, click the Super Admin card." },
      { text: "Enter your Super Admin email and password. Click Login." },
      { text: "You land on the Dashboard with the Super Admin badge in the sidebar header — all sections are visible." },
    ],
    features: [
      "Super Admin sees every page in the sidebar with no restrictions",
      "SA is the only role that can access: Users, Coins, Payouts, Revenue, Subscriptions, Content Moderation, Communities, Creative Assets, Promotions, Live Streams, Creator Deals, Business Ads, Special Ads, Commercial Banners, Settings, Admin Management",
      "SA decides what Admin accounts exist and what responsibilities each Admin handles",
      "Super Admin accounts cannot be revoked from the Admin Management panel — requires server-level access",
    ],
    note: "Super Admin credentials must be kept strictly confidential. Never log in from a shared or public device.",
  },
  {
    id: "sa-admin-mgmt",
    icon: UserPlus,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    title: "Admin Management — Create & Control Admin Accounts",
    subtitle: "SA is the only person who can create, modify, or deactivate Admin accounts",
    steps: [
      { text: "Go to Admin Management in the sidebar (Super Admin only)." },
      { text: "Click Invite Admin — enter the person's name and email address." },
      { text: "They receive an email with their login credentials and a link to the admin portal." },
      { text: "They must change their password on first login." },
    ],
    features: [
      "Admin table: name, email, role, status (Active / Inactive), last login date and time",
      "Only two roles exist: Super Admin and Admin — there are no sub-roles",
      "Deactivate an Admin: their active session is terminated within 30 seconds",
      "Reactivate a deactivated Admin account without creating a new one",
      "Admin Activity log: every action taken by each Admin with full timestamps — use for audit and accountability",
      "SA decides the scope of each Admin's responsibilities (e.g., 'this Admin handles KYC only')",
      "Brief your Admins on which pages they should use daily — their access is scoped automatically by role",
    ],
  },
  {
    id: "sa-users",
    icon: Users,
    color: "text-green-600",
    bg: "bg-green-50",
    title: "User Management (SA Exclusive)",
    subtitle: "Full access to all general user accounts — search, view, verify, and take action",
    features: [
      "Search by name, phone number, email, or city",
      "Filter by: Verified / Unverified, Active / Suspended / Banned, Registration date range",
      "User table: Avatar, Name, Phone, City, Join Date, KYC badge, Status, Actions",
      "Click any row to open the full User Detail page: profile info, post history, chat count, coin balance, device info, reports received",
      "Actions: Verify ✓, Suspend (1 day / 7 days / 30 days), Ban (permanent), Delete account, Reset password",
      "Bulk actions: select multiple users → Suspend All / Ban All / Verify All",
      "Export user list as CSV (name, email, phone, city, join date, status)",
      "Admin role CANNOT see this page — user personal data is restricted to Super Admin only",
    ],
    note: "User privacy is protected by design. Admin team does not have access to individual user profiles or contact details.",
  },
  {
    id: "sa-finance",
    icon: IndianRupee,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    title: "Financial Operations (SA Exclusive)",
    subtitle: "Coins, Payouts, Revenue, Subscriptions — all financial pages are Super Admin only",
    features: [
      "PAYOUTS: approve or reject host/agent withdrawal requests (minimum ₹500). Each shows: name, role, amount, coins redeemed, bank/UPI details, KYC status",
      "Approve payout: mark as Processed after funds transferred — user notified in-app",
      "Reject payout: enter reason (insufficient KYC, suspicious activity) — user must resubmit",
      "COINS: edit recharge pack prices and coin amounts, add or remove packs, view full purchase log, create bonus campaigns (e.g. +20% coins this weekend)",
      "Refund handling: process coin refund requests by transaction ID lookup",
      "REVENUE: full revenue breakdown — in-app purchases, ads, subscriptions, platform fees. Daily and monthly charts with ad campaign performance",
      "SUBSCRIPTIONS: manage VIP tiers (Silver / Gold / Platinum / Diamond Elite) and Creator plans (Starter / Pro / Elite) — edit pricing and features",
      "Auto-Payout toggle: automatically process all pending payouts above the daily threshold — toggle in Settings",
    ],
    note: "Finance pages are completely hidden from Admin. If an Admin navigates to /payouts, /coins, /revenue, or /subscriptions they see an Access Denied screen.",
  },
  {
    id: "sa-content",
    icon: ShieldAlert,
    color: "text-red-600",
    bg: "bg-red-50",
    title: "Content Moderation (SA Exclusive)",
    subtitle: "Review and action all flagged posts, reels, comments, and stories",
    features: [
      "Moderation queue: all content flagged by users or AI auto-moderation system",
      "Filter by: content type (Post / Reel / Story / Comment / Live Stream), severity (High / Medium / Low), flag reason (Nudity / Hate Speech / Spam / Violence / Misinformation)",
      "Each item shows: content preview, report reason, reporter details, created date",
      "Actions: Approve (keep live), Remove (take down permanently), Warn User, Suspend User, Ban User",
      "Bulk approve/remove via checkboxes for faster processing of the queue",
      "AI-flagged content is pre-labelled with the detection category for faster triage",
      "Sidebar badge shows the current pending count — this updates in real time",
      "Content Moderation is Super Admin only — Admin cannot remove or approve content",
    ],
  },
  {
    id: "sa-communities",
    icon: Globe,
    color: "text-teal-600",
    bg: "bg-teal-50",
    title: "Communities Management (SA Exclusive)",
    subtitle: "Create, edit, feature, suspend, or delete platform communities",
    features: [
      "View all communities: name, category, member count, post count, created date, status",
      "Create community: set name, description, category, cover image, and community rules",
      "Edit community: update description, rules, cover image, or category",
      "Feature a community: toggle the Featured switch to promote it on the app's Explore page",
      "Suspend a community: disables new posts but retains existing content and member list",
      "Delete a community: permanently removes all posts and member associations (irreversible — confirm twice)",
      "Categories: Music, Sports, Travel, Food, Fashion, Tech, Gaming, Movies, Education, Entertainment",
      "Communities management is Super Admin only — Admin cannot create, edit, or delete communities",
    ],
  },
  {
    id: "sa-creative",
    icon: Sparkles,
    color: "text-purple-600",
    bg: "bg-purple-50",
    title: "Creative Assets (SA Exclusive)",
    subtitle: "Virtual Gifts, Sticker Packs, Badges & Frames, Reel Filters — add, price, and toggle",
    features: [
      "Virtual Gifts tab: all gift items with emoji, name, category, animation type, coin price, and total uses",
      "Add Gift: set name, emoji, category, animation effect, and coin price — goes live in app on save",
      "Edit Gift: update coin price, category, or animation — changes take effect within minutes",
      "Toggle visibility: hide a gift from users without deleting it (eye icon — for seasonal items)",
      "Sticker Packs tab: manage packs — name, emoji, free or premium type, coin price. Expand any pack to add individual stickers",
      "Badges & Frames tab: Achievement badges (auto-awarded, no price, SA sets criteria), Premium badges (coin purchase), Profile Frames (coin unlock price)",
      "Reel Filters tab: Beauty / AR Effect / Graphic Overlay / Color Grade — set free or premium tier with coin unlock price",
      "All prices in Ridhi Coins. Rate reminder: 1 coin = ₹1.00",
      "Creative Assets are Super Admin only — Admin can view but cannot add, edit, or set prices",
    ],
  },
  {
    id: "sa-livestreams",
    icon: Radio,
    color: "text-orange-600",
    bg: "bg-orange-50",
    title: "Live Streams (SA Exclusive)",
    subtitle: "Monitor all live sessions, feature top streams, force-end violations",
    features: [
      "Active Streams panel: all currently live sessions with host name, viewer count, live duration, total gifts received",
      "Click any stream card to open its detail: host info, top gift senders, comment feed",
      "Force-End Stream: terminate a live session immediately for policy violations — host is notified in-app with the reason",
      "Feature a Stream: pins it to the top of the Live discovery page in the app for higher visibility",
      "Live Stream History: all completed sessions — peak viewers, total gifts, duration, host name",
      "Reported Streams: flagged live sessions from user reports — review and take action",
      "Stream Stats: total sessions today, peak concurrent viewers, total gifts transacted across all streams",
      "Live Streams management is Super Admin only — Admin cannot force-end or feature streams",
    ],
  },
  {
    id: "sa-tiktok-tools",
    icon: Video,
    color: "text-pink-600",
    bg: "bg-pink-50",
    title: "TikTok-Style Content Tools — Configuration & Oversight",
    subtitle: "Configure, monitor, and control all new TikTok-inspired features for Indian users",
    features: [
      "TTS Engine Configuration: enable/disable Text-to-Speech globally, set default voice per language (A/B/C), and manage voice pack updates from the AI provider",
      "TTS usage limits: set daily TTS generation limit per user to prevent abuse and control API costs",
      "Auto-Captions toggle: enable/disable auto-caption generation for all video/reel uploads. Set default language fallback",
      "Carousel limits: configure maximum photos per carousel (default 10, min 2, max 20). Set max file size per image",
      "Video Reply controls: enable/disable video replies to comments. Set max duration (default 60 sec, max 3 min). Review flagged video-reply threads",
      "Repost controls: enable/disable reposting globally. Set max reposts per user per day. View repost chain analytics",
      "Streaks configuration: set streak freeze rules (e.g., 1 'freeze' day per week allowed). Set milestone badges (3-day, 7-day, 30-day, 100-day streak)",
      "Streak fraud detection: configure automated detection thresholds (e.g., >5 posts per minute triggers review). Set auto-reset policy for suspicious streaks",
      "Not Interested algorithm: tune the recommendation algorithm weight for Not Interested signals. Export aggregate data for content quality analysis",
      "Regional language support: manage TTS voice coverage and caption models for all 13 Indian languages. Request new language support from AI provider",
      "TikTok-style analytics dashboard: TTS usage by language, carousel engagement rate, video reply adoption rate, streak participation, repost virality, Not Interested trends",
      "Feature flags: enable/disable each TikTok feature independently (TTS, Auto-Captions, Carousel, Video Replies, Repost, Streaks, Not Interested) for gradual rollout or A/B testing",
      "Monetisation: set if TikTok features are available to free users vs VIP tiers. Example: Carousel and Video Replies for all users; TTS voice packs for Gold+ only",
      "AI Matchmaking Engine: configure compatibility scoring weights (interests, language, age, location, bio). Set minimum match threshold for AI suggestions (default 70%). Enable/disable AI icebreaker generation",
      "AI Smart Icebreakers: toggle AI-generated first messages. Set language preference for icebreakers (user's language vs English). Configure icebreaker tone (casual, flirty, friendly)",
      "AI Reply Suggestions: enable/disable AI reply suggestions in chat. Set context awareness (last 3 messages vs last 10). Configure suggestion count per message (default 3)",
      "AI Matchmaking Analytics: track AI suggestion acceptance rate, icebreaker response rate, reply suggestion usage, compatibility score distribution. Export for ML model improvement",
      "Feature flags: enable/disable AI Matchmaking features independently for gradual rollout or A/B testing",
    ],
    note: "These TikTok-inspired features and AI Matchmaking are specifically designed for Indian users and regional content creators. All features support 13 Indian languages. TTS and auto-captions use on-device generation where possible for privacy. Streaks update at midnight IST. AI Matchmaking works offline using on-device algorithms for privacy.",
  },
  {
    id: "sa-ads",
    icon: Zap,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    title: "Ads & Promotions (SA Exclusive)",
    subtitle: "Business Ads, Special Client Ads, Commercial Banners, and Promo Codes",
    features: [
      "Promotions & Ads: manage internal promotional campaigns with budget, target audience, and scheduling",
      "Business Ads: advertiser campaigns with impression targets, CPM pricing, and performance tracking",
      "Special Client Ads: premium sponsored slots with higher placement and visibility — for key brand partners",
      "Commercial Banners: full-width takeover banner slots for brand campaigns (Home Feed, Explore, Live)",
      "Promo Codes: create discount or coin-bonus codes for marketing campaigns with usage limits and expiry dates",
      "Campaign analytics: impressions, click-through rate, conversions, and total ad revenue",
      "All ad pages (Promotions, Business Ads, Special Ads, Commercial Banners) are Super Admin only",
    ],
  },
  {
    id: "sa-settings",
    icon: Settings,
    color: "text-slate-600",
    bg: "bg-slate-100",
    title: "Platform Settings (SA Exclusive)",
    subtitle: "Global platform configuration, feature flags, and operational toggles",
    features: [
      "Branding: app display name, logo, colour scheme for email and push notification templates",
      "Regional settings: default language, timezone (IST), currency display (₹)",
      "Notification templates: edit automated push / SMS / email text for all key platform events",
      "Legal documents: update Terms & Conditions, Privacy Policy, and Community Guidelines shown in the app",
      "Maintenance window: schedule planned downtime — users see a maintenance screen in the app during this window",
      "Feature flags: enable or disable specific app features for all users or a test cohort",
      "Auto-Payout toggle: automatically processes pending payouts above the ₹500 threshold daily",
      "Open Registration toggle: pause new user sign-ups platform-wide if needed",
      "Platform Settings is Super Admin only — Admin cannot access or change any configuration here",
    ],
  },
  {
    id: "sa-system",
    icon: Activity,
    color: "text-green-600",
    bg: "bg-green-50",
    title: "System Health Monitor",
    subtitle: "Real-time monitoring of all backend services, load, and uptime",
    features: [
      "6 service panels: API Server, WebSocket Server, Media CDN, PostgreSQL DB, Redis Cache, Push Notifications",
      "Each shows: health status (Healthy / Warning / Critical), uptime %, response time (ms), current load %",
      "Load progress bar: green = normal, yellow = elevated, red = high — take immediate action on red",
      "Refresh Status button: manually pull latest health data from all services",
      "Global toggles: Maintenance Mode, Open Registration, Guest Access, AI Auto-Moderation, Auto Payouts, Developer Mode",
      "Maintenance Mode instantly blocks all non-admin users and shows a maintenance screen in the app",
    ],
  },
  {
    id: "sa-backend",
    icon: Code,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Backend, API & Domain Management",
    subtitle: "Live API traffic monitoring, payment gateways, domain configuration, and SSH access",
    features: [
      "API Monitoring table: HTTP method, endpoint path, status code, avg response time (ms), volume per hour",
      "Payment Gateway panel: Razorpay, UPI Direct, Google Pay, PhonePe — each with success rate %, today's volume, and Enable/Disable toggle",
      "Success rate bar: drop below 95% = investigate immediately",
      "Backend Access: SSH terminal access to the API server (emergency use only — all accesses logged)",
      "Domain & Hosting: manage DNS records and hosting configuration for ridhi.app",
    ],
  },
  {
    id: "sa-integrations",
    icon: Link,
    color: "text-teal-600",
    bg: "bg-teal-50",
    title: "API Integrations",
    subtitle: "Manage all platform APIs, third-party service keys, and webhooks",
    features: [
      "Platform APIs (17 total): Feed, Auth, Match, Posts, Reels, Stories, Chat, Calls, Coins, Payouts, Notifications, KYC, Search, Admin, Live, AI, Analytics — toggle each on/off",
      "Third-party integrations:",
      "  → Payments: Razorpay, Google Pay Business, PhonePe (masked API keys, rotate key button)",
      "  → Messaging: Firebase FCM (push), MSG91 SMS (OTP), SendGrid (email)",
      "  → Cloud: AWS S3 (media), Cloudflare CDN",
      "  → AI/Analytics: Google Analytics 4, OpenAI GPT",
      "  → Auth/Calls: Google Sign-In, Agora RTC (live streaming)",
      "Rotate API key: triggers key rotation — old key invalidated immediately. Schedule with engineering team first",
      "Webhooks panel: Payment Success, KYC Verified, Content Flagged, Payout Processed, New Signup — each has active toggle, endpoint URL, and last triggered time",
      "Add new webhooks or integrations via the + buttons",
    ],
    note: "API key rotation causes a brief disruption to the related service. Coordinate with your engineering team before rotating keys in production.",
  },
  {
    id: "sa-levels",
    icon: TrendingUp,
    color: "text-orange-600",
    bg: "bg-orange-50",
    title: "Levels Oversight & Policy (SA Final Authority)",
    subtitle: "SA is the final approver for all Host and Agent level promotions",
    features: [
      "SA is the final approver for all manual promotion requests submitted by Agents or Admins",
      "Promotion Queue: auto-qualified and manually requested promotions — Approve or Reject with one click",
      "Override auto-demotion: SA can pause a scheduled demotion if circumstances warrant it",
      "P&D Policy settings: SA can update threshold numbers (coins, hours, host count) for any level",
      "Host coin thresholds: L1=50K · L2=200K · L3=500K · L4=1M · L5=2M · L6=3.5M · L7=10M",
      "Agent thresholds: A1=5 active hosts · A2=20 · A3=50 · A4=100 · A5=250",
      "Commission rate overrides: SA can set a custom commission % for a specific agent (shown in their dashboard)",
    ],
  },
  {
    id: "sa-security",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
    title: "Security Alerts",
    subtitle: "Monitor and respond to platform security threats in real time",
    features: [
      "Alert feed: all active security alerts with severity (High / Medium / Low), description, and timestamp",
      "High severity (red): immediate action required — payment anomalies, coordinated bot attacks, data breach indicators",
      "Medium severity (yellow): monitor and review — unusual API traffic spikes, bulk account creation",
      "Low severity (blue): informational — failed login attempts, rate limit triggers",
      "Each alert has a Dismiss button after review — all dismissals are logged with timestamp",
      "Security log retained for 90 days for compliance and audit",
      "Critical alerts automatically send an email to the Super Admin's registered email address",
    ],
  },
];

// ── Overview badges ────────────────────────────────────────────────────────────

function RoleOverview({ icon: Icon, role, color, bg, count, desc }: {
  icon: React.ElementType; role: string; color: string; bg: string; count: string; desc: string;
}) {
  return (
    <div className={`border rounded-xl p-4 ${bg} flex items-start gap-3`}>
      <div className="p-2.5 rounded-xl bg-white/60 flex-shrink-0">
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className={`font-bold text-sm ${color}`}>{role}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        <Badge variant="outline" className={`mt-2 text-xs ${color} border-current`}>{count}</Badge>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function HandbookPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Ridhi Platform Handbook
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Complete playbook for Hosts, Agents, Admins, and Super Admins — Version 3.4.0
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge className="bg-green-500 text-white gap-1.5">
            <CheckCircle className="w-3 h-3" /> Play Store Ready
          </Badge>
          <Badge className="bg-blue-500 text-white gap-1.5">
            <CheckCircle className="w-3 h-3" /> App Store Ready
          </Badge>
        </div>
      </div>

      {/* Role overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <RoleOverview icon={Star}          role="Host Guide"        color="text-pink-700"   bg="bg-pink-50"   count={`${HOST_SECTIONS.length} sections`}  desc="Mobile app guide for live Hosts — streaming, gifts, levels, payouts" />
        <RoleOverview icon={Briefcase}     role="Agent Guide"       color="text-cyan-700"   bg="bg-cyan-50"   count={`${AGENT_SECTIONS.length} sections`} desc="Mobile app guide for Agents — recruiting, commissions, roster" />
        <RoleOverview icon={LayoutDashboard} role="Admin Guide"     color="text-blue-700"   bg="bg-blue-50"   count={`${ADMIN_SECTIONS.length} sections`} desc="Web panel manual for Admin — host/agent ops, KYC, calls, analytics" />
        <RoleOverview icon={ShieldCheck}   role="Super Admin Guide" color="text-rose-700"   bg="bg-rose-50"   count={`${SA_SECTIONS.length} sections`}   desc="Web panel manual for SA — full control, finance, content, system" />
      </div>

      <Tabs defaultValue="host">
        <TabsList className="h-10 gap-1">
          <TabsTrigger value="host" className="gap-1.5">
            <Star className="w-3.5 h-3.5" /> Host Guide
          </TabsTrigger>
          <TabsTrigger value="agent" className="gap-1.5">
            <Briefcase className="w-3.5 h-3.5" /> Agent Guide
          </TabsTrigger>
          <TabsTrigger value="admin" className="gap-1.5">
            <LayoutDashboard className="w-3.5 h-3.5" /> Admin Guide
          </TabsTrigger>
          <TabsTrigger value="superadmin" className="gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Guide
          </TabsTrigger>
        </TabsList>

        {/* ─── HOST GUIDE ─── */}
        <TabsContent value="host" className="mt-5 space-y-3">
          <div className="rounded-xl border border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50 p-4 flex items-start gap-3 mb-4">
            <Star className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-pink-900">Ridhi Host — Complete Mobile App Guide</p>
              <p className="text-sm text-pink-700 mt-1">
                Hosts live-stream on the Ridhi Android/iOS app, receive virtual gifts from viewers, earn coins, and withdraw earnings. Hosts progress through 7 levels (L1 Bronze → L7 Crown) based on coins earned, stream hours, and PK wins. This guide covers everything you need from registration to your first payout.
              </p>
            </div>
          </div>
          {HOST_SECTIONS.map((s) => <HandbookSection key={s.id} section={s} />)}
        </TabsContent>

        {/* ─── AGENT GUIDE ─── */}
        <TabsContent value="agent" className="mt-5 space-y-3">
          <div className="rounded-xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-teal-50 p-4 flex items-start gap-3 mb-4">
            <Briefcase className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-cyan-900">Ridhi Agent — Complete Mobile App Guide</p>
              <p className="text-sm text-cyan-700 mt-1">
                Agents recruit Hosts to the Ridhi platform and earn a commission (2–10% depending on level) on every rupee their hosted talent earns. Agents progress through 5 levels (A1 Starter → A5 Master) based on active host count and monthly coin volume. All agent tools — recruiting, roster management, commission tracking — are in the Ridhi mobile app.
              </p>
            </div>
          </div>
          {AGENT_SECTIONS.map((s) => <HandbookSection key={s.id} section={s} />)}
        </TabsContent>

        {/* ─── ADMIN GUIDE ─── */}
        <TabsContent value="admin" className="mt-5 space-y-3">
          <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 flex items-start gap-3 mb-4">
            <LayoutDashboard className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-900">Ridhi Admin Dashboard — Web Panel Operations Manual</p>
              <p className="text-sm text-blue-700 mt-1">
                The Admin role handles day-to-day operations: approving host and agent applications, reviewing KYC documents, monitoring calls, and running analytics. Admin does NOT have access to general user data, financial operations, or content management — those are exclusively Super Admin responsibilities. Your access scope is set by the Super Admin.
              </p>
            </div>
          </div>
          {ADMIN_SECTIONS.map((s) => <HandbookSection key={s.id} section={s} />)}
        </TabsContent>

        {/* ─── SUPER ADMIN GUIDE ─── */}
        <TabsContent value="superadmin" className="mt-5 space-y-3">
          <div className="rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 p-4 flex items-start gap-3 mb-4">
            <ShieldCheck className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-rose-900">Ridhi Super Admin — Full Platform Control</p>
              <p className="text-sm text-rose-700 mt-1">
                Super Admin has unrestricted access to all platform systems including user data, all financial operations, content moderation, community management, creative assets, live streams, creator deals, ads, system health, API integrations, and Admin Management. SA decides who becomes an Admin, what they are responsible for, and can revoke any Admin account instantly.
              </p>
            </div>
          </div>
          {SA_SECTIONS.map((s) => <HandbookSection key={s.id} section={s} />)}

          {/* App Store readiness checklist */}
          <Card className="mt-4">
            <CardHeader className="py-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="w-4 h-4 text-green-600" />
                App Store Submission Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: "Privacy Policy published",              note: "ridhi.app/privacy-policy" },
                  { label: "Terms & Conditions published",          note: "ridhi.app/terms" },
                  { label: "Age rating declared (17+ / Mature)",    note: "Dating features require 17+ on App Store" },
                  { label: "Content moderation system active",      note: "AI + human review queue live" },
                  { label: "In-app purchases configured",           note: "Coin packs via Razorpay + UPI" },
                  { label: "Data deletion flow available",          note: "Settings → Account → Delete Account" },
                  { label: "KYC / age verification for dating",     note: "E-KYC mandatory for 18+ features" },
                  { label: "Support contact accessible in-app",     note: "Settings → Help & Support" },
                  { label: "Push notification permission handling", note: "Permission prompted on first launch" },
                  { label: "Offline / no-network state handled",    note: "Error boundary with retry screens" },
                  { label: "Regional language support",             note: "13 Indian languages in Settings" },
                  { label: "App icon and splash screen set",        note: "Ridhi logo (purple + pink) in all sizes" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2.5 p-3 rounded-lg border bg-muted/20">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground border-t pt-4">
        <p>Ridhi Platform Handbook · Version 3.4.0 · © 2026 Krilo Digitech Pvt. Ltd.</p>
        <p className="mt-1">Company: Krilo Digitech Pvt Ltd · Founder: Jadaprolu Hareesh · ridhi.app · hello@ridhi.app</p>
      </div>
    </div>
  );
}
