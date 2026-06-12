import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie,
} from "recharts";
import {
  Download, FileText, IndianRupee, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  ShieldCheck, Building, Receipt, Calculator, Wallet, ChevronRight,
  CreditCard, Globe, ReceiptIndianRupee, Landmark, Banknote,
  Coins, Crown, Megaphone, Gift, Users, Star, Activity,
} from "lucide-react";
import {
  REVENUE_DATA, EXPENSE_DATA, PL_DATA, GST_DATA, WITHDRAWAL_DETAILS,
  GSTIN, SAC_CODE, COMPANY_NAME, PAN,
  getAggregatedRevenue, getAggregatedExpenses, getAggregatedGST, getAggregatedPL, getITRSchedule,
} from "@/data/financial-mock";

const PURPLE = "#7B2FBE";
const MAGENTA = "#E91E8C";
const TEAL = "#06B6D4";
const EMERALD = "#10B981";
const AMBER = "#F59E0B";
const ROSE = "#F43F5E";
const INDIGO = "#6366F1";

const FY = "2025-26";

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function fmtK(n: number) {
  return `₹${(n / 1000).toFixed(1)}K`;
}

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadJSON(filename: string, data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function FinancialStatementsPage() {
  const [tab, setTab] = useState("overview");
  const revenue = getAggregatedRevenue(FY);
  const expenses = getAggregatedExpenses(FY);
  const gst = getAggregatedGST(FY);
  const pl = getAggregatedPL(FY);
  const itr = getITRSchedule(FY);

  const revenueBreakdown = [
    { name: "Coin Recharges", value: revenue.coinRecharges, color: PURPLE, icon: Coins },
    { name: "Subscriptions", value: revenue.subscriptions, color: MAGENTA, icon: Crown },
    { name: "Ad Revenue", value: revenue.adRevenue, color: TEAL, icon: Megaphone },
    { name: "Gift Revenue", value: revenue.giftRevenue, color: AMBER, icon: Gift },
    { name: "Commercial Banners", value: revenue.commercialBanner, color: EMERALD, icon: Globe },
    { name: "Special Ads", value: revenue.specialAds, color: INDIGO, icon: Star },
  ];

  const expenseBreakdown = [
    { name: "Employee Salaries", value: expenses.employeeSalaries, color: PURPLE },
    { name: "Office Rent", value: expenses.officeRent, color: MAGENTA },
    { name: "Creator Payouts", value: expenses.creatorPayouts, color: TEAL },
    { name: "Host Payouts", value: expenses.hostPayouts, color: AMBER },
    { name: "User Withdrawals", value: expenses.userWithdrawals, color: EMERALD },
    { name: "Server Costs", value: expenses.serverCosts, color: ROSE },
    { name: "Marketing", value: expenses.marketing, color: INDIGO },
    { name: "Payment Gateway", value: expenses.paymentGatewayFees, color: "#94A3B8" },
    { name: "Refunds", value: expenses.refunds, color: "#64748B" },
    { name: "Legal & GST", value: expenses.gstPaid + expenses.legalCompliance, color: "#475569" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-500" />
            Financial Statements
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Income Tax, GST, P&L, and full financial structure for FY {FY}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="gap-1">
              <Building className="w-3 h-3" />
              {COMPANY_NAME}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <ShieldCheck className="w-3 h-3" />
              GSTIN: {GSTIN}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Receipt className="w-3 h-3" />
              SAC: {SAC_CODE}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <FileText className="w-3 h-3" />
              PAN: {PAN}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => {
            const data = { revenue: REVENUE_DATA, expenses: EXPENSE_DATA, pl: PL_DATA, gst: GST_DATA, itr, withdrawals: WITHDRAWAL_DETAILS };
            downloadJSON(`ridhi-financial-statements-${FY}.json`, data);
          }}>
            <Download className="w-4 h-4" />
            JSON
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => {
            const rows = [
              ["Line", "Description", "Amount", "Notes"],
              ...itr.map((r) => [r.line, r.description, r.amount.toString(), r.notes]),
            ];
            downloadCSV(`ridhi-itr-schedule-${FY}.csv`, rows);
          }}>
            <Download className="w-4 h-4" />
            ITR CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => {
            const rows = [
              ["Month", "Gross Revenue", "Net Revenue", "Total Expenses", "Gross Profit", "Net Profit", "Profit Margin %", "Tax Provision", "Retained Earnings"],
              ...PL_DATA.map((p) => [p.monthLabel, p.grossRevenue.toString(), p.netRevenueAfterGST.toString(), p.totalExpenses.toString(), p.grossProfit.toString(), p.netProfit.toString(), p.profitMargin.toString(), p.taxProvision.toString(), p.retainedEarnings.toString()]),
            ];
            downloadCSV(`ridhi-pnl-${FY}.csv`, rows);
          }}>
            <Download className="w-4 h-4" />
            P&L CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <KpiCard icon={IndianRupee} label="Gross Revenue" value={fmt(revenue.total)} trend={8.2} color={PURPLE} />
        <KpiCard icon={Calculator} label="GST Collected" value={fmt(revenue.gstCollected)} trend={7.5} color={MAGENTA} />
        <KpiCard icon={Receipt} label="Net Revenue" value={fmt(revenue.total - revenue.gstCollected)} trend={8.2} color={TEAL} />
        <KpiCard icon={Wallet} label="Total Expenses" value={fmt(expenses.total)} trend={-3.1} color={ROSE} />
        <KpiCard icon={TrendingUp} label="Net Profit" value={fmt(pl.netProfit)} trend={12.4} color={EMERALD} />
        <KpiCard icon={Activity} label="Profit Margin" value={`${pl.avgProfitMargin}%`} trend={4.2} color={AMBER} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="pnl">P&L</TabsTrigger>
          <TabsTrigger value="gst">GST</TabsTrigger>
          <TabsTrigger value="itr">Income Tax</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Revenue vs Expenses Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={PL_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="monthLabel" tick={{ fill: "#94A3B8", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} tickFormatter={(v) => fmtK(v)} />
                      <Tooltip formatter={(v: number) => fmt(v)} />
                      <Legend />
                      <Area type="monotone" dataKey="grossRevenue" name="Gross Revenue" stroke={PURPLE} fill={PURPLE} fillOpacity={0.15} />
                      <Area type="monotone" dataKey="totalExpenses" name="Total Expenses" stroke={ROSE} fill={ROSE} fillOpacity={0.15} />
                      <Area type="monotone" dataKey="netProfit" name="Net Profit" stroke={EMERALD} fill={EMERALD} fillOpacity={0.15} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={revenueBreakdown} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {revenueBreakdown.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => fmt(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Financial Summary (FY {FY})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryItem label="Gross Revenue" value={fmt(revenue.total)} />
                <SummaryItem label="Net Revenue (excl. GST)" value={fmt(revenue.total - revenue.gstCollected)} />
                <SummaryItem label="Total Expenses" value={fmt(expenses.total)} />
                <SummaryItem label="Gross Profit" value={fmt(pl.grossProfit)} />
                <SummaryItem label="Net Profit" value={fmt(pl.netProfit)} />
                <SummaryItem label="Tax Provision (22%)" value={fmt(pl.taxProvision)} />
                <SummaryItem label="Retained Earnings" value={fmt(pl.retainedEarnings)} />
                <SummaryItem label="GST Payable" value={fmt(gst.gstPayable)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={REVENUE_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="monthLabel" tick={{ fill: "#94A3B8", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} tickFormatter={(v) => fmtK(v)} />
                      <Tooltip formatter={(v: number) => fmt(v)} />
                      <Legend />
                      <Bar dataKey="coinRecharges" stackId="a" name="Coin Recharges" fill={PURPLE} />
                      <Bar dataKey="subscriptions" stackId="a" name="Subscriptions" fill={MAGENTA} />
                      <Bar dataKey="adRevenue" stackId="a" name="Ad Revenue" fill={TEAL} />
                      <Bar dataKey="giftRevenue" stackId="a" name="Gift Revenue" fill={AMBER} />
                      <Bar dataKey="commercialBanner" stackId="a" name="Banners" fill={EMERALD} />
                      <Bar dataKey="specialAds" stackId="a" name="Special Ads" fill={INDIGO} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Revenue Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {revenueBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.color + "15" }}>
                        <item.icon className="w-4 h-4" style={{ color: item.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{fmt(item.value)}</div>
                      </div>
                      <div className="text-sm font-bold">{fmt(item.value)}</div>
                      <div className="text-xs text-muted-foreground w-12 text-right">
                        {Math.round((item.value / revenue.total) * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue Detail</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Coin Recharges</TableHead>
                    <TableHead>Subscriptions</TableHead>
                    <TableHead>Ad Revenue</TableHead>
                    <TableHead>Gifts</TableHead>
                    <TableHead>Banners</TableHead>
                    <TableHead>Special Ads</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>GST</TableHead>
                    <TableHead>Net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {REVENUE_DATA.map((r) => (
                    <TableRow key={r.month}>
                      <TableCell className="font-medium">{r.monthLabel}</TableCell>
                      <TableCell>{fmt(r.coinRecharges)}</TableCell>
                      <TableCell>{fmt(r.subscriptions)}</TableCell>
                      <TableCell>{fmt(r.adRevenue)}</TableCell>
                      <TableCell>{fmt(r.giftRevenue)}</TableCell>
                      <TableCell>{fmt(r.commercialBanner)}</TableCell>
                      <TableCell>{fmt(r.specialAds)}</TableCell>
                      <TableCell className="font-bold">{fmt(r.totalRevenue)}</TableCell>
                      <TableCell>{fmt(r.gstCollected)}</TableCell>
                      <TableCell>{fmt(r.netRevenue)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>Total</TableCell>
                    <TableCell>{fmt(revenue.coinRecharges)}</TableCell>
                    <TableCell>{fmt(revenue.subscriptions)}</TableCell>
                    <TableCell>{fmt(revenue.adRevenue)}</TableCell>
                    <TableCell>{fmt(revenue.giftRevenue)}</TableCell>
                    <TableCell>{fmt(revenue.commercialBanner)}</TableCell>
                    <TableCell>{fmt(revenue.specialAds)}</TableCell>
                    <TableCell>{fmt(revenue.total)}</TableCell>
                    <TableCell>{fmt(revenue.gstCollected)}</TableCell>
                    <TableCell>{fmt(revenue.total - revenue.gstCollected)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={EXPENSE_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="monthLabel" tick={{ fill: "#94A3B8", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} tickFormatter={(v) => fmtK(v)} />
                      <Tooltip formatter={(v: number) => fmt(v)} />
                      <Legend />
                      <Bar dataKey="employeeSalaries" stackId="a" name="Salaries" fill={PURPLE} />
                      <Bar dataKey="creatorPayouts" stackId="a" name="Creator Payouts" fill={TEAL} />
                      <Bar dataKey="hostPayouts" stackId="a" name="Host Payouts" fill={AMBER} />
                      <Bar dataKey="userWithdrawals" stackId="a" name="User Withdrawals" fill={EMERALD} />
                      <Bar dataKey="serverCosts" stackId="a" name="Server" fill={ROSE} />
                      <Bar dataKey="marketing" stackId="a" name="Marketing" fill={INDIGO} />
                      <Bar dataKey="officeRent" stackId="a" name="Rent" fill={MAGENTA} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Expense Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenseBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{fmt(item.value)}</div>
                      </div>
                      <div className="text-sm font-bold">{fmt(item.value)}</div>
                      <div className="text-xs text-muted-foreground w-12 text-right">
                        {Math.round((item.value / expenses.total) * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monthly Expense Detail</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Salaries</TableHead>
                    <TableHead>Creator Payouts</TableHead>
                    <TableHead>Host Payouts</TableHead>
                    <TableHead>User Withdrawals</TableHead>
                    <TableHead>Server</TableHead>
                    <TableHead>Marketing</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Refunds</TableHead>
                    <TableHead>PG Fees</TableHead>
                    <TableHead>Legal/GST</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {EXPENSE_DATA.map((e) => (
                    <TableRow key={e.month}>
                      <TableCell className="font-medium">{e.monthLabel}</TableCell>
                      <TableCell>{fmt(e.employeeSalaries)}</TableCell>
                      <TableCell>{fmt(e.creatorPayouts)}</TableCell>
                      <TableCell>{fmt(e.hostPayouts)}</TableCell>
                      <TableCell>{fmt(e.userWithdrawals)}</TableCell>
                      <TableCell>{fmt(e.serverCosts)}</TableCell>
                      <TableCell>{fmt(e.marketing)}</TableCell>
                      <TableCell>{fmt(e.officeRent)}</TableCell>
                      <TableCell>{fmt(e.refunds)}</TableCell>
                      <TableCell>{fmt(e.paymentGatewayFees)}</TableCell>
                      <TableCell>{fmt(e.legalCompliance + e.gstPaid)}</TableCell>
                      <TableCell className="font-bold">{fmt(e.totalExpenses)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>Total</TableCell>
                    <TableCell>{fmt(expenses.employeeSalaries)}</TableCell>
                    <TableCell>{fmt(expenses.creatorPayouts)}</TableCell>
                    <TableCell>{fmt(expenses.hostPayouts)}</TableCell>
                    <TableCell>{fmt(expenses.userWithdrawals)}</TableCell>
                    <TableCell>{fmt(expenses.serverCosts)}</TableCell>
                    <TableCell>{fmt(expenses.marketing)}</TableCell>
                    <TableCell>{fmt(expenses.officeRent)}</TableCell>
                    <TableCell>{fmt(expenses.refunds)}</TableCell>
                    <TableCell>{fmt(expenses.paymentGatewayFees)}</TableCell>
                    <TableCell>{fmt(expenses.legalCompliance + expenses.gstPaid)}</TableCell>
                    <TableCell>{fmt(expenses.total)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* P&L Tab */}
        <TabsContent value="pnl" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Profit & Loss Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={PL_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="monthLabel" tick={{ fill: "#94A3B8", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} tickFormatter={(v) => fmtK(v)} />
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="grossRevenue" name="Gross Revenue" stroke={PURPLE} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="totalExpenses" name="Total Expenses" stroke={ROSE} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="grossProfit" name="Gross Profit" stroke={EMERALD} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="netProfit" name="Net Profit" stroke={TEAL} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="taxProvision" name="Tax Provision" stroke={AMBER} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monthly Profit & Loss Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Gross Revenue</TableHead>
                    <TableHead>Net Revenue</TableHead>
                    <TableHead>Expenses</TableHead>
                    <TableHead>Gross Profit</TableHead>
                    <TableHead>Net Profit</TableHead>
                    <TableHead>Margin</TableHead>
                    <TableHead>Tax Provision</TableHead>
                    <TableHead>Retained</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PL_DATA.map((p) => (
                    <TableRow key={p.month}>
                      <TableCell className="font-medium">{p.monthLabel}</TableCell>
                      <TableCell>{fmt(p.grossRevenue)}</TableCell>
                      <TableCell>{fmt(p.netRevenueAfterGST)}</TableCell>
                      <TableCell>{fmt(p.totalExpenses)}</TableCell>
                      <TableCell className={p.grossProfit >= 0 ? "text-emerald-400" : "text-red-400"}>{fmt(p.grossProfit)}</TableCell>
                      <TableCell className={p.netProfit >= 0 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{fmt(p.netProfit)}</TableCell>
                      <TableCell>{p.profitMargin}%</TableCell>
                      <TableCell>{fmt(p.taxProvision)}</TableCell>
                      <TableCell>{fmt(p.retainedEarnings)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>Total</TableCell>
                    <TableCell>{fmt(pl.grossRevenue)}</TableCell>
                    <TableCell>{fmt(pl.netRevenue)}</TableCell>
                    <TableCell>{fmt(pl.totalExpenses)}</TableCell>
                    <TableCell>{fmt(pl.grossProfit)}</TableCell>
                    <TableCell>{fmt(pl.netProfit)}</TableCell>
                    <TableCell>{pl.avgProfitMargin}%</TableCell>
                    <TableCell>{fmt(pl.taxProvision)}</TableCell>
                    <TableCell>{fmt(pl.retainedEarnings)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GST Tab */}
        <TabsContent value="gst" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">GST Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <SummaryItem label="Total Output GST" value={fmt(gst.totalOutputGST)} />
                <SummaryItem label="Total Input GST (ITC)" value={fmt(gst.totalInputGST)} />
                <SummaryItem label="GST Payable" value={fmt(gst.gstPayable)} />
                <SummaryItem label="GST ITC Available" value={fmt(gst.gstITC)} />
                <SummaryItem label="IGST" value={fmt(gst.igst)} />
                <SummaryItem label="CGST" value={fmt(gst.cgst)} />
                <SummaryItem label="SGST" value={fmt(gst.sgst)} />
                <SummaryItem label="SAC Code" value={SAC_CODE} />
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={GST_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="monthLabel" tick={{ fill: "#94A3B8", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} tickFormatter={(v) => fmtK(v)} />
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Legend />
                    <Bar dataKey="totalOutputGST" name="Output GST" fill={PURPLE} />
                    <Bar dataKey="totalInputGST" name="Input GST" fill={TEAL} />
                    <Bar dataKey="gstPayable" name="GST Payable" fill={ROSE} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">GST Return Details (GSTR-1 & GSTR-3B)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>GST on Ads</TableHead>
                    <TableHead>GST on Platform</TableHead>
                    <TableHead>GST on Subs</TableHead>
                    <TableHead>GST on Coins</TableHead>
                    <TableHead>GST on Gifts</TableHead>
                    <TableHead>Output GST</TableHead>
                    <TableHead>Input GST</TableHead>
                    <TableHead>GST Payable</TableHead>
                    <TableHead>IGST</TableHead>
                    <TableHead>CGST</TableHead>
                    <TableHead>SGST</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {GST_DATA.map((g) => (
                    <TableRow key={g.month}>
                      <TableCell className="font-medium">{g.monthLabel}</TableCell>
                      <TableCell>{fmt(g.gstOnAdPayments)}</TableCell>
                      <TableCell>{fmt(g.gstOnPlatformFees)}</TableCell>
                      <TableCell>{fmt(g.gstOnSubscriptions)}</TableCell>
                      <TableCell>{fmt(g.gstOnCoins)}</TableCell>
                      <TableCell>{fmt(g.gstOnGifts)}</TableCell>
                      <TableCell>{fmt(g.totalOutputGST)}</TableCell>
                      <TableCell>{fmt(g.totalInputGST)}</TableCell>
                      <TableCell className="font-bold">{fmt(g.gstPayable)}</TableCell>
                      <TableCell>{fmt(g.igst)}</TableCell>
                      <TableCell>{fmt(g.cgst)}</TableCell>
                      <TableCell>{fmt(g.sgst)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell>Total</TableCell>
                    <TableCell>{fmt(gst.totalOutputGST)}</TableCell>
                    <TableCell>{fmt(gst.totalInputGST)}</TableCell>
                    <TableCell>{fmt(gst.gstPayable)}</TableCell>
                    <TableCell>{fmt(gst.igst)}</TableCell>
                    <TableCell>{fmt(gst.cgst)}</TableCell>
                    <TableCell>{fmt(gst.sgst)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ITR Tab */}
        <TabsContent value="itr" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ReceiptIndianRupee className="w-4 h-4" />
                ITR-3 Schedule — FY {FY}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {COMPANY_NAME} | PAN: {PAN} | GSTIN: {GSTIN} | Tax Regime: Section 115BAA (22%)
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Line</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount (INR)</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itr.map((row, idx) => {
                    const isTotal = row.line.startsWith("C") || row.line.startsWith("D") || row.line.startsWith("E") || row.line.startsWith("F");
                    const isExpense = row.line.startsWith("B");
                    return (
                      <TableRow key={idx} className={isTotal ? "font-bold bg-muted/50" : ""}>
                        <TableCell className="font-mono text-xs">{row.line}</TableCell>
                        <TableCell className={isExpense ? "text-red-300" : isTotal ? "font-bold" : ""}>{row.description}</TableCell>
                        <TableCell className={`text-right font-mono ${row.amount < 0 ? "text-red-300" : row.amount > 0 ? "text-emerald-300" : ""}`}>
                          {fmt(row.amount)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{row.notes}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tax Computation Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <SummaryItem label="Profit Before Tax (PBT)" value={fmt(pl.grossProfit)} />
                <SummaryItem label="Tax Rate" value="22% (Section 115BAA)" />
                <SummaryItem label="Income Tax Payable" value={fmt(pl.taxProvision)} />
                <SummaryItem label="Surcharge (Nil for <1Cr)" value="₹0" />
                <SummaryItem label="Cess (4% on Tax)" value={fmt(Math.round(pl.taxProvision * 0.04))} />
                <SummaryItem label="Total Tax Liability" value={fmt(Math.round(pl.taxProvision * 1.04))} />
                <SummaryItem label="Net Profit After Tax" value={fmt(pl.retainedEarnings)} />
                <SummaryItem label="Effective Tax Rate" value={`${Math.round((pl.taxProvision / Math.max(1, pl.grossProfit)) * 100)}%`} />
                <SummaryItem label="Retained Earnings" value={fmt(pl.retainedEarnings)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Withdrawal Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <SummaryItem label="Total Withdrawals" value={fmt(WITHDRAWAL_DETAILS.reduce((s, w) => s + w.amount, 0))} />
                <SummaryItem label="Total Platform Fees (30%)" value={fmt(WITHDRAWAL_DETAILS.reduce((s, w) => s + w.platformFee, 0))} />
                <SummaryItem label="GST on Platform Fees (18%)" value={fmt(WITHDRAWAL_DETAILS.reduce((s, w) => s + w.gstOnFee, 0))} />
                <SummaryItem label="Net Payouts" value={fmt(WITHDRAWAL_DETAILS.reduce((s, w) => s + w.netPayout, 0))} />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Platform Fee (30%)</TableHead>
                    <TableHead>GST on Fee (18%)</TableHead>
                    <TableHead>Net Payout</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>UPI</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {WITHDRAWAL_DETAILS.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="font-mono text-xs">{w.id}</TableCell>
                      <TableCell className="font-medium">{w.userName}</TableCell>
                      <TableCell><Badge variant="outline">{w.userRole}</Badge></TableCell>
                      <TableCell>{fmt(w.amount)}</TableCell>
                      <TableCell>{fmt(w.platformFee)}</TableCell>
                      <TableCell>{fmt(w.gstOnFee)}</TableCell>
                      <TableCell className="font-bold">{fmt(w.netPayout)}</TableCell>
                      <TableCell>
                        <Badge variant={w.status === "Paid" ? "default" : w.status === "Pending" ? "outline" : w.status === "Approved" ? "secondary" : "destructive"}>
                          {w.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{w.upiId}</TableCell>
                      <TableCell>{w.bankAccount}</TableCell>
                      <TableCell>{w.paidAt}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell>{fmt(WITHDRAWAL_DETAILS.reduce((s, w) => s + w.amount, 0))}</TableCell>
                    <TableCell>{fmt(WITHDRAWAL_DETAILS.reduce((s, w) => s + w.platformFee, 0))}</TableCell>
                    <TableCell>{fmt(WITHDRAWAL_DETAILS.reduce((s, w) => s + w.gstOnFee, 0))}</TableCell>
                    <TableCell>{fmt(WITHDRAWAL_DETAILS.reduce((s, w) => s + w.netPayout, 0))}</TableCell>
                    <TableCell colSpan={4} />
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  trend: number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="text-lg font-bold mt-1">{value}</div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {trend > 0 ? (
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-red-400" />
              )}
              <span className={trend > 0 ? "text-emerald-400" : "text-red-400"}>
                {Math.abs(trend)}%
              </span>
              <span className="text-muted-foreground">vs last FY</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "15" }}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}
