import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download, FileText, Users, IndianRupee, ShieldAlert, Star,
  Briefcase, Coins, Megaphone, Activity, ScanFace, Radio,
  BarChart3, Crown, Phone, Zap, Package, CheckCircle2, Clock,
  FileSpreadsheet, Globe, FileDown,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ── CSV generator ──────────────────────────────────────────────────────────
function toCSV(rows: Record<string, string | number>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape  = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

function downloadCSV(filename: string, rows: Record<string, string | number>[]) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── PDF generator ──────────────────────────────────────────────────────────
function downloadPDF(filename: string, title: string, rows: Record<string, string | number>[]) {
  if (!rows.length) return;
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(123, 47, 190);
  doc.rect(0, 0, pageWidth, 48, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Ridhi", 28, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Admin Dashboard Report", 28 + doc.getTextWidth("Ridhi") + 10, 30);

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(title, 28, 74);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 28, 74, { align: "right" });

  // Table
  const headers = Object.keys(rows[0]);
  const body = rows.map((r) => headers.map((h) => String(r[h])));
  autoTable(doc, {
    head: [headers.map((h) => h.replace(/_/g, " ").toUpperCase())],
    body,
    startY: 88,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 3, overflow: "linebreak" },
    headStyles: { fillColor: [123, 47, 190], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 250, 252] },
    margin: { left: 28, right: 28 },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 28, doc.internal.pageSize.getHeight() - 18, { align: "right" });
    doc.text("Ridhi Admin Dashboard  Confidential", 28, doc.internal.pageSize.getHeight() - 18);
  }

  doc.save(filename);
}

// ── Mock data generators ───────────────────────────────────────────────────
const CITIES   = ["Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Pune","Kolkata","Kochi","Jaipur","Surat"];
const GENDERS  = ["Male","Female","Other"];
const STATUSES = ["Active","Suspended","Banned","Under Review"];
const PLANS    = ["Silver","Gold","Platinum","Diamond Elite","None"];

function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randOf<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomDate(daysBack = 365) {
  const d = new Date(Date.now() - randInt(0, daysBack) * 86400000);
  return d.toISOString().split("T")[0];
}

function genUsers(n = 500): Record<string, string | number>[] {
  return Array.from({ length: n }, (_, i) => ({
    user_id:       `USR${String(i + 1001).padStart(6, "0")}`,
    name:          `User ${i + 1}`,
    phone:         `+91${randInt(7000000000, 9999999999)}`,
    city:          randOf(CITIES),
    gender:        randOf(GENDERS),
    age:           randInt(18, 45),
    joined_date:   randomDate(730),
    status:        randOf(STATUSES),
    vip_plan:      randOf(PLANS),
    coins_balance: randInt(0, 50000),
    posts:         randInt(0, 300),
    followers:     randInt(0, 100000),
    following:     randInt(0, 5000),
    is_host:       Math.random() > 0.8 ? "Yes" : "No",
    is_kyc:        Math.random() > 0.3 ? "Verified" : "Pending",
    total_spent_inr: randInt(0, 50000),
  }));
}

function genRevenue(n = 90): Record<string, string | number>[] {
  return Array.from({ length: n }, (_, i) => {
    const date = new Date(Date.now() - (n - i) * 86400000).toISOString().split("T")[0];
    return {
      date,
      coin_recharges_inr: randInt(80000, 200000),
      subscriptions_inr:  randInt(30000, 80000),
      ad_revenue_inr:     randInt(10000, 40000),
      creator_fund_inr:   randInt(5000, 20000),
      total_revenue_inr:  randInt(130000, 340000),
      transactions:       randInt(200, 1200),
      new_subscribers:    randInt(50, 400),
      mrr_inr:            randInt(3500000, 5000000),
    };
  });
}

function genPayouts(n = 200): Record<string, string | number>[] {
  return Array.from({ length: n }, (_, i) => ({
    payout_id:    `PAY${String(i + 1).padStart(6, "0")}`,
    host_id:      `HST${randInt(1000, 9999)}`,
    host_name:    `Host ${i + 1}`,
    upi_id:       `host${i}@upi`,
    amount_inr:   randInt(500, 50000),
    coins_redeemed: randInt(1000, 100000),
    status:       randOf(["Processed","Pending","Failed","On Hold"]),
    requested_on: randomDate(60),
    processed_on: randomDate(30),
    bank:         randOf(["HDFC","SBI","ICICI","Axis","Kotak","Yes Bank"]),
  }));
}

function genHosts(n = 300): Record<string, string | number>[] {
  return Array.from({ length: n }, (_, i) => ({
    host_id:        `HST${String(i + 1001).padStart(5, "0")}`,
    name:           `Host ${i + 1}`,
    city:           randOf(CITIES),
    level:          randOf(["Bronze","Silver","Gold","Platinum","Diamond"]),
    agent_id:       `AGT${randInt(100, 999)}`,
    joined_date:    randomDate(365),
    status:         randOf(["Active","Suspended","Under Review"]),
    kyc_status:     randOf(["Verified","Pending","Rejected"]),
    total_coins_earned: randInt(5000, 500000),
    total_live_hours:   randInt(10, 2000),
    live_sessions:      randInt(5, 500),
    followers:          randInt(100, 200000),
    total_payout_inr:   randInt(1000, 200000),
    payout_pending_inr: randInt(0, 50000),
  }));
}

function genAgents(n = 80): Record<string, string | number>[] {
  return Array.from({ length: n }, (_, i) => ({
    agent_id:        `AGT${String(i + 100).padStart(4, "0")}`,
    name:            `Agent ${i + 1}`,
    email:           `agent${i}@ridhi.app`,
    city:            randOf(CITIES),
    joined_date:     randomDate(500),
    status:          randOf(["Active","Inactive","Suspended"]),
    hosts_managed:   randInt(3, 30),
    total_team_coins: randInt(100000, 5000000),
    commission_inr:  randInt(5000, 100000),
    rating:          (Math.random() * 2 + 3).toFixed(1),
  }));
}

function genKYC(n = 150): Record<string, string | number>[] {
  return Array.from({ length: n }, (_, i) => ({
    kyc_id:       `KYC${String(i + 1).padStart(5, "0")}`,
    user_id:      `USR${randInt(100000, 999999)}`,
    name:         `Applicant ${i + 1}`,
    doc_type:     randOf(["Aadhaar","PAN","Passport","Voter ID","DL"]),
    submitted_on: randomDate(90),
    reviewed_on:  randomDate(30),
    status:       randOf(["Approved","Rejected","Pending","Under Review"]),
    reviewer:     randOf(["Admin Sneha","Admin Raj","Super Admin"]),
    rejection_reason: Math.random() > 0.7 ? randOf(["Blurry image","Name mismatch","Expired document"]) : "",
  }));
}

function genContent(n = 300): Record<string, string | number>[] {
  return Array.from({ length: n }, (_, i) => ({
    content_id:   `CNT${String(i + 1).padStart(6, "0")}`,
    type:         randOf(["Post","Reel","Story","Live","Comment","Poll"]),
    user_id:      `USR${randInt(100000, 999999)}`,
    reported_on:  randomDate(30),
    report_count: randInt(1, 50),
    category:     randOf(["Spam","Violence","Nudity","Hate Speech","Misinformation","Scam"]),
    status:       randOf(["Removed","Approved","Under Review","Escalated"]),
    reviewed_by:  randOf(["Admin Sneha","Admin Raj","Auto-AI","Super Admin"]),
    action:       randOf(["Content Removed","User Warned","User Suspended","No Action","Escalated"]),
  }));
}

function genCoins(n = 200): Record<string, string | number>[] {
  return Array.from({ length: n }, (_, i) => ({
    txn_id:       `COIN${String(i + 1).padStart(7, "0")}`,
    user_id:      `USR${randInt(100000, 999999)}`,
    txn_type:     randOf(["Recharge","Gift","Gift Received","Daily Reward","Referral","Subscription Bonus","Spent-Live"]),
    coins:        randInt(10, 50000),
    amount_inr:   randInt(0, 5000),
    pack:         randOf(["₹49 / 100c","₹99 / 250c","₹499 / 1500c","₹999 / 3500c","₹4999 / 20000c","N/A"]),
    date:         randomDate(60),
    payment_mode: randOf(["UPI","Card","Net Banking","Wallet","Free"]),
    status:       randOf(["Success","Failed","Refunded"]),
  }));
}

function genSubscriptions(n = 150): Record<string, string | number>[] {
  return Array.from({ length: n }, (_, i) => ({
    sub_id:        `SUB${String(i + 1).padStart(6, "0")}`,
    user_id:       `USR${randInt(100000, 999999)}`,
    plan:          randOf(["Silver Weekly","Silver Monthly","Gold Monthly","Gold Yearly","Platinum Monthly","Diamond Elite Yearly"]),
    start_date:    randomDate(180),
    end_date:      randomDate(30),
    amount_inr:    randInt(49, 7999),
    status:        randOf(["Active","Expired","Cancelled","Paused"]),
    auto_renew:    Math.random() > 0.4 ? "Yes" : "No",
    payment_mode:  randOf(["UPI","Card","Net Banking"]),
  }));
}

function genLiveStreams(n = 200): Record<string, string | number>[] {
  return Array.from({ length: n }, (_, i) => ({
    session_id:   `LIVE${String(i + 1).padStart(6, "0")}`,
    host_id:      `HST${randInt(1000, 9999)}`,
    host_name:    `Host ${i + 1}`,
    started_at:   randomDate(30),
    duration_min: randInt(5, 240),
    peak_viewers: randInt(1, 5000),
    total_viewers: randInt(1, 8000),
    gifts_received_coins: randInt(0, 100000),
    status:       randOf(["Completed","Banned","Reported","Ongoing"]),
    flags:        randOf(["None","Violence","Nudity","Spam","Other"]),
  }));
}

function genAdmins(n = 20): Record<string, string | number>[] {
  return Array.from({ length: n }, (_, i) => ({
    admin_id:    `ADM${String(i + 1).padStart(4, "0")}`,
    name:        `Admin ${i + 1}`,
    email:       `admin${i}@ridhi.app`,
    role:        randOf(["Admin","Admin"]),
    joined_date: randomDate(400),
    status:      randOf(["Active","Inactive"]),
    actions_today: randInt(0, 200),
    actions_total: randInt(100, 50000),
    modules:     randOf(["Content, KYC, Users","Hosts, Agents, Calls","Content, Communities","KYC, Users"]),
    last_login:  randomDate(7),
  }));
}

function genPromos(n = 100): Record<string, string | number>[] {
  return Array.from({ length: n }, (_, i) => ({
    code:          `RIDHI${randInt(100, 9999)}`,
    type:          randOf(["Coin Bonus","Subscription Discount","Free Coins","Double Coins"]),
    discount:      randOf(["10%","20%","50%","100 coins","500 coins"]),
    used_count:    randInt(0, 5000),
    max_uses:      randInt(100, 10000),
    valid_from:    randomDate(90),
    valid_until:   randomDate(30),
    status:        randOf(["Active","Expired","Paused"]),
    created_by:    "Super Admin",
  }));
}

function genPlatformSummary(): Record<string, string | number>[] {
  return [
    { metric: "Total Users",                value: "1,02,47,831",    category: "Users"   },
    { metric: "Active Users (DAU)",          value: "2,18,445",       category: "Users"   },
    { metric: "New Registrations (30d)",     value: "3,84,291",       category: "Users"   },
    { metric: "Total Hosts",                 value: "84,220",         category: "Creators" },
    { metric: "Active Hosts (30d)",          value: "21,843",         category: "Creators" },
    { metric: "Total Agents",                value: "3,841",          category: "Creators" },
    { metric: "Live Streams (30d)",          value: "1,24,882",       category: "Content"  },
    { metric: "Posts Created (30d)",         value: "8,42,310",       category: "Content"  },
    { metric: "Content Reported (30d)",      value: "12,441",         category: "Content"  },
    { metric: "KYC Approved (30d)",          value: "4,281",          category: "KYC"      },
    { metric: "KYC Pending",                 value: "284",            category: "KYC"      },
    { metric: "Coin Recharges (30d) ₹",      value: "4,82,14,200",    category: "Finance"  },
    { metric: "Subscription Revenue (30d) ₹",value: "1,84,20,100",   category: "Finance"  },
    { metric: "Ad Revenue (30d) ₹",          value: "74,81,000",      category: "Finance"  },
    { metric: "Total Payouts (30d) ₹",       value: "2,10,44,800",    category: "Finance"  },
    { metric: "Active Subscriptions",        value: "4,82,221",       category: "Finance"  },
    { metric: "Promo Codes Used (30d)",      value: "28,441",         category: "Marketing"},
    { metric: "Referrals (30d)",             value: "84,220",         category: "Marketing"},
    { metric: "App Rating (Android)",        value: "4.4",            category: "Platform" },
    { metric: "Generated At",               value: new Date().toISOString(), category: "Meta" },
  ];
}

// ── Report catalogue ───────────────────────────────────────────────────────
type ReportFormat = "CSV" | "PDF";

interface Report {
  id:       string;
  title:    string;
  desc:     string;
  rows:     string;
  format:   ReportFormat;
  icon:     React.ComponentType<{ className?: string }>;
  color:    string;
  generate: () => Record<string, string | number>[];
  filename: () => string;
}

const today = () => new Date().toISOString().split("T")[0];

const REPORTS: { section: string; icon: React.ComponentType<{ className?: string }>; reports: Report[] }[] = [
  {
    section: "Platform Overview",
    icon: Globe,
    reports: [
      {
        id: "platform-summary", title: "Platform Summary Snapshot",
        desc: "All key metrics across users, creators, finance, content and marketing in one file.",
        rows: "~20 metrics", format: "CSV",
        icon: FileSpreadsheet, color: "from-purple-600 to-pink-500",
        generate: genPlatformSummary,
        filename: () => `ridhi_platform_summary_${today()}.csv`,
      },
    ],
  },
  {
    section: "Users",
    icon: Users,
    reports: [
      {
        id: "users-all", title: "All Users Export",
        desc: "Full user list with status, city, VIP plan, KYC, coin balance, followers.",
        rows: "500 rows (sample)", format: "CSV",
        icon: Users, color: "from-blue-600 to-cyan-500",
        generate: () => genUsers(500),
        filename: () => `ridhi_users_export_${today()}.csv`,
      },
      {
        id: "users-kyc", title: "KYC Verification Report",
        desc: "All KYC submissions with doc type, status, reviewer, and rejection reasons.",
        rows: "150 rows (sample)", format: "CSV",
        icon: ScanFace, color: "from-teal-600 to-emerald-500",
        generate: () => genKYC(150),
        filename: () => `ridhi_kyc_report_${today()}.csv`,
      },
    ],
  },
  {
    section: "Finance",
    icon: IndianRupee,
    reports: [
      {
        id: "revenue-daily", title: "Daily Revenue Report (90 days)",
        desc: "Revenue split by coins, subscriptions, ads & creator fund over 90 days.",
        rows: "90 rows", format: "CSV",
        icon: BarChart3, color: "from-green-600 to-emerald-500",
        generate: () => genRevenue(90),
        filename: () => `ridhi_revenue_90d_${today()}.csv`,
      },
      {
        id: "payouts", title: "Host Payouts Report",
        desc: "All payout transactions with host ID, amount, UPI, status, and bank details.",
        rows: "200 rows (sample)", format: "CSV",
        icon: IndianRupee, color: "from-yellow-500 to-amber-600",
        generate: () => genPayouts(200),
        filename: () => `ridhi_payouts_${today()}.csv`,
      },
      {
        id: "coins-txn", title: "Coin Transactions Log",
        desc: "Full coin transaction history — recharges, gifts, rewards, spends.",
        rows: "200 rows (sample)", format: "CSV",
        icon: Coins, color: "from-orange-500 to-yellow-500",
        generate: () => genCoins(200),
        filename: () => `ridhi_coin_transactions_${today()}.csv`,
      },
      {
        id: "subscriptions", title: "Subscriptions Report",
        desc: "All subscriptions — plan, user, billing cycle, status, renewal.",
        rows: "150 rows (sample)", format: "CSV",
        icon: Crown, color: "from-violet-600 to-purple-500",
        generate: () => genSubscriptions(150),
        filename: () => `ridhi_subscriptions_${today()}.csv`,
      },
    ],
  },
  {
    section: "Creators",
    icon: Star,
    reports: [
      {
        id: "hosts", title: "Host Performance Report",
        desc: "All hosts — level, agent, earnings, live hours, payout status, KYC.",
        rows: "300 rows (sample)", format: "CSV",
        icon: Star, color: "from-pink-600 to-rose-500",
        generate: () => genHosts(300),
        filename: () => `ridhi_hosts_${today()}.csv`,
      },
      {
        id: "agents", title: "Agent Performance Report",
        desc: "All agents — hosts managed, team coin earnings, commission, rating.",
        rows: "80 rows (sample)", format: "CSV",
        icon: Briefcase, color: "from-indigo-600 to-blue-500",
        generate: () => genAgents(80),
        filename: () => `ridhi_agents_${today()}.csv`,
      },
      {
        id: "live-streams", title: "Live Stream Sessions Report",
        desc: "All live sessions — host, duration, viewers, gifts, flags, status.",
        rows: "200 rows (sample)", format: "CSV",
        icon: Radio, color: "from-red-600 to-pink-500",
        generate: () => genLiveStreams(200),
        filename: () => `ridhi_live_streams_${today()}.csv`,
      },
    ],
  },
  {
    section: "Content & Safety",
    icon: ShieldAlert,
    reports: [
      {
        id: "content-mod", title: "Content Moderation Log",
        desc: "All reported content — type, category, action taken, reviewer.",
        rows: "300 rows (sample)", format: "CSV",
        icon: ShieldAlert, color: "from-red-600 to-orange-500",
        generate: () => genContent(300),
        filename: () => `ridhi_content_moderation_${today()}.csv`,
      },
    ],
  },
  {
    section: "Marketing",
    icon: Megaphone,
    reports: [
      {
        id: "promo-codes", title: "Promo Codes Report",
        desc: "All promo codes — type, discount, usage count, validity, status.",
        rows: "100 rows (sample)", format: "CSV",
        icon: Zap, color: "from-fuchsia-600 to-pink-500",
        generate: () => genPromos(100),
        filename: () => `ridhi_promo_codes_${today()}.csv`,
      },
    ],
  },
  {
    section: "Admin & Access",
    icon: Activity,
    reports: [
      {
        id: "admins", title: "Admin Users Report",
        desc: "All admin accounts — role, modules, actions today/total, last login.",
        rows: "20 rows (sample)", format: "CSV",
        icon: Activity, color: "from-slate-600 to-gray-500",
        generate: () => genAdmins(20),
        filename: () => `ridhi_admins_${today()}.csv`,
      },
    ],
  },
];

// ── Page ───────────────────────────────────────────────────────────────────
export default function DownloadsPage() {
  const [downloading, setDownloading] = useState<Record<string, boolean>>({});
  const [done,        setDone]        = useState<Record<string, boolean>>({});

  function handleDownload(report: Report, format: ReportFormat = "CSV") {
    if (downloading[report.id]) return;
    setDownloading((p) => ({ ...p, [report.id]: true }));
    setTimeout(() => {
      const rows = report.generate();
      if (format === "PDF") {
        downloadPDF(report.filename().replace(".csv", ".pdf"), report.title, rows);
      } else {
        downloadCSV(report.filename(), rows);
      }
      setDownloading((p) => ({ ...p, [report.id]: false }));
      setDone((p) => ({ ...p, [report.id]: true }));
      setTimeout(() => setDone((p) => ({ ...p, [report.id]: false })), 3000);
    }, 600);
  }

  function handleDownloadAll(format: ReportFormat = "CSV") {
    REPORTS.forEach((section) => {
      section.reports.forEach((report, i) => {
        setTimeout(() => {
          const rows = report.generate();
          if (format === "PDF") {
            downloadPDF(report.filename().replace(".csv", ".pdf"), report.title, rows);
          } else {
            downloadCSV(report.filename(), rows);
          }
        }, i * 300);
      });
    });
  }

  const totalReports = REPORTS.reduce((acc, s) => acc + s.reports.length, 0);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Download className="w-6 h-6 text-primary" /> Downloads & Reports
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Export any platform data as CSV or PDF — users, finance, creators, content, marketing, admins.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() => handleDownloadAll("PDF")}
            className="gap-2 h-9 text-xs"
          >
            <FileDown className="w-4 h-4" />
            Download All as PDF ({totalReports} files)
          </Button>
          <Button
            onClick={() => handleDownloadAll("CSV")}
            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90 h-9 text-xs"
          >
            <Package className="w-4 h-4" />
            Download All as CSV ({totalReports} files)
          </Button>
        </div>
      </div>

      {/* Info strip */}
      <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-purple-50 border border-purple-200">
        {[
          { icon: FileText,      label: `${totalReports} Report Types` },
          { icon: FileSpreadsheet, label: "CSV Format"              },
          { icon: FileDown,       label: "PDF Format"              },
          { icon: CheckCircle2,  label: "SA-Only Access"             },
          { icon: Clock,         label: "Real-time Data"             },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-sm text-purple-700 font-medium">
            <Icon className="w-4 h-4 text-purple-500" />
            {label}
          </div>
        ))}
      </div>

      {/* Report sections */}
      {REPORTS.map(({ section, icon: SIcon, reports }) => (
        <div key={section} className="space-y-3">
          <div className="flex items-center gap-2">
            <SIcon className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{section}</h3>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {reports.map((report) => {
              const Icon       = report.icon;
              const isLoading  = downloading[report.id];
              const isDone     = done[report.id];
              return (
                <Card
                  key={report.id}
                  className="hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className={`h-1 w-full bg-gradient-to-r ${report.color}`} />
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${report.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="leading-snug">{report.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">{report.desc}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] px-2">{report.rows}</Badge>
                        <Badge variant="outline" className="text-[10px] px-2 text-green-700 border-green-300 bg-green-50">
                          <FileSpreadsheet className="w-2.5 h-2.5 mr-1" /> CSV
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-2 text-rose-700 border-rose-300 bg-rose-50">
                          <FileDown className="w-2.5 h-2.5 mr-1" /> PDF
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(report, "PDF")}
                          disabled={isLoading}
                          className="h-7 text-xs gap-1 px-2"
                        >
                          <FileDown className="w-3 h-3" /> PDF
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDownload(report, "CSV")}
                          disabled={isLoading}
                          className={`h-7 text-xs gap-1.5 transition-all ${
                            isDone
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-primary hover:bg-primary/90 text-white"
                          }`}
                        >
                          {isDone ? (
                            <><CheckCircle2 className="w-3 h-3" /> Downloaded</>
                          ) : isLoading ? (
                            <><Clock className="w-3 h-3 animate-spin" /> Preparing…</>
                          ) : (
                            <><Download className="w-3 h-3" /> CSV</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Footer note */}
      <p className="text-xs text-muted-foreground text-center pb-4">
        All exports use representative sample data. Connect to the live API to stream production records. Data is generated fresh at the time of download.
      </p>
    </div>
  );
}
