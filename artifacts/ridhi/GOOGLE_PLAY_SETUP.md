# Google Play Store Publishing Setup Guide

This guide walks you through creating the `google-service-account.json` file needed for EAS Submit to publish your Android app to Google Play.

## Step 1: Create a Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create the project linked to your Google Play Developer account
3. Navigate to **IAM & Admin** → **Service Accounts**
4. Click **Create Service Account**
5. Enter a name (e.g., `ridhi-play-upload`)
6. Click **Create and Continue**
7. For role, select **Service Account User** (or no role — we'll add Play Console permissions separately)
8. Click **Done**

## Step 2: Create and Download a JSON Key

1. On the Service Accounts page, click the three dots (⋮) next to your new service account
2. Select **Manage keys**
3. Click **Add Key** → **Create new key**
4. Choose **JSON** format
5. Click **Create**
6. A `.json` file will download to your computer — **keep this file secure**

## Step 3: Upload the Key to Replit

1. In Replit, go to the **Files** panel
2. Navigate to `artifacts/ridhi/`
3. Upload the downloaded `.json` file
4. Rename it to exactly: `google-service-account.json`

Your file structure should look like:
```
artifacts/ridhi/
  ├── app.json
  ├── eas.json          (already references google-service-account.json)
  ├── google-service-account.json   <-- your uploaded file
  └── ...
```

## Step 4: Grant Play Console Access

1. Go to [Google Play Console](https://play.google.com/console/)
2. Navigate to **Users and permissions**
3. Click **Invite new users**
4. Enter the **email address** from your service account JSON (it looks like `...@...iam.gserviceaccount.com`)
5. Set the role to **Admin** (or at minimum **Release Manager** with access to App bundles)
6. Click **Send invite**

## Step 5: Verify Your Setup

Run this command in the Replit shell to test:
```bash
cd artifacts/ridhi
npx eas submit --platform android --profile production
```

Or if you want to build and submit together:
```bash
cd artifacts/ridhi
npx eas build --platform android --profile production --auto-submit
```

## Troubleshooting

| Error | Solution |
|-------|----------|
| `File not found: google-service-account.json` | Make sure the file is in `artifacts/ridhi/` (not the root) |
| `Permission denied` in Play Console | The service account email needs to be invited in Play Console with proper permissions |
| `Invalid service account` | Verify the JSON file wasn't corrupted during upload; re-download from Google Cloud |

## Important Security Notes

- Never commit `google-service-account.json` to public GitHub repos
- Use Replit Secrets for production deployments
- If the key is ever exposed, revoke it immediately in Google Cloud Console and create a new one
