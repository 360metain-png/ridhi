import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen, Smartphone, Shield, ChevronDown, ChevronRight,
  User, Users, Star, Briefcase, Home, Video, Heart, MessageSquare,
  Search, Globe, PlusSquare, Coins, Bell, Settings, Lock, Key,
  LayoutDashboard, ShieldAlert, Radio, Phone, Gamepad2, IndianRupee,
  BarChart3, Megaphone, Cpu, ScanFace, ShieldCheck, Activity,
  CreditCard, Zap, CheckCircle, Info, AlertTriangle, LogIn,
  UserPlus, Edit, Eye, Trash2, ToggleRight, Code, Link, Webhook,
  FileText, HelpCircle, Map, Award, Sparkles, TrendingUp,
  Crown, Sticker, Gift, Camera, ClipboardList,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Accordion section ─────────────────────────────────────────────────────────

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
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Features & Options</p>
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

// ── DATA ──────────────────────────────────────────────────────────────────────

const USER_SECTIONS: Section[] = [
  {
    id: "registration",
    icon: UserPlus,
    color: "text-purple-600",
    bg: "bg-purple-50",
    title: "Registration & Login",
    subtitle: "Create your account with phone, email, or social login",
    steps: [
      { text: "Open the Ridhi app. You will see the onboarding carousel — swipe through 3 slides to learn about the platform." },
      { text: "Tap Get Started and choose your login method: Mobile Number (OTP) or Email Address." },
      { text: "Enter your mobile number or email. You will receive a 6-digit OTP via SMS — enter it within 60 seconds to verify." },
      { text: "If OTP doesn't arrive, tap Resend OTP after 30 seconds. Check your network connection or switch to email login." },
      { text: "Once verified, you proceed to the 4-step profile setup." },
    ],
    features: [
      "Mobile Number login with OTP via SMS (powered by MSG91)",
      "Email address login",
      "Forgot Password: Login → Forgot Password → Enter registered number/email → Verify OTP → Set new password",
      "Session stays active across app restarts — no need to re-login every time",
    ],
  },
  {
    id: "profile-setup",
    icon: User,
    color: "text-pink-600",
    bg: "bg-pink-50",
    title: "Profile Setup (4 Steps)",
    subtitle: "Complete your profile to unlock all features",
    steps: [
      { text: "Step 1 — Enter your full name (displayed publicly on your profile)." },
      { text: "Step 2 — Select your age and gender." },
      { text: "Step 3 — Choose your city from the Indian city list." },
      { text: "Step 4 — Pick your interests (e.g., Music, Cricket, Travel, Food, Fashion). Select at least 3." },
      { text: "Tap Complete Profile. Your account is now fully set up and you land on the Home Feed." },
    ],
    features: [
      "Name, age, gender, city, interests — all editable later in Settings",
      "Profile photo: tap the avatar on the Profile tab → Upload Photo",
      "Bio: tap Edit Profile on the Profile tab to add a short bio",
    ],
    note: "Profile completeness improves your Match & Discover ranking. Add a profile photo for best results.",
  },
  {
    id: "home-feed",
    icon: Home,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Home Feed",
    subtitle: "Your main content stream — stories, posts, reactions",
    features: [
      "For You tab (default): Ridhi's AI curates posts based on your interests and activity",
      "Local tab: See posts from people in your city",
      "Following tab: See posts only from accounts you follow",
      "Stories bar at the top: Tap a circle to view a 24-hour story. Tap your own circle (+ icon) to add a story",
      "Like a post: tap the heart icon. Double-tap the post image to quick-like",
      "Comment: tap the speech bubble icon. Type and send your comment",
      "Share: tap the share icon to share via Ridhi DM or copy link",
      "React with emoji: long-press the heart icon to pick a reaction (❤️ 😂 😮 😢 😡 👏)",
      "Save: tap the bookmark icon to save a post to your collection",
      "Report/Block: tap the ⋯ menu on any post to report or block",
    ],
  },
  {
    id: "reels",
    icon: Video,
    color: "text-red-600",
    bg: "bg-red-50",
    title: "Reels",
    subtitle: "Vertical short-video feed (TikTok-style) with filters, stickers & effects",
    features: [
      "Swipe up to go to the next reel. Swipe down to go back",
      "Tap anywhere on the video to pause/play. Double-tap to like instantly",
      "Like: tap the heart icon on the right panel",
      "Comment: tap the chat icon — type and post a comment",
      "Share: tap the share icon to send via Ridhi DM or copy link",
      "Follow the creator: tap the + button on their avatar",
      "Mute/unmute: tap the speaker icon at the bottom right",
      "Filters & Effects: when recording a Reel, tap the sparkle icon to browse Beauty, Color, AR, and Graphic filters",
      "Free filters are available to all users. Premium filters are unlocked with Ridhi Coins",
      "Stickers: tap the Sticker icon while recording to add animated stickers from your unlocked packs",
      "Record a Reel: tap Create (+) → Reel → record up to 30 seconds, add filter, sticker, music, and caption",
    ],
    note: "Ridhi Reels support resolutions up to 1080p. Some AR filters require a front-facing camera. Premium filters and sticker packs can be purchased via the Coin Wallet.",
  },
  {
    id: "match",
    icon: Heart,
    color: "text-rose-600",
    bg: "bg-rose-50",
    title: "Dating / Match (Heart Tab)",
    subtitle: "Tinder-style swipe to find your match",
    steps: [
      { text: "Tap the Heart tab (♥) in the bottom navigation bar." },
      { text: "A profile card appears showing name, age, city, and shared interests." },
      { text: "Swipe Right or tap the ✓ button to Like the profile." },
      { text: "Swipe Left or tap the ✗ button to Pass." },
      { text: "Tap the ⭐ Super Like button (once per day) for a guaranteed notification to the other person." },
      { text: "If both users swipe right on each other, it's a Match! A match card appears and you can start chatting." },
    ],
    features: [
      "Filter by age range, city, and interests in match settings",
      "View full profile before swiping: tap the profile card to expand it",
      "Matches appear in the Chat tab under a 'Matches' section",
      "Super Like (1 per day): sends a special notification to the profile",
      "Premium subscription unlocks unlimited likes, rewinds, and profile boosts",
    ],
    note: "Dating features are only shown to users aged 18+. Underage users see Discover/Friends mode only.",
  },
  {
    id: "chat",
    icon: MessageSquare,
    color: "text-green-600",
    bg: "bg-green-50",
    title: "Chat & Messaging",
    subtitle: "1-on-1 messages, audio and video calls",
    features: [
      "Chat tab: shows all your conversations sorted by most recent",
      "Tap a chat to open it — type in the text box and tap Send",
      "Send a photo: tap the 📎 attachment icon → Choose Photo from gallery",
      "Send audio message: long-press the microphone icon, speak, release to send",
      "Audio Call: tap the phone icon (top right) inside a chat",
      "Video Call: tap the camera icon (top right) inside a chat",
      "Message reactions: long-press any message to react with an emoji",
      "Delete message: long-press → Delete (only for your own messages)",
      "Read receipts: double tick (✓✓) = delivered, blue ticks = read",
      "Online status: green dot next to avatar = online now",
    ],
    note: "Random Caller feature (coin-based) lets you call strangers via Audio or Video. Each random call deducts Ridhi Coins.",
  },
  {
    id: "explore",
    icon: Search,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    title: "Explore",
    subtitle: "Search users, posts, trending hashtags",
    features: [
      "Search bar at the top: search for users by name, @username, or city",
      "Trending Posts grid: visual grid of most-liked posts right now",
      "Trending Hashtags: tap any hashtag to see all posts tagged with it",
      "Suggested Users: people Ridhi recommends based on your interests",
      "Tap any user card to visit their profile and follow",
      "Tap any post in the grid to open it full screen",
    ],
  },
  {
    id: "communities",
    icon: Globe,
    color: "text-teal-600",
    bg: "bg-teal-50",
    title: "Communities",
    subtitle: "Join and participate in interest groups",
    features: [
      "Browse all communities from the Communities screen (Profile → Communities)",
      "Filter by category: All, Music, Sports, Travel, Food, Fashion, Tech, Gaming, Movies, Education",
      "Join a community: tap the Join button on any community card",
      "Leave a community: tap Leave on a community you've joined",
      "Joined communities show an active badge and appear at the top of the list",
      "Community feeds show posts from all members of that community",
      "Post to a community: use Create Post → select the community name",
    ],
  },
  {
    id: "create-post",
    icon: PlusSquare,
    color: "text-orange-600",
    bg: "bg-orange-50",
    title: "Create Post",
    subtitle: "Share text, photos, videos, reels, stories, and polls",
    steps: [
      { text: "Tap the + Create button (bottom navigation center or Profile screen)." },
      { text: "Choose your content type: Text Post, Photo, Video, Reel, Story, or Poll." },
      { text: "Write your caption or post content in the text box." },
      { text: "Add hashtags — Ridhi suggests trending hashtags as you type #." },
      { text: "Select your audience: Everyone, Followers Only, or Specific Community." },
      { text: "Tap Post to publish. Your post appears on feeds immediately." },
    ],
    features: [
      "Text Post: up to 500 characters with emoji support",
      "Photo: up to 10 images per post (gallery or camera)",
      "Video: up to 60 seconds (compressed automatically)",
      "Reel: up to 30 seconds vertical video with audio",
      "Story: disappears after 24 hours, visible to all followers",
      "Poll: 2–4 options, poll runs for 24 hours or 7 days",
      "Hashtag suggestions auto-appear when you type #",
    ],
  },
  {
    id: "wallet",
    icon: Coins,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    title: "Coin Wallet",
    subtitle: "Buy, earn, and spend Ridhi virtual coins",
    features: [
      "Access via Profile → Wallet or the coin icon in the top bar",
      "Current balance shown at the top in large font",
      "Daily Reward: claim free coins every day by tapping 'Claim Daily Reward'",
      "Recharge packs: ₹49 = 100 coins · ₹99 = 250 coins · ₹199 = 600 coins · ₹499 = 1,800 coins · ₹999 = 4,000 coins · ₹1,999 = 9,000 coins · ₹4,999 = 25,000 coins",
      "Tap any pack → select payment method (UPI, GPay, PhonePe, Credit/Debit Card) → complete purchase",
      "Spend coins on: Virtual gifts to hosts during live streams, Premium reel filters, Sticker packs, Random audio/video calls, Premium badge purchases, Profile frame unlocks, Live stream entry (exclusive rooms)",
      "Transaction history: full log of all earned, purchased, and spent coins with timestamps",
      "Withdrawal (Hosts/Agents only): tap Withdraw → enter bank/UPI details → submit. Min ₹500. Processed in 7 working days",
    ],
    note: "Ridhi Coins are non-refundable virtual currency once spent. They cannot be transferred between accounts. 1 coin ≈ ₹0.07.",
  },
  {
    id: "notifications",
    icon: Bell,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    title: "Notifications",
    subtitle: "Stay updated on likes, matches, messages, and more",
    features: [
      "Bell icon in the top navigation bar — red badge shows unread count",
      "Types of notifications: New Match, Message received, Post liked, New follower, Comment on post, Gift received, Story viewed, Coin reward",
      "Tap any notification to go directly to the relevant screen",
      "Mark all as read: tap the checkmark icon at the top right of the Notifications screen",
      "Notification preferences: Settings → Notifications → toggle each category on/off",
    ],
  },
  {
    id: "settings",
    icon: Settings,
    color: "text-slate-600",
    bg: "bg-slate-100",
    title: "Settings",
    subtitle: "Theme, language, privacy, security, and account management",
    features: [
      "Appearance: Light / Dark / System theme",
      "Language: English + 12 Indian regional languages (Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, Assamese, Urdu)",
      "Notifications: toggle push notifications per category",
      "Privacy: Profile visibility (Everyone / Followers / Private), Online status visibility, Last seen settings, Read receipts on/off",
      "Security: Change password, Two-Factor Authentication (2FA), Active sessions, Login history",
      "Account: Edit profile, Deactivate account, Delete account",
      "Support: Help & Support, About Ridhi, Terms & Conditions, Privacy Policy",
    ],
    note: "Theme changes are applied immediately. Language changes require an app restart for full effect.",
  },
  {
    id: "subscriptions",
    icon: Crown,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    title: "VIP Subscriptions",
    subtitle: "Unlock premium features with Silver, Gold, Platinum, or Diamond Elite plans",
    features: [
      "Access via Profile → VIP / Subscriptions",
      "VIP Silver: unlimited likes, rewind swipes, profile boost (weekly/monthly/yearly billing)",
      "VIP Gold: Silver + priority match ranking, see who liked you, advanced filters",
      "VIP Platinum: Gold + incognito browsing, read receipts, profile highlight badge",
      "VIP Diamond Elite: all features + dedicated support, early access to new features, exclusive Diamond frame",
      "Creator Basic: analytics dashboard, creator badge, up to 5K views monetised",
      "Creator Pro: Basic + extended analytics, 50K views monetised, priority in Explore feed",
      "Creator Elite: Pro + dedicated creator manager, unlimited monetisation, fan club features",
      "Fan Clubs: subscribe to your favourite creator's exclusive content for a monthly fee set by the creator",
      "All plans auto-renew — cancel anytime from Profile → Subscriptions → Manage",
    ],
    note: "VIP plans enhance social and dating features. Creator plans unlock monetisation tools. Both can be active simultaneously.",
  },
  {
    id: "jobs",
    icon: Briefcase,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Jobs on Ridhi",
    subtitle: "Discover job openings or post a job as an employer",
    features: [
      "Access via Profile → Jobs or the Jobs icon in the navigation",
      "Browse jobs by category: Technology, Marketing, Design, Sales, Finance, Education, Healthcare, Entertainment",
      "Search by keyword, city, or company name",
      "Filter by: Full Time / Part Time / Freelance / Internship, and Salary range",
      "Tap any job card to see full details: description, requirements, salary, company, and location",
      "Apply directly in-app with your Ridhi profile (Resume + contact info)",
      "Post a Job (Employer): Profile → Post a Job → choose a coin plan (₹499/₹999/₹1,999) → fill job details → publish",
      "Premium Job Seeker features: profile highlight for recruiters, see who viewed your application",
    ],
    note: "Job postings are valid for 30 days. Ridhi does not charge job seekers — only employers pay to post.",
  },
  {
    id: "creator-dashboard",
    icon: BarChart3,
    color: "text-purple-600",
    bg: "bg-purple-50",
    title: "Creator Dashboard",
    subtitle: "Analytics and earnings overview for content creators",
    features: [
      "Access via Profile → Creator Dashboard",
      "Earnings summary: Total earned, This month, Pending payout",
      "Content performance: Views, Likes, Shares, Comments on all your posts and reels",
      "Top Content: ranked list of your best-performing posts by engagement",
      "Views chart: 7-day bar chart showing daily views across all content types",
      "Followers growth chart: track follower changes over time",
      "Withdraw earnings: tap Withdraw → enter amount → select Bank or UPI → submit",
      "Minimum withdrawal is ₹500. Payouts processed within 7 working days",
      "Requires Creator Basic, Pro, or Elite subscription for full analytics access",
    ],
  },
  {
    id: "host",
    icon: Star,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "Become a Host (Earn on Ridhi)",
    subtitle: "Register as a live host and earn virtual gifts from viewers",
    steps: [
      { text: "Go to Profile → Earn on Ridhi → Host card → tap Apply." },
      { text: "Fill in the Host Registration form: Display Name, Language(s), Content Type (Entertainment / Music / Talk / Gaming / Education / Dance), Bio, City, and upload a clear profile photo." },
      { text: "Agree to Host Guidelines and tap Submit Registration." },
      { text: "An animated success screen confirms submission. Admin reviews within 24–48 hours." },
      { text: "Once approved, the Host card on your profile shows 'Active ✓' and a Go Live button appears." },
    ],
    features: [
      "Earn coins from virtual gifts sent by viewers during live streams (Rose = 10 coins, Ring = 500 coins, Castle = 50,000 coins)",
      "Host levels based on total coins received: L1 Bronze → L2 Bronze+ → L3 Silver → L4 Silver+ → L5 Gold → L6 Diamond → L7 Crown",
      "Higher levels unlock: better revenue share %, featured placement, exclusive frames, priority in Live discovery",
      "Host Dashboard (in-app): level progress bars, earnings tracker, stream stats, KYC status, agent contact",
      "Automatic promotion: system checks thresholds daily — push notification when eligible. Admin approves",
      "Automatic demotion: 30 days inactive = level frozen; 60 days without streaming = demoted 1 level",
      "Minimum withdrawal: ₹500. Payouts processed within 7 working days. KYC required before first payout",
    ],
    note: "Hosts must complete E-KYC (Aadhaar/PAN) before withdrawing earnings. KYC is reviewed within 24 hours.",
  },
  {
    id: "agent",
    icon: ClipboardList,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    title: "Become an Agent (Earn on Ridhi)",
    subtitle: "Recruit and manage hosts to earn commission on their earnings",
    steps: [
      { text: "Go to Profile → Earn on Ridhi → Agent card → tap Apply." },
      { text: "Fill in the Agent Registration form: Agency Name, Your Name, Contact Number, City, Experience in talent management, and your host recruitment plan." },
      { text: "Agree to Agent Terms and tap Submit Registration." },
      { text: "Once approved, the Agent card shows 'Active ✓' and you gain access to the Agent Dashboard." },
    ],
    features: [
      "Recruit hosts under your agency — earn commission on every rupee they make from gifts",
      "Agent levels: A1 Starter (2%) → A2 Rising (3%) → A3 Pro (5%) → A4 Elite (7%) → A5 Master (10%)",
      "Level up based on active hosts managed and monthly coin volume generated",
      "Agent Dashboard (in-app): level progress, host roster, per-host earnings, commission breakdown, weekly chart",
      "Manage hosts: view each host's live hours, gifts received, level, and activity status",
      "Automatic promotion: system checks daily — push notification sent when A-level thresholds are met",
      "Automatic demotion: active host rate below 40% for 2 consecutive months → demoted 1 level",
      "No new host recruited in 90 days → level frozen",
    ],
    note: "Agents must be 18+, complete E-KYC, and agree to the Agent Code of Conduct. Fraudulent host recruitment leads to immediate removal.",
  },
  {
    id: "user-help",
    icon: HelpCircle,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Help & Support",
    subtitle: "Get help, report issues, and contact support",
    features: [
      "Access via Settings → Help & Support",
      "Contact: support@ridhi.app (Customer Support), hey@ridhi.app (Business / Partnerships)",
      "Support hours: Monday – Saturday, 10:00 AM – 7:00 PM IST",
      "FAQs: common questions on login, coins, payouts, matches, and content",
      "Report a user: tap ⋯ on any profile or post → Report → select reason → submit",
      "Block a user: tap ⋯ on any profile → Block (they cannot message or match with you)",
      "Account deletion: Settings → Account → Delete Account (all data erased within 30 days)",
      "Appeal a suspension: email support@ridhi.app with your registered number and reason",
      "Coin refund requests: email support@ridhi.app with transaction ID — reviewed within 5 working days",
    ],
  },
];

const ADMIN_SECTIONS: Section[] = [
  {
    id: "a-login",
    icon: LogIn,
    color: "text-purple-600",
    bg: "bg-purple-50",
    title: "Admin Login",
    subtitle: "Access the Ridhi Admin Dashboard — web panel only",
    steps: [
      { text: "Go to the Admin Dashboard URL (ridhi.app/admin or your deployment URL)." },
      { text: "You see the Portal Selection screen — two cards: Super Admin and Admin. Click the card matching your role." },
      { text: "Enter your email and password on the portal-specific login screen. Click Login." },
      { text: "You land on the Dashboard overview page with live KPIs and your role badge (Super Admin or Admin) shown in the header." },
    ],
    features: [
      "Two roles access the web panel: Super Admin (full platform control) and Admin (platform operations)",
      "Hosts, Agents, and regular Users DO NOT use the web admin panel — they use the Ridhi Android/iOS mobile app",
      "Your role controls which sidebar sections and pages are visible to you",
      "Finance pages (Coins, Payouts, Revenue, Subscriptions) are Super Admin only — Admins cannot access them",
      "Admin credentials are issued by the Super Admin via Admin Management → Invite Admin",
    ],
    note: "If your login fails, contact the Super Admin. Sessions expire after 24 hours of inactivity.",
  },
  {
    id: "a-dashboard",
    icon: LayoutDashboard,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Dashboard",
    subtitle: "Platform overview — KPIs, charts, live activity",
    features: [
      "KPI cards: Total Users, Daily Active Users, New Registrations Today, Total Revenue (SA only)",
      "User growth chart (7-day / 30-day toggle)",
      "Content activity chart: posts, reels, stories per day",
      "Revenue chart (SA only): coin purchases vs. payout outflows",
      "Recent flagged content requiring moderation action",
      "Top cities by user activity",
      "System status indicator in the top bar (All Systems OK / Warning / Critical)",
      "Quick action links to most-used pages for your role",
    ],
  },
  {
    id: "a-users",
    icon: Users,
    color: "text-green-600",
    bg: "bg-green-50",
    title: "User Management",
    subtitle: "Search, view, edit, verify, and action users",
    features: [
      "Search users by name, phone number, email, or city",
      "Filter by: Verified / Unverified, Active / Suspended / Banned, Registration date range",
      "User table shows: Avatar, Name, Phone, City, Join Date, Status, KYC badge, Actions",
      "Click any row to open the full User Detail page",
      "User Detail: profile info, post history, chat count, coin balance, reports received, device info",
      "Actions per user: Verify ✓, Suspend (1 day / 7 days / 30 days), Ban (permanent), Delete account, Reset password",
      "Bulk actions: select multiple users → Suspend All / Ban All / Verify All",
      "Export user list as CSV (name, email, phone, city, join date, status)",
    ],
  },
  {
    id: "a-content",
    icon: ShieldAlert,
    color: "text-red-600",
    bg: "bg-red-50",
    title: "Content Moderation",
    subtitle: "Review flagged posts, reels, comments, and stories",
    features: [
      "Moderation queue shows all content flagged by users or AI auto-moderation",
      "Filter by content type: Post / Reel / Story / Comment / Live Stream",
      "Filter by severity: High / Medium / Low",
      "Filter by flag reason: Nudity, Hate Speech, Spam, Violence, Misinformation, Other",
      "Each item shows: content preview, report reason, reporter details, created date",
      "Actions per item: Approve (keep live), Remove (take down), Warn User, Suspend User, Ban User",
      "Bulk approve/remove via checkboxes for faster queue processing",
      "Content Moderation badge in sidebar shows pending count — refresh updates it",
      "AI-flagged content is pre-labelled with the detection category for faster triage",
    ],
  },
  {
    id: "a-communities",
    icon: Globe,
    color: "text-teal-600",
    bg: "bg-teal-50",
    title: "Communities",
    subtitle: "Manage all platform communities",
    features: [
      "View all communities: name, category, member count, post count, created date, status",
      "Create a new community: tap New Community → enter name, description, category, cover image, rules",
      "Edit community: update description, rules, cover image, or category",
      "Feature a community: toggle the Featured switch to promote it on the Explore page",
      "Suspend a community: disables new posts but retains existing content and members",
      "Delete a community: permanently removes all posts and member associations (irreversible)",
      "Community categories: Music, Sports, Travel, Food, Fashion, Tech, Gaming, Movies, Education, Entertainment",
    ],
  },
  {
    id: "a-hosts",
    icon: Star,
    color: "text-pink-600",
    bg: "bg-pink-50",
    title: "Host Management",
    subtitle: "Approve, manage, and monitor all registered hosts",
    features: [
      "Pending Applications tab: review new host applications — Approve or Reject with a rejection reason",
      "All Hosts table: name, level (L1–L7), city, total coins earned, active sessions, KYC status, agent",
      "Host Detail: full application info, stream performance metrics, earnings history, KYC documents",
      "Promote / Demote level manually if auto-promotion is pending admin review",
      "Levels & Promotion tab: see all hosts near promotion threshold and approve/reject in bulk",
      "Demotion Risk tab: hosts at risk of auto-demotion — send them a warning notification",
      "Suspend or ban a host from the Actions menu (they are notified in-app)",
      "Export host earnings report as CSV",
    ],
    note: "Hosts use the mobile app only. All their dashboard, earnings, and live streaming tools are in the Ridhi Android/iOS app.",
  },
  {
    id: "a-agents",
    icon: Briefcase,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Agent Management",
    subtitle: "Approve, manage, and monitor all registered agents",
    features: [
      "Pending Applications tab: approve or reject agent registrations with a reason",
      "All Agents table: name, level (A1–A5), city, hosts managed, active host rate, commission tier, total earnings",
      "Agent Detail: managed hosts list, per-host performance, commission breakdown, level progress",
      "Promotion Queue: agents who have met A-level thresholds — approve or request more evidence",
      "Demotion Risk tab: agents whose active host rate is declining — issue warnings",
      "Reassign hosts between agents if an agent is suspended or removed",
      "Commission rate is set by level (A1=2%, A2=3%, A3=5%, A4=7%, A5=10%) — SA can override per agent",
    ],
    note: "Agents use the mobile app only. Their host roster management, commission tracking, and recruitment tools are all in the Ridhi app.",
  },
  {
    id: "a-levels",
    icon: TrendingUp,
    color: "text-violet-600",
    bg: "bg-violet-50",
    title: "Levels & Promotion",
    subtitle: "Host (L1–L7) and Agent (A1–A5) level management and P&D policy",
    features: [
      "Host Levels tab: view all hosts with coins earned, stream hours, PK wins, and progress to next level",
      "Agent Levels tab: view all agents with active host count, coin volume, and progress to next level",
      "Promotion Queue tab: list of hosts/agents who have auto-qualified — one-click Approve or Reject",
      "Manual promo requests from agents/admins appear here for SA review",
      "Demotion Risk tab: hosts inactive 20+ days (warning zone) and agents with falling active rates",
      "P&D Policy tab: full documented promotion & demotion thresholds for L1–L7 and A1–A5",
      "Auto-Promotion: system checks thresholds daily at midnight, sends push notification when eligible",
      "Auto-Demotion: triggered automatically — Host: 60 days no stream; Agent: 2 months below 40% active rate",
    ],
  },
  {
    id: "a-kyc",
    icon: ScanFace,
    color: "text-sky-600",
    bg: "bg-sky-50",
    title: "E-KYC Verification",
    subtitle: "Review and verify host/user identity documents",
    features: [
      "Pending KYC queue: all users/hosts who have submitted Aadhaar / PAN / Passport for verification",
      "Each submission shows: user info, document type, uploaded images front/back, submission date",
      "Approve: marks the user as KYC Verified — blue badge appears on their profile",
      "Reject: select rejection reason (blurry image / mismatch / expired doc) — user must resubmit",
      "AI pre-screens documents for clarity and ID detection; flagged ones require manual review",
      "KYC is mandatory for all hosts before their first payout withdrawal",
      "KYC badge in sidebar shows pending count — update after each review session",
      "Filter by document type: Aadhaar / PAN / Passport",
    ],
  },
  {
    id: "a-calls",
    icon: Phone,
    color: "text-violet-600",
    bg: "bg-violet-50",
    title: "Audio & Video Calls",
    subtitle: "Monitor call activity, durations, and coin usage",
    features: [
      "Live calls panel: shows all currently active calls with caller, receiver, type, and duration",
      "Call log table: caller, receiver, call type (Audio/Video/Random/Direct), duration, coins deducted, time",
      "Filter by: Audio / Video / Random / Direct",
      "Stats: total calls today, average call duration, total coins consumed in calls, success rate %",
      "Flag and review specific calls if reported by users",
      "Monitor per-user call frequency to detect abuse or spam behaviour",
      "Recordings page: stores call recordings flagged by users for review",
    ],
  },
  {
    id: "a-live",
    icon: Radio,
    color: "text-orange-600",
    bg: "bg-orange-50",
    title: "Live Streams",
    subtitle: "Monitor, feature, and moderate live sessions",
    features: [
      "Active Streams panel: all currently live sessions with viewer count, duration, gift total, and host name",
      "Tap a stream to view its details",
      "Force-end a stream: use the End Stream action (for policy violations — host is notified)",
      "Feature a stream: tap Feature to pin it to the top of the Live discovery page in the app",
      "Live stream history: all completed streams with peak viewers, total gifts received, duration",
      "Reported streams: review flagged live streams and take moderation action",
      "Stream stats: total sessions today, peak concurrent viewers, total gifts transacted",
    ],
  },
  {
    id: "a-creative-assets",
    icon: Sparkles,
    color: "text-purple-600",
    bg: "bg-purple-50",
    title: "Creative Assets",
    subtitle: "Manage virtual gifts, sticker packs, badges, and reel filters with pricing",
    features: [
      "Virtual Gifts tab: all gift items with emoji, category, animation type, coin price, and total uses",
      "Add Gift: set name, emoji, category, animation, and coin price — appears in app immediately after saving",
      "Edit Gift: update coin price, change category, or swap animation — changes take effect within minutes",
      "Toggle visibility: hide a gift from users without deleting it (eye icon)",
      "Sticker Packs tab: manage packs with name, emoji, free/premium type, and coin price",
      "Expand any pack to see individual stickers — add new stickers to existing packs",
      "Badges & Frames tab: Achievement badges (auto-awarded by criteria), Premium badges (coin purchase), Profile Frames",
      "Reel Filters tab: Beauty, AR Effect, Graphic Overlay, Color Grade — set free or premium with unlock price",
      "All prices are in Ridhi Coins. 1 coin ≈ ₹0.07. Price note shown below each price field",
    ],
    note: "SA can add, edit, and price all assets. Admin can view and toggle visibility but cannot change prices.",
  },
  {
    id: "a-analytics",
    icon: Activity,
    color: "text-purple-600",
    bg: "bg-purple-50",
    title: "Analytics",
    subtitle: "Deep platform insights — growth, retention, engagement",
    features: [
      "User growth: new registrations, DAU, WAU, MAU over custom date ranges",
      "Retention cohorts: Day 1, Day 7, Day 30 retention rates",
      "Engagement: avg. session duration, posts per user, reels watched per day, live session duration",
      "Match & Dating: swipe volume, match rate, chat-from-match conversion rate",
      "Geographic distribution: active users by state and city",
      "Content analytics: most-shared posts, top trending hashtags, most-watched reels",
      "Host & Agent analytics: top earners, top agents by managed volume",
      "Revenue analytics (SA only): ARPU, LTV, payment funnel conversion, subscription uptake",
    ],
  },
  {
    id: "a-ai-hub",
    icon: Cpu,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    title: "AI Hub",
    subtitle: "Configure AI moderation, recommendations, and language models",
    features: [
      "AI Moderation: set sensitivity thresholds for auto-flag (Nudity, Hate Speech, Spam, Violence, CSAM)",
      "Recommendation engine: tune weights for the 'For You' feed and Explore algorithm",
      "Regional language support: configure translation accuracy for all 13 Indian languages",
      "Chatbot responses: manage the in-app AI assistant prompts",
      "Model usage stats: API call volume, tokens consumed, cost per day, moderation accuracy rate",
      "A/B test new AI configurations before rolling them out platform-wide",
      "AI Hub badge shows active alerts and running experiments",
    ],
  },
  {
    id: "a-marketing",
    icon: Megaphone,
    color: "text-rose-600",
    bg: "bg-rose-50",
    title: "Marketing",
    subtitle: "Push campaigns, referral programs, and promotions",
    features: [
      "Push Notifications: create and schedule broadcast messages to all or segmented users (city, interest, role)",
      "Referral Program: view referral stats, top referrers, configure referral coin bonus amount",
      "Promotional Banners: upload and schedule in-app banners for the Home Feed",
      "Business Ads: manage advertiser campaigns with impression targets and CPM pricing",
      "Special Client Ads: premium sponsored slots with higher visibility",
      "Commercial Banners: full-width takeover banner slots for brand campaigns",
      "Promo & Offer Codes (SA only): create discount or coin-bonus codes for campaigns",
      "Campaign analytics: impressions, click rates, conversions, total revenue from ads",
    ],
  },
  {
    id: "a-jobs",
    icon: Briefcase,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Jobs Management",
    subtitle: "Review and manage all job postings on the platform",
    features: [
      "All job postings: title, company, city, category, plan, posted date, status (active/expired/pending)",
      "Pending review: new job posts submitted by employers — approve or reject with reason",
      "Remove a job post that violates guidelines from the Actions menu",
      "Feature a job: pinned to top of Jobs discovery for higher visibility",
      "Job posting plans: ₹499 (Basic, 30 days), ₹999 (Standard, 30 days + highlight), ₹1,999 (Premium, 30 days + featured + alerts)",
      "Analytics: total posts this month, total applications, top cities by job postings",
    ],
  },
  {
    id: "a-settings",
    icon: Settings,
    color: "text-slate-600",
    bg: "bg-slate-100",
    title: "Platform Settings (SA only)",
    subtitle: "Configure platform-level settings, branding, and feature flags",
    features: [
      "Branding: app display name, logo, colour scheme used in email and push templates",
      "Regional settings: default language, timezone (IST), currency display (₹)",
      "Notification templates: edit automated push / SMS / email text for key events",
      "Legal documents: update Terms & Conditions, Privacy Policy, Community Guidelines in-app",
      "Maintenance window: schedule planned downtime — users see a maintenance screen",
      "Feature flags: enable/disable specific app features for all users or a test cohort",
      "Auto-Payout toggle: automatically processes payouts above ₹500 threshold daily",
      "Open Registration toggle: pause new user sign-ups platform-wide if needed",
    ],
    note: "Settings page is Super Admin only. Admin users cannot access or modify platform configuration.",
  },
];

const SUPER_ADMIN_SECTIONS: Section[] = [
  {
    id: "sa-finance",
    icon: IndianRupee,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    title: "Financial Approvals (SA Exclusive)",
    subtitle: "All financial operations require Super Admin — Admins have no access",
    features: [
      "Payouts page: approve or reject host/agent/user withdrawal requests (min ₹500)",
      "Each payout shows: name, role, amount (₹), coins redeemed, bank/UPI details, KYC status, submission date",
      "Approve: mark as Processed after funds are transferred. User notified in-app",
      "Reject: enter reason (insufficient KYC, suspicious activity, etc.) — user must resubmit",
      "Coins page: edit recharge pack prices and coin amounts, add/remove packs, view full purchase log",
      "Bonus campaigns: create limited-time top-up bonus offers (e.g., +20% coins this weekend)",
      "Refund handling: process coin refund requests with transaction ID lookup",
      "Revenue & Ads page: view revenue breakdown (in-app purchases, ads, subscriptions, fees), daily/monthly charts, ad campaign performance",
      "Subscriptions page: manage VIP tiers (Silver/Gold/Platinum/Diamond Elite) and Creator plans (Basic/Pro/Elite) — edit pricing and features",
      "Auto-Payout toggle: auto-process all pending payouts above threshold daily",
    ],
    note: "Finance pages are completely hidden from the Admin role. If an Admin navigates to /payouts, /coins, /revenue, or /subscriptions they see an Access Denied screen.",
  },
  {
    id: "sa-creative",
    icon: Sparkles,
    color: "text-pink-600",
    bg: "bg-pink-50",
    title: "Creative Assets — Price Control",
    subtitle: "SA sets all coin prices for gifts, filters, stickers, and badges",
    features: [
      "Virtual Gifts: add new gifts with emoji, name, category, animation, and coin price. Edit any gift price at any time",
      "Prices go live in the app immediately — users see updated prices on next screen load",
      "Reel Filters: set free or premium tier; set coin unlock price for premium filters",
      "Sticker Packs: set pack price in coins for premium packs (free packs have price = 0)",
      "Badges & Frames: set coin purchase price for premium badges and profile frames",
      "Achievement badges have no price (auto-awarded) — SA defines the criteria text",
      "Toggle visibility: hide any asset from users without deleting it",
      "Asset usage stats: total uses / purchases shown on each card for performance insight",
    ],
  },
  {
    id: "sa-admin-management",
    icon: UserPlus,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    title: "Admin Management",
    subtitle: "Create, manage, and revoke Admin accounts",
    steps: [
      { text: "Go to Admin Management in the sidebar (SA only)." },
      { text: "Click Invite Admin — enter their name, email address, and assign the Admin role." },
      { text: "They receive an email with login credentials and a link to the admin portal." },
      { text: "They must change their password on first login." },
    ],
    features: [
      "Admin table: name, email, role, status (active/inactive), last login date",
      "Only two roles: Super Admin and Admin. No sub-role types",
      "Deactivate an Admin: immediate — their active session is terminated within 30 seconds",
      "Reactivate a deactivated Admin account without creating a new one",
      "Super Admin accounts cannot be revoked from this panel — requires server-level access",
      "Admin Activity log: view every action taken by each admin with timestamps",
      "My Work Report: each Admin can see their own daily activity summary",
    ],
  },
  {
    id: "sa-system",
    icon: Activity,
    color: "text-green-600",
    bg: "bg-green-50",
    title: "System Health Monitor",
    subtitle: "Monitor all backend services, load, and uptime in real time",
    features: [
      "6 service panels: API Server, WebSocket Server, Media CDN, PostgreSQL DB, Redis Cache, Push Notifications",
      "Each shows: health status (Healthy / Warning / Critical), uptime %, response time (ms), current load %",
      "Load progress bar: green = normal, yellow = elevated, red = high load — take action immediately",
      "Refresh Status button: manually pulls latest data from all services",
      "Global Settings card: toggle Maintenance Mode, Open Registration, Guest Access, AI Auto-Moderation, Auto Payouts, Developer Mode",
      "Maintenance Mode instantly blocks all non-admin users and shows a maintenance screen in the app",
    ],
  },
  {
    id: "sa-api-monitor",
    icon: Code,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Backend & API Monitoring",
    subtitle: "Live traffic stats for every platform endpoint and payment gateway",
    features: [
      "API Monitoring table: HTTP method, endpoint path, status code, avg response time (ms), volume per hour",
      "Payment Gateway Management: Razorpay, UPI Direct, Google Pay, PhonePe — each with success rate, today's volume, and Enable/Disable toggle",
      "Success rate progress bar: drop below 95% = investigate immediately",
      "Backend Access: SSH terminal access to the API server (emergency use only)",
      "Domain & Hosting: manage domain records and hosting configuration",
    ],
  },
  {
    id: "sa-apis-integrations",
    icon: Link,
    color: "text-teal-600",
    bg: "bg-teal-50",
    title: "API Integrations Management",
    subtitle: "Manage all platform APIs, third-party services, API keys, and webhooks",
    features: [
      "Platform APIs (18 total): Feed, Auth, Match, Posts, Reels, Stories, Chat, Calls, Coins, Payouts, Notifications, KYC, Search, Admin, Live, Gaming, AI, Analytics — toggle each on/off",
      "Third-Party Integrations by category:",
      "  → Payments: Razorpay, Google Pay Business, PhonePe Switch (masked API keys, rotate key button)",
      "  → Messaging: Firebase FCM (push), MSG91 SMS (OTP), SendGrid (email)",
      "  → Cloud: AWS S3 (media storage), Cloudflare CDN",
      "  → AI/Analytics: Google Analytics 4, OpenAI/GPT",
      "  → Auth/Calls: Google Sign-In, Agora RTC (live streaming)",
      "Rotate key: triggers an API key rotation workflow — old key is invalidated immediately",
      "Webhooks panel: 5 pre-configured webhooks (Payment Success, KYC Verified, Content Flagged, Payout Processed, New Signup)",
      "Each webhook shows: event type, endpoint URL, last triggered time, and active toggle",
      "Add new webhook or integration via the + buttons",
    ],
  },
  {
    id: "sa-levels-oversight",
    icon: TrendingUp,
    color: "text-orange-600",
    bg: "bg-orange-50",
    title: "Levels & Promotion Oversight (SA)",
    subtitle: "Final approval authority for all Host and Agent level promotions",
    features: [
      "SA is the final approver for all manual promotion requests submitted by agents or admins",
      "Promotion Queue: list of auto-qualified and manually requested promotions — Approve or Reject with one click",
      "Override auto-demotion: SA can pause a scheduled demotion if circumstances warrant it",
      "P&D Policy settings: SA can update the threshold numbers (coins, hours, host count) for any level",
      "Host level coin thresholds: L1=50K, L2=200K, L3=500K, L4=1M, L5=2M, L6=3.5M, L7=10M",
      "Agent level thresholds: A1=5 active hosts, A2=20, A3=50, A4=100, A5=250",
      "Commission rate overrides: SA can set a custom commission rate for specific agents",
    ],
  },
  {
    id: "sa-security",
    icon: Shield,
    color: "text-red-600",
    bg: "bg-red-50",
    title: "Security Alerts",
    subtitle: "Monitor and respond to platform security threats",
    features: [
      "Alert feed: all active security alerts with severity (High / Medium / Low), description, and timestamp",
      "High severity (red): immediate action required — payment anomalies, coordinated bot attacks, data breach indicators",
      "Medium severity (yellow): monitor and review — unusual API traffic spikes, bulk account creation",
      "Low severity (blue): informational — failed login attempts, rate limit triggers",
      "Each alert has a Dismiss button after review. All dismissals are logged with timestamp",
      "Security log retained for 90 days for compliance and audit purposes",
      "Critical alerts trigger an email to the Super Admin's registered address automatically",
    ],
  },
];

// ── Overview badges ────────────────────────────────────────────────────────────

function RoleOverview({ icon: Icon, role, color, bg, count, desc }: { icon: React.ElementType; role: string; color: string; bg: string; count: string; desc: string }) {
  return (
    <div className={`border rounded-xl p-4 ${bg} flex items-start gap-3`}>
      <div className={`p-2.5 rounded-xl bg-white/60 flex-shrink-0`}>
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

// ── Main page ─────────────────────────────────────────────────────────────────

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
            Complete guide for Users, Admins, and Super Admins — App Store ready
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

      {/* Role overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <RoleOverview icon={Smartphone} role="User Guide" color="text-purple-700" bg="bg-purple-50" count={`${USER_SECTIONS.length} sections`} desc="Complete mobile app walkthrough for end users — onboarding to advanced features" />
        <RoleOverview icon={LayoutDashboard} role="Admin Guide" color="text-blue-700" bg="bg-blue-50" count={`${ADMIN_SECTIONS.length} sections`} desc="Full admin dashboard manual — moderation, finance, analytics, and platform controls" />
        <RoleOverview icon={ShieldCheck} role="Super Admin Guide" color="text-rose-700" bg="bg-rose-50" count={`${SUPER_ADMIN_SECTIONS.length} sections`} desc="Advanced system controls — access management, APIs, integrations, and security" />
      </div>

      <Tabs defaultValue="user">
        <TabsList className="h-10 gap-1">
          <TabsTrigger value="user" className="gap-1.5">
            <Smartphone className="w-3.5 h-3.5" /> User Guide
          </TabsTrigger>
          <TabsTrigger value="admin" className="gap-1.5">
            <LayoutDashboard className="w-3.5 h-3.5" /> Admin Guide
          </TabsTrigger>
          <TabsTrigger value="superadmin" className="gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Guide
          </TabsTrigger>
        </TabsList>

        {/* ─── USER GUIDE ─── */}
        <TabsContent value="user" className="mt-5 space-y-3">
          <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4 flex items-start gap-3 mb-4">
            <Smartphone className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-purple-900">Ridhi — India's Social Networking & Dating App</p>
              <p className="text-sm text-purple-700 mt-1">
                Available on Android (Google Play Store) and iOS (Apple App Store). Ridhi is an India-first platform combining social networking, short-form video, and dating — with support for 13 Indian languages. Tap any section below to expand the full guide.
              </p>
            </div>
          </div>
          {USER_SECTIONS.map((s) => <HandbookSection key={s.id} section={s} />)}
        </TabsContent>

        {/* ─── ADMIN GUIDE ─── */}
        <TabsContent value="admin" className="mt-5 space-y-3">
          <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 flex items-start gap-3 mb-4">
            <LayoutDashboard className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-blue-900">Ridhi Admin Dashboard — Internal Operations Manual</p>
              <p className="text-sm text-blue-700 mt-1">
                The Admin Dashboard is a web-based control panel accessible to approved Ridhi team members. It covers user management, content moderation, financial operations, creator management, analytics, and platform configuration. All actions are logged and auditable.
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
              <p className="font-semibold text-rose-900">Super Admin Control — Restricted Access</p>
              <p className="text-sm text-rose-700 mt-1">
                The Super Admin section provides unrestricted access to all platform systems. This includes host/agent access management, server health monitoring, global settings, API & integration controls, admin role management, and security alert responses. Actions in this section have immediate platform-wide effect.
              </p>
            </div>
          </div>
          {SUPER_ADMIN_SECTIONS.map((s) => <HandbookSection key={s.id} section={s} />)}

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
                  { label: "Privacy Policy published", ok: true, note: "ridhi.app/privacy-policy" },
                  { label: "Terms & Conditions published", ok: true, note: "ridhi.app/terms" },
                  { label: "Age rating declared (17+ / Mature)", ok: true, note: "Dating features require 17+ on App Store" },
                  { label: "Content moderation system active", ok: true, note: "AI + human review queue live" },
                  { label: "In-app purchases configured", ok: true, note: "Coin packs via Razorpay + UPI" },
                  { label: "Data deletion flow available", ok: true, note: "Settings → Account → Delete Account" },
                  { label: "KYC / age verification for dating", ok: true, note: "E-KYC mandatory for 18+ features" },
                  { label: "Support contact accessible in-app", ok: true, note: "Settings → Help & Support" },
                  { label: "Push notification permission handling", ok: true, note: "Permission prompted on first launch" },
                  { label: "Offline / no-network state handled", ok: true, note: "Error boundary with retry screens" },
                  { label: "Regional language support", ok: true, note: "13 Indian languages in Settings" },
                  { label: "App icon and splash screen set", ok: true, note: "Ridhi logo (purple + pink) in all sizes" },
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
        <p>Ridhi Platform Handbook · Version 2.0.0 · © 2026 Krilo Digitech Pvt. Ltd.</p>
        <p className="mt-1">Company: Krilo Digitech Pvt Ltd · Founder: Jadaprolu Hareesh · ridhi.app · support@ridhi.app</p>
      </div>
    </div>
  );
}
