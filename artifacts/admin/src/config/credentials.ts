const STORAGE_KEY = "ridhi_admin_credentials";

export interface AdminCredentials {
  super_admin: { email: string; password: string; name: string };
  admin:       { email: string; password: string; name: string };
}

const DEFAULTS: AdminCredentials = {
  super_admin: { email: "arjun@ridhi.app",       password: "Ridhi@SA2024",    name: "Arjun Mehta"  },
  admin:       { email: "admin.sneha@ridhi.app",  password: "Ridhi@Admin2024", name: "Sneha Kapoor" },
};

export function getCredentials(): AdminCredentials {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

export function saveCredentials(creds: AdminCredentials): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
}

export function validateLogin(role: "super_admin" | "admin", email: string, password: string): boolean {
  const creds = getCredentials();
  const c = creds[role];
  return email.trim().toLowerCase() === c.email.toLowerCase() && password === c.password;
}

export function getDefaultEmail(role: "super_admin" | "admin"): string {
  return getCredentials()[role].email;
}
