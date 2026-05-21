import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings2, Shield, Bell, CreditCard, Sliders, Globe, Server,
  Lock, Mail, MessageSquare, AlertTriangle, CheckCircle, Smartphone,
  Users, ToggleLeft, Zap, Database, Eye, EyeOff, FileText, Save, RefreshCw, KeyRound,
} from "lucide-react";
import { getCredentials, saveCredentials } from "@/config/credentials";

// ── Toggle row helper ─────────────────────────────────────────────────────────
function ToggleRow({ label, desc, defaultOn = true, badge }: { label: string; desc: string; defaultOn?: boolean; badge?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div className="flex-1 pr-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{label}</p>
          {badge && <Badge className="text-[10px] h-4 px-1.5 bg-purple-100 text-purple-700">{badge}</Badge>}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <Switch defaultChecked={defaultOn} />
    </div>
  );
}

// ── Input row helper ──────────────────────────────────────────────────────────
function InputRow({ label, desc, value, type = "text" }: { label: string; desc: string; value: string; type?: string }) {
  return (
    <div className="py-3 border-b last:border-b-0 space-y-1.5">
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
      <Input defaultValue={value} type={type} className="h-8 text-sm max-w-sm" />
    </div>
  );
}

// ── Change Credentials Panel ──────────────────────────────────────────────────
type CredRole = "super_admin" | "admin";

function ChangeCredentials({ role, label, color }: { role: CredRole; label: string; color: string }) {
  const [form, setForm]       = useState({ email: "", newPass: "", confirmPass: "", currentPass: "" });
  const [showNew, setShowNew] = useState(false);
  const [showCur, setShowCur] = useState(false);
  const [status, setStatus]   = useState<"idle" | "success" | "error">("idle");
  const [msg,    setMsg]      = useState("");

  const save = () => {
    setStatus("idle"); setMsg("");
    const creds = getCredentials();

    if (!form.currentPass) { setStatus("error"); setMsg("Enter the current password to confirm changes."); return; }
    if (form.currentPass !== creds[role].password) { setStatus("error"); setMsg("Current password is incorrect."); return; }
    if (form.newPass && form.newPass.length < 8) { setStatus("error"); setMsg("New password must be at least 8 characters."); return; }
    if (form.newPass && form.newPass !== form.confirmPass) { setStatus("error"); setMsg("New passwords do not match."); return; }

    const updated = { ...creds };
    if (form.email.trim())  updated[role] = { ...updated[role], email: form.email.trim().toLowerCase() };
    if (form.newPass)       updated[role] = { ...updated[role], password: form.newPass };
    saveCredentials(updated);

    setStatus("success");
    setMsg(`${label} credentials updated successfully.`);
    setForm({ email: "", newPass: "", confirmPass: "", currentPass: "" });
  };

  const current = getCredentials()[role];

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className={`text-sm flex items-center gap-2 ${color}`}>
          <KeyRound className="w-4 h-4" />{label} Credentials
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-gray-50 border px-4 py-3 space-y-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Current Login</p>
          <p className="text-sm font-semibold">{current.email}</p>
          <p className="text-xs text-muted-foreground">Password: {'•'.repeat(current.password.length)}</p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New Email <span className="text-gray-400 normal-case font-normal">(leave blank to keep current)</span></Label>
            <Input
              type="email"
              placeholder={current.email}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New Password <span className="text-gray-400 normal-case font-normal">(leave blank to keep current)</span></Label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                placeholder="Min 8 characters"
                value={form.newPass}
                onChange={(e) => setForm((f) => ({ ...f, newPass: e.target.value }))}
                className="h-9 text-sm pr-10"
              />
              <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confirm New Password</Label>
            <Input
              type="password"
              placeholder="Repeat new password"
              value={form.confirmPass}
              onChange={(e) => setForm((f) => ({ ...f, confirmPass: e.target.value }))}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5 pt-1 border-t">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Current Password <span className="text-red-400">*</span> (required to confirm)</Label>
            <div className="relative">
              <Input
                type={showCur ? "text" : "password"}
                placeholder="Your current password"
                value={form.currentPass}
                onChange={(e) => setForm((f) => ({ ...f, currentPass: e.target.value }))}
                className="h-9 text-sm pr-10"
              />
              <button type="button" onClick={() => setShowCur((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCur ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {status !== "idle" && (
          <div className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs font-medium ${status === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
            {status === "success" ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
            {msg}
          </div>
        )}

        <Button onClick={save} size="sm" className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
          <Save className="w-3.5 h-3.5" /> Save {label} Credentials
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Main Settings page ────────────────────────────────────────────────────────
export default function Settings() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100">
            <Settings2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black">Platform Settings</h1>
            <p className="text-muted-foreground text-sm">Global configuration for the Ridhi platform — Super Admin only</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2"><RefreshCw className="w-3.5 h-3.5" />Reset to Defaults</Button>
          <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700"><Save className="w-3.5 h-3.5" />Save All Changes</Button>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
        <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
        <p className="text-sm text-green-700">All systems operational · Last config change: <strong>Dec 20, 2025 at 10:42 AM</strong> by arjun@ridhi.app</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="h-9 flex flex-wrap gap-0.5">
          <TabsTrigger value="general"     className="text-xs gap-1.5"><Globe        className="w-3.5 h-3.5" />General</TabsTrigger>
          <TabsTrigger value="features"    className="text-xs gap-1.5"><ToggleLeft   className="w-3.5 h-3.5" />Feature Flags</TabsTrigger>
          <TabsTrigger value="security"    className="text-xs gap-1.5"><Shield       className="w-3.5 h-3.5" />Security</TabsTrigger>
          <TabsTrigger value="notifs"      className="text-xs gap-1.5"><Bell         className="w-3.5 h-3.5" />Notifications</TabsTrigger>
          <TabsTrigger value="finance"     className="text-xs gap-1.5"><CreditCard   className="w-3.5 h-3.5" />Finance & Payouts</TabsTrigger>
          <TabsTrigger value="content"     className="text-xs gap-1.5"><Eye          className="w-3.5 h-3.5" />Content Moderation</TabsTrigger>
          <TabsTrigger value="limits"      className="text-xs gap-1.5"><Zap          className="w-3.5 h-3.5" />Limits & Quotas</TabsTrigger>
          <TabsTrigger value="credentials" className="text-xs gap-1.5"><KeyRound     className="w-3.5 h-3.5" />Credentials</TabsTrigger>
        </TabsList>

        {/* ═══════ GENERAL ═══════ */}
        <TabsContent value="general" className="space-y-5 mt-4">
          <div className="grid md:grid-cols-2 gap-5">
            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm flex items-center gap-2"><Globe className="w-4 h-4 text-blue-500" />App Identity</CardTitle></CardHeader>
              <CardContent>
                <InputRow label="App Name"        desc="Displayed in headers, notifications, and store listings."       value="Ridhi" />
                <InputRow label="Tagline"         desc="Short descriptor shown on onboarding and marketing."            value="India's #1 Social App" />
                <InputRow label="Support Email"   desc="Users see this for complaints and KYC queries."                value="hello@ridhi.app" />
                <InputRow label="Support Phone"   desc="Toll-free or WhatsApp number for host/agent escalations."      value="+91 80000 00000" />
                <InputRow label="Legal Entity"    desc="Used in invoices and T&Cs."                                     value="Ridhi Technologies Pvt. Ltd." />
                <InputRow label="GST Number"      desc="For taxation and payout receipts."                             value="27AAAAA0000A1Z5" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm flex items-center gap-2"><Server className="w-4 h-4 text-purple-500" />Platform Status</CardTitle></CardHeader>
              <CardContent>
                <ToggleRow label="Platform Online"          desc="Master switch — disabling this shows a maintenance page to all users."                                defaultOn={true}  badge="Critical" />
                <ToggleRow label="New User Registrations"   desc="Allow new phone/email sign-ups. Turn off during abuse spikes."                                        defaultOn={true}  />
                <ToggleRow label="Host Applications Open"   desc="Allow new host applications to be submitted."                                                         defaultOn={true}  />
                <ToggleRow label="Agent Applications Open"  desc="Allow new agent applications to be submitted."                                                        defaultOn={true}  />
                <ToggleRow label="Android App Live"         desc="Android Play Store version active and accepting traffic."                                             defaultOn={true}  />
                <ToggleRow label="iOS App Live"             desc="iOS App Store version active and accepting traffic."                                                  defaultOn={false} badge="Coming Soon" />
                <div className="pt-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Maintenance Window</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs mb-1 text-muted-foreground">Start</p>
                      <Input type="datetime-local" className="h-8 text-xs" />
                    </div>
                    <div>
                      <p className="text-xs mb-1 text-muted-foreground">End</p>
                      <Input type="datetime-local" className="h-8 text-xs" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="py-4"><CardTitle className="text-sm flex items-center gap-2"><Smartphone className="w-4 h-4 text-pink-500" />App Store Configuration</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-0">
                <InputRow label="Android Version (live)"     desc="Version string shown in Play Store."                    value="1.4.2"       />
                <InputRow label="Android Min Version"        desc="Users below this are forced to update."                 value="1.3.0"       />
                <InputRow label="Android Package Name"       desc="Play Store app ID."                                     value="app.ridhi.social" />
                <InputRow label="iOS Version (live)"         desc="Version string shown in App Store."                     value="1.4.2"       />
                <InputRow label="iOS Min Version"            desc="Users below this are forced to update."                 value="1.3.0"       />
                <InputRow label="iOS Bundle ID"              desc="Apple developer bundle identifier."                     value="app.ridhi.social" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════ FEATURE FLAGS ═══════ */}
        <TabsContent value="features" className="space-y-5 mt-4">
          <div className="grid md:grid-cols-2 gap-5">
            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm flex items-center gap-2"><Sliders className="w-4 h-4 text-blue-500" />Core Features</CardTitle></CardHeader>
              <CardContent>
                <ToggleRow label="Live Streaming"           desc="Hosts can go live. Disabling this hides the Go Live button globally."                   defaultOn={true}  />
                <ToggleRow label="PK Battles"               desc="Host-vs-host battle feature. Toggle off for maintenance."                              defaultOn={true}  />
                <ToggleRow label="Audio Rooms"              desc="Multi-participant audio rooms (like Clubhouse)."                                         defaultOn={true}  />
                <ToggleRow label="Reels"                    desc="Short-form vertical video feed."                                                         defaultOn={true}  />
                <ToggleRow label="Dating / Match"           desc="Tinder-style swipe match feature. Toggle off if legal review needed."                   defaultOn={true}  />
                <ToggleRow label="Communities"              desc="Group communities with posts, threads, and moderation."                                  defaultOn={true}  />
                <ToggleRow label="Jobs Board"               desc="Job posting and discovery feature."                                                      defaultOn={true}  />
                <ToggleRow label="Creator Dashboard"        desc="Analytics and earnings dashboard for hosts."                                             defaultOn={true}  />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm flex items-center gap-2"><CreditCard className="w-4 h-4 text-green-500" />Monetisation Features</CardTitle></CardHeader>
              <CardContent>
                <ToggleRow label="Coin Wallet"              desc="Virtual coin system — recharges, gifting, and withdrawals."                              defaultOn={true}  />
                <ToggleRow label="VIP Subscriptions"        desc="Silver / Gold / Platinum / Diamond Elite tiers."                                         defaultOn={true}  />
                <ToggleRow label="Creator Subscriptions"    desc="Basic / Pro / Elite creator plans."                                                      defaultOn={true}  />
                <ToggleRow label="Fan Clubs"                desc="Host-specific fan club subscription feature."                                            defaultOn={true}  />
                <ToggleRow label="Gift Leaderboard"         desc="Top gifters shown on host streams (drives coin spend)."                                  defaultOn={true}  />
                <ToggleRow label="Promo Codes"              desc="Allow discount/promo codes for coin recharges."                                          defaultOn={true}  />
                <ToggleRow label="Referral Program"         desc="User-to-user referral rewards."                                                          defaultOn={true}  badge="Beta" />
                <ToggleRow label="Ads (in-feed)"            desc="Third-party ad impressions in home feed."                                               defaultOn={false} badge="Planned" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════ SECURITY ═══════ */}
        <TabsContent value="security" className="space-y-5 mt-4">
          <div className="grid md:grid-cols-2 gap-5">
            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm flex items-center gap-2"><Lock className="w-4 h-4 text-red-500" />Authentication</CardTitle></CardHeader>
              <CardContent>
                <ToggleRow label="OTP Login (SMS)"               desc="Phone-based OTP via MSG91."                                      defaultOn={true}  />
                <ToggleRow label="Email Login"                   desc="Email + password login alternative."                            defaultOn={true}  />
                <ToggleRow label="Google Sign-In"                desc="OAuth2 sign-in with Google."                                    defaultOn={false} badge="Planned" />
                <ToggleRow label="Admin 2FA Enforcement"         desc="Force all SA/Admin accounts to use 2-factor auth."             defaultOn={true}  badge="Recommended" />
                <ToggleRow label="Device Fingerprinting"         desc="Track and flag unusual device switches for accounts."          defaultOn={true}  />
                <InputRow  label="OTP Expiry (minutes)"          desc="How long an OTP remains valid after sending."                  value="10" type="number" />
                <InputRow  label="OTP Daily Limit per Phone"     desc="Maximum OTPs that can be sent to a single number per day."     value="5" type="number" />
                <InputRow  label="Session Timeout (hours)"       desc="Idle sessions are logged out after this period."               value="24" type="number" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-orange-500" />Moderation & Safety</CardTitle></CardHeader>
              <CardContent>
                <ToggleRow label="Auto-Ban Repeat Abusers"       desc="Accounts with 5+ violations in 30d are auto-suspended."        defaultOn={true}  />
                <ToggleRow label="IP Rate Limiting"              desc="Block IPs sending > 300 req/min."                              defaultOn={true}  />
                <ToggleRow label="VPN Detection"                 desc="Flag or block users connecting via VPN."                      defaultOn={false} />
                <ToggleRow label="NSFW AI Detection"             desc="Auto-flag explicit content before human review."              defaultOn={true}  badge="AI" />
                <ToggleRow label="Fake Account AI Detection"     desc="ML model flags suspicious sign-up patterns."                  defaultOn={true}  badge="AI" />
                <InputRow  label="Max Strikes Before Suspend"    desc="Number of content violations before auto-suspension."        value="3" type="number" />
                <InputRow  label="Suspension Duration (days)"    desc="Default auto-suspension length for first-time abuse."        value="7" type="number" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════ NOTIFICATIONS ═══════ */}
        <TabsContent value="notifs" className="space-y-5 mt-4">
          <div className="grid md:grid-cols-2 gap-5">
            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm flex items-center gap-2"><Bell className="w-4 h-4 text-yellow-500" />Push Notifications</CardTitle></CardHeader>
              <CardContent>
                <ToggleRow label="New Match Alerts"              desc="Notify users when a new dating match is made."                  defaultOn={true}  />
                <ToggleRow label="Live Stream Start Alerts"      desc="Notify followers when a host goes live."                       defaultOn={true}  />
                <ToggleRow label="Coin Gift Received"            desc="Push when a user receives a gift on stream."                   defaultOn={true}  />
                <ToggleRow label="Level Up Celebration"          desc="Full-screen animation + push on host level promotion."        defaultOn={true}  />
                <ToggleRow label="PK Battle Invite"              desc="Real-time push when invited to a PK battle."                  defaultOn={true}  />
                <ToggleRow label="Promo & Offers"                desc="Marketing pushes for coin deals and VIP sales."               defaultOn={true}  />
                <ToggleRow label="Daily Streak Reminder"         desc="Remind hosts who haven't streamed to maintain streak."        defaultOn={true}  />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="w-4 h-4 text-green-500" />SMS & WhatsApp (MSG91)</CardTitle></CardHeader>
              <CardContent>
                <ToggleRow label="SMS OTP"                       desc="Phone verification via SMS OTP."                               defaultOn={true}  />
                <ToggleRow label="WhatsApp OTP"                  desc="Use WhatsApp as fallback OTP channel."                        defaultOn={true}  />
                <ToggleRow label="Host Payout SMS"               desc="Notify hosts via SMS when a payout is processed."             defaultOn={true}  />
                <ToggleRow label="KYC Status SMS"                desc="SMS when KYC is approved or rejected."                        defaultOn={true}  />
                <ToggleRow label="Promotional WhatsApp"          desc="Marketing messages via WhatsApp to opted-in users."           defaultOn={false} />
                <InputRow  label="MSG91 Sender ID"               desc="Registered DLT sender ID for SMS."                           value="RIDHIA" />
                <InputRow  label="SMS Daily Budget (₹)"          desc="Max spend per day on SMS to prevent abuse."                  value="5000" type="number" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════ FINANCE ═══════ */}
        <TabsContent value="finance" className="space-y-5 mt-4">
          <div className="grid md:grid-cols-2 gap-5">
            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-500" />Coin & Payment Config</CardTitle></CardHeader>
              <CardContent>
                <InputRow label="1 Coin = ₹ (buying rate)"       desc="How much INR users pay per coin when recharging."             value="0.10" />
                <InputRow label="1 Coin = ₹ (payout rate)"       desc="How much INR hosts receive per coin gifted."                 value="0.07" />
                <InputRow label="Platform Margin (%)"            desc="Margin retained on every coin transaction."                  value="30" type="number" />
                <InputRow label="Min Payout Amount (₹)"          desc="Minimum balance required to request a withdrawal."          value="500" type="number" />
                <InputRow label="Max Payout Per Day (₹)"         desc="Cap on single-day payouts per host."                        value="50000" type="number" />
                <InputRow label="Payout Processing Days"         desc="Business days to process a payout request."                 value="3" type="number" />
                <ToggleRow label="Auto-Payout on 5th"            desc="Automatically process eligible payouts on the 5th of each month." defaultOn={true} />
                <ToggleRow label="GST on Recharge (18%)"         desc="Apply 18% GST on coin recharge transactions."               defaultOn={true} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-purple-500" />Razorpay & TDS Config</CardTitle></CardHeader>
              <CardContent>
                <ToggleRow label="Razorpay Live Mode"            desc="Toggle between Test and Live Razorpay keys."                 defaultOn={true} badge="Live" />
                <ToggleRow label="UPI Payments"                  desc="Accept UPI (GPay, PhonePe, Paytm) for coin recharges."      defaultOn={true} />
                <ToggleRow label="Card Payments"                 desc="Accept credit/debit cards via Razorpay."                    defaultOn={true} />
                <ToggleRow label="Net Banking"                   desc="Accept net banking payments."                               defaultOn={true} />
                <ToggleRow label="EMI (on large recharges)"      desc="Offer EMI for recharges above ₹1,000."                     defaultOn={false} badge="Planned" />
                <InputRow  label="TDS Rate (%)"                  desc="Tax deducted at source on host payouts above ₹30,000/yr." value="10" type="number" />
                <InputRow  label="Annual TDS Threshold (₹)"     desc="Payouts above this yearly amount are subject to TDS."      value="30000" type="number" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════ CONTENT MODERATION ═══════ */}
        <TabsContent value="content" className="space-y-5 mt-4">
          <div className="grid md:grid-cols-2 gap-5">
            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm flex items-center gap-2"><Eye className="w-4 h-4 text-indigo-500" />Auto-Moderation</CardTitle></CardHeader>
              <CardContent>
                <ToggleRow label="AI Content Scanning (Streams)"  desc="Real-time NSFW/violence detection on live streams."          defaultOn={true}  badge="AI" />
                <ToggleRow label="AI Content Scanning (Posts)"    desc="Scan uploaded photos and videos before publishing."          defaultOn={true}  badge="AI" />
                <ToggleRow label="Hate Speech Detection"          desc="Auto-flag slurs and targeted harassment in chats/comments." defaultOn={true}  badge="AI" />
                <ToggleRow label="Spam Link Detection"            desc="Block phishing and spam URLs in messages and bios."         defaultOn={true}  />
                <ToggleRow label="Duplicate Content Detection"    desc="Flag reposted content that violates originality rules."    defaultOn={false} />
                <InputRow  label="AI Confidence Threshold (%)"    desc="Flag content with AI confidence above this value."         value="80" type="number" />
                <InputRow  label="Human Review SLA (hours)"       desc="Flagged content must be reviewed within this timeframe."   value="12" type="number" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500" />Community Standards</CardTitle></CardHeader>
              <CardContent>
                <ToggleRow label="Age Verification (18+ content)" desc="Require DOB verification before accessing adult content categories." defaultOn={true}  />
                <ToggleRow label="Regional Language Filter"       desc="Detect and tag content by language for regional feeds."    defaultOn={true}  />
                <ToggleRow label="Report Throttling"              desc="Limit mass-reporting abuse (max 10 reports per user per day)." defaultOn={true} />
                <ToggleRow label="Comment Keyword Filter"         desc="Auto-hide comments containing blocked keywords."           defaultOn={true}  />
                <InputRow  label="Max Reports Before Review"      desc="Content is auto-hidden when this many reports are received." value="5" type="number" />
                <InputRow  label="Blocked Keywords List"          desc="Comma-separated. Managed via moderation panel."           value="(managed in Moderation panel)" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════ LIMITS & QUOTAS ═══════ */}
        <TabsContent value="limits" className="space-y-5 mt-4">
          <div className="grid md:grid-cols-2 gap-5">
            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm flex items-center gap-2"><Users className="w-4 h-4 text-purple-500" />Host Limits</CardTitle></CardHeader>
              <CardContent>
                <InputRow label="Max Stream Duration (hours)"     desc="Auto-end stream if host exceeds this duration without a break." value="6"    type="number" />
                <InputRow label="Max Concurrent PK Battles"       desc="How many PK battles can run in parallel platform-wide."         value="100"  type="number" />
                <InputRow label="Max Gift Amount per User (day)"  desc="Cap on coins a single user can send per day."                   value="100000" type="number" />
                <InputRow label="Max Stream Viewers"              desc="Max concurrent viewers per stream (CDN capacity limit)."        value="50000" type="number" />
                <InputRow label="Stream Preview Delay (sec)"      desc="Delay applied to free viewers (premium users get no delay)."   value="5"    type="number" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4"><CardTitle className="text-sm flex items-center gap-2"><Database className="w-4 h-4 text-blue-500" />API & System Quotas</CardTitle></CardHeader>
              <CardContent>
                <InputRow label="API Rate Limit (req/min)"        desc="Global rate limit per authenticated user."                     value="300"  type="number" />
                <InputRow label="Upload Size Limit (MB)"          desc="Max file size for videos, images, and audio."                  value="500"  type="number" />
                <InputRow label="Max Video Duration (minutes)"    desc="Cap on Reels and post video length."                           value="10"   type="number" />
                <InputRow label="CDN Cache TTL (seconds)"         desc="How long CDN caches assets before revalidating."              value="86400" type="number" />
                <InputRow label="DB Connection Pool Size"         desc="Max simultaneous database connections."                       value="50"   type="number" />
                <ToggleRow label="Query Caching (Redis)"          desc="Cache frequent read queries in Redis for performance."        defaultOn={true} />
                <ToggleRow label="Response Compression (gzip)"    desc="Compress API responses to reduce bandwidth."                 defaultOn={true} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════ CREDENTIALS ═══════ */}
        <TabsContent value="credentials" className="space-y-5 mt-4">
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-3">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Admin Panel Login Credentials</p>
              <p className="text-xs text-amber-700 mt-0.5">
                These are the email addresses and passwords used to log in to this admin panel. Changes take effect immediately — you will need the new credentials on your next login. Only Super Admin can access this tab.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <ChangeCredentials role="super_admin" label="Super Admin" color="text-purple-600" />
            <ChangeCredentials role="admin"       label="Admin"       color="text-indigo-600" />
          </div>

          <Card className="border-dashed">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Forgot your current password?</p>
                  <p className="text-xs text-muted-foreground">
                    If you are locked out, credentials can be reset by clearing your browser's localStorage for this domain, which will restore the original default passwords (<code className="bg-gray-100 px-1 rounded">Ridhi@SA2024</code> for Super Admin, <code className="bg-gray-100 px-1 rounded">Ridhi@Admin2024</code> for Admin).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
