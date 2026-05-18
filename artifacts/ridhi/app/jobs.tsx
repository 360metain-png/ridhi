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
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const JOBS: Job[] = [
  {
    id: "1", title: "React Native Developer", company: "TechSpark Solutions",
    category: "IT & Tech", type: "Full-time", city: "Mumbai", area: "Andheri West",
    distanceKm: 2.1, salaryMin: 60000, salaryMax: 110000, salaryUnit: "month",
    skills: ["React Native", "TypeScript", "REST APIs"],
    experience: "2-4 years", postedHoursAgo: 3, openings: 2, urgent: true, verified: true,
    description: "Join our growing team building social apps for 10M+ users across India.",
    contactType: "apply",
  },
  {
    id: "2", title: "Staff Nurse (ICU)", company: "Sunrise Hospital",
    category: "Healthcare", type: "Full-time", city: "Mumbai", area: "Bandra",
    distanceKm: 4.8, salaryMin: 35000, salaryMax: 55000, salaryUnit: "month",
    skills: ["ICU Care", "Patient Monitoring", "BLS/ACLS"],
    experience: "1-3 years", postedHoursAgo: 6, openings: 5, urgent: true, verified: true,
    description: "Reputed multi-specialty hospital seeking dedicated ICU nurses. Accommodation provided.",
    contactType: "call",
  },
  {
    id: "3", title: "Delivery Partner", company: "Zomato / Swiggy Network",
    category: "Transport", type: "Gig", city: "Mumbai", area: "Andheri",
    distanceKm: 1.5, salaryMin: 800, salaryMax: 1500, salaryUnit: "day",
    skills: ["Two-wheeler licence", "Smartphone"],
    experience: "Fresher OK", postedHoursAgo: 1, openings: 50, urgent: false, verified: true,
    description: "Earn ₹800-₹1500/day. Flexible hours. Petrol allowance included.",
    contactType: "whatsapp",
  },
  {
    id: "4", title: "UI/UX Designer", company: "Pixel Studio India",
    category: "Design", type: "Full-time", city: "Pune", area: "Koregaon Park",
    distanceKm: 12.3, salaryMin: 45000, salaryMax: 80000, salaryUnit: "month",
    skills: ["Figma", "Sketch", "Prototyping"],
    experience: "2-5 years", postedHoursAgo: 10, openings: 1, urgent: false, verified: true,
    description: "Design mobile-first experiences for fintech & social apps.",
    contactType: "apply",
  },
  {
    id: "5", title: "School Teacher (Maths)", company: "Delhi Public School",
    category: "Education", type: "Full-time", city: "Delhi", area: "Dwarka",
    distanceKm: 8.7, salaryMin: 30000, salaryMax: 45000, salaryUnit: "month",
    skills: ["Maths", "Classroom Management", "CBSE"],
    experience: "B.Ed required", postedHoursAgo: 20, openings: 3, urgent: false, verified: true,
    description: "CBSE school hiring experienced Maths teacher for grades 9-12.",
    contactType: "call",
  },
  {
    id: "6", title: "Accountant (GST & TDS)", company: "Mehta & Associates",
    category: "Finance", type: "Full-time", city: "Ahmedabad", area: "C G Road",
    distanceKm: 3.2, salaryMin: 25000, salaryMax: 40000, salaryUnit: "month",
    skills: ["Tally", "GST Filing", "TDS Returns"],
    experience: "2+ years", postedHoursAgo: 14, openings: 2, urgent: false, verified: false,
    description: "CA firm seeking sharp accountant familiar with Tally Prime & latest GST rules.",
    contactType: "whatsapp",
  },
  {
    id: "7", title: "Retail Sales Executive", company: "Reliance Trends",
    category: "Retail", type: "Full-time", city: "Chennai", area: "Anna Nagar",
    distanceKm: 5.4, salaryMin: 18000, salaryMax: 28000, salaryUnit: "month",
    skills: ["Customer Service", "Sales", "Hindi/English/Tamil"],
    experience: "Fresher OK", postedHoursAgo: 5, openings: 10, urgent: true, verified: true,
    description: "Join one of India's largest retail chains. Weekly incentives + bonus.",
    contactType: "apply",
  },
  {
    id: "8", title: "Freelance Photographer", company: "Self / Events",
    category: "Design", type: "Freelance", city: "Bangalore", area: "Indiranagar",
    distanceKm: 7.0, salaryMin: 5000, salaryMax: 25000, salaryUnit: "project",
    skills: ["DSLR", "Lightroom", "Portrait", "Events"],
    experience: "Portfolio required", postedHoursAgo: 30, openings: 4, urgent: false, verified: false,
    description: "Wedding & event photography gigs — weekend projects available now.",
    contactType: "whatsapp",
  },
  {
    id: "9", title: "Security Guard (Night Shift)", company: "G4S India",
    category: "Security", type: "Full-time", city: "Hyderabad", area: "HITEC City",
    distanceKm: 9.1, salaryMin: 16000, salaryMax: 22000, salaryUnit: "month",
    skills: ["Security Training", "Physical Fitness"],
    experience: "Ex-Army preferred", postedHoursAgo: 48, openings: 20, urgent: false, verified: true,
    description: "Reputed security firm hiring for IT park deployments. Uniform & ID provided.",
    contactType: "call",
  },
  {
    id: "10", title: "Digital Marketing Intern", company: "GrowthHackers Co.",
    category: "Marketing", type: "Internship", city: "Bangalore", area: "Whitefield",
    distanceKm: 15.2, salaryMin: 10000, salaryMax: 18000, salaryUnit: "month",
    skills: ["Instagram", "Meta Ads", "Content Writing"],
    experience: "Fresher / Student", postedHoursAgo: 8, openings: 3, urgent: false, verified: true,
    description: "6-month paid internship. Learn performance marketing hands-on with a startup.",
    contactType: "apply",
  },
  {
    id: "11", title: "Cook (North Indian Cuisine)", company: "Spice Garden Restaurant",
    category: "Hospitality", type: "Full-time", city: "Jaipur", area: "Malviya Nagar",
    distanceKm: 3.9, salaryMin: 20000, salaryMax: 32000, salaryUnit: "month",
    skills: ["North Indian", "Tandoor", "Bulk Cooking"],
    experience: "3+ years", postedHoursAgo: 12, openings: 2, urgent: true, verified: false,
    description: "Popular dine-in & delivery restaurant. Staff meals + tips included.",
    contactType: "whatsapp",
  },
  {
    id: "12", title: "Domestic Helper (Live-in)", company: "Private Household",
    category: "Domestic", type: "Full-time", city: "Noida", area: "Sector 62",
    distanceKm: 6.6, salaryMin: 15000, salaryMax: 22000, salaryUnit: "month",
    skills: ["Cooking", "Cleaning", "Childcare"],
    experience: "Any", postedHoursAgo: 24, openings: 1, urgent: false, verified: false,
    description: "Trusted family in Noida Sector 62 seeking reliable live-in helper. Food & room provided.",
    contactType: "call",
  },
  {
    id: "13", title: "Civil Site Supervisor", company: "Mahindra Constructions",
    category: "Construction", type: "Full-time", city: "Pune", area: "Wakad",
    distanceKm: 18.4, salaryMin: 35000, salaryMax: 55000, salaryUnit: "month",
    skills: ["AutoCAD", "Site Management", "Civil Engg"],
    experience: "5+ years", postedHoursAgo: 36, openings: 4, urgent: false, verified: true,
    description: "Leading construction firm hiring for residential township project.",
    contactType: "apply",
  },
  {
    id: "14", title: "Backend Developer (Node.js)", company: "FinPay Technologies",
    category: "IT & Tech", type: "Full-time", city: "Mumbai", area: "Lower Parel",
    distanceKm: 5.3, salaryMin: 80000, salaryMax: 150000, salaryUnit: "month",
    skills: ["Node.js", "PostgreSQL", "Redis", "AWS"],
    experience: "3-6 years", postedHoursAgo: 4, openings: 1, urgent: true, verified: true,
    description: "High-growth fintech startup processing ₹100Cr+ monthly. Equity + ESOP offered.",
    contactType: "apply",
  },
  {
    id: "15", title: "Cab Driver (App-based)", company: "Ola / Uber Network",
    category: "Transport", type: "Gig", city: "Delhi", area: "Laxmi Nagar",
    distanceKm: 4.0, salaryMin: 600, salaryMax: 1200, salaryUnit: "day",
    skills: ["Commercial Licence", "Smartphone", "Route Knowledge"],
    experience: "1+ year driving", postedHoursAgo: 2, openings: 100, urgent: false, verified: true,
    description: "Join the Ola/Uber network. Incentives up to ₹5000/week. Own vehicle required.",
    contactType: "whatsapp",
  },
];

const JOB_TYPES: JobType[] = ["All", "Full-time", "Part-time", "Freelance", "Internship", "Gig"];
const CATEGORIES: JobCategory[] = [
  "All", "IT & Tech", "Healthcare", "Education", "Finance",
  "Retail", "Construction", "Hospitality", "Transport",
  "Marketing", "Design", "Sales", "Manufacturing", "Security", "Domestic",
];
const CITIES = ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai", "Ahmedabad", "Jaipur", "Noida", "Kolkata"];

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
  const [search,      setSearch]      = useState("");
  const [typeFilter,  setTypeFilter]  = useState<JobType>("All");
  const [catFilter,   setCatFilter]   = useState<JobCategory>("All");
  const [city,        setCity]        = useState("Mumbai");
  const [cityModal,   setCityModal]   = useState(false);
  const [savedIds,    setSavedIds]    = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return JOBS.filter((j) => {
      const matchType = typeFilter === "All" || j.type === typeFilter;
      const matchCat  = catFilter  === "All" || j.category === catFilter;
      const matchCity = j.city === city;
      const q = search.trim().toLowerCase();
      const matchQ = !q || j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) || j.skills.some((s) => s.toLowerCase().includes(q));
      return matchType && matchCat && matchCity && matchQ;
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [search, typeFilter, catFilter, city]);

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

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={[styles.postedTime, { color: colors.mutedForeground }]}>
          {timeAgo(j.postedHoursAgo)}
        </Text>
        <Pressable
          onPress={() => {}}
          style={[styles.applyBtn, {
            backgroundColor: j.contactType === "apply" ? "#E91E8C"
              : j.contactType === "whatsapp" ? "#25D366" : "#2196F3",
          }]}
        >
          <Feather
            name={j.contactType === "apply" ? "send" : j.contactType === "whatsapp" ? "message-circle" : "phone"}
            size={12}
            color="#fff"
          />
          <Text style={styles.applyBtnText}>
            {j.contactType === "apply" ? "Apply Now" : j.contactType === "whatsapp" ? "WhatsApp" : "Call Now"}
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
            <Pressable style={styles.locationRow} onPress={() => setCityModal(true)}>
              <Feather name="map-pin" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.locationText}>{city}</Text>
              <Feather name="chevron-down" size={12} color="rgba(255,255,255,0.8)" />
            </Pressable>
          </View>
          <Pressable onPress={() => router.push("/jobs-post" as any)} style={styles.postJobBtn}>
            <Feather name="plus" size={15} color="#E91E8C" />
            <Text style={styles.postJobBtnText}>Post Job</Text>
          </Pressable>
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
          {" "}jobs found in {city}
        </Text>
        <Text style={[styles.sortLabel, { color: "#E91E8C" }]}>Nearest first</Text>
      </View>

      {/* Job list */}
      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="briefcase" size={48} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No jobs found</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Try different filters or search in another city
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

      {/* FAB */}
      <Pressable
        onPress={() => router.push("/jobs-post" as any)}
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
      >
        <LinearGradient
          colors={["#E91E8C", "#7B2FBE"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.fabGradient}
        >
          <Feather name="plus" size={18} color="#fff" />
          <Text style={styles.fabText}>Post a Job</Text>
        </LinearGradient>
      </Pressable>

      {/* City picker modal */}
      <Modal visible={cityModal} transparent animationType="slide" onRequestClose={() => setCityModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setCityModal(false)} />
        <View style={[styles.citySheet, { backgroundColor: colors.card }]}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Select City</Text>
          {CITIES.map((c) => (
            <Pressable
              key={c}
              onPress={() => { setCity(c); setCityModal(false); }}
              style={[styles.cityRow, { borderBottomColor: colors.border }]}
            >
              <Feather name="map-pin" size={16} color={c === city ? "#E91E8C" : colors.mutedForeground} />
              <Text style={[styles.cityName, { color: c === city ? "#E91E8C" : colors.foreground }]}>{c}</Text>
              {c === city && <Feather name="check" size={16} color="#E91E8C" />}
            </Pressable>
          ))}
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
  postJobBtn:       { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fff", borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 },
  postJobBtnText:   { fontSize: 13, fontFamily: "Inter_700Bold", color: "#E91E8C" },

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

  cardFooter:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  postedTime:       { fontSize: 11, fontFamily: "Inter_400Regular" },
  applyBtn:         { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  applyBtnText:     { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff" },

  emptyState:       { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40, gap: 10 },
  emptyTitle:       { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 8 },
  emptySub:         { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  clearBtn:         { marginTop: 12, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },

  fab:              { position: "absolute", right: 20, alignSelf: "flex-end" },
  fabGradient:      { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, paddingVertical: 13, borderRadius: 30, elevation: 6, shadowColor: "#E91E8C", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  fabText:          { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },

  modalOverlay:     { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  citySheet:        { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: 500 },
  sheetHandle:      { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  sheetTitle:       { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 16 },
  cityRow:          { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  cityName:         { flex: 1, fontSize: 16, fontFamily: "Inter_500Medium" },
});
