// ============================================================
// CRM & Ticketing Mock Data
// ============================================================

export type TicketStatus = "open" | "in_progress" | "pending" | "resolved" | "closed" | "escalated" | "spam";
export type TicketPriority = "low" | "medium" | "high" | "urgent" | "critical";
export type TicketCategory =
  | "general" | "account" | "billing" | "technical" | "content_moderation"
  | "harassment" | "feature_request" | "bug_report" | "payment" | "kyc"
  | "host_issue" | "agent_issue" | "creator_issue" | "dating_safety"
  | "data_privacy" | "refund" | "app_crash";

export type MockTicket = {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  subcategory?: string;
  requesterType: "user" | "host" | "agent" | "creator" | "guest" | "internal";
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  assignedTo?: string;
  assignedTeam: "support" | "billing" | "technical" | "moderation" | "legal" | "executive";
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  slaBreached: boolean;
  satisfactionRating?: number;
  source: "app" | "email" | "phone" | "whatsapp" | "web_portal" | "internal" | "social_media" | "play_store_review";
  tags: string[];
  sentiment: "positive" | "neutral" | "negative" | "angry" | "frustrated";
  reopenCount: number;
  comments: MockComment[];
  internalNotes: { note: string; by: string; at: string }[];
};

export type MockComment = {
  id: string;
  authorName: string;
  authorRole: "agent" | "admin" | "super_admin" | "user" | "system" | "bot";
  body: string;
  isInternal: boolean;
  createdAt: string;
  actionType?: string;
};

export type MockContact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "user" | "host" | "agent" | "creator" | "business" | "vip";
  city: string;
  state: string;
  status: "active" | "inactive" | "blocked" | "churned" | "prospect";
  lifecycleStage: "lead" | "trial" | "active" | "engaged" | "loyal" | "churned" | "reactivated";
  segment: "standard" | "premium" | "enterprise" | "influencer" | "power_user" | "at_risk";
  totalTickets: number;
  openTickets: number;
  avgSatisfaction?: number;
  totalRevenue: number;
  subscriptionPlan?: string;
  supportTier: "standard" | "priority" | "vip" | "dedicated";
  assignedAgent?: string;
  lastContactAt?: string;
  tags: string[];
  notes: { note: string; by: string; at: string; category: string }[];
};

export type MockMacro = {
  id: string;
  name: string;
  body: string;
  category: string;
  tags: string[];
  useCount: number;
  isActive: boolean;
};

const TICKET_SUBJECTS: Record<TicketCategory, string[]> = {
  general: ["Help with my account", "How to change profile photo", "Need guidance on app features", "Forgot password"],
  account: ["Account hacked", "Can't login", "Delete my account", "Change phone number", "Email verification failed"],
  billing: ["Wrong charge on my card", "Duplicate payment", "Invoice not received", "Refund request", "Payment failed"],
  technical: ["App keeps crashing", "Videos not loading", "Chat messages not sending", "Reels lagging", "Push notifications not working"],
  content_moderation: ["My post was removed unfairly", "Copyright strike", "Someone stole my content", "Report fake account", "Content appeal"],
  harassment: ["Being harassed by user", "Inappropriate messages", "Cyberbullying report", "Stalking concern", "Threat received"],
  feature_request: ["Add dark mode", "Need video call", "Group chat feature", "Better matching", "Audio rooms on web"],
  bug_report: ["Login screen blank", "Profile not updating", "Coins not credited", "Reels audio desync", "Crash on match screen"],
  payment: ["UPI payment failed", "Razorpay error", "Coins not received after recharge", "Wrong amount deducted", "Payment stuck"],
  kyc: ["KYC rejected without reason", "Documents not uploading", "KYC taking too long", "Wrong KYC status", "Need to re-submit KYC"],
  host_issue: ["Host dashboard not loading", "Can't start live stream", "Payout not received", "Host level not updated", "Ban appeal"],
  agent_issue: ["Agent commission missing", "Can't access agent panel", "Lead assignment issue", "Agent payment delayed", "Downgrade request"],
  creator_issue: ["Creator earnings wrong", "Monetization disabled", "Content claimed", "Brand deal issue", "Creator tools broken"],
  dating_safety: ["Fake dating profile", "Catfishing report", "Unsafe meeting request", "Inappropriate photo", "Dating scam"],
  data_privacy: ["Data deletion request", "GDPR request", "Want to download my data", "Who can see my data", "Privacy settings broken"],
  refund: ["Refund for subscription", "Coin purchase refund", "Full refund request", "Partial refund", "Refund not processed"],
  app_crash: ["Crash on startup", "Crash during reels", "Crash after update", "App freezes", "Black screen on open"],
};

const AGENTS = ["Priya Sharma", "Rohit Verma", "Ananya Iyer", "Sai Kumar", "Meera Patel", "Dev Joshi", "Kavya Nair", "Rahul Tiwari"];
const TEAMS: MockTicket["assignedTeam"][] = ["support", "billing", "technical", "moderation", "legal", "executive"];
const NAMES = ["Aarav Sharma", "Diya Patel", "Vihaan Singh", "Aditi Rao", "Arjun Gupta", "Ananya Reddy", "Sai Kumar", "Priya Das", "Krishna Iyer", "Riya Desai",
  "Rohan Mehta", "Kavya Nair", "Dev Joshi", "Pooja Verma", "Rahul Tiwari", "Sneha Pillai", "Aditya Bose", "Meera Shah", "Kiran Reddy", "Natasha Roy"];

const CATEGORIES: TicketCategory[] = [
  "technical", "billing", "account", "content_moderation", "harassment", "bug_report",
  "payment", "kyc", "host_issue", "general", "feature_request", "dating_safety",
  "refund", "app_crash", "agent_issue", "creator_issue", "data_privacy",
];

function randomDate(daysBack: number): string {
  return new Date(Date.now() - Math.random() * daysBack * 86400000).toISOString();
}

// ── Generate 120 tickets ───────────────────────────────────────────

export const mockTickets: MockTicket[] = Array.from({ length: 120 }, (_, i) => {
  const cat = CATEGORIES[i % CATEGORIES.length];
  const subjects = TICKET_SUBJECTS[cat];
  const subject = subjects[i % subjects.length];
  const statusWeights: TicketStatus[] = ["open", "open", "in_progress", "in_progress", "pending", "resolved", "resolved", "resolved", "closed", "closed", "escalated"];
  const status = statusWeights[i % statusWeights.length];
  const priorityWeights: TicketPriority[] = ["low", "low", "medium", "medium", "medium", "high", "high", "urgent", "critical"];
  const priority = priorityWeights[i % priorityWeights.length];
  const requesterType: MockTicket["requesterType"] = ["user", "user", "host", "agent", "creator", "guest"][i % 6] as MockTicket["requesterType"];
  const assigned = status !== "open" ? AGENTS[i % AGENTS.length] : undefined;
  const created = randomDate(30);
  const updated = status === "open" || status === "in_progress" ? created : randomDate(5);
  const resolved = ["resolved", "closed"].includes(status) ? randomDate(2) : undefined;
  const closed = status === "closed" ? randomDate(1) : undefined;

  const comments: MockComment[] = [];
  if (status !== "open") {
    comments.push({
      id: `c-${i}-1`,
      authorName: assigned || "System",
      authorRole: assigned ? "agent" : "system",
      body: `Thank you for reaching out. We're looking into your issue regarding "${subject}" and will get back to you shortly.`,
      isInternal: false,
      createdAt: new Date(new Date(created).getTime() + 3600000).toISOString(),
      actionType: "status_change",
    });
    if (["resolved", "closed", "escalated"].includes(status)) {
      comments.push({
        id: `c-${i}-2`,
        authorName: assigned || "Super Admin",
        authorRole: assigned ? "agent" : "super_admin",
        body: status === "escalated"
          ? `This issue has been escalated to the ${TEAMS[i % TEAMS.length]} team for further review.`
          : `This issue has been resolved. ${["refund", "payment", "billing"].includes(cat) ? "Your refund will be processed within 3-5 business days." : "Please let us know if you need any further assistance."}`,
        isInternal: false,
        createdAt: resolved || updated,
        actionType: status === "escalated" ? "escalation" : "status_change",
      });
    }
  }

  return {
    id: `tk-${i + 1}`,
    ticketNumber: `RID-2024-${(100000 + i).toString().slice(1)}`,
    subject,
    description: `User reported: ${subject}. This is a detailed description of the issue with additional context about what happened, when, and what the user expected.`,
    status,
    priority,
    category: cat,
    subcategory: undefined,
    requesterType,
    requesterName: NAMES[i % NAMES.length],
    requesterEmail: `user${i}@gmail.com`,
    requesterPhone: `+91 XXXXX${"XXXXX"}`,
    assignedTo: assigned,
    assignedTeam: TEAMS[i % TEAMS.length],
    createdAt: created,
    updatedAt: updated,
    resolvedAt: resolved,
    closedAt: closed,
    slaBreached: priority === "critical" && status === "open",
    satisfactionRating: ["resolved", "closed"].includes(status) ? Math.floor(Math.random() * 3) + 3 : undefined,
    source: ["app", "app", "email", "phone", "whatsapp", "web_portal", "internal"][i % 7] as MockTicket["source"],
    tags: [cat, requesterType, priority],
    sentiment: ["negative", "negative", "frustrated", "neutral", "neutral", "positive"][i % 6] as MockTicket["sentiment"],
    reopenCount: status === "open" && Math.random() < 0.1 ? 1 : 0,
    comments,
    internalNotes: Math.random() < 0.3 ? [{ note: "VIP user - handle with care", by: "Super Admin", at: created }] : [],
  };
});

// ── Contacts ───────────────────────────────────────────────────────

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Kolkata", "Pune", "Kochi", "Ahmedabad", "Jaipur"];
const STATES = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Telangana", "West Bengal", "Maharashtra", "Kerala", "Gujarat", "Rajasthan"];

export const mockContacts: MockContact[] = NAMES.map((name, i) => {
  const type: MockContact["type"] = ["user", "user", "host", "agent", "creator", "business", "vip"][i % 7] as MockContact["type"];
  const openCount = mockTickets.filter((t) => t.requesterName === name && ["open", "in_progress", "pending"].includes(t.status)).length;
  const totalCount = mockTickets.filter((t) => t.requesterName === name).length;
  const resolved = mockTickets.filter((t) => t.requesterName === name && ["resolved", "closed"].includes(t.status));
  const avgSat = resolved.length ? Math.round(resolved.reduce((acc, t) => acc + (t.satisfactionRating || 0), 0) / resolved.length) : undefined;

  return {
    id: `cont-${i + 1}`,
    name,
    email: `user${i}@gmail.com`,
    phone: `+91 XXXXX${String(43210 + i).slice(-5)}`,
    type,
    city: CITIES[i % CITIES.length],
    state: STATES[i % STATES.length],
    status: ["active", "active", "active", "inactive", "inactive", "churned", "inactive"][i % 7] as MockContact["status"],
    lifecycleStage: ["active", "engaged", "engaged", "loyal", "trial", "churned", "reactivated"][i % 7] as MockContact["lifecycleStage"],
    segment: ["standard", "standard", "premium", "power_user", "influencer", "at_risk", "enterprise"][i % 7] as MockContact["segment"],
    totalTickets: totalCount,
    openTickets: openCount,
    avgSatisfaction: avgSat,
    totalRevenue: Math.floor(Math.random() * 50000),
    subscriptionPlan: ["free", "silver", "gold", "platinum", "diamond"][i % 5] as string,
    supportTier: ["standard", "standard", "priority", "vip", "dedicated"][i % 5] as MockContact["supportTier"],
    assignedAgent: openCount > 0 ? AGENTS[i % AGENTS.length] : undefined,
    lastContactAt: totalCount > 0 ? mockTickets.filter((t) => t.requesterName === name).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]?.updatedAt : undefined,
    tags: [type, CITIES[i % CITIES.length]],
    notes: Math.random() < 0.2 ? [{ note: "High-value user, prioritize responses", by: "Admin", at: randomDate(10), category: "important" }] : [],
  };
});

// ── Macros ───────────────────────────────────────────────────────────

export const mockMacros: MockMacro[] = [
  { id: "m1", name: "Greeting", body: "Hello {{name}}, thank you for contacting Ridhi Support. How can we help you today?", category: "greeting", tags: ["general"], useCount: 342, isActive: true },
  { id: "m2", name: "Apology - Delay", body: "Dear {{name}}, we sincerely apologize for the delay in resolving your issue. Our team is working on it and we'll update you within 24 hours.", category: "apology", tags: ["delay"], useCount: 156, isActive: true },
  { id: "m3", name: "Refund Processing", body: "Hi {{name}}, your refund of ₹{{amount}} has been initiated and will be credited to your original payment method within 5-7 business days.", category: "refund", tags: ["payment", "billing"], useCount: 89, isActive: true },
  { id: "m4", name: "KYC Guide", body: "Please upload your PAN card and Aadhaar card in the KYC section. Ensure documents are clear and in JPG/PNG format under 5MB.", category: "kyc", tags: ["verification"], useCount: 67, isActive: true },
  { id: "m5", name: "App Crash - Basic", body: "Sorry for the inconvenience. Please try: 1) Clear app cache, 2) Restart your phone, 3) Update to latest version. If issue persists, let us know your device model.", category: "technical", tags: ["crash", "bug"], useCount: 234, isActive: true },
  { id: "m6", name: "Escalation", body: "This issue has been escalated to our {{team}} team. A senior agent will contact you within 4 hours. Ticket: {{ticketNumber}}", category: "escalation", tags: ["urgent"], useCount: 45, isActive: true },
  { id: "m7", name: "Account Recovery", body: "To recover your account, please verify: 1) Registered phone number, 2) Last successful login date, 3) Recent activity. We'll guide you through the reset process.", category: "account", tags: ["security"], useCount: 78, isActive: true },
  { id: "m8", name: "Content Appeal", body: "We reviewed your appeal for the removed content. Our moderation team will re-evaluate within 24 hours and notify you of the decision.", category: "moderation", tags: ["content"], useCount: 56, isActive: true },
  { id: "m9", name: "Payment Failed", body: "Your payment didn't go through. Common reasons: insufficient balance, bank server down, or UPI limit exceeded. Please retry after 30 minutes or use a different method.", category: "payment", tags: ["billing"], useCount: 112, isActive: true },
  { id: "m10", name: "Host Onboarding", body: "Welcome to Ridhi Host program! Complete your KYC, set up your streaming setup, and review our community guidelines. Your host manager will contact you within 2 days.", category: "host", tags: ["onboarding"], useCount: 34, isActive: true },
];

// ── Agent Performance (30 days) ────────────────────────────────────

export const mockAgentPerformance = AGENTS.map((name, i) => {
  const resolved = 15 + Math.floor(Math.random() * 40);
  const assigned = resolved + Math.floor(Math.random() * 10);
  return {
    agentId: `agent-${i + 1}`,
    agentName: name,
    ticketsAssigned: assigned,
    ticketsResolved: resolved,
    ticketsEscalated: Math.floor(Math.random() * 5),
    ticketsReopened: Math.floor(Math.random() * 3),
    avgResolutionTime: 120 + Math.floor(Math.random() * 300), // minutes
    avgFirstResponseTime: 15 + Math.floor(Math.random() * 60), // minutes
    avgSatisfaction: 3 + Math.floor(Math.random() * 3),
    slaCompliance: 85 + Math.floor(Math.random() * 15),
    commentsAdded: resolved * 2 + Math.floor(Math.random() * 10),
    macrosUsed: Math.floor(Math.random() * 50),
    qualityScore: 70 + Math.floor(Math.random() * 30),
  };
});

// ── Dashboard aggregations ────────────────────────────────────

export function getTicketStats() {
  const byStatus: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const byTeam: Record<string, number> = {};
  const slaBreached = mockTickets.filter((t) => t.slaBreached).length;
  const avgSat = mockTickets.filter((t) => t.satisfactionRating).reduce((a, t) => a + (t.satisfactionRating || 0), 0) / mockTickets.filter((t) => t.satisfactionRating).length || 0;

  mockTickets.forEach((t) => {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
    byCategory[t.category] = (byCategory[t.category] || 0) + 1;
    bySource[t.source] = (bySource[t.source] || 0) + 1;
    byTeam[t.assignedTeam] = (byTeam[t.assignedTeam] || 0) + 1;
  });

  return {
    total: mockTickets.length,
    open: byStatus["open"] || 0,
    inProgress: byStatus["in_progress"] || 0,
    pending: byStatus["pending"] || 0,
    resolved: byStatus["resolved"] || 0,
    closed: byStatus["closed"] || 0,
    escalated: byStatus["escalated"] || 0,
    slaBreached,
    avgSatisfaction: Number(avgSat.toFixed(1)),
    byStatus: Object.entries(byStatus).map(([k, v]) => ({ status: k, count: v })),
    byPriority: Object.entries(byPriority).map(([k, v]) => ({ priority: k, count: v })),
    byCategory: Object.entries(byCategory).map(([k, v]) => ({ category: k, count: v })).sort((a, b) => b.count - a.count),
    bySource: Object.entries(bySource).map(([k, v]) => ({ source: k, count: v })),
    byTeam: Object.entries(byTeam).map(([k, v]) => ({ team: k, count: v })),
  };
}

export function getTicketTrends() {
  const trends: Record<string, { date: string; created: number; resolved: number; open: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
    trends[d] = { date: d, created: 0, resolved: 0, open: 0 };
  }
  mockTickets.forEach((t) => {
    const d = t.createdAt.split("T")[0];
    if (trends[d]) trends[d].created++;
    if (t.resolvedAt) {
      const rd = t.resolvedAt.split("T")[0];
      if (trends[rd]) trends[rd].resolved++;
    }
  });
  return Object.values(trends);
}

export function getContactSegments() {
  const segments: Record<string, number> = {};
  mockContacts.forEach((c) => {
    segments[c.segment] = (segments[c.segment] || 0) + 1;
  });
  return Object.entries(segments).map(([name, value]) => ({ name, value }));
}

export function getContactLifecycle() {
  const stages: Record<string, number> = {};
  mockContacts.forEach((c) => {
    stages[c.lifecycleStage] = (stages[c.lifecycleStage] || 0) + 1;
  });
  return Object.entries(stages).map(([name, value]) => ({ name, value }));
}
