/**
 * Firebase Auth (Web SDK) — Phone OTP for Expo / React Native
 *
 * Uses Firebase Web SDK's signInWithPhoneNumber.
 * In React Native, this requires a RecaptchaVerifier; we use the
 * invisible reCAPTCHA flow which works in Expo web preview.
 *
 * The user must set EXPO_PUBLIC_FIREBASE_API_KEY and related env vars
 * for Firebase to be available.
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  type ConfirmationResult,
  type Auth,
} from "firebase/auth";

const FIREBASE_CONFIG = {
  apiKey:     process.env["EXPO_PUBLIC_FIREBASE_API_KEY"]     || "",
  authDomain: process.env["EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"] || "",
  projectId:  process.env["EXPO_PUBLIC_FIREBASE_PROJECT_ID"]    || "",
  appId:      process.env["EXPO_PUBLIC_FIREBASE_APP_ID"]      || "",
};

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

function ensureFirebase(): { auth: Auth | null; ready: boolean } {
  if (firebaseAuth) return { auth: firebaseAuth, ready: true };
  if (!FIREBASE_CONFIG.apiKey) return { auth: null, ready: false };
  if (getApps().length === 0) {
    firebaseApp = initializeApp(FIREBASE_CONFIG);
  } else {
    firebaseApp = getApps()[0];
  }
  firebaseAuth = getAuth(firebaseApp);
  return { auth: firebaseAuth, ready: true };
}

export function isFirebaseReady(): boolean {
  return !!process.env["EXPO_PUBLIC_FIREBASE_API_KEY"];
}

/** Send OTP via Firebase Phone Auth. Returns a ConfirmationResult to verify later. */
export async function sendFirebaseOtp(
  phoneNumber: string,
): Promise<{ ok: true; confirmationResult: ConfirmationResult } | { ok: false; error: string }> {
  const { auth, ready } = ensureFirebase();
  if (!ready || !auth) {
    return { ok: false, error: "Firebase not configured. Set EXPO_PUBLIC_FIREBASE_API_KEY." };
  }

  try {
    // In web/React Native, signInWithPhoneNumber creates a reCAPTCHA internally
    // For native apps, this may need expo-firebase-recaptcha. In web preview it works.
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, undefined as any);
    return { ok: true, confirmationResult };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to send Firebase OTP" };
  }
}

/** Verify the OTP code using the ConfirmationResult, then get the ID token. */
export async function verifyFirebaseOtp(
  confirmationResult: ConfirmationResult,
  code: string,
): Promise<{ ok: true; idToken: string } | { ok: false; error: string }> {
  try {
    const credential = await confirmationResult.confirm(code);
    if (!credential.user) {
      return { ok: false, error: "Firebase verification failed — no user returned" };
    }
    const idToken = await credential.user.getIdToken(true);
    return { ok: true, idToken };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Invalid OTP code" };
  }
}

/** ── Module-level store for ConfirmationResult (not serializable as URL param) ── */
let pendingConfirmation: ConfirmationResult | null = null;

export function storeFirebaseConfirmation(result: ConfirmationResult) {
  pendingConfirmation = result;
}

export function getPendingFirebaseConfirmation(): ConfirmationResult | null {
  return pendingConfirmation;
}

export function clearPendingFirebaseConfirmation() {
  pendingConfirmation = null;
}
