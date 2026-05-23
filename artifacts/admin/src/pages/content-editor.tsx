import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Save, RotateCcw, FileText, Shield, Info, HelpCircle,
  CheckCircle, AlertTriangle, ExternalLink
} from "lucide-react";

// ── Default content templates ──
const DEFAULTS = {
  privacy: `Ridhi is committed to protecting the privacy and security of its users. By accessing or using Ridhi services, you agree to the collection and use of information in accordance with this Privacy Policy.

If you do not agree with this policy, please discontinue use of the platform.

• Full name, username, mobile number, email address
• Date of birth, gender, profile photo
• Country, state, and city
• Government ID verification details (if applicable)
• Bio and profile information
• IP address, device model, operating system
• Content viewed and shared, likes, comments, follows
• Audio/video call activity, messaging activity
• Coins, gifting, and transactions

With your permission, Ridhi may collect precise or approximate location information to improve user experience, safety, recommendations, and regional content delivery.

Contact: hello@ridhi.app`,

  terms: `Welcome to Ridhi. These Terms & Conditions govern your access to and use of the Ridhi mobile application, website, products, features, content, and services operated by Krilo Digitech Pvt Ltd.

By accessing or using Ridhi, you agree to comply with and be legally bound by these Terms. If you do not agree, you must discontinue use of the platform immediately.

Ridhi is a social networking and community engagement platform that enables users to connect through messaging, audio calls, video calls, virtual gifting, entertainment, communities, creator interactions, and social features.

• You must be at least 18 years old to use Ridhi
• Each phone number can be linked to one Ridhi account
• You are responsible for maintaining the confidentiality of your account
• You agree not to post harmful, abusive, or illegal content
• Ridhi reserves the right to suspend or terminate accounts for violations

Contact: hello@ridhi.app`,

  about: `Ridhi — India's Social Universe

Ridhi is an India-first social networking and dating platform designed for authentic connections, creative expression, and community engagement. Built for Android & iOS with support for 13 Indian languages.

Our mission is to create a safe, inclusive, and vibrant space where people can connect, share, and grow together. From messaging and video calls to creator monetization and virtual gifting, Ridhi empowers every user to be a creator.

• Social Networking — profiles, followers, content sharing
• Audio & Video Calling — HD calls, random connect
• Creator Platform — fan engagement, virtual gifts, coins
• Communities — join interest-based groups
• Dating & Matching — discover and connect
• Multi-Language — 13 Indian languages supported

Company: Krilo Digitech Pvt Ltd
Website: https://ridhi.app/
Support: hello@ridhi.app`,

  help: `Frequently Asked Questions

How do I create a Ridhi account?
Download Ridhi from the App Store or Google Play, open it, and tap 'Sign Up'. Enter your mobile number, verify the OTP, and complete your profile setup.

I forgot my password. How do I reset it?
On the login screen tap 'Forgot Password', enter your registered phone number, and you'll receive an OTP to set a new password.

How do I change my phone number?
Go to Profile → Settings → Account → Change Phone Number. You'll need to verify your new number via OTP.

Can I have multiple accounts?
Each phone number can be linked to one Ridhi account. Multiple accounts from the same device are not permitted.

How do I report abusive users?
Use the "Report" button inside the app, block the user directly, or contact support at hello@ridhi.app.

How do I delete my account?
Go to Settings → Account → Delete Account. Or contact: hello@ridhi.app. Note: Account deletion may be permanent.

Why was my account suspended?
Accounts may be suspended for violating community guidelines, fake activity, harassment, spam, or illegal activities. To appeal: hello@ridhi.app`,

  contact: `hello@ridhi.app
+91 98765 43210
Krilo Digitech Pvt Ltd
Mumbai, Maharashtra, India`,
};

type ContentKey = keyof typeof DEFAULTS;

const STORAGE_KEY = "ridhi_cms_content";

function loadContent(): Record<ContentKey, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { ...DEFAULTS };
}

function saveContent(data: Record<ContentKey, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const TABS: { key: ContentKey; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { key: "privacy",    label: "Privacy Policy",     icon: Shield,     desc: "User-facing privacy policy displayed in the app" },
  { key: "terms",      label: "Terms & Conditions", icon: FileText,   desc: "Legal terms users agree to when signing up" },
  { key: "about",      label: "About Us",           icon: Info,       desc: "Platform description and company info" },
  { key: "help",       label: "Help & FAQ",         icon: HelpCircle, desc: "Frequently asked questions and answers" },
  { key: "contact",    label: "Contact Info",       icon: ExternalLink, desc: "Support email, phone, and address" },
];

export default function ContentEditor() {
  const [content, setContent] = useState<Record<ContentKey, string>>(loadContent);
  const [activeTab, setActiveTab] = useState<ContentKey>("privacy");
  const [saved, setSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("");

  useEffect(() => {
    const savedAt = localStorage.getItem("ridhi_cms_saved_at");
    if (savedAt) setLastSaved(new Date(savedAt).toLocaleString());
  }, []);

  const handleSave = () => {
    saveContent(content);
    const now = new Date().toISOString();
    localStorage.setItem("ridhi_cms_saved_at", now);
    setLastSaved(new Date(now).toLocaleString());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm("Reset ALL content to default? This cannot be undone.")) {
      setContent({ ...DEFAULTS });
      saveContent({ ...DEFAULTS });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const updateField = (key: ContentKey, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const dirty = JSON.stringify(content) !== JSON.stringify(loadContent());

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Content Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Edit platform content that appears in the mobile app and website
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle className="w-3 h-3" /> Saved
            </span>
          )}
          {dirty && !saved && (
            <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <AlertTriangle className="w-3 h-3" /> Unsaved changes
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" /> Reset All
          </Button>
          <Button size="sm" onClick={handleSave} className="gap-1.5">
            <Save className="w-3.5 h-3.5" /> Save Changes
          </Button>
        </div>
      </div>

      {lastSaved && (
        <p className="text-xs text-muted-foreground">Last saved: {lastSaved}</p>
      )}

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ContentKey)} className="w-full">
        <TabsList className="flex-wrap h-auto gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <TabsTrigger key={tab.key} value={tab.key} className="gap-1.5 text-xs">
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {TABS.map(tab => (
          <TabsContent key={tab.key} value={tab.key} className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <tab.icon className="w-4 h-4 text-primary" />
                  {tab.label}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{tab.desc}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Content</Label>
                  <Textarea
                    value={content[tab.key]}
                    onChange={(e) => updateField(tab.key, e.target.value)}
                    className="min-h-[320px] text-sm leading-relaxed font-mono"
                    placeholder={`Enter ${tab.label.toLowerCase()} content here...`}
                  />
                </div>

                {/* Live preview */}
                <div className="border rounded-lg p-4 bg-muted/20">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3" /> Live Preview
                  </p>
                  <div className="text-sm whitespace-pre-wrap text-foreground leading-relaxed max-h-48 overflow-y-auto">
                    {content[tab.key] || <span className="text-muted-foreground italic">No content yet...</span>}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Reset ${tab.label} to default?`)) {
                        updateField(tab.key, DEFAULTS[tab.key]);
                      }
                    }}
                  >
                    Reset to Default
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-3.5 h-3.5 mr-1.5" /> Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
