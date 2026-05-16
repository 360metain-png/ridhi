import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Appearance, useColorScheme } from "react-native";

export type Language = {
  code: string;
  name: string;
  nativeName: string;
};

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
];

interface AppContextValue {
  theme: "light" | "dark" | "system";
  setTheme: (t: "light" | "dark" | "system") => void;
  activeTheme: "light" | "dark";
  language: Language;
  setLanguage: (l: Language) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
  pushEnabled: boolean;
  setPushEnabled: (v: boolean) => void;
  matchNotifEnabled: boolean;
  setMatchNotifEnabled: (v: boolean) => void;
  coinNotifEnabled: boolean;
  setCoinNotifEnabled: (v: boolean) => void;
  profilePublic: boolean;
  setProfilePublic: (v: boolean) => void;
  showOnline: boolean;
  setShowOnline: (v: boolean) => void;
  locationShared: boolean;
  setLocationShared: (v: boolean) => void;
  twoFAEnabled: boolean;
  setTwoFAEnabled: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<"light" | "dark" | "system">("system");
  const [language, setLanguageState] = useState<Language>(LANGUAGES[0]);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
  const [pushEnabled, setPushEnabledState] = useState(true);
  const [matchNotifEnabled, setMatchNotifEnabledState] = useState(true);
  const [coinNotifEnabled, setCoinNotifEnabledState] = useState(true);
  const [profilePublic, setProfilePublicState] = useState(true);
  const [showOnline, setShowOnlineState] = useState(true);
  const [locationShared, setLocationSharedState] = useState(true);
  const [twoFAEnabled, setTwoFAEnabledState] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("ridhi_app_settings").then((data) => {
      if (data) {
        const s = JSON.parse(data);
        if (s.theme) setThemeState(s.theme);
        if (s.language) setLanguageState(s.language);
        if (s.notificationsEnabled !== undefined) setNotificationsEnabledState(s.notificationsEnabled);
        if (s.pushEnabled !== undefined) setPushEnabledState(s.pushEnabled);
        if (s.matchNotifEnabled !== undefined) setMatchNotifEnabledState(s.matchNotifEnabled);
        if (s.coinNotifEnabled !== undefined) setCoinNotifEnabledState(s.coinNotifEnabled);
        if (s.profilePublic !== undefined) setProfilePublicState(s.profilePublic);
        if (s.showOnline !== undefined) setShowOnlineState(s.showOnline);
        if (s.locationShared !== undefined) setLocationSharedState(s.locationShared);
        if (s.twoFAEnabled !== undefined) setTwoFAEnabledState(s.twoFAEnabled);
      }
    });
  }, []);

  const save = (patch: Record<string, unknown>) => {
    AsyncStorage.getItem("ridhi_app_settings").then((data) => {
      const current = data ? JSON.parse(data) : {};
      AsyncStorage.setItem("ridhi_app_settings", JSON.stringify({ ...current, ...patch }));
    });
  };

  const setTheme = useCallback((t: "light" | "dark" | "system") => {
    setThemeState(t);
    save({ theme: t });
    // Drive the native color scheme so useColorScheme() picks it up everywhere
    Appearance.setColorScheme(t === "system" ? null : t);
  }, []);

  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l);
    save({ language: l });
  }, []);

  const setNotificationsEnabled = useCallback((v: boolean) => { setNotificationsEnabledState(v); save({ notificationsEnabled: v }); }, []);
  const setPushEnabled = useCallback((v: boolean) => { setPushEnabledState(v); save({ pushEnabled: v }); }, []);
  const setMatchNotifEnabled = useCallback((v: boolean) => { setMatchNotifEnabledState(v); save({ matchNotifEnabled: v }); }, []);
  const setCoinNotifEnabled = useCallback((v: boolean) => { setCoinNotifEnabledState(v); save({ coinNotifEnabled: v }); }, []);
  const setProfilePublic = useCallback((v: boolean) => { setProfilePublicState(v); save({ profilePublic: v }); }, []);
  const setShowOnline = useCallback((v: boolean) => { setShowOnlineState(v); save({ showOnline: v }); }, []);
  const setLocationShared = useCallback((v: boolean) => { setLocationSharedState(v); save({ locationShared: v }); }, []);
  const setTwoFAEnabled = useCallback((v: boolean) => { setTwoFAEnabledState(v); save({ twoFAEnabled: v }); }, []);

  const activeTheme: "light" | "dark" = theme === "system" ? (systemScheme ?? "light") : theme;

  return (
    <AppContext.Provider
      value={{
        theme, setTheme, activeTheme,
        language, setLanguage,
        notificationsEnabled, setNotificationsEnabled,
        pushEnabled, setPushEnabled,
        matchNotifEnabled, setMatchNotifEnabled,
        coinNotifEnabled, setCoinNotifEnabled,
        profilePublic, setProfilePublic,
        showOnline, setShowOnline,
        locationShared, setLocationShared,
        twoFAEnabled, setTwoFAEnabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
