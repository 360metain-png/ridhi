import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield, Clock, CheckCircle, XCircle, FileText, Star, Briefcase,
  Eye, AlertTriangle, Search, Filter, Download, RefreshCw, UserCheck, UserX,
} from "lucide-react";

type KycStatus = "pending" | "approved" | "rejected" | "resubmit";
type Role = "host" | "agent";

interface KycEntry {
  id: string;
  name: string;
  email: string;
  role: Role;
  level: string;
  city: string;
  submittedAt: string;
  idType: string;
  idNumber: string;
  addrType: string;
  status: KycStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectReason?: string;
  selfie: boolean;
}

const INITIAL_ENTRIES: KycEntry[] = [
  { id: "k1", name: "Priya Sharma", email: "host.priya@ridhi.app", role: "host", level: "L5", city: "Mumbai", submittedAt: "2 hrs ago", idType: "Aadhaar Card", idNumber: "XXXX XXXX 3821", addrType: "Electricity Bill", status: "pending", selfie: true },
  { id: "k2", name: "Meera Iyer", email: "agent.meera@ridhi.app", role: "agent", level: "A5", city: "Bangalore", submittedAt: "4 hrs ago", idType: "PAN Card", idNumber: "ABCME1234F", addrType: "Bank Statement", status: "pending", selfie: true },
  { id: "k3", name: "Rahul Verma", email: "host.rahul@ridhi.app", role: "host", level: "L6", city: "Delhi", submittedAt: "6 hrs ago", idType: "Passport", idNumber: "P1234567", addrType: "Rent Agreement", status: "pending", selfie: true },
  { id: "k4", name: "Vivek Sharma", email: "agent.vivek@ridhi.app", role: "agent", level: "A4", city: "Mumbai", submittedAt: "10 hrs ago", idType: "Voter ID", idNumber: "MH/12/003/445521", addrType: "Utility Bill", status: "approved", reviewedBy: "Arjun M (Super Admin)", reviewedAt: "8 hrs ago", selfie: true },
  { id: "k5", name: "Ananya Krishnan", email: "host.ananya@ridhi.app", role: "host", level: "L7", city: "Bangalore", submittedAt: "1 day ago", idType: "Aadhaar Card", idNumber: "XXXX XXXX 7412", addrType: "Bank Statement", status: "approved", reviewedBy: "Sneha P (Content Admin)", reviewedAt: "22 hrs ago", selfie: true },
  { id: "k6", name: "Ajay Patel", email: "agent.ajay@ridhi.app", role: "agent", level: "A3", city: "Ahmedabad", submittedAt: "1 day ago", idType: "Driving Licence", idNumber: "GJ02 20190012345", addrType: "Ration Card", status: "rejected", reviewedBy: "Arjun M (Super Admin)", reviewedAt: "20 hrs ago", rejectReason: "Blurry document image. Please re-upload a clear photo.", selfie: false },
  { id: "k7", name: "Neha Gupta", email: "host.neha@ridhi.app", role: "host", level: "L5", city: "Chennai", submittedAt: "2 days ago", idType: "PAN Card", idNumber: "ABCNG5678H", addrType: "Property Tax", status: "resubmit", reviewedBy: "Rohit K (Finance Admin)", reviewedAt: "1 day ago", rejectReason: "Address on document does not match the entered address.", selfie: true },
  { id: "k8", name: "Divya Pillai", email: "host.divya@ridhi.app", role: "host", level: "L6", city: "Kolkata", submittedAt: "3 hrs ago", idType: "Aadhaar Card", idNumber: "XXXX XXXX 9901", addrType: "Electricity Bill", status: "pending", selfie: true },
  { id: "k9", name: "Pooja Nair", email: "agent.pooja@ridhi.app", role: "agent", level: "A2", city: "Kochi", submittedAt: "5 hrs ago", idType: "Voter ID", idNumber: "KL/01/004/112233", addrType: "Bank Statement", status: "pending", selfie: true },
];

const STATUS_META: Record<KycStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  pending: { label: "Pending Review", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", icon: Clock },
  approved: { label: "Approved", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: CheckCircle },
  rejected: { label: "Rejected", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: XCircle },
  resubmit: { label: "Needs Resubmission", color: "text-orange-700", bg: "bg-orange-50 border-orange-200", icon: AlertTriangle },
};

function RejectModal({ entry, onConfirm, onClose }: { entry: KycEntry; onConfirm: (reason: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const QUICK_REASONS = [
    "Blurry or unclear document image",
    "Address does not match entered address",
    "Document expired or invalid",
    "Name mismatch between documents",
    "Selfie does not match ID photo",
    "Document not accepted — please use a valid Indian ID",
  ];
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <XCircle className="w-4 h-4 text-destructive" />
            Reject KYC — {entry.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Quick Reason</Label>
            <div className="flex flex-wrap gap-2">
              {QUICK_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${reason === r ? "bg-destructive/10 border-destructive/40 text-destructive" : "bg-muted border-border hover:bg-muted/80"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Or type a custom reason</Label>
            <textarea
              className="w-full text-sm border rounded-lg p-3 resize-none bg-muted/30 focus:outline-none focus:ring-1 focus:ring-destructive/50"
              rows={3}
              placeholder="Explain why this KYC is being rejected..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button
              size="sm"
              className="flex-1 bg-destructive hover:bg-destructive/90"
              disabled={!reason.trim()}
              onClick={() => reason.trim() && onConfirm(reason.trim())}
            >
              Confirm Rejection
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DocPreviewRow({ label, value, icon: Icon }: { label: string; value: string; icon: typeof FileText }) {
  return (
    <div className="flex items-center gap-2 py-1.5 border-b last:border-0 text-sm">
      <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
      <span className="text-muted-foreground text-xs w-28 flex-shrink-0">{label}</span>
      <span className="font-medium text-xs truncate">{value}</span>
    </div>
  );
}

export default function KYCPage() {
  const [entries, setEntries] = useState<KycEntry[]>(INITIAL_ENTRIES);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "host" | "agent">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | KycStatus>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<KycEntry | null>(null);

  const approveEntry = (id: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: "approved", reviewedBy: "You (Admin)", reviewedAt: "just now" }
          : e
      )
    );
  };

  const rejectEntry = (id: string, reason: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: "rejected", rejectReason: reason, reviewedBy: "You (Admin)", reviewedAt: "just now" }
          : e
      )
    );
    setRejectTarget(null);
  };

  const requestResubmit = (id: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: "resubmit", reviewedBy: "You (Admin)", reviewedAt: "just now" } : e
      )
    );
  };

  const filtered = entries.filter((e) => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || e.role === filterRole;
    const matchStatus = filterStatus === "all" || e.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const stats = {
    pending: entries.filter((e) => e.status === "pending").length,
    approved: entries.filter((e) => e.status === "approved").length,
    rejected: entries.filter((e) => e.status === "rejected").length,
    resubmit: entries.filter((e) => e.status === "resubmit").length,
    total: entries.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            E-KYC Verification
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Review and approve identity documents for Hosts & Agents before enabling earnings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Pending Review", value: stats.pending, color: "text-yellow-600 bg-yellow-50", icon: Clock },
          { label: "Approved", value: stats.approved, color: "text-green-600 bg-green-50", icon: CheckCircle },
          { label: "Rejected", value: stats.rejected, color: "text-red-600 bg-red-50", icon: XCircle },
          { label: "Needs Resubmission", value: stats.resubmit, color: "text-orange-600 bg-orange-50", icon: AlertTriangle },
          { label: "Total Submissions", value: stats.total, color: "text-blue-600 bg-blue-50", icon: FileText },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email…"
              className="pl-9 h-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1">
            {(["all", "host", "agent"] as const).map((r) => (
              <Button
                key={r}
                size="sm"
                variant={filterRole === r ? "default" : "outline"}
                className="h-8 text-xs gap-1.5"
                onClick={() => setFilterRole(r)}
              >
                {r === "host" && <Star className="w-3 h-3" />}
                {r === "agent" && <Briefcase className="w-3 h-3" />}
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Button>
            ))}
          </div>
          <div className="flex gap-1 flex-wrap">
            {(["all", "pending", "approved", "rejected", "resubmit"] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={filterStatus === s ? "default" : "outline"}
                className="h-8 text-xs"
                onClick={() => setFilterStatus(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
                {s === "pending" && stats.pending > 0 && (
                  <Badge className="ml-1 h-4 px-1.5 text-xs bg-yellow-500 text-white">{stats.pending}</Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KYC Table */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No KYC submissions match the current filters.</CardContent></Card>
        )}
        {filtered.map((entry) => {
          const meta = STATUS_META[entry.status];
          const isExpanded = expandedId === entry.id;
          const isPending = entry.status === "pending";

          return (
            <Card key={entry.id} className={`transition-all ${isPending ? "ring-1 ring-yellow-200" : ""}`}>
              <CardContent className="p-0">
                {/* Main row */}
                <div className="flex items-center gap-3 p-4 flex-wrap">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${entry.role === "host" ? "bg-gradient-to-br from-pink-500 to-purple-600" : "bg-gradient-to-br from-blue-500 to-cyan-500"}`}>
                    {entry.name.split(" ").map((n) => n[0]).join("")}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{entry.name}</span>
                      <Badge variant="outline" className={`text-xs ${entry.role === "host" ? "text-pink-600 border-pink-200 bg-pink-50" : "text-blue-600 border-blue-200 bg-blue-50"}`}>
                        {entry.role === "host" ? <Star className="w-2.5 h-2.5 mr-1" /> : <Briefcase className="w-2.5 h-2.5 mr-1" />}
                        {entry.role === "host" ? "Host" : "Agent"} {entry.level}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{entry.email} · {entry.city}</p>
                    <p className="text-xs text-muted-foreground">Submitted {entry.submittedAt}</p>
                  </div>

                  {/* ID Type */}
                  <div className="hidden md:block text-xs text-center">
                    <p className="font-medium">{entry.idType}</p>
                    <p className="text-muted-foreground font-mono">{entry.idNumber}</p>
                  </div>

                  {/* Selfie */}
                  <div className="hidden md:flex items-center gap-1 text-xs">
                    {entry.selfie
                      ? <><CheckCircle className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600">Selfie OK</span></>
                      : <><XCircle className="w-3.5 h-3.5 text-red-500" /><span className="text-red-600">No Selfie</span></>
                    }
                  </div>

                  {/* Status */}
                  <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${meta.bg} ${meta.color}`}>
                    <meta.icon className="w-3.5 h-3.5" />
                    {meta.label}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {isExpanded ? "Hide" : "View"}
                    </Button>
                    {isPending && (
                      <>
                        <Button
                          size="sm"
                          className="h-8 text-xs gap-1 bg-green-600 hover:bg-green-700"
                          onClick={() => approveEntry(entry.id)}
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 text-xs gap-1"
                          onClick={() => setRejectTarget(entry)}
                        >
                          <UserX className="w-3.5 h-3.5" /> Reject
                        </Button>
                      </>
                    )}
                    {entry.status === "approved" && (
                      <Badge className="bg-green-500 text-white text-xs gap-1">
                        <CheckCircle className="w-3 h-3" /> Earnings Unlocked
                      </Badge>
                    )}
                    {(entry.status === "rejected" || entry.status === "resubmit") && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1"
                        onClick={() => requestResubmit(entry.id)}
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Request Resubmit
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expanded detail panel */}
                {isExpanded && (
                  <div className="border-t mx-4 mb-4 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Identity Document</p>
                      <DocPreviewRow label="Type" value={entry.idType} icon={FileText} />
                      <DocPreviewRow label="Number" value={entry.idNumber} icon={Shield} />
                      <div className="flex gap-2 mt-3">
                        <div className="flex-1 border-2 border-dashed rounded-lg p-3 text-center text-xs text-muted-foreground">
                          <FileText className="w-6 h-6 mx-auto mb-1 opacity-40" />
                          Front Side
                        </div>
                        <div className="flex-1 border-2 border-dashed rounded-lg p-3 text-center text-xs text-muted-foreground">
                          <FileText className="w-6 h-6 mx-auto mb-1 opacity-40" />
                          Back Side
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Address Proof</p>
                      <DocPreviewRow label="Type" value={entry.addrType} icon={FileText} />
                      <div className="border-2 border-dashed rounded-lg p-3 text-center text-xs text-muted-foreground mt-3">
                        <FileText className="w-6 h-6 mx-auto mb-1 opacity-40" />
                        Address Document
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Selfie Verification</p>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center text-xs text-muted-foreground">
                        {entry.selfie
                          ? <><CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" /><p className="text-green-600 font-medium">Selfie Captured</p></>
                          : <><XCircle className="w-8 h-8 mx-auto mb-2 text-red-400" /><p className="text-red-500">Not Submitted</p></>
                        }
                      </div>

                      {entry.reviewedBy && (
                        <div className="mt-3 p-3 rounded-lg bg-muted/50 text-xs">
                          <p className="font-semibold mb-1">Review by: {entry.reviewedBy}</p>
                          <p className="text-muted-foreground">{entry.reviewedAt}</p>
                          {entry.rejectReason && (
                            <div className="mt-2 p-2 rounded bg-red-50 border border-red-200 text-red-700">
                              <AlertTriangle className="w-3 h-3 inline mr-1" />
                              {entry.rejectReason}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {rejectTarget && (
        <RejectModal
          entry={rejectTarget}
          onConfirm={(reason) => rejectEntry(rejectTarget.id, reason)}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
}
