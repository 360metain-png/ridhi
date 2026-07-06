#!/usr/bin/env python3
"""Run EAS build with pexpect, handling all interactive prompts automatically.
Uses ASC API Key mode (API_KEY) - no Apple ID login, no 2FA.
"""

import os
import pexpect
import sys
import time

os.chdir('/home/runner/workspace/artifacts/ridhi')

# Verify env vars are set
env_vars = {
    'EXPO_ASC_API_KEY_PATH': os.environ.get('EXPO_ASC_API_KEY_PATH'),
    'EXPO_ASC_KEY_ID': os.environ.get('EXPO_ASC_KEY_ID'),
    'EXPO_ASC_ISSUER_ID': os.environ.get('EXPO_ASC_ISSUER_ID'),
    'EXPO_APPLE_TEAM_ID': os.environ.get('EXPO_APPLE_TEAM_ID'),
    'EXPO_APPLE_TEAM_TYPE': os.environ.get('EXPO_APPLE_TEAM_TYPE'),
    'EXPO_TOKEN': os.environ.get('EXPO_TOKEN'),
}
for k, v in env_vars.items():
    print(f'[Env] {k}: {v if v else "NOT SET"}', file=sys.stderr)

log_path = '/tmp/eas_pexpect_build.log'
cmd = ['npx', 'eas', 'build', '--platform', 'ios', '--profile', 'production']

# Run in a pseudo-TTY so EAS sees an interactive terminal
print(f'[Start] Spawning: {" ".join(cmd)}', file=sys.stderr)
print(f'[Start] Log file: {log_path}', file=sys.stderr)

# Spawn with proper env
env = os.environ.copy()
env['FORCE_COLOR'] = '1'
# IMPORTANT: Do NOT set EXPO_APPLE_ID or EXPO_APPLE_PASSWORD
# That forces USER mode (needs 2FA). Keep only ASC env vars for API_KEY mode.
if 'EXPO_APPLE_ID' in env:
    del env['EXPO_APPLE_ID']
if 'EXPO_APPLE_PASSWORD' in env:
    del env['EXPO_APPLE_PASSWORD']

child = pexpect.spawn(
    ' '.join(cmd),
    cwd='/home/runner/workspace/artifacts/ridhi',
    env=env,
    timeout=600,
    maxread=8192,
    searchwindowsize=8192,
)

# Log all output
with open(log_path, 'wb') as logf:
    child.logfile_read = logf

    try:
        while child.isalive():
            try:
                # Wait for any prompt pattern
                index = child.expect([
                    # Team type selection (arrow key prompt)
                    r'Select your Apple Team Type',
                    # Yes/No prompts
                    r'Do you want to log in to your Apple account',
                    r'Would you like to set up',
                    r'Do you want to create',
                    r'Would you like to use',
                    r'Would you like to reuse',
                    r'Do you want to generate',
                    r'Do you want to upload',
                    r'Do you want to let Expo handle',
                    r'Would you like to create new credentials',
                    r'Would you like to use the ASC API key',
                    r'Would you like to use the App Store',
                    r'Do you want to configure',
                    r'Do you want to continue',
                    r'Would you like to review',
                    r'Would you like to proceed',
                    r'Would you like to run',
                    r'Do you want to run',
                    r'Would you like to try again',
                    r'Would you like to let EAS',
                    r'Would you like EAS',
                    # Generic choice prompts
                    r'Choose an action',
                    r'Generate a new',
                    r'Upload an existing',
                    r'Would you like to use existing',
                    r'Would you like to create a new',
                    # Selection prompts
                    r'Which certificate',
                    r'Which provisioning profile',
                    r'Which build profile',
                    # Press any key
                    r'Press any key',
                    r'Press Enter',
                    r'press any key',
                    r'press enter',
                    # Credentials not set up
                    r'Credentials are not set up',
                    r'No saved credentials found',
                    # 2FA code (shouldn't appear in API_KEY mode but handle anyway)
                    r'6 digit code',
                    r'six digit code',
                    r'verification code',
                    r'authentication code',
                    r'Please enter the 6 digit code',
                    r'Enter the 6 digit code',
                    # Success indicators
                    r'Build details:',
                    r'Waiting for build',
                    r'Build queued',
                    r'Build started',
                    # Error indicators
                    r'Error: build command failed',
                    r'Authentication with Apple Developer Portal failed',
                    r'Invalid username and password',
                    # Timeout fallback
                    pexpect.TIMEOUT,
                ], timeout=120)

                patterns = [
                    'TEAM_TYPE', 'APPLE_LOGIN', 'SETUP', 'CREATE', 'USE', 'REUSE',
                    'GENERATE', 'UPLOAD', 'LET_EXPO', 'CREATE_CREDS', 'USE_ASC',
                    'USE_APP_STORE', 'CONFIGURE', 'CONTINUE', 'REVIEW', 'PROCEED',
                    'RUN_1', 'RUN_2', 'TRY_AGAIN', 'LET_EAS', 'EAS',
                    'CHOOSE_ACTION', 'GENERATE_NEW', 'UPLOAD_EXISTING',
                    'USE_EXISTING', 'CREATE_NEW', 'CERTIFICATE', 'PROVISIONING',
                    'BUILD_PROFILE', 'PRESS_KEY', 'PRESS_ENTER', 'PRESS_KEY_2',
                    'PRESS_ENTER_2', 'CREDENTIALS_SETUP', 'NO_SAVED_CREDS',
                    '6DIGIT', 'SIX_DIGIT', 'VERIFY_CODE', 'AUTH_CODE',
                    'ENTER_6DIGIT', 'ENTER_CODE', 'BUILD_DETAILS', 'WAITING',
                    'QUEUED', 'STARTED', 'BUILD_ERROR', 'AUTH_FAIL', 'BAD_PASS',
                    'TIMEOUT',
                ]
                matched = patterns[index]
                print(f'[Prompt] Matched: {matched}', file=sys.stderr)

                if matched == 'TEAM_TYPE':
                    # Arrow-key select menu - send down arrow then Enter for Company/Organization
                    # "Company/Organization" is second option
                    child.send(b'\x1b[B')  # Down arrow
                    time.sleep(0.5)
                    child.send(b'\r')
                    print('[Response] Selected Company/Organization', file=sys.stderr)
                elif matched == 'APPLE_LOGIN':
                    child.send(b'n\r')  # Don't log in to Apple account
                    print('[Response] No to Apple login (using API key)', file=sys.stderr)
                elif matched in ['TRY_AGAIN', 'REVIEW']:
                    child.send(b'n\r')
                    print('[Response] No', file=sys.stderr)
                elif matched in ['BUILD_DETAILS', 'WAITING', 'QUEUED', 'STARTED']:
                    print('[Success] Build is progressing!', file=sys.stderr)
                    # Keep waiting
                elif matched in ['BUILD_ERROR', 'AUTH_FAIL', 'BAD_PASS']:
                    print(f'[Error] Build/auth failed: {matched}', file=sys.stderr)
                    break
                elif matched == 'TIMEOUT':
                    # No prompt matched - just print current output and continue
                    pass
                else:
                    # Default yes for most prompts
                    child.send(b'y\r')
                    print('[Response] Yes', file=sys.stderr)

            except pexpect.EOF:
                print('[EOF] Process ended', file=sys.stderr)
                break
            except pexpect.TIMEOUT:
                print('[Timeout] No prompt matched in 120s, continuing...', file=sys.stderr)
                pass

    except Exception as e:
        print(f'[Exception] {e}', file=sys.stderr)

    finally:
        # Print remaining output
        remaining = child.read()
        if remaining:
            logf.write(remaining)
            logf.flush()
        logf.write(f'\n\n[Exit code: {child.exitstatus}]\n'.encode())
        logf.flush()

child.close()
print(f'[Done] Exit code: {child.exitstatus}', file=sys.stderr)
sys.exit(child.exitstatus or 0)
