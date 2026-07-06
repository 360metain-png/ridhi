#!/usr/bin/env node
/**
 * Complete iOS credential setup:
 * 1. Auth with Apple via ASC API key
 * 2. Revoke oldest cert if at limit
 * 3. Create new Distribution Certificate
 * 4. Create Provisioning Profile
 * 5. Save both to expo.dev via raw GraphQL (correct schema)
 */

const fs = require('fs');

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
  console.log('=== Step 1: Apple Authentication ===');
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
  console.log('Apple auth OK. Team:', authCtx.team.id);

  console.log('\n=== Step 2: Manage Certificates ===');
  const { listDistributionCertificatesAsync, createDistributionCertificateAsync, revokeDistributionCertificateAsync } = require('eas-cli/build/credentials/ios/appstore/distributionCertificate');

  const certs = await listDistributionCertificatesAsync(authCtx);
  console.log(`Found ${certs.length} cert(s) on Apple`);

  if (certs.length >= 2) {
    const oldest = certs.sort((a, b) => a.created - b.created)[0];
    console.log('Revoking oldest cert to make room:', oldest.id, oldest.serialNumber);
    await revokeDistributionCertificateAsync(authCtx, [oldest.id]);
    console.log('Revoked successfully');
  }

  console.log('\n=== Step 3: Create Distribution Certificate ===');
  const certData = await createDistributionCertificateAsync(authCtx);
  console.log('Created! Serial:', certData.distCertSerialNumber);
  console.log('Apple Cert ID:', certData.certId);

  // Step 3a: Create AppleTeam on expo.dev first (if needed)
  console.log('\n=== Step 3a: Get or Create Apple Team on expo.dev ===');
  let teamQuery = await graphql(`
    query GetAppleTeam($accountId: ID!, $identifier: String!) {
      appleTeam {
        byAppleTeamIdentifier(accountId: $accountId, identifier: $identifier) {
          id
          appleTeamIdentifier
        }
      }
    }
  `, { accountId: ACCOUNT_ID, identifier: APPLE_TEAM_ID });

  let appleTeamId;
  if (teamQuery?.appleTeam?.byAppleTeamIdentifier) {
    appleTeamId = teamQuery.appleTeam.byAppleTeamIdentifier.id;
    console.log('Found AppleTeam on expo.dev:', appleTeamId);
  } else {
    console.log('Creating AppleTeam on expo.dev...');
    const newTeam = await graphql(`
      mutation CreateAppleTeam($input: AppleTeamInput!, $accountId: ID!) {
        appleTeam {
          createAppleTeam(appleTeamInput: $input, accountId: $accountId) {
            id
            appleTeamIdentifier
          }
        }
      }
    `, {
      input: {
        appleTeamIdentifier: APPLE_TEAM_ID,
        appleTeamName: 'Krilodigitech',
        appleTeamType: 'COMPANY_OR_ORGANIZATION',
      },
      accountId: ACCOUNT_ID,
    });
    appleTeamId = newTeam.appleTeam.createAppleTeam.id;
    console.log('Created AppleTeam:', appleTeamId);
  }

  console.log('\n=== Step 4: Save Certificate to expo.dev ===');
  const certResult = await graphql(`
    mutation CreateDistCert(
      $input: AppleDistributionCertificateInput!
      $accountId: ID!
    ) {
      appleDistributionCertificate {
        createAppleDistributionCertificate(
          appleDistributionCertificateInput: $input
          accountId: $accountId
        ) {
          id
          serialNumber
        }
      }
    }
  `, {
    input: {
      certP12: certData.certP12,
      certPassword: certData.certPassword,
      certPrivateSigningKey: certData.certPrivateSigningKey,
      developerPortalIdentifier: certData.certId,
      appleTeamId: appleTeamId,
    },
    accountId: ACCOUNT_ID,
  });

  const distCert = certResult.appleDistributionCertificate.createAppleDistributionCertificate;
  console.log('Saved to expo.dev! ID:', distCert.id);

  console.log('\n=== Step 5: Create Provisioning Profile ===');
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
  console.log('Apple Profile ID:', profileData.provisioningProfileId);

  console.log('\n=== Step 6: Get/Create AppleAppIdentifier ===');
  let appIdQuery;
  try {
    appIdQuery = await graphql(`
      query GetAppId($bundleIdentifier: String!, $accountId: ID!) {
        appleAppIdentifier {
          byBundleIdentifier(bundleIdentifier: $bundleIdentifier, accountId: $accountId) {
            id
            bundleIdentifier
          }
        }
      }
    `, { bundleIdentifier: BUNDLE_ID, accountId: ACCOUNT_ID });
  } catch (e) {
    console.log('No existing App Identifier, will create one');
  }

  let appleAppIdentifierId;
  if (appIdQuery?.appleAppIdentifier?.byBundleIdentifier) {
    appleAppIdentifierId = appIdQuery.appleAppIdentifier.byBundleIdentifier.id;
    console.log('Found App ID:', appleAppIdentifierId);
  } else {
    const newAppId = await graphql(`
      mutation CreateAppId($input: AppleAppIdentifierInput!, $accountId: ID!) {
        appleAppIdentifier {
          createAppleAppIdentifier(appleAppIdentifierInput: $input, accountId: $accountId) {
            id
          }
        }
      }
    `, {
      input: { bundleIdentifier: BUNDLE_ID },
      accountId: ACCOUNT_ID,
    });
    appleAppIdentifierId = newAppId.appleAppIdentifier.createAppleAppIdentifier.id;
    console.log('Created App ID:', appleAppIdentifierId);
  }

  console.log('\n=== Step 7: Save Provisioning Profile to expo.dev ===');
  const profileResult = await graphql(`
    mutation CreateProfile(
      $input: AppleProvisioningProfileInput!
      $accountId: ID!
      $appleAppIdentifierId: ID!
    ) {
      appleProvisioningProfile {
        createAppleProvisioningProfile(
          appleProvisioningProfileInput: $input
          accountId: $accountId
          appleAppIdentifierId: $appleAppIdentifierId
        ) {
          id
        }
      }
    }
  `, {
    input: {
      appleProvisioningProfile: profileData.provisioningProfile,
      developerPortalIdentifier: profileData.provisioningProfileId,
    },
    accountId: ACCOUNT_ID,
    appleAppIdentifierId,
  });

  const profile = profileResult.appleProvisioningProfile.createAppleProvisioningProfile;
  console.log('Saved to expo.dev! ID:', profile.id);

  console.log('\n=== Step 8: Create iOS App Credentials ===');
  const appCredsResult = await graphql(`
    mutation CreateAppCreds(
      $input: IosAppCredentialsInput!
      $appId: ID!
      $appleAppIdentifierId: ID!
    ) {
      iosAppCredentials {
        createIosAppCredentials(
          iosAppCredentialsInput: $input
          appId: $appId
          appleAppIdentifierId: $appleAppIdentifierId
        ) {
          id
        }
      }
    }
  `, {
    input: { appleTeamId: appleTeamId },
    appId: APP_ID,
    appleAppIdentifierId,
  });

  const appCreds = appCredsResult.iosAppCredentials.createIosAppCredentials;
  console.log('App Credentials ID:', appCreds.id);

  console.log('\n=== Step 9: Link Cert + Profile to App ===');
  const buildCredsResult = await graphql(`
    mutation CreateBuildCreds(
      $input: IosAppBuildCredentialsInput!
      $iosAppCredentialsId: ID!
    ) {
      iosAppBuildCredentials {
        createIosAppBuildCredentials(
          iosAppBuildCredentialsInput: $input
          iosAppCredentialsId: $iosAppCredentialsId
        ) {
          id
        }
      }
    }
  `, {
    input: {
      iosDistributionType: 'APP_STORE',
      distributionCertificateId: distCert.id,
      provisioningProfileId: profile.id,
    },
    iosAppCredentialsId: appCreds.id,
  });

  console.log('Build Credentials ID:', buildCredsResult.iosAppBuildCredentials.createIosAppBuildCredentials.id);

  console.log('\n======================================');
  console.log('ALL CREDENTIALS SET UP SUCCESSFULLY!');
  console.log('======================================');
  console.log('Distribution Cert:', distCert.id);
  console.log('Provisioning Profile:', profile.id);
  console.log('App Credentials:', appCreds.id);
  console.log('\nNow trigger the GitHub Actions build:');
  console.log('  https://github.com/360metain-png/ridhi/actions/workflows/ios-build.yml');
}

main().catch(err => {
  console.error('FATAL:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
