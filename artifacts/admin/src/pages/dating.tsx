import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart, Users, TrendingUp, Ban, AlertTriangle, Search, Eye, MessageCircle,
  Star, MapPin, Clock, Shield, X, CheckCircle,
} from "lucide-react";

const MATCHES = [
  { id: "m1", user1: "Priya Sharma", user2: "Rahul Verma", city: "Mumbai", matchDate: "2025-06-11", status: "active", compatibility: 92, messages: 45, calls: 3, flagged: false },
  { id: "m2", user1: "Ananya Singh", user2: "Karan Mehta", city: "Delhi", matchDate: "2025-06-10", status: "active", compatibility: 87, messages: 23, calls: 0, flagged: false },
  { id: "m3", user1: "Deepika Nair", user2: "Arjun Reddy", city: "Bangalore", matchDate: "2025-06-09", status: "muted", compatibility: 78, messages: 12, calls: 1, flagged: true },
  { id: "m4", user1: "Sneha Patel", user2: "Vikram Kumar", city: "Chennai", matchDate: "2025-06-08", status: "active", compatibility: 85, messages: 67, calls: 5, flagged: false },
  { id: "m5", user1: "Meera Krishnan", user2: "Ravi Shankar", city: "Hyderabad", matchDate: "2025-06-11", status: "active", compatibility: 95, messages: 89, calls: 7, flagged: false },
  { id: "m6", user1: "Aarav Sharma", user2: "Diya Patel", city: "Pune", matchDate: "2025-06-07", status: "blocked", compatibility: 45, messages: 0, calls: 0, flagged: true },
  { id: "m7", user1: "Natasha Roy", user2: "Rohit K", city: "Kolkata", matchDate: "2025-06-06", status: "active", compatibility: 88, messages: 34, calls: 2, flagged: false },
  { id: "m8", user1: "Pooja Verma", user2: "Ishaan Mehta", city: "Ahmedabad", matchDate: "2025-06-05", status: "active", compatibility: 91, messages: 56, calls: 4, flagged: false },
];

const REPORTS = [
  { id: "r1", reporter: "Priya Sharma", reported: "Rahul Verma", reason: "Fake Profile", status: "pending", submitted: "2025-06-11" },
  { id: "r2", reporter: "Ananya Singh", reported: "Karan Mehta", reason: "Harassment", status: "resolved", submitted: "2025-06-10" },
  { id: "r3", reporter: "Deepika Nair", reported: "Arjun Reddy", reason: "Inappropriate Content", status: "pending", submitted: "2025-06-09" },
  { id: "r4", reporter: "Sneha Patel", reported: "Vikram Kumar", reason: "Spam", status: "investigating", submitted: "2025-06-08" },
];

export default function DatingPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("matches");
  const activeMatches = MATCHES.filter((m) => m.status === "active");
  const totalMessages = MATCHES.reduce((s, m) => s + m.messages, 0);
  const flaggedMatches = MATCHES.filter((m) => m.flagged);
  const avgCompatibility = Math.round(MATCHES.reduce((s, m) => s + m.compatibility, 0) / MATCHES.length);

  const filteredMatches = MATCHES.filter((m) =>
    m.user1.toLowerCase().includes(search.toLowerCase()) ||
    m.user2.toLowerCase().includes(search.toLowerCase()) ||
    m.city.toLowerCase().includes(search.toLowerCase())
  );

  const filteredReports = REPORTS.filter((r) =>
    r.reporter.toLowerCase().includes(search.toLowerCase()) ||
    r.reported.toLowerCase().includes(search.toLowerCase()) ||
    r.reason.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            Dating & Match
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor matches, swipe activity, and dating reports
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9 w-64" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Users} label="Active Matches" value={activeMatches.length.toString()} />
        <KpiCard icon={MessageCircle} label="Total Messages" value={totalMessages.toLocaleString()} />
        <KpiCard icon={Star} label="Avg Compatibility" value={`${avgCompatibility}%`} />
        <KpiCard icon={AlertTriangle} label="Flagged" value={flaggedMatches.length.toString()} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Compatibility</TableHead>
                    <TableHead>Messages</TableHead>
                    <TableHead>Calls</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Flagged</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMatches.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="font-medium">{m.user1} + {m.user2}</div>
                        <div className="text-xs text-muted-foreground">{m.matchDate}</div>
                      </TableCell>
                      <TableCell>{m.city}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${m.compatibility}%` }} />
                          </div>
                          <span className="text-xs font-bold">{m.compatibility}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{m.messages}</TableCell>
                      <TableCell>{m.calls}</TableCell>
                      <TableCell>
                        <Badge variant={m.status === "active" ? "default" : m.status === "muted" ? "secondary" : "destructive"}>
                          {m.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {m.flagged ? (
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

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Reported</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.reporter}</TableCell>
                      <TableCell>{r.reported}</TableCell>
                      <TableCell><Badge variant="outline">{r.reason}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={r.status === "pending" ? "outline" : r.status === "resolved" ? "default" : "secondary"}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.submitted}</TableCell>
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
              <CardTitle className="text-sm font-medium">Match Distribution by City</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad"].map((city) => {
                  const count = MATCHES.filter((m) => m.city === city).length;
                  return (
                    <div key={city} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/15">
                        <MapPin className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{city}</div>
                      </div>
                      <div className="text-sm font-bold">{count} matches</div>
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
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="text-lg font-bold mt-1">{value}</div>
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500/15">
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
