# GitHub Actions - EAS Build & Submit

Automated workflows to build and submit the Ridhi app to both the Apple App Store and Google Play Store via EAS (Expo Application Services).

## Workflows

| Workflow | File | Platforms |
|----------|------|-----------|
| iOS Build & Submit | `ios-build.yml` | iOS (App Store) |
| Android Build & Submit | `android-build.yml` | Android (Google Play) |

## Triggers

- **Push to `main` or `master`** - Auto-build and submit when `artifacts/ridhi/` changes
- **Manual (`workflow_dispatch`)** - Run on-demand from the GitHub Actions tab with optional auto-submit

## Required GitHub Secrets

Add these in **Settings > Secrets and variables > Actions > Repository secrets**:

### Universal (Both Platforms)

| Secret | Value | How to get |
|--------|-------|------------|
| `EXPO_TOKEN` | Your Expo access token | https://expo.dev/accounts/[account]/settings/access-tokens |

### iOS Only

| Secret | Value | How to get |
|--------|-------|------------|
| `EXPO_ASC_KEY_ID` | `H67VMRDDWF` | Apple Developer Portal > Users and Access > Keys |
| `EXPO_ASC_ISSUER_ID` | `f45f8bda-18d6-4fd2-88da-cd8f3b41bf9f` | Same page as above |
| `EXPO_ASC_KEY_P8` | Base64-encoded `.p8` key | See below |
| `EXPO_APPLE_TEAM_ID` | `5U48FR7799` | Apple Developer Portal > Membership |

### Android Only

| Secret | Value | How to get |
|--------|-------|------------|
| `GOOGLE_SERVICE_ACCOUNT_KEY_BASE64` | Base64-encoded JSON key | Google Play Console > API Access > Service Accounts |

## Setting up iOS Secrets

### 1. Encode your ASC API Key

The `.p8` file must be base64-encoded to store as a GitHub secret:

```bash
# On macOS/Linux:
base64 -i /tmp/asc_api_key.p8 | pbcopy   # copies to clipboard

# Or output to terminal:
base64 /tmp/asc_api_key.p8
```

Paste the entire base64 string as the value for `EXPO_ASC_KEY_P8`.

### 2. Verify Apple App ID

The `ascAppId` in `eas.json` must match your App Store Connect app:
- Current value: `6770531782`
- Verify at: https://appstoreconnect.apple.com/apps

## Setting up Android Secrets

### 1. Create a Google Play Service Account

1. Go to **Google Play Console** > **Setup** > **API Access**
2. Click **Create new service account** (or link an existing one)
3. Download the JSON key file
4. Base64-encode it:

```bash
base64 -i /path/to/service-account.json | pbcopy
```

Paste the base64 string as `GOOGLE_SERVICE_ACCOUNT_KEY_BASE64`.

### 2. Grant Permissions

In Google Play Console, grant these permissions to the service account:
- **Release** (all apps or specific app)
- **View app information**

### 3. Verify Android App ID

The `applicationId` in `eas.json` must match your Google Play app:
- Current value: `com.ridhi.app`
- Verify in Google Play Console > Your app

## What the Workflows Do

### iOS Workflow
1. Checks out the repo
2. Installs Node.js 20 and EAS CLI
3. Logs into Expo using `EXPO_TOKEN`
4. Decodes the ASC API key from the secret
5. Runs `eas build --platform ios --profile production --auto-submit --non-interactive`
6. Build queue appears at: https://expo.dev/accounts/krilodigitech/projects/ridhi/builds

### Android Workflow
1. Checks out the repo
2. Installs Node.js 20 and EAS CLI
3. Logs into Expo using `EXPO_TOKEN`
4. Decodes the Google Service Account key from the secret
5. Runs `eas build --platform android --profile production --auto-submit --non-interactive`
6. Build queue appears at: https://expo.dev/accounts/krilodigitech/projects/ridhi/builds

## After the Build Completes

### iOS
- **EAS Build** queues the build on Expo's cloud builders
- **EAS Submit** automatically uploads the `.ipa` to App Store Connect
- You'll receive an email from Apple when the build is ready for review
- Approve/release via https://appstoreconnect.apple.com

### Android
- **EAS Build** creates an `.aab` (Android App Bundle)
- **EAS Submit** uploads to Google Play Console
- The release appears in Google Play Console > Release > Production
- Review and rollout from there

## Running a Build Manually

1. Go to **GitHub > Actions**
2. Select either **EAS iOS Build & Submit** or **EAS Android Build & Submit**
3. Click **Run workflow**
4. Check/uncheck the auto-submit checkbox
5. Click **Run workflow**

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `EXPO_UNAUTHORIZED` | Check that `EXPO_TOKEN` is valid and belongs to `krilodigitech` account |
| `No credentials found` | The ASC API key needs to be re-encoded; check `EXPO_ASC_KEY_P8` value |
| `App Store Connect API Key invalid` | Verify `EXPO_ASC_KEY_ID`, `EXPO_ASC_ISSUER_ID`, and `EXPO_ASC_KEY_P8` match |
| `Google Play service account not authorized` | Grant Release permissions in Google Play Console API Access |
| Build fails on Expo servers | Check logs at https://expo.dev/accounts/krilodigitech/projects/ridhi/builds |
