// Financial data for Ridhi — Income Tax, GST, P&L, Balance Sheet
// GSTIN: 29AABCR1234Z1Z | SAC 998311 (Online Advertising Services)

export interface RevenueLine {
  month: string;
  monthLabel: string;
  financialYear: string;
  coinRecharges: number;
  subscriptions: number;
  adRevenue: number;
  giftRevenue: number;
  commercialBanner: number;
  specialAds: number;
  totalRevenue: number;
  gstCollected: number;
  netRevenue: number;
}

export interface ExpenseLine {
  month: string;
  monthLabel: string;
  financialYear: string;
  creatorPayouts: number;
  hostPayouts: number;
  userWithdrawals: number;
  refunds: number;
  paymentGatewayFees: number;
  serverCosts: number;
  gstPaid: number;
  marketing: number;
  employeeSalaries: number;
  officeRent: number;
  legalCompliance: number;
  totalExpenses: number;
}

export interface PLStatement {
  month: string;
  monthLabel: string;
  financialYear: string;
  grossRevenue: number;
  netRevenueAfterGST: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  taxProvision: number;
  retainedEarnings: number;
}

export interface GSTSummary {
  month: string;
  monthLabel: string;
  financialYear: string;
  gstOnAdPayments: number;
  gstOnPlatformFees: number;
  gstOnSubscriptions: number;
  gstOnCoins: number;
  gstOnGifts: number;
  totalOutputGST: number;
  totalInputGST: number;
  gstPayable: number;
  gstITC: number;
  igst: number;
  cgst: number;
  sgst: number;
}

export interface ITRSchedule {
  line: string;
  description: string;
  amount: number;
  notes: string;
}

export interface WithdrawalDetail {
  id: string;
  userName: string;
  userRole: "User" | "Host" | "Creator" | "Agent";
  amount: number;
  platformFee: number;
  gstOnFee: number;
  netPayout: number;
  status: "Pending" | "Approved" | "Paid" | "Rejected";
  paidAt: string;
  upiId?: string;
  bankAccount?: string;
}

export const GSTIN = "29AABCR1234Z1Z";
export const SAC_CODE = "998311";
export const HSN_COIN = "8523";
export const HSN_GIFT = "9503";
export const COMPANY_NAME = "Ridhi Social Technologies Pvt Ltd";
export const PAN = "AABCR1234Z";
export const COIN_RATE = 1.00;

// FY 2024-25 (Apr 2024 - Mar 2025) — for ITR filing
const FY2425 = "2024-25";
// FY 2025-26 (Apr 2025 - Mar 2026) — current
const FY2526 = "2025-26";

const months = [
  "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar",
];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Revenue data for FY 2025-26
export const REVENUE_DATA: RevenueLine[] = months.map((m, i) => {
  const coinRecharges = rand(180000, 320000);
  const subscriptions = rand(45000, 95000);
  const adRevenue = rand(28000, 55000);
  const giftRevenue = rand(15000, 35000);
  const commercialBanner = rand(12000, 28000);
  const specialAds = rand(8000, 18000);
  const totalRevenue = coinRecharges + subscriptions + adRevenue + giftRevenue + commercialBanner + specialAds;
  const gstCollected = Math.round(totalRevenue * 0.18);
  const netRevenue = totalRevenue - gstCollected;
  return {
    month: `2025-${String(i + 1).padStart(2, "0")}`,
    monthLabel: m,
    financialYear: FY2526,
    coinRecharges,
    subscriptions,
    adRevenue,
    giftRevenue,
    commercialBanner,
    specialAds,
    totalRevenue,
    gstCollected,
    netRevenue,
  };
});

// Expense data for FY 2025-26
export const EXPENSE_DATA: ExpenseLine[] = months.map((m, i) => {
  const creatorPayouts = rand(45000, 95000);
  const hostPayouts = rand(25000, 55000);
  const userWithdrawals = rand(15000, 35000);
  const refunds = rand(3000, 8000);
  const paymentGatewayFees = rand(8000, 18000);
  const serverCosts = rand(25000, 45000);
  const gstPaid = rand(5000, 12000);
  const marketing = rand(15000, 35000);
  const employeeSalaries = rand(180000, 280000);
  const officeRent = rand(35000, 55000);
  const legalCompliance = rand(8000, 18000);
  const totalExpenses = creatorPayouts + hostPayouts + userWithdrawals + refunds + paymentGatewayFees + serverCosts + gstPaid + marketing + employeeSalaries + officeRent + legalCompliance;
  return {
    month: `2025-${String(i + 1).padStart(2, "0")}`,
    monthLabel: m,
    financialYear: FY2526,
    creatorPayouts,
    hostPayouts,
    userWithdrawals,
    refunds,
    paymentGatewayFees,
    serverCosts,
    gstPaid,
    marketing,
    employeeSalaries,
    officeRent,
    legalCompliance,
    totalExpenses,
  };
});

// P&L for FY 2025-26
export const PL_DATA: PLStatement[] = REVENUE_DATA.map((r, i) => {
  const e = EXPENSE_DATA[i];
  const grossProfit = r.netRevenue - e.totalExpenses;
  const netProfit = grossProfit;
  const taxProvision = Math.max(0, Math.round(netProfit * 0.22)); // ~22% effective corporate tax
  const retainedEarnings = netProfit - taxProvision;
  return {
    month: r.month,
    monthLabel: r.monthLabel,
    financialYear: FY2526,
    grossRevenue: r.totalRevenue,
    netRevenueAfterGST: r.netRevenue,
    totalExpenses: e.totalExpenses,
    grossProfit,
    netProfit,
    profitMargin: Math.round((grossProfit / r.totalRevenue) * 1000) / 10,
    taxProvision,
    retainedEarnings,
  };
});

// GST Summary for FY 2025-26
export const GST_DATA: GSTSummary[] = months.map((m, i) => {
  const r = REVENUE_DATA[i];
  const gstOnAdPayments = Math.round(r.adRevenue * 0.18);
  const gstOnPlatformFees = Math.round(r.coinRecharges * 0.18);
  const gstOnSubscriptions = Math.round(r.subscriptions * 0.18);
  const gstOnCoins = Math.round(r.coinRecharges * 0.18);
  const gstOnGifts = Math.round(r.giftRevenue * 0.18);
  const totalOutputGST = gstOnAdPayments + gstOnPlatformFees + gstOnSubscriptions + gstOnCoins + gstOnGifts;
  const totalInputGST = rand(8000, 18000);
  const gstPayable = Math.max(0, totalOutputGST - totalInputGST);
  const gstITC = totalInputGST;
  const igst = Math.round(gstPayable * 0.5);
  const cgst = Math.round(gstPayable * 0.25);
  const sgst = Math.round(gstPayable * 0.25);
  return {
    month: `2025-${String(i + 1).padStart(2, "0")}`,
    monthLabel: m,
    financialYear: FY2526,
    gstOnAdPayments,
    gstOnPlatformFees,
    gstOnSubscriptions,
    gstOnCoins,
    gstOnGifts,
    totalOutputGST,
    totalInputGST,
    gstPayable,
    gstITC,
    igst,
    cgst,
    sgst,
  };
});

// ITR-3 Schedule for FY 2025-26
export function getITRSchedule(fy: string): ITRSchedule[] {
  const revenue = REVENUE_DATA.filter((r) => r.financialYear === fy);
  const expenses = EXPENSE_DATA.filter((e) => e.financialYear === fy);
  const totalRevenue = revenue.reduce((s, r) => s + r.totalRevenue, 0);
  const totalGST = revenue.reduce((s, r) => s + r.gstCollected, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.totalExpenses, 0);
  const grossProfit = totalRevenue - totalGST - totalExpenses;
  const tax = Math.max(0, Math.round(grossProfit * 0.22));
  return [
    { line: "A1", description: "Gross Revenue from Operations", amount: totalRevenue, notes: "Coin recharges + Subscriptions + Ads + Gifts + Banners" },
    { line: "A2", description: "Less: GST Collected (Output Tax)", amount: -totalGST, notes: "18% GST on all revenue streams" },
    { line: "A3", description: "Net Revenue (Excl. GST)", amount: totalRevenue - totalGST, notes: "Revenue after GST" },
    { line: "B1", description: "Cost of Operations (Payouts)", amount: -revenue.reduce((s, r) => s + expenses.find((e) => e.month === r.month)!.creatorPayouts + expenses.find((e) => e.month === r.month)!.hostPayouts + expenses.find((e) => e.month === r.month)!.userWithdrawals, 0), notes: "Creator, Host & User payouts" },
    { line: "B2", description: "Payment Gateway Charges", amount: -expenses.reduce((s, e) => s + e.paymentGatewayFees, 0), notes: "Razorpay + UPI charges" },
    { line: "B3", description: "Server & Infrastructure", amount: -expenses.reduce((s, e) => s + e.serverCosts, 0), notes: "AWS, CDN, DB hosting" },
    { line: "B4", description: "Employee Salaries & Benefits", amount: -expenses.reduce((s, e) => s + e.employeeSalaries, 0), notes: "All FTE salaries" },
    { line: "B5", description: "Marketing & Advertising", amount: -expenses.reduce((s, e) => s + e.marketing, 0), notes: "Digital marketing, influencer spend" },
    { line: "B6", description: "Office Rent & Utilities", amount: -expenses.reduce((s, e) => s + e.officeRent, 0), notes: "Bangalore office" },
    { line: "B7", description: "Refunds & Chargebacks", amount: -expenses.reduce((s, e) => s + e.refunds, 0), notes: "User refunds" },
    { line: "B8", description: "Legal & Compliance", amount: -expenses.reduce((s, e) => s + e.legalCompliance, 0), notes: "GST filing, ROC, legal fees" },
    { line: "B9", description: "GST Paid (Input Tax Credit)", amount: -expenses.reduce((s, e) => s + e.gstPaid, 0), notes: "ITC on expenses" },
    { line: "C", description: "Total Expenses", amount: -totalExpenses, notes: "Sum of all expense heads" },
    { line: "D", description: "Profit Before Tax (PBT)", amount: grossProfit, notes: "Net Revenue - Total Expenses" },
    { line: "E", description: "Income Tax Provision (22%)", amount: -tax, notes: "Corporate tax @ 22% (Section 115BAA)" },
    { line: "F", description: "Net Profit After Tax", amount: grossProfit - tax, notes: "Retained earnings" },
  ];
}

// Withdrawal details with GST breakdown
export const WITHDRAWAL_DETAILS: WithdrawalDetail[] = Array.from({ length: 24 }, (_, i) => {
  const amount = rand(1000, 50000);
  const platformFee = Math.round(amount * 0.30);
  const gstOnFee = Math.round(platformFee * 0.18);
  const netPayout = amount - platformFee - gstOnFee;
  const roles: WithdrawalDetail["userRole"][] = ["User", "Host", "Creator", "Agent"];
  const statuses: WithdrawalDetail["status"][] = ["Pending", "Approved", "Paid", "Rejected"];
  return {
    id: `W-${String(i + 1).padStart(3, "0")}`,
    userName: ["Priya Sharma", "Rohit Verma", "Ananya Singh", "Karan Mehta", "Deepika Nair", "Arjun Reddy", "Sneha Patel", "Vikram Kumar", "Meera Krishnan", "Ravi Shankar", "Aisha Khan", "Nikhil Gupta", "Tanvi Rao", "Siddharth Jain", "Kavya Reddy", "Raj Malhotra", "Isha Kapoor", "Dev Khanna", "Pooja Menon", "Aman Yadav", "Sunita Das", "Kunal Mehta", "Neha Patel", "Rajesh B"][i],
    userRole: roles[i % 4],
    amount,
    platformFee,
    gstOnFee,
    netPayout,
    status: statuses[i % 4],
    paidAt: `2025-0${rand(1, 6)}-${rand(1, 28).toString().padStart(2, "0")}`,
    upiId: `user${i + 1}@okaxis`,
    bankAccount: `****${String(1000 + i).slice(-4)}`,
  };
});

// Aggregation helpers
export function getAggregatedRevenue(fy: string) {
  const data = REVENUE_DATA.filter((r) => r.financialYear === fy);
  return {
    total: data.reduce((s, r) => s + r.totalRevenue, 0),
    coinRecharges: data.reduce((s, r) => s + r.coinRecharges, 0),
    subscriptions: data.reduce((s, r) => s + r.subscriptions, 0),
    adRevenue: data.reduce((s, r) => s + r.adRevenue, 0),
    giftRevenue: data.reduce((s, r) => s + r.giftRevenue, 0),
    commercialBanner: data.reduce((s, r) => s + r.commercialBanner, 0),
    specialAds: data.reduce((s, r) => s + r.specialAds, 0),
    gstCollected: data.reduce((s, r) => s + r.gstCollected, 0),
  };
}

export function getAggregatedExpenses(fy: string) {
  const data = EXPENSE_DATA.filter((e) => e.financialYear === fy);
  return {
    total: data.reduce((s, e) => s + e.totalExpenses, 0),
    creatorPayouts: data.reduce((s, e) => s + e.creatorPayouts, 0),
    hostPayouts: data.reduce((s, e) => s + e.hostPayouts, 0),
    userWithdrawals: data.reduce((s, e) => s + e.userWithdrawals, 0),
    refunds: data.reduce((s, e) => s + e.refunds, 0),
    paymentGatewayFees: data.reduce((s, e) => s + e.paymentGatewayFees, 0),
    serverCosts: data.reduce((s, e) => s + e.serverCosts, 0),
    gstPaid: data.reduce((s, e) => s + e.gstPaid, 0),
    marketing: data.reduce((s, e) => s + e.marketing, 0),
    employeeSalaries: data.reduce((s, e) => s + e.employeeSalaries, 0),
    officeRent: data.reduce((s, e) => s + e.officeRent, 0),
    legalCompliance: data.reduce((s, e) => s + e.legalCompliance, 0),
  };
}

export function getAggregatedGST(fy: string) {
  const data = GST_DATA.filter((g) => g.financialYear === fy);
  return {
    totalOutputGST: data.reduce((s, g) => s + g.totalOutputGST, 0),
    totalInputGST: data.reduce((s, g) => s + g.totalInputGST, 0),
    gstPayable: data.reduce((s, g) => s + g.gstPayable, 0),
    gstITC: data.reduce((s, g) => s + g.gstITC, 0),
    igst: data.reduce((s, g) => s + g.igst, 0),
    cgst: data.reduce((s, g) => s + g.cgst, 0),
    sgst: data.reduce((s, g) => s + g.sgst, 0),
  };
}

export function getAggregatedPL(fy: string) {
  const data = PL_DATA.filter((p) => p.financialYear === fy);
  return {
    grossRevenue: data.reduce((s, p) => s + p.grossRevenue, 0),
    netRevenue: data.reduce((s, p) => s + p.netRevenueAfterGST, 0),
    totalExpenses: data.reduce((s, p) => s + p.totalExpenses, 0),
    grossProfit: data.reduce((s, p) => s + p.grossProfit, 0),
    netProfit: data.reduce((s, p) => s + p.netProfit, 0),
    taxProvision: data.reduce((s, p) => s + p.taxProvision, 0),
    retainedEarnings: data.reduce((s, p) => s + p.retainedEarnings, 0),
    avgProfitMargin: data.reduce((s, p) => s + p.profitMargin, 0) / data.length,
  };
}
