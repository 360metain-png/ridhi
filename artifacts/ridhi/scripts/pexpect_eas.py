#!/usr/bin/env python3
"""Minimal pexpect script for EAS iOS build. Run with: setsid python3 scripts/pexpect_eas.py"""
import os, sys, pexpect, time

os.chdir('/home/runner/workspace/artifacts/ridhi')

# Ensure API_KEY mode
for k in ['EXPO_APPLE_ID', 'EXPO_APPLE_PASSWORD']:
    if k in os.environ:
        del os.environ[k]

log = open('/tmp/eas_pexpect_v2.log', 'wb')

child = pexpect.spawn(
    'npx eas build --platform ios --profile production',
    cwd='/home/runner/workspace/artifacts/ridhi',
    env=os.environ,
    timeout=600,
    maxread=8192,
)
child.logfile_read = log

patterns = [
    'Select your Apple Team Type',
    'Do you want to log in to your Apple account',
    'Would you like to set up',
    'Do you want to create',
    'Would you like to use',
    'Would you like to reuse',
    'Do you want to generate',
    'Do you want to upload',
    'Do you want to let Expo handle',
    'Would you like to create new credentials',
    'Would you like to use the ASC API key',
    'Would you like to use the App Store',
    'Do you want to configure',
    'Do you want to continue',
    'Would you like to review',
    'Would you like to proceed',
    'Would you like to run',
    'Do you want to run',
    'Would you like to try again',
    'Would you like to let EAS',
    'Would you like EAS',
    'Choose an action',
    'Generate a new',
    'Upload an existing',
    'Would you like to use existing',
    'Would you like to create a new',
    'Which certificate',
    'Which provisioning profile',
    'Which build profile',
    'Press any key',
    'Press Enter',
    'press any key',
    'press enter',
    'No saved credentials found',
    'Credentials are not set up',
    '6 digit code',
    'verification code',
    'Enter the 6 digit code',
    'Build details:',
    'Waiting for build',
    'Build queued',
    'Build started',
    'Error: build command failed',
    pexpect.EOF,
    pexpect.TIMEOUT,
]

try:
    while child.isalive():
        idx = child.expect(patterns, timeout=120)
        if idx == len(patterns) - 2:  # EOF
            print('[EOF]', file=sys.stderr)
            break
        if idx == len(patterns) - 1:  # TIMEOUT
            continue
        name = patterns[idx]
        print(f'[Prompt] {name}', file=sys.stderr)

        if 'Team Type' in name:
            child.send('\x1b[B\r')  # Down + Enter = Company/Organization
        elif 'log in to your Apple account' in name:
            child.send('n\r')
        elif 'try again' in name or 'review' in name or 'No saved credentials' in name:
            child.send('n\r')
        elif 'Credentials are not set up' in name:
            print('[ERROR] Credentials not set up', file=sys.stderr)
            break
        elif name.startswith('Build details:') or name.startswith('Waiting') or name.startswith('Build queued') or name.startswith('Build started'):
            print('[OK] Build progressing...', file=sys.stderr)
        elif name.startswith('Error:'):
            print('[ERROR] Build failed', file=sys.stderr)
            break
        else:
            child.send('y\r')
except Exception as e:
    print(f'[Exception] {e}', file=sys.stderr)
finally:
    remaining = child.read()
    if remaining:
        log.write(remaining)
    log.write(f'\nEXIT={child.exitstatus}\n'.encode())
    log.close()
    print(f'[Done] Exit: {child.exitstatus}', file=sys.stderr)

sys.exit(child.exitstatus or 0)
