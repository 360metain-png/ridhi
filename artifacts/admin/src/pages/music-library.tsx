import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Music, Mic, Headphones, Users, Play, TrendingUp, Search, Pause,
  Clock, Volume2, Star, AlertTriangle,
} from "lucide-react";

const TRACKS = [
  { id: "m1", title: "Desi Vibes", artist: "DJ Aryan", genre: "Electronic", duration: "3:45", plays: 12000, likes: 3400, status: "active", license: "Licensed" },
  { id: "m2", title: "Bollywood Beats", artist: "Priya Sharma", genre: "Bollywood", duration: "4:12", plays: 34000, likes: 8900, status: "active", license: "Licensed" },
  { id: "m3", title: "Classical Fusion", artist: "Rahul Verma", genre: "Classical", duration: "5:30", plays: 8900, likes: 2100, status: "active", license: "Licensed" },
  { id: "m4", title: "Punjabi Tadka", artist: "Karan Mehta", genre: "Punjabi", duration: "3:20", plays: 5600, likes: 1200, status: "active", license: "Licensed" },
  { id: "m5", title: "Indie Dreams", artist: "Ananya Singh", genre: "Indie", duration: "3:50", plays: 7800, likes: 1600, status: "active", license: "Licensed" },
  { id: "m6", title: "Hip Hop India", artist: "Arjun Reddy", genre: "Hip Hop", duration: "3:10", plays: 15000, likes: 4500, status: "active", license: "Pending" },
  { id: "m7", title: "Sufi Soul", artist: "Deepika Nair", genre: "Sufi", duration: "4:45", plays: 6700, likes: 1800, status: "active", license: "Licensed" },
  { id: "m8", title: "Rock Anthem", artist: "Vikram Kumar", genre: "Rock", duration: "3:35", plays: 9200, likes: 2300, status: "inactive", license: "Expired" },
];

export default function MusicLibraryPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const totalTracks = TRACKS.length;
  const activeTracks = TRACKS.filter((t) => t.status === "active");
  const totalPlays = TRACKS.reduce((s, t) => s + t.plays, 0);
  const totalLikes = TRACKS.reduce((s, t) => s + t.likes, 0);

  const filtered = TRACKS.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.artist.toLowerCase().includes(search.toLowerCase()) ||
    t.genre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Music className="w-6 h-6 text-teal-500" />
            Music Library
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage tracks, artists, genres, and licensing
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9 w-64" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Music} label="Tracks" value={totalTracks.toString()} />
        <KpiCard icon={Play} label="Active" value={activeTracks.length.toString()} />
        <KpiCard icon={Headphones} label="Plays" value={totalPlays.toLocaleString()} />
        <KpiCard icon={Star} label="Likes" value={totalLikes.toLocaleString()} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="genres">Genres</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Track</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Plays</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>License</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.title}</TableCell>
                      <TableCell>{t.artist}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{t.genre}</Badge>
                      </TableCell>
                      <TableCell>{t.duration}</TableCell>
                      <TableCell>{t.plays.toLocaleString()}</TableCell>
                      <TableCell>{t.likes.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={t.status === "active" ? "default" : "secondary"}>
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.license === "Licensed" ? "default" : t.license === "Pending" ? "outline" : "secondary"}>
                          {t.license}
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
                {["Electronic", "Bollywood", "Classical", "Punjabi", "Indie", "Hip Hop", "Sufi", "Rock"].map((genre) => {
                  const count = TRACKS.filter((t) => t.genre === genre).length;
                  const plays = TRACKS.filter((t) => t.genre === genre).reduce((s, t) => s + t.plays, 0);
                  return (
                    <div key={genre} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-500/15">
                        <Music className="w-4 h-4 text-teal-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{genre}</div>
                        <div className="text-xs text-muted-foreground">{count} tracks</div>
                      </div>
                      <div className="text-sm font-bold">{plays.toLocaleString()} plays</div>
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
              <CardTitle className="text-sm font-medium">Top Artists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {TRACKS.sort((a, b) => b.plays - a.plays).slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-teal-500/15">
                      <Mic className="w-4 h-4 text-teal-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{t.artist}</div>
                      <div className="text-xs text-muted-foreground">{t.title}</div>
                    </div>
                    <div className="text-sm font-bold">{t.plays.toLocaleString()} plays</div>
                    <div className="text-sm font-bold">{t.likes.toLocaleString()} likes</div>
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
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="text-lg font-bold mt-1">{value}</div>
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-teal-500/15">
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
