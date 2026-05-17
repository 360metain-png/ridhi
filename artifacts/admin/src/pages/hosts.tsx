import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Star, TrendingUp, IndianRupee, Users, Eye, CheckCircle,
  Search, Radio, Award, Crown, Zap, ShieldCheck, Heart,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const HOST_LEVELS = [
  { level: "L1", title: "Bronze", minCoins: 50000, badge: "🥉", color: "#CD7F32", next: "L2" },
  { level: "L2", title: "Silver", minCoins: 200000, badge: "🥈", color: "#9E9E9E", next: "L3" },
  { level: "L3", title: "Gold", minCoins: 500000, badge: "🥇", color: "#FFB800", next: "L4" },
  { level: "L4", title: "Platinum", minCoins: 1000000, badge: "💎", color: "#00BCD4", next: "L5" },
  { level: "L5", title: "Diamond", minCoins: 2000000, badge: "🔷", color: "#2196F3", next: "L6" },
  { level: "L6", title: "Elite", minCoins: 3500000, badge: "⭐", color: "#7B2FBE", next: "L7" },
  { level: "L7", title: "Royal Crown", minCoins: 5000000, badge: "👑", color: "#E91E8C", next: null },
];

const HOSTS = [
  { id: "h1", name: "Priya Sharma", city: "Mumbai", language: "Hindi", level: "L7", coinsReceived: 6840000, followers: 128400, isLive: true, agent: "Vikram Rao (A5)", earnings: 284000, pkWins: 48, streamHours: 1240, verified: true, status: "active" },
  { id: "h2", name: "Rahul Verma", city: "Delhi", language: "Hindi", level: "L6", coinsReceived: 3920000, followers: 98200, isLive: false, agent: "Sunita Joshi (A4)", earnings: 142000, pkWins: 32, streamHours: 840, verified: true, status: "active" },
  { id: "h3", name: "Kavya Reddy", city: "Hyderabad", language: "Telugu", level: "L5", coinsReceived: 2140000, followers: 76800, isLive: true, agent: "Deepak Singh (A3)", earnings: 84000, pkWins: 24, streamHours: 620, verified: true, status: "active" },
  { id: "h4", name: "Dev Kumar", city: "Bangalore", language: "English", level: "L4", coinsReceived: 1280000, followers: 54300, isLive: false, agent: "Meena Kumari (A2)", earnings: 58000, pkWins: 18, streamHours: 440, verified: false, status: "active" },
  { id: "h5", name: "Meera Pillai", city: "Kochi", language: "Malayalam", level: "L3", coinsReceived: 620000, followers: 41200, isLive: false, agent: "Rajan Pillai (A1)", earnings: 24000, pkWins: 9, streamHours: 280, verified: true, status: "active" },
  { id: "h6", name: "Arjun Shah", city: "Surat", language: "Gujarati", level: "L2", coinsReceived: 240000, followers: 28700, isLive: false, agent: "None", earnings: 9600, pkWins: 4, streamHours: 140, verified: false, status: "active" },
  { id: "h7", name: "Riya Das", city: "Kolkata", language: "Bengali", level: "L1", coinsReceived: 72000, followers: 12100, isLive: false, agent: "Vikram Rao (A5)", earnings: 2800, pkWins: 1, streamHours: 48, verified: false, status: "suspended" },
];

const hostEarningsData = [
  { month: "Aug", l7: 220000, l6: 110000, l5: 62000, l4: 40000 },
  { month: "Sep", l7: 248000, l6: 124000, l5: 72000, l4: 46000 },
  { month: "Oct", l7: 260000, l6: 130000, l5: 78000, l4: 50000 },
  { month: "Nov", l7: 272000, l6: 136000, l5: 80000, l4: 54000 },
  { month: "Dec", l7: 284000, l6: 142000, l5: 84000, l4: 58000 },
];

const levelOf = (l: string) => HOST_LEVELS.find((h) => h.level === l);

export default function HostsPage() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const filtered = HOSTS.filter((h) => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) || h.city.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === "all" || h.level === levelFilter;
    return matchSearch && matchLevel;
  });

  const liveHosts = HOSTS.filter((h) => h.isLive).length;
  const totalEarnings = HOSTS.reduce((s, h) => s + h.earnings, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Star className="w-6 h-6 text-primary" />
            Host Management
          </h2>
          <p className="text-muted-foreground text-sm mt-1">L1 Bronze → L7 Royal Crown · Earnings · PK Battles · Live Streams</p>
        </div>
        <Badge className="gap-1 bg-green-600 hover:bg-green-600">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse inline-block" />
          {liveHosts} Live Now
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        {HOST_LEVELS.map((lvl) => {
          const count = HOSTS.filter((h) => h.level === lvl.level).length;
          return (
            <button
              key={lvl.level}
              onClick={() => setLevelFilter(levelFilter === lvl.level ? "all" : lvl.level)}
              className={`text-left border rounded-lg p-3 transition-all ${levelFilter === lvl.level ? "ring-2 ring-offset-1" : "hover:bg-muted/50"}`}
              style={{ borderColor: lvl.color + "60", ...(levelFilter === lvl.level ? { ringColor: lvl.color } : {}) }}
            >
              <p className="text-xl">{lvl.badge}</p>
              <p className="text-xs font-bold mt-1" style={{ color: lvl.color }}>{lvl.level} {lvl.title}</p>
              <p className="text-lg font-bold">{count}</p>
              <p className="text-xs text-muted-foreground">hosts</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Hosts", value: HOSTS.length, icon: Users, color: "text-purple-600 bg-purple-50" },
          { label: "Live Right Now", value: liveHosts, icon: Radio, color: "text-red-600 bg-red-50" },
          { label: "Host Earnings (Month)", value: "₹" + (totalEarnings / 1000).toFixed(0) + "K", icon: IndianRupee, color: "text-green-600 bg-green-50" },
          { label: "PK Battles Won", value: HOSTS.reduce((s, h) => s + h.pkWins, 0), icon: Zap, color: "text-yellow-600 bg-yellow-50" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="w-5 h-5" /></div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Host Level Earnings (Monthly)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hostEarningsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                  <Line dataKey="l7" name="L7 Royal Crown" stroke="#E91E8C" strokeWidth={2} dot={false} />
                  <Line dataKey="l6" name="L6 Elite" stroke="#7B2FBE" strokeWidth={2} dot={false} />
                  <Line dataKey="l5" name="L5 Diamond" stroke="#2196F3" strokeWidth={2} dot={false} />
                  <Line dataKey="l4" name="L4 Platinum" stroke="#00BCD4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Top Hosts This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {HOSTS.slice(0, 5).map((h, i) => {
              const lvl = levelOf(h.level);
              return (
                <div key={h.id} className="flex items-center gap-3">
                  <span className={`text-lg font-bold w-6 ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-muted-foreground"}`}>#{i + 1}</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: lvl?.color + "20" }}>
                    {lvl?.badge}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium truncate">{h.name}</p>
                      {h.verified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
                      {h.isLive && <Badge className="text-xs h-4 bg-red-500 hover:bg-red-500 px-1">LIVE</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{h.city} · {h.language}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">🪙 {(h.coinsReceived / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-muted-foreground">received</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Host Directory
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search hosts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 w-48 text-sm" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground text-xs">
                <th className="text-left p-4 pb-3">Host</th>
                <th className="text-left pb-3">Level</th>
                <th className="text-left pb-3">Language</th>
                <th className="text-right pb-3">Followers</th>
                <th className="text-right pb-3">Coins Recv.</th>
                <th className="text-right pb-3">Earnings</th>
                <th className="text-right pb-3">PK Wins</th>
                <th className="text-left pb-3">Agent</th>
                <th className="text-left pb-3">Status</th>
                <th className="text-right pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((h) => {
                const lvl = levelOf(h.level);
                return (
                  <tr key={h.id} className="hover:bg-muted/50">
                    <td className="p-4 py-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium">{h.name}</p>
                            {h.verified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />}
                            {h.isLive && <Badge className="text-xs h-4 bg-red-500 hover:bg-red-500 px-1">LIVE</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{h.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <span>{lvl?.badge}</span>
                        <Badge variant="outline" className="text-xs" style={{ borderColor: lvl?.color, color: lvl?.color }}>
                          {h.level} {lvl?.title}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground">{h.language}</td>
                    <td className="py-3 text-right">{h.followers.toLocaleString()}</td>
                    <td className="py-3 text-right font-medium">🪙 {(h.coinsReceived / 1000).toFixed(0)}K</td>
                    <td className="py-3 text-right font-medium text-green-600">₹{(h.earnings / 1000).toFixed(0)}K</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Zap className="w-3.5 h-3.5 text-yellow-500" />
                        {h.pkWins}
                      </div>
                    </td>
                    <td className="py-3 text-xs text-muted-foreground">{h.agent}</td>
                    <td className="py-3">
                      <div className={`flex items-center gap-1.5 text-xs ${h.status === "active" ? "text-green-600" : "text-red-500"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${h.status === "active" ? "bg-green-500" : "bg-red-500"}`} />
                        {h.status}
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><Eye className="w-3.5 h-3.5" /></Button>
                        {!h.verified && <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600 px-2">Verify</Button>}
                        {h.status === "active" && h.level !== "L7" && <Button variant="ghost" size="sm" className="h-7 text-xs px-2">Promote</Button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4" />
            Level Progression Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left pb-3">Level</th>
                  <th className="text-left pb-3">Title</th>
                  <th className="text-right pb-3">Min Coins Required</th>
                  <th className="text-right pb-3">Hosts at Level</th>
                  <th className="text-right pb-3">Avg Monthly Earning</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {HOST_LEVELS.map((lvl) => {
                  const hostsAtLevel = HOSTS.filter((h) => h.level === lvl.level).length;
                  const avgEarning = HOSTS.filter((h) => h.level === lvl.level).reduce((s, h) => s + h.earnings, 0) / Math.max(hostsAtLevel, 1);
                  return (
                    <tr key={lvl.level}>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span>{lvl.badge}</span>
                          <Badge variant="outline" className="text-xs" style={{ borderColor: lvl.color, color: lvl.color }}>{lvl.level}</Badge>
                        </div>
                      </td>
                      <td className="py-3 font-medium" style={{ color: lvl.color }}>{lvl.title}</td>
                      <td className="py-3 text-right">🪙 {(lvl.minCoins / 100000).toFixed(1)}L</td>
                      <td className="py-3 text-right font-bold">{hostsAtLevel}</td>
                      <td className="py-3 text-right text-green-600 font-medium">₹{(avgEarning / 1000).toFixed(1)}K</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
