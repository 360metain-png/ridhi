export type User = { id: string, name: string, avatar: string, phone: string, email: string, city: string, state: string, language: string, joinDate: string, status: "active"|"suspended"|"pending", followers: number, following: number, posts: number, coins: number, reportsReceived: number, isVerified: boolean };
export type Post = { id: string, userId: string, type: "post"|"reel"|"story"|"poll", content: string, mediaUrl: string, likes: number, comments: number, shares: number, reports: number, createdAt: string, status: "active"|"removed"|"flagged" };
export type Community = { id: string, name: string, category: string, members: number, posts: number, language: string, visibility: "public"|"private", status: "active"|"suspended"|"pending", createdAt: string };
export type Transaction = { id: string, userId: string, userName: string, type: "Earned"|"Spent"|"Recharged"|"Gift Sent"|"Gift Received", amount: number, balanceAfter: number, description: string, createdAt: string };
export type WithdrawalRequest = { id: string, creatorId: string, creatorName: string, amount: number, method: "UPI"|"Bank", upiId?: string, bankAccount?: string, requestedAt: string, status: "Pending"|"Approved"|"Rejected"|"Paid" };
export type Campaign = { id: string, name: string, type: string, reach: number, clicks: number, conversions: number, status: "Draft"|"Active"|"Completed", startDate: string, endDate: string };

export const mockUsers: User[] = Array.from({ length: 30 }, (_, i) => ({
  id: `u${i + 1}`,
  name: ["Aarav Sharma", "Diya Patel", "Vihaan Singh", "Aditi Rao", "Arjun Gupta", "Ananya Reddy", "Sai Kumar", "Priya Das", "Krishna Iyer", "Riya Desai"][i % 10] + (i >= 10 ? ` ${i}` : ""),
  avatar: "",
  phone: `+91 98765${43210 + i}`,
  email: `user${i}@example.com`,
  city: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Kolkata", "Pune", "Kochi"][i % 8],
  state: ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Telangana", "West Bengal", "Maharashtra", "Kerala"][i % 8],
  language: ["Hindi", "English", "Marathi", "Tamil", "Telugu", "Bengali", "Malayalam"][i % 7],
  joinDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
  status: ["active", "suspended", "pending"][Math.floor(Math.random() * 3)] as any,
  followers: Math.floor(Math.random() * 5000),
  following: Math.floor(Math.random() * 1000),
  posts: Math.floor(Math.random() * 200),
  coins: Math.floor(Math.random() * 1000),
  reportsReceived: Math.floor(Math.random() * 5),
  isVerified: Math.random() > 0.8
}));

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

export const mockCampaigns: Campaign[] = Array.from({ length: 15 }, (_, i) => ({
  id: `camp${i + 1}`,
  name: `Diwali Offer ${i + 1}`,
  type: "Push Notification",
  reach: Math.floor(Math.random() * 100000),
  clicks: Math.floor(Math.random() * 10000),
  conversions: Math.floor(Math.random() * 1000),
  status: ["Draft", "Active", "Completed"][Math.floor(Math.random() * 3)] as any,
  startDate: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString().split('T')[0],
  endDate: new Date(Date.now() + Math.floor(Math.random() * 1000000000)).toISOString().split('T')[0]
}));

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
  inrPerCoin: 0.80,
  coinPerInr: 1.25,
  dailyLoginReward: 10,
  referralBonus: 50,
  profileBoostCost: 100,
  unlockChatCost: 50,
  giftHeartCost: 20,
  giftRoseCost: 10,
  giftDiamondCost: 200,
  giftCrownCost: 500,
  audioCallCostPerMin: 12,
  videoCallCostPerMin: 30,
  platformFeePercent: 50,
  hostSharePercent: 45,
  agentSharePercent: 5,
};

export const DEFAULT_COIN_PACKAGES: CoinPackageConfig[] = [
  { id: "pkg1", label: "Starter",    coins: 60,    bonusCoins: 0, priceInr: 49,   popular: false, active: true },
  { id: "pkg2", label: "Basic",      coins: 130,   bonusCoins: 0, priceInr: 99,   popular: false, active: true },
  { id: "pkg3", label: "Popular",    coins: 280,   bonusCoins: 0, priceInr: 199,  popular: false, active: true },
  { id: "pkg4", label: "Value",      coins: 750,   bonusCoins: 0, priceInr: 499,  popular: false, active: true },
  { id: "pkg5", label: "Best Value", coins: 1600,  bonusCoins: 0, priceInr: 999,  popular: true,  active: true },
  { id: "pkg6", label: "Premium",    coins: 3500,  bonusCoins: 0, priceInr: 1999, popular: false, active: true },
  { id: "pkg7", label: "Elite",      coins: 10000, bonusCoins: 0, priceInr: 4999, popular: false, active: true },
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
  const gross = coins * 0.5;
  const net   = gross * 0.7;
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
