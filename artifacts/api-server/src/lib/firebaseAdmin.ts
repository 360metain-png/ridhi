/**
 * Firebase Admin SDK — Phone OTP Verification
 *
 * The mobile client uses Firebase Auth client SDK (signInWithPhoneNumber)
 * to send/receive the OTP. Once verified client-side, the client receives
 * a Firebase ID token. It sends that token here, and the backend
 * verifies it with the Admin SDK.
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS env var pointing to a
 * service-account JSON file.
 */

import { logger } from "./logger";

let authInstance: any = null;
let initAttempted = false;

async function ensureAuth() {
  if (authInstance) return authInstance;
  if (initAttempted) return null;
  initAttempted = true;

  const keyPath = process.env["GOOGLE_APPLICATION_CREDENTIALS"];
  if (!keyPath) {
    logger.warn("GOOGLE_APPLICATION_CREDENTIALS not set — Firebase OTP unavailable");
    return null;
  }

  try {
    const { initializeApp, credential } = await import("firebase-admin");
    const app = initializeApp(
      { credential: credential.cert(keyPath) },
      "ridhi-otp",
    );
    authInstance = app.auth();
    logger.info("Firebase Admin initialised for OTP verification");
    return authInstance;
  } catch (err) {
    logger.error({ err }, "Firebase Admin init failed");
    return null;
  }
}

/**
 * Verify a Firebase ID token.
 * Returns the decoded token (including phone_number) on success.
 */
export async function verifyFirebaseIdToken(
  idToken: string,
): Promise<
  | { ok: true; uid: string; phone?: string; decoded: any }
  | { ok: false; error: string }
> {
  const auth = await ensureAuth();
  if (!auth) return { ok: false, error: "Firebase Admin not configured" };

  try {
    const decoded = await auth.verifyIdToken(idToken, true);
    return {
      ok: true,
      uid: decoded.uid,
      phone: decoded.phone_number,
      decoded,
    };
  } catch (err: any) {
    logger.warn({ err: err.message }, "Firebase ID token verification failed");
    return { ok: false, error: err.message || "Invalid token" };
  }
}

export function isFirebaseConfigured(): boolean {
  return !!process.env["GOOGLE_APPLICATION_CREDENTIALS"];
}
