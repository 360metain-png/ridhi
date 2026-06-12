import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadCSV } from "@/lib/utils";
import {
  Headphones, Mic, Play, Pause, TrendingUp, Users, Clock, Search,
  Podcast, Star, Heart, Share2, MessageCircle, MapPin, Download,
} from "lucide-react";

const PODCASTS = [
  { id: "p1", title: "Desi Vibes", host: "DJ Aryan", city: "Mumbai", genre: "Music", episodes: 45, listeners: 34000, likes: 8900, status: "live", duration: "1h 30m" },
  { id: "p2", title: "Bollywood Talk", host: "Priya Sharma", city: "Delhi", genre: "Entertainment", episodes: 34, listeners: 28000, likes: 6700, status: "live", duration: "45m" },
  { id: "p3", title: "Tech India", host: "Rahul Verma", city: "Bangalore", genre: "Tech", episodes: 67, listeners: 21000, likes: 5600, status: "live", duration: "1h" },
  { id: "p4", title: "Comedy Hour", host: "Karan Mehta", city: "Hyderabad", genre: "Comedy", episodes: 23, listeners: 18000, likes: 4500, status: "live", duration: "30m" },
  { id: "p5", title: "Startup Stories", host: "Ananya Singh", city: "Pune", genre: "Business", episodes: 56, listeners: 15000, likes: 3400, status: "live", duration: "1h 15m" },
  { id: "p6", title: "Foodie Diaries", host: "Deepika Nair", city: "Chennai", genre: "Food", episodes: 12, listeners: 12000, likes: 2800, status: "upcoming", duration: "40m" },
  { id: "p7", title: "Sufi Sessions", host: "Arjun Reddy", city: "Kochi", genre: "Music", episodes: 89, listeners: 9000, likes: 2100, status: "live", duration: "1h" },
  { id: "p8", title: "Health Talk", host: "Sneha Patel", city: "Ahmedabad", genre: "Health", episodes: 34, listeners: 8000, likes: 1900, status: "live", duration: "50m" },
];

export default function PodcastsPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("podcasts");
  const totalPodcasts = PODCASTS.length;
  const livePodcasts = PODCASTS.filter((p) => p.status === "live");
  const totalListeners = PODCASTS.reduce((s, p) => s + p.listeners, 0);
  const totalEpisodes = PODCASTS.reduce((s, p) => s + p.episodes, 0);

  const filtered = PODCASTS.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.host.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase()) ||
    p.genre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
            const rows: Record<string, string | number>[] = [];
            downloadCSV("podcasts_report.csv", rows);
          }}>
            <Download className="w-3 h-3" /> Export CSV
          </Button>
        </div>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Headphones className="w-6 h-6 text-rose-500" />
            Podcasts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage podcast channels, episodes, and live shows
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9 w-64" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Podcast} label="Podcasts" value={totalPodcasts.toString()} />
        <KpiCard icon={Play} label="Live" value={livePodcasts.length.toString()} />
        <KpiCard icon={Users} label="Listeners" value={totalListeners.toLocaleString()} />
        <KpiCard icon={Mic} label="Episodes" value={totalEpisodes.toLocaleString()} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
          <TabsTrigger value="genres">Genres</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="podcasts" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Podcast</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Episodes</TableHead>
                    <TableHead>Listeners</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.title}</TableCell>
                      <TableCell>{p.host}</TableCell>
                      <TableCell>{p.city}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{p.genre}</Badge>
                      </TableCell>
                      <TableCell>{p.episodes}</TableCell>
                      <TableCell>{p.listeners.toLocaleString()}</TableCell>
                      <TableCell>{p.likes.toLocaleString()}</TableCell>
                      <TableCell>{p.duration}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === "live" ? "default" : "secondary"}>
                          {p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="genres" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Genres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["Music", "Entertainment", "Tech", "Comedy", "Business", "Food", "Health"].map((genre) => {
                  const count = PODCASTS.filter((p) => p.genre === genre).length;
                  const listeners = PODCASTS.filter((p) => p.genre === genre).reduce((s, p) => s + p.listeners, 0);
                  return (
                    <div key={genre} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-500/15">
                        <Headphones className="w-4 h-4 text-rose-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{genre}</div>
                        <div className="text-xs text-muted-foreground">{count} podcasts</div>
                      </div>
                      <div className="text-sm font-bold">{listeners.toLocaleString()} listeners</div>
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
              <CardTitle className="text-sm font-medium">Top Podcasts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filtered.sort((a, b) => b.listeners - a.listeners).slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-500/15">
                      <TrendingUp className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{p.title}</div>
                      <div className="text-xs text-muted-foreground">{p.host}</div>
                    </div>
                    <div className="text-sm font-bold">{p.listeners.toLocaleString()} listeners</div>
                    <div className="text-sm font-bold">{p.likes.toLocaleString()} likes</div>
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
            downloadCSV("podcasts_report.csv", rows);
          }}>
            <Download className="w-3 h-3" /> Export CSV
          </Button>
        </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="text-lg font-bold mt-1">{value}</div>
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-rose-500/15">
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
