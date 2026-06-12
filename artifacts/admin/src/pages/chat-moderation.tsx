import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare, Shield, AlertTriangle, Eye, Ban, CheckCircle,
  Search, Users, Clock, MessageCircle, Image, Mic, Flag,
  TrendingUp, ArrowUpRight,
} from "lucide-react";

const CHATS = [
  { id: "c1", user1: "Priya Sharma", user2: "Rahul Verma", messages: 234, lastActive: "2025-06-11 14:30", status: "active", flagged: false, type: "dm" },
  { id: "c2", user1: "Ananya Singh", user2: "Karan Mehta", messages: 189, lastActive: "2025-06-11 13:15", status: "active", flagged: true, type: "dm" },
  { id: "c3", user1: "Deepika Nair", user2: "Arjun Reddy", messages: 56, lastActive: "2025-06-11 12:00", status: "active", flagged: false, type: "dm" },
  { id: "c4", user1: "Sneha Patel", user2: "Vikram Kumar", messages: 12, lastActive: "2025-06-11 10:00", status: "muted", flagged: true, type: "dm" },
  { id: "c5", user1: "Meera Krishnan", user2: "Ravi Shankar", messages: 345, lastActive: "2025-06-11 15:00", status: "active", flagged: false, type: "dm" },
  { id: "c6", user1: "Group: Mumbai Creators", user2: "12 members", messages: 567, lastActive: "2025-06-11 14:45", status: "active", flagged: false, type: "group" },
  { id: "c7", user1: "Group: Delhi Gamers", user2: "8 members", messages: 234, lastActive: "2025-06-11 13:30", status: "active", flagged: true, type: "group" },
  { id: "c8", user1: "Group: Bangalore Foodies", user2: "15 members", messages: 890, lastActive: "2025-06-11 15:30", status: "active", flagged: false, type: "group" },
];

const REPORTS = [
  { id: "r1", reporter: "Priya Sharma", reported: "Rahul Verma", reason: "Harassment", message: "Inappropriate language detected", status: "pending", submitted: "2025-06-11 10:00" },
  { id: "r2", reporter: "Ananya Singh", reported: "Karan Mehta", reason: "Spam", message: "Repeated promotional messages", status: "resolved", submitted: "2025-06-10 14:00" },
  { id: "r3", reporter: "Deepika Nair", reported: "Arjun Reddy", reason: "Abuse", message: "Threatening language", status: "pending", submitted: "2025-06-11 09:00" },
  { id: "r4", reporter: "Sneha Patel", reported: "Vikram Kumar", reason: "Fake Profile", message: "Impersonating another user", status: "investigating", submitted: "2025-06-09 16:00" },
  { id: "r5", reporter: "Meera Krishnan", reported: "Ravi Shankar", reason: "Inappropriate Content", message: "Shared explicit image", status: "resolved", submitted: "2025-06-08 11:00" },
];

export default function ChatModerationPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("chats");
  const activeChats = CHATS.filter((c) => c.status === "active");
  const totalMessages = CHATS.reduce((s, c) => s + c.messages, 0);
  const flaggedChats = CHATS.filter((c) => c.flagged);
  const pendingReports = REPORTS.filter((r) => r.status === "pending");

  const filteredChats = CHATS.filter((c) =>
    c.user1.toLowerCase().includes(search.toLowerCase()) ||
    c.user2.toLowerCase().includes(search.toLowerCase())
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
            <MessageSquare className="w-6 h-6 text-blue-500" />
            Chat Moderation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor chats, flag violations, and handle reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9 w-64" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Users} label="Active Chats" value={activeChats.length.toString()} />
        <KpiCard icon={MessageCircle} label="Total Messages" value={totalMessages.toLocaleString()} />
        <KpiCard icon={Flag} label="Flagged Chats" value={flaggedChats.length.toString()} />
        <KpiCard icon={AlertTriangle} label="Pending Reports" value={pendingReports.length.toString()} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chats">Chats</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="chats" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chat</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Messages</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Flagged</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChats.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="font-medium">{c.user1}</div>
                        <div className="text-xs text-muted-foreground">{c.user2}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{c.type === "dm" ? "Direct" : "Group"}</Badge>
                      </TableCell>
                      <TableCell>{c.messages.toLocaleString()}</TableCell>
                      <TableCell>{c.lastActive}</TableCell>
                      <TableCell>
                        <Badge variant={c.status === "active" ? "default" : c.status === "muted" ? "secondary" : "destructive"}>
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {c.flagged ? (
                          <div className="flex items-center gap-1 text-red-400">
                            <AlertTriangle className="w-3 h-3" /> Yes
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle className="w-3 h-3" /> No
                          </div>
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
                    <TableHead>Report</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Reported</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.id}</TableCell>
                      <TableCell>{r.reporter}</TableCell>
                      <TableCell>{r.reported}</TableCell>
                      <TableCell><Badge variant="outline">{r.reason}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs">{r.message}</TableCell>
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
              <CardTitle className="text-sm font-medium">Report Reasons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["Harassment", "Spam", "Abuse", "Fake Profile", "Inappropriate Content"].map((reason, i) => {
                  const count = [1, 1, 1, 1, 1][i];
                  return (
                    <div key={reason} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/15">
                        <AlertTriangle className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{reason}</div>
                      </div>
                      <div className="text-sm font-bold">{count}</div>
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
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/15">
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
