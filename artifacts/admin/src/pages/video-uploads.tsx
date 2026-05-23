import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Film, Upload, AlertTriangle, CheckCircle, Eye,
  ThumbsUp, MessageSquare, Share2, Flag, Trash2, Shield,
  TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Filter,
  Clock, User, Languages, FileVideo, ImageIcon, BarChart3,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type UploadType = "post" | "reel" | "story" | "poll";
type UploadStatus = "active" | "pending" | "flagged" | "removed";

interface VideoUpload {
  id: string;
  creator: string;
  creatorId: string;
  avatar: string;
  title: string;
  type: UploadType;
  language: string;
  city: string;
  duration: number; // seconds
  views: number;
  likes: number;
  comments: number;
  shares: number;
  reports: number;
  status: UploadStatus;
  uploadedAt: string;
  thumbnailUrl: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const LANGUAGES = ["Hindi", "English", "Telugu", "Tamil", "Bengali", "Marathi", "Malayalam", "Kannada", "Gujarati", "Punjabi"];

const CREATORS = [
  { name: "Priya Sharma", city: "Mumbai" },
  { name: "Rahul Verma", city: "Delhi" },
  { name: "Kavya Reddy", city: "Hyderabad" },
  { name: "Meera Pillai", city: "Kochi" },
  { name: "Dev Kumar", city: "Bangalore" },
  { name: "Ananya Singh", city: "Delhi" },
  { name: "Arjun Shah", city: "Surat" },
  { name: "Riya Das", city: "Kolkata" },
  { name: "Sneha Joshi", city: "Pune" },
  { name: "Vikram Rao", city: "Chennai" },
];

const TITLES: Record<UploadType, string[]> = {
  post:  ["Bollywood Gossip", "Tech Unboxing", "Street Food", "Travel Diaries", "Fitness Tips", "Daily Vlog"],
  reel:  ["Dance Challenge", "Comedy Skit", "POV Moment", "Before After", "ASMR", "Makeup Tutorial"],
  story: ["Good Morning", "Behind the Scenes", "Live Update", "Poll: Vote Now!", "Q&A Time", "Day in Life"],
  poll:  ["Who's Better?", "Rate This", "Which City?", "Best Season?", "Fashion Choice", "Food Preference"],
};

const mockUploads: VideoUpload[] = Array.from({ length: 40 }, (_, i) => {
  const type = (["post", "reel", "story", "poll"] as UploadType[])[i % 4];
  const creator = CREATORS[i % CREATORS.length];
  const statusRoll = Math.random();
  const status: UploadStatus =
    statusRoll > 0.75 ? "flagged" :
    statusRoll > 0.60 ? "pending" :
    statusRoll > 0.05 ? "active" : "removed";
  const reports = status === "flagged" ? Math.floor(Math.random() * 15) + 3 :
                  status === "pending" ? Math.floor(Math.random() * 3) :
                  Math.floor(Math.random() * 2);
  return {
    id: `vu${i + 1}`,
    creator: creator.name,
    creatorId: `u${(i % 30) + 1}`,
    avatar: creator.name.split(" ").map(n => n[0]).join(""),
    title: TITLES[type][i % TITLES[type].length],
    type,
    language: LANGUAGES[i % LANGUAGES.length],
    city: creator.city,
    duration: type === "poll" ? 0 : Math.floor(Math.random() * 300) + 15,
    views: Math.floor(Math.random() * 50000) + 100,
    likes: Math.floor(Math.random() * 5000) + 10,
    comments: Math.floor(Math.random() * 500) + 1,
    shares: Math.floor(Math.random() * 200) + 1,
    reports,
    status,
    uploadedAt: new Date(Date.now() - Math.floor(Math.random() * 604800000)).toISOString(),
    thumbnailUrl: "",
  };
});

const STATUS_COLORS: Record<UploadStatus, string> = {
  active:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  flagged: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  removed: "bg-muted/60 text-muted-foreground border-border",
};

const TYPE_ICON: Record<UploadType, React.FC<any>> = {
  post:  FileVideo,
  reel:  Film,
  story: ImageIcon,
  poll:  BarChart3,
};

const TYPE_LABEL: Record<UploadType, string> = {
  post:  "Post",
  reel:  "Reel",
  story: "Story",
  poll:  "Poll",
};

const PAGE_SIZE = 10;

// ── Component ─────────────────────────────────────────────────────────────────

export default function VideoUploadsPage() {
  const [uploads, setUploads] = useState<VideoUpload[]>(mockUploads);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const filtered = uploads.filter((u) => {
    const matchSearch = u.creator.toLowerCase().includes(search.toLowerCase()) ||
                        u.title.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || u.type === typeFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    const matchLang = languageFilter === "all" || u.language === languageFilter;
    return matchSearch && matchType && matchStatus && matchLang;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const active = uploads.filter((u) => u.status === "active");
  const pending = uploads.filter((u) => u.status === "pending");
  const flagged = uploads.filter((u) => u.status === "flagged");
  const todayCount = uploads.filter((u) => {
    const d = new Date(u.uploadedAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const totalViews = active.reduce((acc, u) => acc + u.views, 0);
  const totalReports = uploads.reduce((acc, u) => acc + u.reports, 0);

  const stats = [
    { label: "Total Uploads",    value: uploads.length.toLocaleString(),       icon: Upload,      color: "text-blue-400",    change: "+12",       up: true },
    { label: "Uploads Today",    value: todayCount.toString(),                 icon: Clock,       color: "text-violet-400",  change: "+3 vs yday", up: true },
    { label: "Pending Review",   value: pending.length.toString(),               icon: Shield,      color: "text-amber-400",   change: "-2",         up: false },
    { label: "Flagged Content",  value: flagged.length.toString(),               icon: AlertTriangle,color: "text-rose-400",   change: "+1",         up: true },
    { label: "Total Views",      value: totalViews.toLocaleString(),             icon: Eye,         color: "text-emerald-400", change: "+8.5%",      up: true },
    { label: "Total Reports",    value: totalReports.toString(),                 icon: Flag,        color: "text-orange-400",  change: "-5",         up: false },
  ];

  const setStatus = (id: string, status: UploadStatus) => {
    setUploads((prev) => prev.map((u) => u.id === id ? { ...u, status } : u));
    toast({ title: `Content ${status}`, description: `Video upload marked as ${status}.` });
  };

  const formatDuration = (s: number) => {
    if (s === 0) return "—";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Film className="w-6 h-6 text-primary" />
            Video Uploads
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review, moderate and manage all video content across the platform
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          Super Admin View
        </Badge>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</span>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="text-xl font-bold text-foreground">{s.value}</div>
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${s.up ? "text-emerald-400" : "text-rose-400"}`}>
                {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {s.change} vs yesterday
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Filters Bar ── */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="w-4 h-4" />
              Filters
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search creator or title..."
                  className="pl-9 h-9 bg-background border-border text-sm"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              {/* Type filter */}
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                <SelectTrigger className="h-9 bg-background border-border text-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="reel">Reel</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="poll">Poll</SelectItem>
                </SelectContent>
              </Select>
              {/* Status filter */}
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="h-9 bg-background border-border text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="removed">Removed</SelectItem>
                </SelectContent>
              </Select>
              {/* Language filter */}
              <Select value={languageFilter} onValueChange={(v) => { setLanguageFilter(v); setPage(1); }}>
                <SelectTrigger className="h-9 bg-background border-border text-sm">
                  <SelectValue placeholder="All Languages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs border-border"
              onClick={() => { setSearch(""); setTypeFilter("all"); setStatusFilter("all"); setLanguageFilter("all"); setPage(1); }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Table ── */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Film className="w-4 h-4 text-primary" />
              All Uploads
              <Badge variant="outline" className="text-xs">{filtered.length} total</Badge>
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> {active.length} Active</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> {pending.length} Pending</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> {flagged.length} Flagged</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs font-semibold">Creator</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-semibold">Content</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-semibold">Type</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-semibold">Language</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-semibold text-right">Duration</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-semibold text-right">Views</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-semibold text-right">Engagement</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-semibold text-right">Reports</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-semibold">Uploaded</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((u) => {
                  const TypeIcon = TYPE_ICON[u.type];
                  return (
                    <TableRow key={u.id} className="border-border hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {u.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{u.creator}</p>
                            <p className="text-xs text-muted-foreground">{u.city}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground max-w-[160px] truncate" title={u.title}>{u.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs gap-1 border-border">
                          <TypeIcon className="w-3 h-3" />
                          {TYPE_LABEL[u.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Languages className="w-3 h-3" />{u.language}</span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">{formatDuration(u.duration)}</TableCell>
                      <TableCell className="text-right text-sm font-medium text-foreground">{u.views.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5"><ThumbsUp className="w-3 h-3" />{u.likes.toLocaleString()}</span>
                          <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" />{u.comments}</span>
                          <span className="flex items-center gap-0.5"><Share2 className="w-3 h-3" />{u.shares}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`text-sm font-bold ${u.reports > 5 ? "text-rose-400" : u.reports > 0 ? "text-amber-400" : "text-muted-foreground"}`}>
                          {u.reports}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs border ${STATUS_COLORS[u.status]}`}>{u.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(u.uploadedAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {u.status === "pending" && (
                            <Button
                              size="sm"
                              className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                              onClick={() => setStatus(u.id, "active")}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" /> Approve
                            </Button>
                          )}
                          {u.status === "flagged" && (
                            <>
                              <Button
                                size="sm"
                                className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                                onClick={() => setStatus(u.id, "active")}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" /> Approve
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs border-rose-500/40 text-rose-400 hover:bg-rose-500/10">
                                    <Trash2 className="w-3 h-3 mr-1" /> Remove
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card border-border">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-foreground">Remove Content</AlertDialogTitle>
                                    <AlertDialogDescription className="text-muted-foreground">
                                      Remove "{u.title}" by {u.creator}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                                    <AlertDialogAction className="bg-rose-600 hover:bg-rose-700" onClick={() => setStatus(u.id, "removed")}>
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                          {u.status === "active" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="h-7 px-2 text-xs border-amber-500/40 text-amber-400 hover:bg-amber-500/10">
                                  <Flag className="w-3 h-3 mr-1" /> Flag
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-card border-border">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-foreground">Flag Content</AlertDialogTitle>
                                  <AlertDialogDescription className="text-muted-foreground">
                                    Flag "{u.title}" by {u.creator} for review?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                                  <AlertDialogAction className="bg-amber-600 hover:bg-amber-700" onClick={() => setStatus(u.id, "flagged")}>
                                    Flag
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          {u.status === "removed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                              onClick={() => setStatus(u.id, "active")}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" /> Restore
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <span className="text-sm text-muted-foreground">
              {filtered.length} uploads · Page {page} of {Math.max(1, totalPages)}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-8 px-3 border-border">
                <ChevronLeft className="w-4 h-4" />
              </Button>
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
