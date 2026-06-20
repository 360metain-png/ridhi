---
name: Friend Request System
description: Full user-to-user friend request system for Ridhi app with free chat after accepting
---

# Friend Request System

**Architecture:**
- `lib/db/src/schema/friend_requests.ts` — Drizzle schema for `friend_requests` table (senderId, receiverId, status: pending/accepted/rejected/cancelled)
- `artifacts/api-server/src/routes/friend_requests.ts` — REST endpoints:
  - `POST /api/friend-requests/send` — send request (prevents duplicates)
  - `POST /api/friend-requests/:id/accept` — accept (auto-creates conversation row)
  - `POST /api/friend-requests/:id/reject` — reject
  - `POST /api/friend-requests/:id/cancel` — cancel sent request
  - `GET /api/friend-requests/pending` — received pending requests
  - `GET /api/friend-requests/sent` — sent pending requests
  - `GET /api/friends` — all accepted friends
  - `GET /api/friends/check/:userId` — check friendship status
  - `POST /api/friends/:userId/remove` — remove friend
- `artifacts/ridhi/app/friend-requests.tsx` — Friends screen with 3 tabs: Received / Sent / Friends
- `artifacts/ridhi/app/(tabs)/chat.tsx` — Added "Friends" tab alongside Direct and Groups
- `artifacts/ridhi/app/explore.tsx` — Added "+ Friend" button on suggested users
- `artifacts/ridhi/app/(tabs)/match.tsx` — Added "Add Friend" button on match overlay
- `artifacts/ridhi/app/notifications.tsx` — Added `friend_request` type to notifications
- `artifacts/ridhi/data/analytics.ts` — Added `friend_requests` to ScreenName union
- `artifacts/ridhi/data/mockData.ts` — Added mock friend request notifications

**Why:** Users need a way to connect beyond dating swipes and public following. Friend requests create a dedicated friendship channel with free chat.

**How to apply:** When adding new friend-related UI anywhere, always check `GET /api/friends/check/:id` first to show the correct button state (Add Friend / Pending / Already Friends).
