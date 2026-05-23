// ── KYC / E-Verification Mock Data ───────────────────────────────────

export type KycDocType = "aadhaar" | "pan" | "passport" | "voter_id" | "driving_license";
export type KycStatus = "not_started" | "pending" | "under_review" | "approved" | "rejected";

export interface KycDocument {
  id: string;
  userId: string;
  userName: string;
  docType: KycDocType;
  docNumber: string;
  frontImageUri?: string;
  backImageUri?: string;
  selfieUri?: string;
  status: KycStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  city: string;
  dob: string;
  gender: "male" | "female" | "other";
}

export const KYC_DOCUMENTS: KycDocument[] = [
  {
    id: "kyc_001",
    userId: "u1",
    userName: "Aarav Sharma",
    docType: "aadhaar",
    docNumber: "XXXX XXXX 4521",
    status: "approved",
    submittedAt: "2024-01-15",
    reviewedAt: "2024-01-16",
    reviewedBy: "System Auto",
    city: "Mumbai",
    dob: "1998-03-12",
    gender: "male",
  },
  {
    id: "kyc_002",
    userId: "u2",
    userName: "Diya Patel",
    docType: "pan",
    docNumber: "ABCDE1234F",
    status: "approved",
    submittedAt: "2024-02-20",
    reviewedAt: "2024-02-21",
    reviewedBy: "System Auto",
    city: "Ahmedabad",
    dob: "1996-07-22",
    gender: "female",
  },
  {
    id: "kyc_003",
    userId: "u3",
    userName: "Vihaan Singh",
    docType: "aadhaar",
    docNumber: "XXXX XXXX 7890",
    status: "under_review",
    submittedAt: "2024-05-18",
    city: "Delhi",
    dob: "1999-11-05",
    gender: "male",
  },
  {
    id: "kyc_004",
    userId: "u4",
    userName: "Aditi Rao",
    docType: "aadhaar",
    docNumber: "XXXX XXXX 3344",
    status: "rejected",
    submittedAt: "2024-05-10",
    reviewedAt: "2024-05-12",
    reviewedBy: "Admin: Rohit Kumar",
    rejectionReason: "Image unclear — document edges not visible. Please re-upload with all 4 corners visible.",
    city: "Bangalore",
    dob: "1997-04-18",
    gender: "female",
  },
  {
    id: "kyc_005",
    userId: "u5",
    userName: "Arjun Gupta",
    docType: "passport",
    docNumber: "P1234567",
    status: "pending",
    submittedAt: "2024-05-22",
    city: "Chennai",
    dob: "1995-09-30",
    gender: "male",
  },
  {
    id: "kyc_006",
    userId: "u6",
    userName: "Ananya Reddy",
    docType: "aadhaar",
    docNumber: "XXXX XXXX 9988",
    status: "approved",
    submittedAt: "2024-03-05",
    reviewedAt: "2024-03-06",
    reviewedBy: "System Auto",
    city: "Hyderabad",
    dob: "2000-01-15",
    gender: "female",
  },
  {
    id: "kyc_007",
    userId: "u7",
    userName: "Sai Kumar",
    docType: "voter_id",
    docNumber: "ABC1234567",
    status: "under_review",
    submittedAt: "2024-05-20",
    city: "Kochi",
    dob: "1994-12-08",
    gender: "male",
  },
  {
    id: "kyc_008",
    userId: "u8",
    userName: "Priya Das",
    docType: "aadhaar",
    docNumber: "XXXX XXXX 2211",
    status: "approved",
    submittedAt: "2024-01-28",
    reviewedAt: "2024-01-29",
    reviewedBy: "System Auto",
    city: "Kolkata",
    dob: "1998-06-20",
    gender: "female",
  },
];

export const KYC_STATS = {
  totalSubmitted: 2847,
  approved: 2412,
  underReview: 312,
  rejected: 123,
  avgReviewTimeHours: 4.2,
  todaySubmitted: 18,
};
