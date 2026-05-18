import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Bell, Megaphone, Send, Clock, Users, Eye, CheckCircle2, Plus,
  MessageSquare, Mail, MessageCircle, Smartphone, Globe, BarChart2,
  Zap, Target, TrendingUp, AlertCircle,
} from "lucide-react";
import { mockCampaigns, type Campaign } from "@/data/mock-data";
import { useToast } from "@/hooks/use-toast";

const CAMPAIGN_STATUS: Record<string, string> = {
  Draft: "bg-muted/60 text-muted-foreground border-border",
  Active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Completed: "bg-blue-500/15 text-blue-400 border-blue-500/20",
};

const AUDIENCE_OPTIONS = [
  { value: "all",        label: "All Users",         count: "148K" },
  { value: "hindi",      label: "Hindi Speakers",    count: "62K"  },
  { value: "tamil",      label: "Tamil Speakers",    count: "18K"  },
  { value: "telugu",     label: "Telugu Speakers",   count: "14K"  },
  { value: "mumbai",     label: "Mumbai",            count: "42K"  },
  { value: "delhi",      label: "Delhi",             count: "38K"  },
  { value: "bangalore",  label: "Bangalore",         count: "31K"  },
  { value: "male",       label: "Male Users",        count: "88K"  },
  { value: "female",     label: "Female Users",      count: "60K"  },
  { value: "new",        label: "New Users (<7 days)", count: "8K" },
  { value: "inactive",   label: "Inactive (30d+)",   count: "21K"  },
  { value: "vip",        label: "VIP / Subscribed",  count: "12K"  },
  { value: "pending",    label: "Pending Verification", count: "4K"},
];

const WHATSAPP_TEMPLATES = [
  { id: "promo1",  name: "Diwali Offer",           preview: "🪔 Happy Diwali! Get 2x coins today only on Ridhi. Tap to claim: {link}" },
  { id: "promo2",  name: "New Feature Launch",     preview: "🚀 Big update! {feature} is now live on Ridhi. Try it now: {link}" },
  { id: "promo3",  name: "Re-engagement",          preview: "Hey {name}! 👋 We miss you. Come back and find your match on Ridhi: {link}" },
  { id: "promo4",  name: "Coin Reward",            preview: "💰 You have {coins} coins waiting! Claim them before they expire: {link}" },
  { id: "promo5",  name: "Event Announcement",     preview: "🎉 Live event tonight at 8 PM IST! Join {host} on Ridhi. Don't miss it: {link}" },
  { id: "promo6",  name: "Referral Push",          preview: "👥 Invite friends and earn ₹50 each! Share your link: {referral_link}" },
];

const HISTORY: { channel: string; title: string; target: string; reach: number; rate: number; sentAt: string; icon: typeof Bell; color: string }[] = [
  { channel: "Push",      title: "Diwali Special Coins!", target: "All Users", reach: 142000, rate: 34.2, sentAt: "12 May 10:30", icon: Bell,           color: "text-violet-400" },
  { channel: "SMS",       title: "New Reels Feature",     target: "Hindi",    reach: 62000,  rate: 18.7, sentAt: "10 May 14:00", icon: Smartphone,      color: "text-blue-400"   },
  { channel: "WhatsApp",  title: "IPL Special — React!",  target: "All Users",reach: 148000, rate: 52.1, sentAt: "6 May 19:00",  icon: MessageSquare,   color: "text-emerald-400"},
  { channel: "Email",     title: "Weekly Digest",         target: "All Users",reach: 94000,  rate: 28.4, sentAt: "4 May 10:00",  icon: Mail,            color: "text-amber-400"  },
  { channel: "Push",      title: "Complete Your Profile", target: "Pending",  reach: 12000,  rate: 61.8, sentAt: "2 May 11:00",  icon: Bell,            color: "text-violet-400" },
];

function AudienceSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const opt = AUDIENCE_OPTIONS.find((o) => o.value === value);
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-background border-border">
        <SelectValue>
          {opt ? (
            <span className="flex items-center gap-2">
              {opt.label}
              <Badge variant="outline" className="ml-1 text-xs font-mono">{opt.count}</Badge>
            </span>
          ) : "Select audience…"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {AUDIENCE_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            <span className="flex items-center gap-2">
              {o.label} <span className="text-muted-foreground text-xs font-mono">{o.count}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ScheduleBlock({ isScheduled, setIsScheduled, scheduledDate, setScheduledDate }: {
  isScheduled: boolean; setIsScheduled: (v: boolean) => void;
  scheduledDate: string; setScheduledDate: (v: string) => void;
}) {
  return (
    <>
      <div className="flex items-center gap-3 py-1">
        <Switch checked={isScheduled} onCheckedChange={setIsScheduled} id="sched" />
        <Label htmlFor="sched" className="text-sm text-foreground cursor-pointer">Schedule for later</Label>
      </div>
      {isScheduled && (
        <div className="space-y-1.5">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Send Date & Time (IST)
          </Label>
          <Input type="datetime-local" className="bg-background border-border" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
        </div>
      )}
    </>
  );
}

function SendButton({ label, loading, onSend }: { label: string; loading: boolean; onSend: () => void }) {
  return (
    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" onClick={onSend} disabled={loading}>
      {loading
        ? <span className="flex items-center gap-2"><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Sending…</span>
        : <span className="flex items-center gap-2"><Send className="w-4 h-4" /> {label}</span>}
    </Button>
  );
}

// ── Push Notifications ───────────────────────────────────────────────────────
function PushTab() {
  const { toast } = useToast();
  const [title,   setTitle]   = useState("");
  const [body,    setBody]    = useState("");
  const [target,  setTarget]  = useState("all");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!title.trim() || !body.trim()) { toast({ title: "Missing fields", variant: "destructive" }); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    toast({ title: "✅ Push sent!", description: `Delivered to ${AUDIENCE_OPTIONS.find(o=>o.value===target)?.count} users.` });
    setTitle(""); setBody(""); setTarget("all");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" /> Compose Push Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Title</Label>
            <Input placeholder="Notification title…" className="bg-background border-border" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} />
            <p className="text-xs text-muted-foreground text-right">{title.length}/60</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Body</Label>
            <Textarea placeholder="Message…" className="bg-background border-border resize-none" rows={3} value={body} onChange={(e) => setBody(e.target.value)} maxLength={160} />
            <p className="text-xs text-muted-foreground text-right">{body.length}/160</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Target Audience</Label>
            <AudienceSelect value={target} onChange={setTarget} />
          </div>
          <ScheduleBlock isScheduled={isScheduled} setIsScheduled={setIsScheduled} scheduledDate={scheduledDate} setScheduledDate={setScheduledDate} />
          <SendButton label={isScheduled ? "Schedule Push" : "Send Push Now"} loading={loading} onSend={send} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="bg-background rounded-2xl p-4 border border-border shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#7B2FBE,#E91E8C)" }}>
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{title || "Notification Title"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{body || "Your message appears here…"}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">now · Ridhi</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Best Practices</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {["Keep titles under 40 chars", "Best time: 7–9 PM IST", "Personalize for 2× engagement", "Test on a small segment first"].map((t, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">{t}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Promotional SMS ──────────────────────────────────────────────────────────
function SmsTab() {
  const { toast } = useToast();
  const [message, setMessage]  = useState("");
  const [target,  setTarget]   = useState("all");
  const [senderId, setSenderId] = useState("RIDHI");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [loading, setLoading]  = useState(false);
  const charLimit = 160;
  const smsCount  = Math.ceil(message.length / charLimit) || 1;

  const send = async () => {
    if (!message.trim()) { toast({ title: "Message is empty", variant: "destructive" }); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    const audience = AUDIENCE_OPTIONS.find(o=>o.value===target);
    toast({ title: "✅ SMS Queued!", description: `${audience?.count} SMS messages queued via MSG91.` });
    setMessage("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-400" /> Compose Promotional SMS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>Requires MSG91 Auth Key + DLT-approved Sender ID and Template ID. Configure in Settings → Integrations.</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Sender ID</Label>
              <Input placeholder="e.g. RIDHI" className="bg-background border-border" value={senderId} onChange={(e) => setSenderId(e.target.value.toUpperCase().slice(0,6))} maxLength={6} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Target Audience</Label>
              <AudienceSelect value={target} onChange={setTarget} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Message (DLT Template)</Label>
            <Textarea
              placeholder="Type your SMS message… Use {name} for personalization."
              className="bg-background border-border resize-none font-mono text-sm"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{message.length} chars · {smsCount} SMS credit{smsCount > 1 ? "s" : ""} per user</span>
              <span className={message.length > charLimit ? "text-amber-400" : ""}>{message.length}/{charLimit}</span>
            </div>
          </div>

          <ScheduleBlock isScheduled={isScheduled} setIsScheduled={setIsScheduled} scheduledDate={scheduledDate} setScheduledDate={setScheduledDate} />
          <SendButton label={isScheduled ? "Schedule SMS" : "Send SMS Now"} loading={loading} onSend={send} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Phone Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="mx-auto max-w-[240px] bg-background border border-border rounded-2xl p-4 space-y-2">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{senderId || "SENDER"}</p>
              <p className="text-sm text-foreground leading-relaxed">{message || "Your SMS message will appear here…"}</p>
              <p className="text-xs text-muted-foreground/60">now</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold">Compliance Checklist</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              "DLT registration required (TRAI mandate)",
              "Template must be pre-approved",
              "No financial promises or misleading claims",
              "Include opt-out: 'Reply STOP to unsubscribe'",
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">{t}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── WhatsApp Broadcast ───────────────────────────────────────────────────────
function WhatsAppTab() {
  const { toast } = useToast();
  const [templateId, setTemplateId] = useState(WHATSAPP_TEMPLATES[0].id);
  const [target, setTarget]         = useState("all");
  const [customVar, setCustomVar]   = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [loading, setLoading]       = useState(false);

  const tpl = WHATSAPP_TEMPLATES.find((t) => t.id === templateId)!;
  const preview = tpl.preview.replace("{name}", "User").replace("{link}", "ridhi.app/open").replace("{feature}", customVar || "Reels 2.0").replace("{coins}", "150").replace("{host}", customVar || "Priya").replace("{referral_link}", "ridhi.app/ref/123");

  const send = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1600));
    setLoading(false);
    toast({ title: "✅ WhatsApp Broadcast Sent!", description: `Message sent to ${AUDIENCE_OPTIONS.find(o=>o.value===target)?.count} users via MSG91.` });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" /> WhatsApp Broadcast
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>Uses MSG91 WhatsApp Integrated Number. Users must have opted in to receive messages.</span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">WhatsApp Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue>{tpl.name}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {WHATSAPP_TEMPLATES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Variable (replaces {"{feature}"} / {"{host}"})</Label>
            <Input placeholder="e.g. Reels 2.0 or Priya Sharma" className="bg-background border-border" value={customVar} onChange={(e) => setCustomVar(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Target Audience</Label>
            <AudienceSelect value={target} onChange={setTarget} />
          </div>

          <ScheduleBlock isScheduled={isScheduled} setIsScheduled={setIsScheduled} scheduledDate={scheduledDate} setScheduledDate={setScheduledDate} />
          <SendButton label={isScheduled ? "Schedule WhatsApp" : "Send WhatsApp Now"} loading={loading} onSend={send} />
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">WhatsApp Preview</CardTitle></CardHeader>
        <CardContent>
          <div className="bg-[#0B1621] rounded-2xl p-4 min-h-[180px] flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "linear-gradient(135deg,#7B2FBE,#E91E8C)" }}>R</div>
              <div>
                <p className="text-white text-xs font-semibold">Ridhi Official</p>
                <p className="text-white/40 text-xs">Business Account</p>
              </div>
            </div>
            <div className="bg-[#1C2B33] rounded-xl rounded-tl-none p-3 max-w-[85%] self-start">
              <p className="text-white text-sm leading-relaxed">{preview}</p>
              <p className="text-white/40 text-xs mt-1.5 text-right">now ✓✓</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Email Broadcast ──────────────────────────────────────────────────────────
function EmailTab() {
  const { toast } = useToast();
  const [subject, setSubject]  = useState("");
  const [body,    setBody]     = useState("");
  const [target,  setTarget]   = useState("all");
  const [fromName, setFromName] = useState("Ridhi Team");
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [loading, setLoading]  = useState(false);

  const EMAIL_TEMPLATES = [
    { label: "Diwali Offer", subject: "🪔 2x Coins This Diwali — Limited Time!", body: "Dear {name},\n\nHappy Diwali from all of us at Ridhi! 🎇\n\nAs a special gift, you get 2x coins on every recharge today only.\n\nTap below to claim your coins 👇\n\n[Claim Now →]\n\nWith love,\nThe Ridhi Team" },
    { label: "New Feature",  subject: "🚀 Something New Just Landed on Ridhi!", body: "Hi {name},\n\nWe're thrilled to introduce a brand new feature!\n\nLog in now to check it out and let us know what you think.\n\n[Open Ridhi →]\n\nCheers,\nThe Ridhi Team" },
    { label: "Win Back",     subject: "We miss you, {name} 💜", body: "Hey {name},\n\nIt's been a while! Your matches and followers are waiting.\n\nCome back and continue where you left off.\n\n[Return to Ridhi →]\n\nMissed you,\nThe Ridhi Team" },
  ];

  const loadTemplate = (tpl: typeof EMAIL_TEMPLATES[0]) => { setSubject(tpl.subject); setBody(tpl.body); };

  const send = async () => {
    if (!subject.trim() || !body.trim()) { toast({ title: "Missing fields", variant: "destructive" }); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    toast({ title: "✅ Email Broadcast Sent!", description: `Sent to ${AUDIENCE_OPTIONS.find(o=>o.value===target)?.count} users.` });
    setSubject(""); setBody("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-400" /> Email Broadcast
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Quick Templates</Label>
            <div className="flex gap-2 flex-wrap">
              {EMAIL_TEMPLATES.map((t) => (
                <button key={t.label} onClick={() => loadTemplate(t)} className="text-xs px-2.5 py-1.5 rounded-lg border bg-muted border-border hover:bg-muted/80 transition-all">
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">From Name</Label>
              <Input className="bg-background border-border" value={fromName} onChange={(e) => setFromName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Target Audience</Label>
              <AudienceSelect value={target} onChange={setTarget} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Subject Line</Label>
            <Input placeholder="Compelling subject line…" className="bg-background border-border" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={78} />
            <p className="text-xs text-muted-foreground text-right">{subject.length}/78</p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Body</Label>
            <Textarea placeholder="Email body — use {name} for personalisation…" className="bg-background border-border resize-none text-sm" rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
            <p className="text-xs text-muted-foreground">Use {"{{name}}"} to personalise, {"[[CTA_URL]]"} for call-to-action</p>
          </div>

          <ScheduleBlock isScheduled={isScheduled} setIsScheduled={setIsScheduled} scheduledDate={scheduledDate} setScheduledDate={setScheduledDate} />
          <SendButton label={isScheduled ? "Schedule Email" : "Send Email Now"} loading={loading} onSend={send} />
        </CardContent>
      </Card>

      <Card className="bg-card border-border h-fit">
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Email Preview</CardTitle></CardHeader>
        <CardContent>
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 border-b border-border space-y-0.5">
              <p className="text-xs text-muted-foreground"><span className="font-semibold">From:</span> {fromName || "Ridhi Team"} &lt;noreply@ridhi.app&gt;</p>
              <p className="text-xs text-muted-foreground"><span className="font-semibold">Subject:</span> {subject || "(no subject)"}</p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded" style={{ background: "linear-gradient(135deg,#7B2FBE,#E91E8C)" }} />
                <span className="text-xs font-bold text-foreground">Ridhi</span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{body || "Your email body will appear here…"}</p>
            </div>
            <div className="bg-muted/30 px-4 py-3 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">Ridhi · Bengaluru, India · <a className="underline">Unsubscribe</a></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Campaigns Tab ────────────────────────────────────────────────────────────
function CampaignsTab({ campaigns, setCampaigns }: { campaigns: Campaign[]; setCampaigns: (c: Campaign[]) => void }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Marketing Campaigns</CardTitle>
          <Button size="sm" className="h-8 bg-primary hover:bg-primary/90 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> New Campaign
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs font-semibold">Campaign</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Channel</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold text-right">Reach</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold text-right">Clicks</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold text-right">Conv.</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Duration</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((c) => (
              <TableRow key={c.id} className="border-border hover:bg-muted/30">
                <TableCell className="font-medium text-foreground text-sm">{c.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs border-border text-muted-foreground">{c.type}</Badge>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">{(c.reach / 1000).toFixed(0)}K</TableCell>
                <TableCell className="text-right text-sm text-foreground font-medium">{c.clicks.toLocaleString()}</TableCell>
                <TableCell className="text-right text-sm text-emerald-400 font-semibold">{c.conversions}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.startDate} → {c.endDate}</TableCell>
                <TableCell>
                  <Badge className={`text-xs border ${CAMPAIGN_STATUS[c.status]}`}>{c.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ── Broadcast History ────────────────────────────────────────────────────────
function HistoryTable() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold">Broadcast History (All Channels)</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs font-semibold">Channel</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Message</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Audience</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold text-right">Reach</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold text-right">Open/Click Rate</TableHead>
              <TableHead className="text-muted-foreground text-xs font-semibold">Sent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {HISTORY.map((h, i) => (
              <TableRow key={i} className="border-border hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <h.icon className={`w-3.5 h-3.5 ${h.color}`} />
                    <span className="text-xs font-medium text-foreground">{h.channel}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium text-foreground max-w-xs truncate">{h.title}</TableCell>
                <TableCell><Badge variant="outline" className="text-xs border-border text-muted-foreground">{h.target}</Badge></TableCell>
                <TableCell className="text-right text-sm font-medium text-foreground">{(h.reach/1000).toFixed(0)}K</TableCell>
                <TableCell className="text-right">
                  <span className={`text-sm font-semibold ${h.rate >= 40 ? "text-emerald-400" : h.rate >= 25 ? "text-amber-400" : "text-muted-foreground"}`}>{h.rate}%</span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{h.sentAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);

  const statsTop = [
    { label: "Push Notifications (30d)", value: "5",    icon: Bell,          color: "text-violet-400" },
    { label: "SMS Sent (30d)",            value: "62K",  icon: Smartphone,    color: "text-blue-400"   },
    { label: "WhatsApp Broadcasts",       value: "3",    icon: MessageSquare, color: "text-emerald-400"},
    { label: "Email Campaigns",           value: "4",    icon: Mail,          color: "text-amber-400"  },
    { label: "Total Reach (30d)",         value: "433K", icon: Users,         color: "text-pink-400"   },
    { label: "Avg. Open Rate",            value: "43.6%",icon: Eye,           color: "text-cyan-400"   },
    { label: "Active Campaigns",          value: `${campaigns.filter((c)=>c.status==="Active").length}`, icon: Megaphone, color: "text-amber-400" },
    { label: "Conversions (30d)",         value: "1.2K", icon: TrendingUp,    color: "text-emerald-400"},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Marketing & Campaigns</h1>
        <p className="text-muted-foreground text-sm mt-1">Send Push, SMS, WhatsApp & Email broadcasts to all users. Full Super Admin access.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {statsTop.map((s) => (
          <Card key={s.label} className="bg-card border-border col-span-1 lg:col-span-2 sm:col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground leading-tight">{s.label}</span>
                <s.icon className={`w-3.5 h-3.5 flex-shrink-0 ${s.color}`} />
              </div>
              <div className="text-xl font-bold text-foreground">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="push">
        <TabsList className="bg-muted/50 border border-border flex-wrap h-auto gap-1 p-1">
          {[
            { value: "push",      label: "Push",      icon: Bell           },
            { value: "sms",       label: "SMS",        icon: Smartphone     },
            { value: "whatsapp",  label: "WhatsApp",   icon: MessageSquare  },
            { value: "email",     label: "Email",      icon: Mail           },
            { value: "campaigns", label: "Campaigns",  icon: Megaphone      },
            { value: "history",   label: "History",    icon: BarChart2      },
          ].map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm flex items-center gap-1.5">
              <tab.icon className="w-3.5 h-3.5" /> {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="push"      className="mt-4"><PushTab /></TabsContent>
        <TabsContent value="sms"       className="mt-4"><SmsTab /></TabsContent>
        <TabsContent value="whatsapp"  className="mt-4"><WhatsAppTab /></TabsContent>
        <TabsContent value="email"     className="mt-4"><EmailTab /></TabsContent>
        <TabsContent value="campaigns" className="mt-4"><CampaignsTab campaigns={campaigns} setCampaigns={setCampaigns} /></TabsContent>
        <TabsContent value="history"   className="mt-4"><HistoryTable /></TabsContent>
      </Tabs>
    </div>
  );
}
