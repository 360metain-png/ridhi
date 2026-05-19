# Ridhi

Ridhi is an India-first social networking and dating mobile app — think ShareChat × Instagram × TikTok. Built for Android & iOS with Expo/React Native.

## Run & Operate

- `pnpm --filter @workspace/ridhi run dev` — run the Expo app (via workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- **Mobile**: Expo + React Native + TypeScript
- **Navigation**: Expo Router (file-based)
- **Styling**: StyleSheet + expo-linear-gradient, custom color tokens in `constants/colors.ts`
- **Fonts**: Inter (Google Fonts via @expo-google-fonts/inter)
- **State**: React Context (AuthContext, AppContext) + AsyncStorage persistence
- **API**: Express 5 (in artifacts/api-server)
- **DB**: PostgreSQL + Drizzle ORM

## Where things live

- `artifacts/ridhi/` — Expo mobile app
  - `app/` — Expo Router screens
    - `(tabs)/index.tsx` — Home Feed (stories, posts, reactions)
    - `(tabs)/reels.tsx` — Vertical reels/TikTok-style
    - `(tabs)/match.tsx` — Dating swipe (Tinder-style)
    - `(tabs)/chat.tsx` — Chat list
    - `(tabs)/profile.tsx` — User profile with quick links
    - `explore.tsx` — Search / trending hashtags / suggested users
    - `communities.tsx` — Browse & join communities
    - `settings.tsx` — App settings (theme, language, privacy, security)
    - `creator-dashboard.tsx` — Creator analytics, earnings, withdrawal
    - `create-post.tsx` — Post creation (text/photo/video/reel/story/poll)
    - `wallet.tsx` — Coin wallet & recharge
    - `notifications.tsx` — Notification center
    - `chat/[id].tsx` — Chat detail screen
    - `auth/` — Onboarding, login, OTP, profile setup
  - `contexts/AuthContext.tsx` — Auth state with AsyncStorage persistence
  - `contexts/AppContext.tsx` — Theme, language, notifications, privacy, security settings
  - `constants/colors.ts` — Light + dark color palette tokens
  - `data/mockData.ts` — Posts, stories, chats, matches, coins, notifications
  - `data/communities.ts` — Community mock data (10 communities, 10 categories)
  - `hooks/useColors.ts` — Returns the active color palette
  - `components/` — Avatar, CoinBadge, GradientButton, ErrorBoundary
  - `assets/images/ridhi_logo.png` — Official Ridhi logo (purple speech bubble + pink heart)
- `artifacts/api-server/` — Express 5 API server

## Architecture decisions

- **File-based routing** via Expo Router for zero-config deep linking
- **Dark mode** driven by `Appearance.setColorScheme()` so all `useColorScheme()` hooks react automatically
- **13 Indian languages** supported in Settings with AsyncStorage persistence
- **Mock data first** — all screens functional with realistic mock data; swap to real API when backend is ready
- **AppProvider wraps AuthProvider** so settings (theme, language) are available during the auth flow

## Product (current features)

### Phase 1 ✅
- Onboarding carousel (3 slides)
- Phone/email login + OTP (6-digit)
- 4-step profile setup (name, age/gender, city, interests)
- Home Feed with stories, posts, reactions, comments
- Vertical Reels (TikTok-style full-screen)
- Dating Swipe (heart tab, Tinder-style)
- Chat list + chat detail UI
- User Profile with stats, interests, post grid

### Phase 2 ✅
- Explore screen (trending posts grid, suggested users, trending hashtags)
- Communities screen (10 communities, 10 category filters, join/leave)
- Settings screen (theme, 13 languages, notifications, privacy, security, account, support)
- Creator Dashboard (analytics, views chart, top content, earnings breakdown, withdrawal)
- Create Post (6 content types: text/photo/video/reel/story/poll, hashtag suggestions)
- Coin Wallet (balance, daily reward, recharge packs ₹49–₹4999, transaction history)
- Notifications screen
- Dark/Light/System theme switching
- Multi-language selection (English + 12 Indian languages)
- Jobs discovery (search, filter, location, categories, premium seeker features)
- Post a Job (employer posting flow with coin-based plans)
- Subscriptions: 4 VIP tiers (Silver/Gold/Platinum/Diamond Elite), weekly/monthly/yearly billing, 3 Creator plans (Basic/Pro/Elite), Fan Clubs

## User preferences

- India-first, regional language support is core
- Purple (#7B2FBE) + pink/magenta (#E91E8C) brand palette
- Official logo: `assets/images/ridhi_logo.png` (purple speech bubble with pink heart)
- App icon is the Ridhi logo

## Gotchas

- Expo Router web preview wraps the app in a proxy iframe; use `Platform.OS === "web"` guards where needed (especially for top padding)
- `pnpm run dev` at workspace root is disabled by design; use the workflow or `pnpm --filter`
- Dark mode uses `Appearance.setColorScheme()` which works on web; on native, restart may be needed for full effect

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Blueprint PDF: `attached_assets/Ridhi_Mobile_App_Development_Blueprint_1778919275584.pdf`
