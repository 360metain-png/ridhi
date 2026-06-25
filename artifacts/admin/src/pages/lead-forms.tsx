import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadCSV } from "@/lib/utils";
import {
  PenTool, Users, ClipboardList, TrendingUp, CheckCircle, Clock, AlertTriangle,
  Search, Download, Eye, Mail, Phone, MapPin,
} from "lucide-react";

const LEAD_FORMS = [
  { id: "lf1", name: "Business Inquiry", brand: "TechCorp", status: "active", submissions: 234, conversionRate: 12, lastSubmission: "2025-06-11 14:00" },
  { id: "lf2", name: "Partner Registration", brand: "Ridhi Partners", status: "active", submissions: 156, conversionRate: 8, lastSubmission: "2025-06-11 13:00" },
  { id: "lf3", name: "Creator Application", brand: "Ridhi Creators", status: "active", submissions: 445, conversionRate: 15, lastSubmission: "2025-06-11 15:00" },
  { id: "lf4", name: "Ad Campaign", brand: "MediaMax", status: "active", submissions: 89, conversionRate: 5, lastSubmission: "2025-06-11 12:00" },
  { id: "lf5", name: "Event Registration", brand: "Ridhi Events", status: "inactive", submissions: 67, conversionRate: 3, lastSubmission: "2025-06-10 10:00" },
];

const LEAD_SUBMISSIONS = [
  { id: "ls1", form: "Business Inquiry", name: "Amit Sharma", email: "amit@techcorp.com", phone: "+91 XXXXX XXXXX", city: "Mumbai", status: "new", submitted: "2025-06-11 14:00" },
  { id: "ls2", form: "Partner Registration", name: "Sunita Patel", email: "sunita@partner.com", phone: "+91 XXXXX XXXXX", city: "Ahmedabad", status: "contacted", submitted: "2025-06-11 13:00" },
  { id: "ls3", form: "Creator Application", name: "Ravi Kumar", email: "ravi@creator.com", phone: "+91 XXXXX XXXXX", city: "Bangalore", status: "approved", submitted: "2025-06-11 15:00" },
  { id: "ls4", form: "Ad Campaign", name: "Priya Nair", email: "priya@mediamax.com", phone: "+91 XXXXX XXXXX", city: "Chennai", status: "new", submitted: "2025-06-11 12:00" },
  { id: "ls5", form: "Business Inquiry", name: "Karan Mehta", email: "karan@techcorp.com", phone: "+91 XXXXX XXXXX", city: "Hyderabad", status: "contacted", submitted: "2025-06-11 11:00" },
  { id: "ls6", form: "Creator Application", name: "Ananya Singh", email: "ananya@creator.com", phone: "+91 XXXXX XXXXX", city: "Delhi", status: "pending", submitted: "2025-06-11 10:00" },
  { id: "ls7", form: "Partner Registration", name: "Deepika Reddy", email: "deepika@partner.com", phone: "+91 XXXXX XXXXX", city: "Pune", status: "new", submitted: "2025-06-11 09:00" },
  { id: "ls8", form: "Ad Campaign", name: "Rohit Verma", email: "rohit@mediamax.com", phone: "+91 XXXXX XXXXX", city: "Kolkata", status: "contacted", submitted: "2025-06-11 08:00" },
];

export default function LeadFormsPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("forms");
  const totalForms = LEAD_FORMS.length;
  const totalSubmissions = LEAD_SUBMISSIONS.length;
  const avgConversion = Math.round(LEAD_FORMS.reduce((s, f) => s + f.conversionRate, 0) / LEAD_FORMS.length);
  const newLeads = LEAD_SUBMISSIONS.filter((l) => l.status === "new");

  const filteredForms = LEAD_FORMS.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.brand.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSubmissions = LEAD_SUBMISSIONS.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase()) ||
    s.form.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
          const rows: Record<string, string | number>[] = [];
          downloadCSV("lead-forms_report.csv", rows);
        }}>
          <Download className="w-3 h-3" /> Export CSV
        </Button>
      </div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PenTool className="w-6 h-6 text-indigo-500" />
            Lead Forms
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage lead forms, submissions, and conversions
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9 w-64" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={ClipboardList} label="Forms" value={totalForms.toString()} />
        <KpiCard icon={Users} label="Submissions" value={totalSubmissions.toLocaleString()} />
        <KpiCard icon={TrendingUp} label="Avg Conversion" value={`${avgConversion}%`} />
        <KpiCard icon={AlertTriangle} label="New Leads" value={newLeads.length.toString()} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="forms" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Conversion</TableHead>
                    <TableHead>Last Submission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredForms.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell>{f.brand}</TableCell>
                      <TableCell>
                        <Badge variant={f.status === "active" ? "default" : "secondary"}>
                          {f.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{f.submissions.toLocaleString()}</TableCell>
                      <TableCell className="font-bold">{f.conversionRate}%</TableCell>
                      <TableCell>{f.lastSubmission}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell><Badge variant="outline">{s.form}</Badge></TableCell>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>{s.phone}</TableCell>
                      <TableCell>{s.city}</TableCell>
                      <TableCell>
                        <Badge variant={s.status === "new" ? "outline" : s.status === "approved" ? "default" : "secondary"}>
                          {s.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{s.submitted}</TableCell>
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
              <CardTitle className="text-sm font-medium">Form Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredForms.map((f) => (
                  <div key={f.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500/15">
                      <ClipboardList className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{f.name}</div>
                      <div className="text-xs text-muted-foreground">{f.brand}</div>
                    </div>
                    <div className="text-sm font-bold">{f.submissions.toLocaleString()} submissions</div>
                    <div className="text-sm font-bold">{f.conversionRate}% conversion</div>
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
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-500/15">
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
