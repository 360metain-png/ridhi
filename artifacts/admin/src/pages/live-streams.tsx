import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Radio, Eye, Coins, TrendingUp, TrendingDown, Search, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";

const LANGUAGES = ["Hindi", "English", "Telugu", "Tamil", "Bengali", "Marathi", "Malayalam", "Kannada", "Gujarati", "Punjabi"];

const mockStreams = Array.from({ length: 25 }, (_, i) => ({
  id: `ls${i + 1}`,
  host: ["Priya Sharma", "Rahul Verma", "Kavya Reddy", "Meera Pillai", "Dev Kumar", "Ananya Singh", "Arjun Shah", "Riya Das"][i % 8],
  city: ["Mumbai", "Delhi", "Hyderabad", "Kochi", "Bangalore", "Delhi", "Surat", "Kolkata"][i % 8],
  language: LANGUAGES[i % LANGUAGES.length],
  title: ["Bollywood Night", "Tech Talk", "Song Requests", "Morning Yoga", "Comedy Hour", "Cricket Live", "Dance Show", "Food Review"][i % 8],
  viewers: Math.floor(Math.random() * 5000) + 100,
  duration: Math.floor(Math.random() * 120) + 5,
  coins: Math.floor(Math.random() * 20000),
  reports: Math.floor(Math.random() * 8),
  status: (["live", "live", "live", "ended", "flagged"] as const)[Math.floor(Math.random() * 5)],
  startedAt: new Date(Date.now() - Math.floor(Math.random() * 7200000)).toISOString(),
}));

const STATUS_COLORS: Record<string, string> = {
  live: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  ended: "bg-muted/60 text-muted-foreground border-border",
  flagged: "bg-rose-500/15 text-rose-400 border-rose-500/20",
};

const PAGE_SIZE = 10;

export default function LiveStreamsPage() {
  const [streams, setStreams] = useState(mockStreams);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = streams.filter((s) => {
    const matchSearch = s.host.toLowerCase().includes(search.toLowerCase()) || s.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const terminateStream = (id: string) => {
    setStreams((prev) => prev.map((s) => s.id === id ? { ...s, status: "ended" as const } : s));
  };

  const liveNow = streams.filter((s) => s.status === "live");
  const flagged = streams.filter((s) => s.status === "flagged");
  const totalViewers = liveNow.reduce((acc, s) => acc + s.viewers, 0);
  const totalCoins = streams.reduce((acc, s) => acc + s.coins, 0);

  const stats = [
    { label: "Live Now", value: liveNow.length.toString(), icon: Radio, color: "text-emerald-400", change: "+3", up: true },
    { label: "Total Viewers", value: totalViewers.toLocaleString(), icon: Eye, color: "text-blue-400", change: "+12.4%", up: true },
    { label: "Coins Gifted Today", value: totalCoins.toLocaleString(), icon: Coins, color: "text-amber-400", change: "+18.2%", up: true },
    { label: "Flagged Streams", value: flagged.length.toString(), icon: AlertTriangle, color: "text-rose-400", change: "-2", up: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Live Streams</h1>
        <p className="text-muted-foreground text-sm mt-1">Monitor active and historical live streams across the platform</p>
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
                {s.change} vs yesterday
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base font-semibold text-foreground flex-1">All Streams</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search host or title..."
                  className="pl-9 h-9 w-56 bg-background border-border text-sm"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="h-9 w-32 bg-background border-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-xs font-semibold">Host</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Title</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Language</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">Viewers</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">Coins</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">Reports</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold">Status</TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((s) => (
                <TableRow key={s.id} className="border-border hover:bg-muted/30">
                  <TableCell>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{s.host}</p>
                      <p className="text-xs text-muted-foreground">{s.city}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-foreground max-w-[140px] truncate">{s.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.language}</TableCell>
                  <TableCell className="text-right text-sm font-medium text-foreground">{s.viewers.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm text-amber-400 font-semibold">{s.coins.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className={`text-sm font-bold ${s.reports > 3 ? "text-rose-400" : "text-muted-foreground"}`}>
                      {s.reports}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs border ${STATUS_COLORS[s.status]}`}>{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {s.status === "live" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs border-rose-500/40 text-rose-400 hover:bg-rose-500/10">
                              End Stream
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card border-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-foreground">End Live Stream</AlertDialogTitle>
                              <AlertDialogDescription className="text-muted-foreground">
                                Force-terminate {s.host}'s stream "{s.title}"? This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-rose-600 hover:bg-rose-700" onClick={() => terminateStream(s.id)}>
                                End Stream
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      {s.status === "flagged" && (
                        <>
                          <Button size="sm" className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                            onClick={() => setStreams((prev) => prev.map((x) => x.id === s.id ? { ...x, status: "live" as const } : x))}>
                            Approve
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs border-rose-500/40 text-rose-400 hover:bg-rose-500/10">Ban</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-foreground">Ban Host</AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">Ban {s.host} from streaming?</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-rose-600 hover:bg-rose-700" onClick={() => terminateStream(s.id)}>Ban</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <span className="text-sm text-muted-foreground">{filtered.length} streams</span>
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
