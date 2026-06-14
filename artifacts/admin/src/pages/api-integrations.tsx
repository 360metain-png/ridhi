import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { downloadCSV } from "@/lib/utils";
import {
  CheckCircle, XCircle, AlertTriangle, Eye, EyeOff, Copy, RefreshCw,
  Zap, CreditCard, MessageSquare, Bell, Cloud, Mail, Cpu, Map,
  BarChart2, Video, ShieldCheck, Save, TestTube, Plug, Activity, Smartphone,
  ExternalLink, ChevronDown, ChevronUp, Download, Search, CircleDot,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────
type ConnStatus = "connected" | "error" | "disconnected" | "testing";
type Env = "sandbox" | "production";

interface ApiField {
  key: string;
  label: string;
  placeholder: string;
  secret: boolean;
  value: string;
  hint?: string;
}

interface ServiceConfig {
  id: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  docsUrl: string;
  status: ConnStatus;
  env: Env;
  enabled: boolean;
  lastTested: string;
  fields: ApiField[];
  extraSettings?: { key: string; label: string; type: "toggle" | "text" | "select"; value: string | boolean; options?: string[] }[];
}

// ── Config state ──────────────────────────────────────────────────────────
const INITIAL_SERVICES: ServiceConfig[] = [
  // ── LIVE / RTC ────────────────────────────────────────────────────────
  {
    id: "agora",
    name: "Agora RTC",
    provider: "Agora",
    category: "live",
    description: "Real-time audio & video calling",
    docsUrl: "https://docs.agora.io",
    status: "connected",
    env: "production",
    enabled: true,
    lastTested: "2 min ago",
    fields: [
      { key: "appId",      label: "App ID",         placeholder: "a1b2c3d4e5f6…",    secret: false, value: "a8f3••••••••••••••2c9" },
      { key: "appCert",    label: "App Certificate", placeholder: "Certificate…",     secret: true,  value: "cert_••••••••••••••••••" },
      { key: "tokenServer",label: "Token Server URL", placeholder: "https://…",       secret: false, value: "https://token.ridhi.app/agora" },
    ],
    extraSettings: [
      { key: "recordingEnabled",   label: "Cloud Recording",   type: "toggle", value: true  },
      { key: "transcodeEnabled",   label: "Video Transcode",   type: "toggle", value: true  },
      { key: "maxChannelDuration", label: "Max Channel (min)", type: "text",   value: "120" },
    ],
  },
  {
    id: "zegocloud",
    name: "ZEGOCLOUD",
    provider: "ZEGOCLOUD",
    category: "live",
    description: "Live streaming infrastructure",
    docsUrl: "https://docs.zegocloud.com",
    status: "connected",
    env: "production",
    enabled: true,
    lastTested: "15 min ago",
    fields: [
      { key: "appId",     label: "App ID",     placeholder: "1234567890",       secret: false, value: "1234••••90" },
      { key: "serverKey", label: "Server Key", placeholder: "Server secret…",   secret: true,  value: "skey_••••••••••••••••" },
    ],
    extraSettings: [
      { key: "maxConcurrentRooms", label: "Max Concurrent Rooms", type: "text", value: "500" },
      { key: "roomExpiry",         label: "Room Expiry (hrs)",    type: "text", value: "6"   },
    ],
  },
  {
    id: "twilio-video",
    name: "Twilio Video",
    provider: "Twilio",
    category: "live",
    description: "Fallback video SDK for group video calls",
    docsUrl: "https://www.twilio.com/docs/video",
    status: "disconnected",
    env: "sandbox",
    enabled: false,
    lastTested: "Never",
    fields: [
      { key: "accountSid", label: "Account SID",   placeholder: "AC…",    secret: false, value: "" },
      { key: "authToken",  label: "Auth Token",    placeholder: "Token…", secret: true,  value: "" },
      { key: "apiKey",     label: "API Key SID",   placeholder: "SK…",    secret: false, value: "" },
      { key: "apiSecret",  label: "API Key Secret",placeholder: "Secret…",secret: true,  value: "" },
    ],
  },
  {
    id: "100ms",
    name: "100ms",
    provider: "100ms",
    category: "live",
    description: "WebRTC live streaming rooms",
    docsUrl: "https://www.100ms.live/docs",
    status: "connected",
    env: "production",
    enabled: true,
    lastTested: "Just now",
    fields: [
      { key: "appId",     label: "App ID",         placeholder: "HM…",       secret: false, value: "" },
      { key: "appToken",  label: "Management Token",placeholder: "Secret…",  secret: true,  value: "" },
      { key: "authToken", label: "Auth Token",      placeholder: "Token…",   secret: true,  value: "" },
    ],
    extraSettings: [
      { key: "maxPeers",      label: "Max Peers / Room",     type: "text",   value: "100" },
      { key: "enableScreenshare", label: "Screen Sharing",   type: "toggle", value: true },
      { key: "enableRecording",   label: "Cloud Recording",  type: "toggle", value: true },
    ],
  },

  // ── PAYMENTS ─────────────────────────────────────────────────────────
  {
    id: "razorpay",
    name: "Razorpay",
    provider: "Razorpay",
    category: "payments",
    description: "UPI, cards, net banking, wallets (India)",
    docsUrl: "https://razorpay.com/docs",
    status: "connected",
    env: "production",
    enabled: true,
    lastTested: "5 min ago",
    fields: [
      { key: "keyId",     label: "Key ID",     placeholder: "rzp_live_…",   secret: false, value: "rzp_live_••••••K7xQ" },
      { key: "keySecret", label: "Key Secret", placeholder: "Secret…",      secret: true,  value: "rzp_sec_••••••••••••" },
      { key: "webhookSecret", label: "Webhook Secret", placeholder: "wh_…", secret: true,  value: "wh_••••••••••••••••",
        hint: "Used to verify Razorpay webhook signatures" },
    ],
    extraSettings: [
      { key: "autoCapture",     label: "Auto-capture Payments", type: "toggle", value: true  },
      { key: "upiEnabled",      label: "UPI Enabled",           type: "toggle", value: true  },
      { key: "refundMode",      label: "Refund Mode",           type: "select", value: "instant", options: ["instant", "normal"] },
      { key: "currency",        label: "Currency",              type: "select", value: "INR",     options: ["INR", "USD"]        },
    ],
  },
  {
    id: "cashfree",
    name: "Cashfree Payments",
    provider: "Cashfree",
    category: "payments",
    description: "Alternate payouts & VPA verification",
    docsUrl: "https://docs.cashfree.com",
    status: "connected",
    env: "production",
    enabled: true,
    lastTested: "1h ago",
    fields: [
      { key: "clientId",     label: "Client ID",     placeholder: "CF_…",     secret: false, value: "CF_••••••••xYz9" },
      { key: "clientSecret", label: "Client Secret", placeholder: "Secret…",  secret: true,  value: "cs_••••••••••••••••" },
    ],
    extraSettings: [
      { key: "payoutEnabled", label: "Instant Payouts", type: "toggle", value: true },
    ],
  },
  {
    id: "stripe",
    name: "Stripe",
    provider: "Stripe",
    category: "payments",
    description: "International payments (USD, EUR)",
    docsUrl: "https://stripe.com/docs",
    status: "disconnected",
    env: "sandbox",
    enabled: false,
    lastTested: "Never",
    fields: [
      { key: "publishableKey", label: "Publishable Key", placeholder: "pk_live_…", secret: false, value: "" },
      { key: "secretKey",      label: "Secret Key",      placeholder: "sk_live_…", secret: true,  value: "" },
      { key: "webhookSecret",  label: "Webhook Secret",  placeholder: "whsec_…",   secret: true,  value: "" },
    ],
  },

  // ── SMS / OTP ─────────────────────────────────────────────────────────
  {
    id: "msg91",
    name: "MSG91",
    provider: "MSG91",
    category: "sms",
    description: "OTP, SMS & WhatsApp (India)",
    docsUrl: "https://docs.msg91.com",
    status: "connected",
    env: "production",
    enabled: true,
    lastTested: "Just now",
    fields: [
      { key: "authKey",           label: "Auth Key",           placeholder: "Auth key…",         secret: true,  value: "msg91_••••••••••••••••" },
      { key: "otpTemplateId",     label: "OTP Template ID",    placeholder: "Template ID…",      secret: false, value: "6456••••••••••3412" },
      { key: "promoTemplateId",   label: "Promo Template ID",  placeholder: "Template ID…",      secret: false, value: "7891••••••••••5634",
        hint: "Promotional bulk SMS" },
      { key: "senderId",          label: "Sender ID",          placeholder: "RIDHI",             secret: false, value: "RIDHI" },
    ],
    extraSettings: [
      { key: "dndEnabled",    label: "Respect DND",         type: "toggle", value: true  },
      { key: "unicode",       label: "Unicode (Hindi/Regional)", type: "toggle", value: true  },
      { key: "otpExpiry",     label: "OTP Expiry (min)",    type: "text",   value: "10"  },
      { key: "otpRetryLimit", label: "OTP Retry Limit",     type: "text",   value: "3"   },
    ],
  },
  {
    id: "twilio-sms",
    name: "Twilio SMS",
    provider: "Twilio",
    category: "sms",
    description: "International SMS fallback",
    docsUrl: "https://www.twilio.com/docs/sms",
    status: "connected",
    env: "production",
    enabled: true,
    lastTested: "3h ago",
    fields: [
      { key: "accountSid", label: "Account SID",  placeholder: "AC…",    secret: false, value: "AC••••••••••••••••9f" },
      { key: "authToken",  label: "Auth Token",   placeholder: "Token…", secret: true,  value: "auth_••••••••••••••••" },
      { key: "fromNumber", label: "From Number",  placeholder: "+1…",    secret: false, value: "+1 415 ••• ••••" },
    ],
  },

  // ── WHATSAPP ─────────────────────────────────────────────────────────
  {
    id: "whatsapp-msg91",
    name: "WhatsApp Business",
    provider: "MSG91",
    category: "whatsapp",
    description: "WhatsApp OTP & promo via MSG91",
    docsUrl: "https://msg91.com/whatsapp",
    status: "connected",
    env: "production",
    enabled: true,
    lastTested: "10 min ago",
    fields: [
      { key: "integratedNumber",  label: "Integrated Number",  placeholder: "+91…",            secret: false, value: "+91 9876••••••" },
      { key: "authKey",           label: "Auth Key",           placeholder: "Same as MSG91…",  secret: true,  value: "msg91_••••••••••••••••",
        hint: "Reuse from SMS config" },
      { key: "otpTemplateId",     label: "WA OTP Template",    placeholder: "Template ID…",    secret: false, value: "wa_otp_••••••••" },
      { key: "promoTemplateId",   label: "WA Promo Template",  placeholder: "Template ID…",    secret: false, value: "wa_promo_••••" },
    ],
    extraSettings: [
      { key: "fallbackToSms", label: "Fallback to SMS if WA fails", type: "toggle", value: true },
    ],
  },
  {
    id: "whatsapp-meta",
    name: "WhatsApp Business API",
    provider: "Meta",
    category: "whatsapp",
    description: "Direct Meta Cloud API",
    docsUrl: "https://developers.facebook.com/docs/whatsapp",
    status: "disconnected",
    env: "sandbox",
    enabled: false,
    lastTested: "Never",
    fields: [
      { key: "phoneNumberId",  label: "Phone Number ID",    placeholder: "…",             secret: false, value: "" },
      { key: "wabaId",         label: "WABA ID",            placeholder: "…",             secret: false, value: "" },
      { key: "accessToken",    label: "System User Token",  placeholder: "EAAxx…",        secret: true,  value: "" },
      { key: "webhookToken",   label: "Webhook Verify Token",placeholder: "…",           secret: true,  value: "" },
    ],
  },

  // ── PUSH NOTIFICATIONS ───────────────────────────────────────────────
  {
    id: "fcm",
    name: "Firebase Cloud Messaging",
    provider: "Google Firebase",
    category: "push",
    description: "Push notifications for Android & iOS",
    docsUrl: "https://firebase.google.com/docs/cloud-messaging",
    status: "connected",
    env: "production",
    enabled: true,
    lastTested: "1 min ago",
    fields: [
      { key: "projectId",       label: "Project ID",        placeholder: "ridhi-app",      secret: false, value: "ridhi-production" },
      { key: "serviceAccountKey", label: "Service Account JSON", placeholder: "Paste JSON…", secret: true, value: "{\"type\":\"service_account\",\"••••\":\"••••\"}" },
      { key: "apiKey",          label: "Web API Key",        placeholder: "AIza…",          secret: false, value: "AIza••••••••••••Mx9" },
    ],
    extraSettings: [
      { key: "soundEnabled",     label: "Sound on Notification", type: "toggle", value: true  },
      { key: "badgeEnabled",     label: "Badge Count",           type: "toggle", value: true  },
      { key: "analyticsEnabled", label: "FCM Analytics",         type: "toggle", value: true  },
    ],
  },
  {
    id: "onesignal",
    name: "OneSignal",
    provider: "OneSignal",
    category: "push",
    description: "Backup push with segmentation & A/B",
    docsUrl: "https://documentation.onesignal.com",
    status: "disconnected",
    env: "sandbox",
    enabled: false,
    lastTested: "Never",
    fields: [
      { key: "appId",  label: "App ID",  placeholder: "…", secret: false, value: "" },
      { key: "apiKey", label: "REST API Key", placeholder: "…", secret: true, value: "" },
    ],
  },

  // ── STORAGE / CDN ────────────────────────────────────────────────────
  {
    id: "aws-s3",
    name: "AWS S3 + CloudFront",
    provider: "Amazon Web Services",
    category: "storage",
    description: "Media storage & CDN",
    docsUrl: "https://aws.amazon.com/s3",
    status: "connected",
    env: "production",
    enabled: true,
    lastTested: "20 min ago",
    fields: [
      { key: "accessKeyId",     label: "Access Key ID",      placeholder: "AKIA…",              secret: false, value: "AKIA••••••••••••WXYZ" },
      { key: "secretAccessKey", label: "Secret Access Key",  placeholder: "Secret…",            secret: true,  value: "aws_sec_••••••••••••••••••••" },
      { key: "region",          label: "AWS Region",         placeholder: "ap-south-1",         secret: false, value: "ap-south-1" },
      { key: "bucketName",      label: "S3 Bucket Name",     placeholder: "ridhi-media-prod",   secret: false, value: "ridhi-media-prod" },
      { key: "cdnDomain",       label: "CloudFront Domain",  placeholder: "d1xxx.cloudfront.net",secret:false, value: "d1a2b3c4.cloudfront.net" },
    ],
    extraSettings: [
      { key: "maxUploadMB",    label: "Max Upload Size (MB)",  type: "text",   value: "500"  },
      { key: "videoTranscode", label: "Auto-transcode Videos", type: "toggle", value: true   },
      { key: "imageCdn",       label: "Image Resizing via CDN",type: "toggle", value: true   },
    ],
  },
  {
    id: "cloudinary",
    name: "Cloudinary",
    provider: "Cloudinary",
    category: "storage",
    description: "Image & video optimization",
    docsUrl: "https://cloudinary.com/documentation",
    status: "connected",
    env: "production",
    enabled: true,
    lastTested: "1h ago",
    fields: [
      { key: "cloudName",  label: "Cloud Name",  placeholder: "ridhi",     secret: false, value: "ridhi-app" },
      { key: "apiKey",     label: "API Key",     placeholder: "Key…",      secret: false, value: "8734••••••••••9812" },
      { key: "apiSecret",  label: "API Secret",  placeholder: "Secret…",   secret: true,  value: "cld_sec_••••••••••••••" },
    ],
  },

  // ── EMAIL ────────────────────────────────────────────────────────────
  {
    id: "sendgrid",
    name: "SendGrid",
    provider: "Twilio SendGrid",
    category: "email",
    description: "Transactional email",
    docsUrl: "https://docs.sendgrid.com",
    status: "connected",
    env: "production",
    enabled: true,
    lastTested: "30 min ago",
    fields: [
      { key: "apiKey",      label: "API Key",     placeholder: "SG.…",          secret: true,  value: "SG.••••••••••••••••••••" },
      { key: "fromEmail",   label: "From Email",  placeholder: "no-reply@…",    secret: false, value: "no-reply@ridhi.app" },
      { key: "fromName",    label: "From Name",   placeholder: "Ridhi",         secret: false, value: "Ridhi" },
    ],
    extraSettings: [
      { key: "clickTracking", label: "Click Tracking", type: "toggle", value: true  },
      { key: "openTracking",  label: "Open Tracking",  type: "toggle", value: true  },
    ],
  },

  // ── AI / CONTENT MODERATION ──────────────────────────────────────────
  {
    id: "openai",
    name: "OpenAI",
    provider: "OpenAI",
    category: "ai",
    description: "AI moderation & matching",
    docsUrl: "https://platform.openai.com/docs",
    status: "connected",
    env: "production",
    enabled: true,
    lastTested: "45 sec ago",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "sk-…", secret: true, value: "sk-•••••••••••••••••••••••••••••••" },
      { key: "orgId",  label: "Org ID",  placeholder: "org-…",secret: false, value: "org-ridhi-••••••••" },
    ],
    extraSettings: [
      { key: "moderationEnabled",  label: "Auto Content Moderation", type: "toggle", value: true   },
      { key: "defaultModel",       label: "Default Model",           type: "select", value: "gpt-4o-mini", options: ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"] },
      { key: "maxTokens",          label: "Max Tokens/Request",      type: "text",   value: "2048" },
    ],
  },
  {
    id: "aws-rekognition",
    name: "AWS Rekognition",
    provider: "Amazon Web Services",
    category: "ai",
    description: "Image & video moderation",
    docsUrl: "https://aws.amazon.com/rekognition",
    status: "connected",
    env: "production",
    enabled: true,
    lastTested: "5 min ago",
    fields: [
      { key: "accessKeyId",     label: "Access Key ID",     placeholder: "AKIA…",  secret: false, value: "AKIA••••••••••••RKGN" },
      { key: "secretAccessKey", label: "Secret Access Key", placeholder: "…",      secret: true,  value: "rkg_sec_••••••••••••••••" },
      { key: "region",          label: "Region",            placeholder: "ap-south-1", secret: false, value: "ap-south-1" },
    ],
    extraSettings: [
      { key: "minConfidence",  label: "Min. Confidence %", type: "text",   value: "75" },
      { key: "autoRemove",     label: "Auto-remove Flagged", type: "toggle", value: false },
    ],
  },

  // ── MAPS ─────────────────────────────────────────────────────────────
  {
    id: "google-maps",
    name: "Google Maps",
    provider: "Google",
    category: "maps",
    description: "Nearby users & city search",
    docsUrl: "https://developers.google.com/maps",
    status: "connected",
    env: "production",
    enabled: true,
    lastTested: "2h ago",
    fields: [
      { key: "apiKey",     label: "API Key",      placeholder: "AIza…",      secret: true,  value: "AIza••••••••••••Maps" },
      { key: "mapsId",     label: "Maps ID",      placeholder: "Map ID…",    secret: false, value: "ridhi_map_id_••••" },
    ],
    extraSettings: [
      { key: "placeAutocomplete", label: "Place Autocomplete",  type: "toggle", value: true },
      { key: "geoCoding",         label: "Reverse Geocoding",   type: "toggle", value: true },
    ],
  },

  // ── ANALYTICS ────────────────────────────────────────────────────────
  {
    id: "firebase-analytics",
    name: "Firebase Analytics",
    provider: "Google Firebase",
    category: "analytics",
    description: "Screen views, events, funnels",
    docsUrl: "https://firebase.google.com/docs/analytics",
    status: "connected",
    env: "production",
    enabled: true,
    lastTested: "Connected",
    fields: [
      { key: "measurementId", label: "Measurement ID", placeholder: "G-…", secret: false, value: "G-RIDHI••••" },
      { key: "appId",         label: "Firebase App ID",placeholder: "1:…", secret: false, value: "1:••••:android:••••" },
    ],
    extraSettings: [
      { key: "crashlyticsEnabled", label: "Crashlytics",    type: "toggle", value: true  },
      { key: "performanceEnabled", label: "Performance Mon",type: "toggle", value: true  },
    ],
  },
  {
    id: "mixpanel",
    name: "Mixpanel",
    provider: "Mixpanel",
    category: "analytics",
    description: "Cohorts & feature adoption",
    docsUrl: "https://developer.mixpanel.com",
    status: "disconnected",
    env: "sandbox",
    enabled: false,
    lastTested: "Never",
    fields: [
      { key: "projectToken", label: "Project Token", placeholder: "…", secret: false, value: "" },
      { key: "apiSecret",    label: "API Secret",    placeholder: "…", secret: true,  value: "" },
    ],
  },
];

// ── Category definitions ──────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",       label: "All",               icon: Plug },
  { id: "live",      label: "Live / RTC",        icon: Video  },
  { id: "payments",  label: "Payments",          icon: CreditCard },
  { id: "sms",       label: "SMS / OTP",         icon: MessageSquare },
  { id: "whatsapp",  label: "WhatsApp",          icon: Smartphone },
  { id: "push",      label: "Push",              icon: Bell },
  { id: "storage",   label: "Storage",           icon: Cloud },
  { id: "email",     label: "Email",             icon: Mail },
  { id: "ai",        label: "AI / Moderation",   icon: Cpu },
  { id: "maps",      label: "Maps",              icon: Map },
  { id: "analytics", label: "Analytics",         icon: BarChart2 },
];

const STATUS_META: Record<ConnStatus, { label: string; color: string; bg: string; dot: string }> = {
  connected:    { label: "Connected", color: "text-green-700",  bg: "bg-green-50",  dot: "#22c55e" },
  error:        { label: "Error",     color: "text-red-700",    bg: "bg-red-50",    dot: "#ef4444" },
  disconnected: { label: "Offline",   color: "text-slate-600",  bg: "bg-slate-100", dot: "#94a3b8" },
  testing:      { label: "Testing", color: "text-blue-700",   bg: "bg-blue-50",   dot: "#3b82f6" },
};

const ENV_META: Record<Env, { label: string; color: string; bg: string }> = {
  production: { label: "Production", color: "text-orange-700", bg: "bg-orange-50" },
  sandbox:    { label: "Sandbox",    color: "text-blue-700",   bg: "bg-blue-50" },
};

// ── Helpers ──────────────────────────────────────────────────────────────
function useHiddenFields() {
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const toggle = (fieldKey: string) => setHidden((h) => ({ ...h, [fieldKey]: !h[fieldKey] }));
  return { hidden, toggle };
}

export default function ApiIntegrationsPage() {
  const [services, setServices] = useState<ServiceConfig[]>(INITIAL_SERVICES);
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { hidden, toggle } = useHiddenFields();

  const filtered = useMemo(() => services.filter((svc) => {
    const matchCat = activeCategory === "all" || svc.category === activeCategory;
    const matchSearch = !search ||
      svc.name.toLowerCase().includes(search.toLowerCase()) ||
      svc.provider.toLowerCase().includes(search.toLowerCase()) ||
      svc.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [services, activeCategory, search]);

  const stats = useMemo(() => ({
    connected: services.filter((s) => s.status === "connected").length,
    enabled: services.filter((s) => s.enabled).length,
    disconnected: services.filter((s) => s.status === "disconnected").length,
    errored: services.filter((s) => s.status === "error").length,
  }), [services]);

  function toggleEnabled(id: string) {
    setServices((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));
  }
  function toggleEnv(id: string) {
    setServices((prev) => prev.map((s) => s.id === id ? { ...s, env: s.env === "production" ? "sandbox" : "production" } : s));
  }
  function updateField(id: string, fieldKey: string, value: string) {
    setServices((prev) => prev.map((s) => s.id === id ? { ...s, fields: s.fields.map((f) => f.key === fieldKey ? { ...f, value } : f) } : s));
  }
  function updateSetting(id: string, key: string, value: string | boolean) {
    setServices((prev) => prev.map((s) => s.id === id ? { ...s, extraSettings: s.extraSettings?.map((st) => st.key === key ? { ...st, value } : st) } : s));
  }
  function testConnection(id: string) {
    setTesting(id);
    setTimeout(() => setTesting(null), 1500);
  }
  function saveService(id: string) {
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2000);
  }
  function exportCSV() {
    const rows = services.map((s) => ({
      Name: s.name,
      Provider: s.provider,
      Category: s.category,
      Status: s.status,
      Environment: s.env,
      Enabled: s.enabled ? "Yes" : "No",
      "Last Tested": s.lastTested,
    }));
    downloadCSV("ridhi-api-integrations.csv", rows);
  }

  return (
    <div className="space-y-5 p-4 md:p-6">
      {/* ══════════════════════════════════════════════════════════════
          HEADER — clean, stacked, mobile-first
          ══════════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Plug className="w-6 h-6 text-purple-600" />
            API Integrations
          </h1>
          <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs gap-1">
            <ShieldCheck className="w-3 h-3" /> Super Admin
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Configure keys, credentials, and settings for all external integrations.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SEARCH + EXPORT — full-width bar, large touch
          ══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm border rounded-lg pl-9 pr-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1 h-10 px-3" onClick={exportCSV}>
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          HEALTH OVERVIEW — 2x2 grid, large cards
          ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Connected",    value: stats.connected,    icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
          { label: "Enabled",      value: stats.enabled,      icon: Zap,         color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Offline",      value: stats.disconnected, icon: XCircle,     color: "text-slate-500", bg: "bg-slate-100" },
          { label: "Errors",       value: stats.errored,      icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
        ].map((s) => (
          <Card key={s.label} className="border">
            <div className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          CATEGORY FILTERS — horizontal scroll, large pills
          ══════════════════════════════════════════════════════════════ */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const count = cat.id === "all"
            ? services.length
            : services.filter((s) => s.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border whitespace-nowrap flex-shrink-0 transition-colors min-h-[44px] ${
                activeCategory === cat.id
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white border-gray-200 text-slate-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
              <span className={`text-xs font-bold ml-0.5 ${activeCategory === cat.id ? "text-purple-200" : "text-slate-400"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SERVICE CARDS — mobile-first stack layout
          ══════════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        {filtered.map((svc) => {
          const isExpanded = expandedId === svc.id;
          const status = STATUS_META[svc.status];
          const env = ENV_META[svc.env];
          const catMeta = CATEGORIES.find((c) => c.id === svc.category);
          const CatIcon = catMeta?.icon ?? Plug;

          return (
            <Card key={svc.id} className={`border overflow-hidden ${svc.status === "error" ? "border-red-300" : ""}`}>

              {/* ── Card Header (stacked on mobile, row on desktop) ── */}
              <div
                className="cursor-pointer select-none"
                onClick={() => setExpandedId(isExpanded ? null : svc.id)}
              >
                {/* Mobile: stacked */}
                <div className="flex items-start gap-3 p-4 md:items-center md:gap-4">
                  {/* Icon */}
                  <div className={`p-2.5 rounded-xl border flex-shrink-0 ${status.bg}`}>
                    <CatIcon className={`w-5 h-5 ${status.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{svc.name}</span>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${env.bg} ${env.color}`}>
                        <CircleDot className="w-2 h-2" style={{ color: env.color.replace("text-", "") === "orange-700" ? "#f97316" : "#3b82f6" }} />
                        {env.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{svc.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`inline-flex items-center gap-1 text-xs`}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: status.dot }} />
                        <span className={status.color}>{status.label}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">· Tested {svc.lastTested}</span>
                    </div>
                  </div>

                  {/* Right side toggle */}
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Switch checked={svc.enabled} onCheckedChange={() => toggleEnabled(svc.id)} />
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>
              </div>

              {/* ── Expanded panel ── */}
              {isExpanded && (
                <div className="border-t px-4 py-5 space-y-6">

                  {/* Environment toggle */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/60 border">
                      <span className={`text-sm font-semibold ${svc.env === "sandbox" ? "text-blue-600" : "text-muted-foreground"}`}>Sandbox</span>
                      <Switch
                        checked={svc.env === "production"}
                        onCheckedChange={() => toggleEnv(svc.id)}
                      />
                      <span className={`text-sm font-semibold ${svc.env === "production" ? "text-orange-600" : "text-muted-foreground"}`}>Production</span>
                    </div>
                    {svc.env === "production" && (
                      <span className="inline-flex items-center gap-1 text-xs text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                        <AlertTriangle className="w-3 h-3" /> Live keys
                      </span>
                    )}
                    <a
                      href={svc.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 text-sm text-purple-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Docs
                    </a>
                  </div>

                  {/* API Credentials */}
                  <div className="space-y-4">
                    <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">API Credentials</p>
                    <div className="space-y-4">
                      {svc.fields.map((field) => (
                        <div key={field.key}>
                          <div className="flex items-center justify-between mb-1.5">
                            <Label className="text-sm font-medium">{field.label}</Label>
                            {field.hint && (
                              <span className="text-xs text-muted-foreground">{field.hint}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type={hidden[field.key] ? "text" : (field.secret ? "password" : "text")}
                              value={field.value}
                              placeholder={field.placeholder}
                              onChange={(e) => updateField(svc.id, field.key, e.target.value)}
                              className="text-sm h-10 flex-1"
                            />
                            {field.secret && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 flex-shrink-0"
                                onClick={() => toggle(field.key)}
                              >
                                {hidden[field.key] ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 flex-shrink-0"
                              onClick={() => navigator.clipboard?.writeText(field.value)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Service Settings */}
                  {svc.extraSettings && svc.extraSettings.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Service Settings</p>
                      <div className="space-y-3">
                        {svc.extraSettings.map((setting) => (
                          <div key={setting.key} className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border">
                            <span className="text-sm font-medium">{setting.label}</span>
                            {setting.type === "toggle" && (
                              <Switch
                                checked={setting.value as boolean}
                                onCheckedChange={(v) => updateSetting(svc.id, setting.key, v)}
                              />
                            )}
                            {setting.type === "text" && (
                              <Input
                                className="w-28 h-9 text-sm text-right"
                                value={setting.value as string}
                                onChange={(e) => updateSetting(svc.id, setting.key, e.target.value)}
                              />
                            )}
                            {setting.type === "select" && (
                              <select
                                value={setting.value as string}
                                onChange={(e) => updateSetting(svc.id, setting.key, e.target.value)}
                                className="h-9 border rounded-lg px-3 text-sm bg-background"
                              >
                                {setting.options?.map((opt) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-3 border-t flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-10 gap-1.5 text-sm ${testing === svc.id ? "text-blue-600 border-blue-200" : ""}`}
                      disabled={testing === svc.id}
                      onClick={() => testConnection(svc.id)}
                    >
                      {testing === svc.id
                        ? <><RefreshCw className="w-4 h-4 animate-spin" /> Testing…</>
                        : <><TestTube className="w-4 h-4" /> Test Connection</>}
                    </Button>
                    <Button
                      size="sm"
                      className={`h-10 gap-1.5 text-sm ${savedId === svc.id ? "bg-green-600 hover:bg-green-700" : "bg-purple-600 hover:bg-purple-700"} text-white`}
                      onClick={() => saveService(svc.id)}
                    >
                      {savedId === svc.id
                        ? <><CheckCircle className="w-4 h-4" /> Saved!</>
                        : <><Save className="w-4 h-4" /> Save Changes</>}
                    </Button>
                    <div className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Activity className="w-4 h-4" />
                      {svc.lastTested}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
