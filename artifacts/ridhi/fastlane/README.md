# App Store Screenshots

## iOS App Store Screenshots

Located in `fastlane/screenshots/en-US/` — these are actual app UI screenshots for the iOS App Store.

### Current Screenshots

| Order | Filename | Description | Source |
|-------|----------|-------------|--------|
| 1 | `01_home.png` | Home Feed — Stories, Live Now, VIP Banner, Nearby Posts | `IMG-20260601-WA0015.jpg` |
| 2 | `02_login.png` | Welcome/Login Screen — Phone/Email OTP | `IMG-20260601-WA0010.jpg` |
| 3 | `03_onboarding_creator.png` | Onboarding Slide 3 — "Create & Earn" | `IMG-20260601-WA0011.jpg` |
| 4 | `04_onboarding_match.png` | Onboarding Slide 2 — "Find Your Match" | `IMG-20260601-WA0008.jpg` |
| 5 | `05_onboarding_connect.png` | Onboarding Slide 1 — "Connect & Belong" | `IMG-20260601-WA0009.jpg` |

### Marketing Banners

Located in `fastlane/screenshots/marketing/` — these are 3D phone mockup banners for social media, landing pages, and press kit.

| Filename | Description |
|----------|-------------|
| `01_banner.png` | "Your Social Universe Starts Here" — Full home feed |
| `02_banner.png` | "Connect & Belong" — Onboarding |
| `03_banner.png` | "Create & Earn" — Creator onboarding |
| `04_banner.png` | "Connect & Belong" — Onboarding variant |
| `05_banner.png` | "Discover Your Perfect Match" — Dating |
| `06_banner.png` | "Welcome to Ridhi" — Login screen |
| `07_banner.png` | "Express Yourself" — Profile screen |

### Usage

**App Store Connect (Manual Upload):**
- Upload `fastlane/screenshots/en-US/` screenshots to App Store Connect
- Use for iPhone 6.7" display (iPhone 16 Pro Max, 15 Pro Max)

**Fastlane Deliver (Automated):**
```bash
# Upload screenshots to App Store
fastlane deliver --skip_binary_upload --skip_metadata --force
```

**Fastlane Snapshot (Automated Screenshot Capture):**
```bash
# Capture new screenshots from simulators
fastlane snapshot
```

### Screenshot Requirements

- **iPhone 6.7"**: 1290×2796 px
- **iPhone 6.5"**: 1284×2778 px
- **iPhone 6.1"**: 1179×2556 px
- **iPhone 5.5"**: 1242×2208 px

Current screenshots are 610×1356 px. For App Store submission, use the marketing banners (737×1600) or resize the app screenshots to the required device-specific resolutions.
