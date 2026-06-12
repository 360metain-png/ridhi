import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { downloadCSV } from "@/lib/utils";
import {
  Shield, Clock, CheckCircle, XCircle, AlertTriangle, Search,
  RefreshCw, Eye, MessageSquare, User, CreditCard, Building2, Download} from "lucide-react";

interface KycSubmission {
  id: string;
  userId: string;
  roles: string[];
  status: string;
  reviewStatus: "pending" | "under_review" | "approved" | "rejected";
  aadhaarNumber?: string;
  panNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  adminComment?: string;
  rejectionReason?: string;
  hasAadhaarFront: boolean;
  hasAadhaarBack: boolean;
  hasPanImage: boolean;
  hasBankProof: boolean;
}

interface Documents {
  aadhaarFrontImage?: string;
  aadhaarBackImage?: string;
  panImage?: string;
  bankProofImage?: string;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  pending:      { label: "Pending",       color: "text-yellow-700",  bg: "bg-yellow-50 border-yellow-200",  icon: Clock         },
  under_review: { label: "Under Review",  color: "text-pink-700",    bg: "bg-pink-50 border-pink-200",    icon: Shield        },
  approved:     { label: "Approved",      color: "text-green-700",   bg: "bg-green-50 border-green-200",   icon: CheckCircle   },
  rejected:     { label: "Rejected",      color: "text-red-700",     bg: "bg-red-50 border-red-200",       icon: XCircle       },
};

const API_BASE = "/api";

export default function KYCPage() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | string>("all");
  const [filterRole, setFilterRole] = useState<"all" | string>("all");

  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<KycSubmission | null>(null);
  const [documents, setDocuments] = useState<Documents | null>(null);
  const [docLoading, setDocLoading] = useState(false);

  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/kyc/queue`);
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.submissions || []);
      } else {
        setError(data.message || "Failed to load KYC queue");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const openDetail = async (sub: KycSubmission) => {
    setSelected(sub);
    setDetailOpen(true);
    setDocuments(null);
    setDocLoading(true);
    setReviewAction(null);
    setReviewComment("");
    try {
      const res = await fetch(`${API_BASE}/kyc/documents/${sub.userId}`);
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch {
      // ignore
    }
    setDocLoading(false);
  };

  const submitReview = async () => {
    if (!selected || !reviewAction) return;
    setReviewLoading(true);
    try {
      const res = await fetch(`${API_BASE}/kyc/review/${selected.userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: reviewAction,
          reviewedBy: "Super Admin",
          adminComment: reviewComment || undefined,
          rejectionReason: reviewAction === "reject" ? reviewComment : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.userId === selected.userId
              ? {
                  ...s,
                  reviewStatus: reviewAction === "approve" ? "approved" : "rejected",
                  status: reviewAction === "approve" ? "approved" : "rejected",
                  reviewedBy: "Super Admin",
                  reviewedAt: new Date().toISOString(),
                  adminComment: reviewComment,
                  rejectionReason: reviewAction === "reject" ? reviewComment : undefined,
                }
              : s
          )
        );
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

  const filtered = submissions.filter((s) => {
    const matchSearch =
      !search ||
      s.userId.toLowerCase().includes(search.toLowerCase()) ||
      (s.aadhaarNumber && s.aadhaarNumber.includes(search)) ||
      (s.panNumber && s.panNumber.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = filterStatus === "all" || s.reviewStatus === filterStatus;
    const matchRole = filterRole === "all" || s.roles.includes(filterRole);
    return matchSearch && matchStatus && matchRole;
  });

  const stats = {
    pending: submissions.filter((s) => s.reviewStatus === "pending").length,
    under_review: submissions.filter((s) => s.reviewStatus === "under_review").length,
    approved: submissions.filter((s) => s.reviewStatus === "approved").length,
    rejected: submissions.filter((s) => s.reviewStatus === "rejected").length,
    total: submissions.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
          const rows: Record<string, string | number>[] = [];
          downloadCSV("kyc_report.csv", rows);
        }}>
          <Download className="w-3 h-3" /> Export CSV
        </Button>
      </div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            E-Verification Review
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Review document uploads for Host, Agent &amp; Creator applicants
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={fetchQueue} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Pending", value: stats.pending, color: "text-yellow-600 bg-yellow-50", icon: Clock },
          { label: "Under Review", value: stats.under_review, color: "text-pink-600 bg-pink-50", icon: Shield },
          { label: "Approved", value: stats.approved, color: "text-green-600 bg-green-50", icon: CheckCircle },
          { label: "Rejected", value: stats.rejected, color: "text-red-600 bg-red-50", icon: XCircle },
          { label: "Total", value: stats.total, color: "text-blue-600 bg-blue-50", icon: User },
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
              placeholder="Search by user ID, Aadhaar, PAN..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-9 px-3 rounded-md border bg-background text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            className="h-9 px-3 rounded-md border bg-background text-sm"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="host">Host</option>
            <option value="agent">Agent</option>
            <option value="creator">Creator</option>
          </select>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Shield className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No submissions found</p>
              <p className="text-sm mt-1">Adjust your filters or wait for new submissions.</p>
            </CardContent>
          </Card>
        )}

        {filtered.map((sub) => {
          const meta = STATUS_META[sub.reviewStatus] || STATUS_META.pending;
          return (
            <Card key={sub.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge variant="outline" className={`${meta.bg} ${meta.color} border`}>
                        <meta.icon className="w-3 h-3 mr-1" />
                        {meta.label}
                      </Badge>
                      {sub.roles.map((r) => (
                        <Badge key={r} variant="secondary" className="capitalize text-xs">
                          {r}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm font-medium">User: {sub.userId}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                      {sub.aadhaarNumber && (
                        <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> {sub.aadhaarNumber}</span>
                      )}
                      {sub.panNumber && (
                        <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> {sub.panNumber}</span>
                      )}
                      {sub.bankName && (
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {sub.bankName}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                    {sub.rejectionReason && (
                      <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded-md">{sub.rejectionReason}</p>
                    )}
                    {sub.adminComment && !sub.rejectionReason && (
                      <p className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded-md flex items-start gap-1">
                        <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" /> {sub.adminComment}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => openDetail(sub)}>
                      <Eye className="w-3.5 h-3.5" /> Review
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
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <CardHeader className="pb-3 sticky top-0 bg-card z-10 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Review Submission — {selected.userId}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setDetailOpen(false)}>
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {/* Roles & Status */}
              <div className="flex items-center gap-2 flex-wrap">
                {selected.roles.map((r) => (
                  <Badge key={r} variant="secondary" className="capitalize">{r}</Badge>
                ))}
                <Badge className={`${STATUS_META[selected.reviewStatus]?.bg} ${STATUS_META[selected.reviewStatus]?.color}`}>
                  {STATUS_META[selected.reviewStatus]?.label || selected.reviewStatus}
                </Badge>
                {selected.roles.includes("host") && selected.roles.includes("agent") && (
                  <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Host + Agent conflict
                  </Badge>
                )}
              </div>

              {/* Documents */}
              <div>
                <h4 className="text-sm font-semibold mb-3">Uploaded Documents</h4>
                {docLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Loading documents...
                  </div>
                ) : documents ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { key: "aadhaarFrontImage", label: "Aadhaar Front", has: selected.hasAadhaarFront, source: "Live Photo" },
                      { key: "aadhaarBackImage", label: "Aadhaar Back", has: selected.hasAadhaarBack, source: "Live Photo" },
                      { key: "panImage", label: "PAN Card", has: selected.hasPanImage, source: "Live Photo" },
                      { key: "bankProofImage", label: "Bank Proof", has: selected.hasBankProof, source: "Uploaded Document" },
                    ].map((doc) => {
                      const img = (documents as any)[doc.key];
                      return (
                        <div key={doc.key} className={`border rounded-lg p-2 ${doc.has ? "border-green-300 bg-green-50/50" : "border-muted bg-muted/30"}`}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium">{doc.label}</p>
                            <p className={`text-[10px] px-1.5 py-0.5 rounded-full ${doc.source === "Live Photo" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                              {doc.source}
                            </p>
                          </div>
                          {img ? (
                            <img
                              src={img.startsWith("data:") ? img : `data:image/jpeg;base64,${img}`}
                              alt={doc.label}
                              className="w-full h-32 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => {
                                // Open full image in new tab
                                const w = window.open("", "_blank");
                                if (w) {
                                  w.document.write(`<img src="${img.startsWith("data:") ? img : `data:image/jpeg;base64,${img}`}" style="max-width:100%;height:auto;" />`);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-32 flex items-center justify-center text-muted-foreground text-xs bg-muted rounded-md">
                              Not uploaded
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No documents available.</p>
                )}
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-muted/40 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Aadhaar</p>
                  <p className="font-medium">{selected.aadhaarNumber || "N/A"}</p>
                </div>
                <div className="bg-muted/40 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">PAN</p>
                  <p className="font-medium">{selected.panNumber || "N/A"}</p>
                </div>
                <div className="bg-muted/40 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Bank</p>
                  <p className="font-medium">{selected.bankName || "N/A"}</p>
                </div>
                <div className="bg-muted/40 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Account</p>
                  <p className="font-medium">{selected.bankAccountNumber || "N/A"}</p>
                </div>
                <div className="bg-muted/40 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">IFSC</p>
                  <p className="font-medium">{selected.bankIfsc || "N/A"}</p>
                </div>
                <div className="bg-muted/40 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="font-medium">{selected.submittedAt ? new Date(selected.submittedAt).toLocaleString() : "N/A"}</p>
                </div>
              </div>

              {/* Admin Actions */}
              {selected.reviewStatus === "pending" || selected.reviewStatus === "under_review" ? (
                <div className="border rounded-lg p-4 space-y-4">
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
                        {reviewAction === "approve" ? "Approve KYC" : "Reject KYC"}
                      </h4>
                      <textarea
                        className="w-full text-sm border rounded-lg p-3 resize-none bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-[80px]"
                        placeholder={
                          reviewAction === "approve"
                            ? "Optional: Add a note for the applicant (e.g. 'Approved — welcome to the platform!')"
                            : "Required: Explain why this is being rejected so the applicant can fix it..."
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
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-muted/20">
                  <p className="text-sm font-medium mb-1">Reviewed by {selected.reviewedBy || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">
                    {selected.reviewedAt ? new Date(selected.reviewedAt).toLocaleString() : ""}
                  </p>
                  {selected.adminComment && (
                    <p className="text-sm mt-2 bg-background p-3 rounded-md border">{selected.adminComment}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
