import { useParams, Link } from "wouter";
import { mockUsers, mockPosts } from "@/data/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Mail, Phone, ShieldCheck, Ban, AlertTriangle, Trash2, Globe, Download} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getUserAnalytics } from "@/data/analytics-mock";
import { downloadCSV } from "@/lib/utils";

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
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground text-center py-8">Transaction history not available for mock data.</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
