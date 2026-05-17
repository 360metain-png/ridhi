import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  TrendingUp, Clock, CheckCircle, XCircle, IndianRupee, Search,
  ChevronLeft, ChevronRight, ShieldCheck, Users, Star, Briefcase,
  Coins, CreditCard, Smartphone, AlertTriangle, ExternalLink,
} from "lucide-react";
import { mockCoinWithdrawals, type CoinWithdrawal } from "@/data/mock-data";

const STATUS_COLORS: Record<string, string> = {
  Pending:  "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Approved: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Paid:     "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Rejected: "bg-rose-500/15 text-rose-400 border-rose-500/20",
};

const ROLE_COLORS: Record<string, string> = {
  User:  "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Host:  "bg-pink-500/15 text-pink-400 border-pink-500/20",
  Agent: "bg-violet-500/15 text-violet-400 border-violet-500/20",
};

const ROLE_ICONS: Record<string, typeof Users> = {
  User: Users,
  Host: Star,
  Agent: Briefcase,
};

const PAGE_SIZE = 10;

export default function PayoutsPage() {
  const [withdrawals, setWithdrawals] = useState<CoinWithdrawal[]>(mockCoinWithdrawals);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = withdrawals.filter((w) => {
    const matchSearch = w.userName.toLowerCase().includes(search.toLowerCase()) ||
      w.userPhone.includes(search) ||
      (w.upiId?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchStatus = statusFilter === "all" || w.status === statusFilter;
    const matchRole   = roleFilter === "all"   || w.userRole === roleFilter;
    return matchSearch && matchStatus && matchRole;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pending  = withdrawals.filter((w) => w.status === "Pending");
  const approved = withdrawals.filter((w) => w.status === "Approved");
  const paid     = withdrawals.filter((w) => w.status === "Paid");
  const rejected = withdrawals.filter((w) => w.status === "Rejected");

  const pendingInr  = pending.reduce((s, w) => s + w.netAmountInr, 0);
  const approvedInr = approved.reduce((s, w) => s + w.netAmountInr, 0);
  const paidInr     = paid.reduce((s, w) => s + w.netAmountInr, 0);
  const totalCoins  = withdrawals.reduce((s, w) => s + w.coinsRequested, 0);

  const approve = (id: string) => {
    setWithdrawals((prev) => prev.map((w) => w.id === id
      ? { ...w, status: "Approved", processedAt: new Date().toISOString() }
      : w));
  };

  const markPaid = (id: string) => {
    const txRef = `TXN${Math.floor(Math.random() * 900000 + 100000)}`;
    setWithdrawals((prev) => prev.map((w) => w.id === id
      ? { ...w, status: "Paid", processedAt: new Date().toISOString(), txRef }
      : w));
  };

  const reject = (id: string) => {
    setWithdrawals((prev) => prev.map((w) => w.id === id
      ? { ...w, status: "Rejected", processedAt: new Date().toISOString(), rejectionReason: rejectReason || "Rejected by admin" }
      : w));
    setRejectTarget(null);
    setRejectReason("");
  };

  const stats = [
    { label: "Pending Payouts",    value: `₹${pendingInr.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,   sub: `${pending.length} requests`,  icon: Clock,        color: "text-amber-400",   bg: "bg-amber-500/10" },
    { label: "Approved (Queued)",  value: `₹${approvedInr.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,  sub: `${approved.length} approved`, icon: CheckCircle,  color: "text-blue-400",    bg: "bg-blue-500/10"  },
    { label: "Total Paid Out",     value: `₹${paidInr.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,      sub: `${paid.length} completed`,    icon: TrendingUp,   color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Coins Redeemed",     value: totalCoins.toLocaleString(),                                               sub: "across all requests",         icon: Coins,        color: "text-violet-400",  bg: "bg-violet-500/10" },
  ];

  const roleSplit = (["User", "Host", "Agent"] as const).map((r) => ({
    role: r,
    count: withdrawals.filter((w) => w.userRole === r).length,
    inr:   withdrawals.filter((w) => w.userRole === r && w.status === "Paid").reduce((s, w) => s + w.netAmountInr, 0),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Coin Withdrawals & Payouts</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage withdrawal requests from Users, Hosts, and Agents</p>
        </div>
        {pending.length > 0 && (
          <Badge className="gap-1.5 bg-amber-500/15 text-amber-400 border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            {pending.length} pending approval
          </Badge>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role breakdown */}
      <div className="grid grid-cols-3 gap-4">
        {roleSplit.map(({ role, count, inr }) => {
          const Icon = ROLE_ICONS[role];
          return (
            <Card key={role} className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  role === "User" ? "bg-blue-500/10" : role === "Host" ? "bg-pink-500/10" : "bg-violet-500/10"
                }`}>
                  <Icon className={`w-4 h-4 ${role === "User" ? "text-blue-400" : role === "Host" ? "text-pink-400" : "text-violet-400"}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{role}s</p>
                  <p className="text-xs text-muted-foreground">{count} requests · ₹{inr.toLocaleString("en-IN", { maximumFractionDigits: 0 })} paid</p>
                </div>
                <Badge
                  className={`text-xs border cursor-pointer ${roleFilter === role ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
                  onClick={() => { setRoleFilter(roleFilter === role ? "all" : role); setPage(1); }}
                >
                  {roleFilter === role ? "Filtered" : "Filter"}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base font-semibold text-foreground flex-1 flex items-center gap-2">
              Withdrawal Requests
              <Badge variant="outline" className="text-xs border-border font-normal">{filtered.length} results</Badge>
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Name, phone, UPI..."
                  className="pl-9 h-9 w-52 bg-background border-border text-sm"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-32 bg-background border-border text-sm">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Host">Host</SelectItem>
                  <SelectItem value="Agent">Agent</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-32 bg-background border-border text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs font-semibold">User</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Role</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">Coins</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">Net Payout</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Method</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Destination</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">KYC</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Requested</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Status</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((w) => {
                const RoleIcon = ROLE_ICONS[w.userRole];
                return (
                  <>
                    <TableRow key={w.id} className="border-border hover:bg-muted/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground text-sm">{w.userName}</p>
                          <p className="text-xs text-muted-foreground">{w.userPhone} · {w.userCity}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs border gap-1 ${ROLE_COLORS[w.userRole]}`}>
                          <RoleIcon className="w-3 h-3" />
                          {w.userRole}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-bold text-amber-400">{w.coinsRequested.toLocaleString()}</span>
                        <p className="text-xs text-muted-foreground">≈ ₹{w.grossAmountInr.toLocaleString("en-IN", { maximumFractionDigits: 0 })} gross</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-bold text-emerald-400">₹{w.netAmountInr.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                        <p className="text-xs text-muted-foreground">after 30% fee</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {w.method === "UPI"
                            ? <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                            : <CreditCard className="w-3.5 h-3.5 text-blue-400" />}
                          <span className="text-sm text-foreground">{w.method}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {w.method === "UPI"
                          ? w.upiId
                          : w.bankAccount ? `****${w.bankAccount.slice(-4)}` : "—"}
                        {w.txRef && (
                          <p className="text-xs text-emerald-400 font-mono mt-0.5">{w.txRef}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {w.kycVerified
                          ? <Badge className="text-xs gap-1 bg-emerald-500/15 text-emerald-400 border-emerald-500/20"><ShieldCheck className="w-3 h-3" />Verified</Badge>
                          : <Badge className="text-xs gap-1 bg-rose-500/15 text-rose-400 border-rose-500/20"><XCircle className="w-3 h-3" />Pending</Badge>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(w.requestedAt).toLocaleDateString("en-IN")}
                        <br />
                        {new Date(w.requestedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs border ${STATUS_COLORS[w.status]}`}>{w.status}</Badge>
                        {w.rejectionReason && (
                          <p className="text-xs text-rose-400 mt-0.5 max-w-[100px] truncate">{w.rejectionReason}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {w.status === "Pending" && (
                            <>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0">Approve</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card border-border">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-foreground">Approve Withdrawal</AlertDialogTitle>
                                    <AlertDialogDescription className="text-muted-foreground">
                                      Approve ₹{w.netAmountInr.toLocaleString("en-IN", { maximumFractionDigits: 0 })} payout ({w.coinsRequested.toLocaleString()} coins) to {w.userName} via {w.method}?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="bg-emerald-600 hover:bg-emerald-700" onClick={() => approve(w.id)}>Approve</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs border-rose-500/40 text-rose-400 hover:bg-rose-500/10" onClick={() => setRejectTarget(w.id)}>Reject</Button>
                            </>
                          )}
                          {w.status === "Approved" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" className="h-7 px-2.5 text-xs bg-violet-600 hover:bg-violet-700 text-white border-0 gap-1">
                                  <ExternalLink className="w-3 h-3" />
                                  Mark Paid
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card border-border">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-foreground">Mark as Paid</AlertDialogTitle>
                                  <AlertDialogDescription className="text-muted-foreground">
                                    Confirm that ₹{w.netAmountInr.toLocaleString("en-IN", { maximumFractionDigits: 0 })} has been transferred to {w.userName} via {w.method === "UPI" ? w.upiId : `****${w.bankAccount?.slice(-4)}`}?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-violet-600 hover:bg-violet-700" onClick={() => markPaid(w.id)}>Confirm & Generate Ref</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          {(w.status === "Paid" || w.status === "Rejected") && (
                            <span className="text-xs text-muted-foreground">
                              {w.processedAt ? new Date(w.processedAt).toLocaleDateString("en-IN") : "—"}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    {rejectTarget === w.id && (
                      <TableRow key={`${w.id}-reject`} className="border-border bg-rose-500/5">
                        <TableCell colSpan={10} className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <Textarea
                              placeholder="Reason for rejection (optional)..."
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              className="h-9 min-h-0 bg-background border-border text-sm flex-1 resize-none py-2"
                              rows={1}
                            />
                            <Button size="sm" variant="destructive" className="h-9 px-3 gap-1.5 shrink-0" onClick={() => reject(w.id)}>
                              <XCircle className="w-3.5 h-3.5" />
                              Confirm Reject
                            </Button>
                            <Button size="sm" variant="ghost" className="h-9 w-9 p-0 text-muted-foreground shrink-0" onClick={() => { setRejectTarget(null); setRejectReason(""); }}>✕</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground text-sm">No withdrawal requests found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <span className="text-sm text-muted-foreground">{filtered.length} requests</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-8 px-3 border-border">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="h-8 px-3 border-border">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
