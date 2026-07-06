# GitHub Actions — EAS iOS Build & Submit

This workflow automatically builds the Ridhi iOS app via EAS and submits it to the App Store.

## Triggers

- **Push to `main` or `master`** — Auto-build and submit when `artifacts/ridhi/` changes
- **Manual (`workflow_dispatch`)** — Run on-demand from the GitHub Actions tab with optional auto-submit

## Required GitHub Secrets

Add these in **Settings > Secrets and variables > Actions > Repository secrets**:

| Secret | Value | How to get |
|--------|-------|------------|
| `EXPO_TOKEN` | Your Expo token | https://expo.dev/accounts/[account]/settings/access-tokens |
| `EXPO_ASC_KEY_ID` | `H67VMRDDWF` | From Apple Developer Portal > Users and Access > Keys |
| `EXPO_ASC_ISSUER_ID` | `f45f8bda-18d6-4fd2-88da-cd8f3b41bf9f` | Same page as above |
| `EXPO_ASC_KEY_P8` | Base64-encoded `.p8` key | See below |
| `EXPO_APPLE_TEAM_ID` | `5U48FR7799` | Apple Developer Portal > Membership |

## Encoding your ASC API Key for GitHub Secrets

The `.p8` file must be base64-encoded to store as a GitHub secret:

```bash
# On macOS/Linux:
base64 -i /tmp/asc_api_key.p8 | pbcopy   # copies to clipboard

# Or output to terminal:
base64 /tmp/asc_api_key.p8
```

Paste the entire base64 string as the value for `EXPO_ASC_KEY_P8`.

## What the workflow does

1. Checks out the repo
2. Installs Node.js 20 and EAS CLI
3. Logs into Expo using `EXPO_TOKEN`
4. Decodes the ASC API key from the secret
5. Runs `eas build --platform ios --profile production --auto-submit --non-interactive`
6. The build queue appears at https://expo.dev/accounts/krilodigitech/projects/ridhi/builds

## After the build completes

- **EAS Build** queues the build on Expo's cloud builders
- **EAS Submit** automatically uploads the `.ipa` to App Store Connect
- You'll receive an email from Apple when the build is ready for review
- Approve/release via https://appstoreconnect.apple.com
