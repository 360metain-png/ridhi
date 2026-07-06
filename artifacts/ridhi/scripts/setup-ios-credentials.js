/**
 * Programmatically set up iOS credentials using ASC API Key mode.
 * Uses EAS CLI internal modules to generate Distribution Certificate and Provisioning Profile.
 */
const fs = require('fs');
const path = require('path');

async function main() {
  const token = process.env.EXPO_TOKEN;
  const ascKeyP8 = fs.readFileSync('/tmp/asc_api_key.p8', 'utf-8');
  const ascKeyId = 'H67VMRDDWF';
  const ascIssuerId = 'f45f8bda-18d6-4fd2-88da-cd8f3b41bf9f';
  const appleTeamId = '5U48FR7799';
  const accountId = 'a3122149-5aa2-4423-b3e3-4f8358fa4646';
  const appId = '5157a1eb-68b3-4ef9-98bd-df961096093b';
  const bundleId = 'app.replit.ridhi';

  // Use EAS CLI's internal GraphQL client
  const { getExpoWebsiteBaseUrl } = require('eas-cli/build/api');
  const { createGraphqlClient } = require('eas-cli/build/graphql/client');
  const { AppleTeamFragmentNode } = require('eas-cli/build/graphql/types/credentials/AppleTeam');
  const { AppleDistributionCertificateFragmentNode } = require('eas-cli/build/graphql/types/credentials/AppleDistributionCertificate');
  const { IosAppBuildCredentialsFragmentNode } = require('eas-cli/build/graphql/types/credentials/IosAppBuildCredentials');
  const { AppStoreConnectApiKeyFragmentNode } = require('eas-cli/build/graphql/types/credentials/AppStoreConnectApiKey');
  const { print } = require('graphql');
  const gql = require('graphql-tag').default;

  const graphqlClient = createGraphqlClient({
    accessToken: token,
    httpEndpoint: `${getExpoWebsiteBaseUrl()}/graphql`,
  });

  console.log('Step 1: Check existing credentials...');

  // Query existing iOS app credentials
  const credsQuery = gql`
    query IosAppCredentialsWithBuildCredentialsByAppIdentifierIdQuery(
      $appId: ID!
      $iosDistributionType: IosDistributionType
      $bundleIdentifier: String!
    ) {
      app {
        byId(appId: $appId) {
          id
          iosAppCredentials(
            filter: { bundleIdentifier: $bundleIdentifier }
          ) {
            id
            appleTeam {
              id
              appleTeamIdentifier
            }
            appleAppIdentifier {
              id
              bundleIdentifier
            }
            iosAppBuildCredentialsList(
              filter: { iosDistributionType: $iosDistributionType }
            ) {
              id
              iosDistributionType
              distributionCertificate {
                id
                serialNumber
                developerPortalIdentifier
                appleTeam {
                  id
                  appleTeamIdentifier
                }
              }
              provisioningProfile {
                id
                appleProvisioningProfileId
                appleTeam {
                  id
                  appleTeamIdentifier
                }
              }
            }
          }
        }
      }
    }
  `;

  const credsResult = await graphqlClient
    .query(credsQuery, {
      appId,
      iosDistributionType: 'APP_STORE',
      bundleIdentifier: bundleId,
    })
    .toPromise();

  const iosCredentials = credsResult?.data?.app?.byId?.iosAppCredentials?.[0];
  const buildCreds = iosCredentials?.iosAppBuildCredentialsList?.[0];

  if (buildCreds?.distributionCertificate && buildCreds?.provisioningProfile) {
    console.log('Credentials already exist! No setup needed.');
    console.log('Certificate ID:', buildCreds.distributionCertificate.id);
    console.log('Provisioning Profile ID:', buildCreds.provisioningProfile.id);
    return { success: true, alreadySet: true };
  }

  console.log('Step 2: Setting up Apple API authentication...');

  // Set up Apple API auth with ASC key
  const { authenticateAsync } = require('../node_modules/eas-cli/build/credentials/ios/appstore/authenticate');
  const { resolveAscApiKeyAsync, resolveAppleTeamAsync } = require('../node_modules/eas-cli/build/credentials/ios/appstore/resolveCredentials');
  const { AuthenticationMode } = require('../node_modules/eas-cli/build/credentials/ios/appstore/authenticateTypes');
  const { AppStoreApi } = require('../node_modules/eas-cli/build/credentials/ios/appstore/AppStoreApi');

  const ascApiKey = await resolveAscApiKeyAsync({
    keyP8: ascKeyP8,
    keyId: ascKeyId,
    issuerId: ascIssuerId,
  });
  const team = await resolveAppleTeamAsync({ teamId: appleTeamId });

  const authCtx = await authenticateAsync({
    mode: AuthenticationMode.API_KEY,
    ascApiKey,
    teamId: appleTeamId,
    teamType: 'COMPANY_OR_ORGANIZATION',
  });

  const appStore = new AppStoreApi(authCtx);
  console.log('Apple API authenticated via ASC key');

  // Step 3: Create Distribution Certificate
  console.log('Step 3: Creating Distribution Certificate...');
  let distCert;
  try {
    const certData = await appStore.createDistributionCertificateAsync();
    console.log('Certificate created on Apple:', certData.id);

    // Save to EAS
    const { AppleDistributionCertificateMutation } = require('../node_modules/eas-cli/build/credentials/ios/api/graphql/mutations/AppleDistributionCertificateMutation');
    distCert = await AppleDistributionCertificateMutation.createAppleDistributionCertificateAsync(
      graphqlClient,
      {
        certP12: certData.certP12,
        certPassword: certData.certPassword,
        certPrivateSigningKey: certData.certPrivateSigningKey,
        serialNumber: certData.serialNumber,
        developerPortalIdentifier: certData.id,
        validityNotBefore: new Date(certData.validityNotBefore).toISOString(),
        validityNotAfter: new Date(certData.validityNotAfter).toISOString(),
        appleTeam: {
          appleTeamIdentifier: appleTeamId,
          appleTeamName: 'Krilodigitech',
          appleTeamType: 'COMPANY_OR_ORGANIZATION',
        },
      },
      accountId
    );
    console.log('Distribution Certificate saved to EAS:', distCert.id);
  } catch (e) {
    console.error('Failed to create distribution certificate:', e.message);
    throw e;
  }

  // Step 4: Create Provisioning Profile
  console.log('Step 4: Creating Provisioning Profile...');
  try {
    const { AppleProvisioningProfileMutation } = require('../node_modules/eas-cli/build/credentials/ios/api/graphql/mutations/AppleProvisioningProfileMutation');

    // First register bundle ID with Apple if needed
    const bundleIdResult = await appStore.createBundleIdentifierAsync({
      identifier: bundleId,
      name: 'Ridhi',
      bundleId,
    });
    console.log('Bundle ID registered:', bundleIdResult);

    const profileData = await appStore.createProvisioningProfileAsync({
      bundleId,
      certId: distCert.developerPortalIdentifier || distCert.id,
      profileName: `Ridhi App Store ${new Date().toISOString().split('T')[0]}`,
      profileType: 'APP_STORE',
    });
    console.log('Provisioning profile created:', profileData.provisioningProfileId);

    const profile = await AppleProvisioningProfileMutation.createAppleProvisioningProfileAsync(
      graphqlClient,
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
    console.log('Provisioning Profile saved to EAS:', profile.id);
  } catch (e) {
    console.error('Failed to create provisioning profile:', e.message);
    throw e;
  }

  // Step 5: Link credentials to app
  console.log('Step 5: Linking credentials to app...');
  const { IosAppCredentialsMutation } = require('../node_modules/eas-cli/build/credentials/ios/api/graphql/mutations/IosAppCredentialsMutation');
  const { IosAppBuildCredentialsMutation } = require('../node_modules/eas-cli/build/credentials/ios/api/graphql/mutations/IosAppBuildCredentialsMutation');

  // Create or update app credentials
  let appCreds = iosCredentials;
  if (!appCreds) {
    appCreds = await IosAppCredentialsMutation.createIosAppCredentialsAsync(
      graphqlClient,
      {
        appId,
        appleTeamIdentifier: appleTeamId,
        bundleIdentifier: bundleId,
      }
    );
  }

  // Create build credentials linking cert + profile
  await IosAppBuildCredentialsMutation.createIosAppBuildCredentialsAsync(
    graphqlClient,
    {
      iosAppCredentialsId: appCreds.id,
      iosDistributionType: 'APP_STORE',
      distributionCertificateId: distCert.id,
      provisioningProfileId: profile.id,
    }
  );

  console.log('SUCCESS: All iOS credentials set up!');
  return { success: true };
}

main()
  .then(result => {
    process.exit(result?.success ? 0 : 1);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
