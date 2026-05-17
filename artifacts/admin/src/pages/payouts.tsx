import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, IndianRupee, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { mockWithdrawals, type WithdrawalRequest } from "@/data/mock-data";

const STATUS_COLORS: Record<string, string> = {
  Pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Approved: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Paid: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Rejected: "bg-rose-500/15 text-rose-400 border-rose-500/20",
};

const PAGE_SIZE = 10;

export default function PayoutsPage() {
  const [withdrawals, setWithdrawals] = useState(mockWithdrawals);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = withdrawals.filter((w) => {
    const matchSearch = w.creatorName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || w.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pending = withdrawals.filter((w) => w.status === "Pending");
  const approvedThisMonth = withdrawals.filter((w) => w.status === "Approved" || w.status === "Paid");
  const rejected = withdrawals.filter((w) => w.status === "Rejected");

  const pendingTotal = pending.reduce((s, w) => s + w.amount, 0);
  const approvedTotal = approvedThisMonth.reduce((s, w) => s + w.amount, 0);
  const rejectedTotal = rejected.reduce((s, w) => s + w.amount, 0);

  const updateStatus = (id: string, status: WithdrawalRequest["status"]) => {
    setWithdrawals((prev) => prev.map((w) => (w.id === id ? { ...w, status } : w)));
  };

  const stats = [
    { label: "Pending Payouts", value: `₹${pendingTotal.toLocaleString()}`, sub: `${pending.length} requests`, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Approved This Month", value: `₹${approvedTotal.toLocaleString()}`, sub: `${approvedThisMonth.length} requests`, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Rejected This Month", value: `₹${rejectedTotal.toLocaleString()}`, sub: `${rejected.length} requests`, icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10" },
    { label: "Avg Payout Amount", value: `₹${Math.round(withdrawals.reduce((s, w) => s + w.amount, 0) / withdrawals.length).toLocaleString()}`, sub: "Per withdrawal", icon: IndianRupee, color: "text-violet-400", bg: "bg-violet-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Creator Payouts</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage withdrawal requests from creators</p>
      </div>

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

      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base font-semibold text-foreground flex-1">Withdrawal Requests</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search creator..."
                  className="pl-9 h-9 w-52 bg-background border-border text-sm"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-36 bg-background border-border text-sm">
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
                <TableHead className="text-muted-foreground text-xs font-semibold">Creator</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">Amount</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Method</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Account</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Requested</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Status</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((w) => (
                <TableRow key={w.id} className="border-border hover:bg-muted/30">
                  <TableCell className="font-medium text-foreground text-sm">{w.creatorName}</TableCell>
                  <TableCell className="text-right font-bold text-foreground text-sm">₹{w.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs border-border text-muted-foreground">{w.method}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {w.method === "UPI" ? w.upiId : w.bankAccount ? `****${w.bankAccount.slice(-4)}` : "-"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(w.requestedAt).toLocaleDateString("en-IN")}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs border ${STATUS_COLORS[w.status]}`}>{w.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {w.status === "Pending" && (
                        <>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0">Approve</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-foreground">Approve Payout</AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">Approve ₹{w.amount.toLocaleString()} payout to {w.creatorName}?</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-emerald-600 hover:bg-emerald-700" onClick={() => updateStatus(w.id, "Approved")}>Approve</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs border-rose-500/40 text-rose-400 hover:bg-rose-500/10">Reject</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-foreground">Reject Payout</AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">Reject this withdrawal request from {w.creatorName}?</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-rose-600 hover:bg-rose-700" onClick={() => updateStatus(w.id, "Rejected")}>Reject</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                      {w.status === "Approved" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" className="h-7 px-2 text-xs bg-violet-600 hover:bg-violet-700 text-white border-0">Mark Paid</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-foreground">Mark as Paid</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">Confirm that ₹{w.amount.toLocaleString()} has been transferred to {w.creatorName}?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-violet-600 hover:bg-violet-700" onClick={() => updateStatus(w.id, "Paid")}>Confirm</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      {(w.status === "Paid" || w.status === "Rejected") && (
                        <span className="text-xs text-muted-foreground">No actions</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <span className="text-sm text-muted-foreground">{filtered.length} requests</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-8 px-3 border-border">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {Math.max(1, totalPages)}</span>
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
