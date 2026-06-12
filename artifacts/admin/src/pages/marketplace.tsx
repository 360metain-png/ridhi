import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ShoppingBag, Check, X, Clock, MapPin, Tag, IndianRupee,
  TrendingUp, Users, Search, Filter, Eye, Package,
  Smartphone, Shirt, BookOpen, Home, Sparkles, Dumbbell,
  UtensilsCrossed, Laptop, Car, Gamepad2, ChevronDown, ChevronUp,
  AlertTriangle, ShieldCheck, Download} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { downloadCSV } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────
type ListingStatus  = "pending" | "active" | "sold" | "rejected";
type ListingCategory = "electronics" | "fashion" | "books" | "home" | "beauty" | "sports" | "food" | "services" | "vehicles" | "toys";
type Condition = "New" | "Like New" | "Good" | "Fair";

interface Listing {
  id: string;
  title: string;
  seller: string;
  sellerCity: string;
  price: number;
  negotiable: boolean;
  category: ListingCategory;
  condition: Condition;
  city: string;
  description: string;
  emoji: string;
  status: ListingStatus;
  submittedAt: string;
  views?: number;
  buyer?: string;
  soldAt?: string;
  rejectionReason?: string;
}

interface Sale {
  id: string;
  listingId: string;
  title: string;
  emoji: string;
  seller: string;
  buyer: string;
  salePrice: number;
  commission: number;
  sellerPayout: number;
  paymentMethod: string;
  soldAt: string;
  status: "paid" | "pending_payout" | "paid_out";
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const LISTINGS: Listing[] = [
  { id: "l1",  title: "iPhone 12 Pro 256GB",       seller: "Rahul Kumar",  sellerCity: "Mumbai",    price: 45000, negotiable: true,  category: "electronics", condition: "Good",     city: "Mumbai",    description: "iPhone 12 Pro Pacific Blue. Battery 87%. All accessories included.",         emoji: "📱", status: "active",   submittedAt: "14 May", views: 128 },
  { id: "l2",  title: "Bridal Lehenga Choli",       seller: "Priya Sharma", sellerCity: "Delhi",     price: 3500,  negotiable: true,  category: "fashion",     condition: "Like New", city: "Delhi",     description: "Beautiful red lehenga with heavy embroidery. Worn once. Size M.",             emoji: "👗", status: "active",   submittedAt: "15 May", views: 84 },
  { id: "l3",  title: "Python Crash Course Book",   seller: "Dev Raj",      sellerCity: "Bangalore", price: 399,   negotiable: false, category: "books",       condition: "Good",     city: "Bangalore", description: "2nd edition Eric Matthes. Minimal highlighting.",                            emoji: "📚", status: "active",   submittedAt: "13 May", views: 42 },
  { id: "l4",  title: "5-Seater Sofa Set",          seller: "Kavya K.",     sellerCity: "Chennai",   price: 12000, negotiable: true,  category: "home",        condition: "Good",     city: "Chennai",   description: "L-shaped sofa, fabric, brown. 2 years old. Self-pickup only.",              emoji: "🛋️", status: "sold",     submittedAt: "10 May", views: 211, buyer: "Meera D.", soldAt: "16 May" },
  { id: "l5",  title: "MAC Makeup Kit (Full Set)",  seller: "Ananya M.",    sellerCity: "Pune",      price: 1800,  negotiable: false, category: "beauty",      condition: "New",      city: "Pune",      description: "Imported MAC kit unopened. Foundation, eyeshadow, lipstick, brushes.",      emoji: "💄", status: "active",   submittedAt: "16 May", views: 97 },
  { id: "l6",  title: "SG Cricket Bat + Pads",      seller: "Rohan Singh",  sellerCity: "Hyderabad", price: 2200,  negotiable: true,  category: "sports",      condition: "Like New", city: "Hyderabad", description: "SG Strokemaster bat 2.8 lbs. Barely used pads.",                             emoji: "🏏", status: "active",   submittedAt: "17 May", views: 55 },
  { id: "l7",  title: "Homemade Biryani (1 kg)",    seller: "Fatima B.",    sellerCity: "Mumbai",    price: 280,   negotiable: false, category: "food",        condition: "New",      city: "Mumbai",    description: "Authentic Hyderabadi dum biryani. Fresh made to order.",                    emoji: "🍛", status: "pending",  submittedAt: "18 May 9:00 AM" },
  { id: "l8",  title: "Web Design Service",         seller: "Aditya Shah",  sellerCity: "Jaipur",    price: 5000,  negotiable: true,  category: "services",    condition: "New",      city: "Remote",    description: "Complete website design + development. 7-day delivery.",                    emoji: "💻", status: "pending",  submittedAt: "18 May 8:45 AM" },
  { id: "l9",  title: "Honda Activa 6G (2022)",     seller: "Vikram S.",    sellerCity: "Delhi",     price: 72000, negotiable: true,  category: "vehicles",    condition: "Good",     city: "Delhi",     description: "Single owner 18K km driven. Insurance valid 2025. All docs clear.",        emoji: "🛵", status: "pending",  submittedAt: "18 May 10:12 AM" },
  { id: "l10", title: "LEGO Technic Set 42128",     seller: "Sneha Joshi",  sellerCity: "Kolkata",   price: 2999,  negotiable: false, category: "toys",        condition: "New",      city: "Kolkata",   description: "Brand new sealed. Heavy Duty Tow Truck. Age 10+.",                          emoji: "🧩", status: "pending",  submittedAt: "17 May" },
  { id: "l11", title: "Samsung 43\" Smart TV",      seller: "Rahul Kumar",  sellerCity: "Mumbai",    price: 22000, negotiable: true,  category: "electronics", condition: "Good",     city: "Bangalore", description: "Samsung Crystal 4K UHD 2y old. Works perfectly. Remote included.",         emoji: "📺", status: "sold",     submittedAt: "8 May",  views: 189, buyer: "Arjun V.", soldAt: "14 May" },
  { id: "l12", title: "Counterfeit Goods Listing",  seller: "Unknown User", sellerCity: "Unknown",   price: 500,   negotiable: false, category: "fashion",     condition: "New",      city: "Mumbai",    description: "Fake branded goods.",                                                       emoji: "⛔", status: "rejected", submittedAt: "15 May", rejectionReason: "Counterfeit / illegal goods. Violates Ridhi Marketplace policy." },
];

const SALES: Sale[] = [
  { id: "s1", listingId: "l4",  title: "5-Seater Sofa Set",     emoji: "🛋️", seller: "Kavya K.",    buyer: "Meera D.",  salePrice: 12000, commission: 600,  sellerPayout: 11400, paymentMethod: "UPI",          soldAt: "16 May", status: "paid_out" },
  { id: "s2", listingId: "l11", title: "Samsung 43\" Smart TV", emoji: "📺", seller: "Rahul Kumar", buyer: "Arjun V.",  salePrice: 22000, commission: 1100, sellerPayout: 20900, paymentMethod: "Net Banking",   soldAt: "14 May", status: "paid_out" },
  { id: "s3", listingId: "l3",  title: "Python Crash Course",   emoji: "📚", seller: "Dev Raj",     buyer: "Kavya S.",  salePrice: 399,   commission: 20,   sellerPayout: 379,   paymentMethod: "Ridhi Wallet",  soldAt: "12 May", status: "paid_out" },
];

const revenueData = [
  { date: "12 May", sales: 399,   commission: 20   },
  { date: "13 May", sales: 0,     commission: 0    },
  { date: "14 May", sales: 22000, commission: 1100 },
  { date: "15 May", sales: 0,     commission: 0    },
  { date: "16 May", sales: 12000, commission: 600  },
  { date: "17 May", sales: 0,     commission: 0    },
  { date: "18 May", sales: 0,     commission: 0    },
];

// ── Category meta ──────────────────────────────────────────────────────────────
const CAT_META: Record<ListingCategory, { label: string; icon: typeof ShoppingBag }> = {
  electronics: { label: "Electronics", icon: Smartphone },
  fashion:     { label: "Fashion",     icon: Shirt },
  books:       { label: "Books",       icon: BookOpen },
  home:        { label: "Home",        icon: Home },
  beauty:      { label: "Beauty",      icon: Sparkles },
  sports:      { label: "Sports",      icon: Dumbbell },
  food:        { label: "Food",        icon: UtensilsCrossed },
  services:    { label: "Services",    icon: Laptop },
  vehicles:    { label: "Vehicles",    icon: Car },
  toys:        { label: "Toys",        icon: Gamepad2 },
};

const COND_CLS: Record<Condition, string> = {
  "New":      "text-green-700 bg-green-50 border-green-200",
  "Like New": "text-blue-700 bg-blue-50 border-blue-200",
  "Good":     "text-amber-700 bg-amber-50 border-amber-200",
  "Fair":     "text-orange-700 bg-orange-50 border-orange-200",
};

// ── Listing Card ───────────────────────────────────────────────────────────────
function ListingCard({
  listing,
  onApprove,
  onReject,
}: {
  listing: Listing;
  onApprove?: (id: string) => void;
  onReject?:  (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const commission = Math.ceil(listing.price * 0.05);
  const CatIcon = CAT_META[listing.category].icon;

  return (
    <Card className={`border transition-all ${listing.status === "pending" ? "border-amber-200 dark:border-amber-800 bg-amber-50/20" : "border-border"}`}>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="text-4xl leading-none shrink-0 mt-1">{listing.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{listing.title}</span>
              {listing.negotiable && (
                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 bg-amber-50">Nego</Badge>
              )}
              <Badge variant="outline" className={`text-[10px] border ${COND_CLS[listing.condition]}`}>{listing.condition}</Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
              <span className="flex items-center gap-1"><CatIcon className="w-3 h-3" />{CAT_META[listing.category].label}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{listing.city}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{listing.submittedAt}</span>
              {listing.views != null && (
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{listing.views} views</span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-bold text-primary">₹{listing.price.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">Ridhi gets ₹{commission}</div>
          </div>
        </div>

        {/* Seller */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
          <Users className="w-3 h-3 shrink-0" />
          <span>Seller: <span className="font-semibold text-foreground">{listing.seller}</span> · {listing.sellerCity}</span>
          {listing.buyer && (
            <>
              <span className="mx-1">·</span>
              <span>Buyer: <span className="font-semibold text-foreground">{listing.buyer}</span></span>
              {listing.soldAt && <span className="ml-1">(sold {listing.soldAt})</span>}
            </>
          )}
        </div>

        {/* Description toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>{expanded ? "Hide" : "Show"} Description</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        {expanded && (
          <p className="text-sm text-foreground bg-muted/40 rounded-lg p-3">{listing.description}</p>
        )}

        {/* Rejection reason */}
        {listing.status === "rejected" && listing.rejectionReason && (
          <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>Rejected: {listing.rejectionReason}</span>
          </div>
        )}

        {/* Actions */}
        {listing.status === "pending" && !showRejectInput && (
          <div className="flex gap-2 pt-1 border-t border-border/50 flex-wrap">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs gap-1" onClick={() => onApprove?.(listing.id)}>
              <Check className="w-3 h-3" /> Approve & Publish
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 h-7 text-xs gap-1" onClick={() => setShowRejectInput(true)}>
              <X className="w-3 h-3" /> Reject
            </Button>
          </div>
        )}
        {listing.status === "pending" && showRejectInput && (
          <div className="pt-1 border-t border-border/50 space-y-2">
            <Input
              placeholder="Reason for rejection…"
              className="h-8 text-xs"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 h-7 text-xs gap-1" onClick={() => { onReject?.(listing.id); setShowRejectInput(false); }}>
                <X className="w-3 h-3" /> Confirm Reject
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowRejectInput(false)}>Cancel</Button>
            </div>
          </div>
        )}
        {listing.status === "active" && (
          <div className="flex items-center gap-2 text-xs text-green-600 pt-1 border-t border-border/50">
            <ShieldCheck className="w-3.5 h-3.5" /> Live in Marketplace
          </div>
        )}
        {listing.status === "sold" && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border/50">
            <Check className="w-3.5 h-3.5 text-green-500" /> Sold · Commission ₹{commission} collected
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>(LISTINGS);
  const [search,   setSearch]   = useState("");
  const [catFilter,setCatFilter]= useState<"all" | ListingCategory>("all");

  const handleApprove = (id: string) =>
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: "active" as ListingStatus } : l));
  const handleReject  = (id: string) =>
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: "rejected" as ListingStatus, rejectionReason: "Does not meet Ridhi Marketplace guidelines." } : l));

  const filter = (list: Listing[]) => list.filter(l =>
    (catFilter === "all" || l.category === catFilter) &&
    (!search || l.title.toLowerCase().includes(search.toLowerCase()) || l.seller.toLowerCase().includes(search.toLowerCase()))
  );

  const pending  = filter(listings.filter(l => l.status === "pending"));
  const active   = filter(listings.filter(l => l.status === "active"));
  const sold     = filter(listings.filter(l => l.status === "sold"));
  const rejected = filter(listings.filter(l => l.status === "rejected"));

  const totalCommission  = SALES.reduce((s, x) => s + x.commission, 0);
  const totalSalesValue  = SALES.reduce((s, x) => s + x.salePrice, 0);
  const totalActive      = listings.filter(l => l.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
          const rows: Record<string, string | number>[] = [];
          downloadCSV("marketplace_report.csv", rows);
        }}>
          <Download className="w-3 h-3" /> Export CSV
        </Button>
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ridhi Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review & manage user product listings · 5% commission on every sale
          </p>
        </div>
        <Badge className="gap-1.5 bg-emerald-100 text-emerald-700 border-emerald-300">
          <ShieldCheck className="w-3 h-3" /> Buyer Protection Active
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pending Review",  value: pending.length,                         icon: AlertTriangle, color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200" },
          { label: "Active Listings", value: totalActive,                            icon: Package,       color: "text-green-600",  bg: "bg-green-50 dark:bg-green-950/20 border-green-200" },
          { label: "Total Sales GMV", value: `₹${totalSalesValue.toLocaleString()}`, icon: ShoppingBag,   color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/20 border-violet-200" },
          { label: "Commission Earned",value:`₹${totalCommission.toLocaleString()}`, icon: IndianRupee,   color: "text-rose-600",   bg: "bg-rose-50 dark:bg-rose-950/20 border-rose-200" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className={`border ${bg}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${bg} border`}><Icon className={`w-4 h-4 ${color}`} /></div>
              <div>
                <div className={`text-xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border border-border">
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-violet-500" />Daily Sales GMV (₹)</p>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={revenueData} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, "GMV"]} />
                <Bar dataKey="sales" fill="url(#mktGrad)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="mktGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E91E8C" />
                    <stop offset="100%" stopColor="#7B2FBE" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2"><IndianRupee className="w-4 h-4 text-rose-500" />Daily Commission (₹)</p>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, "Commission"]} />
                <Line type="monotone" dataKey="commission" stroke="#E91E8C" strokeWidth={2} dot={{ fill: "#E91E8C", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by title or seller…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={catFilter} onValueChange={v => setCatFilter(v as typeof catFilter)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-3.5 h-3.5 mr-1" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {(Object.keys(CAT_META) as ListingCategory[]).map(k => (
              <SelectItem key={k} value={k}>{CAT_META[k].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="pending" className="gap-1.5">
            Pending
            {pending.length > 0 && <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{pending.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="sold">Sold ({sold.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
          <TabsTrigger value="sales" className="gap-1.5">
            <IndianRupee className="w-3.5 h-3.5" />
            Sales & Payouts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {pending.length === 0
            ? <Card><CardContent className="p-8 text-center text-muted-foreground"><Check className="w-8 h-8 mx-auto mb-2 text-green-500" />No pending listings</CardContent></Card>
            : pending.map(l => <ListingCard key={l.id} listing={l} onApprove={handleApprove} onReject={handleReject} />)}
        </TabsContent>

        <TabsContent value="active" className="mt-4 space-y-3">
          {active.length === 0
            ? <Card><CardContent className="p-8 text-center text-muted-foreground">No active listings.</CardContent></Card>
            : active.map(l => <ListingCard key={l.id} listing={l} onApprove={handleApprove} onReject={handleReject} />)}
        </TabsContent>

        <TabsContent value="sold" className="mt-4 space-y-3">
          {sold.length === 0
            ? <Card><CardContent className="p-8 text-center text-muted-foreground">No sold listings yet.</CardContent></Card>
            : sold.map(l => <ListingCard key={l.id} listing={l} onApprove={handleApprove} onReject={handleReject} />)}
        </TabsContent>

        <TabsContent value="rejected" className="mt-4 space-y-3">
          {rejected.length === 0
            ? <Card><CardContent className="p-8 text-center text-muted-foreground">No rejected listings.</CardContent></Card>
            : rejected.map(l => <ListingCard key={l.id} listing={l} onApprove={handleApprove} onReject={handleReject} />)}
        </TabsContent>

        {/* ── Sales & Payouts ── */}
        <TabsContent value="sales" className="mt-4 space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Sales",    val: `₹${totalSalesValue.toLocaleString()}`,  color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950/20 border-violet-200" },
              { label: "Ridhi Commission",val: `₹${totalCommission.toLocaleString()}`, color: "text-rose-600",   bg: "bg-rose-50 dark:bg-rose-950/20 border-rose-200" },
              { label: "Seller Payouts", val: `₹${SALES.reduce((s,x) => s+x.sellerPayout,0).toLocaleString()}`, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/20 border-green-200" },
            ].map(({ label, val, color, bg }) => (
              <Card key={label} className={`border ${bg}`}>
                <CardContent className="p-3 text-center">
                  <div className={`text-xl font-bold ${color}`}>{val}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payout commission note */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 rounded-lg text-sm">
            <Tag className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-700 text-sm">5% Commission Model</p>
              <p className="text-xs text-blue-600 mt-0.5">
                On every successful sale: Buyer pays full price → Ridhi retains 5% as platform commission → Remaining 95% is credited to seller's Ridhi Wallet within 24 hours.
              </p>
            </div>
          </div>

          {/* Sales table */}
          <div className="space-y-3">
            {SALES.map((sale) => (
              <Card key={sale.id} className="border border-border">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl leading-none">{sale.emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{sale.title}</span>
                        <Badge variant="outline" className="text-[10px] text-green-700 bg-green-50 border-green-200">Sold</Badge>
                        <Badge variant="outline" className="text-[10px] text-blue-700 bg-blue-50 border-blue-200 capitalize">{sale.status.replace(/_/g," ")}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{sale.soldAt} · via {sale.paymentMethod}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: "Sale Price",   val: `₹${sale.salePrice.toLocaleString()}`,   color: "text-foreground" },
                      { label: "Ridhi (5%)",   val: `₹${sale.commission.toLocaleString()}`,   color: "text-rose-600" },
                      { label: "Seller Gets",  val: `₹${sale.sellerPayout.toLocaleString()}`, color: "text-green-600" },
                      { label: "Payout Status",val: sale.status === "paid_out" ? "✅ Paid Out" : "⏳ Pending",    color: sale.status === "paid_out" ? "text-green-600" : "text-amber-600" },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="bg-muted/50 rounded-lg p-2.5 text-center">
                        <div className={`text-sm font-bold ${color}`}>{val}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/50 pt-2">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />Seller: <span className="font-semibold text-foreground ml-0.5">{sale.seller}</span></span>
                    <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" />Buyer: <span className="font-semibold text-foreground ml-0.5">{sale.buyer}</span></span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
