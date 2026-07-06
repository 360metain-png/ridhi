#!/bin/bash
# Upload iOS credentials to expo.dev
# Run this AFTER the build succeeds or before with credentials already configured on expo.dev

echo "Upload iOS credentials to expo.dev:"
echo "  https://expo.dev/accounts/krilodigitech/projects/ridhi/credentials/ios"
echo ""
echo "Required credentials (already in GitHub secrets):"
echo "  1. Distribution Certificate (.p12)"
echo "  2. Provisioning Profile (.mobileprovision)"
echo "  3. App Credentials (bundle ID app.replit.ridhi)"
echo ""
echo "If these are not yet uploaded, the build will ask for them in interactive mode."
echo "For CI/CD, you must upload them first via the web UI above."
