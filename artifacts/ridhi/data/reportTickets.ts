export type ReportReason =
  | "Spam"
  | "Harassment"
  | "Hate speech"
  | "Nudity / explicit"
  | "Violence"
  | "Misinformation"
  | "Impersonation"
  | "Copyright"
  | "Other";

export type ReportTargetType = "post" | "reel" | "story" | "live" | "user" | "comment" | "chat" | "audio-room" | "community";

export type ReportStatus = "pending" | "reviewing" | "resolved" | "rejected";

export interface ReportTicket {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: ReportTargetType;
  targetTitle?: string;
  targetUser?: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
  adminAction?: "warned" | "suspended" | "banned" | "content_removed" | "none";
}

export const REPORT_REASONS: ReportReason[] = [
  "Spam",
  "Harassment",
  "Hate speech",
  "Nudity / explicit",
  "Violence",
  "Misinformation",
  "Impersonation",
  "Copyright",
  "Other",
];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  Spam: "Spam or unwanted content",
  Harassment: "Harassment or bullying",
  "Hate speech": "Hate speech or discrimination",
  "Nudity / explicit": "Nudity or sexual content",
  Violence: "Violence or dangerous acts",
  Misinformation: "False information",
  Impersonation: "Impersonation",
  Copyright: "Copyright infringement",
  Other: "Something else",
};

export const STATUS_COLORS: Record<ReportStatus, string> = {
  pending: "#FFB800",
  reviewing: "#4A90E2",
  resolved: "#34C759",
  rejected: "#9E9E9E",
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  pending: "Pending",
  reviewing: "Under Review",
  resolved: "Resolved",
  rejected: "Rejected",
};

export const REPORT_MOCK: ReportTicket[] = [
  {
    id: "r1",
    reporterId: "me",
    targetId: "p3",
    targetType: "post",
    targetTitle: "Click here for free coins!!!",
    targetUser: "SpamBot_99",
    reason: "Spam",
    status: "resolved",
    createdAt: "2026-05-20T10:30:00Z",
    resolvedAt: "2026-05-21T08:00:00Z",
    resolutionNote: "User banned and content removed",
    adminAction: "banned",
  },
  {
    id: "r2",
    reporterId: "me",
    targetId: "u5",
    targetType: "user",
    targetUser: "ToxicUser",
    reason: "Harassment",
    status: "reviewing",
    createdAt: "2026-06-01T14:00:00Z",
    resolutionNote: "Investigating chat history",
  },
  {
    id: "r3",
    reporterId: "me",
    targetId: "r2",
    targetType: "reel",
    targetTitle: "Marine Drive sunrise",
    targetUser: "Rahul Mehta",
    reason: "Copyright",
    status: "pending",
    createdAt: "2026-06-03T09:15:00Z",
  },
];

export function createReportTicket(
  reporterId: string,
  targetId: string,
  targetType: ReportTargetType,
  reason: ReportReason,
  opts?: { targetTitle?: string; targetUser?: string; description?: string }
): ReportTicket {
  return {
    id: `rt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    reporterId,
    targetId,
    targetType,
    targetTitle: opts?.targetTitle,
    targetUser: opts?.targetUser,
    reason,
    description: opts?.description,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}

export const STORAGE_KEY = "ridhi_reports";
