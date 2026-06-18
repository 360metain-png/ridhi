/**
 * In-App Purchase (IAP) module using RevenueCat Purchases SDK.
 * Handles subscriptions and coin packs on iOS via Apple App Store.
 *
 * Apple requires ALL digital goods (subscriptions, coins, virtual gifts)
 * to be purchased through Apple IAP. External payment gateways (CashFree,
 * PhonePe, Instamojo) are only permitted for physical goods.
 *
 * RevenueCat abstracts the native StoreKit API for iOS and Google Play
 * Billing for Android, so we can use the same code for both platforms.
 */

import { Platform } from "react-native";

let Purchases: any = null;

/* Lazy-load the native SDK only on mobile platforms.
   On web, the module is unavailable and all IAP calls become no-ops. */
if (Platform.OS !== "web") {
  try {
    Purchases = require("react-native-purchases").default;
  } catch {
    Purchases = null;
  }
}

/* RevenueCat API key (public, safe to embed).
   Get this from your RevenueCat dashboard for project “Ridhi”.
   https://app.revenuecat.com */
const REVENUECAT_API_KEY_IOS = process.env["EXPO_PUBLIC_REVENUECAT_IOS_KEY"] || "";
const REVENUECAT_API_KEY_ANDROID = process.env["EXPO_PUBLIC_REVENUECAT_ANDROID_KEY"] || "";

/* RevenueCat offering identifiers — must match the keys set in the
   RevenueCat dashboard exactly. */
const OFFERINGS = {
  vip: "vip_subscriptions",
  coins: "coin_packs",
  creator: "creator_pass",
} as const;

let isConfigured = false;

/**
 * Configure the RevenueCat SDK with the platform-specific API key.
 * Call once during app startup (e.g. in AppProvider or a useEffect).
 */
export async function configureIap(): Promise<void> {
  if (Purchases === null || isConfigured) return;

  const apiKey = Platform.OS === "ios" ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
  if (!apiKey) {
    console.warn("[IAP] RevenueCat API key not configured. IAP is disabled.");
    return;
  }

  Purchases.configure({ apiKey });
  isConfigured = true;
}

/** Whether IAP is available on this platform. */
export function isIapAvailable(): boolean {
  return Purchases !== null && Platform.OS !== "web";
}

/**
 * Fetch available offerings from RevenueCat.
 * Returns an object with the packages available for each offering.
 */
export async function getOfferings(): Promise<{
  vipPackages: IapPackage[];
  coinPackages: IapPackage[];
  creatorPackages: IapPackage[];
} | null> {
  if (!isIapAvailable()) return null;

  try {
    const offerings = await Purchases.getOfferings();
    const all = offerings.all || {};

    return {
      vipPackages: extractPackages(all[OFFERINGS.vip]),
      coinPackages: extractPackages(all[OFFERINGS.coins]),
      creatorPackages: extractPackages(all[OFFERINGS.creator]),
    };
  } catch (err) {
    console.error("[IAP] getOfferings failed:", err);
    return null;
  }
}

/**
 * Purchase a package. RevenueCat handles the native purchase sheet,
   receipt validation, and entitlements automatically.
 */
export async function purchasePackage(pkg: IapPackage): Promise<{
  success: boolean;
  customerInfo?: any;
  error?: string;
}> {
  if (!isIapAvailable()) {
    return { success: false, error: "IAP not available on this platform" };
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: true, customerInfo };
  } catch (err: any) {
    if (err.userCancelled) {
      return { success: false, error: "User cancelled" };
    }
    return { success: false, error: err.message || "Purchase failed" };
  }
}

/**
 * Restore previous purchases. Required for App Store review
 * (and good UX) — users must be able to restore on a new device.
 */
export async function restorePurchases(): Promise<{
  success: boolean;
  customerInfo?: any;
  error?: string;
}> {
  if (!isIapAvailable()) {
    return { success: false, error: "IAP not available on this platform" };
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    return { success: true, customerInfo };
  } catch (err: any) {
    return { success: false, error: err.message || "Restore failed" };
  }
}

/**
 * Get current customer info (entitlements, active subscriptions).
 * Useful on app start to check if the user still has an active VIP plan.
 */
export async function getCustomerInfo(): Promise<any | null> {
  if (!isIapAvailable()) return null;

  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

/* ── Types ─────────────────────────────────────────────────────────────────── */

export interface IapPackage {
  identifier: string;
  packageType: string;
  product: IapProduct;
  offeringIdentifier: string;
}

export interface IapProduct {
  identifier: string;
  description: string;
  title: string;
  price: number;
  priceString: string;
  currencyCode: string;
  subscriptionPeriod?: string;
  introPrice?: IapIntroPrice | null;
}

export interface IapIntroPrice {
  price: number;
  priceString: string;
  period: string;
  cycles: number;
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function extractPackages(offering: any): IapPackage[] {
  if (!offering || !offering.availablePackages) return [];
  return offering.availablePackages as IapPackage[];
}
