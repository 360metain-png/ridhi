# Setup App Store Connect API Key for EAS Auto-Submit

## What You Need

An ASC API Key lets EAS automatically submit your iOS builds to App Store Connect.

## Step 1: Generate ASC API Key in Apple Developer Portal

1. Go to: https://appstoreconnect.apple.com/access/api
2. Sign in with your Apple Developer account
3. Click **"Keys"** tab
4. Click **"+"** (Add Key)
5. Name: `EAS Submit Key`
6. Access: **App Manager** (or Admin)
7. Click **Generate**
8. Download the `.p8` file immediately (you can only download once!)

## Step 2: Collect These 3 Values

| Secret Name | Where to Find | Example |
|---|---|---|
| `EXPO_ASC_KEY_ID` | Keys tab in App Store Connect | `ABC123DEF4` (10 chars) |
| `EXPO_ASC_ISSUER_ID` | Keys tab, top of page (Issuer ID) | `12345678-1234-1234-1234-123456789012` |
| `EXPO_ASC_KEY_P8` | Downloaded .p8 file | Base64-encode the file contents |

## Step 3: Base64-Encode the .p8 File

On macOS/Linux:
```bash
base64 -w 0 /path/to/AuthKey_ABC123DEF4.p8
```

On Windows (PowerShell):
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\AuthKey_ABC123DEF4.p8"))
```

## Step 4: Add to GitHub Secrets

1. Go to: https://github.com/360metain-png/ridhi/settings/secrets/actions
2. Click **"New repository secret"**
3. Add each secret:
   - `EXPO_ASC_KEY_ID` → paste the Key ID
   - `EXPO_ASC_ISSUER_ID` → paste the Issuer ID
   - `EXPO_ASC_KEY_P8` → paste the base64-encoded .p8 content

## Step 5: Update Workflow for Auto-Submit

1. Go to: https://github.com/360metain-png/ridhi/blob/main/.github/workflows/ios-build.yml
2. Click **Edit** (pencil icon)
3. Replace with the contents from: `artifacts/screenshots/ios-build-auto-submit.yml`
4. Commit

## Step 6: Trigger Build with Auto-Submit

1. Go to: https://github.com/360metain-png/ridhi/actions/workflows/ios-build.yml
2. Click **"Run workflow"**
3. Check **"Auto-submit to App Store after build"**
4. Click **"Run workflow"**

## Important Notes

- The `.p8` file can only be downloaded once — save it securely
- The ASC API key expires after 6 months — renew before expiry
- App Manager role is sufficient for submitting builds
- The `ascAppId` in `eas.json` (6770531782) must match your App Store Connect app

## Troubleshooting

If auto-submit fails, check:
1. App ID `6770531782` exists in App Store Connect
2. The app has a **created but not submitted** first version in App Store Connect
3. The ASC key has **App Manager** or **Admin** role
4. All 3 secrets are correctly set in GitHub
