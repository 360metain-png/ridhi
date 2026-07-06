#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Ridhi iOS/Android EAS Build - GitHub Setup Script
# Run this from your local machine (NOT Replit) after cloning the repo
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "========================================"
echo "  Ridhi EAS Build - GitHub Setup"
echo "========================================"
echo ""

# --- Step 1: Check prerequisites ---
echo "Step 1: Checking prerequisites..."

for cmd in git gh node npm; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: '$cmd' is not installed. Please install it first."
    exit 1
  fi
done

echo "  All tools found (git, gh, node, npm)"
echo ""

# --- Step 2: GitHub login check ---
echo "Step 2: Checking GitHub CLI authentication..."
if ! gh auth status &>/dev/null; then
  echo "  You need to login to GitHub CLI first:"
  echo "  gh auth login"
  exit 1
fi
GH_USER=$(gh api user -q .login)
echo "  Logged in as: $GH_USER"
echo ""

# --- Step 3: Create/push repo ---
echo "Step 3: Setting up GitHub repository..."
cd "$REPO_ROOT"

# Check if remote exists
if git remote get-url origin &>/dev/null 2>&1; then
  REMOTE_URL=$(git remote get-url origin)
  echo "  Existing remote: $REMOTE_URL"
else
  # Check if repo exists on GitHub
  if gh repo view "$GH_USER/ridhi" &>/dev/null 2>&1; then
    echo "  Repo exists on GitHub, adding remote..."
    git remote add origin "https://github.com/$GH_USER/ridhi.git"
  else
    echo "  Creating new GitHub repo 'ridhi'..."
    gh repo create ridhi --public --source=. --push
    echo "  Repo created and code pushed!"
    exit 0
  fi
fi

# Push to existing remote
echo "  Pushing code to origin/main..."
git push -u origin main 2>/dev/null || git push -u origin master 2>/dev/null || {
  echo "  No main/master branch. Creating and pushing current branch..."
  git branch -M main
  git push -u origin main
}
echo "  Code pushed!"
echo ""

# --- Step 4: Set GitHub Secrets ---
echo "Step 4: Setting GitHub Secrets..."

REPO="$GH_USER/ridhi"

# Function to set secret if not already set
set_secret() {
  local name="$1"
  local value="$2"
  if gh secret set "$name" -b "$value" -R "$REPO" 2>/dev/null; then
    echo "  Set: $name"
  else
    echo "  Failed to set: $name (may already exist)"
  fi
}

echo "  Setting Expo token..."
read -rp "  Enter your EXPO_TOKEN (from https://expo.dev/accounts/krilodigitech/settings/access-tokens): " EXPO_TOKEN
set_secret "EXPO_TOKEN" "$EXPO_TOKEN"

echo "  Setting ASC API Key credentials..."
set_secret "EXPO_ASC_KEY_ID" "H67VMRDDWF"
set_secret "EXPO_ASC_ISSUER_ID" "f45f8bda-18d6-4fd2-88da-cd8f3b41bf9f"
set_secret "EXPO_APPLE_TEAM_ID" "5U48FR7799"

read -rp "  Path to ASC API Key .p8 file (e.g., /tmp/asc_api_key.p8): " P8_PATH
if [ -f "$P8_PATH" ]; then
  P8_B64=$(base64 -i "$P8_PATH")
  set_secret "EXPO_ASC_KEY_P8" "$P8_B64"
else
  echo "  WARNING: .p8 file not found at $P8_PATH"
  echo "  You'll need to manually set EXPO_ASC_KEY_P8 as base64 of the .p8 file"
fi

echo "  Setting Google Play credentials (optional)..."
read -rp "  Path to Google Play service account JSON (or press Enter to skip): " GP_PATH
if [ -n "$GP_PATH" ] && [ -f "$GP_PATH" ]; then
  GP_B64=$(base64 -i "$GP_PATH")
  set_secret "GOOGLE_SERVICE_ACCOUNT_KEY_BASE64" "$GP_B64"
else
  echo "  Skipped Google Play secret (set later if needed)"
fi

echo ""
echo "  All secrets configured!"
echo ""

# --- Step 5: Trigger iOS Build ---
echo "Step 5: Triggering iOS Build..."
echo "  Opening GitHub Actions page..."
gh workflow run ios-build.yml -R "$REPO" 2>/dev/null || {
  echo "  Could not auto-trigger. Please go to:"
  echo "  https://github.com/$REPO/actions/workflows/ios-build.yml"
  echo "  and click 'Run workflow'"
}

echo ""
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo "  Repo:       https://github.com/$REPO"
echo "  Builds:     https://expo.dev/accounts/krilodigitech/projects/ridhi/builds"
echo "  Actions:    https://github.com/$REPO/actions"
echo ""
echo "  Next steps:"
echo "  1. Check build status at the Expo link above"
echo "  2. After build completes, Apple will email you"
echo "  3. Approve release at https://appstoreconnect.apple.com"
echo ""
