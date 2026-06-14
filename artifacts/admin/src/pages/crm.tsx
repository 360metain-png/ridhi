"use client";

import { useState, useMemo } from "react";
import {
  Inbox, Users, MessageSquareText, BarChart3, Clock, AlertTriangle,
  CheckCircle, Star, Search, ChevronLeft, ChevronRight, Send, Wand2,
  Phone, Mail, MapPin, ThumbsUp, ThumbsDown, Meh, Reply, Shield, User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import {
  mockTickets, mockContacts, mockMacros, mockAgentPerformance,
  getTicketStats, getTicketTrends, getContactSegments, getContactLifecycle,
  type MockTicket, type MockContact,
} from "@/data/crm-mock";

const COLORS = {
  primary: "#7B2FBE", magenta: "#E91E8C", indigo: "#6366F1",
  teal: "#14B8A6", amber: "#F59E0B", rose: "#F43F5E",
  emerald: "#10B981", slate: "#64748B", orange: "#F97316",
  cyan: "#06B6D4", violet: "#8B5CF6",
};

const CHART_COLORS = [
  COLORS.primary, COLORS.magenta, COLORS.indigo, COLORS.teal,
  COLORS.amber, COLORS.rose, COLORS.emerald, COLORS.slate,
  COLORS.orange, COLORS.cyan,
];

const statusBadge: Record<string, { variant: string; class: string }> = {
  open: { variant: "outline", class: "text-blue-600 border-blue-200 bg-blue-50" },
  in_progress: { variant: "outline", class: "text-amber-600 border-amber-200 bg-amber-50" },
  pending: { variant: "outline", class: "text-orange-600 border-orange-200 bg-orange-50" },
  resolved: { variant: "outline", class: "text-emerald-600 border-emerald-200 bg-emerald-50" },
  closed: { variant: "outline", class: "text-slate-600 border-slate-200 bg-slate-50" },
  escalated: { variant: "destructive", class: "" },
  spam: { variant: "outline", class: "text-gray-500 border-gray-200" },
};

const priorityBadge: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-amber-100 text-amber-600",
  urgent: "bg-rose-100 text-rose-600",
  critical: "bg-destructive text-white",
};

const sentimentIcon = (s: string) => {
  if (s === "positive") return <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />;
  if (s === "negative" || s === "angry") return <ThumbsDown className="w-3.5 h-3.5 text-rose-500" />;
  return <Meh className="w-3.5 h-3.5 text-amber-500" />;
};

function KPICard({ title, value, icon: Icon, color, alert }: {
  title: string; value: number; icon: any; color: string; alert?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">{title}</div>
            <div className={`text-2xl font-bold mt-1 ${alert ? "text-rose-600" : ""}`}>{value}</div>
          </div>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CRMPage() {
  const [tab, setTab] = useState("dashboard");
  const [ticketFilter, setTicketFilter] = useState<"all" | MockTicket["status"]>("all");
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketPage, setTicketPage] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<MockTicket | null>(null);
  const [contactSearch, setContactSearch] = useState("");
  const [contactPage, setContactPage] = useState(0);
  const [selectedContact, setSelectedContact] = useState<MockContact | null>(null);
  const [macroSearch, setMacroSearch] = useState("");

  const stats = useMemo(() => getTicketStats(), []);
  const trends = useMemo(() => getTicketTrends(), []);
  const segments = useMemo(() => getContactSegments(), []);
  const lifecycle = useMemo(() => getContactLifecycle(), []);

  const filteredTickets = useMemo(() => {
    let list = mockTickets;
    if (ticketFilter !== "all") list = list.filter((t) => t.status === ticketFilter);
    if (ticketSearch) {
      const q = ticketSearch.toLowerCase();
      list = list.filter((t) =>
        t.subject.toLowerCase().includes(q) ||
        t.ticketNumber.toLowerCase().includes(q) ||
        t.requesterName.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [ticketFilter, ticketSearch]);

  const pageSize = 12;
  const ticketPages = Math.ceil(filteredTickets.length / pageSize);
  const paginatedTickets = filteredTickets.slice(ticketPage * pageSize, (ticketPage + 1) * pageSize);

  const filteredContacts = useMemo(() => {
    let list = mockContacts;
    if (contactSearch) {
      const q = contactSearch.toLowerCase();
      list = list.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q)
      );
    }
    return list;
  }, [contactSearch]);
  const contactPages = Math.ceil(filteredContacts.length / pageSize);
  const paginatedContacts = filteredContacts.slice(contactPage * pageSize, (contactPage + 1) * pageSize);

  const filteredMacros = useMemo(() => {
    let list = mockMacros;
    if (macroSearch) {
      const q = macroSearch.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
    }
    return list;
  }, [macroSearch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CRM & Support</h1>
          <p className="text-sm text-muted-foreground">Ticketing, contacts, macros, and team performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Inbox className="w-3.5 h-3.5" /> New Ticket
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KPICard title="Total Tickets" value={stats.total} icon={Inbox} color="bg-primary/10 text-primary" />
        <KPICard title="Open" value={stats.open} icon={Clock} color="bg-blue-50 text-blue-600" alert={stats.open > 20} />
        <KPICard title="In Progress" value={stats.inProgress} icon={Clock} color="bg-amber-50 text-amber-600" />
        <KPICard title="Resolved" value={stats.resolved} icon={CheckCircle} color="bg-emerald-50 text-emerald-600" />
        <KPICard title="SLA Breached" value={stats.slaBreached} icon={AlertTriangle} color="bg-rose-50 text-rose-600" alert={stats.slaBreached > 0} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full flex overflow-x-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="macros">Macros</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Ticket Volume (30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="created" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.2} name="Created" />
                    <Area type="monotone" dataKey="resolved" stroke={COLORS.emerald} fill={COLORS.emerald} fillOpacity={0.2} name="Resolved" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">By Status</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.byStatus} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="status" label={({ status, count }) => `${status}: ${count}`}>
                        {stats.byStatus.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">By Priority</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.byPriority.map((p) => (
                    <div key={p.priority} className="flex items-center gap-2">
                      <div className="w-20 text-xs capitalize">{p.priority}</div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${priorityBadge[p.priority] || "bg-slate-300"}`} style={{ width: `${(p.count / stats.total) * 100}%` }} />
                      </div>
                      <div className="w-8 text-xs text-right">{p.count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Top Categories</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.byCategory.slice(0, 6).map((c) => (
                    <div key={c.category} className="flex items-center gap-2">
                      <div className="w-24 text-xs capitalize truncate">{c.category.replace(/_/g, " ")}</div>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(c.count / stats.byCategory[0].count) * 100}%` }} />
                      </div>
                      <div className="w-8 text-xs text-right">{c.count}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Contact Segments</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={segments} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label>
                        {segments.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Lifecycle Stages</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={lifecycle}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {lifecycle.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tickets */}
        <TabsContent value="tickets" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets by subject, ID, user..."
                value={ticketSearch}
                onChange={(e) => { setTicketSearch(e.target.value); setTicketPage(0); }}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1">
              {(["all", "open", "in_progress", "pending", "resolved", "escalated"] as const).map((s) => (
                <Button
                  key={s}
                  variant={ticketFilter === s ? "default" : "outline"}
                  size="sm"
                  className="text-xs capitalize"
                  onClick={() => { setTicketFilter(s); setTicketPage(0); }}
                >
                  {s.replace("_", " ")}
                </Button>
              ))}
            </div>
            <div className="ml-auto text-xs text-muted-foreground">{filteredTickets.length} tickets</div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Ticket</TableHead>
                  <TableHead className="text-xs">Subject</TableHead>
                  <TableHead className="text-xs">Requester</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Priority</TableHead>
                  <TableHead className="text-xs">Category</TableHead>
                  <TableHead className="text-xs">Assigned</TableHead>
                  <TableHead className="text-xs">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTickets.map((t) => {
                  const sb = statusBadge[t.status];
                  return (
                    <TableRow key={t.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedTicket(t)}>
                      <TableCell className="text-xs">
                        <div className="font-medium">{t.ticketNumber}</div>
                        <div className="text-muted-foreground">{t.source}</div>
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px]">
                        <div className="truncate font-medium">{t.subject}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {sentimentIcon(t.sentiment)}
                          {t.slaBreached && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="font-medium">{t.requesterName}</div>
                        <Badge variant="outline" className="text-[10px] h-4 capitalize">{t.requesterType}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant={sb.variant as any} className={`text-[10px] h-4 capitalize ${sb.class}`}>
                          {t.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge className={`text-[10px] h-4 ${priorityBadge[t.priority]}`}>{t.priority}</Badge>
                      </TableCell>
                      <TableCell className="text-xs capitalize">{t.category.replace(/_/g, " ")}</TableCell>
                      <TableCell className="text-xs">{t.assignedTo || "Unassigned"}</TableCell>
                      <TableCell className="text-xs">
                        {new Date(t.updatedAt).toLocaleDateString()}
                        {t.reopenCount > 0 && <div className="text-rose-500 text-[10px]">Reopened {t.reopenCount}x</div>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Page {ticketPage + 1} of {ticketPages || 1}</div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={ticketPage === 0} onClick={() => setTicketPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={ticketPage >= ticketPages - 1} onClick={() => setTicketPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              {selectedTicket && (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{selectedTicket.ticketNumber}</Badge>
                      <Badge className={`text-[10px] h-4 ${priorityBadge[selectedTicket.priority]}`}>{selectedTicket.priority}</Badge>
                      <Badge variant={statusBadge[selectedTicket.status].variant as any} className={`text-[10px] h-4 capitalize ${statusBadge[selectedTicket.status].class}`}>
                        {selectedTicket.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <DialogTitle className="text-lg mt-2">{selectedTicket.subject}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-muted p-2 rounded-md">
                        <div className="text-muted-foreground">Requester</div>
                        <div className="font-medium">{selectedTicket.requesterName}</div>
                        <div className="text-muted-foreground">{selectedTicket.requesterEmail} &middot; {selectedTicket.requesterPhone}</div>
                      </div>
                      <div className="bg-muted p-2 rounded-md">
                        <div className="text-muted-foreground">Assigned</div>
                        <div className="font-medium">{selectedTicket.assignedTo || "Unassigned"}</div>
                        <div className="text-muted-foreground">{selectedTicket.assignedTeam} team</div>
                      </div>
                    </div>
                    <div className="text-sm border-l-2 border-primary pl-3 py-1">{selectedTicket.description}</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedTicket.tags.map((tag) => <Badge key={tag} variant="outline" className="text-[10px] h-4 capitalize">{tag.replace(/_/g, " ")}</Badge>)}
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold">Conversation</h4>
                      {selectedTicket.comments.map((c) => (
                        <div key={c.id} className={`p-3 rounded-md text-sm ${c.isInternal ? "bg-amber-50 border border-amber-200" : "bg-muted"}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-xs">{c.authorName}</span>
                            <Badge variant="outline" className="text-[10px] h-4">{c.authorRole}</Badge>
                            <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-xs">{c.body}</p>
                        </div>
                      ))}
                    </div>
                    {selectedTicket.internalNotes.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Internal Notes</h4>
                        {selectedTicket.internalNotes.map((n, i) => (
                          <div key={i} className="text-xs bg-amber-50 p-2 rounded-md border border-amber-200">
                            <span className="font-medium">{n.by}</span>: {n.note}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button size="sm" className="gap-1"><Reply className="w-3.5 h-3.5" /> Reply</Button>
                      <Button variant="outline" size="sm" className="gap-1"><CheckCircle className="w-3.5 h-3.5" /> Resolve</Button>
                      <Button variant="outline" size="sm" className="gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Escalate</Button>
                      <Button variant="outline" size="sm" className="gap-1"><Wand2 className="w-3.5 h-3.5" /> Macro</Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Contacts */}
        <TabsContent value="contacts" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search contacts..." value={contactSearch} onChange={(e) => { setContactSearch(e.target.value); setContactPage(0); }} className="pl-9" />
            </div>
            <div className="ml-auto text-xs text-muted-foreground">{filteredContacts.length} contacts</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginatedContacts.map((c) => (
              <Card key={c.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedContact(c)}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h4 className="font-semibold text-sm truncate">{c.name}</h4>
                        <Badge variant="outline" className="text-[10px] h-4 capitalize">{c.type}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{c.email}</div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.city}</span>
                        <span className="flex items-center gap-1"><Inbox className="w-3 h-3" /> {c.totalTickets} tickets</span>
                        {c.openTickets > 0 && <span className="flex items-center gap-1 text-rose-500"><AlertTriangle className="w-3 h-3" /> {c.openTickets} open</span>}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {c.tags.map((tag) => <Badge key={tag} variant="outline" className="text-[10px] h-4">{tag}</Badge>)}
                        <Badge className={`text-[10px] h-4 ${c.supportTier === "vip" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{c.supportTier}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Page {contactPage + 1} of {contactPages || 1}</div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={contactPage === 0} onClick={() => setContactPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={contactPage >= contactPages - 1} onClick={() => setContactPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
            <DialogContent className="max-w-lg">
              {selectedContact && (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <DialogTitle className="text-lg">{selectedContact.name}</DialogTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] h-4 capitalize">{selectedContact.type}</Badge>
                          <Badge className={`text-[10px] h-4 ${selectedContact.lifecycleStage === "churned" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>{selectedContact.lifecycleStage}</Badge>
                        </div>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted p-2 rounded-md"><div className="text-xs text-muted-foreground">Email</div><div className="text-xs">{selectedContact.email}</div></div>
                      <div className="bg-muted p-2 rounded-md"><div className="text-xs text-muted-foreground">Phone</div><div className="text-xs">{selectedContact.phone}</div></div>
                      <div className="bg-muted p-2 rounded-md"><div className="text-xs text-muted-foreground">Location</div><div className="text-xs">{selectedContact.city}, {selectedContact.state}</div></div>
                      <div className="bg-muted p-2 rounded-md"><div className="text-xs text-muted-foreground">Revenue</div><div className="text-xs">&#8377;{selectedContact.totalRevenue.toLocaleString()}</div></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-muted p-2 rounded-md"><div className="text-lg font-bold">{selectedContact.totalTickets}</div><div className="text-[10px] text-muted-foreground">Total Tickets</div></div>
                      <div className="bg-muted p-2 rounded-md"><div className="text-lg font-bold">{selectedContact.openTickets}</div><div className="text-[10px] text-muted-foreground">Open</div></div>
                      <div className="bg-muted p-2 rounded-md"><div className="text-lg font-bold">{selectedContact.avgSatisfaction || "-"}</div><div className="text-[10px] text-muted-foreground">Avg Rating</div></div>
                    </div>
                    {selectedContact.notes.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-xs">Notes</h4>
                        {selectedContact.notes.map((n, i) => (
                          <div key={i} className="text-xs bg-amber-50 p-2 rounded-md border border-amber-200">
                            <span className="font-medium">{n.by}</span> ({n.category}): {n.note}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button size="sm" className="gap-1"><MessageSquareText className="w-3.5 h-3.5" /> New Ticket</Button>
                      <Button variant="outline" size="sm" className="gap-1"><Phone className="w-3.5 h-3.5" /> Call</Button>
                      <Button variant="outline" size="sm" className="gap-1"><Mail className="w-3.5 h-3.5" /> Email</Button>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Macros */}
        <TabsContent value="macros" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search macros..." value={macroSearch} onChange={(e) => setMacroSearch(e.target.value)} className="pl-9" />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5"><Wand2 className="w-3.5 h-3.5" /> New Macro</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredMacros.map((m) => (
              <Card key={m.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">{m.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] h-4 capitalize">{m.category}</Badge>
                        <span className="text-[10px] text-muted-foreground">{m.useCount} uses</span>
                      </div>
                    </div>
                    <Badge className={`text-[10px] h-4 ${m.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{m.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md">{m.body}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.tags.map((tag) => <Badge key={tag} variant="outline" className="text-[10px] h-4">{tag}</Badge>)}
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t">
                    <Button variant="ghost" size="sm" className="h-6 text-xs gap-1"><Send className="w-3 h-3" /> Use</Button>
                    <Button variant="ghost" size="sm" className="h-6 text-xs gap-1"><MessageSquareText className="w-3 h-3" /> Edit</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Team */}
        <TabsContent value="team" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockAgentPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="agentName" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="ticketsResolved" fill={COLORS.emerald} name="Resolved" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="ticketsEscalated" fill={COLORS.rose} name="Escalated" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Avg Resolution Time (min)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockAgentPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="agentName" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="avgResolutionTime" fill={COLORS.primary} name="Resolution Time" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="avgFirstResponseTime" fill={COLORS.amber} name="First Response" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Agent Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAgentPerformance
                  .sort((a, b) => b.ticketsResolved - a.ticketsResolved)
                  .map((a, i) => (
                    <div key={a.agentId} className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                      <div className="w-8 text-center font-bold text-sm">{i + 1}</div>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{a.agentName}</div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{a.ticketsResolved} resolved</span>
                          <span>{a.ticketsEscalated} escalated</span>
                          <span>{a.avgResolutionTime}min avg</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-center">
                          <div className="font-bold">{a.slaCompliance}%</div>
                          <div className="text-muted-foreground">SLA</div>
                        </div>
                        <div className="text-xs text-center">
                          <div className="font-bold">{a.avgSatisfaction}</div>
                          <div className="text-muted-foreground">Rating</div>
                        </div>
                        <div className="text-xs text-center">
                          <div className="font-bold">{a.qualityScore}</div>
                          <div className="text-muted-foreground">Quality</div>
                        </div>
                      </div>
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
