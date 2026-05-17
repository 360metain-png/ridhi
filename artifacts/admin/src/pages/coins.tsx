import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Coins, ArrowUpRight, ArrowDownRight, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { mockTransactions, type Transaction } from "@/data/mock-data";

const TYPE_COLORS: Record<string, string> = {
  Earned: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Spent: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  Recharged: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  "Gift Sent": "bg-amber-500/15 text-amber-400 border-amber-500/20",
  "Gift Received": "bg-pink-500/15 text-pink-400 border-pink-500/20",
};

const PAGE_SIZE = 10;

export default function CoinsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = mockTransactions.filter((t) => {
    const matchSearch =
      t.userName.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || t.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalCirculating = mockTransactions.reduce((s, t) => (t.type === "Earned" || t.type === "Recharged" || t.type === "Gift Received" ? s + t.amount : s), 0);
  const earnedToday = mockTransactions.filter((t) => t.type === "Earned").reduce((s, t) => s + t.amount, 0);
  const spentToday = mockTransactions.filter((t) => t.type === "Spent" || t.type === "Gift Sent").reduce((s, t) => s + t.amount, 0);
  const rechargeRevenue = mockTransactions.filter((t) => t.type === "Recharged").reduce((s, t) => s + t.amount * 0.5, 0);

  const stats = [
    { label: "Coins in Circulation", value: totalCirculating.toLocaleString(), icon: Coins, change: "+8.2%", up: true, color: "text-violet-400" },
    { label: "Earned Today", value: earnedToday.toLocaleString(), icon: ArrowUpRight, change: "+12.4%", up: true, color: "text-emerald-400" },
    { label: "Spent Today", value: spentToday.toLocaleString(), icon: ArrowDownRight, change: "-3.1%", up: false, color: "text-rose-400" },
    { label: "Revenue from Recharges", value: `₹${rechargeRevenue.toLocaleString()}`, icon: TrendingUp, change: "+19.7%", up: true, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Coin & Transactions</h1>
        <p className="text-muted-foreground text-sm mt-1">Monitor coin flows, recharges, and platform economy</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</span>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${s.up ? "text-emerald-400" : "text-rose-400"}`}>
                {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {s.change} vs last 7 days
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base font-semibold text-foreground flex-1">Transaction Ledger</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search user or description..."
                  className="pl-9 h-9 w-64 bg-background border-border text-sm"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-40 bg-background border-border text-sm">
                  <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Earned">Earned</SelectItem>
                  <SelectItem value="Spent">Spent</SelectItem>
                  <SelectItem value="Recharged">Recharged</SelectItem>
                  <SelectItem value="Gift Sent">Gift Sent</SelectItem>
                  <SelectItem value="Gift Received">Gift Received</SelectItem>
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
                <TableHead className="text-muted-foreground text-xs font-semibold">Type</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">Amount</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">Balance After</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Description</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((t) => (
                <TableRow key={t.id} className="border-border hover:bg-muted/30">
                  <TableCell className="font-medium text-foreground text-sm">{t.userName}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs border ${TYPE_COLORS[t.type]}`}>{t.type}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-semibold text-sm ${
                      t.type === "Earned" || t.type === "Recharged" || t.type === "Gift Received"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}>
                      {t.type === "Earned" || t.type === "Recharged" || t.type === "Gift Received" ? "+" : "-"}
                      {t.amount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">{t.balanceAfter.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{t.description}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString("en-IN")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <span className="text-sm text-muted-foreground">{filtered.length} transactions</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-8 px-3 border-border">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 px-3 border-border">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
