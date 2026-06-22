import { useMemo } from "react";
import { useParams, Link } from "wouter";
import { mockUsers, mockPosts, mockTransactions } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, MapPin, Calendar, Mail, Phone, ShieldCheck, Ban, AlertTriangle, Trash2, Globe, Download, ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown, Coins} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getUserAnalytics } from "@/data/analytics-mock";
import { downloadCSV } from "@/lib/utils";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

export default function UserDetail() {
  const params = useParams();
  const userId = params.id;
  const user = mockUsers.find(u => u.id === userId) || mockUsers[0];
  const userPosts = mockPosts.filter(p => p.userId === user.id).slice(0, 6);
  const analytics = getUserAnalytics(user.id);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'suspended': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
          const rows: Record<string, string | number>[] = [];
          downloadCSV("user-detail_report.csv", rows);
        }}>
          <Download className="w-3 h-3" /> Export CSV
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/users">
          <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">User Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                  {user.name}
                  {user.isVerified && <ShieldCheck className="w-5 h-5 text-primary" />}
                </h2>
                <p className="text-muted-foreground">@{user.id}</p>
                <div className="mt-2">
                  <Badge variant="outline" className={getStatusColor(user.status)}>
                    {user.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="w-full grid grid-cols-3 gap-2 border-y py-4 my-4">
                <div className="text-center">
                  <div className="font-bold text-lg">{user.followers}</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{user.following}</div>
                  <div className="text-xs text-muted-foreground">Following</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg text-primary">{user.coins}</div>
                  <div className="text-xs text-muted-foreground">Coins</div>
                </div>
              </div>

              <div className="w-full space-y-3 text-sm text-left">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{user.city}, {user.state}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span>{user.language}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Joined {user.joinDate}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <Button className="w-full gap-2"><ShieldCheck className="w-4 h-4"/> Verify Account</Button>
              <Button variant="outline" className="w-full gap-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10"><AlertTriangle className="w-4 h-4"/> Send Warning</Button>
              <Button variant="outline" className="w-full gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"><Ban className="w-4 h-4"/> Suspend Account</Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm text-muted-foreground">Total Posts</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold">{user.posts}</div>
               </CardContent>
             </Card>
             <Card className="border-red-500/20">
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm text-red-500">Reports Received</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold text-red-500">{user.reportsReceived}</div>
               </CardContent>
             </Card>
          </div>

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Recent Content</TabsTrigger>
              <TabsTrigger value="activity">Activity Log</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {userPosts.map((post, i) => (
                  <div key={i} className="aspect-square bg-muted rounded-xl flex items-center justify-center relative overflow-hidden group border">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                    <span className="relative z-10 text-muted-foreground text-xs uppercase tracking-widest">{post.type}</span>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="activity">
              {analytics ? (
                <div className="space-y-4">
                  {/* Engagement Score */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Engagement Score</div>
                          <div className="text-3xl font-bold">{analytics.engagementScore}/100</div>
                        </div>
                        <Badge variant={analytics.engagementScore >= 70 ? "default" : analytics.engagementScore >= 40 ? "secondary" : "outline"}
                          className={analytics.engagementScore >= 70 ? "bg-green-500" : ""}>
                          {analytics.engagementScore >= 70 ? "Power User" : analytics.engagementScore >= 40 ? "Active" : "Casual"}
                        </Badge>
                      </div>
                      <Progress value={analytics.engagementScore} className="h-2" />
                    </CardContent>
                  </Card>

                  {/* Session Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Sessions</div>
                        <div className="text-xl font-bold">{analytics.totalSessions}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Duration</div>
                        <div className="text-xl font-bold">{analytics.totalDurationMinutes}m</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Avg Session</div>
                        <div className="text-xl font-bold">{analytics.avgSessionMinutes}m</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">Last Active</div>
                        <div className="text-xl font-bold">{analytics.lastActive}</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Screen Visits */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Screen Visits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(analytics.screenVisits)
                          .sort((a, b) => b[1].visits - a[1].visits)
                          .slice(0, 8)
                          .map(([screen, data]) => (
                            <div key={screen} className="flex items-center gap-3">
                              <span className="text-sm capitalize w-32">{screen.replace(/_/g, " ")}</span>
                              <Progress value={Math.min(100, (data.visits / (analytics.screenVisits[Object.keys(analytics.screenVisits)[0]]?.visits || 1)) * 100)} className="flex-1 h-2" />
                              <span className="text-sm text-muted-foreground w-16 text-right">{data.visits} visits</span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Content Interactions */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Content Interactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                          <div className="text-2xl font-bold">{analytics.contentInteractions.likes}</div>
                          <div className="text-sm text-muted-foreground">Likes</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{analytics.contentInteractions.comments}</div>
                          <div className="text-sm text-muted-foreground">Comments</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{analytics.contentInteractions.shares}</div>
                          <div className="text-sm text-muted-foreground">Shares</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{analytics.contentInteractions.reelsWatched}</div>
                          <div className="text-sm text-muted-foreground">Reels</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{analytics.contentInteractions.postsCreated}</div>
                          <div className="text-sm text-muted-foreground">Posts</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{analytics.contentInteractions.liveJoined}</div>
                          <div className="text-sm text-muted-foreground">Live</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dating & Commerce */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Dating Activity</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm"><span>Profiles Viewed</span><span className="font-medium">{analytics.datingActivity.profilesViewed}</span></div>
                        <div className="flex justify-between text-sm"><span>Matches</span><span className="font-medium">{analytics.datingActivity.matches}</span></div>
                        <div className="flex justify-between text-sm"><span>Messages</span><span className="font-medium">{analytics.datingActivity.messagesSent}</span></div>
                        <div className="flex justify-between text-sm"><span>Calls</span><span className="font-medium">{analytics.datingActivity.callsMade}</span></div>
                        <div className="flex justify-between text-sm"><span>Blocks</span><span className="font-medium">{analytics.datingActivity.blocks}</span></div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Commerce Activity</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm"><span>Recharges</span><span className="font-medium">{analytics.commerceActivity.coinRecharges}</span></div>
                        <div className="flex justify-between text-sm"><span>Recharge Amount</span><span className="font-medium">Rs.{analytics.commerceActivity.rechargeAmount.toLocaleString()}</span></div>
                        <div className="flex justify-between text-sm"><span>Subscriptions</span><span className="font-medium">{analytics.commerceActivity.subscriptions.join(", ") || "None"}</span></div>
                        <div className="flex justify-between text-sm"><span>Withdrawals</span><span className="font-medium">{analytics.commerceActivity.withdrawals}</span></div>
                        <div className="flex justify-between text-sm"><span>Ad Campaigns</span><span className="font-medium">{analytics.commerceActivity.adCampaigns}</span></div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Feature Usage */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Feature Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(analytics.featureUsage)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 8)
                          .map(([feat, count]) => (
                            <div key={feat} className="flex items-center gap-3">
                              <span className="text-sm capitalize w-32">{feat.replace(/_/g, " ")}</span>
                              <Progress value={Math.min(100, (count / (Math.max(...Object.values(analytics.featureUsage)))) * 100)} className="flex-1 h-2" />
                              <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Daily Activity (last 7 days) */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Daily Activity (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analytics.dailyActivity.slice(-7).map((d) => ({ ...d, label: d.date.slice(5) }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="sessions" stroke="#7B2FBE" strokeWidth={2} dot={{ r: 3 }} name="Sessions" />
                            <Line type="monotone" dataKey="likes" stroke="#E91E8C" strokeWidth={2} dot={{ r: 3 }} name="Likes" />
                            <Line type="monotone" dataKey="events" stroke="#06B6D4" strokeWidth={2} dot={{ r: 3 }} name="Events" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Retention Heatmap */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Retention (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {Object.entries(analytics.retention).map(([date, active]) => (
                          <div key={date} className="flex flex-col items-center gap-1">
                            <div className={`w-8 h-8 rounded-md ${active ? "bg-green-500" : "bg-gray-200"}`} />
                            <span className="text-[10px] text-muted-foreground">{date.slice(5)}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Chat Activity */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Chat Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div><div className="text-xl font-bold">{analytics.chatActivity.messagesSent}</div><div className="text-sm text-muted-foreground">Sent</div></div>
                        <div><div className="text-xl font-bold">{analytics.chatActivity.messagesReceived}</div><div className="text-sm text-muted-foreground">Received</div></div>
                        <div><div className="text-xl font-bold">{analytics.chatActivity.conversations}</div><div className="text-sm text-muted-foreground">Conversations</div></div>
                        <div><div className="text-xl font-bold">{analytics.chatActivity.activeConversations}</div><div className="text-sm text-muted-foreground">Active</div></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground text-center py-8">No analytics data available for this user.</div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="transactions">
              <UserTransactions userId={user.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// ═══ User Transactions (Incoming / Outgoing Coin Detail) ═══

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any; direction: "in" | "out" }> = {
  "Earned":         { label: "Earned",         color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: ArrowUpRight, direction: "in" },
  "Recharged":      { label: "Recharged",      color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20",  icon: ArrowUpRight, direction: "in" },
  "Gift Received":  { label: "Gift Received",  color: "text-pink-400",   bg: "bg-pink-500/10",   border: "border-pink-500/20",   icon: ArrowUpRight, direction: "in" },
  "Spent":          { label: "Spent",          color: "text-rose-400",   bg: "bg-rose-500/10",   border: "border-rose-500/20",   icon: ArrowDownRight, direction: "out" },
  "Gift Sent":      { label: "Gift Sent",      color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  icon: ArrowDownRight, direction: "out" },
};

function UserTransactions({ userId }: { userId: string }) {
  const txs = mockTransactions.filter((t) => t.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const incoming = txs.filter((t) => TYPE_CONFIG[t.type]?.direction === "in");
  const outgoing = txs.filter((t) => TYPE_CONFIG[t.type]?.direction === "out");
  const totalIn = incoming.reduce((s, t) => s + t.amount, 0);
  const totalOut = outgoing.reduce((s, t) => s + t.amount, 0);
  const netFlow = totalIn - totalOut;

  const dailyData = useMemo(() => {
    const map = new Map<string, { in: number; out: number }>();
    txs.forEach((t) => {
      const d = new Date(t.createdAt).toLocaleDateString("en-IN");
      const cur = map.get(d) || { in: 0, out: 0 };
      if (TYPE_CONFIG[t.type]?.direction === "in") cur.in += t.amount;
      else cur.out += t.amount;
      map.set(d, cur);
    });
    return Array.from(map.entries()).map(([date, data]) => ({ date, ...data })).reverse();
  }, [txs]);

  const exportCSV = () => {
    const rows = txs.map((t) => ({
      date: new Date(t.createdAt).toLocaleDateString("en-IN"),
      time: new Date(t.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      type: t.type,
      direction: TYPE_CONFIG[t.type]?.direction === "in" ? "Incoming" : "Outgoing",
      amount: t.amount,
      balanceAfter: t.balanceAfter,
      description: t.description,
    }));
    downloadCSV(`user_${userId}_transactions.csv`, rows);
  };

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Total Incoming</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="text-xl font-bold text-emerald-400">+{totalIn.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">{incoming.length} transactions</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Total Outgoing</span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-rose-400" />
              </div>
            </div>
            <div className="text-xl font-bold text-rose-400">-{totalOut.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">{outgoing.length} transactions</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">Net Balance</span>
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-violet-400" />
              </div>
            </div>
            <div className={`text-xl font-bold ${netFlow >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {netFlow >= 0 ? "+" : ""}{netFlow.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{txs.length} total transactions</div>
          </CardContent>
        </Card>
      </div>

      {/* Daily flow chart */}
      {dailyData.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Daily Coin Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="in" name="Incoming" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="out" name="Outgoing" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction list */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Coins className="w-4 h-4 text-primary" />
            Transaction Ledger
          </CardTitle>
          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={exportCSV}>
            <Download className="w-3 h-3" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs">Date</TableHead>
                <TableHead className="text-muted-foreground text-xs">Type</TableHead>
                <TableHead className="text-muted-foreground text-xs">Direction</TableHead>
                <TableHead className="text-muted-foreground text-xs text-right">Amount</TableHead>
                <TableHead className="text-muted-foreground text-xs text-right">Balance After</TableHead>
                <TableHead className="text-muted-foreground text-xs">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                    No coin transactions for this user.
                  </TableCell>
                </TableRow>
              ) : (
                txs.map((tx) => {
                  const cfg = TYPE_CONFIG[tx.type] || { label: tx.type, color: "text-muted-foreground", bg: "bg-muted", border: "border-border", icon: Coins, direction: "out" };
                  return (
                    <TableRow key={tx.id} className="border-border hover:bg-muted/30">
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString("en-IN")}
                        <br />
                        <span>{new Date(tx.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                          <cfg.icon className="w-3 h-3 mr-1" />
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={cfg.direction === "in" ? "default" : "destructive"} className="text-xs">
                          {cfg.direction === "in" ? "Incoming" : "Outgoing"}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right text-sm font-bold ${cfg.direction === "in" ? "text-emerald-400" : "text-rose-400"}`}>
                        {cfg.direction === "in" ? "+" : "-"}{tx.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {tx.balanceAfter.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                        {tx.description}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
