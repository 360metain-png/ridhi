# Threat Model

## Project Overview

Ridhi is a public-facing social networking and dating application deployed on Replit. The production deployment serves three distinct surfaces: the Expo/React Native client at `/`, an Express API at `/api`, and a React-based admin artifact at `/admin/`. The current backend is broader than the earlier baseline and now includes OTP auth, user profiles and feed data, chat and friend-request flows, KYC submission and review, payment initiation and verification, download logging, call matching and call-control websockets, and admin JWT authentication.

A large portion of end-user identity, wallet, subscription, and premium-feature state is still maintained client-side in local storage or AsyncStorage rather than in durable server-side records. That makes trust-boundary mistakes between browser/mobile state and server-recognized authority the dominant production risk.

## Assets

- **User identity claims** — phone numbers, email addresses, OTP codes, JWTs, and any profile identity established during onboarding.
- **Highly sensitive KYC data** — Aadhaar numbers, PAN numbers, bank information, document images, review notes, and approval status.
- **Paid entitlements and virtual currency** — subscriptions, coin balances, boosts, brand registration, creator perks, download rights, and other monetized features.
- **Payment integrity** — payment order creation, provider verification, callback handling, and any client flow that treats a payment as completed.
- **Call-session privacy and availability** — active-call metadata, websocket session identity, call-control events, and coin-rate state for live calls.
- **Admin-only operational views** — privileged configuration, admin management, moderation data, KYC review surfaces, and internal observability.
- **Application secrets and infrastructure details** — environment variables, payment credentials, analytics secrets, database URLs, and other configuration that would increase attack surface if exposed.

## Trust Boundaries

- **Public client to API** — all `/api` requests originate from an untrusted client. Request bodies, headers, query parameters, and path parameters must be treated as attacker-controlled.
- **Client-local state to trusted business logic** — the mobile/web app stores user, wallet, subscription, premium, and some verification-related state locally. Any feature that treats that local state as authoritative crosses a critical trust boundary.
- **Public websocket client to call-control backend** — `/ws/calls` is a public realtime entry point. Any user ID, call ID, or action provided over that channel must be bound to a server-authenticated identity before it can control a live session.
- **API to payment provider** — the server creates and verifies provider orders using secrets. Payment success must come from server-side cryptographic validation or trusted provider status checks, not from client-visible callbacks or client assertions.
- **Public to admin surface** — `/admin/` is publicly served. Access control for privileged admin operations must be enforced by trusted backend JWT verification rather than browser state alone.
- **Production vs dev/demo behavior** — demo OTPs, test providers, mock data, and fallback flows are only acceptable if they are unreachable in production. Any production-reachable fallback that returns secrets, bypasses verification, or grants authority is in scope.

## Scan Anchors

- **Production entry points**: `artifacts/ridhi/app`, `artifacts/ridhi/components`, `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/routes/*.ts`, `artifacts/admin/src/App.tsx`, `artifacts/admin/src/lib/*.ts`
- **Highest-risk code areas**: `artifacts/api-server/src/routes/auth.ts`, `artifacts/api-server/src/lib/auth.ts`, `artifacts/api-server/src/routes/payments.ts`, `artifacts/ridhi/components/PaymentSheet.tsx`, `artifacts/ridhi/contexts/AuthContext.tsx`, `artifacts/api-server/src/routes/users.ts`, `artifacts/api-server/src/routes/kyc.ts`, `artifacts/api-server/src/routes/calls.ts`
- **Public vs authenticated surfaces**:
  - `/api/auth/*`, `/api/feed`, `/api/users`, `/api/users/:id`, `/api/posts/:id/comments`, `/api/calls/*`, and `/api/payments/config` have public reachability.
  - User-protected routes rely on bearer JWTs issued from OTP verification.
  - Admin-protected routes now rely on backend JWT verification via `/api/admin/me`; the earlier client-side-only admin auth issue is fixed.
  - `/ws/calls` is publicly reachable and should be treated like an unauthenticated remote-control boundary unless token checks are added.
- **Usually ignore unless reachability changes**: `artifacts/mockup-sandbox`, build scripts, static mock data with no server-trusted effect, and configuration endpoints that expose only blank placeholder fields or non-sensitive provider availability.

## Threat Categories

### Spoofing

OTP weaknesses are reportable when they mint a server-trusted identity or otherwise unlock a protected backend capability. Demo or fallback OTP paths that return the code to the client and then issue a JWT are in scope because they cross the server trust boundary.

Latent authentication weaknesses that require an unverified deployment misconfiguration should not be re-proposed unless the live deployment shows that the risky path is actually active.

### Tampering

The highest-risk tampering class remains monetization integrity. Wallet balances, subscription tiers, premium unlocks, and download rights must not be derived from client-maintained state or attacker-triggerable payment callbacks. All paid grants must come from durable server-side records tied to verified payments.

### Information Disclosure

Public user-profile routes, KYC status/data routes, call-state routes, and any admin-facing API can expose sensitive data if they return raw backend objects or decrypted fields. Real secrets, phone numbers, identity documents, banking data, websocket identifiers, and privileged moderation/admin metadata are in scope.

Anonymous configuration reads are only reportable when they expose real secrets or privileged operational content, not merely blank fields or low-sensitivity provider availability.

### Denial of Service

Public OTP, payment, and realtime call surfaces are reachable without network-level gating. These flows must avoid attacker-triggerable fallback modes, unbounded polling surfaces, and unauthenticated control messages that can terminate or interfere with live sessions.

### Elevation of Privilege

Any privileged surface must enforce authorization in a trusted backend. The current admin UI now verifies a backend JWT before rendering protected routes, so the older client-side-only `/admin` exposure should remain treated as fixed unless that verification boundary regresses.

The main elevation risks in the current build are backend IDORs, client-authoritative monetization state that upgrades a user into paid roles or features, and any callback or websocket path that accepts attacker-chosen identifiers without binding them to the authenticated subject.