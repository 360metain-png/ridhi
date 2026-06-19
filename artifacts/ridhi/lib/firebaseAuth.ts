/**
 * Firebase Auth (Web SDK) — Phone OTP + Email Link for Expo / React Native
 *
 * Phone: Uses signInWithPhoneNumber (reCAPTCHA flow).
 * Email:  Uses sendSignInLinkToEmail (passwordless magic link).
 *
 * The user must set EXPO_PUBLIC_FIREBASE_API_KEY and related env vars
 * for Firebase to be available.
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithPhoneNumber,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  type ConfirmationResult,
  type Auth,
  type ActionCodeSettings,
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

// ═══════════════════════════════════════════════════════════════════════════════
//  PHONE OTP
// ═══════════════════════════════════════════════════════════════════════════════

/** Send OTP via Firebase Phone Auth. Returns a ConfirmationResult to verify later. */
export async function sendFirebaseOtp(
  phoneNumber: string,
): Promise<{ ok: true; confirmationResult: ConfirmationResult } | { ok: false; error: string }> {
  const { auth, ready } = ensureFirebase();
  if (!ready || !auth) {
    return { ok: false, error: "Firebase not configured. Set EXPO_PUBLIC_FIREBASE_API_KEY." };
  }

  try {
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

/** Module-level store for ConfirmationResult (not serializable as URL param) */
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

// ═══════════════════════════════════════════════════════════════════════════════
//  EMAIL LINK (Passwordless)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Send a Firebase passwordless sign-in link to the user's email.
 * The user clicks the link in their email, which opens the app and completes sign-in.
 */
export async function sendFirebaseEmailLink(
  email: string,
  continueUrl: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { auth, ready } = ensureFirebase();
  if (!ready || !auth) {
    return { ok: false, error: "Firebase not configured. Set EXPO_PUBLIC_FIREBASE_API_KEY." };
  }

  const actionCodeSettings: ActionCodeSettings = {
    url: continueUrl,
    handleCodeInApp: true,
  };

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    // Persist email locally so we can complete sign-in after the user clicks the link
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("ridhiEmailForSignIn", email);
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to send email link" };
  }
}

/**
 * Check if the current URL is a Firebase email sign-in link.
 * Call this on app launch (e.g. in the email-link handler screen).
 */
export function isFirebaseEmailLink(url: string): boolean {
  const { auth } = ensureFirebase();
  if (!auth) return false;
  return isSignInWithEmailLink(auth, url);
}

/**
 * Complete sign-in with the email link. Returns a Firebase ID token.
 */
export async function completeFirebaseEmailLinkSignIn(
  email: string,
  link: string,
): Promise<{ ok: true; idToken: string } | { ok: false; error: string }> {
  const { auth, ready } = ensureFirebase();
  if (!ready || !auth) {
    return { ok: false, error: "Firebase not configured" };
  }

  try {
    const credential = await signInWithEmailLink(auth, email, link);
    if (!credential.user) {
      return { ok: false, error: "Sign-in failed — no user returned" };
    }
    const idToken = await credential.user.getIdToken(true);
    return { ok: true, idToken };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Invalid or expired email link" };
  }
}

/** Get the stored email for sign-in (saved before sending the link). */
export function getStoredEmailForSignIn(): string | null {
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem("ridhiEmailForSignIn");
  }
  return null;
}

export function clearStoredEmailForSignIn() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("ridhiEmailForSignIn");
  }
}
