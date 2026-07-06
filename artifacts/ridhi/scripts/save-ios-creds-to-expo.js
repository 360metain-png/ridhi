#!/usr/bin/env node
/**
 * Save iOS credentials (Distribution Certificate + Provisioning Profile) to expo.dev
 * Uses raw fetch() to avoid module resolution issues.
 */

const fs = require('fs');

// Configuration
const TOKEN = process.env.EXPO_TOKEN;
const ASC_KEY_P8 = fs.readFileSync('/tmp/asc_api_key.p8', 'utf-8');
const ASC_KEY_ID = 'H67VMRDDWF';
const ASC_ISSUER_ID = 'f45f8bda-18d6-4fd2-88da-cd8f3b41bf9f';
const APPLE_TEAM_ID = '5U48FR7799';
const ACCOUNT_ID = 'a3122149-5aa2-4423-b3e3-4f8358fa4646';
const BUNDLE_ID = 'app.replit.ridhi';
const APP_ID = '5157a1eb-68b3-4ef9-98bd-df961096093b';

const GRAPHQL_URL = 'https://api.expo.dev/graphql';

async function graphql(query, variables) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  const data = await res.json();
  if (data.errors) {
    throw new Error(JSON.stringify(data.errors, null, 2));
  }
  return data.data;
}

async function main() {
  console.log('Step 1: Authenticating with Apple via ASC API Key...');
  const { authenticateAsync } = require('eas-cli/build/credentials/ios/appstore/authenticate');
  const { resolveAscApiKeyAsync } = require('eas-cli/build/credentials/ios/appstore/resolveCredentials');
  const { AuthenticationMode } = require('eas-cli/build/credentials/ios/appstore/authenticateTypes');

  const ascApiKey = await resolveAscApiKeyAsync({
    keyP8: ASC_KEY_P8,
    keyId: ASC_KEY_ID,
    issuerId: ASC_ISSUER_ID,
  });

  const authCtx = await authenticateAsync({
    mode: AuthenticationMode.API_KEY,
    ascApiKey,
    teamId: APPLE_TEAM_ID,
    teamType: 'COMPANY_OR_ORGANIZATION',
  });

  console.log('Authenticated! Team:', authCtx.team.id, authCtx.team.name);

  // Step 2: List existing distribution certificates on Apple
  console.log('Step 2: Checking existing Apple Distribution Certificates...');
  const { listDistributionCertificatesAsync } = require('eas-cli/build/credentials/ios/appstore/distributionCertificate');
  const certs = await listDistributionCertificatesAsync(authCtx);
  console.log(`Found ${certs.length} certificate(s) on Apple`);

  let certData;
  if (certs.length > 0) {
    console.log('Using existing certificate:', certs[0].serialNumber);
    // We need to re-create or download the P12. For existing certs, we may need to create new
    // since Apple doesn't give us the P12 for existing certs.
    console.log('Creating NEW distribution certificate (existing one may not have P12 available)...');
  }

  // Step 3: Create Distribution Certificate
  console.log('Step 3: Creating Distribution Certificate on Apple...');
  const { createDistributionCertificateAsync } = require('eas-cli/build/credentials/ios/appstore/distributionCertificate');
  certData = await createDistributionCertificateAsync(authCtx);
  console.log('Certificate created! Serial:', certData.distCertSerialNumber);
  console.log('Cert ID:', certData.certId);

  // Step 4: Save certificate to expo.dev
  console.log('Step 4: Saving certificate to expo.dev...');
  const certResult = await graphql(`
    mutation CreateAppleDistributionCertificate(
      $appleDistributionCertificateInput: AppleDistributionCertificateInput!
      $accountId: ID!
    ) {
      appleDistributionCertificate {
        createAppleDistributionCertificate(
          appleDistributionCertificateInput: $appleDistributionCertificateInput
          accountId: $accountId
        ) {
          id
          serialNumber
          appleTeam {
            id
            appleTeamIdentifier
          }
        }
      }
    }
  `, {
    appleDistributionCertificateInput: {
      certP12: certData.certP12,
      certPassword: certData.certPassword,
      certPrivateSigningKey: certData.certPrivateSigningKey,
      serialNumber: certData.distCertSerialNumber,
      developerPortalIdentifier: certData.certId,
      appleTeam: {
        appleTeamIdentifier: APPLE_TEAM_ID,
        appleTeamName: authCtx.team.name || 'Krilodigitech',
        appleTeamType: 'COMPANY_OR_ORGANIZATION',
      },
    },
    accountId: ACCOUNT_ID,
  });

  const distCert = certResult.appleDistributionCertificate.createAppleDistributionCertificate;
  console.log('SUCCESS! Certificate saved to expo.dev:', distCert.id);

  // Step 5: Create Provisioning Profile
  console.log('Step 5: Creating Provisioning Profile...');
  const { createProvisioningProfileAsync } = require('eas-cli/build/credentials/ios/appstore/provisioningProfile');
  const { ApplePlatform } = require('eas-cli/build/credentials/ios/appstore/constants');

  const profileData = await createProvisioningProfileAsync(
    authCtx,
    BUNDLE_ID,
    certData,
    `Ridhi App Store ${new Date().toISOString().split('T')[0]}`,
    ApplePlatform.IOS,
    undefined
  );
  console.log('Provisioning profile created! Apple ID:', profileData.provisioningProfileId);

  // Step 6: Save Provisioning Profile to expo.dev
  console.log('Step 6: Saving Provisioning Profile to expo.dev...');

  // First, get or create AppleAppIdentifier
  console.log('  Getting Apple App Identifier...');
  const appIdQuery = await graphql(`
    query AppleAppIdentifierQuery($bundleIdentifier: String!, $accountId: ID!) {
      appleAppIdentifier {
        byBundleIdentifier(bundleIdentifier: $bundleIdentifier, accountId: $accountId) {
          id
          bundleIdentifier
        }
      }
    }
  `, { bundleIdentifier: BUNDLE_ID, accountId: ACCOUNT_ID });

  let appleAppIdentifierId;
  if (appIdQuery.appleAppIdentifier.byBundleIdentifier) {
    appleAppIdentifierId = appIdQuery.appleAppIdentifier.byBundleIdentifier.id;
    console.log('  Found existing App Identifier:', appleAppIdentifierId);
  } else {
    console.log('  Creating new Apple App Identifier...');
    const createAppId = await graphql(`
      mutation CreateAppleAppIdentifier($appleAppIdentifierInput: AppleAppIdentifierInput!, $accountId: ID!) {
        appleAppIdentifier {
          createAppleAppIdentifier(appleAppIdentifierInput: $appleAppIdentifierInput, accountId: $accountId) {
            id
            bundleIdentifier
          }
        }
      }
    `, {
      appleAppIdentifierInput: { bundleIdentifier: BUNDLE_ID },
      accountId: ACCOUNT_ID,
    });
    appleAppIdentifierId = createAppId.appleAppIdentifier.createAppleAppIdentifier.id;
    console.log('  Created App Identifier:', appleAppIdentifierId);
  }

  const profileResult = await graphql(`
    mutation CreateAppleProvisioningProfile(
      $appleProvisioningProfileInput: AppleProvisioningProfileInput!
      $accountId: ID!
      $appleAppIdentifierId: ID!
    ) {
      appleProvisioningProfile {
        createAppleProvisioningProfile(
          appleProvisioningProfileInput: $appleProvisioningProfileInput
          accountId: $accountId
          appleAppIdentifierId: $appleAppIdentifierId
        ) {
          id
          appleTeam {
            id
            appleTeamIdentifier
          }
        }
      }
    }
  `, {
    appleProvisioningProfileInput: {
      appleProvisioningProfile: profileData.provisioningProfile,
      appleTeam: {
        appleTeamIdentifier: APPLE_TEAM_ID,
        appleTeamName: authCtx.team.name || 'Krilodigitech',
        appleTeamType: 'COMPANY_OR_ORGANIZATION',
      },
    },
    accountId: ACCOUNT_ID,
    appleAppIdentifierId,
  });

  const profile = profileResult.appleProvisioningProfile.createAppleProvisioningProfile;
  console.log('SUCCESS! Provisioning profile saved to expo.dev:', profile.id);

  // Step 7: Create iOS App Credentials
  console.log('Step 7: Creating iOS App Credentials...');
  const appCredsResult = await graphql(`
    mutation CreateIosAppCredentials(
      $iosAppCredentialsInput: IosAppCredentialsInput!
      $appId: ID!
      $appleAppIdentifierId: ID!
    ) {
      iosAppCredentials {
        createIosAppCredentials(
          iosAppCredentialsInput: $iosAppCredentialsInput
          appId: $appId
          appleAppIdentifierId: $appleAppIdentifierId
        ) {
          id
        }
      }
    }
  `, {
    iosAppCredentialsInput: {
      appleTeamIdentifier: APPLE_TEAM_ID,
    },
    appId: APP_ID,
    appleAppIdentifierId,
  });

  const appCreds = appCredsResult.iosAppCredentials.createIosAppCredentials;
  console.log('App credentials created:', appCreds.id);

  // Step 8: Create iOS App Build Credentials (links cert + profile)
  console.log('Step 8: Creating iOS App Build Credentials...');
  const buildCredsResult = await graphql(`
    mutation CreateIosAppBuildCredentials(
      $iosAppBuildCredentialsInput: IosAppBuildCredentialsInput!
      $iosAppCredentialsId: ID!
    ) {
      iosAppBuildCredentials {
        createIosAppBuildCredentials(
          iosAppBuildCredentialsInput: $iosAppBuildCredentialsInput
          iosAppCredentialsId: $iosAppCredentialsId
        ) {
          id
        }
      }
    }
  `, {
    iosAppBuildCredentialsInput: {
      iosDistributionType: 'APP_STORE',
      distributionCertificateId: distCert.id,
      provisioningProfileId: profile.id,
    },
    iosAppCredentialsId: appCreds.id,
  });

  console.log('Build credentials created:', buildCredsResult.iosAppBuildCredentials.createIosAppBuildCredentials.id);

  console.log('\n=== ALL DONE ===');
  console.log('Distribution Certificate:', distCert.id);
  console.log('Provisioning Profile:', profile.id);
  console.log('App Credentials:', appCreds.id);
  console.log('\nYou can now run the GitHub Actions build!');
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
