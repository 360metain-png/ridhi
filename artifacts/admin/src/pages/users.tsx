import { useState, useMemo } from "react";
import { Link } from "wouter";
import { mockUsers, getRiskLevel, getRiskFlagLabel, calculateTrustScore } from "@/data/mock-data";
import type { User, RiskFlag } from "@/data/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Search, Filter, MoreHorizontal, Eye, ShieldCheck, Ban, Trash2, Plus,
  Users as UsersIcon, UserCheck, UserX, Clock, Download, MapPin, Phone, Mail,
  Calendar, FileText, Coins, ShieldAlert, Shield, AlertTriangle, CheckCircle,
  Fingerprint, Activity, Globe, Smartphone
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { downloadCSV } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Users() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; action: string; userId: string | null }>({ isOpen: false, action: "", userId: null });

  // Add User dialog state
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "", phone: "", email: "", city: "", state: "", language: "Hindi",
    status: "active" as User["status"],
  });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase()) || user.phone.includes(search);
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesRisk = riskFilter === "all" || getRiskLevel(user.trustScore || 50) === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const handleAction = (action: string, userId: string) => {
    setConfirmDialog({ isOpen: true, action, userId });
  };

  const confirmAction = () => {
    if (confirmDialog.userId) {
      if (confirmDialog.action === "delete") {
        const userToDelete = users.find(u => u.id === confirmDialog.userId);
        setUsers(prev => prev.filter(u => u.id !== confirmDialog.userId));
        toast({
          title: "User Deleted",
          description: `${userToDelete?.name ?? "User"} has been permanently removed.`,
          variant: "destructive",
        });
        setConfirmDialog({ isOpen: false, action: "", userId: null });
        return;
      }
      setUsers(users.map(u => {
        if (u.id === confirmDialog.userId) {
          if (confirmDialog.action === "suspend") return { ...u, status: "suspended" };
          if (confirmDialog.action === "activate") return { ...u, status: "active" };
          if (confirmDialog.action === "verify") return { ...u, isVerified: true };
        }
        return u;
      }));
      toast({
        title: `User ${confirmDialog.action.charAt(0).toUpperCase() + confirmDialog.action.slice(1)}`,
        description: "Action completed successfully.",
      });
    }
    setConfirmDialog({ isOpen: false, action: "", userId: null });
  };

  const validateAddUser = () => {
    const errors: Record<string, string> = {};
    if (!newUser.name.trim()) errors.name = "Name is required";
    if (!newUser.phone.trim()) errors.phone = "Phone is required";
    if (!newUser.email.trim()) errors.email = "Email is required";
    if (!newUser.email.includes("@")) errors.email = "Invalid email address";
    if (!newUser.city.trim()) errors.city = "City is required";
    if (!newUser.state.trim()) errors.state = "State is required";
    setAddErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = () => {
    if (!validateAddUser()) return;
    const id = `u${Date.now()}`;
    const user: User = {
      id,
      name: newUser.name.trim(),
      avatar: "",
      phone: newUser.phone.trim(),
      email: newUser.email.trim().toLowerCase(),
      city: newUser.city.trim(),
      state: newUser.state.trim(),
      language: newUser.language,
      joinDate: new Date().toISOString().split("T")[0],
      status: newUser.status,
      followers: 0,
      following: 0,
      posts: 0,
      coins: 0,
      reportsReceived: 0,
      isVerified: false,
      trustScore: calculateTrustScore({ name: newUser.name, email: newUser.email, bioText: "", posts: 0, followers: 0, following: 0, profileCompletion: 20, socialLinks: {} }),
      bioText: "",
      profileCompletion: 20,
      deviceCount: 1,
      ipCount: 1,
      lastActivity: new Date().toISOString(),
      riskFlags: [],
      socialLinks: {},
    };
    setUsers(prev => [user, ...prev]);
    setNewUser({ name: "", phone: "", email: "", city: "", state: "", language: "Hindi", status: "active" });
    setAddErrors({});
    setShowAddUser(false);
    toast({
      title: "User Added",
      description: `${user.name} has been added successfully.`,
    });
  };

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'active': return { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Active' };
      case 'suspended': return { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', label: 'Suspended' };
      case 'pending': return { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', label: 'Pending' };
      default: return { color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-500', label: status };
    }
  };

  const getRiskConfig = (score: number) => {
    const level = getRiskLevel(score);
    switch(level) {
      case 'safe': return { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle, label: 'Safe' };
      case 'low': return { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: Shield, label: 'Low Risk' };
      case 'medium': return { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: ShieldAlert, label: 'Medium' };
      case 'high': return { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertTriangle, label: 'High Risk' };
      case 'critical': return { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, label: 'Critical' };
    }
  };

  const total = users.length;
  const active = users.filter(u => u.status === 'active').length;
  const suspended = users.filter(u => u.status === 'suspended').length;
  const pending = users.filter(u => u.status === 'pending').length;
  const fakeProfiles = users.filter(u => (u.trustScore || 100) < 45).length;
  const highRisk = users.filter(u => getRiskLevel(u.trustScore || 100) === "high" || getRiskLevel(u.trustScore || 100) === "critical").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => {
          const rows: Record<string, string | number>[] = [];
          downloadCSV("users_report.csv", rows);
        }}>
          <Download className="w-3 h-3" /> Export CSV
        </Button>
      </div>
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-card rounded-xl border shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
            <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Users</p>
            <p className="text-2xl font-bold text-foreground">{total.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-card rounded-xl border shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Active</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{active}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-card rounded-xl border shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center flex-shrink-0">
            <UserX className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Suspended</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{suspended}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-card rounded-xl border shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Pending</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pending}</p>
          </div>
        </div>
      </div>

      {/* ── Trust & Safety Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-card rounded-xl border shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center flex-shrink-0">
            <Fingerprint className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">High Risk Profiles</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{highRisk}</p>
            <p className="text-xs text-muted-foreground">Trust score below 45</p>
          </div>
        </div>
        <div className="bg-white dark:bg-card rounded-xl border shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Fake Profile Suspects</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{fakeProfiles}</p>
            <p className="text-xs text-muted-foreground">Flagged by detection engine</p>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white dark:bg-card rounded-xl border shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name, email or phone..."
              className="pl-9 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-10">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[160px] h-10">
                <ShieldAlert className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="safe">Safe (80+)</SelectItem>
                <SelectItem value="low">Low Risk (65-79)</SelectItem>
                <SelectItem value="medium">Medium (45-64)</SelectItem>
                <SelectItem value="high">High Risk (25-44)</SelectItem>
                <SelectItem value="critical">Critical (0-24)</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-10 gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button size="sm" className="h-10 gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0" onClick={() => setShowAddUser(true)}>
              <Plus className="w-4 h-4" /> Add User
            </Button>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredUsers.slice(0, 10).length}</span> of <span className="font-semibold text-foreground">{filteredUsers.length}</span> users
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[200px]">User</TableHead>
              <TableHead className="w-[180px]">Contact</TableHead>
              <TableHead className="w-[100px]">Trust Score</TableHead>
              <TableHead className="w-[140px]">Risk Flags</TableHead>
              <TableHead className="w-[120px]">Location</TableHead>
              <TableHead className="w-[110px]">Joined</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="text-right w-[60px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.slice(0, 10).map((user) => {
              const statusCfg = getStatusConfig(user.status);
              const riskCfg = getRiskConfig(user.trustScore || 50);
              const RiskIcon = riskCfg.icon;
              return (
                <TableRow key={user.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm relative">
                        {user.name.charAt(0)}
                        {user.isVerified && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                            <ShieldCheck className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm flex items-center gap-1 truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{user.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border cursor-help ${riskCfg.bg} ${riskCfg.color} ${riskCfg.border}`}>
                            <RiskIcon className="w-3 h-3" />
                            {user.trustScore}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-semibold">Trust Score: {user.trustScore}/100</p>
                            <p className="text-xs text-muted-foreground">{riskCfg.label} risk level</p>
                            <div className="text-xs mt-1">
                              <p className="font-medium">Profile:</p>
                              <p>Completion: {user.profileCompletion}%</p>
                              <p>Posts: {user.posts} | Followers: {user.followers}</p>
                              <p>Devices: {user.deviceCount} | IPs: {user.ipCount}</p>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(user.riskFlags || []).slice(0, 2).map((flag: RiskFlag) => (
                        <Badge key={flag} variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-red-200 text-red-600 bg-red-50">
                          {getRiskFlagLabel(flag)}
                        </Badge>
                      ))}
                      {(user.riskFlags || []).length > 2 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                          +{(user.riskFlags || []).length - 2}
                        </Badge>
                      )}
                      {(user.riskFlags || []).length === 0 && (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span>{user.city}</span>
                    </div>
                    <div className="text-xs text-muted-foreground ml-4.5">{user.state}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Calendar className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span>{user.joinDate}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-opacity">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                        <Link href={`/users/${user.id}`}>
                          <DropdownMenuItem className="cursor-pointer text-xs">
                            <Eye className="mr-2 h-3.5 w-3.5" /> View Profile
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        {!user.isVerified && (
                          <DropdownMenuItem onClick={() => handleAction("verify", user.id)} className="cursor-pointer text-xs">
                            <ShieldCheck className="mr-2 h-3.5 w-3.5" /> Verify User
                          </DropdownMenuItem>
                        )}
                        {user.status === 'active' ? (
                          <DropdownMenuItem onClick={() => handleAction("suspend", user.id)} className="cursor-pointer text-amber-600 text-xs">
                            <Ban className="mr-2 h-3.5 w-3.5" /> Suspend
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleAction("activate", user.id)} className="cursor-pointer text-emerald-600 text-xs">
                            <ShieldCheck className="mr-2 h-3.5 w-3.5" /> Activate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleAction("delete", user.id)} className="cursor-pointer text-red-600 text-xs">
                          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* ── Add User Dialog ── */}
      <Dialog open={showAddUser} onOpenChange={(open) => { if (!open) { setShowAddUser(false); setAddErrors({}); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">Add New User</DialogTitle>
            <DialogDescription className="text-sm">
              Create a new user account. A default password will be assigned and shared via SMS.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Name</Label>
              <Input
                placeholder="e.g. Rahul Sharma"
                value={newUser.name}
                onChange={(e) => { setNewUser({ ...newUser, name: e.target.value }); setAddErrors({ ...addErrors, name: "" }); }}
                className={addErrors.name ? "border-red-300" : ""}
              />
              {addErrors.name && <p className="text-[10px] text-red-500">{addErrors.name}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Phone</Label>
              <Input
                placeholder="+91 XXXXX XXXXX"
                value={newUser.phone}
                onChange={(e) => { setNewUser({ ...newUser, phone: e.target.value }); setAddErrors({ ...addErrors, phone: "" }); }}
                className={addErrors.phone ? "border-red-300" : ""}
              />
              {addErrors.phone && <p className="text-[10px] text-red-500">{addErrors.phone}</p>}
            </div>
            <div className="space-y-1 col-span-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Email</Label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={newUser.email}
                onChange={(e) => { setNewUser({ ...newUser, email: e.target.value }); setAddErrors({ ...addErrors, email: "" }); }}
                className={addErrors.email ? "border-red-300" : ""}
              />
              {addErrors.email && <p className="text-[10px] text-red-500">{addErrors.email}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">City</Label>
              <Input
                placeholder="e.g. Mumbai"
                value={newUser.city}
                onChange={(e) => { setNewUser({ ...newUser, city: e.target.value }); setAddErrors({ ...addErrors, city: "" }); }}
                className={addErrors.city ? "border-red-300" : ""}
              />
              {addErrors.city && <p className="text-[10px] text-red-500">{addErrors.city}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">State</Label>
              <Input
                placeholder="e.g. Maharashtra"
                value={newUser.state}
                onChange={(e) => { setNewUser({ ...newUser, state: e.target.value }); setAddErrors({ ...addErrors, state: "" }); }}
                className={addErrors.state ? "border-red-300" : ""}
              />
              {addErrors.state && <p className="text-[10px] text-red-500">{addErrors.state}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Language</Label>
              <Select value={newUser.language} onValueChange={(v) => setNewUser({ ...newUser, language: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Hindi", "English", "Marathi", "Tamil", "Telugu", "Bengali", "Malayalam", "Gujarati", "Kannada", "Punjabi", "Odia", "Urdu", "Assamese"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Status</Label>
              <Select value={newUser.status} onValueChange={(v) => setNewUser({ ...newUser, status: v as User["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => { setShowAddUser(false); setAddErrors({}); }}>Cancel</Button>
            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-500 text-white border-0" onClick={handleAddUser}>
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Dialog ── */}
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog({ isOpen: false, action: "", userId: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="capitalize text-base">Confirm {confirmDialog.action}</DialogTitle>
            <DialogDescription className="text-sm">
              {confirmDialog.action === "delete"
                ? "Are you sure you want to permanently delete this user? This action cannot be undone."
                : `Are you sure you want to ${confirmDialog.action} this user? This action will be logged for auditing purposes.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setConfirmDialog({ isOpen: false, action: "", userId: null })}>Cancel</Button>
            <Button variant={confirmDialog.action === 'delete' ? 'destructive' : 'default'} size="sm" onClick={confirmAction}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
