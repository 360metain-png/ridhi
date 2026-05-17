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
