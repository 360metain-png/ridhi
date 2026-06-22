export type User = {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  language: string;
  joinDate: string;
  status: "active" | "suspended" | "pending";
  followers: number;
  following: number;
  posts: number;
  coins: number;
  reportsReceived: number;
  isVerified: boolean;
  // Fake profile detection fields
  trustScore?: number; // 0-100, higher = more trustworthy
  riskFlags?: RiskFlag[];
  lastActivity?: string;
  deviceCount?: number;
  ipCount?: number;
  bioText?: string;
  profileCompletion?: number; // 0-100
  socialLinks?: { instagram?: string; facebook?: string; twitter?: string };
};

export type RiskFlag =
  | "generic_photo"
  | "stock_image"
  | "no_bio"
  | "suspicious_email"
  | "multiple_accounts"
  | "rapid_activity"
  | "reported"
  | "no_posts"
  | "spam_messages"
  | "vpn_ip"
  | "suspicious_name"
  | "incomplete_profile";
export type Post = { id: string, userId: string, type: "post"|"reel"|"story"|"poll", content: string, mediaUrl: string, likes: number, comments: number, shares: number, reports: number, createdAt: string, status: "active"|"removed"|"flagged" };
export type Community = { id: string, name: string, category: string, members: number, posts: number, language: string, visibility: "public"|"private", status: "active"|"suspended"|"pending", createdAt: string };
export type Transaction = { id: string, userId: string, userName: string, type: "Earned"|"Spent"|"Recharged"|"Gift Sent"|"Gift Received", amount: number, balanceAfter: number, description: string, createdAt: string };
export type WithdrawalRequest = { id: string, creatorId: string, creatorName: string, amount: number, method: "UPI"|"Bank", upiId?: string, bankAccount?: string, requestedAt: string, status: "Pending"|"Approved"|"Rejected"|"Paid" };
export type Campaign = {
  id: string, name: string, type: string, reach: number, clicks: number, conversions: number,
  status: "Draft"|"Active"|"Completed", startDate: string, endDate: string,
  locationMode?: "all" | "city" | "radius",
  targetCity?: string,
  targetRadius?: number,
};

// ── Fake Profile Detection Engine ──
export function calculateTrustScore(user: Partial<User>): number {
  let score = 70; // baseline
  const flags: RiskFlag[] = [];

  // Name heuristics
  const genericNames = ["Aarav Sharma", "Diya Patel", "Vihaan Singh", "Aditi Rao"];
  const hasGenericName = genericNames.some(n => user.name?.includes(n));
  if (hasGenericName) { score -= 8; flags.push("suspicious_name"); }

  // Email heuristics
  const suspiciousDomains = ["tempmail.com", "mailinator.com", "10minutemail.com", "fakeinbox.com"];
  const hasSuspiciousEmail = suspiciousDomains.some(d => user.email?.endsWith(d));
  if (hasSuspiciousEmail) { score -= 15; flags.push("suspicious_email"); }
  if (user.email?.endsWith("example.com")) { score -= 10; flags.push("suspicious_email"); }

  // Bio / profile completion
  if (!user.bioText || user.bioText.length < 10) {
    score -= 12; flags.push("no_bio");
  }
  if ((user.profileCompletion || 0) < 40) {
    score -= 10; flags.push("incomplete_profile");
  }

  // Activity
  if ((user.posts || 0) === 0) {
    score -= 15; flags.push("no_posts");
  }
  if ((user.followers || 0) === 0 && (user.following || 0) === 0) {
    score -= 8; flags.push("no_posts"); // reuse flag
  }

  // Reports
  if ((user.reportsReceived || 0) >= 2) {
    score -= 20; flags.push("reported");
  }

  // Device / IP anomalies
  if ((user.deviceCount || 1) > 3) {
    score -= 12; flags.push("multiple_accounts");
  }
  if ((user.ipCount || 1) > 2) {
    score -= 8; flags.push("vpn_ip");
  }

  // Rapid activity
  const daysSinceJoin = Math.floor((Date.now() - new Date(user.joinDate || 0).getTime()) / 86400000);
  if (daysSinceJoin < 3 && (user.posts || 0) > 10) {
    score -= 10; flags.push("rapid_activity");
  }

  // Social links
  if (!user.socialLinks?.instagram && !user.socialLinks?.facebook && !user.socialLinks?.twitter) {
    // no penalty for this — many legit Indian users don't link socials
  }

  score = Math.max(0, Math.min(100, score));
  return score;
}

export function getRiskLevel(score: number): "safe" | "low" | "medium" | "high" | "critical" {
  if (score >= 80) return "safe";
  if (score >= 65) return "low";
  if (score >= 45) return "medium";
  if (score >= 25) return "high";
  return "critical";
}

export function getRiskFlagLabel(flag: RiskFlag): string {
  const labels: Record<RiskFlag, string> = {
    generic_photo: "Generic Photo",
    stock_image: "Stock Image",
    no_bio: "No Bio",
    suspicious_email: "Suspicious Email",
    multiple_accounts: "Multiple Accounts",
    rapid_activity: "Rapid Activity",
    reported: "Reported",
    no_posts: "No Posts",
    spam_messages: "Spam Messages",
    vpn_ip: "VPN / Proxy IP",
    suspicious_name: "Suspicious Name",
    incomplete_profile: "Incomplete Profile",
  };
  return labels[flag] || flag;
}

const bioTemplates = [
  "Hello! I love traveling and music.",
  "Just here to make new friends and explore.",
  "Tech enthusiast | Coffee lover | Mumbai",
  "Living life one day at a time ✨",
  "", // empty bio
  "DM me for collabs and promotions",
  "Follow me on Instagram @username",
  "",
  "Digital creator | Fashion | Lifestyle",
  "Student | Dreamer | Always learning",
];

export const mockUsers: User[] = Array.from({ length: 30 }, (_, i) => {
  const hasSuspiciousEmail = i % 7 === 0;
  const hasEmptyBio = i % 5 === 0;
  const hasNoPosts = i % 6 === 0;
  const hasMultipleDevices = i % 8 === 0;
  const hasReports = i % 9 === 0;

  const baseUser: User = {
    id: `u${i + 1}`,
    name: ["Aarav Sharma", "Diya Patel", "Vihaan Singh", "Aditi Rao", "Arjun Gupta", "Ananya Reddy", "Sai Kumar", "Priya Das", "Krishna Iyer", "Riya Desai"][i % 10] + (i >= 10 ? ` ${i}` : ""),
    avatar: "",
    phone: `+91 98765${43210 + i}`,
    email: hasSuspiciousEmail
      ? `user${i}@${["tempmail.com", "mailinator.com", "10minutemail.com"][i % 3]}`
      : `user${i}@gmail.com`,
    city: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Kolkata", "Pune", "Kochi"][i % 8],
    state: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Telangana", "West Bengal", "Maharashtra", "Kerala"][i % 8],
    language: ["Hindi", "English", "Marathi", "Tamil", "Telugu", "Bengali", "Malayalam"][i % 7],
    joinDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
    status: ["active", "suspended", "pending"][Math.floor(Math.random() * 3)] as any,
    followers: Math.floor(Math.random() * 5000),
    following: Math.floor(Math.random() * 1000),
    posts: hasNoPosts ? 0 : Math.floor(Math.random() * 200),
    coins: Math.floor(Math.random() * 1000),
    reportsReceived: hasReports ? Math.floor(Math.random() * 4) + 2 : Math.floor(Math.random() * 2),
    isVerified: Math.random() > 0.8,
    bioText: hasEmptyBio ? "" : bioTemplates[i % bioTemplates.length],
    profileCompletion: Math.floor(Math.random() * 100),
    deviceCount: hasMultipleDevices ? Math.floor(Math.random() * 3) + 3 : 1,
    ipCount: hasMultipleDevices ? Math.floor(Math.random() * 3) + 2 : 1,
    lastActivity: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 7)).toISOString(),
    socialLinks: (i % 4 === 0) ? { instagram: "@user" + i } : {},
  };

  const score = calculateTrustScore(baseUser);
  const flags: RiskFlag[] = [];

  // Re-run flag detection to populate flags array
  const genericNames = ["Aarav Sharma", "Diya Patel", "Vihaan Singh", "Aditi Rao"];
  if (genericNames.some(n => baseUser.name.includes(n))) flags.push("suspicious_name");
  if (baseUser.email.endsWith("tempmail.com") || baseUser.email.endsWith("mailinator.com") || baseUser.email.endsWith("10minutemail.com")) flags.push("suspicious_email");
  if (!baseUser.bioText || baseUser.bioText.length < 10) flags.push("no_bio");
  if ((baseUser.profileCompletion ?? 0) < 40) flags.push("incomplete_profile");
  if (baseUser.posts === 0) flags.push("no_posts");
  if (baseUser.reportsReceived >= 2) flags.push("reported");
  if ((baseUser.deviceCount ?? 1) > 3) flags.push("multiple_accounts");
  if ((baseUser.ipCount ?? 1) > 2) flags.push("vpn_ip");
  const daysSinceJoin = Math.floor((Date.now() - new Date(baseUser.joinDate).getTime()) / 86400000);
  if (daysSinceJoin < 3 && baseUser.posts > 10) flags.push("rapid_activity");

  return { ...baseUser, trustScore: score, riskFlags: flags };
});

export const mockPosts: Post[] = Array.from({ length: 30 }, (_, i) => ({
  id: `p${i + 1}`,
  userId: `u${(i % 30) + 1}`,
  type: ["post", "reel", "story", "poll"][Math.floor(Math.random() * 4)] as any,
  content: `This is some sample content for post ${i + 1}`,
  mediaUrl: "",
  likes: Math.floor(Math.random() * 1000),
  comments: Math.floor(Math.random() * 100),
  shares: Math.floor(Math.random() * 50),
  reports: Math.floor(Math.random() * 10),
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 100000000)).toISOString(),
  status: ["active", "removed", "flagged"][Math.floor(Math.random() * 3)] as any
}));

export const mockCommunities: Community[] = Array.from({ length: 30 }, (_, i) => ({
  id: `c${i + 1}`,
  name: `Community ${i + 1}`,
  category: ["Tech", "Entertainment", "Sports", "Lifestyle", "Gaming"][i % 5],
  members: Math.floor(Math.random() * 10000),
  posts: Math.floor(Math.random() * 5000),
  language: ["Hindi", "English", "Marathi", "Tamil", "Telugu"][i % 5],
  visibility: ["public", "private"][Math.floor(Math.random() * 2)] as any,
  status: ["active", "suspended", "pending"][Math.floor(Math.random() * 3)] as any,
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0]
}));

export const mockTransactions: Transaction[] = Array.from({ length: 30 }, (_, i) => ({
  id: `t${i + 1}`,
  userId: `u${(i % 30) + 1}`,
  userName: mockUsers[i % 30].name,
  type: ["Earned", "Spent", "Recharged", "Gift Sent", "Gift Received"][Math.floor(Math.random() * 5)] as any,
  amount: Math.floor(Math.random() * 5000),
  balanceAfter: Math.floor(Math.random() * 10000),
  description: `Transaction ${i + 1} description`,
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 100000000)).toISOString()
}));

export const mockWithdrawals: WithdrawalRequest[] = Array.from({ length: 30 }, (_, i) => ({
  id: `w${i + 1}`,
  creatorId: `u${(i % 30) + 1}`,
  creatorName: mockUsers[i % 30].name,
  amount: Math.floor(Math.random() * 50000) + 1000,
  method: ["UPI", "Bank"][Math.floor(Math.random() * 2)] as any,
  upiId: `user${i}@upi`,
  bankAccount: `0000${Math.floor(Math.random() * 1000000)}`,
  requestedAt: new Date(Date.now() - Math.floor(Math.random() * 100000000)).toISOString(),
  status: ["Pending", "Approved", "Rejected", "Paid"][Math.floor(Math.random() * 4)] as any
}));

export const mockCampaigns: Campaign[] = Array.from({ length: 15 }, (_, i) => {
  const locModes: ("all" | "city" | "radius")[] = ["all", "all", "city", "radius", "all"];
  const locMode = locModes[i % locModes.length];
  const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata"];
  const targetCity = locMode === "all" ? undefined : cities[i % cities.length];
  const targetRadius = locMode === "radius" ? [5, 10, 15, 25, 50, 100][i % 6] : undefined;
  return {
    id: `camp${i + 1}`,
    name: `Diwali Offer ${i + 1}`,
    type: "Push Notification",
    reach: Math.floor(Math.random() * 100000),
    clicks: Math.floor(Math.random() * 10000),
    conversions: Math.floor(Math.random() * 1000),
    status: ["Draft", "Active", "Completed"][Math.floor(Math.random() * 3)] as any,
    startDate: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString().split('T')[0],
    endDate: new Date(Date.now() + Math.floor(Math.random() * 1000000000)).toISOString().split('T')[0],
    locationMode: locMode,
    targetCity,
    targetRadius,
  };
});

// ── 30-Day Time-Series Analytics ───────────────────────────────────
export interface DailyStat {
  date: string;
  dau: number;
  newUsers: number;
  revenue: number;
  coinPurchases: number;
  adSpend: number;
  withdrawalRequests: number;
}

export const ANALYTICS_30D: DailyStat[] = [
  { date: "Apr 24", dau: 12400, newUsers: 420, revenue: 84700, coinPurchases: 156, adSpend: 0, withdrawalRequests: 8 },
  { date: "Apr 25", dau: 13100, newUsers: 480, revenue: 92100, coinPurchases: 172, adSpend: 0, withdrawalRequests: 10 },
  { date: "Apr 26", dau: 12800, newUsers: 390, revenue: 78500, coinPurchases: 148, adSpend: 0, withdrawalRequests: 6 },
  { date: "Apr 27", dau: 14200, newUsers: 560, revenue: 112400, coinPurchases: 210, adSpend: 0, withdrawalRequests: 12 },
  { date: "Apr 28", dau: 14500, newUsers: 520, revenue: 105200, coinPurchases: 198, adSpend: 0, withdrawalRequests: 9 },
  { date: "Apr 29", dau: 13800, newUsers: 450, revenue: 93400, coinPurchases: 175, adSpend: 0, withdrawalRequests: 11 },
  { date: "Apr 30", dau: 15000, newUsers: 610, revenue: 121000, coinPurchases: 228, adSpend: 0, withdrawalRequests: 14 },
  { date: "May 1",  dau: 16800, newUsers: 780, revenue: 145600, coinPurchases: 274, adSpend: 0, withdrawalRequests: 16 },
  { date: "May 2",  dau: 17200, newUsers: 690, revenue: 138200, coinPurchases: 260, adSpend: 0, withdrawalRequests: 13 },
  { date: "May 3",  dau: 16500, newUsers: 620, revenue: 127800, coinPurchases: 240, adSpend: 0, withdrawalRequests: 15 },
  { date: "May 4",  dau: 15800, newUsers: 540, revenue: 110500, coinPurchases: 208, adSpend: 0, withdrawalRequests: 10 },
  { date: "May 5",  dau: 16100, newUsers: 580, revenue: 119300, coinPurchases: 224, adSpend: 0, withdrawalRequests: 12 },
  { date: "May 6",  dau: 15400, newUsers: 500, revenue: 102400, coinPurchases: 192, adSpend: 0, withdrawalRequests: 9 },
  { date: "May 7",  dau: 14800, newUsers: 470, revenue: 98200,  coinPurchases: 184, adSpend: 0, withdrawalRequests: 7 },
  { date: "May 8",  dau: 15700, newUsers: 530, revenue: 115000, coinPurchases: 216, adSpend: 3500, withdrawalRequests: 11 },
  { date: "May 9",  dau: 16300, newUsers: 590, revenue: 128700, coinPurchases: 242, adSpend: 1500, withdrawalRequests: 13 },
  { date: "May 10", dau: 17100, newUsers: 650, revenue: 139400, coinPurchases: 262, adSpend: 300,  withdrawalRequests: 14 },
  { date: "May 11", dau: 17500, newUsers: 710, revenue: 151200, coinPurchases: 284, adSpend: 300,  withdrawalRequests: 17 },
  { date: "May 12", dau: 16900, newUsers: 640, revenue: 136800, coinPurchases: 257, adSpend: 300,  withdrawalRequests: 12 },
  { date: "May 13", dau: 18200, newUsers: 820, revenue: 168400, coinPurchases: 316, adSpend: 300,  withdrawalRequests: 18 },
  { date: "May 14", dau: 18900, newUsers: 890, revenue: 182100, coinPurchases: 342, adSpend: 0,   withdrawalRequests: 20 },
  { date: "May 15", dau: 19500, newUsers: 950, revenue: 195000, coinPurchases: 366, adSpend: 500,  withdrawalRequests: 22 },
  { date: "May 16", dau: 20100, newUsers: 1020, revenue: 210400, coinPurchases: 395, adSpend: 500,  withdrawalRequests: 25 },
  { date: "May 17", dau: 19800, newUsers: 980, revenue: 203200, coinPurchases: 382, adSpend: 500,  withdrawalRequests: 23 },
  { date: "May 18", dau: 19200, newUsers: 870, revenue: 187600, coinPurchases: 353, adSpend: 0,   withdrawalRequests: 19 },
  { date: "May 19", dau: 18800, newUsers: 840, revenue: 178900, coinPurchases: 336, adSpend: 500,  withdrawalRequests: 21 },
  { date: "May 20", dau: 19600, newUsers: 920, revenue: 195800, coinPurchases: 368, adSpend: 500,  withdrawalRequests: 24 },
  { date: "May 21", dau: 20500, newUsers: 1050, revenue: 215000, coinPurchases: 404, adSpend: 400, withdrawalRequests: 26 },
  { date: "May 22", dau: 21200, newUsers: 1120, revenue: 228700, coinPurchases: 430, adSpend: 100,  withdrawalRequests: 28 },
  { date: "May 23", dau: 22400, newUsers: 1240, revenue: 251200, coinPurchases: 472, adSpend: 0,   withdrawalRequests: 31 },
];

// ── Support Tickets ────────────────────────────────────
export type SupportTicketStatus = "open" | "in_progress" | "resolved" | "escalated" | "closed";
export type SupportPriority = "low" | "medium" | "high" | "critical";

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  category: string;
  subject: string;
  message: string;
  priority: SupportPriority;
  status: SupportTicketStatus;
  createdAt: string;
  lastUpdated: string;
  assignedTo?: string;
  resolution?: string;
  messages: { from: "user" | "agent"; text: string; time: string }[];
}

export const SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "st1",
    userId: "u3",
    userName: "Vihaan Singh",
    userPhone: "+91 9876543212",
    category: "Coin Issue",
    subject: "Coins not credited after recharge",
    message: "I paid ₹399 for 1000 coins via UPI but my wallet still shows 0 coins. Payment ID: pay_ABC123.",
    priority: "high",
    status: "in_progress",
    createdAt: "2024-05-22T09:15:00Z",
    lastUpdated: "2024-05-22T14:30:00Z",
    assignedTo: "Rohit K",
    messages: [
      { from: "user", text: "I paid ₹399 for 1000 coins via UPI but my wallet still shows 0 coins. Payment ID: pay_ABC123.", time: "2024-05-22 09:15" },
      { from: "agent", text: "Thank you for reaching out. We have located your payment and are verifying it with Razorpay. Please allow 2 hours.", time: "2024-05-22 11:00" },
      { from: "agent", text: "Your payment has been confirmed. 1000 coins have been credited to your wallet. Apologies for the delay.", time: "2024-05-22 14:30" },
    ],
  },
  {
    id: "st2",
    userId: "u12",
    userName: "Kavya Nair",
    userPhone: "+91 9876543221",
    category: "Account",
    subject: "Account suspended without reason",
    message: "My account was suspended this morning. I have not violated any community guidelines. Please review urgently.",
    priority: "critical",
    status: "escalated",
    createdAt: "2024-05-22T08:00:00Z",
    lastUpdated: "2024-05-22T16:00:00Z",
    assignedTo: "Super Admin",
    messages: [
      { from: "user", text: "My account was suspended this morning. I have not violated any community guidelines. Please review urgently.", time: "2024-05-22 08:00" },
      { from: "agent", text: "We are reviewing your account activity. This may take up to 24 hours. We appreciate your patience.", time: "2024-05-22 10:30" },
    ],
  },
  {
    id: "st3",
    userId: "u7",
    userName: "Sai Kumar",
    userPhone: "+91 9876543216",
    category: "Harassment",
    subject: "User sending abusive messages",
    message: "User u23 is sending me threatening messages in chat. I have blocked them but they created a new account. Screenshots attached.",
    priority: "high",
    status: "in_progress",
    createdAt: "2024-05-21T18:45:00Z",
    lastUpdated: "2024-05-21T20:00:00Z",
    assignedTo: "Meera S",
    messages: [
      { from: "user", text: "User u23 is sending me threatening messages in chat. I have blocked them but they created a new account. Screenshots attached.", time: "2024-05-21 18:45" },
      { from: "agent", text: "We take harassment reports very seriously. We have temporarily restricted the reported account and are investigating. Your safety is our priority.", time: "2024-05-21 20:00" },
    ],
  },
  {
    id: "st4",
    userId: "u15",
    userName: "Rahul Tiwari",
    userPhone: "+91 9876543224",
    category: "KYC",
    subject: "KYC rejection reason unclear",
    message: "My Aadhaar was rejected but the reason says 'image unclear'. I uploaded a 4K photo. Can someone explain what exactly is wrong?",
    priority: "medium",
    status: "open",
    createdAt: "2024-05-22T12:00:00Z",
    lastUpdated: "2024-05-22T12:00:00Z",
    messages: [
      { from: "user", text: "My Aadhaar was rejected but the reason says 'image unclear'. I uploaded a 4K photo. Can someone explain what exactly is wrong?", time: "2024-05-22 12:00" },
    ],
  },
  {
    id: "st5",
    userId: "u9",
    userName: "Krishna Iyer",
    userPhone: "+91 9876543218",
    category: "Withdrawal",
    subject: "Withdrawal pending for 7 days",
    message: "I requested withdrawal of ₹12,000 on 15 May. Status still shows 'Pending'. My bank details are correct. Please process.",
    priority: "medium",
    status: "resolved",
    createdAt: "2024-05-15T10:00:00Z",
    lastUpdated: "2024-05-22T09:00:00Z",
    assignedTo: "Rohit K",
    resolution: "Processed via NEFT on 22 May. User confirmed receipt.",
    messages: [
      { from: "user", text: "I requested withdrawal of ₹12,000 on 15 May. Status still shows 'Pending'. My bank details are correct. Please process.", time: "2024-05-15 10:00" },
      { from: "agent", text: "We have flagged this to the finance team. The batch is scheduled for processing on 21 May.", time: "2024-05-17 14:00" },
      { from: "agent", text: "Your withdrawal has been processed. Ref: NEFT-20240522-0087. Amount should reflect within 24 hours.", time: "2024-05-22 09:00" },
      { from: "user", text: "Received! Thank you for resolving this.", time: "2024-05-22 11:30" },
    ],
  },
  {
    id: "st6",
    userId: "u20",
    userName: "Natasha Roy",
    userPhone: "+91 9876543229",
    category: "App Bug",
    subject: "App crashes on opening reels tab",
    message: "Since yesterday, the app crashes every time I tap the Reels tab. I reinstalled but same issue. Samsung Galaxy S23, Android 14.",
    priority: "high",
    status: "in_progress",
    createdAt: "2024-05-21T09:30:00Z",
    lastUpdated: "2024-05-21T15:00:00Z",
    assignedTo: "Dev Team",
    messages: [
      { from: "user", text: "Since yesterday, the app crashes every time I tap the Reels tab. I reinstalled but same issue. Samsung Galaxy S23, Android 14.", time: "2024-05-21 09:30" },
      { from: "agent", text: "Thank you for the detailed report. We have identified a compatibility issue with Android 14 on Samsung devices. A hotfix is being deployed today.", time: "2024-05-21 15:00" },
    ],
  },
  {
    id: "st7",
    userId: "u5",
    userName: "Arjun Gupta",
    userPhone: "+91 9876543214",
    category: "Refund",
    subject: "Request refund for accidental double recharge",
    message: "I tapped the recharge button twice and was charged ₹3998 instead of ₹1999. I only need one pack. Please refund ₹1999.",
    priority: "medium",
    status: "open",
    createdAt: "2024-05-22T16:00:00Z",
    lastUpdated: "2024-05-22T16:00:00Z",
    messages: [
      { from: "user", text: "I tapped the recharge button twice and was charged ₹3998 instead of ₹1999. I only need one pack. Please refund ₹1999.", time: "2024-05-22 16:00" },
    ],
  },
  {
    id: "st8",
    userId: "u18",
    userName: "Pooja Verma",
    userPhone: "+91 9876543227",
    category: "Feature Request",
    subject: "Add Kannada language support",
    message: "Please add Kannada language option in the app settings. Many of my followers from Karnataka can't read English well.",
    priority: "low",
    status: "closed",
    createdAt: "2024-05-10T11:00:00Z",
    lastUpdated: "2024-05-12T14:00:00Z",
    assignedTo: "Product Team",
    resolution: "Kannada added in v2.3.1 released on 12 May. User notified.",
    messages: [
      { from: "user", text: "Please add Kannada language option in the app settings. Many of my followers from Karnataka can't read English well.", time: "2024-05-10 11:00" },
      { from: "agent", text: "Thank you for the suggestion! We have added Kannada to our Q2 language roadmap.", time: "2024-05-10 16:00" },
      { from: "agent", text: "Kannada language support is now live in app version 2.3.1. Please update and let us know your feedback!", time: "2024-05-12 14:00" },
    ],
  },
];

// ─── Ridhi Coin Management Types ────────────────────────────────────────────

export type CoinPackageConfig = {
  id: string;
  label: string;
  coins: number;
  bonusCoins: number;
  priceInr: number;
  popular: boolean;
  active: boolean;
};

export type CoinValueConfig = {
  inrPerCoin: number;
  coinPerInr: number;
  dailyLoginReward: number;
  referralBonus: number;
  profileBoostCost: number;
  unlockChatCost: number;
  giftHeartCost: number;
  giftRoseCost: number;
  giftDiamondCost: number;
  giftCrownCost: number;
  audioCallCostPerMin: number;
  videoCallCostPerMin: number;
  platformFeePercent: number;
  hostSharePercent: number;
  agentSharePercent: number;
};

export type CoinRequest = {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userCity: string;
  type: "Recharge" | "Bonus" | "Refund" | "Manual Add" | "Complaint" | "Contest Win";
  requestedCoins: number;
  amountInr?: number;
  reason: string;
  requestedAt: string;
  status: "Pending" | "Approved" | "Declined";
  reviewedBy?: string;
  reviewedAt?: string;
  adminNote?: string;
};

export type ManualCoinLog = {
  id: string;
  userId: string;
  userName: string;
  action: "credit" | "debit";
  coins: number;
  reason: string;
  adminName: string;
  createdAt: string;
};

export const DEFAULT_COIN_VALUE_CONFIG: CoinValueConfig = {
  inrPerCoin: 1.00,
  coinPerInr: 1.00,
  dailyLoginReward: 10,
  referralBonus: 50,
  profileBoostCost: 100,
  unlockChatCost: 50,
  giftHeartCost: 5,
  giftRoseCost: 3,
  giftDiamondCost: 200,
  giftCrownCost: 100,
  audioCallCostPerMin: 15,
  videoCallCostPerMin: 40,
  platformFeePercent: 40,
  hostSharePercent: 60,
  agentSharePercent: 0,
};

export const DEFAULT_COIN_PACKAGES: CoinPackageConfig[] = [
  { id: "pkg1", label: "Starter",    coins: 50,    bonusCoins: 0, priceInr: 49,   popular: false, active: true },
  { id: "pkg2", label: "Basic",      coins: 100,   bonusCoins: 0, priceInr: 99,   popular: false, active: true },
  { id: "pkg3", label: "Popular",    coins: 200,   bonusCoins: 0, priceInr: 199,  popular: false, active: true },
  { id: "pkg4", label: "Value",      coins: 500,   bonusCoins: 0, priceInr: 499,  popular: false, active: true },
  { id: "pkg5", label: "Best Value", coins: 1000,  bonusCoins: 0, priceInr: 999,  popular: true,  active: true },
  { id: "pkg6", label: "Premium",    coins: 2000,  bonusCoins: 0, priceInr: 1999, popular: false, active: true },
  { id: "pkg7", label: "Elite",      coins: 5000,  bonusCoins: 0, priceInr: 4999, popular: false, active: true },
];

const REQUEST_REASONS = [
  "Payment successful but coins not credited",
  "Contest winner — bonus coins",
  "Referral campaign reward",
  "Payment gateway refund request",
  "Manual top-up by request",
  "Festival bonus — Diwali reward",
  "Complaint: double-charged",
  "Beta tester bonus",
  "Influencer onboarding package",
  "Correction for failed recharge",
];

export const mockCoinRequests: CoinRequest[] = [
  { id: "cr1",  userId: "u1",  userName: "Aarav Sharma",   userPhone: "+91 9876543210", userCity: "Mumbai",    type: "Recharge",   requestedCoins: 1000, amountInr: 399,  reason: REQUEST_REASONS[0], requestedAt: new Date(Date.now() - 600000).toISOString(),      status: "Pending" },
  { id: "cr2",  userId: "u3",  userName: "Vihaan Singh",   userPhone: "+91 9876543212", userCity: "Delhi",     type: "Bonus",      requestedCoins: 200,  reason: REQUEST_REASONS[1], requestedAt: new Date(Date.now() - 1800000).toISOString(),    status: "Pending" },
  { id: "cr3",  userId: "u5",  userName: "Arjun Gupta",    userPhone: "+91 9876543214", userCity: "Bangalore", type: "Refund",     requestedCoins: 500,  amountInr: 199,  reason: REQUEST_REASONS[6], requestedAt: new Date(Date.now() - 3600000).toISOString(),    status: "Pending" },
  { id: "cr4",  userId: "u7",  userName: "Sai Kumar",      userPhone: "+91 9876543216", userCity: "Chennai",   type: "Contest Win",requestedCoins: 5000, reason: REQUEST_REASONS[2], requestedAt: new Date(Date.now() - 7200000).toISOString(),    status: "Pending" },
  { id: "cr5",  userId: "u2",  userName: "Diya Patel",     userPhone: "+91 9876543211", userCity: "Ahmedabad", type: "Complaint",  requestedCoins: 250,  amountInr: 99,   reason: REQUEST_REASONS[9], requestedAt: new Date(Date.now() - 10800000).toISOString(),   status: "Pending" },
  { id: "cr6",  userId: "u9",  userName: "Krishna Iyer",   userPhone: "+91 9876543218", userCity: "Kochi",     type: "Manual Add", requestedCoins: 100,  reason: REQUEST_REASONS[4], requestedAt: new Date(Date.now() - 14400000).toISOString(),   status: "Pending" },
  { id: "cr7",  userId: "u4",  userName: "Aditi Rao",      userPhone: "+91 9876543213", userCity: "Hyderabad", type: "Bonus",      requestedCoins: 500,  reason: REQUEST_REASONS[5], requestedAt: new Date(Date.now() - 86400000).toISOString(),   status: "Approved", reviewedBy: "Super Admin", reviewedAt: new Date(Date.now() - 80000000).toISOString() },
  { id: "cr8",  userId: "u6",  userName: "Ananya Reddy",   userPhone: "+91 9876543215", userCity: "Hyderabad", type: "Recharge",   requestedCoins: 500,  amountInr: 199,  reason: REQUEST_REASONS[0], requestedAt: new Date(Date.now() - 90000000).toISOString(),   status: "Approved", reviewedBy: "Super Admin", reviewedAt: new Date(Date.now() - 85000000).toISOString() },
  { id: "cr9",  userId: "u8",  userName: "Priya Das",      userPhone: "+91 9876543217", userCity: "Kolkata",   type: "Refund",     requestedCoins: 1000, amountInr: 399,  reason: REQUEST_REASONS[6], requestedAt: new Date(Date.now() - 172800000).toISOString(),  status: "Declined", reviewedBy: "Super Admin", reviewedAt: new Date(Date.now() - 170000000).toISOString(), adminNote: "Insufficient proof of double charge" },
  { id: "cr10", userId: "u10", userName: "Riya Desai",     userPhone: "+91 9876543219", userCity: "Pune",      type: "Contest Win",requestedCoins: 2000, reason: REQUEST_REASONS[7], requestedAt: new Date(Date.now() - 259200000).toISOString(),  status: "Approved", reviewedBy: "Super Admin", reviewedAt: new Date(Date.now() - 255000000).toISOString() },
];

export const mockManualCoinLogs: ManualCoinLog[] = [
  { id: "ml1", userId: "u4",  userName: "Aditi Rao",    action: "credit", coins: 500,  reason: "Festival bonus — Diwali reward",           adminName: "Super Admin", createdAt: new Date(Date.now() - 80000000).toISOString() },
  { id: "ml2", userId: "u6",  userName: "Ananya Reddy", action: "credit", coins: 500,  reason: "Recharge manually credited",               adminName: "Super Admin", createdAt: new Date(Date.now() - 85000000).toISOString() },
  { id: "ml3", userId: "u10", userName: "Riya Desai",   action: "credit", coins: 2000, reason: "Contest winner — Ridhi Diwali Quiz",       adminName: "Super Admin", createdAt: new Date(Date.now() - 255000000).toISOString() },
  { id: "ml4", userId: "u2",  userName: "Diya Patel",   action: "debit",  coins: 200,  reason: "Correction: accidental duplicate credit",  adminName: "Super Admin", createdAt: new Date(Date.now() - 300000000).toISOString() },
  { id: "ml5", userId: "u15", userName: "Aarav Sharma 5",action:"credit", coins: 1000, reason: "Beta tester reward — Phase 2",             adminName: "Super Admin", createdAt: new Date(Date.now() - 350000000).toISOString() },
];

// ─── Coin Withdrawal Requests (Users / Hosts / Agents) ──────────────────────

export type CoinWithdrawal = {
  id: string;
  userId: string;
  userName: string;
  userRole: "User" | "Host" | "Agent";
  userPhone: string;
  userCity: string;
  kycVerified: boolean;
  coinsRequested: number;
  grossAmountInr: number;
  netAmountInr: number;
  method: "UPI" | "Bank";
  upiId?: string;
  bankAccount?: string;
  ifscCode?: string;
  accountHolder?: string;
  bankName?: string;
  requestedAt: string;
  status: "Pending" | "Approved" | "Paid" | "Rejected";
  rejectionReason?: string;
  processedAt?: string;
  txRef?: string;
};

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Kolkata", "Pune", "Kochi", "Ahmedabad", "Jaipur"];
const NAMES  = ["Aarav Sharma", "Diya Patel", "Vihaan Singh", "Aditi Rao", "Arjun Gupta", "Ananya Reddy", "Sai Kumar", "Priya Das", "Krishna Iyer", "Riya Desai",
                "Rohan Mehta", "Kavya Nair", "Dev Joshi", "Pooja Verma", "Rahul Tiwari", "Sneha Pillai", "Aditya Bose", "Meera Shah", "Kiran Reddy", "Natasha Roy"];

function coinWithdrawal(id: string, idx: number, role: "User"|"Host"|"Agent", coins: number, method: "UPI"|"Bank", status: "Pending"|"Approved"|"Paid"|"Rejected", daysAgo: number): CoinWithdrawal {
  const gross = coins * 1.0;
  const net   = gross * 0.8;
  const name  = NAMES[idx % NAMES.length];
  const city  = CITIES[idx % CITIES.length];
  return {
    id, userId: `u${idx + 1}`, userName: name, userRole: role,
    userPhone: `+91 98765${43200 + idx}`, userCity: city, kycVerified: true,
    coinsRequested: coins, grossAmountInr: gross, netAmountInr: net,
    method,
    upiId: method === "UPI" ? `${name.split(" ")[0].toLowerCase()}@upi` : undefined,
    bankAccount: method === "Bank" ? `00${(10000000 + idx * 123457) % 99999999}` : undefined,
    ifscCode: method === "Bank" ? ["SBIN0001234","HDFC0002456","ICIC0003789","AXIS0004012"][idx % 4] : undefined,
    accountHolder: method === "Bank" ? name : undefined,
    bankName: method === "Bank" ? ["State Bank of India","HDFC Bank","ICICI Bank","Axis Bank"][idx % 4] : undefined,
    requestedAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    status,
    processedAt: status !== "Pending" ? new Date(Date.now() - (daysAgo - 1) * 86400000).toISOString() : undefined,
    txRef: status === "Paid" ? `TXN${(100000 + idx * 7919) % 999999}` : undefined,
    rejectionReason: status === "Rejected" ? "KYC documents mismatch" : undefined,
  };
}

export const mockCoinWithdrawals: CoinWithdrawal[] = [
  coinWithdrawal("cw1",  0,  "User",  1000,  "UPI",  "Pending",  0.2),
  coinWithdrawal("cw2",  1,  "Host",  5000,  "Bank", "Pending",  0.5),
  coinWithdrawal("cw3",  2,  "Agent", 10000, "UPI",  "Pending",  1),
  coinWithdrawal("cw4",  3,  "User",  2500,  "UPI",  "Pending",  1),
  coinWithdrawal("cw5",  4,  "Host",  8000,  "Bank", "Pending",  2),
  coinWithdrawal("cw6",  5,  "User",  1500,  "UPI",  "Approved", 3),
  coinWithdrawal("cw7",  6,  "Host",  12000, "Bank", "Approved", 4),
  coinWithdrawal("cw8",  7,  "Agent", 20000, "UPI",  "Approved", 5),
  coinWithdrawal("cw9",  8,  "User",  3000,  "Bank", "Approved", 6),
  coinWithdrawal("cw10", 9,  "Host",  7500,  "UPI",  "Paid",     7),
  coinWithdrawal("cw11", 10, "User",  2000,  "UPI",  "Paid",     8),
  coinWithdrawal("cw12", 11, "Agent", 15000, "Bank", "Paid",     9),
  coinWithdrawal("cw13", 12, "Host",  6000,  "Bank", "Paid",     10),
  coinWithdrawal("cw14", 13, "User",  1000,  "UPI",  "Paid",     11),
  coinWithdrawal("cw15", 14, "Host",  4000,  "Bank", "Rejected", 12),
  coinWithdrawal("cw16", 15, "User",  1200,  "UPI",  "Rejected", 14),
  coinWithdrawal("cw17", 16, "Agent", 8000,  "Bank", "Paid",     15),
  coinWithdrawal("cw18", 17, "User",  2500,  "UPI",  "Pending",  0.3),
  coinWithdrawal("cw19", 18, "Host",  9500,  "Bank", "Approved", 2),
  coinWithdrawal("cw20", 19, "User",  1800,  "UPI",  "Paid",     5),
];
