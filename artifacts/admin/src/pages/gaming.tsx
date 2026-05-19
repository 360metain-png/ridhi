import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Gamepad2, Trophy, Coins, Users, Shield, TrendingUp, AlertTriangle,
  Eye, Ban, Play, RefreshCw, Search, Filter, Award, Zap,
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const ROOM_TYPES = [
  { tier: "Beginner", entry: 50, active: 284, coin_vol: 42600, fraud_flag: 0, color: "#4CAF50" },
  { tier: "Silver", entry: 200, active: 142, coin_vol: 85200, fraud_flag: 1, color: "#9E9E9E" },
  { tier: "Gold", entry: 500, active: 89, coin_vol: 133500, fraud_flag: 0, color: "#FFB800" },
  { tier: "Platinum", entry: 2000, active: 31, coin_vol: 186000, fraud_flag: 2, color: "#00BCD4" },
  { tier: "VIP", entry: 10000, active: 8, coin_vol: 240000, fraud_flag: 0, color: "#E91E8C" },
];

const LIVE_ROOMS = [
  { id: "gr1", game: "Ludo", host: "Priya Sharma", tier: "Gold",     players: "2/4", entry: 500,   viewers: 34,  duration: "12m", flagged: false },
  { id: "gr2", game: "Ludo", host: "Rahul Verma",  tier: "Platinum", players: "3/4", entry: 2000,  viewers: 78,  duration: "7m",  flagged: false },
  { id: "gr3", game: "Ludo", host: "Dev Kumar",    tier: "Silver",   players: "3/4", entry: 200,   viewers: 12,  duration: "24m", flagged: true  },
  { id: "gr4", game: "Ludo", host: "Kavya Reddy",  tier: "VIP",      players: "2/4", entry: 10000, viewers: 210, duration: "3m",  flagged: false },
  { id: "gr5", game: "Ludo", host: "Arjun K",      tier: "Beginner", players: "4/4", entry: 50,    viewers: 5,   duration: "45m", flagged: false },
];

const INIT_TOURNAMENTS = [
  { id: "t1", name: "Ludo Battle Arena",       game: "Ludo",   status: "live", players: "248/256",  prizePool: 10000,   entry: 100,  startTime: "2h 15m ago" },
  { id: "t2", name: "Ludo Grand Prix 🏆",      game: "Ludo",   status: "live", players: "126/128",  prizePool: 25000,   entry: 200,  startTime: "30m ago"    },
  { id: "t3", name: "Diwali Coin Cup 🪔",      game: "Ludo",   status: "live", players: "498/512",  prizePool: 500000,  entry: 1000, startTime: "45m ago"    },
  { id: "t4", name: "Couple Tournament 💑",    game: "Ludo",   status: "live", players: "62/64",    prizePool: 15000,   entry: 150,  startTime: "20m ago"    },
  { id: "t5", name: "Regional Battle 🗺️",     game: "Ludo",   status: "live", players: "504/512",  prizePool: 5000,    entry: 50,   startTime: "1h ago"     },
  { id: "t6", name: "Creator Match ⭐",        game: "Ludo",   status: "live", players: "16/16",    prizePool: 50000,   entry: 500,  startTime: "15m ago"    },
  { id: "t7", name: "New Year Mega Battle 🎆", game: "Ludo",   status: "live", players: "1018/1024",prizePool: 1000000, entry: 2000, startTime: "just now"   },
];

const FRAUD_FLAGS = [
  { id: "f1", user: "Unknown #8741", type: "Rapid Consecutive Wins", rooms: 12, coinGain: 48000, severity: "high", time: "8 min ago" },
  { id: "f2", user: "Mehta Account", type: "Collusion (same IP range)", rooms: 5, coinGain: 12000, severity: "medium", time: "1h ago" },
  { id: "f3", user: "Cluster-99", type: "Bot-like move patterns", rooms: 28, coinGain: 140000, severity: "high", time: "2h ago" },
];

const coinBattleData = [
  { day: "Mon", ludo: 420000 },
  { day: "Tue", ludo: 380000 },
  { day: "Wed", ludo: 510000 },
  { day: "Thu", ludo: 470000 },
  { day: "Fri", ludo: 620000 },
  { day: "Sat", ludo: 740000 },
  { day: "Sun", ludo: 810000 },
];

const gameShareData = [
  { name: "Ludo 1v1",    value: 52 },
  { name: "Couple Mode", value: 26 },
  { name: "Team 2v2",    value: 14 },
  { name: "VIP Rooms",   value: 8  },
];
const GAME_COLORS = ["#E91E8C", "#7B2FBE", "#FFB800", "#00BCD4"];

const LEADERBOARD = [
  { rank: 1, name: "Priya Sharma", city: "Mumbai", game: "Ludo", wins: 284, coinEarned: 142000, badge: "💎 Diamond" },
  { rank: 2, name: "Rahul Verma", city: "Delhi", game: "Ludo", wins: 198, coinEarned: 99000, badge: "🥇 Gold" },
  { rank: 3, name: "Kavya Reddy", city: "Hyderabad", game: "Ludo", wins: 167, coinEarned: 83500, badge: "🥈 Silver" },
  { rank: 4, name: "Arjun Kumar", city: "Bangalore", game: "Ludo", wins: 142, coinEarned: 71000, badge: "🥉 Bronze" },
  { rank: 5, name: "Meera Pillai", city: "Kochi", game: "Ludo", wins: 119, coinEarned: 59500, badge: "⭐ Star" },
];

type TournamentEntry = typeof INIT_TOURNAMENTS[0];

export default function GamingManagement() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"rooms" | "tournaments" | "leaderboard" | "fraud">("rooms");
  const [tournaments, setTournaments] = useState<TournamentEntry[]>(INIT_TOURNAMENTS);
  const [goingLiveAll, setGoingLiveAll] = useState(false);

  const allLive = tournaments.every((t) => t.status === "live");
  const liveCount = tournaments.filter((t) => t.status === "live").length;

  const goLiveAll = async () => {
    setGoingLiveAll(true);
    // Stagger the go-live for each non-live tournament
    for (let i = 0; i < INIT_TOURNAMENTS.length; i++) {
      await new Promise((r) => setTimeout(r, 180));
      setTournaments((prev) =>
        prev.map((t, idx) => idx <= i ? { ...t, status: "live", startTime: "just now" } : t)
      );
    }
    setGoingLiveAll(false);
  };

  const toggleTournamentLive = (id: string) => {
    setTournaments((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "live" ? "ended" : "live", startTime: t.status === "live" ? "just ended" : "just now" }
          : t
      )
    );
  };

  const statusColor = (s: string) =>
    s === "live" ? "bg-green-100 text-green-700" :
    s === "registering" ? "bg-blue-100 text-blue-700" :
    s === "upcoming" ? "bg-yellow-100 text-yellow-700" :
    "bg-gray-100 text-gray-600";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-primary" />
            Gaming Management
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Ludo rooms, tournaments, coin battles, anti-fraud</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="gap-1 bg-green-600 hover:bg-green-600 text-sm px-3 py-1">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse inline-block" />
            554 Live Games
          </Badge>
          <Button
            onClick={goLiveAll}
            disabled={allLive || goingLiveAll}
            className={`gap-2 font-bold ${allLive ? "bg-green-600 hover:bg-green-600" : "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"}`}
          >
            {goingLiveAll ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Going Live…</>
            ) : allLive ? (
              <><Play className="w-4 h-4" /> All {liveCount} Tournaments Live ✓</>
            ) : (
              <><Zap className="w-4 h-4" /> Go Live All ({INIT_TOURNAMENTS.length - liveCount} pending)</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {ROOM_TYPES.map((r) => (
          <Card key={r.tier} className="border-l-4" style={{ borderLeftColor: r.color }}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium">{r.tier}</p>
              <p className="text-xl font-bold mt-1">{r.active}</p>
              <p className="text-xs text-muted-foreground">active rooms</p>
              <p className="text-xs font-medium mt-1 text-foreground">🪙 {r.coin_vol.toLocaleString()} vol</p>
              {r.fraud_flag > 0 && (
                <Badge variant="destructive" className="text-xs mt-1 h-4 px-1">{r.fraud_flag} flagged</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Coin Battle Volume (7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coinBattleData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => `🪙 ${v.toLocaleString()}`} />
                  <Bar dataKey="ludo" name="Ludo" fill="#E91E8C" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              Game Mode Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <div className="h-[200px] w-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={gameShareData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                    {gameShareData.map((_, i) => <Cell key={i} fill={GAME_COLORS[i % GAME_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2">
              {gameShareData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: GAME_COLORS[i] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-bold ml-auto">{d.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 border-b pb-2">
        {(["rooms", "tournaments", "leaderboard", "fraud"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "rooms" ? "🎮 Live Rooms" : t === "tournaments" ? "🏆 Tournaments" : t === "leaderboard" ? "📊 Leaderboard" : "🚨 Fraud Alerts"}
            {t === "fraud" && <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{FRAUD_FLAGS.length}</span>}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 w-48 text-sm" />
          </div>
        </div>
      </div>

      {tab === "rooms" && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left p-4 pb-3">Game</th>
                  <th className="text-left pb-3">Host</th>
                  <th className="text-left pb-3">Tier</th>
                  <th className="text-center pb-3">Players</th>
                  <th className="text-right pb-3">Entry</th>
                  <th className="text-right pb-3">Viewers</th>
                  <th className="text-right pb-3">Duration</th>
                  <th className="text-right pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {LIVE_ROOMS.map((room) => (
                  <tr key={room.id} className={room.flagged ? "bg-red-50 dark:bg-red-950/20" : ""}>
                    <td className="p-4 py-3 font-medium">{room.game === "Ludo" ? "🎲" : "🎯"} {room.game}</td>
                    <td className="py-3">{room.host}</td>
                    <td className="py-3">
                      <Badge variant="outline" className="text-xs">{room.tier}</Badge>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        {room.players}
                      </div>
                    </td>
                    <td className="py-3 text-right">🪙 {room.entry.toLocaleString()}</td>
                    <td className="py-3 text-right">{room.viewers}</td>
                    <td className="py-3 text-right text-muted-foreground">{room.duration}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Eye className="w-3.5 h-3.5" /></Button>
                        {room.flagged && <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive px-2">Terminate</Button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {tab === "tournaments" && (
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 pb-0 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">All Tournaments</span>
                <Badge className="bg-green-600 hover:bg-green-600 gap-1 text-xs">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse inline-block" />
                  {liveCount}/{tournaments.length} Live
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={goLiveAll}
                  disabled={allLive || goingLiveAll}
                  className={`h-8 gap-1.5 text-xs font-bold ${allLive ? "bg-green-600 hover:bg-green-600" : "bg-gradient-to-r from-pink-600 to-purple-600"}`}
                >
                  {goingLiveAll
                    ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Going Live…</>
                    : allLive
                    ? <><Play className="w-3 h-3" /> All Live ✓</>
                    : <><Zap className="w-3 h-3" /> Go Live All</>}
                </Button>
                <Button size="sm" className="h-8 gap-1.5 text-xs"><Trophy className="w-3 h-3" /> Create Tournament</Button>
              </div>
            </div>
            <table className="w-full text-sm mt-2">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left p-4 pb-3">Tournament</th>
                  <th className="text-left pb-3">Game</th>
                  <th className="text-left pb-3">Status</th>
                  <th className="text-center pb-3">Players</th>
                  <th className="text-right pb-3">Prize Pool</th>
                  <th className="text-right pb-3">Entry</th>
                  <th className="text-right pb-3">Time</th>
                  <th className="text-right pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tournaments.map((t) => (
                  <tr key={t.id} className={t.status === "live" ? "bg-green-50/40 dark:bg-green-950/10" : ""}>
                    <td className="p-4 py-3 font-medium">{t.name}</td>
                    <td className="py-3">{t.game === "Ludo" ? "🎲" : "🎯"} {t.game}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(t.status)}`}>
                        {t.status === "live" && <span className="inline-block w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse mr-1 align-middle" />}
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 text-center">{t.players}</td>
                    <td className="py-3 text-right font-medium">🪙 {t.prizePool.toLocaleString()}</td>
                    <td className="py-3 text-right">🪙 {t.entry}</td>
                    <td className="py-3 text-right text-muted-foreground text-xs">{t.startTime}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Eye className="w-3.5 h-3.5" /></Button>
                        {t.status === "live" ? (
                          <Button
                            variant="ghost" size="sm"
                            className="h-7 text-xs text-destructive px-2 hover:bg-destructive/10"
                            onClick={() => toggleTournamentLive(t.id)}
                          >
                            End
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="h-7 text-xs px-2 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => toggleTournamentLive(t.id)}
                          >
                            <Play className="w-3 h-3 mr-1" /> Go Live
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {tab === "leaderboard" && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left p-4 pb-3">Rank</th>
                  <th className="text-left pb-3">Player</th>
                  <th className="text-left pb-3">Top Game</th>
                  <th className="text-right pb-3">Wins</th>
                  <th className="text-right pb-3">Coins Earned</th>
                  <th className="text-left pb-3">Badge</th>
                  <th className="text-right pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {LEADERBOARD.map((p) => (
                  <tr key={p.rank}>
                    <td className="p-4 py-3">
                      <span className={`text-lg font-bold ${p.rank === 1 ? "text-yellow-500" : p.rank === 2 ? "text-gray-400" : p.rank === 3 ? "text-amber-600" : "text-muted-foreground"}`}>
                        #{p.rank}
                      </span>
                    </td>
                    <td className="py-3">
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.city}</p>
                      </div>
                    </td>
                    <td className="py-3">{p.game === "Ludo" ? "🎲" : "🎯"} {p.game}</td>
                    <td className="py-3 text-right font-medium">{p.wins}</td>
                    <td className="py-3 text-right">🪙 {p.coinEarned.toLocaleString()}</td>
                    <td className="py-3"><span className="text-sm">{p.badge}</span></td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs">View Profile</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {tab === "fraud" && (
        <div className="space-y-4">
          {FRAUD_FLAGS.map((f) => (
            <Card key={f.id} className={`border-l-4 ${f.severity === "high" ? "border-l-red-500" : "border-l-yellow-500"}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${f.severity === "high" ? "text-red-500" : "text-yellow-500"}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{f.user}</p>
                    <Badge variant={f.severity === "high" ? "destructive" : "secondary"} className="text-xs capitalize">{f.severity}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.type} · {f.rooms} rooms · 🪙 {f.coinGain.toLocaleString()} gain</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.time}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs"><Eye className="w-3.5 h-3.5 mr-1" /> Review</Button>
                  <Button variant="destructive" size="sm" className="h-8 text-xs"><Ban className="w-3.5 h-3.5 mr-1" /> Ban</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Anti-Fraud Engine Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Anti-Cheat Engine", status: "Running", value: 99.2, color: "text-green-600" },
                  { label: "Match Validation", status: "Running", value: 100, color: "text-green-600" },
                  { label: "AI Anomaly Detection", status: "Running", value: 97.8, color: "text-green-600" },
                ].map((s) => (
                  <div key={s.label} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">{s.label}</p>
                      <span className={`text-xs font-medium ${s.color}`}>{s.status}</span>
                    </div>
                    <Progress value={s.value} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{s.value}% accuracy</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
