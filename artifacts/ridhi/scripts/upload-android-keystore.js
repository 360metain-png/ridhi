#!/usr/bin/env node
/**
 * Upload Android Keystore to expo.dev via raw GraphQL
 */

const fs = require('fs');

const TOKEN = process.env.EXPO_TOKEN;
const ACCOUNT_ID = 'a3122149-5aa2-4423-b3e3-4f8358fa4646';
const APP_ID = '5157a1eb-68b3-4ef9-98bd-df961096093b';

const KEYSTORE_BASE64 = fs.readFileSync('/tmp/ridhi-release.keystore', 'base64');
const KEYSTORE_PASSWORD = 'ee9dcdbc84f55be5492fca3493d68c28';
const KEY_PASSWORD = 'ee9dcdbc84f55be5492fca3493d68c28';
const KEY_ALIAS = 'ridhi-release-key';

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
  console.log('Checking existing Android credentials...');

  const credsQuery = await graphql(`
    query AndroidCredentials($appId: ID!) {
      app {
        byId(appId: $appId) {
          id
          androidAppCredentials {
            id
            applicationIdentifier
          }
        }
      }
    }
  `, { appId: APP_ID });

  const app = credsQuery.app.byId;
  let androidCredentialsId = app.androidAppCredentials?.[0]?.id;

  if (!androidCredentialsId) {
    console.log('Creating new Android App Credentials...');
    const createResult = await graphql(`
      mutation CreateAndroidCreds($appId: ID!, $accountId: ID!) {
        androidAppCredentials {
          createAndroidAppCredentials(appId: $appId, accountId: $accountId) {
            id
          }
        }
      }
    `, { appId: APP_ID, accountId: ACCOUNT_ID });
    androidCredentialsId = createResult.androidAppCredentials.createAndroidAppCredentials.id;
    console.log('Created:', androidCredentialsId);
  } else {
    console.log('Found existing credentials:', androidCredentialsId);
  }

  console.log('Uploading keystore...');
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
          keystore {
            id
          }
        }
      }
    }
  `, {
    androidAppCredentialsId: androidCredentialsId,
    androidKeystoreInput: {
      keystore: KEYSTORE_BASE64,
      keystorePassword: KEYSTORE_PASSWORD,
      keyPassword: KEY_PASSWORD,
      keyAlias: KEY_ALIAS,
    },
  });

  console.log('Keystore uploaded successfully!');
  console.log('Credentials ID:', updateResult.androidAppCredentials.updateKeystore.id);

  // Save backup info
  const backup = {
    package: 'com.ridhi.app',
    keystorePath: '/tmp/ridhi-release.keystore',
    keystorePassword: KEYSTORE_PASSWORD,
    keyPassword: KEY_PASSWORD,
    keyAlias: KEY_ALIAS,
    expoCredentialsId: androidCredentialsId,
    generated: new Date().toISOString(),
    warning: 'BACKUP /tmp/ridhi-release.keystore AND THIS FILE SECURELY. These cannot be recovered.',
  };
  fs.writeFileSync('/tmp/ridhi-android-backup.json', JSON.stringify(backup, null, 2));
  console.log('\nBackup saved to: /tmp/ridhi-android-backup.json');
}

main().catch(err => {
  console.error('FATAL:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
