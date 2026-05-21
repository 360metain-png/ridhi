import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle, XCircle, AlertTriangle, Eye, EyeOff, Copy, RefreshCw,
  Zap, CreditCard, MessageSquare, Bell, Cloud, Mail, Cpu, Map,
  BarChart2, Radio, Phone, Video, ShieldCheck, Settings2, Save,
  TestTube, Plug, Activity, Lock, Smartphone, Globe, Wifi,
  Key, Play, PauseCircle, ExternalLink, ChevronDown, ChevronUp,
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
    description: "Real-time audio & video calling — used for 1:1 calls, group calls, and live streams",
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
    description: "Live streaming infrastructure — used for public live room broadcasts",
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

  // ── PAYMENTS ─────────────────────────────────────────────────────────
  {
    id: "razorpay",
    name: "Razorpay",
    provider: "Razorpay",
    category: "payments",
    description: "Primary payment gateway — UPI, cards, net banking, wallets, EMI (India)",
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
    description: "Alternate gateway for payouts, split payments, and VPA verification",
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
    description: "International payments for non-Indian users (USD, EUR, etc.)",
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
    description: "OTP delivery, transactional SMS, and WhatsApp messaging (India)",
    docsUrl: "https://docs.msg91.com",
    status: "connected",
    env: "production",
    enabled: true,
    lastTested: "Just now",
    fields: [
      { key: "authKey",           label: "Auth Key",           placeholder: "Auth key…",         secret: true,  value: "msg91_••••••••••••••••" },
      { key: "otpTemplateId",     label: "OTP Template ID",    placeholder: "Template ID…",      secret: false, value: "6456••••••••••3412" },
      { key: "promoTemplateId",   label: "Promo Template ID",  placeholder: "Template ID…",      secret: false, value: "7891••••••••••5634",
        hint: "Used for promotional bulk SMS campaigns" },
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
    description: "International SMS fallback for non-Indian phone numbers",
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
    name: "WhatsApp Business (MSG91)",
    provider: "MSG91",
    category: "whatsapp",
    description: "WhatsApp OTP, referral messages, promo broadcasts via MSG91 integrated number",
    docsUrl: "https://msg91.com/whatsapp",
    status: "connected",
    env: "production",
    enabled: true,
    lastTested: "10 min ago",
    fields: [
      { key: "integratedNumber",  label: "Integrated Number",  placeholder: "+91…",            secret: false, value: "+91 9876••••••" },
      { key: "authKey",           label: "Auth Key",           placeholder: "Same as MSG91…",  secret: true,  value: "msg91_••••••••••••••••",
        hint: "Same MSG91 auth key — reuse from SMS config" },
      { key: "otpTemplateId",     label: "WA OTP Template",    placeholder: "Template ID…",    secret: false, value: "wa_otp_••••••••" },
      { key: "promoTemplateId",   label: "WA Promo Template",  placeholder: "Template ID…",    secret: false, value: "wa_promo_••••" },
    ],
    extraSettings: [
      { key: "fallbackToSms", label: "Fallback to SMS if WA fails", type: "toggle", value: true },
    ],
  },
  {
    id: "whatsapp-meta",
    name: "WhatsApp Business API (Meta)",
    provider: "Meta",
    category: "whatsapp",
    description: "Direct Meta Cloud API — for high-volume or custom template messaging",
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
    description: "Push notifications for Android & iOS — feeds, likes, new matches, messages",
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
    description: "Backup push notification service with advanced segmentation & A/B testing",
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
    description: "Media storage — profile photos, post images, video uploads, audio files",
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
    description: "Image transformation and video delivery optimization",
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
    description: "Transactional email — OTP fallback, welcome emails, receipts, alerts",
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
    description: "AI content moderation, smart matching suggestions, chat auto-replies",
    docsUrl: "https://platform.openai.com/docs",
    status: "connected",
    env: "production",
    enabled: true,
    lastTested: "45 sec ago",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "sk-…", secret: true, value: "sk-••••••••••••••••••••••••" },
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
    description: "Image & video content moderation — nudity, violence, unsafe content detection",
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
      { key: "autoRemove",     label: "Auto-remove Flagged Content", type: "toggle", value: false },
    ],
  },

  // ── MAPS ─────────────────────────────────────────────────────────────
  {
    id: "google-maps",
    name: "Google Maps",
    provider: "Google",
    category: "maps",
    description: "Location-based features — nearby users, city search, job location, meet-up spots",
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
    description: "User behaviour analytics — screen views, events, funnels, retention",
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
    description: "Product analytics — cohort analysis, feature adoption, A/B test results",
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
  { id: "all",       label: "All Services",     icon: Plug },
  { id: "live",      label: "Live / RTC",        icon: Video  },
  { id: "payments",  label: "Payments",          icon: CreditCard },
  { id: "sms",       label: "SMS / OTP",         icon: MessageSquare },
  { id: "whatsapp",  label: "WhatsApp",          icon: Smartphone },
  { id: "push",      label: "Push Notifications",icon: Bell },
  { id: "storage",   label: "Storage / CDN",     icon: Cloud },
  { id: "email",     label: "Email",             icon: Mail },
  { id: "ai",        label: "AI & Moderation",   icon: Cpu },
  { id: "maps",      label: "Maps",              icon: Map },
  { id: "analytics", label: "Analytics",         icon: BarChart2 },
];

const STATUS_STYLE: Record<ConnStatus, string> = {
  connected:    "bg-green-100  text-green-700  border-green-200",
  error:        "bg-red-100    text-red-700    border-red-200",
  disconnected: "bg-muted      text-muted-foreground",
  testing:      "bg-blue-100   text-blue-700   border-blue-200",
};
const STATUS_ICON: Record<ConnStatus, React.ComponentType<{className?:string}>> = {
  connected:    CheckCircle,
  error:        XCircle,
  disconnected: PauseCircle,
  testing:      RefreshCw,
};

// ── Component ─────────────────────────────────────────────────────────────
export default function ApiIntegrationsPage() {
  const [services, setServices] = useState<ServiceConfig[]>(INITIAL_SERVICES);
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>("agora");
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const filtered = activeCategory === "all"
    ? services
    : services.filter((s) => s.category === activeCategory);

  const connected    = services.filter((s) => s.status === "connected").length;
  const disconnected = services.filter((s) => s.status === "disconnected").length;
  const errored      = services.filter((s) => s.status === "error").length;
  const enabled      = services.filter((s) => s.enabled).length;

  const updateField = (serviceId: string, fieldKey: string, value: string) =>
    setServices((prev) => prev.map((s) =>
      s.id !== serviceId ? s : {
        ...s,
        fields: s.fields.map((f) => f.key === fieldKey ? { ...f, value } : f),
      }
    ));

  const updateSetting = (serviceId: string, settingKey: string, value: string | boolean) =>
    setServices((prev) => prev.map((s) =>
      s.id !== serviceId ? s : {
        ...s,
        extraSettings: (s.extraSettings ?? []).map((st) =>
          st.key === settingKey ? { ...st, value } : st
        ),
      }
    ));

  const toggleEnabled = (serviceId: string) =>
    setServices((prev) => prev.map((s) =>
      s.id === serviceId ? { ...s, enabled: !s.enabled } : s
    ));

  const toggleEnv = (serviceId: string) =>
    setServices((prev) => prev.map((s) =>
      s.id === serviceId
        ? { ...s, env: s.env === "production" ? "sandbox" : "production" }
        : s
    ));

  const testConnection = (serviceId: string) => {
    setTesting(serviceId);
    setServices((prev) => prev.map((s) =>
      s.id === serviceId ? { ...s, status: "testing" } : s
    ));
    setTimeout(() => {
      setTesting(null);
      setServices((prev) => prev.map((s) =>
        s.id === serviceId
          ? { ...s, status: "connected", lastTested: "Just now" }
          : s
      ));
    }, 2000);
  };

  const saveService = (serviceId: string) => {
    setSavedId(serviceId);
    setTimeout(() => setSavedId(null), 2000);
  };

  const copyValue = (key: string, value: string) => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Plug className="w-6 h-6 text-primary" />
            3rd Party API Integrations
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Super Admin · Configure API keys, credentials, and service settings for every external integration
          </p>
        </div>
        <Badge className="gap-1.5 bg-purple-100 text-purple-700 border border-purple-200 text-xs">
          <ShieldCheck className="w-3 h-3" /> Super Admin Only
        </Badge>
      </div>

      {/* ── Health overview ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Connected",    value: connected,    icon: CheckCircle, color: "text-green-600 bg-green-50"  },
          { label: "Enabled",      value: enabled,      icon: Zap,         color: "text-purple-600 bg-purple-50"},
          { label: "Disconnected", value: disconnected, icon: PauseCircle, color: "text-muted-foreground bg-muted"},
          { label: "Errors",       value: errored,      icon: XCircle,     color: "text-red-600 bg-red-50"      },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="w-5 h-5" /></div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label} services</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Category filter pills ── */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const count = cat.id === "all"
            ? services.length
            : services.filter((s) => s.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:bg-muted"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
              <span className={`ml-0.5 font-bold ${activeCategory === cat.id ? "opacity-80" : "text-muted-foreground"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Service cards ── */}
      <div className="space-y-3">
        {filtered.map((svc) => {
          const isExpanded = expandedId === svc.id;
          const SIcon = STATUS_ICON[svc.status];
          const catMeta = CATEGORIES.find((c) => c.id === svc.category);
          const CatIcon = catMeta?.icon ?? Plug;

          return (
            <Card key={svc.id} className={`border transition-all ${svc.status === "error" ? "border-red-300" : ""}`}>

              {/* ── Service header row (always visible) ── */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer select-none"
                onClick={() => setExpandedId(isExpanded ? null : svc.id)}
              >
                {/* Icon */}
                <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
                  svc.status === "connected" ? "bg-green-50 border-green-200" :
                  svc.status === "error"     ? "bg-red-50 border-red-200"     :
                  "bg-muted border-border"
                }`}>
                  <CatIcon className={`w-5 h-5 ${
                    svc.status === "connected" ? "text-green-700" :
                    svc.status === "error"     ? "text-red-700"   :
                    "text-muted-foreground"
                  }`} />
                </div>

                {/* Name + desc */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm">{svc.name}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 h-4 text-muted-foreground">{svc.provider}</Badge>
                    <Badge variant="outline" className={`text-[10px] px-1.5 h-4 gap-1 border ${STATUS_STYLE[svc.status]}`}>
                      <SIcon className="w-2.5 h-2.5" />
                      {svc.status === "testing" ? "testing…" : svc.status}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] px-1.5 h-4 border ${
                      svc.env === "production"
                        ? "bg-orange-50 text-orange-700 border-orange-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}>
                      {svc.env}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{svc.description}</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs text-muted-foreground hidden md:block">Tested: {svc.lastTested}</span>
                  <Switch checked={svc.enabled} onCheckedChange={() => toggleEnabled(svc.id)} />
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              {/* ── Expanded config panel ── */}
              {isExpanded && (
                <div className="border-t mx-4 mb-4 pt-4 space-y-5">

                  {/* Env toggle + docs link */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/60 border">
                      <span className={`text-xs font-semibold ${svc.env === "sandbox" ? "text-blue-600" : "text-muted-foreground"}`}>Sandbox</span>
                      <Switch
                        checked={svc.env === "production"}
                        onCheckedChange={() => toggleEnv(svc.id)}
                      />
                      <span className={`text-xs font-semibold ${svc.env === "production" ? "text-orange-600" : "text-muted-foreground"}`}>Production</span>
                    </div>
                    {svc.env === "production" && (
                      <Badge variant="outline" className="text-xs bg-orange-50 border-orange-200 text-orange-700 gap-1">
                        <AlertTriangle className="w-3 h-3" /> Live keys — changes are immediate
                      </Badge>
                    )}
                    <a
                      href={svc.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1 text-xs text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" /> {svc.provider} Docs
                    </a>
                  </div>

                  {/* API key fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {svc.fields.map((field) => {
                      const visKey = `${svc.id}_${field.key}`;
                      const isVisible = visible[visKey] ?? false;
                      return (
                        <div key={field.key} className="space-y-1.5">
                          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                            {field.label}
                            {field.secret && <Lock className="w-3 h-3 text-muted-foreground" />}
                          </Label>
                          <div className="flex items-center gap-1.5">
                            <Input
                              type={field.secret && !isVisible ? "password" : "text"}
                              placeholder={field.placeholder}
                              value={field.value}
                              onChange={(e) => updateField(svc.id, field.key, e.target.value)}
                              className="font-mono text-xs flex-1"
                            />
                            {field.secret && (
                              <Button
                                variant="outline" size="sm"
                                className="h-9 w-9 p-0 flex-shrink-0"
                                onClick={() => setVisible((v) => ({ ...v, [visKey]: !isVisible }))}
                              >
                                {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </Button>
                            )}
                            <Button
                              variant="outline" size="sm"
                              className="h-9 w-9 p-0 flex-shrink-0"
                              onClick={() => copyValue(visKey, field.value)}
                            >
                              {copied === visKey
                                ? <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                                : <Copy className="w-3.5 h-3.5" />}
                            </Button>
                          </div>
                          {field.hint && <p className="text-[11px] text-muted-foreground">{field.hint}</p>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Extra settings */}
                  {svc.extraSettings && svc.extraSettings.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Service Settings</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {svc.extraSettings.map((setting) => (
                          <div key={setting.key} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border">
                            <div>
                              <p className="text-sm font-medium">{setting.label}</p>
                            </div>
                            {setting.type === "toggle" && (
                              <Switch
                                checked={setting.value as boolean}
                                onCheckedChange={(v) => updateSetting(svc.id, setting.key, v)}
                              />
                            )}
                            {setting.type === "text" && (
                              <Input
                                className="w-24 h-8 text-sm text-right"
                                value={setting.value as string}
                                onChange={(e) => updateSetting(svc.id, setting.key, e.target.value)}
                              />
                            )}
                            {setting.type === "select" && (
                              <select
                                value={setting.value as string}
                                onChange={(e) => updateSetting(svc.id, setting.key, e.target.value)}
                                className="h-8 border rounded-md px-2 text-sm bg-background"
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

                  {/* Action row */}
                  <div className="flex items-center gap-3 pt-2 border-t flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-8 gap-1.5 text-xs ${testing === svc.id ? "text-blue-600 border-blue-200" : ""}`}
                      disabled={testing === svc.id}
                      onClick={() => testConnection(svc.id)}
                    >
                      {testing === svc.id
                        ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Testing…</>
                        : <><TestTube className="w-3.5 h-3.5" />Test Connection</>}
                    </Button>
                    <Button
                      size="sm"
                      className={`h-8 gap-1.5 text-xs ${savedId === svc.id ? "bg-green-600 hover:bg-green-700" : "bg-gradient-to-r from-purple-600 to-pink-500 border-0"} text-white`}
                      onClick={() => saveService(svc.id)}
                    >
                      {savedId === svc.id
                        ? <><CheckCircle className="w-3.5 h-3.5" />Saved!</>
                        : <><Save className="w-3.5 h-3.5" />Save Changes</>}
                    </Button>
                    <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Activity className="w-3.5 h-3.5" />
                      Last tested: {svc.lastTested}
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
