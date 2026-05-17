import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Bell, Megaphone, Send, Clock, Users, TrendingUp, Eye, MousePointer, CheckCircle2, Plus } from "lucide-react";
import { mockCampaigns, type Campaign } from "@/data/mock-data";
import { useToast } from "@/hooks/use-toast";

const CAMPAIGN_STATUS: Record<string, string> = {
  Draft: "bg-muted/60 text-muted-foreground border-border",
  Active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Completed: "bg-blue-500/15 text-blue-400 border-blue-500/20",
};

const SENT_NOTIFICATIONS = [
  { id: "n1", title: "Diwali Special Coins!", body: "Get 2x coins today only. Don't miss out!", target: "All Users", sentAt: "2026-05-12 10:30", reach: 142000, openRate: 34.2 },
  { id: "n2", title: "New Reels Feature", body: "Create stunning reels with new effects", target: "Hindi", sentAt: "2026-05-10 14:00", reach: 89000, openRate: 28.7 },
  { id: "n3", title: "Weekly Leaderboard", body: "Check your rank this week!", target: "Mumbai", sentAt: "2026-05-08 09:00", reach: 42000, openRate: 41.3 },
  { id: "n4", title: "IPL Special — React!", body: "Share your reactions live during IPL", target: "All Users", sentAt: "2026-05-06 19:00", reach: 148000, openRate: 52.1 },
  { id: "n5", title: "Complete Your Profile", body: "Get 50 free coins by completing your profile", target: "Pending", sentAt: "2026-05-04 11:00", reach: 12000, openRate: 61.8 },
];

export default function MarketingPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("all");
  const [scheduledDate, setScheduledDate] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [sending, setSending] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast({ title: "Missing fields", description: "Please fill in the title and body.", variant: "destructive" });
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    toast({ title: "Notification sent!", description: `Push notification sent to ${target === "all" ? "all users" : target} users.` });
    setTitle("");
    setBody("");
    setTarget("all");
    setScheduledDate("");
    setIsScheduled(false);
  };

  const statsTop = [
    { label: "Notifications Sent (30d)", value: "5", icon: Bell, color: "text-violet-400" },
    { label: "Total Reach (30d)", value: "433K", icon: Users, color: "text-blue-400" },
    { label: "Avg Open Rate", value: "43.6%", icon: Eye, color: "text-emerald-400" },
    { label: "Active Campaigns", value: `${campaigns.filter((c) => c.status === "Active").length}`, icon: Megaphone, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Marketing & Campaigns</h1>
        <p className="text-muted-foreground text-sm mt-1">Send push notifications and manage marketing campaigns</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsTop.map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="push">
        <TabsList className="bg-muted/50 border border-border">
          <TabsTrigger value="push" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">
            <Bell className="w-3.5 h-3.5 mr-1.5" /> Push Notifications
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm">
            <Megaphone className="w-3.5 h-3.5 mr-1.5" /> Campaigns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="push" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Send className="w-4 h-4 text-primary" /> Compose Notification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm text-foreground font-medium">Title</Label>
                  <Input
                    placeholder="Notification title..."
                    className="bg-background border-border"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground text-right">{title.length}/60</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm text-foreground font-medium">Body</Label>
                  <Textarea
                    placeholder="Notification message..."
                    className="bg-background border-border resize-none"
                    rows={3}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground text-right">{body.length}/160</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm text-foreground font-medium">Target Audience</Label>
                  <Select value={target} onValueChange={setTarget}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users (148K)</SelectItem>
                      <SelectItem value="Hindi">Hindi Speakers (62K)</SelectItem>
                      <SelectItem value="Tamil">Tamil Speakers (18K)</SelectItem>
                      <SelectItem value="Telugu">Telugu Speakers (14K)</SelectItem>
                      <SelectItem value="Mumbai">Mumbai (42K)</SelectItem>
                      <SelectItem value="Delhi">Delhi (38K)</SelectItem>
                      <SelectItem value="Bangalore">Bangalore (31K)</SelectItem>
                      <SelectItem value="Male">Male (88K)</SelectItem>
                      <SelectItem value="Female">Female (60K)</SelectItem>
                      <SelectItem value="Pending">Pending Users (12K)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3 py-1">
                  <Switch
                    checked={isScheduled}
                    onCheckedChange={setIsScheduled}
                    id="schedule-toggle"
                  />
                  <Label htmlFor="schedule-toggle" className="text-sm text-foreground cursor-pointer">Schedule for later</Label>
                </div>

                {isScheduled && (
                  <div className="space-y-1.5">
                    <Label className="text-sm text-foreground font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Send Date & Time
                    </Label>
                    <Input
                      type="datetime-local"
                      className="bg-background border-border"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                )}

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  onClick={handleSend}
                  disabled={sending}
                >
                  {sending ? (
                    <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Sending...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Send className="w-4 h-4" /> {isScheduled ? "Schedule Notification" : "Send Now"}</span>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-foreground">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-background rounded-2xl p-4 border border-border shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #7B2FBE, #E91E8C)" }}>
                        <Bell className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{title || "Notification Title"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{body || "Your notification message will appear here..."}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">now · Ridhi</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground">Quick Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "Keep titles under 40 chars for best display",
                    "Best send time: 7-9 PM IST for max open rates",
                    "Personalized messages get 2x higher engagement",
                    "Test with a small segment before mass send",
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">{tip}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-foreground">Sent Notifications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs font-semibold">Title</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold">Target</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Reach</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Open Rate</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold">Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SENT_NOTIFICATIONS.map((n) => (
                    <TableRow key={n.id} className="border-border hover:bg-muted/30">
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{n.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-xs">{n.body}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs border-border text-muted-foreground">{n.target}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium text-foreground">{(n.reach / 1000).toFixed(0)}K</TableCell>
                      <TableCell className="text-right">
                        <span className={`text-sm font-semibold ${n.openRate >= 40 ? "text-emerald-400" : n.openRate >= 25 ? "text-amber-400" : "text-muted-foreground"}`}>
                          {n.openRate}%
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{n.sentAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">Marketing Campaigns</CardTitle>
                <Button size="sm" className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> New Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs font-semibold">Campaign</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold">Type</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Reach</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Clicks</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold text-right">Conv.</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold">Duration</TableHead>
                    <TableHead className="text-muted-foreground text-xs font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((c) => (
                    <TableRow key={c.id} className="border-border hover:bg-muted/30">
                      <TableCell className="font-medium text-foreground text-sm">{c.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs border-border text-muted-foreground">{c.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{(c.reach / 1000).toFixed(0)}K</TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm text-foreground font-medium">{c.clicks.toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm text-emerald-400 font-semibold">{c.conversions}</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{c.startDate} → {c.endDate}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs border ${CAMPAIGN_STATUS[c.status]}`}>{c.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
