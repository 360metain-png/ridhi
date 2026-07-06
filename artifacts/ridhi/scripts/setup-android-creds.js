#!/usr/bin/env node
/**
 * Generate Android Keystore and upload to expo.dev
 * Uses raw GraphQL to avoid module resolution issues.
 */

const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');

const TOKEN = process.env.EXPO_TOKEN;
const ACCOUNT_ID = 'a3122149-5aa2-4423-b3e3-4f8358fa4646';
const APP_ID = '5157a1eb-68b3-4ef9-98bd-df961096093b';
const KEYSTORE_PATH = '/tmp/ridhi-keystore.jks';

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

function generateKeystore() {
  const keyPassword = crypto.randomBytes(16).toString('hex');
  const keystorePassword = crypto.randomBytes(16).toString('hex');
  const keyAlias = 'ridhi-release-key';

  console.log('Generating Android Keystore...');

  // Generate keystore using keytool
  const cmd = [
    'keytool', '-genkey', '-v',
    '-keystore', KEYSTORE_PATH,
    '-alias', keyAlias,
    '-keyalg', 'RSA',
    '-keysize', '2048',
    '-validity', '10000',
    '-dname', 'CN=Krilodigitech, OU=Mobile, O=Krilodigitech Pvt Ltd, L=Mumbai, ST=Maharashtra, C=IN',
    '-storepass', keystorePassword,
    '-keypass', keyPassword,
  ].join(' ');

  execSync(cmd, { stdio: 'inherit' });

  console.log('Keystore generated successfully!');
  console.log('  Path:', KEYSTORE_PATH);
  console.log('  Alias:', keyAlias);

  return {
    keystore: fs.readFileSync(KEYSTORE_PATH, 'base64'),
    keystorePassword,
    keyPassword,
    keyAlias,
  };
}

async function main() {
  // Step 1: Generate keystore locally
  const keystoreData = generateKeystore();

  // Step 2: Upload to expo.dev
  console.log('\nUploading keystore to expo.dev...');

  // First check if there's already an AndroidAppCredentials entry
  let credsQuery = await graphql(`
    query AndroidCredentials($appId: ID!) {
      app {
        byId(id: $appId) {
          id
          androidAppCredentials {
            id
            applicationIdentifier
            keystore {
              id
            }
          }
        }
      }
    }
  `, { appId: APP_ID });

  const app = credsQuery.app.byId;
  let androidCredentialsId = app.androidAppCredentials?.[0]?.id;

  if (androidCredentialsId) {
    console.log('Found existing Android credentials:', androidCredentialsId);

    // Update keystore
    const updateResult = await graphql(`
      mutation UpdateKeystore(
        $androidAppCredentialsId: ID!
        $androidKeystoreInput: AndroidKeystoreInput!
      ) {
        androidAppCredentials {
          updateKeystore(
            id: $androidAppCredentialsId
            androidKeystoreInput: $androidKeystoreInput
          ) {
            id
          }
        }
      }
    `, {
      androidAppCredentialsId: androidCredentialsId,
      androidKeystoreInput: {
        keystore: keystoreData.keystore,
        keystorePassword: keystoreData.keystorePassword,
        keyPassword: keystoreData.keyPassword,
        keyAlias: keystoreData.keyAlias,
      },
    });

    console.log('Keystore updated:', updateResult.androidAppCredentials.updateKeystore.id);
  } else {
    console.log('No existing Android credentials. Creating new ones...');

    // Create AndroidAppCredentials first
    const createResult = await graphql(`
      mutation CreateAndroidCredentials(
        $appId: ID!
        $accountId: ID!
      ) {
        androidAppCredentials {
          createAndroidAppCredentials(
            appId: $appId
            accountId: $accountId
          ) {
            id
          }
        }
      }
    `, { appId: APP_ID, accountId: ACCOUNT_ID });

    androidCredentialsId = createResult.androidAppCredentials.createAndroidAppCredentials.id;
    console.log('Created Android credentials:', androidCredentialsId);

    // Now update keystore
    const updateResult = await graphql(`
      mutation UpdateKeystore(
        $androidAppCredentialsId: ID!
        $androidKeystoreInput: AndroidKeystoreInput!
      ) {
        androidAppCredentials {
          updateKeystore(
            id: $androidAppCredentialsId
            androidKeystoreInput: $androidKeystoreInput
          ) {
            id
          }
        }
      }
    `, {
      androidAppCredentialsId: androidCredentialsId,
      androidKeystoreInput: {
        keystore: keystoreData.keystore,
        keystorePassword: keystoreData.keystorePassword,
        keyPassword: keystoreData.keyPassword,
        keyAlias: keystoreData.keyAlias,
      },
    });

    console.log('Keystore uploaded:', updateResult.androidAppCredentials.updateKeystore.id);
  }

  // Save keystore info to a file for the user's records
  const infoFile = '/tmp/ridhi-keystore-info.txt';
  fs.writeFileSync(infoFile, `Ridhi Android Keystore Information
====================================
Generated: ${new Date().toISOString()}

IMPORTANT: BACK UP THIS FILE SECURELY!
You will need these credentials for future builds.

Keystore File: ${KEYSTORE_PATH}
Alias: ${keystoreData.keyAlias}
Keystore Password: ${keystoreData.keystorePassword}
Key Password: ${keystoreData.keyPassword}
Package: com.ridhi.app

DO NOT LOSE THESE PASSWORDS.
They cannot be recovered by Expo or Google.
====================================
`);

  console.log('\n=== Android Keystore Setup Complete ===');
  console.log('Keystore info saved to:', infoFile);
  console.log('\nIMPORTANT: Download and securely store:');
  console.log('  -', KEYSTORE_PATH, '(the keystore file)');
  console.log('  -', infoFile, '(passwords and details)');
  console.log('\nNext: Set up Google Play Service Account for auto-submit');
}

main().catch(err => {
  console.error('FATAL:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
