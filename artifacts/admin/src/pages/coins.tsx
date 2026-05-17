import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  TrendingUp, TrendingDown, Coins, ArrowUpRight, ArrowDownRight,
  Search, ChevronLeft, ChevronRight, ShieldCheck, Lock, CheckCircle2,
  XCircle, Plus, Minus, Edit2, Save, X, RefreshCw, AlertTriangle,
  IndianRupee, Star, Clock, Settings2, Wallet, BarChart3,
} from "lucide-react";
import {
  mockTransactions, mockUsers,
  mockCoinRequests, mockManualCoinLogs,
  DEFAULT_COIN_VALUE_CONFIG, DEFAULT_COIN_PACKAGES,
  type Transaction, type CoinRequest, type CoinPackageConfig, type CoinValueConfig, type ManualCoinLog,
} from "@/data/mock-data";
import { useToast } from "@/hooks/use-toast";

const COIN_IMG = "/ridhi_coin.png";

const TYPE_COLORS: Record<string, string> = {
  Earned:         "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Spent:          "bg-rose-500/15 text-rose-400 border-rose-500/20",
  Recharged:      "bg-violet-500/15 text-violet-400 border-violet-500/20",
  "Gift Sent":    "bg-amber-500/15 text-amber-400 border-amber-500/20",
  "Gift Received":"bg-pink-500/15 text-pink-400 border-pink-500/20",
};

const REQUEST_TYPE_COLORS: Record<string, string> = {
  Recharge:     "bg-violet-500/15 text-violet-400 border-violet-500/20",
  Bonus:        "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Refund:       "bg-amber-500/15 text-amber-400 border-amber-500/20",
  "Manual Add": "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Complaint:    "bg-rose-500/15 text-rose-400 border-rose-500/20",
  "Contest Win":"bg-pink-500/15 text-pink-400 border-pink-500/20",
};

const PAGE_SIZE = 10;

const TABS = [
  { id: "overview",  label: "Overview",         icon: BarChart3,   superOnly: false },
  { id: "values",    label: "Coin Values",       icon: Settings2,   superOnly: true  },
  { id: "adjust",    label: "Add / Remove",      icon: Wallet,      superOnly: true  },
  { id: "requests",  label: "Pending Requests",  icon: Clock,       superOnly: true  },
  { id: "ledger",    label: "Transaction Ledger",icon: IndianRupee, superOnly: false },
] as const;

type TabId = typeof TABS[number]["id"];

function SuperAdminGate() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
        <Lock className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-bold text-foreground">Super Admin Access Required</h3>
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        This section is restricted to Super Admins only. You do not have permission to view or edit coin settings.
      </p>
      <Badge className="gap-1.5 bg-destructive/10 text-destructive border-destructive/20">
        <ShieldCheck className="w-3.5 h-3.5" />
        Super Admin Only
      </Badge>
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────
function OverviewTab() {
  const totalCirculating = mockTransactions.reduce((s, t) => (t.type === "Earned" || t.type === "Recharged" || t.type === "Gift Received" ? s + t.amount : s), 0);
  const earnedToday = mockTransactions.filter((t) => t.type === "Earned").reduce((s, t) => s + t.amount, 0);
  const spentToday = mockTransactions.filter((t) => t.type === "Spent" || t.type === "Gift Sent").reduce((s, t) => s + t.amount, 0);
  const rechargeRevenue = mockTransactions.filter((t) => t.type === "Recharged").reduce((s, t) => s + t.amount * 0.5, 0);
  const pendingCount = mockCoinRequests.filter((r) => r.status === "Pending").length;

  const stats = [
    { label: "Coins in Circulation", value: totalCirculating.toLocaleString(), icon: Coins, change: "+8.2%", up: true, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Earned Today", value: earnedToday.toLocaleString(), icon: ArrowUpRight, change: "+12.4%", up: true, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Spent Today", value: spentToday.toLocaleString(), icon: ArrowDownRight, change: "-3.1%", up: false, color: "text-rose-400", bg: "bg-rose-500/10" },
    { label: "Recharge Revenue", value: `₹${rechargeRevenue.toLocaleString()}`, icon: TrendingUp, change: "+19.7%", up: true, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  const typeBreakdown = [
    { type: "Earned",         count: mockTransactions.filter((t) => t.type === "Earned").length,         color: "bg-emerald-500" },
    { type: "Spent",          count: mockTransactions.filter((t) => t.type === "Spent").length,           color: "bg-rose-500" },
    { type: "Recharged",      count: mockTransactions.filter((t) => t.type === "Recharged").length,       color: "bg-violet-500" },
    { type: "Gift Sent",      count: mockTransactions.filter((t) => t.type === "Gift Sent").length,       color: "bg-amber-500" },
    { type: "Gift Received",  count: mockTransactions.filter((t) => t.type === "Gift Received").length,   color: "bg-pink-500" },
  ];
  const total = typeBreakdown.reduce((s, t) => s + t.count, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</span>
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">Transaction Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {typeBreakdown.map((t) => (
              <div key={t.type} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-24 shrink-0">{t.type}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${t.color} rounded-full`} style={{ width: `${(t.count / total) * 100}%` }} />
                </div>
                <span className="text-xs font-medium text-foreground w-6 text-right">{t.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              Pending Coin Requests
              {pendingCount > 0 && (
                <Badge className="bg-destructive/15 text-destructive border-destructive/20 text-xs">{pendingCount} pending</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockCoinRequests.filter((r) => r.status === "Pending").slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.userName}</p>
                  <p className="text-xs text-muted-foreground">{r.type} · {r.requestedCoins.toLocaleString()} coins</p>
                </div>
                <Badge className={`text-xs border ${REQUEST_TYPE_COLORS[r.type]}`}>{r.type}</Badge>
              </div>
            ))}
            {pendingCount === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No pending requests</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Coin Values Tab ─────────────────────────────────────────────────────────
function CoinValuesTab() {
  const { toast } = useToast();
  const [config, setConfig] = useState<CoinValueConfig>({ ...DEFAULT_COIN_VALUE_CONFIG });
  const [packages, setPackages] = useState<CoinPackageConfig[]>(DEFAULT_COIN_PACKAGES.map((p) => ({ ...p })));
  const [editingPkg, setEditingPkg] = useState<string | null>(null);
  const [editPkgDraft, setEditPkgDraft] = useState<CoinPackageConfig | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSaveConfig = () => {
    setSaved(true);
    toast({ title: "Coin values updated", description: "All conversion rates and costs have been saved." });
    setTimeout(() => setSaved(false), 2000);
  };

  const startEditPkg = (pkg: CoinPackageConfig) => {
    setEditingPkg(pkg.id);
    setEditPkgDraft({ ...pkg });
  };

  const saveEditPkg = () => {
    if (!editPkgDraft) return;
    setPackages((prev) => prev.map((p) => (p.id === editPkgDraft.id ? editPkgDraft : p)));
    setEditingPkg(null);
    setEditPkgDraft(null);
    toast({ title: "Package updated", description: `${editPkgDraft.label} package saved.` });
  };

  const configFields: { key: keyof CoinValueConfig; label: string; suffix: string; hint: string }[] = [
    { key: "inrPerCoin",          label: "INR per Coin",          suffix: "₹ / coin",     hint: "How much ₹1 coin is worth" },
    { key: "coinPerInr",          label: "Coins per ₹1",          suffix: "coins",         hint: "Coins issued per ₹1 paid" },
    { key: "dailyLoginReward",    label: "Daily Login Reward",    suffix: "coins",         hint: "Free coins on daily login" },
    { key: "referralBonus",       label: "Referral Bonus",        suffix: "coins",         hint: "Coins per successful referral" },
    { key: "profileBoostCost",    label: "Profile Boost Cost",    suffix: "coins",         hint: "Coins to boost profile 24h" },
    { key: "unlockChatCost",      label: "Unlock Chat Cost",      suffix: "coins",         hint: "Coins to unlock a locked chat" },
    { key: "giftHeartCost",       label: "Gift: Heart",           suffix: "coins",         hint: "Heart gift cost in coins" },
    { key: "giftRoseCost",        label: "Gift: Rose",            suffix: "coins",         hint: "Rose gift cost in coins" },
    { key: "giftDiamondCost",     label: "Gift: Diamond",         suffix: "coins",         hint: "Diamond gift cost in coins" },
    { key: "giftCrownCost",       label: "Gift: Crown",           suffix: "coins",         hint: "Crown gift cost in coins" },
    { key: "audioCallCostPerMin", label: "Audio Call / min",      suffix: "coins/min",     hint: "Cost per minute for audio call" },
    { key: "videoCallCostPerMin", label: "Video Call / min",      suffix: "coins/min",     hint: "Cost per minute for video call" },
    { key: "platformFeePercent",  label: "Platform Fee",          suffix: "%",             hint: "Ridhi's cut from transactions" },
    { key: "hostSharePercent",    label: "Host Share",            suffix: "%",             hint: "Host's share of coin earnings" },
    { key: "agentSharePercent",   label: "Agent Commission",      suffix: "%",             hint: "Agent's commission per host" },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                Conversion Rates & Costs
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">All coin values and platform fees</p>
            </div>
            <Button size="sm" className="h-8 gap-1.5" onClick={handleSaveConfig}>
              {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? "Saved!" : "Save Changes"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {configFields.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">{f.label}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={config[f.key]}
                    onChange={(e) => setConfig((prev) => ({ ...prev, [f.key]: parseFloat(e.target.value) || 0 }))}
                    className="h-8 bg-background border-border text-sm"
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{f.suffix}</span>
                </div>
                <p className="text-xs text-muted-foreground">{f.hint}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            Coin Recharge Packages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs font-semibold">Package</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">Coins</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">Bonus</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">Price (₹)</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Popular</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Active</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => {
                const isEditing = editingPkg === pkg.id;
                const draft = isEditing && editPkgDraft ? editPkgDraft : pkg;
                return (
                  <TableRow key={pkg.id} className={`border-border hover:bg-muted/30 ${isEditing ? "bg-primary/5" : ""}`}>
                    <TableCell>
                      {isEditing ? (
                        <Input value={draft.label} onChange={(e) => setEditPkgDraft((d) => d ? { ...d, label: e.target.value } : d)} className="h-7 w-28 bg-background border-border text-xs" />
                      ) : (
                        <span className="font-medium text-foreground text-sm">{pkg.label}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input type="number" value={draft.coins} onChange={(e) => setEditPkgDraft((d) => d ? { ...d, coins: parseInt(e.target.value) || 0 } : d)} className="h-7 w-24 bg-background border-border text-xs text-right" />
                      ) : (
                        <span className="text-sm text-foreground font-medium">{pkg.coins.toLocaleString()}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input type="number" value={draft.bonusCoins} onChange={(e) => setEditPkgDraft((d) => d ? { ...d, bonusCoins: parseInt(e.target.value) || 0 } : d)} className="h-7 w-24 bg-background border-border text-xs text-right" />
                      ) : (
                        <span className={`text-sm ${pkg.bonusCoins > 0 ? "text-emerald-400" : "text-muted-foreground"}`}>
                          {pkg.bonusCoins > 0 ? `+${pkg.bonusCoins.toLocaleString()}` : "—"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input type="number" value={draft.priceInr} onChange={(e) => setEditPkgDraft((d) => d ? { ...d, priceInr: parseInt(e.target.value) || 0 } : d)} className="h-7 w-24 bg-background border-border text-xs text-right" />
                      ) : (
                        <span className="text-sm text-foreground font-semibold">₹{pkg.priceInr.toLocaleString()}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={isEditing ? draft.popular : pkg.popular}
                        onCheckedChange={(v) => isEditing ? setEditPkgDraft((d) => d ? { ...d, popular: v } : d) : setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, popular: v } : p)))}
                        className="scale-75"
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={isEditing ? draft.active : pkg.active}
                        onCheckedChange={(v) => isEditing ? setEditPkgDraft((d) => d ? { ...d, active: v } : d) : setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, active: v } : p)))}
                        className="scale-75"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-emerald-400 hover:text-emerald-300" onClick={saveEditPkg}><CheckCircle2 className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground" onClick={() => { setEditingPkg(null); setEditPkgDraft(null); }}><X className="w-4 h-4" /></Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" onClick={() => startEditPkg(pkg)}><Edit2 className="w-3.5 h-3.5" /></Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Add / Remove Coins Tab ───────────────────────────────────────────────────
function AdjustCoinsTab() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [action, setAction] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [logs, setLogs] = useState<ManualCoinLog[]>(mockManualCoinLogs);

  const filteredUsers = search.length >= 2
    ? mockUsers.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search)).slice(0, 6)
    : [];

  const handleSubmit = () => {
    if (!selectedUser || !amount || !reason) return;
    const newLog: ManualCoinLog = {
      id: `ml${Date.now()}`,
      userId: selectedUser.id,
      userName: selectedUser.name,
      action,
      coins: parseInt(amount),
      reason: `${reason}${note ? ` — ${note}` : ""}`,
      adminName: "Super Admin",
      createdAt: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev]);
    toast({
      title: action === "credit" ? "Coins credited" : "Coins debited",
      description: `${parseInt(amount).toLocaleString()} coins ${action === "credit" ? "added to" : "removed from"} ${selectedUser.name}'s wallet.`,
    });
    setSelectedUser(null);
    setSearch("");
    setAmount("");
    setReason("");
    setNote("");
  };

  const REASON_OPTIONS = [
    "Contest winner reward",
    "Festival / holiday bonus",
    "Beta tester reward",
    "Influencer onboarding",
    "Correction — duplicate credit",
    "Correction — failed deduction",
    "Refund for failed recharge",
    "Manual recharge credit",
    "Policy violation — coin penalty",
    "Other",
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              Manual Coin Adjustment
            </CardTitle>
            <p className="text-xs text-muted-foreground">Add or remove coins from any user's wallet</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Search User</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Name or phone number..."
                  className="pl-9 h-9 bg-background border-border text-sm"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSelectedUser(null); }}
                />
              </div>
              {filteredUsers.length > 0 && !selectedUser && (
                <div className="border border-border rounded-lg bg-background divide-y divide-border">
                  {filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 text-left transition-colors"
                      onClick={() => { setSelectedUser(u); setSearch(u.name); }}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">{u.name[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.phone} · {u.city}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-amber-400">{u.coins.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">coins</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {selectedUser && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/8 border border-primary/20">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{selectedUser.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{selectedUser.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedUser.phone} · {selectedUser.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-400">{selectedUser.coins.toLocaleString()} coins</p>
                    <p className="text-xs text-muted-foreground">current balance</p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground" onClick={() => { setSelectedUser(null); setSearch(""); }}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Action</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAction("credit")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${action === "credit" ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" : "border-border text-muted-foreground hover:bg-muted/50"}`}
                >
                  <Plus className="w-4 h-4" />
                  Add Coins
                </button>
                <button
                  onClick={() => setAction("debit")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${action === "debit" ? "bg-rose-500/15 border-rose-500/40 text-rose-400" : "border-border text-muted-foreground hover:bg-muted/50"}`}
                >
                  <Minus className="w-4 h-4" />
                  Remove Coins
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Coin Amount</Label>
              <Input
                type="number"
                placeholder="e.g. 500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-9 bg-background border-border text-sm"
              />
              {amount && (
                <p className="text-xs text-muted-foreground">
                  ≈ ₹{(parseFloat(amount) * 0.5).toLocaleString("en-IN", { maximumFractionDigits: 2 })} INR equivalent
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="h-9 bg-background border-border text-sm">
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  {REASON_OPTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Admin Note (optional)</Label>
              <Textarea
                placeholder="Additional context or reference ID..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-background border-border text-sm resize-none h-16"
              />
            </div>

            <Button
              className="w-full gap-2"
              disabled={!selectedUser || !amount || !reason}
              onClick={handleSubmit}
              variant={action === "credit" ? "default" : "destructive"}
            >
              {action === "credit" ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
              {action === "credit" ? "Credit Coins to Wallet" : "Deduct Coins from Wallet"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
              Recent Manual Adjustments
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {logs.slice(0, 8).map((log) => (
                <div key={log.id} className="flex items-center gap-3 px-5 py-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${log.action === "credit" ? "bg-emerald-500/15" : "bg-rose-500/15"}`}>
                    {log.action === "credit" ? <Plus className="w-4 h-4 text-emerald-400" /> : <Minus className="w-4 h-4 text-rose-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{log.userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{log.reason}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${log.action === "credit" ? "text-emerald-400" : "text-rose-400"}`}>
                      {log.action === "credit" ? "+" : "-"}{log.coins.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Pending Requests Tab ─────────────────────────────────────────────────────
function PendingRequestsTab() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<CoinRequest[]>(mockCoinRequests);
  const [filter, setFilter] = useState("Pending");
  const [search, setSearch] = useState("");
  const [declineNoteFor, setDeclineNoteFor] = useState<string | null>(null);
  const [declineNote, setDeclineNote] = useState("");

  const filtered = requests.filter((r) => {
    const matchStatus = filter === "all" || r.status === filter;
    const matchSearch = r.userName.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const pendingCount = requests.filter((r) => r.status === "Pending").length;

  const handleApprove = (id: string) => {
    setRequests((prev) => prev.map((r) => r.id === id
      ? { ...r, status: "Approved", reviewedBy: "Super Admin", reviewedAt: new Date().toISOString() }
      : r
    ));
    const req = requests.find((r) => r.id === id);
    toast({ title: "Request approved", description: `${req?.requestedCoins.toLocaleString()} coins approved for ${req?.userName}.` });
  };

  const handleDecline = (id: string) => {
    setRequests((prev) => prev.map((r) => r.id === id
      ? { ...r, status: "Declined", reviewedBy: "Super Admin", reviewedAt: new Date().toISOString(), adminNote: declineNote || "Declined by Super Admin" }
      : r
    ));
    const req = requests.find((r) => r.id === id);
    toast({ title: "Request declined", description: `Request from ${req?.userName} has been declined.`, variant: "destructive" });
    setDeclineNoteFor(null);
    setDeclineNote("");
  };

  const STATUS_COLORS: Record<string, string> = {
    Pending:  "bg-amber-500/15 text-amber-400 border-amber-500/20",
    Approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    Declined: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Coin Requests</h3>
          {pendingCount > 0 && (
            <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/20 text-xs gap-1">
              <AlertTriangle className="w-3 h-3" />
              {pendingCount} pending
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search user or type..." className="pl-9 h-9 w-52 bg-background border-border text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-9 w-36 bg-background border-border text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs font-semibold">User</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Type</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">Coins</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">INR</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Reason</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Requested</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Status</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <>
                  <TableRow key={r.id} className="border-border hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground text-sm">{r.userName}</p>
                        <p className="text-xs text-muted-foreground">{r.userPhone} · {r.userCity}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs border ${REQUEST_TYPE_COLORS[r.type]}`}>{r.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-bold text-sm text-amber-400">{r.requestedCoins.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {r.amountInr ? `₹${r.amountInr}` : "—"}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-xs text-muted-foreground truncate">{r.reason}</p>
                      {r.adminNote && <p className="text-xs text-rose-400 truncate mt-0.5">Note: {r.adminNote}</p>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(r.requestedAt).toLocaleDateString("en-IN")}
                      <br />
                      <span>{new Date(r.requestedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs border ${STATUS_COLORS[r.status]}`}>{r.status}</Badge>
                      {r.status !== "Pending" && r.reviewedAt && (
                        <p className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">
                          {new Date(r.reviewedAt).toLocaleDateString("en-IN")}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.status === "Pending" ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1" onClick={() => handleApprove(r.id)}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" className="h-7 px-2.5 text-xs gap-1" onClick={() => setDeclineNoteFor(declineNoteFor === r.id ? null : r.id)}>
                            <XCircle className="w-3.5 h-3.5" />
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">{r.reviewedBy}</span>
                      )}
                    </TableCell>
                  </TableRow>
                  {declineNoteFor === r.id && (
                    <TableRow key={`${r.id}-decline`} className="border-border bg-rose-500/5">
                      <TableCell colSpan={8} className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <Input
                            placeholder="Reason for declining (optional)..."
                            value={declineNote}
                            onChange={(e) => setDeclineNote(e.target.value)}
                            className="h-8 bg-background border-border text-sm flex-1"
                          />
                          <Button size="sm" variant="destructive" className="h-8 px-3 gap-1.5 shrink-0" onClick={() => handleDecline(r.id)}>
                            <XCircle className="w-3.5 h-3.5" />
                            Confirm Decline
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground shrink-0" onClick={() => { setDeclineNoteFor(null); setDeclineNote(""); }}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">
                    No requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Ledger Tab ───────────────────────────────────────────────────────────────
function LedgerTab() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = mockTransactions.filter((t) => {
    const matchSearch = t.userName.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || t.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <CardTitle className="text-base font-semibold text-foreground flex-1">Full Transaction Ledger</CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search user or description..." className="pl-9 h-9 w-64 bg-background border-border text-sm" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
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
                <TableCell><Badge className={`text-xs border ${TYPE_COLORS[t.type]}`}>{t.type}</Badge></TableCell>
                <TableCell className="text-right">
                  <span className={`font-semibold text-sm ${t.type === "Earned" || t.type === "Recharged" || t.type === "Gift Received" ? "text-emerald-400" : "text-rose-400"}`}>
                    {t.type === "Earned" || t.type === "Recharged" || t.type === "Gift Received" ? "+" : "-"}{t.amount.toLocaleString()}
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
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-8 px-3 border-border"><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="h-8 px-3 border-border"><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CoinsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isSuperAdmin, setIsSuperAdmin] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("ridhi_admin_role");
    setIsSuperAdmin(!role || role === "super_admin" || role === "host" || role === "agent");
  }, []);

  const pendingCount = mockCoinRequests.filter((r) => r.status === "Pending").length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <img src={COIN_IMG} alt="Ridhi Coin" className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            Ridhi Coin Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Coin values, packages, manual adjustments & approval queue</p>
        </div>
        {isSuperAdmin && (
          <Badge className="gap-1.5 bg-primary/15 text-primary border-primary/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Super Admin
          </Badge>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b border-border pb-0 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const isLocked = tab.superOnly && !isSuperAdmin;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              } ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              disabled={isLocked}
            >
              {isLocked ? <Lock className="w-3.5 h-3.5" /> : <tab.icon className="w-3.5 h-3.5" />}
              {tab.label}
              {tab.id === "requests" && pendingCount > 0 && (
                <span className="ml-0.5 bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">{pendingCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview"  && <OverviewTab />}
      {activeTab === "values"    && (isSuperAdmin ? <CoinValuesTab />   : <SuperAdminGate />)}
      {activeTab === "adjust"    && (isSuperAdmin ? <AdjustCoinsTab />  : <SuperAdminGate />)}
      {activeTab === "requests"  && (isSuperAdmin ? <PendingRequestsTab /> : <SuperAdminGate />)}
      {activeTab === "ledger"    && <LedgerTab />}
    </div>
  );
}
