import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Phone, Video, Mic, Radio, Search, Play, Download, Trash2, Clock,
  Shield, ShieldAlert, Eye, Lock, ChevronRight, Calendar, Users,
  Volume2, AlertTriangle, CheckCircle, Filter,
} from "lucide-react";
import { type AdminRole } from "@/App";
import { downloadCSV } from "@/lib/utils";

// ── Role helper ────────────────────────────────────────────────────────────────
function useRole(): AdminRole {
  return (localStorage.getItem("ridhi_admin_role") ?? "admin") as AdminRole;
}

// ── Mock data ──────────────────────────────────────────────────────────────────
type RecordingStatus = "clean" | "flagged" | "reviewed";
type RecordingType   = "audio-call" | "video-call";

interface CallRecording {
  id: string;
  type: RecordingType;
  host: string;
  hostCity: string;
  caller: string;
  callerCity: string;
  date: string;
  duration: string;
  size: string;
  status: RecordingStatus;
  flagReason?: string;
}

interface RoomActivity {
  id: string;
  roomName: string;
  host: string;
  participants: number;
  peakParticipants: number;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  topic: string;
  status: RecordingStatus;
  flagReason?: string;
  eventsCount: number;
}

const CALL_RECORDINGS: CallRecording[] = [
  { id: "cr1",  type: "video-call", host: "Priya Sharma",   hostCity: "Mumbai",    caller: "Rahul Kumar",   callerCity: "Delhi",     date: "18 May 2026", duration: "12:34", size: "48.2 MB", status: "flagged",  flagReason: "Potential inappropriate content — AI flagged at 7:12" },
  { id: "cr2",  type: "audio-call", host: "Dev Raj",        hostCity: "Bangalore", caller: "Ananya Mehta",  callerCity: "Pune",      date: "18 May 2026", duration: "22:18", size: "18.4 MB", status: "clean" },
  { id: "cr3",  type: "video-call", host: "Kavya Krishnan", hostCity: "Chennai",   caller: "Vikram Patel",  callerCity: "Ahmedabad", date: "17 May 2026", duration: "8:05",  size: "31.6 MB", status: "reviewed" },
  { id: "cr4",  type: "audio-call", host: "Arjun Verma",    hostCity: "Kochi",     caller: "Meera Desai",   callerCity: "Jaipur",    date: "17 May 2026", duration: "35:44", size: "29.7 MB", status: "clean" },
  { id: "cr5",  type: "video-call", host: "Sneha Joshi",    hostCity: "Hyderabad", caller: "Rohan Singh",   callerCity: "Kolkata",   date: "17 May 2026", duration: "5:22",  size: "21.0 MB", status: "flagged",  flagReason: "User complaint: scam attempt reported" },
  { id: "cr6",  type: "audio-call", host: "Nita Kapoor",    hostCity: "Delhi",     caller: "Aditya Shah",   callerCity: "Mumbai",    date: "16 May 2026", duration: "18:51", size: "15.6 MB", status: "clean" },
  { id: "cr7",  type: "video-call", host: "Rohit Varma",    hostCity: "Pune",      caller: "Divya Nair",    callerCity: "Kochi",     date: "16 May 2026", duration: "14:07", size: "54.3 MB", status: "reviewed" },
  { id: "cr8",  type: "audio-call", host: "Deepa Menon",    hostCity: "Kolkata",   caller: "Sunny Gupta",   callerCity: "Lucknow",   date: "15 May 2026", duration: "41:30", size: "34.5 MB", status: "flagged",  flagReason: "3 user reports: harassment during session" },
  { id: "cr9",  type: "video-call", host: "Raj Nair",       hostCity: "Jaipur",    caller: "Kavita Rao",    callerCity: "Bangalore", date: "15 May 2026", duration: "9:16",  size: "36.1 MB", status: "clean" },
  { id: "cr10", type: "audio-call", host: "Amit Thakur",    hostCity: "Lucknow",   caller: "Pooja Shetty",  callerCity: "Chennai",   date: "14 May 2026", duration: "27:03", size: "22.4 MB", status: "clean" },
];

const ROOM_ACTIVITIES: RoomActivity[] = [
  { id: "ra1", roomName: "Bollywood Night 🎵",  host: "Priya Sharma",   participants: 284, peakParticipants: 412, date: "18 May 2026", startTime: "9:00 PM", endTime: "11:45 PM", duration: "2h 45m", topic: "Latest Bollywood hits discussion",      status: "clean",    eventsCount: 1842 },
  { id: "ra2", roomName: "Desi Gossip Zone 🔥", host: "Dev Raj",        participants: 156, peakParticipants: 203, date: "18 May 2026", startTime: "8:30 PM", endTime: "10:00 PM", duration: "1h 30m", topic: "Celebrity news & trending topics",       status: "flagged",  eventsCount: 934,  flagReason: "AI flagged 4 offensive statements; 2 mic suspensions" },
  { id: "ra3", roomName: "Study Together 📚",   host: "Kavya Krishnan", participants: 89,  peakParticipants: 104, date: "17 May 2026", startTime: "7:00 PM", endTime: "10:00 PM", duration: "3h 00m", topic: "NEET 2026 prep — Biology",               status: "clean",    eventsCount: 423 },
  { id: "ra4", roomName: "Startup Talk 💡",     host: "Arjun Verma",    participants: 312, peakParticipants: 389, date: "17 May 2026", startTime: "6:00 PM", endTime: "8:30 PM",  duration: "2h 30m", topic: "Funding winter & side hustle ideas",      status: "reviewed", eventsCount: 2104 },
  { id: "ra5", roomName: "IPL Match Room 🏏",   host: "Rohit Varma",    participants: 541, peakParticipants: 698, date: "16 May 2026", startTime: "7:30 PM", endTime: "11:00 PM", duration: "3h 30m", topic: "CSK vs MI live commentary",               status: "flagged",  eventsCount: 4821, flagReason: "Hate speech flagged between rival fan groups" },
  { id: "ra6", roomName: "Morning Motivation ☀️",host:"Deepa Menon",   participants: 67,  peakParticipants: 89,  date: "15 May 2026", startTime: "6:00 AM", endTime: "7:30 AM",  duration: "1h 30m", topic: "Positivity & daily goal setting",         status: "clean",    eventsCount: 312 },
];

// ── Sub-components ─────────────────────────────────────────────────────────────
const STATUS_CHIP: Record<RecordingStatus, { label: string; cls: string; icon: React.FC<any> }> = {
  clean:    { label: "Clean",    cls: "bg-green-50  text-green-700  border-green-200  dark:bg-green-950/30",  icon: CheckCircle },
  flagged:  { label: "Flagged",  cls: "bg-red-50    text-red-700    border-red-200    dark:bg-red-950/30",    icon: AlertTriangle },
  reviewed: { label: "Reviewed", cls: "bg-blue-50   text-blue-700   border-blue-200   dark:bg-blue-950/30",   icon: Eye },
};

function RoleTag({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  return isSuperAdmin
    ? <Badge className="gap-1 bg-violet-100 text-violet-700 border-violet-300 text-[10px]"><Shield className="w-2.5 h-2.5" />Super Admin</Badge>
    : <Badge className="gap-1 bg-blue-50 text-blue-600 border-blue-200 text-[10px]"><Lock className="w-2.5 h-2.5" />Admin · Read-only</Badge>;
}

function RecordingRow({ rec, isSuperAdmin, onDelete }: { rec: CallRecording; isSuperAdmin: boolean; onDelete: (id: string) => void }) {
  const s = STATUS_CHIP[rec.status];
  const SIcon = s.icon;
  const TypeIcon = rec.type === "video-call" ? Video : Phone;
  return (
    <Card className={`border transition-all ${rec.status === "flagged" ? "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/10" : "border-border"}`}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Type icon */}
          <div className={`p-2.5 rounded-xl shrink-0 self-start ${rec.type === "video-call" ? "bg-rose-100 dark:bg-rose-950/30" : "bg-violet-100 dark:bg-violet-950/30"}`}>
            <TypeIcon className={`w-4 h-4 ${rec.type === "video-call" ? "text-rose-600" : "text-violet-600"}`} />
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{rec.host}</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{rec.caller}</span>
              <Badge variant="outline" className={`text-[10px] border ${s.cls} gap-1`}>
                <SIcon className="w-2.5 h-2.5" />{s.label}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{rec.date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{rec.duration}</span>
              <span>{rec.hostCity} → {rec.callerCity}</span>
              <span className="text-[11px]">{rec.size}</span>
            </div>
            {rec.flagReason && (
              <div className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg px-2.5 py-1.5 mt-1">
                <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{rec.flagReason}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Listen — everyone */}
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
              <Play className="w-3 h-3" />
              {rec.type === "video-call" ? "Watch" : "Listen"}
            </Button>

            {/* Download — super admin only */}
            {isSuperAdmin ? (
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 text-violet-600 border-violet-300 hover:bg-violet-50">
                <Download className="w-3 h-3" />
                Download
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 opacity-40 cursor-not-allowed" disabled title="Download requires Super Admin access">
                <Lock className="w-3 h-3" />
                Download
              </Button>
            )}

            {/* Delete — super admin only */}
            {isSuperAdmin ? (
              <Button size="sm" variant="destructive" className="h-7 text-xs gap-1.5" onClick={() => onDelete(rec.id)}>
                <Trash2 className="w-3 h-3" />
                Delete
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 opacity-40 cursor-not-allowed text-red-400 border-red-200" disabled title="Delete requires Super Admin access">
                <Lock className="w-3 h-3" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RoomActivityRow({ room, isSuperAdmin, onDelete }: { room: RoomActivity; isSuperAdmin: boolean; onDelete: (id: string) => void }) {
  const s = STATUS_CHIP[room.status];
  const SIcon = s.icon;
  return (
    <Card className={`border transition-all ${room.status === "flagged" ? "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/10" : "border-border"}`}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/30 shrink-0 self-start">
            <Radio className="w-4 h-4 text-orange-600" />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{room.roomName}</span>
              <Badge variant="outline" className={`text-[10px] border ${s.cls} gap-1`}>
                <SIcon className="w-2.5 h-2.5" />{s.label}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Host: <span className="font-medium text-foreground">{room.host}</span> · {room.topic}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{room.date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{room.startTime} – {room.endTime} ({room.duration})</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{room.participants} listeners (peak {room.peakParticipants})</span>
              <span className="flex items-center gap-1"><Volume2 className="w-3 h-3" />{room.eventsCount.toLocaleString()} events</span>
            </div>
            {room.flagReason && (
              <div className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg px-2.5 py-1.5 mt-1">
                <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{room.flagReason}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
              <Eye className="w-3 h-3" />
              View Log
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
              <Play className="w-3 h-3" />
              Listen
            </Button>
            {isSuperAdmin ? (
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 text-violet-600 border-violet-300 hover:bg-violet-50">
                <Download className="w-3 h-3" />
                Export
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 opacity-40 cursor-not-allowed" disabled>
                <Lock className="w-3 h-3" />
                Export
              </Button>
            )}
            {isSuperAdmin ? (
              <Button size="sm" variant="destructive" className="h-7 text-xs gap-1.5" onClick={() => onDelete(room.id)}>
                <Trash2 className="w-3 h-3" />
                Delete
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 opacity-40 cursor-not-allowed text-red-400 border-red-200" disabled>
                <Lock className="w-3 h-3" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function Recordings() {
  const role         = useRole();
  const isSuperAdmin = role === "super_admin";

  const [search,      setSearch]      = useState("");
  const [statusFilter,setStatusFilter]= useState<"all" | RecordingStatus>("all");
  const [recordings,  setRecordings]  = useState<CallRecording[]>(CALL_RECORDINGS);
  const [rooms,       setRooms]       = useState<RoomActivity[]>(ROOM_ACTIVITIES);

  const deleteRecording = (id: string) => setRecordings(prev => prev.filter(r => r.id !== id));
  const deleteRoom      = (id: string) => setRooms(prev => prev.filter(r => r.id !== id));

  const filterRec = (list: CallRecording[]) => list.filter(r =>
    (statusFilter === "all" || r.status === statusFilter) &&
    (search === "" || r.host.toLowerCase().includes(search.toLowerCase()) || r.caller.toLowerCase().includes(search.toLowerCase()))
  );
  const filterRoom = (list: RoomActivity[]) => list.filter(r =>
    (statusFilter === "all" || r.status === statusFilter) &&
    (search === "" || r.roomName.toLowerCase().includes(search.toLowerCase()) || r.host.toLowerCase().includes(search.toLowerCase()))
  );

  const audioCalls = filterRec(recordings.filter(r => r.type === "audio-call"));
  const videoCalls = filterRec(recordings.filter(r => r.type === "video-call"));
  const roomList   = filterRoom(rooms);

  const flaggedRecs  = recordings.filter(r => r.status === "flagged").length;
  const flaggedRooms = rooms.filter(r => r.status === "flagged").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
          const rows: Record<string, string | number>[] = [];
          downloadCSV("recordings_report.csv", rows);
        }}>
          <Download className="w-3 h-3" /> Export CSV
        </Button>
      </div>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Call Recordings & Room Activity</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access audio/video recordings and audio room logs
          </p>
        </div>
        <RoleTag isSuperAdmin={isSuperAdmin} />
      </div>

      {/* ── Permission banner (admin only) ── */}
      {!isSuperAdmin && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <Lock className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Admin access — Read & Listen only</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
              You can view recordings and listen to audio/video. Download and delete actions require Super Admin access.
            </p>
          </div>
        </div>
      )}

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Audio Calls",   value: recordings.filter(r => r.type === "audio-call").length, Icon: Phone, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/20 border-violet-200" },
          { label: "Video Calls",   value: recordings.filter(r => r.type === "video-call").length, Icon: Video, color: "text-rose-600",   bg: "bg-rose-50 dark:bg-rose-950/20 border-rose-200" },
          { label: "Audio Rooms",   value: rooms.length,  Icon: Radio, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/20 border-orange-200" },
          { label: "Flagged Items", value: flaggedRecs + flaggedRooms, Icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/20 border-red-200" },
        ].map(({ label, value, Icon, color, bg }) => (
          <Card key={label} className={`border ${bg}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${bg} border`}><Icon className={`w-4 h-4 ${color}`} /></div>
              <div>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by host or caller name…"
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-[160px]">
            <Filter className="w-3.5 h-3.5 mr-1" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="clean">Clean</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="audio" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="audio" className="gap-2 text-xs sm:text-sm">
            <Phone className="w-3.5 h-3.5" />
            Audio Calls
            {audioCalls.filter(r => r.status === "flagged").length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {audioCalls.filter(r => r.status === "flagged").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="video" className="gap-2 text-xs sm:text-sm">
            <Video className="w-3.5 h-3.5" />
            Video Calls
            {videoCalls.filter(r => r.status === "flagged").length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {videoCalls.filter(r => r.status === "flagged").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="rooms" className="gap-2 text-xs sm:text-sm">
            <Radio className="w-3.5 h-3.5" />
            Audio Rooms
            {roomList.filter(r => r.status === "flagged").length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {roomList.filter(r => r.status === "flagged").length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Audio Calls tab ── */}
        <TabsContent value="audio" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{audioCalls.length} recording{audioCalls.length !== 1 ? "s" : ""}</p>
            {!isSuperAdmin && (
              <div className="flex items-center gap-1.5 text-xs text-blue-600">
                <Lock className="w-3 h-3" /> Listen only — no download/delete
              </div>
            )}
          </div>
          {audioCalls.length === 0
            ? <Card><CardContent className="p-8 text-center text-muted-foreground">No recordings match your filters.</CardContent></Card>
            : audioCalls.map(r => <RecordingRow key={r.id} rec={r} isSuperAdmin={isSuperAdmin} onDelete={deleteRecording} />)}
        </TabsContent>

        {/* ── Video Calls tab ── */}
        <TabsContent value="video" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{videoCalls.length} recording{videoCalls.length !== 1 ? "s" : ""}</p>
            {!isSuperAdmin && (
              <div className="flex items-center gap-1.5 text-xs text-blue-600">
                <Lock className="w-3 h-3" /> Listen/Watch only — no download/delete
              </div>
            )}
          </div>
          {videoCalls.length === 0
            ? <Card><CardContent className="p-8 text-center text-muted-foreground">No recordings match your filters.</CardContent></Card>
            : videoCalls.map(r => <RecordingRow key={r.id} rec={r} isSuperAdmin={isSuperAdmin} onDelete={deleteRecording} />)}
        </TabsContent>

        {/* ── Audio Rooms tab ── */}
        <TabsContent value="rooms" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{roomList.length} room session{roomList.length !== 1 ? "s" : ""}</p>
            {!isSuperAdmin && (
              <div className="flex items-center gap-1.5 text-xs text-blue-600">
                <Lock className="w-3 h-3" /> View & listen only — no export/delete
              </div>
            )}
          </div>
          {roomList.length === 0
            ? <Card><CardContent className="p-8 text-center text-muted-foreground">No room sessions match your filters.</CardContent></Card>
            : roomList.map(r => <RoomActivityRow key={r.id} room={r} isSuperAdmin={isSuperAdmin} onDelete={deleteRoom} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
