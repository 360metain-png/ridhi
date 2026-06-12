import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadCSV } from "@/lib/utils";
import {
  Star, Users, TrendingUp, Crown, Award, Search, Zap, Heart,
  MessageCircle, Share2, Eye, MapPin, Download,
} from "lucide-react";

const VIBE_STARS = [
  { id: "v1", name: "Priya Sharma", city: "Mumbai", tier: "Diamond", points: 45600, followers: 34000, engagement: 12.4, posts: 234, reels: 89, stories: 120, status: "active" },
  { id: "v2", name: "Rahul Verma", city: "Delhi", tier: "Platinum", points: 38900, followers: 28000, engagement: 10.8, posts: 189, reels: 67, stories: 98, status: "active" },
  { id: "v3", name: "Ananya Singh", city: "Bangalore", tier: "Platinum", points: 34500, followers: 21000, engagement: 9.2, posts: 156, reels: 45, stories: 67, status: "active" },
  { id: "v4", name: "Karan Mehta", city: "Hyderabad", tier: "Gold", points: 27800, followers: 18000, engagement: 8.5, posts: 134, reels: 34, stories: 56, status: "active" },
  { id: "v5", name: "Deepika Nair", city: "Chennai", tier: "Gold", points: 23400, followers: 15000, engagement: 7.8, posts: 112, reels: 28, stories: 45, status: "active" },
  { id: "v6", name: "Arjun Reddy", city: "Pune", tier: "Silver", points: 18900, followers: 12000, engagement: 6.4, posts: 89, reels: 23, stories: 34, status: "active" },
  { id: "v7", name: "Sneha Patel", city: "Ahmedabad", tier: "Silver", points: 15600, followers: 10000, engagement: 5.8, posts: 67, reels: 18, stories: 28, status: "inactive" },
  { id: "v8", name: "Vikram Kumar", city: "Jaipur", tier: "Bronze", points: 12300, followers: 8000, engagement: 4.2, posts: 45, reels: 12, stories: 20, status: "active" },
];

const TIER_BADGES: Record<string, string> = {
  Diamond: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  Platinum: "bg-teal-500/15 text-teal-400 border-teal-500/20",
  Gold: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  Silver: "bg-slate-500/15 text-slate-400 border-slate-500/20",
  Bronze: "bg-orange-500/15 text-orange-400 border-orange-500/20",
};

export default function VibeStarsPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("stars");
  const totalStars = VIBE_STARS.length;
  const totalFollowers = VIBE_STARS.reduce((s, v) => s + v.followers, 0);
  const avgEngagement = (VIBE_STARS.reduce((s, v) => s + v.engagement, 0) / VIBE_STARS.length).toFixed(1);
  const topTier = VIBE_STARS.filter((v) => v.tier === "Diamond").length;

  const filtered = VIBE_STARS.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.city.toLowerCase().includes(search.toLowerCase()) ||
    v.tier.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
            const rows: Record<string, string | number>[] = [];
            downloadCSV("vibe-stars_report.csv", rows);
          }}>
            <Download className="w-3 h-3" /> Export CSV
          </Button>
        </div>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500" />
            Vibe Stars
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Top creators, engagement leaders, and tier rankings
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9 w-64" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Users} label="Vibe Stars" value={totalStars.toString()} />
        <KpiCard icon={Heart} label="Followers" value={totalFollowers.toLocaleString()} />
        <KpiCard icon={TrendingUp} label="Avg Engagement" value={`${avgEngagement}%`} />
        <KpiCard icon={Crown} label="Diamond" value={topTier.toString()} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stars">Stars</TabsTrigger>
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="stars" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Star</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Followers</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead>Reels</TableHead>
                    <TableHead>Stories</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((v, idx) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-bold">#{idx + 1}</TableCell>
                      <TableCell className="font-medium">{v.name}</TableCell>
                      <TableCell>{v.city}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={TIER_BADGES[v.tier]}>
                          {v.tier}
                        </Badge>
                      </TableCell>
                      <TableCell>{v.points.toLocaleString()}</TableCell>
                      <TableCell>{v.followers.toLocaleString()}</TableCell>
                      <TableCell>{v.engagement}%</TableCell>
                      <TableCell>{v.posts}</TableCell>
                      <TableCell>{v.reels}</TableCell>
                      <TableCell>{v.stories}</TableCell>
                      <TableCell>
                        <Badge variant={v.status === "active" ? "default" : "secondary"}>
                          {v.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tier Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["Diamond", "Platinum", "Gold", "Silver", "Bronze"].map((tier) => {
                  const count = VIBE_STARS.filter((v) => v.tier === tier).length;
                  const total = VIBE_STARS.length;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={tier} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: tier === "Diamond" ? "#7B2FBE15" : tier === "Platinum" ? "#06B6D415" : tier === "Gold" ? "#F59E0B15" : tier === "Silver" ? "#64748B15" : "#F9731615" }}>
                        <Star className="w-4 h-4" style={{ color: tier === "Diamond" ? "#7B2FBE" : tier === "Platinum" ? "#06B6D4" : tier === "Gold" ? "#F59E0B" : tier === "Silver" ? "#64748B" : "#F97316" }} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{tier}</div>
                        <div className="text-xs text-muted-foreground">{count} stars</div>
                      </div>
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-sm font-bold">{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Engaged Stars</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filtered.sort((a, b) => b.engagement - a.engagement).slice(0, 5).map((v, idx) => (
                  <div key={v.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/15">
                      <TrendingUp className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{v.name}</div>
                      <div className="text-xs text-muted-foreground">{v.city}</div>
                    </div>
                    <div className="text-sm font-bold">{v.engagement}% engagement</div>
                    <div className="text-sm font-bold">{v.followers.toLocaleString()} followers</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
            const rows: Record<string, string | number>[] = [];
            downloadCSV("vibe-stars_report.csv", rows);
          }}>
            <Download className="w-3 h-3" /> Export CSV
          </Button>
        </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="text-lg font-bold mt-1">{value}</div>
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-500/15">
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
