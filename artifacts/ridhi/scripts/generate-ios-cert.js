#!/usr/bin/env node
/**
 * Generate iOS Distribution Certificate via ASC API key and save to expo.dev.
 */

const fs = require('fs');

async function main() {
  const token = process.env.EXPO_TOKEN;
  const ascKeyP8 = fs.readFileSync('/tmp/asc_api_key.p8', 'utf-8');
  const ascKeyId = 'H67VMRDDWF';
  const ascIssuerId = 'f45f8bda-18d6-4fd2-88da-cd8f3b41bf9f';
  const appleTeamId = '5U48FR7799';
  const accountId = 'a3122149-5aa2-4423-b3e3-4f8358fa4646';
  const bundleId = 'app.replit.ridhi';
  const appId = '5157a1eb-68b3-4ef9-98bd-df961096093b';

  // Step 1: Authenticate with Apple using ASC API Key
  console.log('Step 1: Authenticating with Apple via ASC API Key...');
  const { authenticateAsync } = require('eas-cli/build/credentials/ios/appstore/authenticate');
  const { resolveAscApiKeyAsync } = require('eas-cli/build/credentials/ios/appstore/resolveCredentials');
  const { AuthenticationMode } = require('eas-cli/build/credentials/ios/appstore/authenticateTypes');
  const AppStoreApi = require('eas-cli/build/credentials/ios/appstore/AppStoreApi').default;

  const ascApiKey = await resolveAscApiKeyAsync({
    keyP8: ascKeyP8,
    keyId: ascKeyId,
    issuerId: ascIssuerId,
  });

  const authCtx = await authenticateAsync({
    mode: AuthenticationMode.API_KEY,
    ascApiKey,
    teamId: appleTeamId,
    teamType: 'COMPANY_OR_ORGANIZATION',
  });

  console.log('Authenticated! Team:', authCtx.team.id, authCtx.team.name);

  // Step 2: Create Distribution Certificate on Apple Developer Portal
  console.log('Step 2: Creating Distribution Certificate on Apple...');
  const { createDistributionCertificateAsync } = require('eas-cli/build/credentials/ios/appstore/distributionCertificate');
  const certData = await createDistributionCertificateAsync(authCtx);
  console.log('Certificate created! Serial:', certData.distCertSerialNumber);
  console.log('Cert ID:', certData.certId);

  // Step 3: Save certificate to expo.dev using direct GraphQL
  console.log('Step 3: Saving certificate to expo.dev...');
  const { createClient } = require('@urql/core');
  const { getExpoWebsiteBaseUrl } = require('eas-cli/build/api');

  const client = createClient({
    url: `${getExpoWebsiteBaseUrl()}/graphql`,
    fetchOptions: {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  });

  const { AppleDistributionCertificateMutation } = require('eas-cli/build/credentials/ios/api/graphql/mutations/AppleDistributionCertificateMutation');

  const distCert = await AppleDistributionCertificateMutation.createAppleDistributionCertificateAsync(
    client,
    {
      certP12: certData.certP12,
      certPassword: certData.certPassword,
      certPrivateSigningKey: certData.certPrivateSigningKey,
      serialNumber: certData.distCertSerialNumber,
      developerPortalIdentifier: certData.certId,
      appleTeam: {
        appleTeamIdentifier: appleTeamId,
        appleTeamName: 'Krilodigitech',
        appleTeamType: 'COMPANY_OR_ORGANIZATION',
      },
    },
    accountId
  );

  console.log('SUCCESS! Certificate saved to expo.dev:', distCert.id);

  // Step 4: Create Provisioning Profile
  console.log('Step 4: Creating Provisioning Profile...');
  const { createProvisioningProfileAsync } = require('eas-cli/build/credentials/ios/appstore/provisioningProfile');
  const { AppleProvisioningProfileMutation } = require('eas-cli/build/credentials/ios/api/graphql/mutations/AppleProvisioningProfileMutation');
  const { ApplePlatform } = require('eas-cli/build/credentials/ios/appstore/constants');

  const profileData = await createProvisioningProfileAsync(
    authCtx,
    bundleId,
    certData,
    `Ridhi App Store ${new Date().toISOString().split('T')[0]}`,
    ApplePlatform.IOS,
    undefined
  );
  console.log('Provisioning profile created! Apple ID:', profileData.provisioningProfileId);

  const profile = await AppleProvisioningProfileMutation.createAppleProvisioningProfileAsync(
    client,
    {
      appleProvisioningProfile: profileData.provisioningProfile,
      appleTeam: {
        appleTeamIdentifier: appleTeamId,
        appleTeamName: 'Krilodigitech',
        appleTeamType: 'COMPANY_OR_ORGANIZATION',
      },
    },
    accountId
  );

  console.log('SUCCESS! Provisioning profile saved to expo.dev:', profile.id);

  // Step 5: Link credentials to app
  console.log('Step 5: Linking credentials to app...');
  const { IosAppCredentialsMutation } = require('eas-cli/build/credentials/ios/api/graphql/mutations/IosAppCredentialsMutation');
  const { IosAppBuildCredentialsMutation } = require('eas-cli/build/credentials/ios/api/graphql/mutations/IosAppBuildCredentialsMutation');

  const appCreds = await IosAppCredentialsMutation.createIosAppCredentialsAsync(
    client,
    {
      appId,
      appleTeamIdentifier: appleTeamId,
      bundleIdentifier: bundleId,
    }
  );
  console.log('App credentials created:', appCreds.id);

  await IosAppBuildCredentialsMutation.createIosAppBuildCredentialsAsync(
    client,
    {
      iosAppCredentialsId: appCreds.id,
      iosDistributionType: 'APP_STORE',
      distributionCertificateId: distCert.id,
      provisioningProfileId: profile.id,
    }
  );

  console.log('\n=== ALL DONE ===');
  console.log('Distribution Certificate:', distCert.id);
  console.log('Provisioning Profile:', profile.id);
  console.log('App Credentials:', appCreds.id);
  console.log('\nYou can now run:');
  console.log('  npx eas build --platform ios --profile production --non-interactive --auto-submit');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
