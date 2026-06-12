import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadCSV } from "@/lib/utils";
import {
  Clapperboard, Eye, Heart, TrendingUp, Clock, Users, AlertTriangle,
  Search, Plus, Trash2, Ban, Download,
} from "lucide-react";

const STORIES = [
  { id: "s1", user: "Priya Sharma", city: "Mumbai", type: "image", views: 3400, likes: 1200, duration: "24h", posted: "2025-06-11 08:00", status: "active", flagged: false },
  { id: "s2", user: "Rahul Verma", city: "Delhi", type: "video", views: 5600, likes: 2100, duration: "24h", posted: "2025-06-11 09:00", status: "active", flagged: false },
  { id: "s3", user: "Ananya Singh", city: "Bangalore", type: "image", views: 2100, likes: 800, duration: "24h", posted: "2025-06-11 07:00", status: "active", flagged: true },
  { id: "s4", user: "Karan Mehta", city: "Hyderabad", type: "video", views: 8900, likes: 3400, duration: "24h", posted: "2025-06-11 10:00", status: "active", flagged: false },
  { id: "s5", user: "Deepika Nair", city: "Chennai", type: "image", views: 1200, likes: 400, duration: "24h", posted: "2025-06-11 06:00", status: "active", flagged: false },
  { id: "s6", user: "Arjun Reddy", city: "Pune", type: "video", views: 4500, likes: 1600, duration: "24h", posted: "2025-06-11 11:00", status: "active", flagged: true },
  { id: "s7", user: "Sneha Patel", city: "Ahmedabad", type: "image", views: 1800, likes: 600, duration: "24h", posted: "2025-06-11 05:00", status: "active", flagged: false },
  { id: "s8", user: "Vikram Kumar", city: "Jaipur", type: "video", views: 6700, likes: 2300, duration: "24h", posted: "2025-06-11 12:00", status: "active", flagged: false },
];

export default function StoriesPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const totalStories = STORIES.length;
  const totalViews = STORIES.reduce((s, st) => s + st.views, 0);
  const totalLikes = STORIES.reduce((s, st) => s + st.likes, 0);
  const flaggedStories = STORIES.filter((s) => s.flagged);

  const filtered = STORIES.filter((s) =>
    s.user.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase()) ||
    s.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
            const rows: Record<string, string | number>[] = [];
            downloadCSV("stories_report.csv", rows);
          }}>
            <Download className="w-3 h-3" /> Export CSV
          </Button>
        </div>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clapperboard className="w-6 h-6 text-pink-500" />
            Stories
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and manage user stories
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9 w-64" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Clapperboard} label="Total Stories" value={totalStories.toString()} />
        <KpiCard icon={Eye} label="Total Views" value={totalViews.toLocaleString()} />
        <KpiCard icon={Heart} label="Total Likes" value={totalLikes.toLocaleString()} />
        <KpiCard icon={AlertTriangle} label="Flagged" value={flaggedStories.length.toString()} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="flagged">Flagged</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Flagged</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.user}</TableCell>
                      <TableCell>{s.city}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{s.type}</Badge>
                      </TableCell>
                      <TableCell>{s.views.toLocaleString()}</TableCell>
                      <TableCell>{s.likes.toLocaleString()}</TableCell>
                      <TableCell>{s.posted}</TableCell>
                      <TableCell>{s.duration}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === "active" ? "default" : "secondary"}>
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {s.flagged ? (
                          <div className="flex items-center gap-1 text-red-400">
                            <AlertTriangle className="w-3 h-3" /> Yes
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">No</div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.filter((s) => s.flagged).map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.user}</TableCell>
                      <TableCell>{s.city}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{s.type}</Badge>
                      </TableCell>
                      <TableCell>{s.views.toLocaleString()}</TableCell>
                      <TableCell>{s.likes.toLocaleString()}</TableCell>
                      <TableCell>{s.posted}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Ban className="w-3 h-3" /> Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Story Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["image", "video"].map((type) => {
                  const count = STORIES.filter((s) => s.type === type).length;
                  const views = STORIES.filter((s) => s.type === type).reduce((s, st) => s + st.views, 0);
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-pink-500/15">
                        <Clapperboard className="w-4 h-4 text-pink-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium capitalize">{type}</div>
                        <div className="text-xs text-muted-foreground">{count} stories</div>
                      </div>
                      <div className="text-sm font-bold">{views.toLocaleString()} views</div>
                    </div>
                  );
                })}
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
            downloadCSV("stories_report.csv", rows);
          }}>
            <Download className="w-3 h-3" /> Export CSV
          </Button>
        </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="text-lg font-bold mt-1">{value}</div>
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-pink-500/15">
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
