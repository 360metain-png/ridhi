# Apple App Store Publishing Setup Guide

This guide walks you through setting up the credentials needed for EAS Submit to publish your iOS app to the Apple App Store.

## Prerequisites

- You must have an **Apple Developer Program** membership ($99/year) → [enroll here](https://developer.apple.com/programs/)
- Your app must be registered in **App Store Connect**

## Step 1: Verify Your App Exists in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click **My Apps**
3. Make sure you see "Ridhi" (or your app name) listed
4. If it doesn't exist, click the **+** button → **New App** and create it:
   - Platform: iOS
   - Name: Ridhi
   - Primary Language: English
   - Bundle ID: `com.ridhi.app`
   - SKU: ridhi-001
   - User Access: Full Access

## Step 2: Generate an App Store Connect API Key

1. Go to [App Store Connect](https://appstoreconnect.apple.com/) → **Users and Access** → **Keys** tab
2. Click the **+** button to create a new key
3. Enter a name: `EAS Submit Key`
4. Select **Admin** role
5. Click **Generate**
6. **IMPORTANT:** Download the `.p8` file immediately — Apple only shows it once
7. Note the **Key ID** (looks like `ABCD123456`) and **Issuer ID** (looks like a UUID)

## Step 3: Upload Credentials to Expo

You need to configure these credentials on **expo.dev**, not just in your local files.

1. Go to [expo.dev](https://expo.dev) and log in
2. Find your **Ridhi** project
3. Go to **Project Settings** → **Credentials** → **iOS**
4. Upload your:
   - **.p8 file** (the API key you just downloaded)
   - **Key ID**
   - **Issuer ID**
   - **Team ID** (find this in your Apple Developer account under Membership)

## Step 4: Verify Your eas.json

Your `eas.json` already has these settings:
```json
"submit": {
  "production": {
    "ios": {
      "language": "en-IN",
      "ascAppId": "6770531782"
    }
  }
}
```

Make sure `6770531782` matches your actual App Store Connect App ID. To check:
1. Go to App Store Connect → My Apps → Ridhi → App Information
2. Look for "Apple ID" — that number should match your `ascAppId`

## Step 5: Build and Submit

Once credentials are configured on expo.dev, retry the EAS workflow:

**Option A: Re-run the failed workflow**
1. Go to [expo.dev](https://expo.dev)
2. Find your failed build
3. Click **Re-run Workflow**

**Option B: Run from Replit shell**
```bash
cd artifacts/ridhi
npx eas build --platform ios --profile production --auto-submit
```

## Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Authentication credentials are missing` | No API key configured on expo.dev | Upload .p8, Key ID, and Issuer ID to expo.dev |
| `Invalid ascAppId` | Wrong App Store Connect ID | Verify the Apple ID in App Store Connect matches your eas.json |
| `Two-factor authentication required` | Apple ID login used instead of API key | Use App Store Connect API Key (not Apple ID password) |
| `Provisioning profile not found` | No certificates configured | Run `npx eas credentials` and let EAS generate them |
| `App does not exist` | App not created in App Store Connect | Create the app first (Step 1) |

## Quick Checklist Before Submitting

- [ ] Apple Developer Program membership is active
- [ ] App exists in App Store Connect with Bundle ID `com.ridhi.app`
- [ ] App Store Connect API Key created and downloaded (.p8 file)
- [ ] API Key uploaded to expo.dev with Key ID and Issuer ID
- [ ] `ascAppId` in `eas.json` matches Apple ID in App Store Connect
- [ ] `bundleIdentifier` in `app.json` is `com.ridhi.app`

## Still Stuck?

Run this command to check what's missing:
```bash
cd artifacts/ridhi
npx eas credentials
```

This will show you exactly which iOS credentials are configured and what's missing.
