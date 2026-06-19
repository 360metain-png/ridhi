import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Zap, Clock, CheckCircle, XCircle, Search, RefreshCw,
  Shield, Phone, MapPin, Calendar, AlertTriangle,
  MessageSquare,
} from "lucide-react";

interface PkRequest {
  id: string;
  name: string;
  phone: string;
  city?: string;
  kycStatus: string;
  kycSubmittedAt?: string;
  requestedAt?: string;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  pending:      { label: "Pending",       color: "text-yellow-700",  bg: "bg-yellow-50 border-yellow-200",  icon: Clock         },
  approved:     { label: "Approved",      color: "text-green-700",   bg: "bg-green-50 border-green-200",   icon: CheckCircle   },
  rejected:     { label: "Rejected",      color: "text-red-700",     bg: "bg-red-50 border-red-200",       icon: XCircle       },
};

const API_BASE = "/api";

export default function PkBattleApprovalsPage() {
  const [requests, setRequests] = useState<PkRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<PkRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const { toast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/pk-battle/requests`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
      } else {
        setError(data.message || "Failed to load requests");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openDetail = (req: PkRequest) => {
    setSelected(req);
    setDetailOpen(true);
    setReviewAction(null);
    setReviewComment("");
  };

  const submitReview = async () => {
    if (!selected || !reviewAction) return;
    setReviewLoading(true);
    try {
      const res = await fetch(`${API_BASE}/pk-battle/approve/${selected.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: reviewAction,
          reason: reviewComment || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) => prev.filter((r) => r.id !== selected.id));
        toast({
          title: reviewAction === "approve" ? "Approved" : "Rejected",
          description: `${selected.name} ${reviewAction === "approve" ? "can now host PK Battles" : "request denied"}`,
        });
        setDetailOpen(false);
        setSelected(null);
      } else {
        setError(data.message || "Review failed");
      }
    } catch {
      setError("Network error during review");
    }
    setReviewLoading(false);
  };

  const filtered = requests.filter((r) => {
    const matchSearch =
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.phone.includes(search);
    const matchFilter = filter === "all" || r.kycStatus === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    pending: requests.filter((r) => r.kycStatus === "pending").length,
    approved: requests.filter((r) => r.kycStatus === "approved").length,
    rejected: requests.filter((r) => r.kycStatus === "rejected").length,
    total: requests.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            PK Battle Host Approvals
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Approve verified users to host PK Battles and earn coins
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={fetchRequests} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending", value: stats.pending, color: "text-yellow-600 bg-yellow-50", icon: Clock },
          { label: "Approved", value: stats.approved, color: "text-green-600 bg-green-50", icon: CheckCircle },
          { label: "Rejected", value: stats.rejected, color: "text-red-600 bg-red-50", icon: XCircle },
          { label: "Total", value: stats.total, color: "text-blue-600 bg-blue-50", icon: Zap },
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
              placeholder="Search by name, phone..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-9 px-3 rounded-md border bg-background text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Zap className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No pending requests</p>
            <p className="text-sm mt-1">Users who complete E-verification and request to host PK Battles will appear here.</p>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <div className="space-y-3">
        {filtered.map((req) => {
          const meta = STATUS_META[req.kycStatus] || STATUS_META.pending;
          return (
            <Card key={req.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge variant="outline" className={`${meta.bg} ${meta.color} border`}>
                        <meta.icon className="w-3 h-3 mr-1" />
                        {meta.label}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{req.name}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {req.phone}</span>
                      {req.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {req.city}</span>}
                      {req.requestedAt && (
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(req.requestedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => openDetail(req)}>
                      <Shield className="w-3.5 h-3.5" /> Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail Modal */}
      {detailOpen && selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Review PK Battle Request
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm"><span className="text-muted-foreground">Name:</span> <strong>{selected.name}</strong></p>
                <p className="text-sm"><span className="text-muted-foreground">Phone:</span> {selected.phone}</p>
                <p className="text-sm"><span className="text-muted-foreground">City:</span> {selected.city || "N/A"}</p>
                <p className="text-sm"><span className="text-muted-foreground">KYC Status:</span> {selected.kycStatus}</p>
                <p className="text-sm"><span className="text-muted-foreground">Requested:</span> {selected.requestedAt ? new Date(selected.requestedAt).toLocaleString() : "N/A"}</p>
              </div>

              {!reviewAction ? (
                <div className="flex gap-3">
                  <Button
                    className="flex-1 gap-1 bg-green-600 hover:bg-green-700"
                    onClick={() => setReviewAction("approve")}
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </Button>
                  <Button
                    className="flex-1 gap-1 bg-red-600 hover:bg-red-700"
                    variant="destructive"
                    onClick={() => setReviewAction("reject")}
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">
                    {reviewAction === "approve" ? "Approve PK Battle Host" : "Reject Request"}
                  </h4>
                  <textarea
                    className="w-full text-sm border rounded-lg p-3 resize-none bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-[80px]"
                    placeholder={
                      reviewAction === "approve"
                        ? "Optional: Add a note for the applicant"
                        : "Required: Explain why this is being rejected..."
                    }
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setReviewAction(null); setReviewComment(""); }}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      disabled={reviewLoading || (reviewAction === "reject" && !reviewComment.trim())}
                      onClick={submitReview}
                    >
                      {reviewLoading ? "Processing..." : reviewAction === "approve" ? "Confirm Approval" : "Confirm Rejection"}
                    </Button>
                  </div>
                </div>
              )}

              <Button variant="ghost" size="sm" className="w-full" onClick={() => setDetailOpen(false)}>
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
