import React, { useState, useMemo } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { STATE_NAMES, getDistricts } from "@/data/indiaLocations";

const APPLY_COST = 10; // coins to submit a job application

// ── Types ─────────────────────────────────────────────────────────────────────
type JobType = "All" | "Full-time" | "Part-time" | "Freelance" | "Internship" | "Gig";
type JobCategory =
  | "All" | "IT & Tech" | "Healthcare" | "Education" | "Finance"
  | "Retail" | "Construction" | "Hospitality" | "Transport" | "Marketing"
  | "Design" | "Sales" | "Manufacturing" | "Security" | "Domestic";

interface Job {
  id: string;
  title: string;
  company: string;
  category: JobCategory;
  type: Exclude<JobType, "All">;
  state: string;
  city: string;
  area: string;
  distanceKm: number;
  salaryMin: number;
  salaryMax: number;
  salaryUnit: "month" | "day" | "hour" | "project";
  skills: string[];
  experience: string;
  postedHoursAgo: number;
  openings: number;
  urgent: boolean;
  verified: boolean;
  description: string;
  contactType: "whatsapp" | "call" | "apply";
  posterPhone: string;
  posterEmail?: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const JOBS: Job[] = [
  {
    id: "1", title: "React Native Developer", company: "TechSpark Solutions",
    category: "IT & Tech", type: "Full-time", state: "Maharashtra", city: "Mumbai City", area: "Andheri West",
    distanceKm: 2.1, salaryMin: 60000, salaryMax: 110000, salaryUnit: "month",
    skills: ["React Native", "TypeScript", "REST APIs"],
    experience: "2-4 years", postedHoursAgo: 3, openings: 2, urgent: true, verified: true,
    description: "Join our growing team building social apps for 10M+ users across India.",
    contactType: "apply", posterPhone: "+91 98102 33456", posterEmail: "hr@techspark.in",
  },
  {
    id: "2", title: "Staff Nurse (ICU)", company: "Sunrise Hospital",
    category: "Healthcare", type: "Full-time", state: "Maharashtra", city: "Mumbai City", area: "Bandra",
    distanceKm: 4.8, salaryMin: 35000, salaryMax: 55000, salaryUnit: "month",
    skills: ["ICU Care", "Patient Monitoring", "BLS/ACLS"],
    experience: "1-3 years", postedHoursAgo: 6, openings: 5, urgent: true, verified: true,
    description: "Reputed multi-specialty hospital seeking dedicated ICU nurses. Accommodation provided.",
    contactType: "call", posterPhone: "+91 99204 71820", posterEmail: "nursing@sunrisehospital.com",
  },
  {
    id: "3", title: "Delivery Partner", company: "Zomato / Swiggy Network",
    category: "Transport", type: "Gig", state: "Maharashtra", city: "Mumbai City", area: "Andheri",
    distanceKm: 1.5, salaryMin: 800, salaryMax: 1500, salaryUnit: "day",
    skills: ["Two-wheeler licence", "Smartphone"],
    experience: "Fresher OK", postedHoursAgo: 1, openings: 50, urgent: false, verified: true,
    description: "Earn ₹800-₹1500/day. Flexible hours. Petrol allowance included.",
    contactType: "whatsapp", posterPhone: "+91 96300 12345",
  },
  {
    id: "4", title: "UI/UX Designer", company: "Pixel Studio India",
    category: "Design", type: "Full-time", state: "Maharashtra", city: "Pune", area: "Koregaon Park",
    distanceKm: 12.3, salaryMin: 45000, salaryMax: 80000, salaryUnit: "month",
    skills: ["Figma", "Sketch", "Prototyping"],
    experience: "2-5 years", postedHoursAgo: 10, openings: 1, urgent: false, verified: true,
    description: "Design mobile-first experiences for fintech & social apps.",
    contactType: "apply", posterPhone: "+91 91122 87654", posterEmail: "careers@pixelstudio.in",
  },
  {
    id: "5", title: "School Teacher (Maths)", company: "Delhi Public School",
    category: "Education", type: "Full-time", state: "Delhi (NCT)", city: "South West Delhi", area: "Dwarka",
    distanceKm: 8.7, salaryMin: 30000, salaryMax: 45000, salaryUnit: "month",
    skills: ["Maths", "Classroom Management", "CBSE"],
    experience: "B.Ed required", postedHoursAgo: 20, openings: 3, urgent: false, verified: true,
    description: "CBSE school hiring experienced Maths teacher for grades 9-12.",
    contactType: "call", posterPhone: "+91 98110 34567", posterEmail: "principal@dpsdwarka.edu.in",
  },
  {
    id: "6", title: "Accountant (GST & TDS)", company: "Mehta & Associates",
    category: "Finance", type: "Full-time", state: "Gujarat", city: "Ahmedabad", area: "C G Road",
    distanceKm: 3.2, salaryMin: 25000, salaryMax: 40000, salaryUnit: "month",
    skills: ["Tally", "GST Filing", "TDS Returns"],
    experience: "2+ years", postedHoursAgo: 14, openings: 2, urgent: false, verified: false,
    description: "CA firm seeking sharp accountant familiar with Tally Prime & latest GST rules.",
    contactType: "whatsapp", posterPhone: "+91 94261 55432",
  },
  {
    id: "7", title: "Retail Sales Executive", company: "Reliance Trends",
    category: "Retail", type: "Full-time", state: "Tamil Nadu", city: "Chennai", area: "Anna Nagar",
    distanceKm: 5.4, salaryMin: 18000, salaryMax: 28000, salaryUnit: "month",
    skills: ["Customer Service", "Sales", "Hindi/English/Tamil"],
    experience: "Fresher OK", postedHoursAgo: 5, openings: 10, urgent: true, verified: true,
    description: "Join one of India's largest retail chains. Weekly incentives + bonus.",
    contactType: "apply", posterPhone: "+91 90034 22100", posterEmail: "talent@reliancetrends.com",
  },
  {
    id: "8", title: "Freelance Photographer", company: "Self / Events",
    category: "Design", type: "Freelance", state: "Karnataka", city: "Bengaluru Urban", area: "Indiranagar",
    distanceKm: 7.0, salaryMin: 5000, salaryMax: 25000, salaryUnit: "project",
    skills: ["DSLR", "Lightroom", "Portrait", "Events"],
    experience: "Portfolio required", postedHoursAgo: 30, openings: 4, urgent: false, verified: false,
    description: "Wedding & event photography gigs — weekend projects available now.",
    contactType: "whatsapp", posterPhone: "+91 87920 31456",
  },
  {
    id: "9", title: "Security Guard (Night Shift)", company: "G4S India",
    category: "Security", type: "Full-time", state: "Telangana", city: "Hyderabad", area: "HITEC City",
    distanceKm: 9.1, salaryMin: 16000, salaryMax: 22000, salaryUnit: "month",
    skills: ["Security Training", "Physical Fitness"],
    experience: "Ex-Army preferred", postedHoursAgo: 48, openings: 20, urgent: false, verified: true,
    description: "Reputed security firm hiring for IT park deployments. Uniform & ID provided.",
    contactType: "call", posterPhone: "+91 99400 67832", posterEmail: "recruit@g4sindia.com",
  },
  {
    id: "10", title: "Digital Marketing Intern", company: "GrowthHackers Co.",
    category: "Marketing", type: "Internship", state: "Karnataka", city: "Bengaluru Urban", area: "Whitefield",
    distanceKm: 15.2, salaryMin: 10000, salaryMax: 18000, salaryUnit: "month",
    skills: ["Instagram", "Meta Ads", "Content Writing"],
    experience: "Fresher / Student", postedHoursAgo: 8, openings: 3, urgent: false, verified: true,
    description: "6-month paid internship. Learn performance marketing hands-on with a startup.",
    contactType: "apply", posterPhone: "+91 80234 98765", posterEmail: "intern@growthhackers.co",
  },
  {
    id: "11", title: "Cook (North Indian Cuisine)", company: "Spice Garden Restaurant",
    category: "Hospitality", type: "Full-time", state: "Rajasthan", city: "Jaipur", area: "Malviya Nagar",
    distanceKm: 3.9, salaryMin: 20000, salaryMax: 32000, salaryUnit: "month",
    skills: ["North Indian", "Tandoor", "Bulk Cooking"],
    experience: "3+ years", postedHoursAgo: 12, openings: 2, urgent: true, verified: false,
    description: "Popular dine-in & delivery restaurant. Staff meals + tips included.",
    contactType: "whatsapp", posterPhone: "+91 94142 65432",
  },
  {
    id: "12", title: "Domestic Helper (Live-in)", company: "Private Household",
    category: "Domestic", type: "Full-time", state: "Uttar Pradesh", city: "Gautam Buddha Nagar", area: "Sector 62",
    distanceKm: 6.6, salaryMin: 15000, salaryMax: 22000, salaryUnit: "month",
    skills: ["Cooking", "Cleaning", "Childcare"],
    experience: "Any", postedHoursAgo: 24, openings: 1, urgent: false, verified: false,
    description: "Trusted family in Noida Sector 62 seeking reliable live-in helper. Food & room provided.",
    contactType: "call", posterPhone: "+91 98181 23456",
  },
  {
    id: "13", title: "Civil Site Supervisor", company: "Mahindra Constructions",
    category: "Construction", type: "Full-time", state: "Maharashtra", city: "Pune", area: "Wakad",
    distanceKm: 18.4, salaryMin: 35000, salaryMax: 55000, salaryUnit: "month",
    skills: ["AutoCAD", "Site Management", "Civil Engg"],
    experience: "5+ years", postedHoursAgo: 36, openings: 4, urgent: false, verified: true,
    description: "Leading construction firm hiring for residential township project.",
    contactType: "apply", posterPhone: "+91 98225 44321", posterEmail: "hr@mahindraconstructions.com",
  },
  {
    id: "14", title: "Backend Developer (Node.js)", company: "FinPay Technologies",
    category: "IT & Tech", type: "Full-time", state: "Maharashtra", city: "Mumbai City", area: "Lower Parel",
    distanceKm: 5.3, salaryMin: 80000, salaryMax: 150000, salaryUnit: "month",
    skills: ["Node.js", "PostgreSQL", "Redis", "AWS"],
    experience: "3-6 years", postedHoursAgo: 4, openings: 1, urgent: true, verified: true,
    description: "High-growth fintech startup processing ₹100Cr+ monthly. Equity + ESOP offered.",
    contactType: "apply", posterPhone: "+91 91670 88900", posterEmail: "tech@finpay.in",
  },
  {
    id: "15", title: "Cab Driver (App-based)", company: "Ola / Uber Network",
    category: "Transport", type: "Gig", state: "Delhi (NCT)", city: "East Delhi", area: "Laxmi Nagar",
    distanceKm: 4.0, salaryMin: 600, salaryMax: 1200, salaryUnit: "day",
    skills: ["Commercial Licence", "Smartphone", "Route Knowledge"],
    experience: "1+ year driving", postedHoursAgo: 2, openings: 100, urgent: false, verified: true,
    description: "Join the Ola/Uber network. Incentives up to ₹5000/week. Own vehicle required.",
    contactType: "whatsapp", posterPhone: "+91 95401 77200",
  },
];

const JOB_TYPES: JobType[] = ["All", "Full-time", "Part-time", "Freelance", "Internship", "Gig"];
const CATEGORIES: JobCategory[] = [
  "All", "IT & Tech", "Healthcare", "Education", "Finance",
  "Retail", "Construction", "Hospitality", "Transport",
  "Marketing", "Design", "Sales", "Manufacturing", "Security", "Domestic",
];

const CATEGORY_ICONS: Record<string, string> = {
  "All": "grid", "IT & Tech": "monitor", "Healthcare": "activity", "Education": "book",
  "Finance": "dollar-sign", "Retail": "shopping-bag", "Construction": "tool",
  "Hospitality": "coffee", "Transport": "truck", "Marketing": "trending-up",
  "Design": "pen-tool", "Sales": "users", "Manufacturing": "settings",
  "Security": "shield", "Domestic": "home",
};

function formatSalary(min: number, max: number, unit: string) {
  const fmt = (n: number) => n >= 1000 ? `₹${(n / 1000).toFixed(0)}K` : `₹${n}`;
  const unitLabel = unit === "month" ? "/mo" : unit === "day" ? "/day" : unit === "hour" ? "/hr" : "/project";
  return `${fmt(min)}–${fmt(max)}${unitLabel}`;
}

function timeAgo(hours: number) {
  if (hours < 1)  return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const TYPE_COLORS: Record<string, string> = {
  "Full-time": "#34C759", "Part-time": "#2196F3", "Freelance": "#FF9500",
  "Internship": "#AF52DE", "Gig": "#FF6B35",
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function JobsScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { user, deductCoins } = useAuth();
  const [search,      setSearch]      = useState("");
  const [typeFilter,  setTypeFilter]  = useState<JobType>("All");
  const [catFilter,   setCatFilter]   = useState<JobCategory>("All");
  const [locState,    setLocState]    = useState("");
  const [locDistrict, setLocDistrict] = useState("");
  const [locModal,    setLocModal]    = useState(false);
  const [modalStep,   setModalStep]   = useState<"state" | "district">("state");
  const [locSearch,   setLocSearch]   = useState("");
  const [savedIds,    setSavedIds]    = useState<Set<string>>(new Set());

  // ── Apply flow state ───────────────────────────────────────────────────────
  const [appliedIds,   setAppliedIds]   = useState<Set<string>>(new Set());
  const [applyJob,     setApplyJob]     = useState<Job | null>(null);
  const [applyStep,    setApplyStep]    = useState<"confirm" | "form" | "success">("confirm");
  const [applyPending, setApplyPending] = useState(false);
  // Application form fields
  const [appName,      setAppName]      = useState("");
  const [appPhone,     setAppPhone]     = useState("");
  const [appRole,      setAppRole]      = useState("");
  const [appExp,       setAppExp]       = useState("");
  const [appNote,      setAppNote]      = useState("");
  const [appResume,    setAppResume]    = useState(false);

  const handleApplyPress = (job: Job) => {
    if (appliedIds.has(job.id)) return;
    setApplyJob(job);
    setApplyStep("confirm");
    setAppName(user?.name ?? "");
    setAppPhone("");
    setAppRole("");
    setAppExp("");
    setAppNote("");
    setAppResume(false);
  };

  const handleConfirmPay = async () => {
    if (!applyJob || applyPending) return;
    setApplyPending(true);
    const ok = await deductCoins(APPLY_COST);
    setApplyPending(false);
    if (ok) {
      setApplyStep("form");
    } else {
      setApplyJob(null);
    }
  };

  const handleSubmitApplication = () => {
    if (!applyJob) return;
    setAppliedIds(prev => { const s = new Set(prev); s.add(applyJob.id); return s; });
    setApplyStep("success");
    setTimeout(() => setApplyJob(null), 2200);
  };

  const filtered = useMemo(() => {
    return JOBS.filter((j) => {
      const matchType = typeFilter === "All" || j.type === typeFilter;
      const matchCat  = catFilter  === "All" || j.category === catFilter;
      const matchLoc  = (!locState || j.state === locState) && (!locDistrict || j.city === locDistrict);
      const q = search.trim().toLowerCase();
      const matchQ = !q || j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) || j.skills.some((s) => s.toLowerCase().includes(q));
      return matchType && matchCat && matchLoc && matchQ;
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [search, typeFilter, catFilter, locState, locDistrict]);

  const toggleSave = (id: string) =>
    setSavedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const renderJob = ({ item: j }: { item: Job }) => (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {}}
    >
      {/* Card header */}
      <View style={styles.cardHeader}>
        <LinearGradient
          colors={["#E91E8C", "#7B2FBE"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.companyAvatar}
        >
          <Text style={styles.companyAvatarText}>{j.company[0]}</Text>
        </LinearGradient>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.jobTitle, { color: colors.foreground }]} numberOfLines={1}>
              {j.title}
            </Text>
            {j.verified && (
              <View style={styles.verifiedBadge}>
                <Feather name="check-circle" size={11} color="#34C759" />
              </View>
            )}
          </View>
          <Text style={[styles.companyName, { color: colors.mutedForeground }]} numberOfLines={1}>
            {j.company}
          </Text>
        </View>
        <Pressable onPress={() => toggleSave(j.id)} hitSlop={10}>
          <Feather
            name="bookmark"
            size={18}
            color={savedIds.has(j.id) ? "#E91E8C" : colors.mutedForeground}
          />
        </Pressable>
      </View>

      {/* Tags row */}
      <View style={styles.tagsRow}>
        <View style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[j.type] + "22" }]}>
          <Text style={[styles.typeBadgeText, { color: TYPE_COLORS[j.type] }]}>{j.type}</Text>
        </View>
        {j.urgent && (
          <View style={[styles.typeBadge, { backgroundColor: "#FF3B3022" }]}>
            <Text style={[styles.typeBadgeText, { color: "#FF3B30" }]}>🔥 Urgent</Text>
          </View>
        )}
        <View style={[styles.typeBadge, { backgroundColor: colors.muted }]}>
          <Feather name="briefcase" size={9} color={colors.mutedForeground} />
          <Text style={[styles.typeBadgeText, { color: colors.mutedForeground, marginLeft: 3 }]}>
            {j.experience}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Feather name="map-pin" size={12} color="#E91E8C" />
          <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
            {j.area} · {j.distanceKm} km
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Feather name="dollar-sign" size={12} color="#34C759" />
          <Text style={[styles.detailText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            {formatSalary(j.salaryMin, j.salaryMax, j.salaryUnit)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Feather name="users" size={12} color="#7B2FBE" />
          <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
            {j.openings} opening{j.openings > 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {/* Skills */}
      <View style={styles.skillsRow}>
        {j.skills.slice(0, 3).map((s) => (
          <View key={s} style={[styles.skillChip, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Text style={[styles.skillText, { color: colors.mutedForeground }]}>{s}</Text>
          </View>
        ))}
      </View>

      {/* Apply prompt strip */}
      {!appliedIds.has(j.id) && (
        <View style={[styles.contactStrip, { backgroundColor: "#E91E8C12", borderColor: "#E91E8C30" }]}>
          <Feather name="send" size={13} color="#E91E8C" />
          <Text style={[styles.contactVal, { color: "#E91E8C", flex: 1 }]}>
            Pay {APPLY_COST} coins to apply — share your details &amp; resume
          </Text>
          <View style={[styles.coinCostBadge, { backgroundColor: "#E91E8C22" }]}>
            <Text style={[styles.coinCostText, { color: "#E91E8C" }]}>🪙 {APPLY_COST}</Text>
          </View>
        </View>
      )}
      {appliedIds.has(j.id) && (
        <View style={[styles.contactStrip, { backgroundColor: "#34C75918", borderColor: "#34C75930" }]}>
          <Feather name="check-circle" size={13} color="#34C759" />
          <Text style={[styles.contactVal, { color: "#34C759", flex: 1 }]}>Application submitted — recruiter will contact you</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={[styles.postedTime, { color: colors.mutedForeground }]}>
          {timeAgo(j.postedHoursAgo)}
        </Text>
        <Pressable
          onPress={() => handleApplyPress(j)}
          disabled={appliedIds.has(j.id)}
          style={[styles.applyBtn, {
            backgroundColor: appliedIds.has(j.id) ? "#34C759" : "#E91E8C",
            opacity: appliedIds.has(j.id) ? 0.85 : 1,
          }]}
        >
          <Feather name={appliedIds.has(j.id) ? "check" : "send"} size={12} color="#fff" />
          <Text style={styles.applyBtnText}>
            {appliedIds.has(j.id) ? "Applied ✓" : `Apply · 🪙${APPLY_COST}`}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={["#E91E8C", "#7B2FBE"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 10 : 0) }]}
      >
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Jobs Near You</Text>
            <Pressable style={styles.locationRow} onPress={() => { setModalStep("state"); setLocSearch(""); setLocModal(true); }}>
              <Feather name="map-pin" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.locationText}>
                {locDistrict ? `${locDistrict}, ${locState}` : locState || "All India"}
              </Text>
              <Feather name="chevron-down" size={12} color="rgba(255,255,255,0.8)" />
            </Pressable>
          </View>
          <View style={styles.coinBalanceBadge}>
            <Text style={styles.coinBalanceText}>🪙 {user?.coins ?? 0}</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search job title, skill, company…"
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={10}>
              <Feather name="x" size={14} color="#888" />
            </Pressable>
          )}
        </View>
      </LinearGradient>

      {/* Type filters */}
      <View style={[styles.typeFiltersWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeFilters}>
          {JOB_TYPES.map((t) => (
            <Pressable
              key={t}
              onPress={() => setTypeFilter(t)}
              style={[
                styles.typeChip,
                typeFilter === t
                  ? { backgroundColor: "#E91E8C" }
                  : { backgroundColor: colors.muted, borderColor: colors.border, borderWidth: 1 },
              ]}
            >
              <Text style={[styles.typeChipText, { color: typeFilter === t ? "#fff" : colors.mutedForeground }]}>
                {t}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Category filters */}
      <View style={[styles.catWrap, { borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setCatFilter(c)}
              style={[
                styles.catChip,
                catFilter === c
                  ? { backgroundColor: "#7B2FBE22", borderColor: "#7B2FBE" }
                  : { backgroundColor: "transparent", borderColor: colors.border },
              ]}
            >
              <Feather
                name={CATEGORY_ICONS[c] as any}
                size={12}
                color={catFilter === c ? "#7B2FBE" : colors.mutedForeground}
              />
              <Text style={[styles.catText, { color: catFilter === c ? "#7B2FBE" : colors.mutedForeground }]}>
                {c}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Results count */}
      <View style={[styles.resultsRow, { borderBottomColor: colors.border }]}>
        <Text style={[styles.resultsCount, { color: colors.mutedForeground }]}>
          <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>{filtered.length}</Text>
          {" "}jobs found in {locDistrict || locState || "All India"}
        </Text>
        <Text style={[styles.sortLabel, { color: "#E91E8C" }]}>Nearest first</Text>
      </View>

      {/* Job list */}
      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="briefcase" size={48} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No jobs found</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Try different filters or change your location
          </Text>
          <Pressable
            onPress={() => { setSearch(""); setTypeFilter("All"); setCatFilter("All"); }}
            style={[styles.clearBtn, { backgroundColor: "#E91E8C22" }]}
          >
            <Text style={{ color: "#E91E8C", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>Clear Filters</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(j) => j.id}
          renderItem={renderJob}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ── Job Application Modal (3 steps: confirm → form → success) ───────── */}
      <Modal visible={!!applyJob} transparent animationType="fade" onRequestClose={() => applyStep !== "form" && setApplyJob(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => applyStep === "confirm" && setApplyJob(null)} />
        <View style={styles.coinModalWrap}>
          <View style={[styles.coinModal, { backgroundColor: colors.card }]}>
            <LinearGradient colors={["#E91E8C18", "#7B2FBE11"]} style={StyleSheet.absoluteFill} />

            {/* ── Step 1: Coin confirm ── */}
            {applyStep === "confirm" && (
              <>
                <View style={[styles.coinModalIcon, { backgroundColor: "#E91E8C22" }]}>
                  <Text style={{ fontSize: 30 }}>📋</Text>
                </View>
                <Text style={[styles.coinModalTitle, { color: colors.foreground }]}>Apply for this Job</Text>
                <Text style={[styles.coinModalSub, { color: colors.mutedForeground }]}>
                  {applyJob?.title}{"\n"}at {applyJob?.company}
                </Text>
                <View style={[styles.coinModalRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  <View style={styles.coinModalStat}>
                    <Text style={[styles.coinModalStatLabel, { color: colors.mutedForeground }]}>Application Fee</Text>
                    <Text style={[styles.coinModalStatVal, { color: "#E91E8C" }]}>🪙 {APPLY_COST}</Text>
                  </View>
                  <View style={[styles.coinModalDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.coinModalStat}>
                    <Text style={[styles.coinModalStatLabel, { color: colors.mutedForeground }]}>Your Balance</Text>
                    <Text style={[styles.coinModalStatVal, { color: (user?.coins ?? 0) >= APPLY_COST ? "#34C759" : "#FF3B30" }]}>
                      🪙 {user?.coins ?? 0}
                    </Text>
                  </View>
                </View>
                {(user?.coins ?? 0) < APPLY_COST ? (
                  <>
                    <Text style={[styles.coinModalWarn, { color: "#FF3B30" }]}>
                      Not enough coins. Recharge your wallet to apply.
                    </Text>
                    <Pressable onPress={() => { setApplyJob(null); router.push("/wallet" as any); }}
                      style={[styles.coinModalBtn, { backgroundColor: "#E91E8C" }]}>
                      <Feather name="zap" size={15} color="#fff" />
                      <Text style={styles.coinModalBtnText}>Recharge Wallet</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <Text style={[styles.coinModalNote, { color: colors.mutedForeground }]}>
                      You'll fill in your details and optionally attach your resume on the next step. The recruiter receives your application directly.
                    </Text>
                    <Pressable onPress={handleConfirmPay} disabled={applyPending}
                      style={[styles.coinModalBtn, { backgroundColor: "#E91E8C", opacity: applyPending ? 0.6 : 1 }]}>
                      <Feather name="arrow-right" size={15} color="#fff" />
                      <Text style={styles.coinModalBtnText}>{applyPending ? "Processing…" : `Continue — Pay 🪙${APPLY_COST}`}</Text>
                    </Pressable>
                  </>
                )}
                <Pressable onPress={() => setApplyJob(null)} style={{ marginTop: 10 }}>
                  <Text style={[styles.coinModalCancel, { color: colors.mutedForeground }]}>Cancel</Text>
                </Pressable>
              </>
            )}

            {/* ── Step 2: Application form ── */}
            {applyStep === "form" && (
              <ScrollView style={{ width: "100%" }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Text style={[styles.coinModalTitle, { color: colors.foreground, marginBottom: 2 }]}>Your Application</Text>
                <Text style={[styles.coinModalSub, { color: colors.mutedForeground, marginBottom: 14 }]}>
                  {applyJob?.title} · {applyJob?.company}
                </Text>

                {[
                  { label: "Full Name *",          value: appName,  onChange: setAppName,  placeholder: "As on your ID", keyboard: "default" as const },
                  { label: "Mobile Number *",       value: appPhone, onChange: setAppPhone, placeholder: "+91 XXXXX XXXXX", keyboard: "phone-pad" as const },
                  { label: "Current / Last Role",   value: appRole,  onChange: setAppRole,  placeholder: "e.g. Sales Executive, Fresher", keyboard: "default" as const },
                  { label: "Years of Experience",   value: appExp,   onChange: setAppExp,   placeholder: "e.g. 2 years, Fresher", keyboard: "default" as const },
                ].map(({ label, value, onChange, placeholder, keyboard }) => (
                  <View key={label} style={{ marginBottom: 12 }}>
                    <Text style={[styles.coinModalStatLabel, { color: colors.mutedForeground, marginBottom: 4, textAlign: "left" }]}>{label}</Text>
                    <View style={[styles.appInput, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                      <TextInput
                        value={value}
                        onChangeText={onChange}
                        placeholder={placeholder}
                        placeholderTextColor={colors.mutedForeground}
                        keyboardType={keyboard}
                        style={[{ flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" }, { color: colors.foreground }]}
                      />
                    </View>
                  </View>
                ))}

                <View style={{ marginBottom: 12 }}>
                  <Text style={[styles.coinModalStatLabel, { color: colors.mutedForeground, marginBottom: 4, textAlign: "left" }]}>Cover Note (optional)</Text>
                  <View style={[styles.appInput, { backgroundColor: colors.muted, borderColor: colors.border, alignItems: "flex-start", minHeight: 72 }]}>
                    <TextInput
                      value={appNote}
                      onChangeText={setAppNote}
                      placeholder="Why are you a good fit? Any message for the recruiter…"
                      placeholderTextColor={colors.mutedForeground}
                      multiline
                      numberOfLines={3}
                      style={[{ flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", paddingTop: 2, textAlignVertical: "top" }, { color: colors.foreground }]}
                    />
                  </View>
                </View>

                {/* Resume upload */}
                <Pressable onPress={() => setAppResume(r => !r)}
                  style={[styles.appInput, {
                    backgroundColor: appResume ? "#34C75918" : colors.muted,
                    borderColor: appResume ? "#34C75960" : colors.border,
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }]}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Feather name={appResume ? "file-text" : "upload"} size={16} color={appResume ? "#34C759" : colors.mutedForeground} />
                    <Text style={[{ fontSize: 13, fontFamily: "Inter_500Medium" }, { color: appResume ? "#34C759" : colors.foreground }]}>
                      {appResume ? "resume.pdf attached ✓" : "Attach Resume (PDF / DOC)"}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Optional</Text>
                </Pressable>

                <Pressable
                  onPress={handleSubmitApplication}
                  disabled={!appName.trim() || !appPhone.trim()}
                  style={[styles.coinModalBtn, {
                    backgroundColor: (!appName.trim() || !appPhone.trim()) ? colors.muted : "#E91E8C",
                    marginBottom: 8,
                  }]}>
                  <Feather name="send" size={15} color={(!appName.trim() || !appPhone.trim()) ? colors.mutedForeground : "#fff"} />
                  <Text style={[styles.coinModalBtnText, { color: (!appName.trim() || !appPhone.trim()) ? colors.mutedForeground : "#fff" }]}>
                    Submit Application
                  </Text>
                </Pressable>
              </ScrollView>
            )}

            {/* ── Step 3: Success ── */}
            {applyStep === "success" && (
              <>
                <LinearGradient colors={["#34C759", "#22A348"]} style={styles.coinModalIcon}>
                  <Feather name="check" size={36} color="#fff" />
                </LinearGradient>
                <Text style={[styles.coinModalTitle, { color: colors.foreground }]}>Application Sent! 🎉</Text>
                <Text style={[styles.coinModalSub, { color: colors.mutedForeground }]}>
                  Your application for{"\n"}{applyJob?.title} at {applyJob?.company}{"\n"}has been submitted. The recruiter will contact you directly.
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Location picker modal — two-step: State → District */}
      <Modal visible={locModal} transparent animationType="slide" onRequestClose={() => setLocModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setLocModal(false)} />
        <View style={[styles.locSheet, { backgroundColor: colors.card }]}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={styles.locSheetHeader}>
            {modalStep === "district" && (
              <Pressable onPress={() => { setModalStep("state"); setLocSearch(""); }} style={styles.sheetBackBtn}>
                <Feather name="arrow-left" size={18} color={colors.foreground} />
              </Pressable>
            )}
            <Text style={[styles.sheetTitle, { color: colors.foreground, marginBottom: 0 }]}>
              {modalStep === "state" ? "Select State / UT" : locState}
            </Text>
          </View>

          {/* Search */}
          <View style={[styles.locSearch, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Feather name="search" size={14} color={colors.mutedForeground} />
            <TextInput
              style={[styles.locSearchInput, { color: colors.foreground }]}
              placeholder={modalStep === "state" ? "Search state or UT…" : "Search district…"}
              placeholderTextColor={colors.mutedForeground}
              value={locSearch}
              onChangeText={setLocSearch}
            />
            {locSearch.length > 0 && (
              <Pressable onPress={() => setLocSearch("")}>
                <Feather name="x" size={14} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {modalStep === "state" ? (
              <>
                <Pressable
                  onPress={() => { setLocState(""); setLocDistrict(""); setLocModal(false); setLocSearch(""); }}
                  style={[styles.locRow, { borderBottomColor: colors.border }]}
                >
                  <Feather name="globe" size={16} color={!locState ? "#E91E8C" : colors.mutedForeground} />
                  <Text style={[styles.locName, { color: !locState ? "#E91E8C" : colors.foreground }]}>All India</Text>
                  {!locState && <Feather name="check" size={16} color="#E91E8C" />}
                </Pressable>
                {STATE_NAMES
                  .filter((s) => !locSearch || s.toLowerCase().includes(locSearch.toLowerCase()))
                  .map((s) => (
                    <Pressable
                      key={s}
                      onPress={() => { setLocState(s); setLocDistrict(""); setModalStep("district"); setLocSearch(""); }}
                      style={[styles.locRow, { borderBottomColor: colors.border }]}
                    >
                      <Feather name="map-pin" size={16} color={s === locState ? "#E91E8C" : colors.mutedForeground} />
                      <Text style={[styles.locName, { color: s === locState ? "#E91E8C" : colors.foreground }]}>{s}</Text>
                      <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
                    </Pressable>
                  ))}
              </>
            ) : (
              <>
                <Pressable
                  onPress={() => { setLocDistrict(""); setLocModal(false); setLocSearch(""); }}
                  style={[styles.locRow, { borderBottomColor: colors.border }]}
                >
                  <Feather name="layers" size={16} color={!locDistrict ? "#E91E8C" : colors.mutedForeground} />
                  <Text style={[styles.locName, { color: !locDistrict ? "#E91E8C" : colors.foreground }]}>All of {locState}</Text>
                  {!locDistrict && <Feather name="check" size={16} color="#E91E8C" />}
                </Pressable>
                {getDistricts(locState)
                  .filter((d) => !locSearch || d.toLowerCase().includes(locSearch.toLowerCase()))
                  .map((d) => (
                    <Pressable
                      key={d}
                      onPress={() => { setLocDistrict(d); setLocModal(false); setLocSearch(""); }}
                      style={[styles.locRow, { borderBottomColor: colors.border }]}
                    >
                      <Feather name="map-pin" size={16} color={d === locDistrict ? "#E91E8C" : colors.mutedForeground} />
                      <Text style={[styles.locName, { color: d === locDistrict ? "#E91E8C" : colors.foreground }]}>{d}</Text>
                      {d === locDistrict && <Feather name="check" size={16} color="#E91E8C" />}
                    </Pressable>
                  ))}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:        { flex: 1 },

  header:           { paddingHorizontal: 16, paddingBottom: 14 },
  headerTop:        { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  backBtn:          { marginRight: 10, padding: 4 },
  headerTitle:      { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  locationRow:      { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  locationText:     { fontSize: 12, color: "rgba(255,255,255,0.85)", fontFamily: "Inter_500Medium" },
  searchBar:        { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  searchInput:      { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: "#111" },

  typeFiltersWrap:  { borderBottomWidth: 1 },
  typeFilters:      { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  typeChip:         { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  typeChipText:     { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  catWrap:          { borderBottomWidth: 1 },
  catRow:           { paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
  catChip:          { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  catText:          { fontSize: 12, fontFamily: "Inter_500Medium" },

  resultsRow:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  resultsCount:     { fontSize: 13, fontFamily: "Inter_400Regular" },
  sortLabel:        { fontSize: 12, fontFamily: "Inter_500Medium" },

  card:             { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12 },
  cardHeader:       { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  companyAvatar:    { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  companyAvatarText:{ fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  cardTitleRow:     { flexDirection: "row", alignItems: "center", gap: 5, flexWrap: "wrap" },
  jobTitle:         { fontSize: 15, fontFamily: "Inter_700Bold", flex: 1 },
  companyName:      { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  verifiedBadge:    { padding: 2 },

  tagsRow:          { flexDirection: "row", gap: 6, flexWrap: "wrap", marginBottom: 10 },
  typeBadge:        { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  typeBadgeText:    { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  detailsRow:       { flexDirection: "row", gap: 14, flexWrap: "wrap", marginBottom: 10 },
  detailItem:       { flexDirection: "row", alignItems: "center", gap: 4 },
  detailText:       { fontSize: 12, fontFamily: "Inter_400Regular" },

  skillsRow:        { flexDirection: "row", gap: 6, flexWrap: "wrap", marginBottom: 12 },
  skillChip:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  skillText:        { fontSize: 11, fontFamily: "Inter_400Regular" },

  coinBalanceBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  coinBalanceText:  { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },

  contactStrip:     { borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8, gap: 5, marginBottom: 10 },
  contactItem:      { flexDirection: "row", alignItems: "center", gap: 6 },
  contactVal:       { flex: 1, fontSize: 12, fontFamily: "Inter_500Medium" },
  vBadge:           { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#34C75918", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  vBadgeText:       { fontSize: 10, fontFamily: "Inter_700Bold", color: "#34C759" },
  coinCostBadge:    { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  coinCostText:     { fontSize: 11, fontFamily: "Inter_700Bold" },

  cardFooter:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  postedTime:       { fontSize: 11, fontFamily: "Inter_400Regular" },
  applyBtn:         { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  applyBtnText:     { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff" },

  emptyState:       { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40, gap: 10 },
  emptyTitle:       { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 8 },
  emptySub:         { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  clearBtn:         { marginTop: 12, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },

  modalOverlay:     { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },

  coinModalWrap:    { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  coinModal:        { width: "100%", borderRadius: 24, padding: 24, alignItems: "center", overflow: "hidden", gap: 10 },
  coinModalIcon:    { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  coinModalTitle:   { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  coinModalSub:     { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  coinModalRow:     { flexDirection: "row", width: "100%", borderRadius: 14, borderWidth: 1, paddingVertical: 12, paddingHorizontal: 16, marginVertical: 4 },
  coinModalStat:    { flex: 1, alignItems: "center", gap: 4 },
  coinModalDivider: { width: 1, marginHorizontal: 8 },
  coinModalStatLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  coinModalStatVal: { fontSize: 18, fontFamily: "Inter_700Bold" },
  coinModalNote:    { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 18 },
  coinModalWarn:    { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  coinModalBtn:     { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16, width: "100%", justifyContent: "center", marginTop: 4 },
  coinModalBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  coinModalCancel:  { fontSize: 13, fontFamily: "Inter_400Regular" },
  appInput:         { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 11 },
  locSheet:         { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "78%", flex: 1 },
  sheetHandle:      { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 14 },
  locSheetHeader:   { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  sheetBackBtn:     { padding: 4 },
  sheetTitle:       { fontSize: 18, fontFamily: "Inter_700Bold", flex: 1 },
  locSearch:        { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 8 },
  locSearchInput:   { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  locRow:           { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, borderBottomWidth: 1 },
  locName:          { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
});
