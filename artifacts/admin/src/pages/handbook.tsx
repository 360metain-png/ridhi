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
  FileText, HelpCircle, Map, Award,
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
      { text: "Tap Get Started and choose your login method: Mobile Number (OTP), Email Address, or Social Login." },
      { text: "Enter your mobile number or email. You will receive a 6-digit OTP — enter it within 60 seconds to verify." },
      { text: "If OTP doesn't arrive, tap Resend OTP after 30 seconds. Check your network connection." },
      { text: "Once verified, you proceed to the 4-step profile setup." },
    ],
    features: [
      "Mobile Number login with OTP verification",
      "Email address login",
      "Social login (Google) where available",
      "Forgot Password: Login → Forgot Password → Enter registered number/email → Verify OTP → Set new password",
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
    subtitle: "Vertical short-video feed (TikTok-style)",
    features: [
      "Swipe up to go to the next reel. Swipe down to go back",
      "Tap anywhere on the video to pause/play",
      "Like: tap the heart icon on the right panel",
      "Comment: tap the chat icon — type and post a comment",
      "Share: tap the share icon to send or copy the reel link",
      "Follow the creator: tap the + button on their avatar",
      "Mute/unmute: tap the speaker icon at the bottom right",
      "Double-tap anywhere on the video to like instantly",
    ],
    note: "Ridhi Reels support resolutions up to 1080p. Videos autoplay with sound — respect public spaces.",
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
      "Recharge packs: ₹49 = 100 coins, ₹99 = 250 coins, ₹199 = 600 coins, ₹499 = 1,800 coins",
      "Tap any pack → select payment method (UPI, card, GPay, PhonePe) → complete purchase",
      "Spend coins on: Gifts to hosts, Random calls, Premium features, Live stream entry",
      "Transaction history: full log of all earned, purchased, and spent coins",
    ],
    note: "Ridhi Coins are non-refundable virtual currency. They cannot be transferred between accounts.",
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
    id: "host",
    icon: Star,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "Become a Host (Earn on Ridhi)",
    subtitle: "Register as a live host and earn virtual gifts",
    steps: [
      { text: "Go to Profile → Earn on Ridhi → Host card → tap Apply." },
      { text: "Fill in the Host Registration form: Display Name, Language(s), Content Type (Entertainment/Music/Talk/Gaming/Education/Dance), Bio, City, and upload a profile photo." },
      { text: "Agree to Host Guidelines and tap Submit Registration." },
      { text: "An animated success screen confirms submission. Your application is under review." },
      { text: "Once approved, the Host card on your profile shows 'Active ✓' and you can start Live Streams." },
    ],
    features: [
      "Earn coins from virtual gifts sent by viewers during live sessions",
      "Gifts range from small (1 coin) to grand gestures (50,000+ coins)",
      "Host levels: L1 Bronze → L7 Royal Crown based on total coins earned",
      "Higher levels unlock: better revenue share, featured placement, custom frames",
      "Creator Dashboard shows your earnings, views, top content, and withdrawal history",
      "Minimum withdrawal: ₹500 equivalent. Payouts processed within 7 working days",
    ],
  },
  {
    id: "agent",
    icon: Briefcase,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    title: "Become an Agent (Earn on Ridhi)",
    subtitle: "Recruit and manage hosts to earn commissions",
    steps: [
      { text: "Go to Profile → Earn on Ridhi → Agent card → tap Apply." },
      { text: "Fill in the Agent Registration form: Agency Name, Your Name, Contact Number, City, Experience, and your host recruitment plan." },
      { text: "Agree to Agent Terms and tap Submit Registration." },
      { text: "Once approved, the Agent card shows 'Active ✓' and you gain access to the Agent Dashboard." },
    ],
    features: [
      "Recruit hosts under your agency — earn a % commission on all their coin earnings",
      "Agent levels: A1 Junior → A5 Master Agent based on number of hosts managed",
      "Agent Dashboard: view all your managed hosts, their performance, and your commission breakdown",
      "Commission rates: 4% (A2) → 10% (A5 Master Agent)",
    ],
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
      "Contact: support@ridhi.app (Customer Support), hey@ridhi.app (Business)",
      "Support hours: Monday – Saturday, 10:00 AM – 7:00 PM IST",
      "FAQs: 10 common questions with detailed answers",
      "Report a user: tap ⋯ on any profile or post → Report",
      "Block a user: tap ⋯ on any profile → Block",
      "Account deletion: Settings → Account → Delete Account",
      "Appeal a suspension: email support@ridhi.app with your registered number and reason",
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
    subtitle: "Access the Ridhi Admin Dashboard",
    steps: [
      { text: "Go to the Admin Dashboard URL (ridhi.app/admin or your deployment URL)." },
      { text: "Enter your admin email and password. Click Login." },
      { text: "The system checks your role: Super Admin, Content Admin, Finance Admin, Support Admin, or Marketing Admin." },
      { text: "You land on the Dashboard overview page with live KPIs." },
    ],
    note: "Admin credentials are issued by the Super Admin. Contact arjun@ridhi.app to request access.",
  },
  {
    id: "a-dashboard",
    icon: LayoutDashboard,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Dashboard",
    subtitle: "Platform overview — KPIs, charts, live activity",
    features: [
      "KPI cards: Total Users, Daily Active Users, New Registrations Today, Total Revenue",
      "User growth chart (7-day / 30-day toggle)",
      "Content activity chart: posts, reels, stories per day",
      "Revenue chart: coin purchases vs. payout outflows",
      "Recent flagged content requiring moderation action",
      "Top cities by user activity",
      "System status indicator in the top bar (All Systems OK / Warning)",
    ],
  },
  {
    id: "a-users",
    icon: Users,
    color: "text-green-600",
    bg: "bg-green-50",
    title: "User Management",
    subtitle: "Search, view, edit, verify, and ban users",
    features: [
      "Search users by name, phone number, email, or city",
      "Filter by: Verified / Unverified, Active / Suspended / Banned, Registration date",
      "User table shows: Avatar, Name, Phone, City, Join Date, Status, KYC status, Actions",
      "Click any row to open the full User Detail page",
      "User Detail: profile info, post history, chat summary, coin balance, reports received",
      "Actions available per user: Verify, Suspend (temporary), Ban (permanent), Delete account, Reset password",
      "Bulk actions: select multiple users → apply action to all",
      "Export user list as CSV",
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
      "Filter by content type: Post / Reel / Story / Comment",
      "Filter by severity: High / Medium / Low",
      "Each item shows: content preview, report reason, reporter details, created date",
      "Actions per item: Approve (keep live), Remove (take down), Warn User, Ban User",
      "Bulk approve/remove via checkboxes",
      "Content Moderation badge in sidebar shows pending count",
      "AI-flagged content is pre-labelled with the detection category (nudity, hate speech, spam, etc.)",
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
      "Create a new community: tap New Community → enter name, description, category, cover image",
      "Edit community: update description, rules, cover image, or category",
      "Feature a community: toggle the Featured switch to promote it on the Explore page",
      "Suspend a community: disables new posts but retains existing content",
      "Delete a community: permanently removes all posts and member associations",
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
      "Pending Applications tab: review new host applications — Approve or Reject with reason",
      "All Hosts table: name, level (L1–L7), city, total coins earned, active sessions, status",
      "Host Detail: full application info, performance metrics, earnings history, live sessions",
      "Promote/Demote level manually if needed",
      "Suspend or ban a host from the Actions menu",
      "Export host earnings report as CSV",
    ],
  },
  {
    id: "a-agents",
    icon: Briefcase,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Agent Management",
    subtitle: "Approve, manage, and monitor all registered agents",
    features: [
      "Pending Applications: approve or reject agent registrations",
      "All Agents table: name, level (A1–A5), city, hosts managed, commission rate, total earnings",
      "Agent Detail: managed hosts list, commission breakdown, performance trend",
      "Reassign hosts between agents",
      "Adjust commission rate per agent (Super Admin only)",
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
      "Live calls panel: shows currently active calls in real time",
      "Call log table: caller, receiver, call type, duration, coins deducted, start/end time",
      "Filter by: Audio / Video / Random / Direct",
      "Stats: total calls today, average duration, total coins consumed, success rate",
      "Flag and review specific calls if reported",
      "Monitor per-user call frequency to detect abuse",
    ],
  },
  {
    id: "a-gaming",
    icon: Gamepad2,
    color: "text-green-600",
    bg: "bg-green-50",
    title: "Gaming Management",
    subtitle: "Manage games, tournaments, and leaderboards",
    features: [
      "Games list: enable/disable individual games from the platform",
      "Tournament creation: set game, entry fee (coins), prize pool, start/end time, max participants",
      "Tournament list: active, upcoming, and completed tournaments with participant counts",
      "Leaderboard management: view and reset leaderboards per game",
      "Gaming analytics: total plays, average session, most popular game, coins spent in gaming",
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
      "Active Streams: all currently live sessions with viewer count, duration, and host",
      "Tap a stream to view its details and join as a silent monitor",
      "Force-end a stream: use the End Stream action (for policy violations)",
      "Feature a stream: tap Feature to pin it to the top of the Live discovery page",
      "Live history: all completed streams with peak viewers, total gifts, duration",
      "Reported streams: review flagged streams and take action",
    ],
  },
  {
    id: "a-coins",
    icon: Coins,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    title: "Coin Economy",
    subtitle: "Monitor coin purchases, circulation, and packages",
    features: [
      "Coin stats: total coins in circulation, purchased today, gifted today, spent on calls",
      "Purchase log: user, package, amount paid (₹), coins received, payment method, time",
      "Recharge packages management: edit prices, coin amounts, or add/remove packages",
      "Bonus campaigns: create limited-time bonus coin offers (e.g., +20% on top-up this weekend)",
      "Coin gifting log: who gifted how many coins to which host",
      "Refund handling: process coin refund requests (requires Finance Admin or above)",
    ],
  },
  {
    id: "a-payouts",
    icon: IndianRupee,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    title: "Payouts & Finance",
    subtitle: "Process creator payout requests and view financial records",
    features: [
      "Pending Payouts: queue of all withdrawal requests from hosts and agents",
      "Each payout shows: name, amount, bank/UPI details, submission date, status",
      "Approve payout: mark as Processed after transferring funds",
      "Reject payout: enter reason (e.g., insufficient KYC) — user is notified",
      "Payout history: full ledger of all processed payouts",
      "Revenue vs. Payout chart: visualise platform take-rate over time",
      "Auto-payout toggle (Super Admin): automatically processes payouts above a threshold",
    ],
  },
  {
    id: "a-revenue",
    icon: BarChart3,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    title: "Revenue & Ads",
    subtitle: "Platform revenue, ad slots, and monetisation overview",
    features: [
      "Revenue breakdown: In-app purchases, Ads, Subscriptions, Transaction fees",
      "Daily/monthly revenue charts",
      "Ad inventory: manage banner, interstitial, and rewarded video ad placements",
      "Ad campaigns: view active campaigns, impressions, clicks, and CPM",
      "Top revenue-generating users (host gift recipients)",
      "Platform take-rate configuration (Super Admin only)",
    ],
  },
  {
    id: "a-kyc",
    icon: ScanFace,
    color: "text-sky-600",
    bg: "bg-sky-50",
    title: "E-KYC Verification",
    subtitle: "Review and verify user identity documents",
    features: [
      "Pending KYC queue: all users who have submitted Aadhaar/PAN/passport for verification",
      "Each submission shows: user info, document type, uploaded images, submission date",
      "Approve: marks the user as KYC Verified (blue badge on profile)",
      "Reject: select rejection reason — user must resubmit",
      "Auto-verification: AI pre-screens documents; flagged ones need manual review",
      "KYC is mandatory for hosts before receiving payouts",
      "KYC badge in sidebar shows pending count",
    ],
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
      "Retention: Day 1, Day 7, Day 30 retention cohorts",
      "Engagement: avg. session duration, posts per user, reels watched per day",
      "Match & Dating: swipe volume, match rate, chat-from-match conversion",
      "Geographic distribution: users by state and city on a heat map",
      "Content analytics: most-shared posts, top hashtags, trending reels",
      "Revenue analytics: ARPU, LTV, payment funnel conversion",
    ],
  },
  {
    id: "a-ai-hub",
    icon: Cpu,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    title: "AI Hub",
    subtitle: "Configure AI moderation, recommendation, and language models",
    features: [
      "AI Moderation: configure sensitivity thresholds for auto-flag (nudity, hate speech, spam, CSAM)",
      "Recommendation engine: tune weights for the 'For You' feed algorithm",
      "Content captioning: AI-generated captions for accessibility",
      "Translation quality: configure supported regional language translation accuracy",
      "Chatbot responses: manage the AI assistant prompts used in the mobile app",
      "Model usage stats: tokens consumed, API costs, moderation accuracy rate",
      "A/B test new AI models before rolling out platform-wide",
      "AI Hub badge in sidebar shows active alerts/experiments",
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
      "Push Notifications: create and schedule broadcast messages to all or segmented users",
      "Referral Program: view referral stats, top referrers, configure referral coin bonus",
      "Promotional banners: upload and schedule in-app banners for the Home Feed",
      "Coin bonus campaigns: set limited-time recharge bonuses",
      "Email campaigns: draft and send email newsletters to registered users",
      "Campaign analytics: open rates, click rates, conversions",
    ],
  },
  {
    id: "a-settings",
    icon: Settings,
    color: "text-slate-600",
    bg: "bg-slate-100",
    title: "Admin Settings",
    subtitle: "Configure platform-level settings and preferences",
    features: [
      "Branding: update app display name, logo, colour scheme used in communications",
      "Regional settings: configure default language, timezone, currency display",
      "Notification templates: edit the text of automated notifications sent to users",
      "Legal documents: update Terms & Conditions, Privacy Policy, Community Guidelines",
      "Maintenance window: schedule planned downtime with user notification",
      "Feature flags: enable/disable specific app features for all users or a test group",
    ],
  },
];

const SUPER_ADMIN_SECTIONS: Section[] = [
  {
    id: "sa-access",
    icon: Key,
    color: "text-purple-600",
    bg: "bg-purple-50",
    title: "Host & Agent Access Portal",
    subtitle: "Grant or revoke full dashboard access for hosts and agents",
    features: [
      "Host Access table: all registered hosts with their level, email, last login, active sessions, and Admin Since date",
      "Enable/disable each host's admin access via the toggle switch",
      "Grant All button: enable access for all hosts in one click",
      "Agent Access table: same controls for all registered agents",
      "All enabled hosts and agents get identical Super Admin permissions — every dashboard page, financial reports, moderation queue, and platform controls",
      "Permission Matrix card shows exactly which permissions each role has (all ✓ for Super Admin, Hosts, and Agents)",
    ],
    note: "Revoking access is immediate. The user's active session is terminated within 30 seconds.",
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
      "Each shows: health status (Healthy / Warning / Critical), uptime %, response time, and load %",
      "Progress bar shows current load visually — red bar = high load",
      "Refresh Status button: pulls latest data from all services",
      "Global Settings card: toggle Maintenance Mode, Open Registration, Guest Access, AI Auto-Moderation, Auto Payouts, Developer Mode",
      "Warning: Maintenance Mode instantly blocks all non-admin users from accessing the app",
    ],
  },
  {
    id: "sa-api-monitor",
    icon: Code,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "API Monitoring",
    subtitle: "Live traffic stats for every platform API endpoint",
    features: [
      "API Monitoring table: HTTP method, endpoint path, HTTP status code, average response time, volume per hour",
      "Payment Gateway Management: Razorpay, UPI Direct, Google Pay, PhonePe cards with success rate, today's transaction value, and Enable/Disable controls",
      "Each payment gateway shows a progress bar representing its success rate",
      "Eye icon on each gateway: view full transaction log for that gateway",
    ],
  },
  {
    id: "sa-apis-integrations",
    icon: Link,
    color: "text-teal-600",
    bg: "bg-teal-50",
    title: "APIs & Integrations (Full Access)",
    subtitle: "Manage all platform APIs, third-party services, API keys, and webhooks",
    features: [
      "Platform APIs table (18 APIs): Feed, Auth, Match, Posts, Reels, Stories, Chat, Calls, Coins, Payouts, Notifications, KYC, Search, Admin, Live, Gaming, AI, Analytics — all individually toggleable",
      "Enable All button: re-enable all APIs with one click",
      "Category color badges: Core, Content, Social, Finance, Platform, AI",
      "Third-Party Integrations grouped by category:",
      "  → Payments: Razorpay, Google Pay Business, PhonePe Switch — with masked API keys and rotate key buttons",
      "  → Messaging: Firebase FCM (push), Twilio SMS (OTP), SendGrid (email)",
      "  → Cloud: AWS S3 (media storage), Cloudflare CDN",
      "  → AI/Analytics: Google Analytics 4, OpenAI/GPT",
      "  → Auth/Calls: Google Sign-In, Agora RTC",
      "Copy key button: copies masked key for verification",
      "Rotate key button: triggers API key rotation workflow",
      "Webhooks panel: 5 pre-configured webhooks (Payment Success, KYC, Content Moderation, Payout, Signup)",
      "Each webhook shows event types, URL, last triggered time, and active toggle",
      "Add new webhook or new integration via + buttons",
    ],
  },
  {
    id: "sa-admin-roles",
    icon: Users,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    title: "Admin Role Management",
    subtitle: "View, edit, and manage all platform admin accounts",
    features: [
      "Admin Roles table: name, email, role title, status (active/inactive), permission scope, last login",
      "Roles available: Super Admin, Content Admin, Finance Admin, Support Admin, Marketing Admin",
      "Edit a role: change their permission scope",
      "Revoke access: immediately deactivates a non-Super Admin account",
      "Invite New Admin: send an email invite with a temporary password",
      "Super Admin role cannot be revoked from this panel — must be done via server configuration",
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
      "High severity (red): immediate action required — e.g., payment anomalies, coordinated attacks",
      "Medium severity (yellow): monitor and review — e.g., unusual API spike patterns",
      "Low severity (blue): informational — e.g., failed login attempts from known IPs",
      "Each alert has a Dismiss button once reviewed",
      "Security log is retained for 90 days for audit purposes",
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
        <p>Ridhi Platform Handbook · Version 1.0.0 · © 2026 Krilo Digitech Pvt. Ltd.</p>
        <p className="mt-1">Company: Krilo Digitech Pvt Ltd · Founder: Jadaprolu Hareesh · ridhi.app · support@ridhi.app</p>
      </div>
    </div>
  );
}
