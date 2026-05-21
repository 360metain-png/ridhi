# Threat Model

## Project Overview

Ridhi is a public-facing social networking and dating application deployed on Replit. The production deployment serves three distinct surfaces: the Expo/React Native web/mobile artifact at `/`, an Express API at `/api`, and a React-based admin artifact at `/admin/`. The current backend is small and only exposes health, OTP auth, and Razorpay payment routes; most end-user identity, wallet, and subscription state is presently maintained client-side in local storage/AsyncStorage rather than in server-side records.

## Assets

- **User identity claims** — phone numbers, email addresses, OTP codes, and any profile identity established during onboarding. If these are spoofed, users can be impersonated inside the app experience.
- **Paid entitlements and virtual currency** — subscriptions, boosts, wallet balances, and creator-related perks. These represent monetized features and must not be grantable without verified payment.
- **Payment integrity** — Razorpay order creation and payment verification flows. If payment success can be forged, users can obtain paid access or currency without paying.
- **Application secrets and infrastructure details** — environment variables, payment keys, database URLs, and operational topology. Exposure would materially increase attack surface if any real values are shipped to clients.
- **Admin-only operational views** — any control-panel functionality or backend observability intended for privileged operators.

## Trust Boundaries

- **Public client to API** — all `/api` requests cross from an untrusted client into the Express server. Request bodies, query parameters, and any client-provided flags must be treated as attacker-controlled.
- **Client-local state to trusted business logic** — the mobile/web app stores user, wallet, and subscription state in AsyncStorage/local state. Any feature that treats this client-maintained state as authoritative crosses a critical trust boundary.
- **API to payment provider** — the server creates and verifies Razorpay transactions using secret keys. Payment outcomes must be derived from server-side verification, not client assertions.
- **Public to admin surface** — `/admin/` is publicly served. If it is intended to be privileged, access control must be enforced by a trusted backend rather than browser state.
- **Production vs dev/demo behavior** — several flows include demo or mock behaviors. Because the deployment is public, any fallback that remains enabled in production must be assumed attacker-reachable.

## Scan Anchors

- **Production entry points**: `artifacts/ridhi/app`, `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/routes/*.ts`, `artifacts/admin/src/App.tsx`
- **Highest-risk code areas**: `artifacts/api-server/src/routes/auth.ts`, `artifacts/api-server/src/routes/payments.ts`, `artifacts/ridhi/components/PaymentSheet.tsx`, `artifacts/ridhi/contexts/AuthContext.tsx`, `artifacts/ridhi/app/wallet.tsx`, `artifacts/ridhi/app/subscription.tsx`
- **Public vs authenticated surfaces**: `/api/*` is publicly reachable; current app “authentication” is largely client-side; `/admin/` is publicly reachable but appears mostly mock/local-state
- **Usually ignore unless reachability changes**: `artifacts/mockup-sandbox`, build scripts, placeholder/mock-data-only pages with no trusted backend effect

## Threat Categories

### Spoofing

The application offers OTP-based login, but the current architecture does not establish server-side sessions or persistent user records. The system must ensure that any production authentication path does not fall back to attacker-observable demo codes and that successful verification results in a server-trusted identity before protecting data or capabilities.

For scan triage in the current build, OTP weaknesses should be reported when they unlock a server-trusted identity, protected backend data, or a non-local capability. If a weakness only affects local UI state in the mock-heavy client and does not cross a trusted backend boundary, treat it as below the reporting threshold unless reachability changes.

### Tampering

The largest current risk is client-side control over monetized state. Wallet balances, subscription plans, boosts, and similar entitlements must not be created, upgraded, or consumed solely from client-maintained state or client-reported payment outcomes. All paid feature grants must be derived from server-side verification and durable server-side records.

### Information Disclosure

Because `/admin/` is publicly served, any real infrastructure details, secrets, or privileged operational data embedded in that bundle would be exposed to any visitor. The project must ensure that production client artifacts never ship real credentials, internal topology, or privileged observability data.

### Denial of Service

Public OTP and payment endpoints are reachable without authentication. These flows must bound request volume and avoid attacker-triggerable fallback modes that can be abused to spam third-party services or exhaust provider quotas.

### Elevation of Privilege

Any privileged surface, especially `/admin/`, must enforce authorization in a trusted backend rather than relying on localStorage, hidden routes, or client-side role flags. Likewise, payment verification must not trust client-supplied flags or other user-controlled assertions that can elevate a non-paying user into a paid role.